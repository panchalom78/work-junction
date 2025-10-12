import ServiceAgent from "../models/serviceAgent.model.js";

// Setup or update service agent location details
export const setupServiceAgent = async (req, res) => {
  const { city, address, pincode, preferredAreas, location } = req.body;
  const userId = req.user._id; // Assuming authentication middleware provides req.user

  // Validate required fields
  if (!city || !address || !pincode || !preferredAreas?.length || !location?.coordinates) {
    return res.status(400).json({ success: false, message: "All required fields (city, address, pincode, preferredAreas, location.coordinates) must be provided." });
  }

  // Validate pincode format
  if (!/^\d{6}$/.test(pincode)) {
    return res.status(400).json({ success: false, message: "Pincode must be a valid 6-digit Indian pincode." });
  }

  // Validate coordinates
  if (!Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
    return res.status(400).json({ success: false, message: "Location coordinates must be an array of [longitude, latitude]." });
  }
  const [longitude, latitude] = location.coordinates;
  if (isNaN(longitude) || isNaN(latitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return res.status(400).json({ success: false, message: "Invalid coordinates: latitude must be -90 to 90, longitude must be -180 to 180." });
  }

  // Validate location type
  if (location.type !== "Point") {
    return res.status(400).json({ success: false, message: "Location type must be 'Point'." });
  }

  // Validate preferredAreas
  if (!Array.isArray(preferredAreas) || preferredAreas.length > 4) {
    return res.status(400).json({ success: false, message: "Preferred areas must be an array with a maximum of 4 areas." });
  }

  try {
    let agent = await ServiceAgent.findOne({ userId });

    const agentData = {
      city: city.trim(),
      address: address.trim(),
      pincode: pincode.trim(),
      preferredAreas: preferredAreas.map(area => area.trim()),
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        address: location.address ? location.address.trim() : "",
      },
      lastActive: Date.now(),
    };
      // Create new agent
      agent = new ServiceAgent({
        userId,
        ...agentData,
      });
      await agent.save();
      return res.status(201).json({ success: true, message: "Service agent setup completed successfully!", data: agent });

  } catch (err) {
    console.error("Error in service agent setup:", err);
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "A service agent is already registered for this user." });
    }
    return res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
};