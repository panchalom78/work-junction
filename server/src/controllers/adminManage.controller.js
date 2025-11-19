// controllers/serviceAgentController.js
import ServiceAgent from '../models/serviceAgent.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';
import axios from 'axios';
// Get all service agents with user details
export const getServiceAgents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {
      role: 'SERVICE_AGENT'
    };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      searchQuery.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { 'serviceAgentProfile.assignedArea': searchRegex }
      ];
    }

    // Get users with service agent role
    const users = await User.find(searchQuery)
      .select('name email phone address serviceAgentProfile isActive isVerified createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      success: true,
      data: {
        agents: users,
        pagination: {
          current: page,
          pages: totalPages,
          total: totalUsers
        }
      }
    });
  } catch (error) {
    console.error('Error fetching service agents:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service agents'
    });
  }
};

// Get available areas for assignment

export const getAvailableAreas = async (req, res) => {
  try {
    const { pincode, city, limit = 10, agentId } = req.query;

    // If agentId is provided, get the agent's location to find nearby areas
    let agentLocation = null;
    let agentPincode = null;
    let agentCity = null;

    if (agentId) {
      const agent = await User.findOne({ 
        _id: agentId, 
        role: 'SERVICE_AGENT' 
      }).select('address');

      if (agent && agent.address) {
        agentLocation = agent.address.coordinates;
        agentPincode = agent.address.pincode;
        agentCity = agent.address.city;
      }
    }

    // Get all service agents to see which areas are already assigned
    const assignedAreas = await ServiceAgent.aggregate([
      { $match: { status: 'APPROVED' } },
      { $unwind: '$areasAssigned' },
      {
        $group: {
          _id: '$areasAssigned',
          agentCount: { $sum: 1 },
          agents: { $push: '$userId' }
        }
      }
    ]);

    // Create a map of assigned areas for quick lookup
    const assignedAreaMap = {};
    assignedAreas.forEach(area => {
      assignedAreaMap[area._id] = area.agentCount;
    });

    // Use real API to get area data based on pincode
    let realAreas = [];

    // Use the pincode from query or agent's pincode
    const searchPincode = pincode || agentPincode;
    
    if (searchPincode) {
      try {
        // API 1: Postalpincode.in API (Free, no API key required)
        const response = await axios.get(`https://api.postalpincode.in/pincode/${searchPincode}`, {
          timeout: 5000
        });

        if (response.data && response.data[0].Status === 'Success') {
          const postOffices = response.data[0].PostOffice;
          
          realAreas = postOffices.map((office, index) => ({
            id: `area_${searchPincode}_${index}`,
            name: office.Name,
            pincode: office.Pincode,
            city: office.District,
            state: office.State,
            country: office.Country,
            branchType: office.BranchType,
            deliveryStatus: office.DeliveryStatus,
            latitude: null, // This API doesn't provide coordinates
            longitude: null
          }));
        }
      } catch (apiError) {
        console.log('Postalpincode API failed, trying fallback API...');
        
        // Fallback API: Zippopotam.us (Free, no API key)
        try {
          const fallbackResponse = await axios.get(`http://api.zippopotam.us/IN/${searchPincode}`, {
            timeout: 5000
          });

          if (fallbackResponse.data) {
            const places = fallbackResponse.data.places;
            realAreas = places.map((place, index) => ({
              id: `area_${searchPincode}_${index}`,
              name: place['place name'],
              pincode: searchPincode,
              city: place['place name'],
              state: fallbackResponse.data.state,
              country: fallbackResponse.data.country,
              latitude: parseFloat(place.latitude),
              longitude: parseFloat(place.longitude)
            }));
          }
        } catch (fallbackError) {
          console.log('Fallback API also failed, using default areas');
        }
      }
    }

    // If no real areas found from APIs, use default areas for the city
    if (realAreas.length === 0) {
      const searchCity = city || agentCity || 'Bangalore';
      realAreas = await getDefaultAreasForCity(searchCity);
    }

    // Calculate distance between two coordinates (Haversine formula)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      if (!lat1 || !lon1 || !lat2 || !lon2) return null;
      
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    // Enhance areas with real data: agentCount, distance, and status
    const enhancedAreas = realAreas.map(area => {
      const agentCount = assignedAreaMap[area.name] || 0;
      let distance = null;
      
      // Calculate distance if agent location is available
      if (agentLocation && agentLocation.latitude && agentLocation.longitude && area.latitude && area.longitude) {
        distance = calculateDistance(
          parseFloat(agentLocation.latitude),
          parseFloat(agentLocation.longitude),
          parseFloat(area.latitude),
          parseFloat(area.longitude)
        );
      }

      return {
        ...area,
        agentCount,
        distance: distance ? `${distance.toFixed(1)} km` : 'Unknown',
        status: agentCount === 0 ? 'available' : 'occupied',
        isAvailable: agentCount === 0
      };
    });

    // Filter areas based on query parameters
    let filteredAreas = enhancedAreas;

    // Filter by city (from query or agent's city)
    const searchCity = city || agentCity;
    if (searchCity) {
      const cityRegex = new RegExp(searchCity, 'i');
      filteredAreas = filteredAreas.filter(area => 
        area.city && cityRegex.test(area.city)
      );
    }

    // Sort by distance if agent location is available and distances are known
    if (agentLocation) {
      filteredAreas.sort((a, b) => {
        const distA = a.distance === 'Unknown' ? Infinity : parseFloat(a.distance);
        const distB = b.distance === 'Unknown' ? Infinity : parseFloat(b.distance);
        return distA - distB;
      });
    }

    // Prioritize available areas (no agents assigned)
    const availableAreas = filteredAreas
      .filter(area => area.agentCount === 0)
      .slice(0, limit);

    // If no available areas found, return areas with lowest agent count
    if (availableAreas.length === 0) {
      filteredAreas.sort((a, b) => a.agentCount - b.agentCount);
      return res.json({
        success: true,
        data: filteredAreas.slice(0, limit),
        message: 'No completely available areas found. Showing areas with lowest agent count.'
      });
    }

    res.json({
      success: true,
      data: availableAreas,
      agentInfo: agentId ? {
        location: agentLocation,
        pincode: agentPincode,
        city: agentCity
      } : null,
      source: realAreas.length > 0 ? 'real_api' : 'default_data'
    });

  } catch (error) {
    console.error('Error fetching available areas:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available areas'
    });
  }
};

