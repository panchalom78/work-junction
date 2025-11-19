import { Booking } from "../models/booking.model.js";
import { WorkerService } from "../models/workerService.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import { sendServiceOTPEmail } from "../utils/email.js";

/**
 * @route POST /api/bookings
 * @description Create a new booking
 * @access Private (Customer)
 */
export const createBooking = async (req, res) => {
    try {
        const {
            workerId,
            workerServiceId,
            serviceId,
            bookingDate,
            bookingTime,
            price,
            paymentType = "CASH",
        } = req.body;

        const customerId = req.user._id; // From auth middleware

        // Validate required fields
        if (
            !workerId ||
            !workerServiceId ||
            !serviceId ||
            !bookingDate ||
            !bookingTime ||
            !price
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Validate worker exists and is verified
        const worker = await User.findOne({
            _id: workerId,
            role: "WORKER",
            "workerProfile.verification.status": "APPROVED",
        });

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found or not verified",
            });
        }

        // Validate worker service exists
        const workerService = await WorkerService.findOne({
            _id: workerServiceId,
            workerId: workerId,
            isActive: true,
        });

        if (!workerService) {
            return res.status(404).json({
                success: false,
                message: "Service not found or not available",
            });
        }

        // Check if worker is available at the requested time
        const existingBooking = await Booking.findOne({
            workerId,
            bookingDate: new Date(bookingDate),
            bookingTime,
            status: { $in: ["PENDING", "ACCEPTED"] },
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: "Worker is not available at the selected time",
            });
        }

        // Create booking
        const booking = new Booking({
            customerId,
            workerId,
            workerServiceId,
            serviceId,
            bookingDate: new Date(bookingDate),
            bookingTime,
            price,
        });

        await booking.save();

        // Populate the booking with user details
        const populatedBooking = await Booking.findById(booking._id)
            .populate("customerId", "name phone email")
            .populate("workerId", "name phone email address")
            .populate("workerServiceId");

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: populatedBooking,
        });
    } catch (error) {
        console.error("Create Booking Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create booking",
            error: error.message,
        });
    }
};

/**
 * @route GET /api/bookings/customer
 * @description Get all bookings for a customer
 * @access Private (Customer)
 */
export const getCustomerBookings = async (req, res) => {
    try {
        const customerId = req.user._id;
        const { status, page = 1, limit = 10 } = req.query;

        const query = { customerId };
        if (status) {
            query.status = status;
        }

        const bookings = await Booking.find(query)
            .populate("workerId", "name phone email address")
            .populate("workerServiceId")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Booking.countDocuments(query);

        res.status(200).json({
            success: true,
            data: bookings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get Customer Bookings Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve bookings",
            error: error.message,
        });
    }
};

/**
 * @route GET /api/bookings/worker
 * @description Get all bookings for a worker
 * @access Private (Worker)
 */
export const getWorkerBookings = async (req, res) => {
    try {
        const workerId = req.user._id;
        const { status, page = 1, limit = 10 } = req.query;

        const query = { workerId };
        if (status) {
            query.status = status;
        }

        const bookings = await Booking.find(query)
            .populate("customerId", "name phone email address")
            .populate("workerServiceId")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Booking.countDocuments(query);

        res.status(200).json({
            success: true,
            data: bookings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get Worker Bookings Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve bookings",
            error: error.message,
        });
    }
};

/**
 * @route GET /api/bookings/:bookingId
 * @description Get booking details by ID
 * @access Private (Customer/Worker involved in booking)
 */
export const getBookingById = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user._id;

        const booking = await Booking.findOne({
            _id: bookingId,
            $or: [{ customerId: userId }, { workerId: userId }],
        })
            .populate("customerId", "name phone email address")
            .populate("workerId", "name phone email address workerProfile")
            .populate("workerServiceId");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        res.status(200).json({
            success: true,
            data: booking,
        });
    } catch (error) {
        console.error("Get Booking Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve booking",
            error: error.message,
        });
    }
};

/**
 * @route PATCH /api/bookings/:bookingId/status
 * @description Update booking status (Accept/Decline/Complete/Cancel)
 * @access Private (Worker for accept/decline/complete, Customer for cancel)
 */
