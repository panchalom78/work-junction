import { WorkerService } from "../models/workerService.model.js";
import { Skill } from "../models/skill.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

const calculateWorkerRating = (bookings) => {
    const completedBookingsWithReviews = bookings.filter(
        (booking) => booking.status === "COMPLETED" && booking.review
    );

    if (completedBookingsWithReviews.length === 0)
        return { avgRating: 0, totalRatings: 0 };

    const totalRating = completedBookingsWithReviews.reduce(
        (sum, booking) => sum + booking.review.rating,
        0
    );

    return {
        avgRating: totalRating / completedBookingsWithReviews.length,
        totalRatings: completedBookingsWithReviews.length,
    };
};
/**
 * Helper function to parse and validate numeric filters
 */

/**
 * @route GET /api/workers/filters
 * @description Get available filters for search
 * @access Public
 */
export const getSearchFilters = async (req, res) => {
    try {
        // Get all skills with their services
        const skills = await Skill.find({}).select("name services");

        // Get price range from worker services
        const priceStats = await WorkerService.aggregate([
            {
                $group: {
                    _id: null,
                    minPrice: { $min: "$price" },
                    maxPrice: { $max: "$price" },
                },
            },
        ]);

        const priceRange =
            priceStats.length > 0
                ? {
                      minPrice: priceStats[0].minPrice || 0,
                      maxPrice: priceStats[0].maxPrice || 10000,
                  }
                : { minPrice: 0, maxPrice: 10000 };

        res.status(200).json({
            success: true,
            filters: {
                skills,
                priceRange,
                ratingRange: {
                    minRating: 0,
                    maxRating: 5,
                },
            },
        });
    } catch (error) {
        console.error("Get Filters Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve search filters",
            error: error.message,
        });
    }
};

/**
 * @route GET /api/workers/search
 * @description Search for workers based on various filters and sorting options.
 * @access Public
 */
