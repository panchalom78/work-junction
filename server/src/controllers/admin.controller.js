import User from "../models/user.model.js";
import { Booking } from "../models/booking.model.js";
import { successResponse, errorResponse } from "../utils/response.js";


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

        return successResponse(res, 200, "Bookings retrieved successfully", {
            bookings,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
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
            filter.$or = [
                { _id: { $regex: search, $options: "i" } },
                { "payment.paymentId": { $regex: search, $options: "i" } }
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
