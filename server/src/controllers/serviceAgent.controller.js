import mongoose from "mongoose";
import User from "../models//user.model.js";
import ServiceAgent from "../models/serviceAgent.model.js"
import {WorkerService} from "../models/workerService.model.js";

import { successResponse, errorResponse } from "../utils/response.js";
// Setup or update service agent deta
// Get weekly progress stats for the service agent
export const getAgentStats = async (req, res) => {
  const userId = req.user._id;
  try {
    const agent = await ServiceAgent.findOne({ userId }).select("completedVerifications");
    if (!agent) {
      return res.status(404).json({ success: false, message: "Service agent not found." });
    }
    const weeklyTarget = 30;
    const completedVerifications = agent.completedVerifications || 0;
    const stats = {
      verificationsCompleted: {
        completed: completedVerifications,
        target: weeklyTarget,
        progress: Math.min((completedVerifications / weeklyTarget) * 100, 100).toFixed(0),
      },
    };
    return res.status(200).json({ success: true, data: stats });
  } catch (err) {
    console.error("Error fetching agent stats:", err);
    return res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};
// Helper function to get the start and eils
export const setupServiceAgent = async (req, res) => {
  const { houseNo, address, area, city, state, pincode, location } = req.body;
  const userId = req.user._id; // From auth middleware

  // Validate required fields
  if (!address || !city || !state || !pincode || !location?.coordinates) {
    return res.status(400).json({
      success: false,
      message: "All required fields (address, city, state, pincode, location.coordinates) must be provided.",
    });
  }

  // Validate pincode format
  if (!/^\d{6}$/.test(pincode)) {
    return res.status(400).json({
      success: false,
      message: "Pincode must be a valid 6-digit Indian pincode.",
    });
  }

  // Validate coordinates
  if (!Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
    return res.status(400).json({
      success: false,
      message: "Location coordinates must be an array of [longitude, latitude].",
    });
  }
  const [longitude, latitude] = location.coordinates;
  if (isNaN(longitude) || isNaN(latitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return res.status(400).json({
      success: false,
      message: "Invalid coordinates: latitude must be -90 to 90, longitude must be -180 to 180.",
    });
  }

  // Validate location type
  if (location.type !== "Point") {
    return res.status(400).json({
      success: false,
      message: "Location type must be 'Point'.",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find and validate user
    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "User not found." });
    }
    if (user.role !== "SERVICE_AGENT") {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: "User must have SERVICE_AGENT role." });
    }

    // Update User address
    user.address = {
      houseNo: houseNo ? houseNo.trim() : "",
      street: address.trim(),
      area: area ? area.trim() : "",
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      coordinates: JSON.stringify({ latitude, longitude }),
    };
    await user.save({ session });

    // Prepare ServiceAgent data
    const agentData = {
      userId,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      lastActive: Date.now(),
    };

    // Create or update ServiceAgent
    let agent = await ServiceAgent.findOne({ userId }).session(session);
    if (agent) {
      // Update existing agent
      Object.assign(agent, agentData);
      await agent.save({ session });
    } else {
      // Create new agent
      agent = new ServiceAgent(agentData);
      await agent.save({ session });
    }

    await session.commitTransaction();
    return res.status(201).json({
      success: true,
      message: "Service agent setup completed successfully!",
      data: {
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          address: user.address,
        },
        serviceAgent: {
          userId: agent.userId,
          location: agent.location,
          lastActive: agent.lastActive,
        },
      },
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("Error in service agent setup:", err);
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A service agent is already registered for this user.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  } finally {
    session.endSession();
  }
};
const getWeekRange = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset() + 330); // Adjust to IST (+5:30)
  const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Set to Monday
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to Sunday
  endOfWeek.setHours(23, 59, 59, 999);

  return { startOfWeek, endOfWeek };
};


