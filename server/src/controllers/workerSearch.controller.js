import { WorkerService } from "../models/workerService.model.js";
import { Skill } from "../models/skill.model.js";
import { Booking } from "../models/booking.model.js";
import mongoose from "mongoose";

/**
 * Controller to search workers based on various filters
 */
export const searchWorkers = async (req, res) => {
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
            workerPhone,
            sortBy = "relevance",
            page = 1,
            limit = 10,
        } = req.query;

        // Build filter object
        const filters = {};
        const userFilters = { role: "WORKER", isVerified: true };
        const workerServiceFilters = { isActive: true };

        // Skill and Service Filter
        if (skill || service) {
            const skillFilter = {};

            if (skill) {
                // Find skill by name
                const skillDoc = await Skill.findOne({
                    name: new RegExp(skill, "i"),
                });
                if (skillDoc) {
                    skillFilter.skillId = skillDoc._id;

                    // Service filter within the skill
                    if (service) {
                        const serviceInSkill = skillDoc.services.find((s) =>
                            s.name.toLowerCase().includes(service.toLowerCase())
                        );
                        if (serviceInSkill) {
                            skillFilter.serviceId = serviceInSkill.serviceId;
                        } else {
                            // If service not found in skill, return empty results
                            return res.status(200).json({
                                success: true,
                                data: [],
                                pagination: {
                                    page: parseInt(page),
                                    limit: parseInt(limit),
                                    total: 0,
                                    pages: 0,
                                },
                            });
                        }
                    }
                } else {
                    // If skill not found, return empty results
                    return res.status(200).json({
                        success: true,
                        data: [],
                        pagination: {
                            page: parseInt(page),
                            limit: parseInt(limit),
                            total: 0,
                            pages: 0,
                        },
                    });
                }
            }

            Object.assign(workerServiceFilters, skillFilter);
        }

        // Price Range Filter
        if (minPrice || maxPrice) {
            workerServiceFilters.price = {};
            if (minPrice)
                workerServiceFilters.price.$gte = parseFloat(minPrice);
            if (maxPrice)
                workerServiceFilters.price.$lte = parseFloat(maxPrice);
        }

        // Location Filter
        if (location) {
            const locationRegex = new RegExp(location, "i");
            userFilters.$or = [
                { "address.city": locationRegex },
                { "address.area": locationRegex },
                { "address.street": locationRegex },
                { "address.pincode": locationRegex },
            ];
        }

        // Worker Name Filter
        if (workerName) {
            userFilters.name = new RegExp(workerName, "i");
        }

        // Worker Phone Filter (rate-limited on frontend)
        if (workerPhone) {
            userFilters.phone = new RegExp(workerPhone, "i");
        }

        // Worker Verification Status Filter
        userFilters["workerProfile.verification.status"] = "APPROVED";

        // Get pagination parameters
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build aggregation pipeline
        const aggregationPipeline = [
            // Match worker services with filters
            {
                $match: workerServiceFilters,
            },
            // Lookup worker details
            {
                $lookup: {
                    from: "users",
                    localField: "workerId",
                    foreignField: "_id",
                    as: "worker",
                },
            },
            // Unwind worker array
            {
                $unwind: "$worker",
            },
            // Match worker filters
            {
                $match: userFilters,
            },
            // Lookup skill details
            {
                $lookup: {
                    from: "skills",
                    localField: "skillId",
                    foreignField: "_id",
                    as: "skill",
                },
            },
            // Unwind skill array
            {
                $unwind: "$skill",
            },
            // Lookup service details from skill services array
            {
                $addFields: {
                    serviceDetails: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: "$skill.services",
                                    as: "service",
                                    cond: {
                                        $eq: [
                                            "$$service.serviceId",
                                            "$serviceId",
                                        ],
                                    },
                                },
                            },
                            0,
                        ],
                    },
                },
            },
            // Lookup completed bookings with reviews for this worker
            {
                $lookup: {
                    from: "bookings",
                    let: { workerId: "$workerId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$workerId", "$$workerId"] },
                                status: "COMPLETED",
                                "review.rating": { $exists: true, $ne: null },
                            },
                        },
                        {
                            $project: {
                                "review.rating": 1,
                                "review.comment": 1,
                                "review.reviewedAt": 1,
                            },
                        },
                    ],
                    as: "completedBookingsWithReviews",
                },
            },
            // Calculate average rating and total ratings from completed bookings
            {
                $addFields: {
                    avgRating: {
                        $cond: {
                            if: {
                                $gt: [
                                    { $size: "$completedBookingsWithReviews" },
                                    0,
                                ],
                            },
                            then: {
                                $avg: "$completedBookingsWithReviews.review.rating",
                            },
                            else: 0,
                        },
                    },
                    totalRatings: { $size: "$completedBookingsWithReviews" },
                    // Get recent reviews for display
                    recentReviews: {
                        $slice: [
                            {
                                $filter: {
                                    input: "$completedBookingsWithReviews",
                                    as: "booking",
                                    cond: { $ne: ["$$booking.review", null] },
                                },
                            },
                            5, // Limit to 5 recent reviews
                        ],
                    },
                },
            },
            // Apply rating filter if provided
            {
                $match: {
                    $and: [
                        minRating
                            ? { avgRating: { $gte: parseFloat(minRating) } }
                            : {},
                        maxRating
                            ? { avgRating: { $lte: parseFloat(maxRating) } }
                            : {},
                    ],
                },
            },
            // Add distance calculation if coordinates are available
            {
                $addFields: {
                    distance: {
                        $cond: {
                            if: {
                                $and: [
                                    {
                                        $ne: [
                                            "$worker.address.coordinates",
                                            null,
                                        ],
                                    },
                                    {
                                        $ne: [
                                            "$worker.address.coordinates.latitude",
                                            "",
                                        ],
                                    },
                                    {
                                        $ne: [
                                            "$worker.address.coordinates.longitude",
                                            "",
                                        ],
                                    },
                                ],
                            },
                            then: {
                                // This is a simplified distance calculation
                                // For production, use proper geospatial queries
                                $multiply: [
                                    {
                                        $sqrt: {
                                            $add: [
                                                {
                                                    $pow: [
                                                        {
                                                            $subtract: [
                                                                "$worker.address.coordinates.latitude",
                                                                0,
                                                            ],
                                                        },
                                                        2,
                                                    ],
                                                },
                                                {
                                                    $pow: [
                                                        {
                                                            $subtract: [
                                                                "$worker.address.coordinates.longitude",
                                                                0,
                                                            ],
                                                        },
                                                        2,
                                                    ],
                                                },
                                            ],
                                        },
                                    },
                                    111.32, // Approximate km per degree
                                ],
                            },
                            else: null,
                        },
                    },
                },
            },
            // Project final fields
            {
                $project: {
                    _id: 1,
                    workerId: "$worker._id",
                    workerName: "$worker.name",
                    workerPhone: "$worker.phone",
                    workerEmail: "$worker.email",
                    workerAddress: "$worker.address",
                    skillName: "$skill.name",
                    serviceName: "$serviceDetails.name",
                    serviceId: "$serviceId",
                    details: 1,
                    pricingType: 1,
                    price: 1,
                    portfolioImages: 1,
                    avgRating: { $ifNull: ["$avgRating", 0] },
                    totalRatings: { $ifNull: ["$totalRatings", 0] },
                    recentReviews: 1,
                    distance: { $ifNull: ["$distance", null] },
                    availabilityStatus:
                        "$worker.workerProfile.availabilityStatus",
                    isVerified: "$worker.workerProfile.verification.status",
                    experience: "$worker.workerProfile.experience",
                    responseTime: "$worker.workerProfile.responseTime",
                },
            },
            // Sort results
            {
                $sort: getSortCriteria(sortBy),
            },
            // Pagination
            {
                $facet: {
                    metadata: [
                        { $count: "total" },
                        {
                            $addFields: {
                                page: pageNum,
                                limit: limitNum,
                                pages: {
                                    $ceil: { $divide: ["$total", limitNum] },
                                },
                            },
                        },
                    ],
                    data: [{ $skip: skip }, { $limit: limitNum }],
                },
            },
        ];

        // Execute aggregation
        const results = await WorkerService.aggregate(aggregationPipeline);

        // Format response
        const response = {
            success: true,
            data: results[0].data,
            pagination: results[0].metadata[0]
                ? {
                      page: results[0].metadata[0].page,
                      limit: results[0].metadata[0].limit,
                      total: results[0].metadata[0].total,
                      pages: results[0].metadata[0].pages,
                  }
                : {
                      page: pageNum,
                      limit: limitNum,
                      total: 0,
                      pages: 0,
                  },
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Search workers error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

/**
 * Helper function to determine sort criteria
 */
const getSortCriteria = (sortBy) => {
    switch (sortBy) {
        case "rating":
            return { avgRating: -1, totalRatings: -1 };
        case "price":
            return { price: 1 };
        case "distance":
            return { distance: 1 };
        case "relevance":
        default:
            return {
                avgRating: -1,
                totalRatings: -1,
                availabilityStatus: 1,
            };
    }
};

/**
 * Controller to get available skills and services for filters
 */
export const getSearchFilters = async (req, res) => {
    try {
        // Get all skills with their services
        const skills = await Skill.find({})
            .select("name services")
            .sort({ name: 1 });

        // Get price ranges from worker services
        const priceStats = await WorkerService.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: null,
                    minPrice: { $min: "$price" },
                    maxPrice: { $max: "$price" },
                },
            },
        ]);

        // Get rating statistics from completed bookings
        const ratingStats = await Booking.aggregate([
            {
                $match: {
                    status: "COMPLETED",
                    "review.rating": { $exists: true, $ne: null },
                },
            },
            {
                $group: {
                    _id: "$workerId",
                    avgRating: { $avg: "$review.rating" },
                },
            },
            {
                $group: {
                    _id: null,
                    minRating: { $min: "$avgRating" },
                    maxRating: { $max: "$avgRating" },
                },
            },
        ]);

        const response = {
            success: true,
            data: {
                skills,
                priceRange: priceStats[0] || { minPrice: 0, maxPrice: 10000 },
                ratingRange: ratingStats[0] || { minRating: 0, maxRating: 5 },
            },
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Get search filters error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

/**
 * Controller to get worker details for profile page with reviews
 */
export const getWorkerProfile = async (req, res) => {
    try {
        const { workerId } = req.params;

        const workerProfile = await WorkerService.aggregate([
            {
                $match: {
                    workerId: new mongoose.Types.ObjectId(workerId),
                    isActive: true,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "workerId",
                    foreignField: "_id",
                    as: "worker",
                },
            },
            {
                $unwind: "$worker",
            },
            {
                $lookup: {
                    from: "skills",
                    localField: "skillId",
                    foreignField: "_id",
                    as: "skill",
                },
            },
            {
                $unwind: "$skill",
            },
            {
                $addFields: {
                    serviceDetails: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: "$skill.services",
                                    as: "service",
                                    cond: {
                                        $eq: [
                                            "$$service.serviceId",
                                            "$serviceId",
                                        ],
                                    },
                                },
                            },
                            0,
                        ],
                    },
                },
            },
            // Get all reviews for this worker from completed bookings
            {
                $lookup: {
                    from: "bookings",
                    let: { workerId: "$workerId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$workerId", "$$workerId"] },
                                status: "COMPLETED",
                                "review.rating": { $exists: true, $ne: null },
                            },
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "customerId",
                                foreignField: "_id",
                                as: "customer",
                            },
                        },
                        {
                            $unwind: "$customer",
                        },
                        {
                            $project: {
                                "review.rating": 1,
                                "review.comment": 1,
                                "review.reviewedAt": 1,
                                "customer.name": 1,
                                "customer._id": 1,
                                bookingDate: 1,
                            },
                        },
                        {
                            $sort: { "review.reviewedAt": -1 },
                        },
                    ],
                    as: "allReviews",
                },
            },
            // Calculate rating statistics
            {
                $addFields: {
                    avgRating: {
                        $cond: {
                            if: { $gt: [{ $size: "$allReviews" }, 0] },
                            then: {
                                $avg: "$allReviews.review.rating",
                            },
                            else: 0,
                        },
                    },
                    totalRatings: { $size: "$allReviews" },
                    ratingBreakdown: {
                        $cond: {
                            if: { $gt: [{ $size: "$allReviews" }, 0] },
                            then: {
                                5: {
                                    $size: {
                                        $filter: {
                                            input: "$allReviews",
                                            as: "review",
                                            cond: {
                                                $eq: [
                                                    "$$review.review.rating",
                                                    5,
                                                ],
                                            },
                                        },
                                    },
                                },
                                4: {
                                    $size: {
                                        $filter: {
                                            input: "$allReviews",
                                            as: "review",
                                            cond: {
                                                $eq: [
                                                    "$$review.review.rating",
                                                    4,
                                                ],
                                            },
                                        },
                                    },
                                },
                                3: {
                                    $size: {
                                        $filter: {
                                            input: "$allReviews",
                                            as: "review",
                                            cond: {
                                                $eq: [
                                                    "$$review.review.rating",
                                                    3,
                                                ],
                                            },
                                        },
                                    },
                                },
                                2: {
                                    $size: {
                                        $filter: {
                                            input: "$allReviews",
                                            as: "review",
                                            cond: {
                                                $eq: [
                                                    "$$review.review.rating",
                                                    2,
                                                ],
                                            },
                                        },
                                    },
                                },
                                1: {
                                    $size: {
                                        $filter: {
                                            input: "$allReviews",
                                            as: "review",
                                            cond: {
                                                $eq: [
                                                    "$$review.review.rating",
                                                    1,
                                                ],
                                            },
                                        },
                                    },
                                },
                            },
                            else: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                        },
                    },
                },
            },
            // Group by worker to combine all services
            {
                $group: {
                    _id: "$workerId",
                    worker: { $first: "$worker" },
                    services: {
                        $push: {
                            serviceId: "$serviceId",
                            serviceName: "$serviceDetails.name",
                            skillName: "$skill.name",
                            details: "$details",
                            pricingType: "$pricingType",
                            price: "$price",
                            portfolioImages: "$portfolioImages",
                        },
                    },
                    avgRating: { $first: "$avgRating" },
                    totalRatings: { $first: "$totalRatings" },
                    ratingBreakdown: { $first: "$ratingBreakdown" },
                    allReviews: { $first: "$allReviews" },
                },
            },
            {
                $project: {
                    "worker.password": 0,
                    "worker.otp": 0,
                },
            },
        ]);

        if (!workerProfile || workerProfile.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        res.status(200).json({
            success: true,
            data: workerProfile[0],
        });
    } catch (error) {
        console.error("Get worker profile error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

/**
 * Controller to get worker reviews with pagination
 */
export const getWorkerReviews = async (req, res) => {
    try {
        const { workerId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const reviews = await Booking.aggregate([
            {
                $match: {
                    workerId: new mongoose.Types.ObjectId(workerId),
                    status: "COMPLETED",
                    "review.rating": { $exists: true, $ne: null },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "customerId",
                    foreignField: "_id",
                    as: "customer",
                },
            },
            {
                $unwind: "$customer",
            },
            {
                $project: {
                    rating: "$review.rating",
                    comment: "$review.comment",
                    reviewedAt: "$review.reviewedAt",
                    customerName: "$customer.name",
                    customerId: "$customer._id",
                    bookingDate: 1,
                },
            },
            {
                $sort: { reviewedAt: -1 },
            },
            {
                $facet: {
                    metadata: [
                        { $count: "total" },
                        {
                            $addFields: {
                                page: pageNum,
                                limit: limitNum,
                                pages: {
                                    $ceil: { $divide: ["$total", limitNum] },
                                },
                            },
                        },
                    ],
                    data: [{ $skip: skip }, { $limit: limitNum }],
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: reviews[0].data,
            pagination: reviews[0].metadata[0]
                ? {
                      page: reviews[0].metadata[0].page,
                      limit: reviews[0].metadata[0].limit,
                      total: reviews[0].metadata[0].total,
                      pages: reviews[0].metadata[0].pages,
                  }
                : {
                      page: pageNum,
                      limit: limitNum,
                      total: 0,
                      pages: 0,
                  },
        });
    } catch (error) {
        console.error("Get worker reviews error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};
