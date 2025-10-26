import User from "../models/user.model.js";
import { Booking } from "../models/booking.model.js";


// Admin Dashboard Stats
export const getDashboardStats = async (req, res) => {
    try {
        const [
            totalUsers,
            pendingVerifications,
            activeBookings,
            totalRevenue
        ] = await Promise.all([
            // Total Users
            User.countDocuments(),

            // Pending Verifications
            User.countDocuments({
                role: "WORKER",
                "workerProfile.verification.status": "PENDING"
            }),

            // Active Bookings
            Booking.countDocuments({
                status: { $in: ["PENDING", "ACCEPTED"] }
            }),

            // Total Revenue
            Booking.aggregate([
                {
                    $match: {
                        status: "COMPLETED",
                        "payment.status": "COMPLETED"
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$payment.amount" }
                    }
                }
            ])
        ]);

        const stats = {
            totalUsers: totalUsers || 0,
            pendingVerifications: pendingVerifications || 0,
            activeBookings: activeBookings || 0,
            totalRevenue: totalRevenue[0]?.total || 0
        };

        res.json(createResponse(true, "Dashboard stats retrieved successfully", stats));
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json(createResponse(false, "Failed to fetch dashboard stats"));
    }
};

// Get Recent Activities
export const getRecentActivities = async (req, res) => {
    try {
        const activities = [];

        // Recent worker verifications
        const recentVerifications = await User.find({
            role: "WORKER",
            "workerProfile.verification.status": { $in: ["PENDING", "APPROVED", "REJECTED"] }
        })
            .sort({ updatedAt: -1 })
            .limit(5)
            .select("name workerProfile.verification updatedAt");

        recentVerifications.forEach(user => {
            activities.push({
                user: user.name,
                action: `Worker verification ${user.workerProfile.verification.status.toLowerCase()}`,
                time: user.updatedAt,
                type: "verification"
            });
        });

        // Recent bookings
        const recentBookings = await Booking.find()
            .populate("customerId", "name")
            .sort({ createdAt: -1 })
            .limit(5);

        recentBookings.forEach(booking => {
            activities.push({
                user: booking.customerId.name,
                action: `New booking created`,
                time: booking.createdAt,
                type: "booking"
            });
        });

        // Recent payments
        const recentPayments = await Booking.find({
            "payment.status": "COMPLETED"
        })
            .populate("customerId", "name")
            .sort({ "payment.transactionDate": -1 })
            .limit(5);

        recentPayments.forEach(booking => {
            activities.push({
                user: booking.customerId.name,
                action: "Payment completed",
                time: booking.payment.transactionDate,
                type: "payment"
            });
        });

        // Sort all activities by time
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));

        res.json(createResponse(true, "Recent activities retrieved successfully", activities.slice(0, 10)));
    } catch (error) {
        console.error("Error fetching recent activities:", error);
        res.status(500).json(createResponse(false, "Failed to fetch recent activities"));
    }
};

// Get Verification Queue
export const getVerificationQueue = async (req, res) => {
    try {
        const { page = 1, limit = 10, priority } = req.query;

        let filter = {
            role: "WORKER",
            "workerProfile.verification.status": "PENDING"
        };

        // Add priority filter if specified
        if (priority) {
            filter["workerProfile.verification.priority"] = priority.toUpperCase();
        }

        const workers = await User.find(filter)
            .populate("workerProfile.verification.serviceAgentId", "name")
            .sort({ "workerProfile.verification.createdAt": -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select("name phone workerProfile.verification createdAt");

        const formattedWorkers = workers.map(worker => ({
            _id: worker._id,
            name: worker.name,
            phone: worker.phone,
            service: "General Worker", // This would come from worker services
            submitted: worker.createdAt,
            priority: worker.workerProfile.verification.priority || "MEDIUM"
        }));

        const total = await User.countDocuments(filter);

        res.json(createResponse(true, "Verification queue retrieved successfully", {
            workers: formattedWorkers,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        }));
    } catch (error) {
        console.error("Error fetching verification queue:", error);
        res.status(500).json(createResponse(false, "Failed to fetch verification queue"));
    }
};

// Get All Users with Pagination and Filters
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role, search } = req.query;

        let filter = {};

        if (role && role !== "ALL") {
            filter.role = role;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } }
            ];
        }

        const users = await User.find(filter)
            .select("-password -otp")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await User.countDocuments(filter);

        res.json(createResponse(true, "Users retrieved successfully", {
            users,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        }));
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json(createResponse(false, "Failed to fetch users"));
    }
};