export const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status, reason } = req.body;
        const userId = req.user._id;

        const validStatuses = [
            "ACCEPTED",
            "DECLINED",
            "COMPLETED",
            "CANCELLED",
        ];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status",
            });
        }

        const booking = await Booking.findOne({ _id: bookingId });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Authorization checks
        if (status === "CANCELLED" && !booking.customerId.equals(userId)) {
            return res.status(403).json({
                success: false,
                message: "Only customer can cancel booking",
            });
        }

        if (
            ["ACCEPTED", "DECLINED", "COMPLETED"].includes(status) &&
            !booking.workerId.equals(userId)
        ) {
            return res.status(403).json({
                success: false,
                message: "Only worker can update booking status",
            });
        }

        // Status transition validation
        if (status === "ACCEPTED" && booking.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: "Only pending bookings can be accepted",
            });
        }

        if (status === "DECLINED" && booking.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: "Only pending bookings can be declined",
            });
        }

        if (status === "COMPLETED" && booking.status !== "ACCEPTED") {
            return res.status(400).json({
                success: false,
                message: "Only accepted bookings can be completed",
            });
        }

        if (
            status === "CANCELLED" &&
            !["PENDING", "ACCEPTED"].includes(booking.status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Only pending or accepted bookings can be cancelled",
            });
        }

        // Update booking
        booking.status = status;

        if (status === "DECLINED") {
            booking.declineReason = reason;
        } else if (status === "CANCELLED") {
            booking.cancellationReason = reason;
        }

        await booking.save();

        const populatedBooking = await Booking.findById(booking._id)
            .populate("customerId", "name phone email")
            .populate("workerId", "name phone email")
            .populate("workerServiceId");

        res.status(200).json({
            success: true,
            message: `Booking ${status.toLowerCase()} successfully`,
            data: populatedBooking,
        });
    } catch (error) {
        console.error("Update Booking Status Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update booking status",
            error: error.message,
        });
    }
};

/**
 * @route POST /api/bookings/:bookingId/review
 * @description Add review to completed booking
 * @access Private (Customer)
 */
export const addBookingReview = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { rating, comment } = req.body;
        const customerId = req.user._id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5",
            });
        }

        const booking = await Booking.findOne({
            _id: bookingId,
            customerId,
            status: "COMPLETED",
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Completed booking not found",
            });
        }

        if (booking.review) {
            return res.status(400).json({
                success: false,
                message: "Review already submitted for this booking",
            });
        }

        booking.review = {
            rating,
            comment,
            reviewedAt: new Date(),
        };

        await booking.save();

        res.status(200).json({
            success: true,
            message: "Review submitted successfully",
            data: booking,
        });
    } catch (error) {
        console.error("Add Review Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit review",
            error: error.message,
        });
    }
};

/**
 * @route GET /api/bookings/worker/:workerId/availability
 * @description Check worker availability for a specific date and time
 * @access Public
 */
export const checkWorkerAvailability = async (req, res) => {
    try {
        const { workerId } = req.params;
        const { date, time } = req.query;

        if (!date || !time) {
            return res.status(400).json({
                success: false,
                message: "Date and time are required",
            });
        }

        const existingBooking = await Booking.findOne({
            workerId,
            bookingDate: new Date(date),
            bookingTime: time,
            status: { $in: ["PENDING", "ACCEPTED"] },
        });

        res.status(200).json({
            success: true,
            data: {
                available: !existingBooking,
                existingBooking: existingBooking
                    ? {
                          id: existingBooking._id,
                          time: existingBooking.bookingTime,
                      }
                    : null,
            },
        });
    } catch (error) {
        console.error("Check Availability Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to check availability",
            error: error.message,
        });
    }
};

// controllers/customer-booking.controller.js - Add these methods

/**
 * @route POST /api/bookings/:bookingId/initiate-service
 * @description Worker initiates service by sending OTP to customer
 * @access Private (Worker)
 */
