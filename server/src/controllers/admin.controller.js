// controllers/adminController.js
import axios from "axios";
import User from "../models/user.model.js";
import ServiceAgent from "../models/serviceAgent.model.js";

// Assign Area to Service Agent
export const assignAreaToServiceAgent = async (req, res) => {
  try {
    const { agentId, pincode } = req.body;
    const adminId = req.user._id; // assuming admin authenticated

    if (!agentId || !pincode) {
      return res.status(400).json({
        success: false,
        message: "Agent ID and pincode are required",
      });
    }

    // Step 1: Fetch area details using Postal API
    const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = response.data[0];

    if (data.Status !== "Success" || !data.PostOffice || data.PostOffice.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Invalid or unknown pincode",
      });
    }

    const areaName = data.PostOffice[0].Name;
    const city = data.PostOffice[0].District;
    const state = data.PostOffice[0].State;

    // Step 2: Check if this area already assigned
    const existingAgent = await ServiceAgent.findOne({ areasAssigned: areaName });

    if (existingAgent) {
      // Find other available areas in same city
      const availableAreas = data.PostOffice
        .map((p) => p.Name)
        .filter((name) => name !== areaName);

      return res.status(409).json({
        success: false,
        message: `Area "${areaName}" (pincode ${pincode}) is already assigned to another agent.`,
        suggestions: availableAreas.length
          ? availableAreas.slice(0, 5)
          : ["Try a nearby pincode"],
      });
    }

    // Step 3: Assign to Service Agent
    const serviceAgent = await ServiceAgent.findOne({ userId: agentId });
    if (!serviceAgent) {
      return res.status(404).json({
        success: false,
        message: "Service Agent not found",
      });
    }

    serviceAgent.areasAssigned.push(areaName);
    serviceAgent.status = "APPROVED";
    serviceAgent.assignedBy = adminId;
    serviceAgent.assignedDate = new Date();

    await serviceAgent.save();

    // Step 4: Update main User document too (optional)
    await User.findByIdAndUpdate(agentId, {
      "serviceAgentProfile.assignedArea": areaName,
      "address.city": city,
      "address.state": state,
      "address.pincode": pincode,
    });

    return res.status(200).json({
      success: true,
      message: `Area "${areaName}" (Pincode ${pincode}) successfully assigned to agent.`,
      data: {
        agentId,
        assignedArea: areaName,
        city,
        state,
        pincode,
      },
    });
  } catch (error) {
    console.error("Error assigning area:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while assigning area",
      error: error.message,
    });
  }
};