// Get area stats for the service agent
export const getAreaStats = async (req, res) => {
  const userId = req.user._id;
  const { startOfWeek, endOfWeek } = getWeekRange();

  try {
    // Validate user role
    const user = await User.findById(userId).select("role");
    if (!user || user.role !== "SERVICE_AGENT") {
      return res.status(403).json({ success: false, message: "User must be a SERVICE_AGENT." });
    }

    // Find service agent
    const agent = await ServiceAgent.findOne({ userId }).select("activeWorkers");
    if (!agent) {
      return res.status(404).json({ success: false, message: "Service agent not found." });
    }

    // Count pending requests (worker verifications with status PENDING)
    const pendingRequests = await User.countDocuments({
      role: "WORKER",
      "workerProfile.verification.status": "PENDING",
      "workerProfile.verification.serviceAgentId": userId,
    });

    // Count workers assigned this week (APPROVED verifications this week)
    const assignedThisWeek = await User.countDocuments({
      role: "WORKER",
      "workerProfile.verification.status": "APPROVED",
      "workerProfile.verification.serviceAgentId": userId,
      "workerProfile.verification.verifiedAt": { $gte: startOfWeek, $lte: endOfWeek },
    });

    // Mock previous week data for percentage change (replace with real data if available)
    const previousActiveWorkers = agent.activeWorkers ? Math.max(agent.activeWorkers - 18, 0) : 0;
    const previousPendingRequests = pendingRequests ? Math.max(pendingRequests - 1, 0) : 0;
    const previousAssignedThisWeek = assignedThisWeek ? Math.max(assignedThisWeek - 5, 0) : 0;

    // Calculate percentage change
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? "+100%" : "0%";
      const change = ((current - previous) / previous) * 100;
      return `${change > 0 ? "+" : ""}${change.toFixed(0)}%`;
    };

    const stats = [
      {
        title: "Assigned Workers",
        value: (agent.activeWorkers || 0).toString(),
        change: calculateChange(agent.activeWorkers || 0, previousActiveWorkers),
        icon: "Users",
        color: "from-blue-500 to-blue-600",
      },
      {
        title: "Pending Requests",
        value: pendingRequests.toString(),
        change: calculateChange(pendingRequests, previousPendingRequests),
        icon: "Clock",
        color: "from-orange-500 to-orange-600",
      },
      {
        title: "Assigned This Week",
        value: assignedThisWeek.toString(),
        change: calculateChange(assignedThisWeek, previousAssignedThisWeek),
        icon: "CheckCircle",
        color: "from-green-500 to-green-600",
      },
    ];

    return res.status(200).json({ success: true, data: stats });
  } catch (err) {
    console.error("Error fetching area stats:", err);
    return res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};