// Helper function to get default areas when APIs fail
const getDefaultAreasForCity = async (cityName) => {
  const cityAreas = {
    'bangalore': [
      { id: '1', name: 'Koramangala', pincode: '560034', city: 'Bangalore', latitude: '12.9279', longitude: '77.6271' },
      { id: '2', name: 'Indiranagar', pincode: '560038', city: 'Bangalore', latitude: '12.9784', longitude: '77.6408' },
      { id: '3', name: 'Whitefield', pincode: '560066', city: 'Bangalore', latitude: '12.9698', longitude: '77.5305' },
      { id: '4', name: 'Jayanagar', pincode: '560041', city: 'Bangalore', latitude: '12.9304', longitude: '77.5834' },
      { id: '5', name: 'HSR Layout', pincode: '560102', city: 'Bangalore', latitude: '12.9115', longitude: '77.6453' },
      { id: '6', name: 'BTM Layout', pincode: '560076', city: 'Bangalore', latitude: '12.9166', longitude: '77.6101' },
      { id: '7', name: 'Electronic City', pincode: '560100', city: 'Bangalore', latitude: '12.8456', longitude: '77.6653' },
      { id: '8', name: 'Marathahalli', pincode: '560037', city: 'Bangalore', latitude: '12.9592', longitude: '77.6974' }
    ],
    'mumbai': [
      { id: '9', name: 'Andheri East', pincode: '400069', city: 'Mumbai', latitude: '19.1176', longitude: '72.8560' },
      { id: '10', name: 'Bandra West', pincode: '400050', city: 'Mumbai', latitude: '19.0552', longitude: '72.8222' },
      { id: '11', name: 'Powai', pincode: '400076', city: 'Mumbai', latitude: '19.1176', longitude: '72.9043' }
    ],
    'delhi': [
      { id: '12', name: 'Connaught Place', pincode: '110001', city: 'Delhi', latitude: '28.6328', longitude: '77.2197' },
      { id: '13', name: 'Saket', pincode: '110017', city: 'Delhi', latitude: '28.5246', longitude: '77.2066' }
    ]
  };

  const normalizedCity = cityName.toLowerCase();
  return cityAreas[normalizedCity] || cityAreas['bangalore']; // Default to Bangalore
};