export const initiateService = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const workerId = req.user._id;

        const booking = await Booking.findOne({
            _id: bookingId,
            workerId: workerId,
            status: "ACCEPTED",
        }).populate("customerId", "name email phone");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found or not authorized",
            });
        }

        // Check if service is already initiated
        if (booking.serviceInitiated) {
            return res.status(400).json({
                success: false,
                message: "Service already initiated",
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Update booking with OTP
        booking.serviceOtp = otp;
        booking.serviceOtpExpires = otpExpires;
        booking.serviceInitiated = true;
        booking.serviceInitiatedAt = new Date();
        await booking.save();

        // Send OTP email to customer
        try {
            await sendServiceOTPEmail(
                booking.customerId.email,
                otp,
                booking.customerId.name,
                workerId.name || "Service Professional"
            );
        } catch (emailError) {
            console.error("Failed to send OTP email:", emailError);
            // Continue even if email fails
        }

        // Also send SMS if you have SMS service integrated
        // await sendServiceOTPSMS(booking.customerId.phone, otp);

        res.status(200).json({
            success: true,
            message: "OTP sent to customer successfully",
            data: {
                bookingId: booking._id,
                customerName: booking.customerId.name,
                customerPhone: booking.customerId.phone,
                otpExpires: otpExpires,
            },
        });
    } catch (error) {
        console.error("Initiate Service Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to initiate service",
            error: error.message,
        });
    }
};

/**
 * @route POST /api/bookings/:bookingId/verify-service-otp
 * @description Worker verifies OTP to start service
 * @access Private (Worker)
 */
export const verifyServiceOtp = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { otp } = req.body;
        const workerId = req.user._id;

        if (!otp) {
            return res.status(400).json({
                success: false,
                message: "OTP is required",
            });
        }

        const booking = await Booking.findOne({
            _id: bookingId,
            workerId: workerId,
            status: "ACCEPTED",
            serviceInitiated: true,
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found or service not initiated",
            });
        }

        // Check if OTP is expired
        if (new Date() > booking.serviceOtpExpires) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please initiate service again.",
            });
        }

        // Verify OTP
        if (booking.serviceOtp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        // OTP verified successfully - start service
        booking.serviceStartedAt = new Date();
        booking.serviceOtp = undefined; // Clear OTP after verification
        booking.serviceOtpExpires = undefined;
        await booking.save();

        res.status(200).json({
            success: true,
            message: "Service started successfully",
            data: {
                bookingId: booking._id,
                serviceStartedAt: booking.serviceStartedAt,
                customerId: booking.customerId,
            },
        });
    } catch (error) {
        console.error("Verify Service OTP Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify OTP",
            error: error.message,
        });
    }
};

/**
 * @route POST /api/bookings/:bookingId/complete-service
 * @description Worker marks service as completed
 * @access Private (Worker)
 */
export const completeService = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const workerId = req.user._id;

        const booking = await Booking.findOne({
            _id: bookingId,
            workerId: workerId,
            status: "ACCEPTED",
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Check if service was started
        if (!booking.serviceStartedAt) {
            return res.status(400).json({
                success: false,
                message: "Service must be started before completion",
            });
        }

        // Update booking status to completed
        booking.status = "PAYMENT_PENDING";
        booking.serviceCompletedAt = new Date();

        await booking.save();

        const populatedBooking = await Booking.findById(booking._id)
            .populate("customerId", "name phone email")
            .populate("workerId", "name phone email")
            .populate("workerServiceId");

        res.status(200).json({
            success: true,
            message: "Service completed successfully",
            data: populatedBooking,
        });
    } catch (error) {
        console.error("Complete Service Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to complete service",
            error: error.message,
        });
    }
};

// Add this to your booking controller

/**
 * @route PATCH /api/bookings/:bookingId/price
 * @description Update booking price (for additional charges/discounts)
 * @access Private (Worker)
 */
export const updateBookingPrice = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { newPrice, reason = "" } = req.body;
        const workerId = req.user._id;

        if (!newPrice || newPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid price is required",
            });
        }

        const booking = await Booking.findOne({
            _id: bookingId,
            workerId: workerId,
            status: { $in: ["ACCEPTED", "PAYMENT_PENDING"] },
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found or not authorized",
            });
        }

        // // Store original price if this is the first update
        // if (!booking.originalPrice) {
        //     booking.originalPrice = booking.price;
        // }

        // Update price and reason
        booking.price = newPrice;
        // booking.priceUpdateReason = reason;

        // If payment was already completed, reset payment status
        if (booking.payment?.status === "COMPLETED") {
            booking.payment.status = "PENDING";
            booking.status = "PAYMENT_PENDING";
        }

        await booking.save();

        const populatedBooking = await Booking.findById(booking._id)
            .populate("customerId", "name phone email")
            .populate("workerId", "name phone email")
            .populate("workerServiceId");

        res.status(200).json({
            success: true,
            message: "Booking price updated successfully",
            data: populatedBooking,
        });
    } catch (error) {
        console.error("Update Booking Price Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update booking price",
            error: error.message,
        });
    }
};