// Controller to get workers for verification based on agent's area
export const getWorkersForVerification = async (req, res) => {
  try {
    const agentId = req.user._id; // Service agent logged in
    const agent = await User.findById(agentId);

    if (!agent || agent.role !== "SERVICE_AGENT") {
      return res.status(403).json({ message: "Access denied" });
    }
    // Ensure assignedArea is taken from the correct schema property (array or string)
    // Get assigned area from ServiceAgent model (if service agent info is stored separately)
    const serviceAgent = await ServiceAgent.findOne({ user: agent._id });
    const assignedArea = serviceAgent?.areasAssigned?.[0];

    // Fetch workers whose address.area matches agent's assigned area
    const workers = await User.find({
      role: "WORKER",
      "workerProfile.verification.status": "PENDING",
      "address.area": assignedArea
    }).select(
      "name email phone address workerProfile.verification"
    ).sort({ "workerProfile.verification.verificationId": -1 });

    const total = await User.countDocuments({
      role: "WORKER",
      "workerProfile.verification.status": "PENDING",
      "address.area": assignedArea
    });

    return res.status(200).json({ workers, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


/**
 * Get details of a worker (for verification by Service Agent)
 */
export const getWorkerDetails = async (req, res) => {
    try {
        const { workerId } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return errorResponse(res, 400, "Invalid worker ID");
        }

        // Fetch worker with populated skills
        const worker = await User.findById(workerId)
            .select("-password -otp")
            .populate({
                path: "workerProfile.skills.skillId",
                select: "name services description",
            });

        if (!worker || worker.role !== "WORKER") {
            return errorResponse(res, 404, "Worker not found");
        }

        // Fetch worker services with detailed population
        const workerServices = await WorkerService.find({ 
            workerId: workerId 
        })
        .populate({
            path: "skillId",
            select: "name services description",
            model: "Skill"
        })
        .sort({ isActive: -1, createdAt: -1 });

        // Process services with enhanced details
        const processedServices = await Promise.all(
            workerServices.map(async (service) => {
                const skill = service.skillId;
                let serviceDetails = {
                    name: "General Service",
                    description: ""
                };

                // Find service details from skill's services array
                if (skill && skill.services) {
                    const foundService = skill.services.find(
                        s => s.serviceId.toString() === service.serviceId.toString()
                    );
                    if (foundService) {
                        serviceDetails = {
                            name: foundService.name,
                            description: foundService.description || ""
                        };
                    }
                }

                return {
                    _id: service._id,
                    skill: {
                        _id: skill?._id,
                        name: skill?.name,
                        description: skill?.description
                    },
                    service: {
                        _id: service.serviceId,
                        name: serviceDetails.name,
                        description: serviceDetails.description
                    },
                    details: service.details,
                    pricingType: service.pricingType,
                    price: service.price,
                    estimatedDuration: service.estimatedDuration,
                    durationUnit: service.pricingType === "HOURLY" ? "hours" : "fixed",
                    portfolioImages: service.portfolioImages || [],
                    isActive: service.isActive,
                    createdAt: service.createdAt,
                    updatedAt: service.updatedAt
                };
            })
        );

        // Get worker statistics
        const [bookings, activeServices, completedBookings] = await Promise.all([
            Booking.find({ workerId: workerId }),
            WorkerService.countDocuments({ workerId: workerId, isActive: true }),
            Booking.find({ 
                workerId: workerId, 
                status: "COMPLETED",
                review: { $exists: true, $ne: null }
            }).populate("review")
        ]);

        const stats = {
            totalBookings: bookings.length,
            completed: bookings.filter(b => b.status === 'COMPLETED').length,
            pending: bookings.filter(b => b.status === 'PENDING').length,
            active: bookings.filter(b => b.status === 'ACCEPTED' || b.status === 'PAYMENT_PENDING').length,
            cancelled: bookings.filter(b => b.status === 'CANCELLED' || b.status === 'DECLINED').length,
            activeServices: activeServices,
            totalServices: workerServices.length
        };

        // Calculate earnings and rating
        const earnings = bookings
            .filter(b => b.status === 'COMPLETED')
            .reduce((total, booking) => total + (booking.price || 0), 0);

        const averageRating = completedBookings.length > 0 
            ? completedBookings.reduce((sum, booking) => sum + (booking.review?.rating || 0), 0) / completedBookings.length
            : 0;

        // Build comprehensive response
        const workerData = {
            _id: worker._id,
            personalInfo: {
                name: worker.name,
                phone: worker.phone,
                email: worker.email,
                isActive: worker.isActive,
                joinDate: worker.createdAt
            },
            address: worker.address,
            professionalInfo: {
                status: worker.workerProfile?.availabilityStatus || "available",
                rating: parseFloat(averageRating.toFixed(1)),
                totalReviews: completedBookings.length,
                completedJobs: stats.completed,
                totalEarnings: earnings,
                verificationStatus: worker.workerProfile?.verification?.status || "PENDING",
                preferredLanguage: worker.workerProfile?.preferredLanguage
            },
            skills: (worker.workerProfile?.skills || []).map((s) => ({
                _id: s.skillId?._id,
                name: s.skillId?.name,
                description: s.skillId?.description,
                availableServices: s.skillId?.services || []
            })).filter(skill => skill._id),
            services: processedServices,
            bankDetails: worker.workerProfile?.bankDetails || null,
            timetable: worker.workerProfile?.timetable || null,
            stats: stats,
            meta: {
                createdByAgent: worker.workerProfile?.createdByAgent || false,
                isSuspended: worker.workerProfile?.isSuspended || false,
                lastUpdated: worker.updatedAt
            }
        };

        return successResponse(
            res,
            200,
            "Worker details fetched successfully",
            workerData
        );
    } catch (error) {
        console.error("Error in getWorkerDetails:", error);
        return errorResponse(res, 500, "Server error. Please try again later.");
    }
};

/**
 * @desc Approve worker verification
 */


export const approveWorkerVerification = async (req, res) => {
  try {
    const { workerId } = req.params;

    // 🧩 Validate workerId format
    if (!mongoose.Types.ObjectId.isValid(workerId)) {
      return errorResponse(res, 400, "Invalid worker ID format");
    }

    // 🧩 Find worker
    const worker = await User.findOne({ _id: workerId, role: "WORKER" });
    if (!worker) {
      return errorResponse(res, 404, "Worker not found");
    }

    // 🧩 Optional area check (only for service agent)
    if (req.user.role === "SERVICE_AGENT") {
      const serviceAgent = await ServiceAgent.findOne({ userId: req.user._id });

      if (!serviceAgent) {
        return errorResponse(res, 404, "Service agent profile not found");
      }

      const agentArea =
        Array.isArray(serviceAgent.areasAssigned) && serviceAgent.areasAssigned.length > 0
          ? serviceAgent.areasAssigned[0]
          : serviceAgent.assignedArea;

  
    }

    // 🧩 Update verification details
    worker.workerProfile.verification.status = "APPROVED";
    worker.workerProfile.verification.serviceAgentId = new mongoose.Types.ObjectId(req.user._id);
    worker.workerProfile.verification.verifiedAt = new Date();

    // 🧩 Auto-verify all documents
    worker.workerProfile.verification.isSelfieVerified = true;
    worker.workerProfile.verification.isAddharDocVerified = true;
    worker.workerProfile.verification.isPoliceVerificationDocVerified = true;

    // 🧩 Mark top-level verified flag
    worker.isVerified = true;

    // 🧩 Save worker
    await worker.save();

    // 🧩 Respond success
    return successResponse(res, 200, "Worker approved successfully", {
      _id: worker._id,
      name: worker.name,
      phone: worker.phone,
      area: worker.address?.area,
      isVerified: worker.isVerified,
      verification: worker.workerProfile.verification,
    });
  } catch (error) {
    console.error("Approve error:", error);
    return errorResponse(res, 500, "Failed to approve worker", error.message);
  }
};


/**
 * @desc Reject worker verification
 */
export const rejectWorkerVerification = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { reason } = req.body;

    // Find worker by ID
    const worker = await User.findOne({ _id: workerId, role: "WORKER" });
    if (!worker) {
      return errorResponse(res, 404, "Worker not found");
    }

    // Area check - only allow service agent for their area
    if (req.user.role === "SERVICE_AGENT") {
      const serviceAgent = await ServiceAgent.findOne({ user: req.user._id });
      let agentArea = null;
      if (serviceAgent) {
        agentArea =
          (Array.isArray(serviceAgent.areasAssigned) && serviceAgent.areasAssigned.length > 0)
            ? serviceAgent.areasAssigned[0]
            : serviceAgent.areasAssigned;
      }
      if (agentArea && worker.address?.area !== agentArea) {
        return errorResponse(res, 403, "Access denied for this worker’s area");
      }
    }

    // Reject verification
    worker.workerProfile.verification.status = "REJECTED";
    worker.workerProfile.verification.rejectionReason = reason || "Not specified";
    worker.workerProfile.verification.rejectedBy = req.user._id;
    worker.workerProfile.verification.rejectedAt = new Date();

    await worker.save();

    return successResponse(res, 200, "Worker rejected successfully", { worker });
  } catch (error) {
    console.error("Reject error:", error);
    return errorResponse(res, 500, "Failed to reject worker");
  }
};

// ==================== GET ALL WORKERS ====================
export const getAllWorkers = async (req, res) => {
  try {
    const { search, status, service, page = 1, limit = 10 } = req.query;
    const serviceAgentId = req.user.id; // From auth middleware

    // Build query
    const query = { role: "WORKER" };

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { "address.city": { $regex: search, $options: "i" } },
        { "address.area": { $regex: search, $options: "i" } },
      ];
    }

    // Status filter
    if (status && status !== "all") {
      if (status === "active") {
        query["workerProfile.availabilityStatus"] = "available";
        query["workerProfile.verification.status"] = "APPROVED";
      } else if (status === "suspended") {
        query.$or = [
          { "serviceAgentProfile.isSuspended": true },
          {
            "serviceAgentProfile.suspendedUntil": { $gt: new Date() },
          },
        ];
      } else if (status === "pending") {
        query["workerProfile.verification.status"] = "PENDING";
      }
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const workers = await User.find(query)
      .select("-password -otp")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const totalWorkers = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: workers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalWorkers / parseInt(limit)),
        totalWorkers,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching workers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching workers",
      error: error.message,
    });
  }
};

