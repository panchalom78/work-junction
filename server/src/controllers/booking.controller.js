import { Booking } from "../models/booking.model.js";
import { WorkerService } from "../models/workerService.model.js";
import User from "../models/user.model.js";
import { Skill } from "../models/skill.model.js";
import mongoose from "mongoose";


export const getWorkerById = async (req, res) => {
    try {
        const { workerId } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid worker ID",
            });
        }

        // Fetch worker details
        const worker = await User.findOne({
            _id: workerId,
            role: "WORKER",
        }).select("name email phone address workerProfile");

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        // Fetch all worker services for this worker
        const workerServices = await WorkerService.find({
            workerId: workerId,
            isActive: true,
        }).populate('skillId', 'name services');

        if (workerServices.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No active services found for this worker",
            });
        }

        // Use the first service (or you can modify logic to select specific service)
        const primaryService = workerServices[0];
        const skill = primaryService.skillId;
        const service = skill.services.find(
            s => s.serviceId.toString() === primaryService.serviceId.toString()
        );

        // Get worker's availability status
        const availability = {
            status: worker.workerProfile?.availabilityStatus || "available",
            timetable: worker.workerProfile?.timetable || {},
            nonAvailability: worker.workerProfile?.nonAvailability || [],
        };

        // Calculate average rating from bookings
        const ratingStats = await Booking.aggregate([
            {
                $match: {
                    workerId: new mongoose.Types.ObjectId(workerId),
                    "review.rating": { $exists: true },
                },
            },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: "$review.rating" },
                    totalReviews: { $sum: 1 },
                },
            },
        ]);

        const rating = ratingStats.length > 0 
            ? parseFloat(ratingStats[0].avgRating.toFixed(1))
            : 0;
        
        const reviews = ratingStats.length > 0 
            ? ratingStats[0].totalReviews 
            : 0;

        // Get total completed bookings
        const completedBookings = await Booking.countDocuments({
            workerId: workerId,
            status: "COMPLETED",
        });

        // Construct simplified response matching dashboard data structure
        const workerDetails = {
            id: worker._id,
            workerId: worker._id,
            workerServiceId: primaryService._id,
            serviceId: primaryService.serviceId,
            name: worker.name,
            email: worker.email,
            phone: worker.phone,
            address: worker.address,
            image: worker.profileImage || null,
            
            // Service info
            category: skill.name,
            title: service?.name || "Service",
            description: primaryService.details,
            price: primaryService.price,
            priceAmount: primaryService.price,
            pricingType: primaryService.pricingType,
            
            // Availability
            available: worker.workerProfile?.availabilityStatus === "available",
            availability,

            // Stats
            rating,
            reviews,
            completedBookings,
            experience: `${completedBookings}+ jobs completed`,

            // Location
            location: worker.address?.city 
                ? `${worker.address.city}, ${worker.address.state}` 
                : "Location not specified",

            // Verification status
            isVerified: worker.workerProfile?.verification?.status === "APPROVED",
        };

        res.status(200).json({
            success: true,
            data: workerDetails,
        });
    } catch (error) {
        console.error("Error fetching worker by ID:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch worker details",
            error: error.message,
        });
    }
};
// Get worker details with first active service for booking page
export const getWorkerDetailsForBooking = async (req, res) => {
    try {
        const { workerId } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return res.status(400).json({ success: false, message: "Invalid worker ID" });
        }

        // Fetch worker
        const worker = await User.findOne({ _id: workerId, role: "WORKER" })
            .select("name email phone address workerProfile profileImage");

        if (!worker) {
            return res.status(404).json({ success: false, message: "Worker not found" });
        }

        // Fetch all active services for worker
        const workerServices = await WorkerService.find({ workerId, isActive: true })
            .populate("skillId", "name services");

        if (!workerServices.length) {
            return res.status(404).json({ success: false, message: "No active services found" });
        }

        // Use the first service for simplicity
        const primaryService = workerServices[0];
        const skill = primaryService.skillId;
        const service = skill.services.find(
            s => s.serviceId.toString() === primaryService.serviceId.toString()
        );

        // Availability info
        const availability = {
            status: worker.workerProfile?.availabilityStatus || "available",
            timetable: worker.workerProfile?.timetable || {},
            nonAvailability: worker.workerProfile?.nonAvailability || [],
        };

        // Rating stats
        const ratingStats = await Booking.aggregate([
            { $match: { workerId: new mongoose.Types.ObjectId(workerId), "review.rating": { $exists: true } } },
            { $group: { _id: null, avgRating: { $avg: "$review.rating" }, totalReviews: { $sum: 1 } } },
        ]);

        const rating = ratingStats.length > 0
            ? { average: parseFloat(ratingStats[0].avgRating.toFixed(1)), total: ratingStats[0].totalReviews }
            : { average: 0, total: 0 };

        const completedBookings = await Booking.countDocuments({ workerId, status: "COMPLETED" });

        // Construct response
        const workerDetails = {
            id: worker._id,
            name: worker.name,
            email: worker.email,
            phone: worker.phone,
            address: worker.address,
            image: worker.profileImage || null,

            // Service info
            service: {
                id: primaryService._id,
                skillName: skill.name,
                serviceName: service?.name || "Service",
                serviceId: primaryService.serviceId,
                details: primaryService.details,
                pricingType: primaryService.pricingType,
                price: primaryService.price,
                portfolioImages: primaryService.portfolioImages || [],
            },

            // Availability
            availability,

            // Stats
            rating,
            completedBookings,

            // Verification
            isVerified: worker.workerProfile?.verification?.status === "APPROVED",
        };

        res.status(200).json({ success: true, data: workerDetails });
    } catch (error) {
        console.error("Error fetching worker details:", error);
        res.status(500).json({ success: false, message: "Failed to fetch worker details", error: error.message });
    }
};


