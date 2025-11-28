import { Booking } from "../models/booking.model.js";
import { WorkerService } from "../models/workerService.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import {
    sendBookingAcceptedEmail,
    sendBookingRequestEmail,
    sendServiceOTPEmail,
} from "../utils/email.js";

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

        // Send booking request email to worker
        try {
            await sendBookingRequestEmail(
                worker.email, // Worker email
                worker.name, // Worker name
                req.user.name, // Customer name
                workerService.serviceName || "Service", // Service name
                bookingDate, // Booking date
                bookingTime, // Booking time
                price, // Price
                booking._id.toString(), // Booking ID
                req.user.phone, // Customer phone
                req.user.address // Customer address
            );
            console.log("Booking request email sent to worker successfully");
        } catch (emailError) {
            console.error("Failed to send booking request email:", emailError);
            // Don't fail the booking creation if email fails
        }

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
            .populate(
                "workerId",
                "name phone email address workerProfile.verification.selfieUrl"
            )
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

        const booking = await Booking.findOne({ _id: bookingId })
            .populate("customerId", "name phone email address")
            .populate("workerId", "name phone email workerProfile")
            .populate("workerServiceId");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Authorization checks
        if (status === "CANCELLED" && !booking.customerId._id.equals(userId)) {
            return res.status(403).json({
                success: false,
                message: "Only customer can cancel booking",
            });
        }

        if (
            ["ACCEPTED", "DECLINED", "COMPLETED"].includes(status) &&
            !booking.workerId._id.equals(userId)
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

        // Store old status for email logic
        const oldStatus = booking.status;

        // Update booking
        booking.status = status;

        if (status === "DECLINED") {
            booking.declineReason = reason;
        } else if (status === "CANCELLED") {
            booking.cancellationReason = reason;
        }

        await booking.save();

        // Send email notifications based on status change
        try {
            if (status === "ACCEPTED" && oldStatus === "PENDING") {
                // Send booking accepted email to customer
                await sendBookingAcceptedEmail(
                    booking.customerId.email,
                    booking.customerId.name,
                    booking.workerId.name,
                    booking.workerServiceId?.serviceName || "Service",
                    booking.bookingDate,
                    booking.bookingTime,
                    booking.price,
                    booking._id.toString(),
                    booking.workerId.phone,
                    {
                        experience:
                            booking.workerId.workerProfile?.experience ||
                            "Not specified",
                        rating:
                            booking.workerId.workerProfile?.rating ||
                            "New worker",
                        completedJobs:
                            booking.workerId.workerProfile?.completedJobs || 0,
                    }
                );
                console.log("Booking accepted email sent to customer");
            }

            // You can add more email notifications for other status changes here
            // For example:
            // if (status === "DECLINED") {
            //     await sendBookingDeclinedEmail(...);
            // }
            // if (status === "COMPLETED") {
            //     await sendBookingCompletedEmail(...);
            // }
        } catch (emailError) {
            console.error("Failed to send status update email:", emailError);
            // Don't fail the status update if email fails
        }

        // Re-populate to get fresh data
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

const calculateEndTime = (startTime, durationMinutes) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const startTotalMinutes = hours * 60 + minutes;
    const endTotalMinutes = startTotalMinutes + durationMinutes;

    const endHours = Math.floor(endTotalMinutes / 60);
    const endMinutes = endTotalMinutes % 60;

    return `${endHours.toString().padStart(2, "0")}:${endMinutes
        .toString()
        .padStart(2, "0")}`;
};