// ==================== GET WORKER BY ID ====================
export const getWorkerById = async (req, res) => {
  try {
    const { workerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(workerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid worker ID",
      });
    }

    const worker = await User.findOne({
      _id: workerId,
      role: "WORKER",
    })
      .select("-password -otp")
      .lean();

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    res.status(200).json({
      success: true,
      data: worker,
    });
  } catch (error) {
    console.error("Error fetching worker:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching worker details",
      error: error.message,
    });
  }
};

// ==================== SUSPEND WORKER ====================
export const suspendWorker = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { reason, suspendedUntil } = req.body;
    const serviceAgentId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(workerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid worker ID",
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Suspension reason is required",
      });
    }

    const worker = await User.findOne({
      _id: workerId,
      role: "WORKER",
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    // Initialize serviceAgentProfile if it doesn't exist
    if (!worker.serviceAgentProfile) {
      worker.serviceAgentProfile = {};
    }

    worker.serviceAgentProfile.isSuspended = true;
    worker.serviceAgentProfile.suspendedUntil = suspendedUntil
      ? new Date(suspendedUntil)
      : null;

    // Store suspension reason in worker notes or custom field
    if (!worker.workerProfile) {
      worker.workerProfile = {};
    }

    await worker.save();

    // Update service agent stats
    await ServiceAgent.findOneAndUpdate(
      { userId: serviceAgentId },
      {
        $inc: { inactiveWorkers: 1, activeWorkers: -1 },
      }
    );

    res.status(200).json({
      success: true,
      message: "Worker suspended successfully",
      data: {
        workerId: worker._id,
        isSuspended: true,
        suspendedUntil: worker.serviceAgentProfile.suspendedUntil,
        reason,
      },
    });
  } catch (error) {
    console.error("Error suspending worker:", error);
    res.status(500).json({
      success: false,
      message: "Error suspending worker",
      error: error.message,
    });
  }
};

// ==================== ACTIVATE WORKER ====================
export const activateWorker = async (req, res) => {
  try {
    const { workerId } = req.params;
    const serviceAgentId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(workerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid worker ID",
      });
    }

    const worker = await User.findOne({
      _id: workerId,
      role: "WORKER",
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    // Check if worker has serviceAgentProfile
    if (!worker.serviceAgentProfile) {
      worker.serviceAgentProfile = {};
    }

    worker.serviceAgentProfile.isSuspended = false;
    worker.serviceAgentProfile.suspendedUntil = null;

    await worker.save();

    // Update service agent stats
    await ServiceAgent.findOneAndUpdate(
      { userId: serviceAgentId },
      {
        $inc: { activeWorkers: 1, inactiveWorkers: -1 },
      }
    );

    res.status(200).json({
      success: true,
      message: "Worker activated successfully",
      data: {
        workerId: worker._id,
        isSuspended: false,
      },
    });
  } catch (error) {
    console.error("Error activating worker:", error);
    res.status(500).json({
      success: false,
      message: "Error activating worker",
      error: error.message,
    });
  }
};


