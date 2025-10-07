import User from "../models/user.model.js";
import { Booking } from "../models/booking.model.js";
import { WorkerService } from "../models/workerService.model.js";
import { Skill } from "../models/skill.model.js";

export const getWorkerOverview = async (req, res) => {
  try {
    const workerId = req.user._id; // We now use req.user from authMiddleware

    const worker = await User.findById(workerId);
    if (!worker || worker.role !== "WORKER") {
      return res.status(404).json({ message: "Worker not found" });
    }

    const totalEarnings = await Booking.aggregate([
      { $match: { workerId: worker._id, status: "COMPLETED" } },
      { $group: { _id: null, total: { $sum: "$price" } } }
    ]);

    const completedJobs = await Booking.countDocuments({
      workerId: worker._id,
      status: "COMPLETED"
    });

    const upcomingJobs = await Booking.countDocuments({
      workerId: worker._id,
      status: "ACCEPTED"
    });

    const ratings = await Booking.aggregate([
      { $match: { workerId: worker._id, "review.rating": { $exists: true } } },
      { $group: { _id: null, avgRating: { $avg: "$review.rating" } } }
    ]);

    const earningsData  = await Booking.aggregate([
      { $match: { workerId: worker._id, status: "COMPLETED" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          amount: { $sum: "$price" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    const bookings = await Booking.find({ workerId: worker._id })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate("customerId", "name")
      .lean();

    res.json({
      worker: {
        name: worker.name,
        earnings: totalEarnings[0]?.total || 0,
        completedJobs,
        upcomingJobs,
        rating: ratings[0]?.avgRating?.toFixed(1) || 0,
        earningsData

      },
      bookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
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
    const service = skill.services.find(s => s.serviceId.toString() === serviceId);
    if (!service)
      return res.status(404).json({ error: "Service not found in this skill" });

    // Create WorkerService
    const workerService = await WorkerService.create({
      workerId,
      skillId,
      serviceId,
      details: details || service.description || "",
      pricingType,
      price: Number(price),
      portfolioImages: [], // keep empty for now
      isActive: true
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

    const services = await WorkerService.find({ workerId })
      .populate("skillId", "name")   // Get skill name
      .populate("workerId", "name")  // Get worker name
      .lean();

    res.status(200).json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a worker service
export const updateWorkerService = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedService = await WorkerService.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedService) return res.status(404).json({ error: "Service not found" });

    res.status(200).json(updatedService);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a worker service
export const deleteWorkerService = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedService = await WorkerService.findByIdAndDelete(id.toString());
    if (!deletedService) return res.status(404).json({ error: "Service not found" });

    res.status(200).json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};