// Check worker availability for specific date and time
export const checkWorkerAvailability = async (req, res) => {
    try {
        const { workerId } = req.params;
        const { bookingDate, bookingTime } = req.body;

        if (!bookingDate || !bookingTime) {
            return res.status(400).json({
                success: false,
                message: "Booking date and time are required",
            });
        }

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid worker ID",
            });
        }

        const worker = await User.findOne({
            _id: workerId,
            role: "WORKER",
        }).select("workerProfile");

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        // Check if worker is available (not busy or off-duty)
        if (worker.workerProfile?.availabilityStatus !== "available") {
            return res.status(200).json({
                success: true,
                available: false,
                reason: `Worker is currently ${worker.workerProfile.availabilityStatus}`,
            });
        }

        // Check non-availability periods
        const requestedDateTime = new Date(`${bookingDate} ${bookingTime}`);
        const nonAvailable = worker.workerProfile?.nonAvailability || [];
        
        for (const period of nonAvailable) {
            if (requestedDateTime >= period.startDateTime && 
                requestedDateTime <= period.endDateTime) {
                return res.status(200).json({
                    success: true,
                    available: false,
                    reason: period.reason || "Worker is not available during this time",
                });
            }
        }

        // Check existing bookings for that time slot
        const existingBooking = await Booking.findOne({
            workerId: workerId,
            bookingDate: new Date(bookingDate),
            bookingTime: bookingTime,
            status: { $in: ["PENDING", "ACCEPTED"] },
        });

        if (existingBooking) {
            return res.status(200).json({
                success: true,
                available: false,
                reason: "This time slot is already booked",
            });
        }

        res.status(200).json({
            success: true,
            available: true,
            message: "Worker is available for this time slot",
        });
    } catch (error) {
        console.error("Error checking availability:", error);
        res.status(500).json({
            success: false,
            message: "Failed to check availability",
            error: error.message,
        });
    }
};