// Get All Bookings with Pagination and Filters
export const getAllBookings = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;

        let filter = {};

        if (status && status !== "ALL") {
            filter.status = status;
        }

        if (search) {
            // This would require populating customer and worker names
            filter.$or = [
                { _id: { $regex: search, $options: "i" } }
            ];
        }

        const bookings = await Booking.find(filter)
            .populate("customerId", "name email phone")
            .populate("workerId", "name email phone")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Booking.countDocuments(filter);

        res.json(createResponse(true, "Bookings retrieved successfully", {
            bookings,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        }));
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json(createResponse(false, "Failed to fetch bookings"));
    }
};

// Get Service Agents
export const getServiceAgents = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const agents = await User.find({ role: "SERVICE_AGENT" })
            .select("-password -otp")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await User.countDocuments({ role: "SERVICE_AGENT" });

        res.json(createResponse(true, "Service agents retrieved successfully", {
            agents,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        }));
    } catch (error) {
        console.error("Error fetching service agents:", error);
        res.status(500).json(createResponse(false, "Failed to fetch service agents"));
    }
};

// Update User Status
export const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            { isActive },
            { new: true }
        ).select("-password -otp");

        if (!user) {
            return res.status(404).json(createResponse(false, "User not found"));
        }

        res.json(createResponse(true, "User status updated successfully", user));
    } catch (error) {
        console.error("Error updating user status:", error);
        res.status(500).json(createResponse(false, "Failed to update user status"));
    }
};

// Approve/Reject Worker Verification
export const updateWorkerVerification = async (req, res) => {
    try {
        const { workerId } = req.params;
        const { status, rejectionReason } = req.body;

        if (!["APPROVED", "REJECTED"].includes(status)) {
            return res.status(400).json(createResponse(false, "Invalid status"));
        }

        const updateData = {
            "workerProfile.verification.status": status,
            "workerProfile.verification.verifiedAt": new Date()
        };

        if (status === "REJECTED" && rejectionReason) {
            updateData["workerProfile.verification.rejectionReason"] = rejectionReason;
        }

        const worker = await User.findByIdAndUpdate(
            workerId,
            updateData,
            { new: true }
        ).select("-password -otp");

        if (!worker) {
            return res.status(404).json(createResponse(false, "Worker not found"));
        }

        res.json(createResponse(true, `Worker verification ${status.toLowerCase()} successfully`, worker));
    } catch (error) {
        console.error("Error updating worker verification:", error);
        res.status(500).json(createResponse(false, "Failed to update worker verification"));
    }
};

// Get Analytics Data
export const getAnalytics = async (req, res) => {
    try {
        const { period = "monthly" } = req.query;

        let dateFilter = {};
        const now = new Date();

        if (period === "weekly") {
            dateFilter = {
                createdAt: {
                    $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                }
            };
        } else if (period === "monthly") {
            dateFilter = {
                createdAt: {
                    $gte: new Date(now.getFullYear(), now.getMonth(), 1)
                }
            };
        }

        const [
            userRegistrations,
            bookingStats,
            revenueStats
        ] = await Promise.all([
            // User registrations by role
            User.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: "$role",
                        count: { $sum: 1 }
                    }
                }
            ]),

            // Booking statistics
            Booking.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                }
            ]),

            // Revenue statistics
            Booking.aggregate([
                {
                    $match: {
                        ...dateFilter,
                        status: "COMPLETED",
                        "payment.status": "COMPLETED"
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$payment.amount" },
                        averageOrderValue: { $avg: "$payment.amount" }
                    }
                }
            ])
        ]);

        res.json(createResponse(true, "Analytics retrieved successfully", {
            userRegistrations,
            bookingStats,
            revenueStats: revenueStats[0] || { totalRevenue: 0, averageOrderValue: 0 }
        }));
    } catch (error) {
        console.error("Error fetching analytics:", error);
        res.status(500).json(createResponse(false, "Failed to fetch analytics"));
    }
};