export const getNearbyAreas = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { maxDistance = 20 } = req.query; // Default 20km radius

    // Get agent's location
    const user = await User.findById(agentId).select('address name');
    if (!user || !user.address?.coordinates || !user.address.pincode) {
      return res.status(404).json({
        success: false,
        message: 'Agent location or pincode not found'
      });
    }

    const { latitude, longitude, pincode } = user.address;

    // Get assigned areas to check availability
    const assignedAreas = await ServiceAgent.aggregate([
      { $match: { status: 'APPROVED' } },
      { $unwind: '$areasAssigned' },
      {
        $group: {
          _id: '$areasAssigned',
          agentCount: { $sum: 1 }
        }
      }
    ]);

    const assignedAreaMap = {};
    assignedAreas.forEach(area => {
      assignedAreaMap[area._id] = area.agentCount;
    });

    // Use real API to get nearby areas based on pincode
    let realAreas = [];

    try {
      // Use PostalPincode API to get areas for the agent's pincode
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`, {
        timeout: 5000
      });

      if (response.data && response.data[0].Status === 'Success') {
        const postOffices = response.data[0].PostOffice;
        
        realAreas = postOffices.map((office, index) => ({
          id: `area_${pincode}_${index}`,
          name: office.Name,
          pincode: office.Pincode,
          city: office.District,
          state: office.State,
          branchType: office.BranchType,
          deliveryStatus: office.DeliveryStatus,
          latitude: null, // This API doesn't provide coordinates
          longitude: null
        }));
      }
    } catch (apiError) {
      console.log('Real API failed, using default areas');
      realAreas = await getDefaultAreasForCity(user.address.city);
    }

    // Calculate distance using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
      
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    // Find nearby areas within the maxDistance
    const nearbyAreas = realAreas
      .map(area => {
        let distance = Infinity;
        
        if (latitude && longitude && area.latitude && area.longitude) {
          distance = calculateDistance(
            parseFloat(latitude),
            parseFloat(longitude),
            parseFloat(area.latitude),
            parseFloat(area.longitude)
          );
        }
        
        return {
          ...area,
          distance: distance !== Infinity ? parseFloat(distance.toFixed(1)) : 'Unknown',
          agentCount: assignedAreaMap[area.name] || 0,
          isAvailable: (assignedAreaMap[area.name] || 0) === 0
        };
      })
      .filter(area => area.distance === 'Unknown' || area.distance <= maxDistance)
      .sort((a, b) => {
        // Sort known distances first, then unknown
        if (a.distance === 'Unknown') return 1;
        if (b.distance === 'Unknown') return -1;
        return a.distance - b.distance;
      });

    // Separate available and occupied areas
    const availableNearbyAreas = nearbyAreas.filter(area => area.isAvailable);
    const occupiedNearbyAreas = nearbyAreas.filter(area => !area.isAvailable);

    res.json({
      success: true,
      data: {
        agentLocation: {
          latitude,
          longitude,
          pincode,
          address: user.address,
          agentName: user.name
        },
        nearbyAreas: nearbyAreas,
        availableNearbyAreas: availableNearbyAreas,
        occupiedNearbyAreas: occupiedNearbyAreas,
        suggestedAreas: availableNearbyAreas.slice(0, 5), // Top 5 closest available areas
        stats: {
          totalNearby: nearbyAreas.length,
          available: availableNearbyAreas.length,
          occupied: occupiedNearbyAreas.length,
          searchRadius: `${maxDistance}km`
        },
        source: realAreas.length > 0 ? 'real_api' : 'default_data'
      }
    });

  } catch (error) {
    console.error('Error fetching nearby areas:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching nearby areas'
    });
  }
};

// Assign area to service agent
export const assignAreaToAgent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { agentId } = req.params;
    const { areaId, areaName, pincode } = req.body;
    const adminId = req.user._id; // Assuming admin is authenticated

    // Validate input
    if (!areaId || !areaName || !pincode) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Area ID, area name and pincode are required'
      });
    }

    // Check if agent exists and is a service agent
    const user = await User.findOne({ 
      _id: agentId, 
      role: 'SERVICE_AGENT' 
    }).session(session);

    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Service agent not found'
      });
    }

    // Check if area is already assigned to another agent
    const existingAgentWithArea = await User.findOne({
      role: 'SERVICE_AGENT',
      'serviceAgentProfile.assignedArea': areaName,
      _id: { $ne: agentId }
    }).session(session);

    if (existingAgentWithArea) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Area "${areaName}" is already assigned to another service agent`
      });
    }

    // Check if agent already has an area assigned
    if (user.serviceAgentProfile?.assignedArea) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Agent already has area "${user.serviceAgentProfile.assignedArea}" assigned`
      });
    }

    // Update user's service agent profile with assigned area
    user.serviceAgentProfile = {
      assignedArea: areaName,
      isSuspended: false
    };

    await user.save({ session });

    // Create or update ServiceAgent document
    let serviceAgent = await ServiceAgent.findOne({ userId: agentId }).session(session);
    
    if (serviceAgent) {
      // Update existing service agent
      serviceAgent.areasAssigned = [areaName];
      serviceAgent.assignedBy = adminId;
      serviceAgent.assignedDate = new Date();
      serviceAgent.status = 'APPROVED';
    } else {
      // Create new service agent record
      serviceAgent = new ServiceAgent({
        userId: agentId,
        areasAssigned: [areaName],
        assignedBy: adminId,
        assignedDate: new Date(),
        status: 'APPROVED',
        location: {
          type: 'Point',
          coordinates: user.address?.coordinates ? 
            [parseFloat(user.address.coordinates.longitude), parseFloat(user.address.coordinates.latitude)] : 
            [77.5946, 12.9716] // Default to Bangalore coordinates
        },
        contactEmail: user.email,
        contactPhone: user.phone
      });
    }

    await serviceAgent.save({ session });

    // Commit transaction
    await session.commitTransaction();

    res.json({
      success: true,
      message: `Area "${areaName}" assigned successfully to ${user.name}`,
      data: {
        agent: user,
        serviceAgent
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error assigning area to agent:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Area is already assigned to another agent'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error assigning area to agent'
    });
  } finally {
    session.endSession();
  }
};

// Get nearby available areas based on agent's location


// Remove area assignment from agent
export const removeAreaAssignment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { agentId } = req.params;

    // Find user and update
    const user = await User.findOneAndUpdate(
      { _id: agentId, role: 'SERVICE_AGENT' },
      { 
        $set: { 
          'serviceAgentProfile.assignedArea': null,
          'serviceAgentProfile.isSuspended': false
        } 
      },
      { new: true, session }
    );

    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Service agent not found'
      });
    }

    // Update ServiceAgent document
    await ServiceAgent.findOneAndUpdate(
      { userId: agentId },
      { 
        $set: { 
          areasAssigned: [],
          status: 'PENDING',
          isSuspended: true
        } 
      },
      { session }
    );

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Area assignment removed successfully',
      data: user
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error removing area assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing area assignment'
    });
  } finally {
    session.endSession();
  }
};

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

    console.log('Updating agent:', agentId, 'with data:', updateData);

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

    // Prepare user update data
    const userUpdateData = {};
    
    // Basic information
    if (updateData.name !== undefined) userUpdateData.name = updateData.name;
    if (updateData.email !== undefined) userUpdateData.email = updateData.email;
    if (updateData.phone !== undefined) userUpdateData.phone = updateData.phone;
    if (updateData.isActive !== undefined) userUpdateData.isActive = updateData.isActive;

    // Address information
    if (updateData.address) {
      userUpdateData.address = {
        ...agent.address,
        ...updateData.address
      };
    }

    // Service agent profile
    if (updateData.serviceAgentProfile) {
      userUpdateData.serviceAgentProfile = {
        ...agent.serviceAgentProfile,
        ...updateData.serviceAgentProfile
      };
    }

    // Update user data
    const updatedUser = await User.findByIdAndUpdate(
      agentId,
      { $set: userUpdateData },
      { new: true, session, runValidators: true }
    ).select('-password -otp');

    if (!updatedUser) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Failed to update user data'
      });
    }

    // Prepare ServiceAgent update data
    const serviceAgentUpdate = {};
    
    if (updateData.serviceRadius !== undefined) {
      serviceAgentUpdate.serviceRadius = updateData.serviceRadius;
    }
    
    if (updateData.status !== undefined) {
      serviceAgentUpdate.status = updateData.status;
      serviceAgentUpdate.reviewedByAdmin = adminId;
      serviceAgentUpdate.reviewedAt = new Date();
    }

    // Update contact information in ServiceAgent
    if (updateData.email || updateData.phone) {
      serviceAgentUpdate.contactEmail = updateData.email || agent.email;
      serviceAgentUpdate.contactPhone = updateData.phone || agent.phone;
    }

    // Update assigned areas if provided
    if (updateData.serviceAgentProfile?.assignedArea) {
      serviceAgentUpdate.areasAssigned = [updateData.serviceAgentProfile.assignedArea];
    }

    // Handle suspension
    if (updateData.serviceAgentProfile?.isSuspended !== undefined) {
      serviceAgentUpdate.isSuspended = updateData.serviceAgentProfile.isSuspended;
      
      if (updateData.serviceAgentProfile.isSuspended) {
        serviceAgentUpdate.suspendedUntil = updateData.serviceAgentProfile.suspendedUntil || null;
        serviceAgentUpdate.suspensionReason = updateData.serviceAgentProfile.suspensionReason || 'Admin action';
        serviceAgentUpdate.status = 'SUSPENDED';
      } else {
        serviceAgentUpdate.suspendedUntil = null;
        serviceAgentUpdate.suspensionReason = null;
        serviceAgentUpdate.status = 'APPROVED';
      }
    }

    // Update or create ServiceAgent document
    let updatedServiceAgent;
    if (Object.keys(serviceAgentUpdate).length > 0) {
      updatedServiceAgent = await ServiceAgent.findOneAndUpdate(
        { userId: agentId },
        { $set: serviceAgentUpdate },
        { 
          upsert: true, 
          new: true, 
          session,
          setDefaultsOnInsert: true 
        }
      );
    } else {
      updatedServiceAgent = await ServiceAgent.findOne({ userId: agentId }).session(session);
    }

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Service agent updated successfully',
      data: {
        user: updatedUser,
        serviceAgent: updatedServiceAgent
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error updating service agent:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid agent ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating service agent',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    session.endSession();
  }
};

// Delete service agent (soft delete)
export const deleteServiceAgent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { agentId } = req.params;
    const adminId = req.user._id;

    console.log('Deleting service agent:', agentId);

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

    // Soft delete from User collection by setting isActive to false
    const updatedUser = await User.findByIdAndUpdate(
      agentId,
      { 
        $set: { 
          isActive: false,
          'serviceAgentProfile.isSuspended': true
        } 
      },
      { new: true, session }
    ).select('-password -otp');

    if (!updatedUser) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Failed to deactivate user account'
      });
    }

    // Update ServiceAgent collection to mark as suspended and remove areas
    const updatedServiceAgent = await ServiceAgent.findOneAndUpdate(
      { userId: agentId },
      { 
        $set: { 
          status: 'SUSPENDED',
          isSuspended: true,
          areasAssigned: [],
          suspendedUntil: null,
          suspensionReason: 'Account deactivated by admin'
        } 
      },
      { new: true, session }
    );

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Service agent deleted successfully',
      data: {
        user: updatedUser,
        serviceAgent: updatedServiceAgent
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error deleting service agent:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid agent ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting service agent',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    session.endSession();
  }
};

// Hard delete service agent (complete removal - use with caution)
export const hardDeleteServiceAgent = async (req, res) => {
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

    // Delete from User collection
    await User.findByIdAndDelete(agentId).session(session);

    // Delete from ServiceAgent collection
    await ServiceAgent.findOneAndDelete({ userId: agentId }).session(session);

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Service agent permanently deleted'
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error hard deleting service agent:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid agent ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error permanently deleting service agent'
    });
  } finally {
    session.endSession();
  }
};

// Reactivate service agent
export const reactivateServiceAgent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { agentId } = req.params;

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

    // Reactivate in User collection
    const updatedUser = await User.findByIdAndUpdate(
      agentId,
      { 
        $set: { 
          isActive: true,
          'serviceAgentProfile.isSuspended': false
        } 
      },
      { new: true, session }
    ).select('-password -otp');

    // Reactivate in ServiceAgent collection
    const updatedServiceAgent = await ServiceAgent.findOneAndUpdate(
      { userId: agentId },
      { 
        $set: { 
          status: 'APPROVED',
          isSuspended: false,
          suspendedUntil: null,
          suspensionReason: null
        } 
      },
      { new: true, session }
    );

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Service agent reactivated successfully',
      data: {
        user: updatedUser,
        serviceAgent: updatedServiceAgent
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error reactivating service agent:', error);
    res.status(500).json({
      success: false,
      message: 'Error reactivating service agent'
    });
  } finally {
    session.endSession();
  }
};