import User from "../models/user.model.js";
import { Booking } from "../models/booking.model.js";

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
        rating: ratings[0]?.avgRating?.toFixed(1) || 0
      },
      bookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