export const createBooking = async (req, res) => {
    try {
        const customerId = req.user._id;
        const {
            workerId,
            bookingDate,
            bookingTime,
            customerName,
            customerEmail,
            customerPhone,
            address,
            pincode,
            additionalNotes,
        } = req.body;

        if (!workerId || !bookingDate || !bookingTime) {
            return res.status(400).json({ success: false, message: "Missing required booking information" });
        }

        if (!customerName || !customerPhone || !address || !pincode) {
            return res.status(400).json({ success: false, message: "Missing customer contact information" });
        }

        // Validate worker
        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return res.status(400).json({ success: false, message: "Invalid worker ID" });
        }

        const worker = await User.findOne({ _id: workerId, role: "WORKER" });
        if (!worker) return res.status(404).json({ success: false, message: "Worker not found" });

        // Fetch first active service
        const workerService = await WorkerService.findOne({ workerId, isActive: true });
        if (!workerService) return res.status(404).json({ success: false, message: "No active services found" });

        // Check for existing booking
        const existingBooking = await Booking.findOne({
            workerId,
            bookingDate: new Date(bookingDate),
            bookingTime,
            status: { $in: ["PENDING", "ACCEPTED"] },
        });
        if (existingBooking) return res.status(409).json({ success: false, message: "This time slot is already booked" });

        // Create booking
        const booking = await Booking.create({
            customerId,
            workerId,
            workerServiceId: workerService._id,
            serviceId: workerService.serviceId,
            bookingDate: new Date(bookingDate),
            bookingTime,
            price: workerService.price,
            status: "PENDING",
            payment: { amount: workerService.price * 1.18, status: "PENDING" },
            customerName,
            customerEmail,
            customerPhone,
            address,
            pincode,
            additionalNotes,
        });

        const populatedBooking = await Booking.findById(booking._id)
            .populate("customerId", "name email phone")
            .populate("workerId", "name email phone")
            .populate("workerServiceId");

        res.status(201).json({ success: true, message: "Booking created successfully", data: populatedBooking });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ success: false, message: "Failed to create booking", error: error.message });
    }
};


// Get customer's bookings
export const getCustomerBookings = async (req, res) => {
    try {
        const customerId = req.user._id;
        const { status, page = 1, limit = 10 } = req.query;

        const query = { customerId };
        if (status) {
            query.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const bookings = await Booking.find(query)
            .populate("workerId", "name email phone address")
            .populate("workerServiceId")
            .sort({ bookingDate: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Booking.countDocuments(query);

        res.status(200).json({
            success: true,
            data: bookings,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    } catch (error) {
        console.error("Error fetching customer bookings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bookings",
            error: error.message,
        });
    }
};

// Get single booking details
export const getBookingDetails = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID",
            });
        }

        const booking = await Booking.findById(bookingId)
            .populate("customerId", "name email phone address")
            .populate("workerId", "name email phone address workerProfile")
            .populate("workerServiceId");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Check if user is authorized to view this booking
        if (booking.customerId._id.toString() !== userId.toString() && 
            booking.workerId._id.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to view this booking",
            });
        }

        res.status(200).json({
            success: true,
            data: booking,
        });
    } catch (error) {
        console.error("Error fetching booking details:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch booking details",
            error: error.message,
        });
    }
};

// Cancel booking (by customer)
export const cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const customerId = req.user._id;
        const { cancellationReason } = req.body;

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID",
            });
        }

        const booking = await Booking.findOne({
            _id: bookingId,
            customerId: customerId,
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Check if booking can be cancelled
        if (booking.status === "COMPLETED") {
            return res.status(400).json({
                success: false,
                message: "Cannot cancel completed booking",
            });
        }

        if (booking.status === "CANCELLED") {
            return res.status(400).json({
                success: false,
                message: "Booking is already cancelled",
            });
        }

        // Update booking status
        booking.status = "cancelled";
        booking.cancellationReason = cancellationReason || "Cancelled by customer";
        await booking.save();

        res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
            data: booking,
        });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({
            success: false,
            message: "Failed to cancel booking",
            error: error.message,
        });
    }
};

// Get available time slots for a worker on a specific date
export const getAvailableTimeSlots = async (req, res) => {
    try {
        const { workerId } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Date is required",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid worker ID",
            });
        }

        // Get all bookings for this worker on this date
        const bookings = await Booking.find({
            workerId: workerId,
            bookingDate: new Date(date),
            status: { $in: ["PENDING", "ACCEPTED"] },
        }).select("bookingTime");

        const bookedSlots = bookings.map(b => b.bookingTime);

        // All possible time slots
        const allTimeSlots = [
            '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
            '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
            '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM',
        ];

        // Filter out booked slots
        const availableSlots = allTimeSlots.filter(
            slot => !bookedSlots.includes(slot)
        );

        res.status(200).json({
            success: true,
            data: {
                date,
                availableSlots,
                bookedSlots,
            },
        });
    } catch (error) {
        console.error("Error fetching available time slots:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch available time slots",
            error: error.message,
        });
    }
};

export default {
    getWorkerDetailsForBooking,
    checkWorkerAvailability,
    createBooking,
    getCustomerBookings,
    getBookingDetails,
    cancelBooking,
    getAvailableTimeSlots,
};