// Get available time slots for the whole week based on service duration
export const getAvailableSlotsForWeek = async (req, res) => {
    try {
        const { workerId } = req.params;
        const { duration } = req.query; // Duration in minutes

        if (!duration) {
            return res.status(400).json({
                success: false,
                message: "Service duration is required",
            });
        }

        const durationMinutes = parseInt(duration);
        if (isNaN(durationMinutes) || durationMinutes <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid duration value",
            });
        }

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

        if (worker.workerProfile?.isSuspended) {
            return res.status(400).json({
                success: false,
                message: "Worker is currently suspended",
            });
        }

        const timetable = worker.workerProfile?.timetable || {};
        const nonAvailability = worker.workerProfile?.nonAvailability || [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            weekDates.push(date);
        }

        const generateTimeSlots = (durationMinutes) => {
            const slots = [];
            const startHour = 9; // 9 AM
            const endHour = 20; // 8 PM

            const slotsPerHour = 60 / durationMinutes;

            for (let hour = startHour; hour < endHour; hour++) {
                for (let slotIndex = 0; slotIndex < slotsPerHour; slotIndex++) {
                    const minute = Math.round(slotIndex * durationMinutes);

                    if (minute < 60) {
                        const timeString = `${hour
                            .toString()
                            .padStart(2, "0")}:${minute
                            .toString()
                            .padStart(2, "0")}`;
                        const displayTime = formatTimeForDisplay(hour, minute);

                        const endTime = calculateEndTime(
                            hour,
                            minute,
                            durationMinutes
                        );
                        const endDisplayTime = formatTimeForDisplay(
                            endTime.hour,
                            endTime.minute
                        );

                        slots.push({
                            time: timeString,
                            displayTime,
                            endTime: endDisplayTime,
                            value: timeString,
                            duration: durationMinutes,
                        });
                    }
                }
            }

            // Add last slot at endHour if it fits entirely
            const lastSlotHour = endHour;
            const lastSlotMinute = 0;
            const lastSlotEndTime = calculateEndTime(
                lastSlotHour,
                lastSlotMinute,
                durationMinutes
            );

            if (
                lastSlotEndTime.hour < endHour ||
                (lastSlotEndTime.hour === endHour &&
                    lastSlotEndTime.minute === 0)
            ) {
                const timeString = `${lastSlotHour
                    .toString()
                    .padStart(2, "0")}:${lastSlotMinute
                    .toString()
                    .padStart(2, "0")}`;
                const displayTime = formatTimeForDisplay(
                    lastSlotHour,
                    lastSlotMinute
                );
                const endDisplayTime = formatTimeForDisplay(
                    lastSlotEndTime.hour,
                    lastSlotEndTime.minute
                );

                slots.push({
                    time: timeString,
                    displayTime,
                    endTime: endDisplayTime,
                    value: timeString,
                    duration: durationMinutes,
                });
            }

            return slots;
        };

        const calculateEndTime = (startHour, startMinute, duration) => {
            const totalStartMinutes = startHour * 60 + startMinute;
            const totalEndMinutes = totalStartMinutes + duration;
            const endHour = Math.floor(totalEndMinutes / 60);
            const endMinute = totalEndMinutes % 60;
            return { hour: endHour, minute: endMinute };
        };

        const formatTimeForDisplay = (hour, minute) => {
            const period = hour >= 12 ? "PM" : "AM";
            const displayHour = hour > 12 ? hour - 12 : hour;
            const finalHour = displayHour === 0 ? 12 : displayHour;
            return `${finalHour}:${minute
                .toString()
                .padStart(2, "0")} ${period}`;
        };

        const allTimeSlots = generateTimeSlots(durationMinutes);

        const getDayName = (date) => {
            const days = [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
            ];
            return days[date.getDay()];
        };

        const getFormattedDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };

        const isWithinWorkingHours = (
            dayName,
            startTime,
            durationMinutes,
            workerTimetable
        ) => {
            const daySchedule = workerTimetable[dayName];
            if (!daySchedule || daySchedule.length === 0) return false;

            const [startHour, startMinute] = startTime.split(":").map(Number);
            const startTotalMinutes = startHour * 60 + startMinute;
            const endTotalMinutes = startTotalMinutes + durationMinutes;

            for (const period of daySchedule) {
                if (period.start && period.end) {
                    const [periodStartHour, periodStartMinute] = period.start
                        .split(":")
                        .map(Number);
                    const [periodEndHour, periodEndMinute] = period.end
                        .split(":")
                        .map(Number);

                    const periodStartMinutes =
                        periodStartHour * 60 + periodStartMinute;
                    const periodEndMinutes =
                        periodEndHour * 60 + periodEndMinute;

                    if (
                        startTotalMinutes >= periodStartMinutes &&
                        endTotalMinutes <= periodEndMinutes
                    ) {
                        return true;
                    }
                }
            }
            return false;
        };

        const isNonAvailable = (
            date,
            startTime,
            durationMinutes,
            nonAvailabilityPeriods
        ) => {
            const slotStart = new Date(date);
            const [startHour, startMinute] = startTime.split(":").map(Number);
            slotStart.setHours(startHour, startMinute, 0, 0);

            const slotEnd = new Date(slotStart);
            slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

            for (const period of nonAvailabilityPeriods) {
                if (!period.startDateTime || !period.endDateTime) continue;
                // overlap test
                if (
                    slotStart < period.endDateTime &&
                    slotEnd > period.startDateTime
                ) {
                    return true;
                }
            }
            return false;
        };

        // --- NEW / IMPROVED: getBookingsForWeek and overlap logic ---
        const getBookingsForWeek = async (workerId, weekStartDate) => {
            const weekEndDate = new Date(weekStartDate);
            weekEndDate.setDate(weekEndDate.getDate() + 7);

            // Only consider bookings that block worker time (modify statuses if needed)
            const bookings = await Booking.find({
                workerId: workerId,
                bookingDate: {
                    $gte: weekStartDate,
                    $lt: weekEndDate,
                },
                // these are statuses that should block time; adjust if your app requires different statuses
                status: { $in: ["PENDING", "ACCEPTED", "PAYMENT_PENDING"] },
            })
                .populate({
                    path: "workerServiceId",
                    select: "estimatedDuration",
                })
                .select("bookingDate bookingTime workerServiceId status");

            // Map into standardized start/end Date objects using actual estimatedDuration when available
            const bookingsWithDuration = bookings.map((b) => {
                const bookingDateOnly = new Date(b.bookingDate);
                bookingDateOnly.setHours(0, 0, 0, 0);

                // Build full start datetime using bookingTime
                const [bhours, bminutes] = (b.bookingTime || "00:00")
                    .split(":")
                    .map(Number);
                const start = new Date(bookingDateOnly);
                start.setHours(bhours, bminutes, 0, 0);

                // Use the service's estimatedDuration if present, otherwise fallback to requested durationMinutes
                const actualDuration =
                    b.workerServiceId?.estimatedDuration || durationMinutes;

                const end = new Date(start);
                end.setMinutes(end.getMinutes() + actualDuration);

                return {
                    start,
                    end,
                    duration: actualDuration,
                    rawStatus: b.status,
                };
            });

            return bookingsWithDuration;
        };

        // Overlap check (canonical): two intervals overlap if slotStart < bookingEnd && slotEnd > bookingStart
        const isSlotBooked = (
            date,
            startTime,
            durationMinutes,
            allBookings
        ) => {
            const slotStart = new Date(date);
            const [startHour, startMinute] = startTime.split(":").map(Number);
            slotStart.setHours(startHour, startMinute, 0, 0);

            const slotEnd = new Date(slotStart);
            slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

            // Filter bookings to same day (quick filter) and then do canonical overlap
            const targetDayStart = new Date(date);
            targetDayStart.setHours(0, 0, 0, 0);
            const targetDayEnd = new Date(targetDayStart);
            targetDayEnd.setDate(targetDayEnd.getDate() + 1);

            for (const booking of allBookings) {
                // quick day filter
                if (
                    booking.start >= targetDayEnd ||
                    booking.end <= targetDayStart
                ) {
                    continue;
                }

                // canonical overlap test
                if (slotStart < booking.end && slotEnd > booking.start) {
                    return true;
                }
            }
            return false;
        };
        // --- END improvements ---

        const allBookingsForWeek = await getBookingsForWeek(workerId, today);

        const availableSlotsByDay = [];

        for (const date of weekDates) {
            const dayName = getDayName(date);
            const formattedDate = getFormattedDate(date);

            const daySlots = allTimeSlots.filter((slot) => {
                if (
                    !isWithinWorkingHours(
                        dayName,
                        slot.time,
                        durationMinutes,
                        timetable
                    )
                ) {
                    return false;
                }

                if (
                    isNonAvailable(
                        date,
                        slot.time,
                        durationMinutes,
                        nonAvailability
                    )
                ) {
                    return false;
                }

                if (
                    isSlotBooked(
                        date,
                        slot.time,
                        durationMinutes,
                        allBookingsForWeek
                    )
                ) {
                    return false;
                }

                return true;
            });

            availableSlotsByDay.push({
                date: formattedDate,
                day: dayName,
                availableSlots: daySlots.map((slot) => ({
                    time: slot.time,
                    displayTime: slot.displayTime,
                    endTime: slot.endTime,
                    value: slot.value,
                    duration: durationMinutes,
                })),
            });
        }

        console.log(
            "Generated available slots for duration:",
            durationMinutes,
            "minutes"
        );
        console.log("Total slots generated:", allTimeSlots.length);
        console.log(
            "Total bookings found for the week:",
            allBookingsForWeek.length
        );

        res.status(200).json({
            success: true,
            data: {
                duration: durationMinutes,
                slotInterval: durationMinutes,
                availableSlots: availableSlotsByDay,
                workerAvailability:
                    worker.workerProfile?.availabilityStatus || "available",
                totalBookingsInWeek: allBookingsForWeek.length,
            },
        });
    } catch (error) {
        console.error("Error fetching available slots for week:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch available time slots",
            error: error.message,
        });
    }
};

const getFormattedDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