export const getWorkerSearchResults = async (req, res) => {
    try {
        const {
            skill,
            service,
            minPrice,
            maxPrice,
            minRating,
            maxRating,
            location,
            workerName,
            sortBy = "relevance",
            page = 1,
            limit = 10,
        } = req.query;

        const limitInt = parseInt(limit);
        const skip = (parseInt(page) - 1) * limitInt;

        // --- 1. WorkerService Filtering (Skill, Service, Price) ---
        let targetServiceId = null;
        if (skill && service) {
            const skillDoc = await Skill.findOne({ name: skill });
            if (skillDoc) {
                const serviceObj = skillDoc.services.find(
                    (s) => s.name === service
                );
                if (serviceObj) {
                    targetServiceId = serviceObj.serviceId;
                }
            }
        }

        const workerServiceMatch = {};
        if (targetServiceId) {
            workerServiceMatch.serviceId = targetServiceId;
        } else if (skill) {
            const skillDoc = await Skill.findOne({ name: skill });
            if (skillDoc) {
                workerServiceMatch.skillId = skillDoc._id;
            }
        }

        const parsedMinPrice = parseNumberFilter(minPrice, 0, 100000);
        const parsedMaxPrice = parseNumberFilter(maxPrice, 0, 100000);
        if (parsedMinPrice !== undefined || parsedMaxPrice !== undefined) {
            workerServiceMatch.price = {};
            if (parsedMinPrice !== undefined) {
                workerServiceMatch.price.$gte = parsedMinPrice;
            }
            if (parsedMaxPrice !== undefined) {
                workerServiceMatch.price.$lte = parsedMaxPrice;
            }
        }

        // --- 2. User/Worker Filtering ---
        const userMatch = {
            role: "WORKER",
            "workerProfile.verification.status": "APPROVED",
        };

        if (workerName) {
            userMatch.name = { $regex: workerName, $options: "i" };
        }

        if (location) {
            const locationRegex = new RegExp(location, "i");
            userMatch.$or = [
                { "address.city": locationRegex },
                { "address.area": locationRegex },
                { "address.street": locationRegex },
            ];
        }

        // --- 3. Rating Filter Setup ---
        const parsedMinRating = parseNumberFilter(minRating, 0, 5);
        const parsedMaxRating = parseNumberFilter(maxRating, 0, 5);

        // --- 3. Aggregation Pipeline ---
        const pipeline = [];

        // Stage 1: Filter Users
        pipeline.push({ $match: userMatch });

        // Stage 2: Join with WorkerServices
        pipeline.push({
            $lookup: {
                from: "worker_services",
                localField: "_id",
                foreignField: "workerId",
                as: "workerServices",
                pipeline: [{ $match: workerServiceMatch }],
            },
        });

        // Stage 3: Ensure matching services exist
        pipeline.push({
            $match: {
                "workerServices.0": { $exists: true },
            },
        });

        // Stage 4: Join with bookings for rating calculation
        pipeline.push({
            $lookup: {
                from: "bookings",
                localField: "_id",
                foreignField: "workerId",
                as: "bookings",
            },
        });

        // Stage 5: Join with skills for skill names
        pipeline.push({
            $lookup: {
                from: "skills",
                localField: "workerServices.skillId",
                foreignField: "_id",
                as: "skillDetails",
            },
        });

        // Stage 6: Add calculated fields
        pipeline.push({
            $addFields: {
                minServicePrice: { $min: "$workerServices.price" },
                maxServicePrice: { $max: "$workerServices.price" },
                primaryService: { $arrayElemAt: ["$workerServices", 0] },
                primarySkill: { $arrayElemAt: ["$skillDetails", 0] },
                // Calculate ratings
                ratingInfo: {
                    $let: {
                        vars: {
                            completedBookings: {
                                $filter: {
                                    input: "$bookings",
                                    as: "booking",
                                    cond: {
                                        $and: [
                                            {
                                                $eq: [
                                                    "$$booking.status",
                                                    "COMPLETED",
                                                ],
                                            },
                                            { $ne: ["$$booking.review", null] },
                                        ],
                                    },
                                },
                            },
                        },
                        in: {
                            avgRating: {
                                $cond: {
                                    if: {
                                        $gt: [
                                            { $size: "$$completedBookings" },
                                            0,
                                        ],
                                    },
                                    then: {
                                        $avg: {
                                            $map: {
                                                input: "$$completedBookings",
                                                as: "booking",
                                                in: "$$booking.review.rating",
                                            },
                                        },
                                    },
                                    else: 0,
                                },
                            },
                            totalRatings: { $size: "$$completedBookings" },
                        },
                    },
                },
                // Add total jobs done calculation
                totalJobsDone: {
                    $size: {
                        $filter: {
                            input: "$bookings",
                            as: "booking",
                            cond: {
                                $eq: ["$$booking.status", "COMPLETED"],
                            },
                        },
                    },
                },
            },
        });

        // Stage 7: Apply Rating Filter
        const ratingMatch = {};
        if (parsedMinRating !== undefined || parsedMaxRating !== undefined) {
            ratingMatch.$and = [];

            if (parsedMinRating !== undefined) {
                ratingMatch.$and.push({
                    "ratingInfo.avgRating": { $gte: parsedMinRating },
                });
            }

            if (parsedMaxRating !== undefined) {
                ratingMatch.$and.push({
                    "ratingInfo.avgRating": { $lte: parsedMaxRating },
                });
            }

            // Handle cases where workers have no ratings (avgRating = 0)
            if (parsedMinRating !== undefined && parsedMinRating > 0) {
                // If minRating > 0, we need to ensure they have at least some ratings
                ratingMatch.$and.push({
                    "ratingInfo.totalRatings": { $gt: 0 },
                });
            }
        }

        // Only push rating match if we have rating filters
        if (Object.keys(ratingMatch).length > 0) {
            pipeline.push({ $match: ratingMatch });
        }

        // Stage 8: Add fields for frontend compatibility
        pipeline.push({
            $addFields: {
                workerId: "$_id",
                workerName: "$name",
                workerPhone: "$phone",
                workerAddress: "$address",
                serviceName: "$primaryService.details",
                skillName: "$primarySkill.name",
                price: "$minServicePrice",
                pricingType: "$primaryService.pricingType",
                isVerified: {
                    $eq: ["$workerProfile.verification.status", "APPROVED"],
                },
                availabilityStatus: "$workerProfile.availabilityStatus",
                avgRating: "$ratingInfo.avgRating",
                totalRatings: "$ratingInfo.totalRatings",
                totalJobsDone: 1, // Include totalJobsDone in the final output
                experience: "Available",
            },
        });

        // Stage 9: Sorting
        let sortCriteria = {};
        switch (sortBy) {
            case "rating":
                sortCriteria = {
                    "ratingInfo.avgRating": -1,
                    "ratingInfo.totalRatings": -1,
                };
                break;
            case "price":
                sortCriteria = { minServicePrice: 1 };
                break;
            case "distance":
                // For now, using createdAt. You'll need to implement actual distance calculation
                sortCriteria = { createdAt: -1 };
                break;
            case "relevance":
            default:
                sortCriteria = {
                    "ratingInfo.avgRating": -1,
                    "ratingInfo.totalRatings": -1,
                    createdAt: -1,
                };
                break;
        }
        pipeline.push({ $sort: sortCriteria });

        // Stage 10: Total count (before pagination)
        const countPipeline = [...pipeline];
        countPipeline.push({ $count: "total" });
        const totalResult = await User.aggregate(countPipeline);
        const totalWorkers = totalResult.length > 0 ? totalResult[0].total : 0;

        // Stage 11 & 12: Pagination
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limitInt });

        // Stage 13: Project final fields
        pipeline.push({
            $project: {
                _id: 1,
                workerId: 1,
                workerName: 1,
                workerPhone: 1,
                workerAddress: 1,
                serviceName: 1,
                skillName: 1,
                price: 1,
                pricingType: 1,
                isVerified: 1,
                availabilityStatus: 1,
                avgRating: 1,
                totalRatings: 1,
                totalJobsDone: 1, // Include in final projection
                experience: 1,
                minServicePrice: 1,
                maxServicePrice: 1,
                workerServices: 1,
                createdAt: 1,
                ratingInfo: 1,
            },
        });

        const workers = await User.aggregate(pipeline);

        res.status(200).json({
            success: true,
            total: totalWorkers,
            page: parseInt(page),
            limit: limitInt,
            results: workers,
        });
    } catch (error) {
        console.error("Worker Search Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve worker search results.",
            error: error.message,
        });
    }
};

