import { Booking } from "../models/booking.model.js";
import { Skill } from "../models/skill.model.js";
import User from "../models/user.model.js";

export const getLandingPageStats = async (req, res) => {
    try {
        // Get total customers
        const totalCustomers = await User.countDocuments({
            role: "CUSTOMER",
            // isActive: true,
        });

        // Get total verified workers
        const totalVerifiedWorkers = await User.countDocuments({
            role: "WORKER",
            isActive: true,
            "workerProfile.verification.status": "APPROVED",
        });

        // Get all skills first
        const allSkills = await Skill.find({})
            .select("name _id")
            .sort({ name: 1 })
            .limit(12)
            .lean();

        // Get worker counts for each skill
        const skillsWithWorkerCounts = await Promise.all(
            allSkills.map(async (skill) => {
                const workerCount = await User.countDocuments({
                    role: "WORKER",
                    isActive: true,
                    "workerProfile.verification.status": "APPROVED",
                    "workerProfile.skills.skillId": skill._id,
                });

                return {
                    _id: skill._id,
                    name: skill.name,
                    workerCount: workerCount,
                };
            })
        );

        // Alternative approach using aggregation (more efficient)
        // const skillsWithWorkerCounts = await User.aggregate([
        //     {
        //         $match: {
        //             role: "WORKER",
        //             isActive: true,
        //             "workerProfile.verification.status": "APPROVED",
        //             "workerProfile.skills": { $exists: true, $ne: [] }
        //         }
        //     },
        //     {
        //         $unwind: "$workerProfile.skills"
        //     },
        //     {
        //         $group: {
        //             _id: "$workerProfile.skills.skillId",
        //             workerCount: { $sum: 1 }
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: "skills",
        //             localField: "_id",
        //             foreignField: "_id",
        //             as: "skillInfo"
        //         }
        //     },
        //     {
        //         $unwind: "$skillInfo"
        //     },
        //     {
        //         $project: {
        //             _id: "$_id",
        //             name: "$skillInfo.name",
        //             workerCount: 1
        //         }
        //     },
        //     { $limit: 12 }
        // ]);

        // Get top reviews with user information
        const topReviews = await Booking.aggregate([
            {
                $match: {
                    review: { $exists: true, $ne: null },
                    "review.rating": { $gte: 4 },
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
                    _id: 0,
                    reviewId: "$review.reviewId",
                    rating: "$review.rating",
                    comment: "$review.comment",
                    reviewedAt: "$review.reviewedAt",
                    customerName: "$customer.name",
                    customerRole: "Homeowner",
                    avatarColor: {
                        $switch: {
                            branches: [
                                {
                                    case: { $eq: ["$review.rating", 5] },
                                    then: "bg-blue-500",
                                },
                                {
                                    case: { $eq: ["$review.rating", 4] },
                                    then: "bg-green-500",
                                },
                            ],
                            default: "bg-purple-500",
                        },
                    },
                },
            },
            { $sort: { rating: -1, reviewedAt: -1 } },
            { $limit: 6 },
        ]);

        // Get total completed bookings
        const totalCompletedBookings = await Booking.countDocuments({
            status: "COMPLETED",
        });

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalCustomers,
                    totalVerifiedWorkers,
                    totalCompletedBookings,
                    totalSkills: skillsWithWorkerCounts.length,
                },
                skills: skillsWithWorkerCounts,
                reviews: topReviews,
            },
        });
    } catch (error) {
        console.error("Error fetching landing page stats:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching landing page data",
            error: error.message,
        });
    }
};

// Simple alternative without worker counts
export const getLandingPageStatsSimple = async (req, res) => {
    try {
        // Get total customers
        const totalCustomers = await User.countDocuments({
            role: "CUSTOMER",
            // isActive: true,
        });

        console.log(totalCustomers);

        // Get total verified workers
        const totalVerifiedWorkers = await User.countDocuments({
            role: "WORKER",
            isActive: true,
            "workerProfile.verification.status": "APPROVED",
        });

        // Get skills list
        const skills = await Skill.find({})
            .select("name _id")
            .sort({ name: 1 })
            .limit(12)
            .lean();

        // Get top reviews
        const reviews = await Booking.aggregate([
            {
                $match: {
                    review: { $exists: true, $ne: null },
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
                    customerName: "$customer.name",
                    rating: "$review.rating",
                    comment: "$review.comment",
                    reviewedAt: "$review.reviewedAt",
                },
            },
            { $sort: { rating: -1, reviewedAt: -1 } },
            { $limit: 3 },
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalCustomers,
                totalVerifiedWorkers,
                skills,
                reviews,
            },
        });
    } catch (error) {
        console.error("Error fetching landing page stats:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching landing page data",
        });
    }
};
