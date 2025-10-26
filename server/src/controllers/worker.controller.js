import User from "../models/user.model.js";
import { Booking } from "../models/booking.model.js";
import { WorkerService } from "../models/workerService.model.js";
import { Skill } from "../models/skill.model.js";

/**
 * @route GET /api/worker/overview
 * @description Get worker overview data for dashboard
 * @access Private (Worker)
 */
export const getWorkerOverview = async (req, res) => {
    try {
        const workerId = req.user._id;

        // Get worker basic info
        const worker = await User.findById(workerId).select(
            "name workerProfile"
        );
        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        // Get earnings data (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const earningsData = await Booking.aggregate([
            {
                $match: {
                    workerId: workerId,
                    status: "COMPLETED",
                    createdAt: { $gte: sixMonthsAgo },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    totalAmount: { $sum: "$price" },
                },
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 },
            },
            {
                $limit: 6,
            },
        ]);

        // Format earnings data for chart
        const formattedEarningsData = earningsData.map((item) => ({
            month: new Date(
                item._id.year,
                item._id.month - 1
            ).toLocaleDateString("en-US", { month: "short" }),
            amount: item.totalAmount,
        }));

        // Get booking statistics
        const bookingStats = await Booking.aggregate([
            {
                $match: { workerId: workerId },
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]);

        // Calculate totals
        const totalEarnings = await Booking.aggregate([
            {
                $match: {
                    workerId: workerId,
                    status: "COMPLETED",
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$price" },
                },
            },
        ]);

        const completedJobs =
            bookingStats.find((stat) => stat._id === "COMPLETED")?.count || 0;
        const upcomingJobs =
            bookingStats.find((stat) => stat._id === "ACCEPTED")?.count || 0;

        // Get average rating from completed bookings with reviews
        const ratingStats = await Booking.aggregate([
            {
                $match: {
                    workerId: workerId,
                    status: "COMPLETED",
                    "review.rating": { $exists: true },
                },
            },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: "$review.rating" },
                    totalReviews: { $sum: 1 },
                },
            },
        ]);

        const avgRating = ratingStats.length > 0 ? ratingStats[0].avgRating : 0;

        // Get recent bookings
        const recentBookings = await Booking.find({ workerId: workerId })
            .populate("customerId", "name phone")
            .populate("workerServiceId")
            .sort({ createdAt: -1 })
            .limit(5);

        // Format recent bookings for frontend
        const formattedBookings = recentBookings.map((booking) => ({
            id: booking._id,
            customer: booking.customerId?.name || "Customer",
            service: booking.workerServiceId?.details || "Service",
            date: new Date(booking.bookingDate).toLocaleDateString("en-IN"),
            status: booking.status.toLowerCase(),
            amount: booking.price,
        }));

        res.status(200).json({
            success: true,
            data: {
                worker: {
                    name: worker.name,
                    earnings:
                        totalEarnings.length > 0 ? totalEarnings[0].total : 0,
                    completedJobs,
                    upcomingJobs,
                    rating: avgRating.toFixed(1),
                    earningsData: formattedEarningsData,
                    availabilityStatus:
                        worker.workerProfile?.availabilityStatus || "available",
                },
                bookings: formattedBookings,
            },
        });
    } catch (error) {
        console.error("Get Worker Overview Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch worker overview",
            error: error.message,
        });
    }
};

// Add a service for a worker
export const addServiceForWorker = async (req, res) => {
    try {
        const workerId = req.user._id; // Auth middleware provides this
        const { skillId, serviceId, details, pricingType, price } = req.body;

        // Validate required fields
        if (!skillId || !serviceId || !pricingType || price === undefined)
            return res.status(400).json({ error: "Missing required fields" });

        // Check if worker exists
        const worker = await User.findById(workerId);
        if (!worker || worker.role !== "WORKER")
            return res.status(404).json({ error: "Worker not found" });

        // Check if skill exists
        const skill = await Skill.findById(skillId);
        if (!skill) return res.status(404).json({ error: "Skill not found" });

        // Find the service inside the skill
        const service = skill.services.find(
            (s) => s.serviceId.toString() === serviceId
        );
        if (!service)
            return res
                .status(404)
                .json({ error: "Service not found in this skill" });

        // Create WorkerService
        const workerService = await WorkerService.create({
            workerId,
            skillId,
            serviceId,
            details: details || service.description || "",
            pricingType,
            price: Number(price),
            portfolioImages: [], // keep empty for now
            isActive: true,
        });

        res.status(201).json(workerService);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Get all services added by a worker
export const getWorkerServices = async (req, res) => {
    try {
        const workerId = req.user._id;

        // Get all worker services
        const workerServices = await WorkerService.find({ workerId }).lean();

        // For each worker service, get the skill and service name
        const servicesWithNames = await Promise.all(
            workerServices.map(async (ws) => {
                // Find the skill containing this service
                const skill = await Skill.findOne({
                    "services.serviceId": ws.serviceId,
                }).lean();

                if (skill) {
                    // Find the service inside the skill
                    const service = skill.services.find(
                        (s) =>
                            s.serviceId.toString() === ws.serviceId.toString()
                    );

                    return {
                        ...ws,
                        skillName: skill.name,
                        serviceName: service ? service.name : "Unknown Service",
                    };
                } else {
                    return {
                        ...ws,
                        skillName: "Unknown Skill",
                        serviceName: "Unknown Service",
                    };
                }
            })
        );

        res.status(200).json(servicesWithNames);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update a worker service
export const updateWorkerService = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedService = await WorkerService.findByIdAndUpdate(
            id,
            updates,
            { new: true }
        );
        if (!updatedService)
            return res.status(404).json({ error: "Service not found" });

        res.status(200).json(updatedService);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete a worker service
export const deleteWorkerService = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedService = await WorkerService.findByIdAndDelete(
            id.toString()
        );
        if (!deletedService)
            return res.status(404).json({ error: "Service not found" });

        res.status(200).json({ message: "Service deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
