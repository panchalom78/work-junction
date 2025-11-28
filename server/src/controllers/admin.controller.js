import User from "../models/user.model.js";
import { Skill } from "../models/skill.model.js";
import { Booking } from "../models/booking.model.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { Parser } from "json2csv";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { clearAuthCookie } from "../utils/jwt.js";

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

        return successResponse(res, 200, "Dashboard stats retrieved successfully", stats);
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return errorResponse(res, 500, "Failed to fetch dashboard stats");
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

        return successResponse(res, 200, "Recent activities retrieved successfully", activities.slice(0, 10));
    } catch (error) {
        console.error("Error fetching recent activities:", error);
        return errorResponse(res, 500, "Failed to fetch recent activities");
    }
};

// Get Verification Queue
export const getVerificationQueue = async (req, res) => {
    try {
        const { page = 1, limit = 10, priority, search } = req.query;

        let filter = {
            role: "WORKER",
            "workerProfile.verification.status": "PENDING"
        };

        // Add priority filter if specified
        if (priority && priority !== "ALL") {
            filter["workerProfile.verification.priority"] = priority.toUpperCase();
        }

        // Add search filter if specified
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        const workers = await User.find(filter)
            .populate("workerProfile.verification.serviceAgentId", "name")
            .sort({ "workerProfile.verification.createdAt": -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select("name phone email workerProfile createdAt");

        const formattedWorkers = workers.map(worker => ({
            _id: worker._id,
            name: worker.name,
            phone: worker.phone,
            email: worker.email,
            service: "General Worker", // This would come from worker services
            submitted: worker.workerProfile?.verification?.createdAt || worker.createdAt,
            priority: worker.workerProfile?.verification?.priority || "MEDIUM",
            verification: {
                selfieUrl: worker.workerProfile?.verification?.selfieUrl || null,
                addharDocUrl: worker.workerProfile?.verification?.addharDocUrl || null,
                policeVerificationDocUrl: worker.workerProfile?.verification?.policeVerificationDocUrl || null,
                isSelfieVerified: worker.workerProfile?.verification?.isSelfieVerified || false,
                isAddharDocVerified: worker.workerProfile?.verification?.isAddharDocVerified || false,
                isPoliceVerificationDocVerified: worker.workerProfile?.verification?.isPoliceVerificationDocVerified || false,
                status: worker.workerProfile?.verification?.status || "PENDING"
            }
        }));

        const total = await User.countDocuments(filter);

        return successResponse(res, 200, "Verification queue retrieved successfully", {
            workers: formattedWorkers,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error("Error fetching verification queue:", error);
        return errorResponse(res, 500, "Failed to fetch verification queue");
    }
};

// Export verification queue as CSV
export const exportVerificationCSV = async (req, res) => {
    try {
        const { priority, search, status = "PENDING" } = req.query;

        const filter = {
            role: "WORKER",
            "workerProfile.verification.status": status
        };

        if (priority && priority !== "ALL") {
            filter["workerProfile.verification.priority"] = priority.toUpperCase();
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        const workers = await User.find(filter)
            .sort({ "workerProfile.verification.createdAt": -1 })
            .select("name phone email workerProfile createdAt");

        const csvRows = workers.map((worker) => {
            const verification = worker.workerProfile?.verification || {};
            return {
                "Worker ID": worker._id?.toString(),
                Name: worker.name,
                Phone: worker.phone,
                Email: worker.email,
                Service: "General Worker",
                Priority: verification.priority || "MEDIUM",
                Status: verification.status || "PENDING",
                "Submitted Date": new Date(
                    verification.createdAt || worker.createdAt
                ).toLocaleString(),
                "Selfie Verified": verification.isSelfieVerified ? "Yes" : "No",
                "Aadhar Verified": verification.isAddharDocVerified ? "Yes" : "No",
                "Police Verification": verification.isPoliceVerificationDocVerified ? "Yes" : "No",
                "Selfie URL": verification.selfieUrl || "Not Provided",
                "Aadhar URL": verification.addharDocUrl || "Not Provided",
                "Police Verification URL": verification.policeVerificationDocUrl || "Not Provided"
            };
        });

        const fields = [
            { label: "Worker ID", value: "Worker ID" },
            { label: "Name", value: "Name" },
            { label: "Phone", value: "Phone" },
            { label: "Email", value: "Email" },
            { label: "Service", value: "Service" },
            { label: "Priority", value: "Priority" },
            { label: "Status", value: "Status" },
            { label: "Submitted Date", value: "Submitted Date" },
            { label: "Selfie Verified", value: "Selfie Verified" },
            { label: "Aadhar Verified", value: "Aadhar Verified" },
            { label: "Police Verification", value: "Police Verification" },
            { label: "Selfie URL", value: "Selfie URL" },
            { label: "Aadhar URL", value: "Aadhar URL" },
            { label: "Police Verification URL", value: "Police Verification URL" }
        ];

        const parser = new Parser({ fields });
        const csv = parser.parse(csvRows);

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=worker-verifications-${Date.now()}.csv`
        );

        return res.status(200).send(csv);
    } catch (error) {
        console.error("Error exporting verification queue:", error);
        return errorResponse(res, 500, "Error exporting data to CSV");
    }
};

// Get All Users with Pagination and Filters
export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role, search, status } = req.query;

        let filter = {};

        if (role && role !== "ALL") {
            filter.role = role;
        }

        if (typeof status !== "undefined" && status !== "ALL") {
            if (status === "true") {
                filter.isActive = true;
            } else if (status === "false") {
                filter.isActive = false;
            }
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

        return successResponse(res, 200, "Users retrieved successfully", {
            users,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return errorResponse(res, 500, "Failed to fetch users");
    }
};

// Get All Bookings with Pagination and Filters
export const getAllBookings = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search, sortBy = "createdAt", sortOrder = "desc" } = req.query;

        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const limitNumber = Math.max(parseInt(limit) || 10, 1);

        let filter = {};

        if (status && status !== "ALL") {
            filter.status = status;
        }

        if (search && typeof search === "string" && search.trim()) {
            const trimmed = search.trim();

            // Find matching users by name/phone/email
            const searchRegex = new RegExp(trimmed, "i");
            const [matchingUsers, matchingServices] = await Promise.all([
                User.find({
                    $or: [
                        { name: searchRegex },
                        { phone: searchRegex },
                        { email: searchRegex },
                    ],
                }).select("_id"),
                // Find serviceIds whose service name matches search
                Skill.aggregate([
                    { $unwind: "$services" },
                    { $match: { "services.name": { $regex: trimmed, $options: "i" } } },
                    { $project: { serviceId: "$services.serviceId" } },
                ]),
            ]);

            const userIds = matchingUsers.map((u) => u._id);
            const serviceIds = matchingServices.map((s) => s.serviceId);

            filter.$or = [
                // Partial Booking ID match using $expr + $toString
                { $expr: { $regexMatch: { input: { $toString: "$_id" }, regex: trimmed, options: "i" } } },
                { customerId: { $in: userIds } },
                { workerId: { $in: userIds } },
                { serviceId: { $in: serviceIds } },
            ];
        }

        // Validate sortBy
        const allowedSortKeys = new Set(["createdAt", "bookingDate", "price", "status"]);
        const sortKey = allowedSortKeys.has(sortBy) ? sortBy : "createdAt";
        const sortDirection = String(sortOrder).toLowerCase() === "asc" ? 1 : -1;

        const bookings = await Booking.find(filter)
            .populate("customerId", "name email phone")
            .populate("workerId", "name email phone")
            .sort({ [sortKey]: sortDirection })
            .limit(limitNumber)
            .skip((pageNumber - 1) * limitNumber);

        const total = await Booking.countDocuments(filter);

        return successResponse(res, 200, "Bookings retrieved successfully", {
            bookings,
            pagination: {
                current: pageNumber,
                pages: Math.ceil(total / limitNumber),
                total,
            },
        });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return errorResponse(res, 500, "Failed to fetch bookings");
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

        return successResponse(res, 200, "Service agents retrieved successfully", {
            agents,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error("Error fetching service agents:", error);
        return errorResponse(res, 500, "Failed to fetch service agents");
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
            return errorResponse(res, 404, "User not found");
        }

        return successResponse(res, 200, "User status updated successfully", user);
    } catch (error) {
        console.error("Error updating user status:", error);
        return errorResponse(res, 500, "Failed to update user status");
    }
};

// Approve/Reject Worker Verification
export const updateWorkerVerification = async (req, res) => {
    try {
        const { workerId } = req.params;
        const { status, rejectionReason } = req.body;

        if (!["APPROVED", "REJECTED"].includes(status)) {
            return errorResponse(res, 400, "Invalid status");
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
            return errorResponse(res, 404, "Worker not found");
        }

        return successResponse(res, 200, `Worker verification ${status.toLowerCase()} successfully`, worker);
    } catch (error) {
        console.error("Error updating worker verification:", error);
        return errorResponse(res, 500, "Failed to update worker verification");
    }
};

// Get All Payments with Pagination and Filters
export const getAllPayments = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;

        let filter = {
            "payment.status": { $exists: true }
        };

        if (status && status !== "ALL") {
            filter["payment.status"] = status;
        }

        if (search) {
            const searchRegex = new RegExp(search, "i");
            const matchingUsers = await User.find({
                $or: [
                    { name: searchRegex },
                    { phone: searchRegex },
                    { email: searchRegex },
                ],
            }).select("_id");
            const userIds = matchingUsers.map((u) => u._id);

            filter.$or = [
                { "payment.paymentId": { $regex: search, $options: "i" } },
                { "payment.transactionId": { $regex: search, $options: "i" } },
                { customerId: { $in: userIds } },
                { workerId: { $in: userIds } },
            ];
        }

        const bookings = await Booking.find(filter)
            .populate("customerId", "name email phone")
            .populate("workerId", "name email phone")
            .sort({ "payment.transactionDate": -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Booking.countDocuments(filter);

        // Get payment analytics
        const paymentStats = await Booking.aggregate([
            {
                $match: { "payment.status": { $exists: true } }
            },
            {
                $group: {
                    _id: "$payment.status",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$payment.amount" }
                }
            }
        ]);

        const analytics = {
            totalRevenue: 0,
            completedPayments: 0,
            pendingPayments: 0,
            failedPayments: 0
        };

        paymentStats.forEach(stat => {
            if (stat._id === "COMPLETED") {
                analytics.completedPayments = stat.count;
                analytics.totalRevenue = stat.totalAmount;
            } else if (stat._id === "PENDING") {
                analytics.pendingPayments = stat.count;
            } else if (stat._id === "FAILED") {
                analytics.failedPayments = stat.count;
            }
        });

        return successResponse(res, 200, "Payments retrieved successfully", {
            payments: bookings,
            analytics,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error("Error fetching payments:", error);
        return errorResponse(res, 500, "Failed to fetch payments");
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

        return successResponse(res, 200, "Analytics retrieved successfully", {
            userRegistrations,
            bookingStats,
            revenueStats: revenueStats[0] || { totalRevenue: 0, averageOrderValue: 0 }
        });
    } catch (error) {
        console.error("Error fetching analytics:", error);
        return errorResponse(res, 500, "Failed to fetch analytics");
    }
};

// Get aggregated role statistics for admin dashboard
export const getUserRoleStats = async (req, res) => {
    try {
        const result = await User.aggregate([
            {
                $group: {
                    _id: "$role",
                    count: { $sum: 1 }
                }
            }
        ]);

        const stats = result.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});

        return successResponse(res, 200, "User role stats retrieved successfully", stats);
    } catch (error) {
        console.error("Error fetching user role stats:", error);
        return errorResponse(res, 500, "Failed to fetch user role stats");
    }
};

// Area-wise worker stats
export const getWorkerStats = async (req, res) => {
    try {
        const [
            totalWorkers,
            activeWorkers,
            availableWorkers,
            verifiedWorkers,
            uniqueCities,
            uniqueSkills
        ] = await Promise.all([
            User.countDocuments({ role: "WORKER" }),
            User.countDocuments({ role: "WORKER", isActive: true }),
            User.countDocuments({
                role: "WORKER",
                "workerProfile.availabilityStatus": "available"
            }),
            User.countDocuments({
                role: "WORKER",
                "workerProfile.verification.status": "APPROVED"
            }),
            User.distinct("address.city", {
                role: "WORKER",
                "address.city": { $exists: true, $ne: null, $ne: "" }
            }),
            User.aggregate([
                { $match: { role: "WORKER", "workerProfile.skills": { $exists: true, $ne: [] } } },
                { $unwind: "$workerProfile.skills" },
                { $group: { _id: "$workerProfile.skills.skillId" } }
            ])
        ]);

        const totalSkills = uniqueSkills.filter((skill) => skill?._id).length;

        const stats = {
            totalWorkers,
            activeWorkers,
            availableWorkers,
            verifiedWorkers,
            totalAreas: uniqueCities.length,
            totalSkills
        };

        return successResponse(res, 200, "Worker stats retrieved successfully", stats);
    } catch (error) {
        console.error("Error fetching worker stats:", error);
        return errorResponse(res, 500, "Failed to fetch worker stats");
    }
};

// List workers with filters for admin area-wise management
export const getWorkers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            area,
            skill,
            service,
            availability = "all",
            verification = "all",
            search
        } = req.query;

        const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
        const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100); // Increased limit to 100 for frontend filtering
        const skip = (pageNumber - 1) * limitNumber;

        const filter = { role: "WORKER" };
        const andConditions = [];

        // Availability filter
        if (availability && availability !== "all") {
            filter["workerProfile.availabilityStatus"] = availability.toLowerCase();
        }

        // Verification filter
        if (verification && verification !== "all") {
            filter["workerProfile.verification.status"] = verification.toUpperCase();
        }

        // Area filter
        if (area) {
            const areaRegex = new RegExp(area, "i");
            andConditions.push({
                $or: [
                    { "address.city": areaRegex },
                    { "address.area": areaRegex }
                ]
            });
        }

        // Search filter
        if (search) {
            const searchRegex = new RegExp(search.trim(), "i");
            andConditions.push({
                $or: [
                    { name: searchRegex },
                    { email: searchRegex },
                    { phone: searchRegex },
                    { "address.city": searchRegex },
                    { "address.area": searchRegex }
                ]
            });
        }

        // Skill filter
        if (skill) {
            let skillId = skill;
            
            // If skill is not a valid ObjectId, try to find by name
            if (!mongoose.Types.ObjectId.isValid(skill)) {
                const skillDoc = await Skill.findOne({ 
                    name: new RegExp(`^${skill}$`, "i") 
                }).select("_id");
                skillId = skillDoc?._id;
            }
            
            if (skillId) {
                filter["workerProfile.skills.skillId"] = new mongoose.Types.ObjectId(skillId);
            }
        }

        // Service filter - NEW: Add service filtering
        if (service) {
            let serviceId = service;
            
            // If service is not a valid ObjectId, try to find by name
            if (!mongoose.Types.ObjectId.isValid(service)) {
                // Look for service in any skill
                const skillWithService = await Skill.findOne({
                    "services.name": new RegExp(`^${service}$`, "i")
                });
                
                if (skillWithService) {
                    const foundService = skillWithService.services.find(
                        s => s.name.toLowerCase() === service.toLowerCase()
                    );
                    serviceId = foundService?.serviceId;
                }
            }
            
            if (serviceId) {
                // We'll filter by service later after fetching worker services
                // For now, we'll store the service filter to apply later
                filter._serviceFilter = new mongoose.Types.ObjectId(serviceId);
            }
        }

        if (andConditions.length) {
            filter.$and = andConditions;
        }

        // Remove temporary filter property for the main query
        const serviceFilter = filter._serviceFilter;
        delete filter._serviceFilter;

        const [workers, total] = await Promise.all([
            User.find(filter)
                .select("-password -otp")
                .populate("workerProfile.skills.skillId", "name description")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber),
            User.countDocuments(filter)
        ]);

        // Get worker services
        const workerIds = workers.map((w) => w._id);
        
        const { WorkerService } = await import("../models/workerService.model.js");
        let workerServices = await WorkerService.find({
            workerId: { $in: workerIds },
            isActive: true
        })
        .populate({ path: "skillId", select: "name" })
        .lean();

        // Apply service filter if provided
        if (serviceFilter) {
            workerServices = workerServices.filter(service => 
                service.serviceId && service.serviceId.equals(serviceFilter)
            );
            
            // Also filter workers to only those who have the specified service
            const workersWithService = new Set(
                workerServices.map(ws => ws.workerId.toString())
            );
            
            // Remove workers that don't have the requested service
            const filteredWorkers = workers.filter(worker => 
                workersWithService.has(worker._id.toString())
            );
            
            // Update workers and total count
            workers.splice(0, workers.length, ...filteredWorkers);
        }

        // Get service names
        const serviceIds = [...new Set(workerServices.map((ws) => ws.serviceId))];
        const servicesData = await Skill.aggregate([
            { $unwind: "$services" },
            { $match: { "services.serviceId": { $in: serviceIds } } },
            { $project: { 
                serviceId: "$services.serviceId", 
                serviceName: "$services.name",
                skillId: "$_id"
            } },
        ]);

        const serviceNameMap = {};
        servicesData.forEach((s) => {
            serviceNameMap[s.serviceId.toString()] = {
                name: s.serviceName,
                skillId: s.skillId
            };
        });

        // Group services by worker
        const servicesByWorker = {};
        workerServices.forEach((s) => {
            const wid = s.workerId.toString();
            if (!servicesByWorker[wid]) servicesByWorker[wid] = [];
            
            const serviceInfo = serviceNameMap[s.serviceId.toString()];
            servicesByWorker[wid].push({
                _id: s._id,
                serviceId: s.serviceId,
                skillId: s.skillId?._id || serviceInfo?.skillId,
                name: s.skillId?.name || "Unknown Service",
                serviceName: serviceInfo?.name || "Unknown Service",
                details: s.details,
                pricingType: s.pricingType,
                price: s.price,
                estimatedDuration: s.estimatedDuration,
            });
        });

        // Format final worker data
        const formattedWorkers = workers.map((workerDoc) => {
            const worker = workerDoc.toObject();
            const skills = worker.workerProfile?.skills || [];
            const widStr = worker._id.toString();

            worker.workerProfile = worker.workerProfile || {};
            
            // Format skills
            worker.workerProfile.skills = skills.map((skillItem) => {
                if (skillItem?.skillId && typeof skillItem.skillId === "object") {
                    return {
                        _id: skillItem.skillId._id,
                        name: skillItem.skillId.name,
                        description: skillItem.skillId.description
                    };
                }
                return skillItem;
            });
            
            // Add services
            worker.workerProfile.services = servicesByWorker[widStr] || [];

            return worker;
        });

        return successResponse(res, 200, "Workers retrieved successfully", {
            workers: formattedWorkers,
            pagination: {
                current: pageNumber,
                pages: Math.ceil(total / limitNumber),
                total
            }
        });
    } catch (error) {
        console.error("Error fetching workers:", error);
        return errorResponse(res, 500, "Failed to fetch workers");
    }
};

// Booking statistics for admin dashboard
export const getBookingStats = async (req, res) => {
    try {
        const [totalCount, pendingCount, completedCount, revenueAgg] = await Promise.all([
            Booking.countDocuments({}),
            Booking.countDocuments({ status: "PENDING" }),
            Booking.countDocuments({ status: "COMPLETED" }),
            Booking.aggregate([
                { $match: { "payment.status": "COMPLETED" } },
                { $group: { _id: null, total: { $sum: "$payment.amount" } } },
            ]),
        ]);

        const stats = {
            total: totalCount,
            pending: pendingCount,
            completed: completedCount,
            revenue: (revenueAgg[0]?.total) || 0,
        };

        return successResponse(res, 200, "Booking stats retrieved successfully", stats);
    } catch (error) {
        console.error("Error fetching booking stats:", error);
        return errorResponse(res, 500, "Failed to fetch booking stats");
    }
};

// Activate/Deactivate worker account
export const updateWorkerStatus = async (req, res) => {
    try {
        const { workerId } = req.params;
        const { action } = req.body;

        if (!["activate", "deactivate"].includes(action)) {
            return errorResponse(res, 400, "Invalid action provided");
        }

        const worker = await User.findOneAndUpdate(
            { _id: workerId, role: "WORKER" },
            { $set: { isActive: action === "activate" } },
            { new: true }
        ).select("-password -otp");

        if (!worker) {
            return errorResponse(res, 404, "Worker not found");
        }

        return successResponse(res, 200, "Worker status updated successfully", worker);
    } catch (error) {
        console.error("Error updating worker status:", error);
        return errorResponse(res, 500, "Failed to update worker status");
    }
};
// controllers/adminManage.controller.js

// Get single service agent details
export const getServiceAgentById = async (req, res) => {
    try {
        const { agentId } = req.params;

        const agent = await User.findOne({
            _id: agentId,
            role: 'SERVICE_AGENT'
        }).select('-password -otp');

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Service agent not found'
            });
        }

        // Get additional service agent data
        const serviceAgentData = await ServiceAgent.findOne({ userId: agentId });

        res.json({
            success: true,
            data: {
                ...agent.toObject(),
                serviceAgentData: serviceAgentData || null
            }
        });
    } catch (error) {
        console.error('Error fetching service agent:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching service agent details'
        });
    }
};

// Update service agent
export const updateServiceAgent = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { agentId } = req.params;
        const updateData = req.body;
        const adminId = req.user._id;

        // Find the agent
        const agent = await User.findOne({
            _id: agentId,
            role: 'SERVICE_AGENT'
        }).session(session);

        if (!agent) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Service agent not found'
            });
        }

        // Fields that can be updated
        const allowedUserFields = [
            'name', 'phone', 'email', 'isActive', 'address',
            'serviceAgentProfile.assignedArea', 'serviceAgentProfile.isSuspended'
        ];

        // Filter update data to only allowed fields
        const filteredUpdateData = {};
        Object.keys(updateData).forEach(key => {
            if (allowedUserFields.includes(key) || key.startsWith('address.')) {
                filteredUpdateData[key] = updateData[key];
            }
        });

        // Update user data
        const updatedUser = await User.findByIdAndUpdate(
            agentId,
            { $set: filteredUpdateData },
            { new: true, session, runValidators: true }
        ).select('-password -otp');

        // Update ServiceAgent collection if needed
        if (updateData.areasAssigned || updateData.status || updateData.serviceRadius) {
            const serviceAgentUpdate = {};

            if (updateData.areasAssigned) {
                serviceAgentUpdate.areasAssigned = updateData.areasAssigned;
            }

            if (updateData.status) {
                serviceAgentUpdate.status = updateData.status;
                serviceAgentUpdate.reviewedByAdmin = adminId;
                serviceAgentUpdate.reviewedAt = new Date();
            }

            if (updateData.serviceRadius) {
                serviceAgentUpdate.serviceRadius = updateData.serviceRadius;
            }

            if (updateData.contactEmail || updateData.contactPhone) {
                serviceAgentUpdate.contactEmail = updateData.contactEmail || agent.email;
                serviceAgentUpdate.contactPhone = updateData.contactPhone || agent.phone;
            }

            await ServiceAgent.findOneAndUpdate(
                { userId: agentId },
                { $set: serviceAgentUpdate },
                { upsert: true, session, new: true }
            );
        }

        // Handle suspension
        if (updateData.serviceAgentProfile?.isSuspended !== undefined) {
            if (updateData.serviceAgentProfile.isSuspended) {
                await ServiceAgent.findOneAndUpdate(
                    { userId: agentId },
                    {
                        $set: {
                            isSuspended: true,
                            suspendedUntil: updateData.serviceAgentProfile.suspendedUntil || null,
                            suspensionReason: updateData.serviceAgentProfile.suspensionReason || 'Admin action'
                        }
                    },
                    { upsert: true, session }
                );
            } else {
                await ServiceAgent.findOneAndUpdate(
                    { userId: agentId },
                    {
                        $set: {
                            isSuspended: false,
                            suspendedUntil: null,
                            suspensionReason: null
                        }
                    },
                    { upsert: true, session }
                );
            }
        }

        await session.commitTransaction();

        // Fetch updated data
        const updatedAgent = await User.findById(agentId).select('-password -otp');
        const updatedServiceAgent = await ServiceAgent.findOne({ userId: agentId });

        res.json({
            success: true,
            message: 'Service agent updated successfully',
            data: {
                user: updatedAgent,
                serviceAgent: updatedServiceAgent
            }
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Error updating service agent:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => err.message)
            });
        }

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email or phone already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error updating service agent'
        });
    } finally {
        session.endSession();
    }
};

// Delete service agent
export const deleteServiceAgent = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { agentId } = req.params;

        // Check if agent exists
        const agent = await User.findOne({
            _id: agentId,
            role: 'SERVICE_AGENT'
        }).session(session);

        if (!agent) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Service agent not found'
            });
        }

        // Delete from User collection (soft delete by setting isActive to false)
        await User.findByIdAndUpdate(
            agentId,
            { $set: { isActive: false } },
            { session }
        );

        // Delete from ServiceAgent collection
        await ServiceAgent.findOneAndUpdate(
            { userId: agentId },
            { $set: { status: 'SUSPENDED', isSuspended: true } },
            { session }
        );

        await session.commitTransaction();

        res.json({
            success: true,
            message: 'Service agent deleted successfully'
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Error deleting service agent:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting service agent'
        });
    } finally {
        session.endSession();
    }
};


// Get all skills with their services
export const getAllSkillsWithServices = async (req, res) => {
    try {
        const skills = await Skill.find({})
            .select('name services')
            .sort({ name: 1 });

        // Transform data to get all unique services
        const allServices = [];
        const skillsData = skills.map(skill => {
            // Add services from this skill to allServices array
            if (skill.services && skill.services.length > 0) {
                skill.services.forEach(service => {
                    if (!allServices.find(s => s.name === service.name)) {
                        allServices.push({
                            _id: service.serviceId,
                            name: service.name
                        });
                    }
                });
            }

            return {
                _id: skill._id,
                name: skill.name,
                services: skill.services || []
            };
        });

        res.status(200).json({
            success: true,
            data: {
                skills: skillsData,
                services: allServices.sort((a, b) => a.name.localeCompare(b.name))
            }
        });
    } catch (error) {
        console.error('Error fetching skills and services:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch skills and services',
            error: error.message
        });
    }
};

// Get only skills
export const getAllSkills = async (req, res) => {
    try {
        const skills = await Skill.find({})
            .select('name')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            data: skills
        });
    } catch (error) {
        console.error('Error fetching skills:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch skills',
            error: error.message
        });
    }
};

// Get services by skill
export const getServicesBySkill = async (req, res) => {
    try {
        const { skillId } = req.params;
        
        const skill = await Skill.findById(skillId).select('services');
        
        if (!skill) {
            return res.status(404).json({
                success: false,
                message: 'Skill not found'
            });
        }

        res.status(200).json({
            success: true,
            data: skill.services || []
        });
    } catch (error) {
        console.error('Error fetching services by skill:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch services',
            error: error.message
        });
    }
};

export const updateAdminProfile = async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        const userId = req.user._id;

        const updateFields = {};

        if (name !== undefined) {
            updateFields.name = typeof name === "string" ? name.trim() : "";
        }

        if (phone !== undefined) {
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(phone)) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid 10-digit phone number"
                });
            }
            updateFields.phone = phone;
        }

        if (address !== undefined && typeof address === "object" && address !== null) {
            const addressFields = {};
            if (address.houseNo !== undefined) {
                addressFields.houseNo = typeof address.houseNo === "string" ? address.houseNo.trim() : "";
            }
            if (address.street !== undefined) {
                addressFields.street = typeof address.street === "string" ? address.street.trim() : "";
            }
            if (address.area !== undefined) {
                addressFields.area = typeof address.area === "string" ? address.area.trim() : "";
            }
            if (address.city !== undefined) {
                addressFields.city = typeof address.city === "string" ? address.city.trim() : "";
            }
            if (address.state !== undefined) {
                addressFields.state = typeof address.state === "string" ? address.state.trim() : "";
            }
            if (address.pincode !== undefined) {
                addressFields.pincode = typeof address.pincode === "string" ? address.pincode.trim() : "";
            }
            updateFields.address = addressFields;
        }

        const updated = await User.findByIdAndUpdate(
            userId,
            { $set: updateFields },
            { new: true }
        );

        if (!updated) {
            return errorResponse(res, 404, "User not found");
        }

        return successResponse(res, 200, "Profile updated successfully", {
            name: updated.name,
            phone: updated.phone,
            address: updated.address
        });
    } catch (error) {
        console.error("Admin profile update error:", error);
        return errorResponse(res, 500, "Failed to update profile");
    }
};

export const changeAdminPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return errorResponse(res, 404, "User not found");
        }

        const isPasswordValid = await verifyPassword(user.password, currentPassword);
        if (!isPasswordValid) {
            return errorResponse(res, 401, "Current password is incorrect");
        }

        const hashedPassword = await hashPassword(newPassword);
        user.password = hashedPassword;
        await user.save();

        clearAuthCookie(res);

        return successResponse(res, 200, "Password changed successfully. Please login again.");
    } catch (error) {
        console.error("Admin change password error:", error);
        return errorResponse(res, 500, "Server error during password change");
    }
};
