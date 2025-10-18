import mongoose from "mongoose";
import User from "../models//user.model.js";
import ServiceAgent from "../models/serviceAgent.model.js"

// Setup or update service agent details
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
// Helper function to get the start and end of the current week (Monday to Sunday, IST)
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
