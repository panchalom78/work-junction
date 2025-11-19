// controllers/payment.controller.js
import { Booking } from "../models/booking.model.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import mongoose from "mongoose";
import {
    sendCashPaymentConfirmationEmail,
    sendCashPaymentOTPEmail,
} from "../utils/email.js";

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create Razorpay Order
 */
export const createRazorpayOrder = async (req, res) => {
    try {
        const { bookingId, amount, currency = "INR" } = req.body;
        const customerId = req.user._id;

        // Validate inputs
        if (!bookingId || !amount) {
            return res.status(400).json({
                success: false,
                message: "Booking ID and amount are required",
            });
        }

        // Verify booking exists and belongs to customer
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

        // Check if booking is in valid state for payment
        if (!["PAYMENT_PENDING"].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message: "Payment cannot be processed for this booking status",
            });
        }

        // Create Razorpay order
        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency: currency,
            receipt: `booking_${bookingId}`,
            notes: {
                bookingId: bookingId.toString(),
                customerId: customerId.toString(),
            },
        };

        const order = await razorpay.orders.create(options);

        // Update booking with payment details
        await Booking.findByIdAndUpdate(bookingId, {
            payment: {
                paymentId: order.id,
                amount: amount,
                status: "PENDING",
                paymentType: "RAZORPAY",
                transactionId: null,
                transactionDate: null,
            },
        });

        res.status(200).json({
            success: true,
            message: "Razorpay order created successfully",
            data: {
                orderId: order.id,
                amount: order.amount,
                currency: order.currency,
                key: process.env.RAZORPAY_KEY_ID,
            },
        });
    } catch (error) {
        console.error("Create Razorpay Order Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create payment order",
            error: error.message,
        });
    }
};

/**
 * Verify Razorpay Payment
 */
export const verifyRazorpayPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            bookingId,
        } = req.body;

        // Validate inputs
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing payment verification details",
            });
        }

        // Generate signature for verification
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        // Verify signature
        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed - invalid signature",
            });
        }

        // Update booking with successful payment
        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            {
                "payment.status": "COMPLETED",
                "payment.transactionId": razorpay_payment_id,
                "payment.transactionDate": new Date(),
                status: "COMPLETED", // Move booking to accepted status
            },
            { new: true }
        ).populate("workerId", "name phone");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            data: {
                bookingId: booking._id,
                paymentId: razorpay_payment_id,
                amount: booking.payment.amount,
                status: booking.payment.status,
            },
        });
    } catch (error) {
        console.error("Verify Razorpay Payment Error:", error);
        res.status(500).json({
            success: false,
            message: "Payment verification failed",
            error: error.message,
        });
    }
};

/**
 * Initiate Cash Payment with OTP
 */
export const initiateCashPayment = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const customerId = req.user._id;

        // Validate inputs
        if (!bookingId) {
            return res.status(400).json({
                success: false,
                message: "Booking ID is required",
            });
        }

        // Verify booking exists and belongs to customer
        const booking = await Booking.findOne({
            _id: bookingId,
            customerId: customerId,
        }).populate("workerId", "name phone email");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Check if booking is in valid state for cash payment
        if (!["PAYMENT_PENDING"].includes(booking.status)) {
            return res.status(400).json({
                success: false,
                message:
                    "Cash payment cannot be processed for this booking status",
            });
        }

        // Generate OTP for cash payment verification
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 30 * 60 * 1000); // OTP expires in 30 minutes

        // Update booking with cash payment details and OTP
        await Booking.findByIdAndUpdate(bookingId, {
            payment: {
                paymentId: new mongoose.Types.ObjectId(),
                amount: booking.price,
                status: "PENDING",
                paymentType: "CASH",
                transactionId: null,
                transactionDate: null,
            },
            serviceOtp: otp,
            serviceOtpExpires: otpExpires,
        });

        // TODO: Send OTP to worker via SMS/Email
        console.log(`Cash Payment OTP for booking ${bookingId}: ${otp}`);

        await sendCashPaymentOTPEmail(
            booking.workerId.email,
            otp,
            booking.workerId.name,
            req.user.name,
            booking.price,
            booking._id
        );
        // await sendSMS(booking.workerId.phone, `Your cash payment OTP is: ${otp}`);

        res.status(200).json({
            success: true,
            message: "Cash payment initiated successfully",
            data: {
                bookingId: booking._id,
                amount: booking.price,
                paymentType: "CASH",
                otpSent: true,
                workerName: booking.workerId.name,
                workerPhone: booking.workerId.phone,
            },
        });
    } catch (error) {
        console.error("Initiate Cash Payment Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to initiate cash payment",
            error: error.message,
        });
    }
};

