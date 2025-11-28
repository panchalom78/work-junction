// controllers/serviceAgentController.js
import { Booking } from "../models/booking.model.js";
import User from "../models/user.model.js";

// Get reviews for a specific worker
export const getWorkerReviews = async (req, res) => {
    try {
        const { workerId } = req.params;
        const serviceAgentId = req.user._id; // Assuming agent is authenticated

        // Verify the worker belongs to this service agent
        const worker = await User.findOne({
            _id: workerId,
            role: "WORKER",
            "workerProfile.createdBy": serviceAgentId,
        });

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found or not associated with your account",
            });
        }

        // Get completed bookings with reviews for this worker
        const bookingsWithReviews = await Booking.find({
            workerId: workerId,
            status: "COMPLETED",
            "review.rating": { $exists: true, $ne: null },
        })
            .populate("customerId", "name phone email address")
            .populate(
                "workerServiceId",
                "serviceId details pricingType price estimatedDuration"
            )
            .sort({ "review.reviewedAt": -1 });

        // Transform the data for frontend
        const reviews = bookingsWithReviews.map((booking) => {
            const serviceDetails = booking.workerServiceId;

            return {
                _id: booking._id,
                rating: booking.review.rating,
                comment: booking.review.comment,
                reviewedAt: booking.review.reviewedAt,
                customer: {
                    name: booking.customerId.name,
                    phone: booking.customerId.phone,
                    email: booking.customerId.email,
                    address: booking.customerId.address,
                },
                service: {
                    serviceName: serviceDetails?.details || "Service",
                    skillName: "General Service", // You might want to populate this from Skill model
                    price: serviceDetails?.price,
                    estimatedDuration: serviceDetails?.estimatedDuration,
                    pricingType: serviceDetails?.pricingType,
                },
                bookingDate: booking.bookingDate,
                createdAt: booking.createdAt,
            };
        });

        res.status(200).json({
            success: true,
            data: {
                reviews,
                worker: {
                    _id: worker._id,
                    name: worker.name,
                    phone: worker.phone,
                    email: worker.email,
                    address: worker.address,
                    workerProfile: worker.workerProfile,
                },
            },
        });
    } catch (error) {
        console.error("Get worker reviews error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch worker reviews",
            error: error.message,
        });
    }
};

// Get all reviews for agent's workers
export const getAllAgentWorkerReviews = async (req, res) => {
    try {
        const serviceAgentId = req.user._id;

        // Get all workers created by this agent
        const agentWorkers = await User.find({
            role: "WORKER",
            "workerProfile.createdBy": serviceAgentId,
        }).select("name phone email address workerProfile");

        if (agentWorkers.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    reviews: [],
                    workers: [],
                },
            });
        }

        const workerIds = agentWorkers.map((worker) => worker._id);

        // Get all completed bookings with reviews for these workers
        const bookingsWithReviews = await Booking.find({
            workerId: { $in: workerIds },
            status: "COMPLETED",
            "review.rating": { $exists: true, $ne: null },
        })
            .populate("customerId", "name phone email address")
            .populate(
                "workerServiceId",
                "serviceId details pricingType price estimatedDuration"
            )
            .sort({ "review.reviewedAt": -1 });

        // Create a map of workers for easy lookup
        const workersMap = new Map();
        agentWorkers.forEach((worker) => {
            workersMap.set(worker._id.toString(), worker);
        });

        // Transform the data with worker information
        const reviews = bookingsWithReviews.map((booking) => {
            const worker = workersMap.get(booking.workerId.toString());
            const serviceDetails = booking.workerServiceId;

            return {
                _id: booking._id,
                rating: booking.review.rating,
                comment: booking.review.comment,
                reviewedAt: booking.review.reviewedAt,
                worker: {
                    _id: worker._id,
                    name: worker.name,
                    phone: worker.phone,
                    email: worker.email,
                    address: worker.address,
                    workerProfile: worker.workerProfile,
                },
                customer: {
                    name: booking.customerId.name,
                    phone: booking.customerId.phone,
                    email: booking.customerId.email,
                    address: booking.customerId.address,
                },
                service: {
                    serviceName: serviceDetails?.details || "Service",
                    skillName: "General Service",
                    price: serviceDetails?.price,
                    estimatedDuration: serviceDetails?.estimatedDuration,
                    pricingType: serviceDetails?.pricingType,
                },
                bookingDate: booking.bookingDate,
                createdAt: booking.createdAt,
            };
        });

        res.status(200).json({
            success: true,
            data: {
                reviews,
                workers: agentWorkers,
            },
        });
    } catch (error) {
        console.error("Get all agent worker reviews error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch reviews",
            error: error.message,
        });
    }
};

// Handle review actions (flag, resolve, etc.)
export const handleReviewAction = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { action, notes } = req.body;
        const serviceAgentId = req.user._id;

        // Find the booking with review
        const booking = await Booking.findOne({
            _id: reviewId,
            "review.rating": { $exists: true },
        }).populate("workerId");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
            });
        }

        // Verify the worker belongs to this service agent
        const worker = await User.findOne({
            _id: booking.workerId._id,
            role: "WORKER",
            "workerProfile.createdBy": serviceAgentId,
        });

        if (!worker) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to perform action on this review",
            });
        }

        // Add action to review (you might want to extend your review schema for this)
        // For now, we'll just log the action
        console.log(`Review action taken by agent ${serviceAgentId}:`, {
            reviewId,
            action,
            notes,
            workerId: worker._id,
            timestamp: new Date(),
        });

        // You can extend your review schema to store actions:
        // review.actions.push({ action, notes, takenBy: serviceAgentId, timestamp: new Date() })

        res.status(200).json({
            success: true,
            message: `Review ${action} successfully`,
            data: {
                reviewId,
                action,
                notes,
            },
        });
    } catch (error) {
        console.error("Review action error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process review action",
            error: error.message,
        });
    }
};