// Helper function to parse number filters
function parseNumberFilter(value, min, max) {
    if (!value) return undefined;

    const parsed = parseFloat(value);
    if (isNaN(parsed)) return undefined;

    // Clamp the value between min and max
    return Math.max(min, Math.min(max, parsed));
}
/**
 * @route GET /api/workers/profile/:workerId
 * @description Get complete worker profile with portfolio, services, and stats
 * @access Public
 */
export const getWorkerProfile = async (req, res) => {
    try {
        const { workerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid worker ID",
            });
        }

        const worker = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(workerId),
                    role: "WORKER",
                },
            },
            {
                $lookup: {
                    from: "worker_services",
                    localField: "_id",
                    foreignField: "workerId",
                    as: "services",
                },
            },
            {
                $lookup: {
                    from: "bookings",
                    localField: "_id",
                    foreignField: "workerId",
                    as: "bookings",
                },
            },
            {
                $lookup: {
                    from: "skills",
                    localField: "services.skillId",
                    foreignField: "_id",
                    as: "skills",
                },
            },
            {
                $addFields: {
                    // Calculate ratings and stats
                    ratingStats: {
                        avgRating: {
                            $ifNull: [
                                {
                                    $avg: {
                                        $map: {
                                            input: {
                                                $filter: {
                                                    input: "$bookings",
                                                    as: "booking",
                                                    cond: {
                                                        $and: [
                                                            {
                                                                $eq: [
                                                                    "$$booking.status",
                                                                    "COMPLETED",
                                                                ],
                                                            },
                                                            {
                                                                $ne: [
                                                                    "$$booking.review",
                                                                    null,
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                            as: "booking",
                                            in: "$$booking.review.rating",
                                        },
                                    },
                                },
                                0,
                            ],
                        },
                        totalRatings: {
                            $size: {
                                $filter: {
                                    input: "$bookings",
                                    as: "booking",
                                    cond: {
                                        $and: [
                                            {
                                                $eq: [
                                                    "$$booking.status",
                                                    "COMPLETED",
                                                ],
                                            },
                                            { $ne: ["$$booking.review", null] },
                                        ],
                                    },
                                },
                            },
                        },
                        ratingDistribution: {
                            $map: {
                                input: [5, 4, 3, 2, 1],
                                as: "star",
                                in: {
                                    stars: "$$star",
                                    count: {
                                        $size: {
                                            $filter: {
                                                input: "$bookings",
                                                as: "booking",
                                                cond: {
                                                    $and: [
                                                        {
                                                            $eq: [
                                                                "$$booking.status",
                                                                "COMPLETED",
                                                            ],
                                                        },
                                                        {
                                                            $ne: [
                                                                "$$booking.review",
                                                                null,
                                                            ],
                                                        },
                                                        {
                                                            $eq: [
                                                                "$$booking.review.rating",
                                                                "$$star",
                                                            ],
                                                        },
                                                    ],
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    totalCompletedJobs: {
                        $size: {
                            $filter: {
                                input: "$bookings",
                                as: "booking",
                                cond: {
                                    $eq: ["$$booking.status", "COMPLETED"],
                                },
                            },
                        },
                    },
                    totalEarnings: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: "$bookings",
                                        as: "booking",
                                        cond: {
                                            $eq: [
                                                "$$booking.status",
                                                "COMPLETED",
                                            ],
                                        },
                                    },
                                },
                                as: "booking",
                                in: "$$booking.price",
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    password: 0,
                    otp: 0,
                    "workerProfile.bankDetails": 0,
                    bookings: 0, // Remove full bookings array to reduce payload
                },
            },
        ]);

        if (!worker || worker.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        res.status(200).json({
            success: true,
            data: worker[0],
        });
    } catch (error) {
        console.error("Get Worker Profile Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve worker profile",
            error: error.message,
        });
    }
};