/**
 * Verify Cash Payment with OTP
 */
export const verifyCashPayment = async (req, res) => {
    try {
        const { bookingId, otp } = req.body;
        const customerId = req.user._id;

        // Validate inputs
        if (!bookingId || !otp) {
            return res.status(400).json({
                success: false,
                message: "Booking ID and OTP are required",
            });
        }

        // Verify booking exists and belongs to customer
        const booking = await Booking.findOne({
            _id: bookingId,
            customerId: customerId,
        }).populate("workerId", "name email");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Check if OTP exists and is not expired
        if (!booking.serviceOtp || !booking.serviceOtpExpires) {
            return res.status(400).json({
                success: false,
                message: "No active OTP found for this booking",
            });
        }

        if (new Date() > booking.serviceOtpExpires) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired",
            });
        }

        // Verify OTP
        if (booking.serviceOtp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        // Update booking with completed cash payment
        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            {
                "payment.status": "COMPLETED",
                "payment.transactionDate": new Date(),
                serviceOtp: null,
                serviceOtpExpires: null,
                status: "COMPLETED",
            },
            { new: true }
        ).populate("workerId", "name phone");
        await sendCashPaymentConfirmationEmail(
            booking.workerId.email,
            booking.workerId.name,
            req.user.name,
            updatedBooking.payment.amount,
            updatedBooking.__id,
            updatedBooking.payment.transactionId
        );

        res.status(200).json({
            success: true,
            message: "Cash payment verified successfully",
            data: {
                bookingId: updatedBooking._id,
                amount: updatedBooking.payment.amount,
                status: updatedBooking.payment.status,
                transactionDate: updatedBooking.payment.transactionDate,
            },
        });
    } catch (error) {
        console.error("Verify Cash Payment Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify cash payment",
            error: error.message,
        });
    }
};

/**
 * Get Payment Status
 */
export const getPaymentStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const customerId = req.user._id;

        // Verify booking exists and belongs to customer
        const booking = await Booking.findOne({
            _id: bookingId,
            customerId: customerId,
        }).select("payment status price");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                bookingId: booking._id,
                payment: booking.payment,
                bookingStatus: booking.status,
                price: booking.price,
            },
        });
    } catch (error) {
        console.error("Get Payment Status Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch payment status",
            error: error.message,
        });
    }
};

/**
 * Razorpay Webhook Handler
 */
export const razorpayWebhook = async (req, res) => {
    try {
        const webhookSignature = req.headers["x-razorpay-signature"];
        const webhookBody = JSON.stringify(req.body);

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(webhookBody)
            .digest("hex");

        if (webhookSignature !== expectedSignature) {
            console.error("Invalid webhook signature");
            return res.status(400).json({ status: "error" });
        }

        const { event, payload } = req.body;

        // Handle different payment events
        switch (event) {
            case "payment.captured":
                await handleSuccessfulPayment(payload.payment.entity);
                break;

            case "payment.failed":
                await handleFailedPayment(payload.payment.entity);
                break;

            default:
                console.log(`Unhandled webhook event: ${event}`);
        }

        res.status(200).json({ status: "ok" });
    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).json({ status: "error" });
    }
};

// Helper function to handle successful payment
const handleSuccessfulPayment = async (payment) => {
    try {
        const booking = await Booking.findOne({
            "payment.paymentId": payment.order_id,
        });

        if (booking) {
            await Booking.findByIdAndUpdate(booking._id, {
                "payment.status": "COMPLETED",
                "payment.transactionId": payment.id,
                "payment.transactionDate": new Date(payment.created_at * 1000),
                status: "ACCEPTED",
            });
        }
    } catch (error) {
        console.error("Handle Successful Payment Error:", error);
    }
};

// Helper function to handle failed payment
const handleFailedPayment = async (payment) => {
    try {
        const booking = await Booking.findOne({
            "payment.paymentId": payment.order_id,
        });

        if (booking) {
            await Booking.findByIdAndUpdate(booking._id, {
                "payment.status": "FAILED",
                "payment.transactionId": payment.id,
            });
        }
    } catch (error) {
        console.error("Handle Failed Payment Error:", error);
    }
};

export default {
    createRazorpayOrder,
    verifyRazorpayPayment,
    initiateCashPayment,
    verifyCashPayment,
    getPaymentStatus,
    razorpayWebhook,
};
