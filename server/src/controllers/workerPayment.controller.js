// controllers/workerPayment.controller.js
import { WorkerPayment } from "../models/workerPayment.model.js";
import { WorkerEarnings } from "../models/workerEarnings.model.js";
import { Booking } from "../models/booking.model.js";
import User from "../models/user.model.js";
import Razorpay from "razorpay";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * @desc    Create worker payment when customer payment is completed
 * @route   POST /api/worker-payments/create
 * @access  Private (System)
 */
export const createWorkerPayment = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { bookingId } = req.body;

        if (!bookingId) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Booking ID is required",
            });
        }

        // Find the booking with completed payment
        const booking = await Booking.findOne({
            _id: bookingId,
            status: "COMPLETED",
            "payment.status": "COMPLETED",
        })
            .populate("workerId")
            .populate("customerId")
            .session(session);

        if (!booking) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: "Completed booking with payment not found",
            });
        }

        // Check if worker payment already exists
        const existingPayment = await WorkerPayment.findOne({
            bookingId: bookingId,
        }).session(session);

        if (existingPayment) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Worker payment already exists for this booking",
            });
        }

        // Check if worker has bank details
        if (
            !booking.workerId.workerProfile?.bankDetails?.accountNumber ||
            !booking.workerId.workerProfile?.bankDetails?.IFSCCode
        ) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Worker bank details not found",
            });
        }

        // Calculate platform fee (15%) and worker amount
        const platformFeePercentage = process.env.PLATFORM_FEE_PERCENTAGE || 15;
        const platformFee = (booking.price * platformFeePercentage) / 100;
        const workerAmount = booking.price - platformFee;

        // Create worker payment record
        const workerPayment = new WorkerPayment({
            workerId: booking.workerId._id,
            customerId: booking.customerId._id,
            bookingId: bookingId,
            amount: booking.price,
            platformFee: platformFee,
            workerAmount: workerAmount,
            status: "PENDING",
            paymentMethod: "BANK_TRANSFER",
            bankDetails: {
                accountNumber:
                    booking.workerId.workerProfile.bankDetails.accountNumber,
                ifscCode: booking.workerId.workerProfile.bankDetails.IFSCCode,
                accountHolderName:
                    booking.workerId.workerProfile.bankDetails
                        .accountHolderName,
                bankName: booking.workerId.workerProfile.bankDetails.bankName,
            },
        });

        await workerPayment.save({ session });

        // Create or update worker earnings
        let workerEarnings = await WorkerEarnings.findOne({
            workerId: booking.workerId._id,
        }).session(session);

        if (!workerEarnings) {
            workerEarnings = new WorkerEarnings({
                workerId: booking.workerId._id,
                totalEarnings: 0,
                availableBalance: 0,
                pendingBalance: 0,
                totalWithdrawn: 0,
                transactions: [],
            });
        }

        // Add earning to worker's account
        await workerEarnings.addEarning(
            workerAmount,
            `Payment for booking ${bookingId}`,
            workerPayment._id,
            {
                bookingId: bookingId,
                customerName: booking.customerId.name,
                serviceAmount: booking.price,
                platformFee: platformFee,
            }
        );

        await workerEarnings.save({ session });
        await session.commitTransaction();

        // Automatically process payment to worker
        setTimeout(() => {
            processWorkerPaymentMethod(workerPayment._id);
        }, 2000); // Process after 2 seconds

        res.status(201).json({
            success: true,
            message: "Worker payment created successfully",
            data: {
                paymentId: workerPayment._id,
                workerId: booking.workerId._id,
                workerAmount: workerAmount,
                platformFee: platformFee,
                status: workerPayment.status,
            },
        });
    } catch (error) {
        await session.abortTransaction();
        console.error("Create Worker Payment Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create worker payment",
            error: error.message,
        });
    } finally {
        session.endSession();
    }
};

/**
 * @desc    Process payment to worker
 * @route   POST /api/worker-payments/process/:paymentId
 * @access  Private (System/Admin)
 */
export const processWorkerPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const result = await processPaymentToWorker(paymentId);

        res.status(200).json({
            success: true,
            message: "Worker payment processed successfully",
            data: result,
        });
    } catch (error) {
        console.error("Process Worker Payment Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process worker payment",
            error: error.message,
        });
    }
};

/**
 * @desc    Get worker payment history
 * @route   GET /api/worker-payments/worker/:workerId
 * @access  Private (Worker)
 */
export const getWorkerPayments = async (req, res) => {
    try {
        const { workerId } = req.params;
        const { page = 1, limit = 10, status } = req.query;

        const query = { workerId: workerId };
        if (status) {
            query.status = status;
        }

        const payments = await WorkerPayment.find(query)
            .populate("customerId", "name phone")
            .populate("bookingId", "bookingDate bookingTime price")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await WorkerPayment.countDocuments(query);

        // Get worker earnings summary
        const earnings = await WorkerEarnings.findOne({ workerId: workerId });

        res.status(200).json({
            success: true,
            data: {
                payments,
                earnings: {
                    totalEarnings: earnings?.totalEarnings || 0,
                    availableBalance: earnings?.availableBalance || 0,
                    pendingBalance: earnings?.pendingBalance || 0,
                    totalWithdrawn: earnings?.totalWithdrawn || 0,
                    lastPayoutDate: earnings?.lastPayoutDate,
                },
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error("Get Worker Payments Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch worker payments",
            error: error.message,
        });
    }
};

/**
 * @desc    Get payment details by ID
 * @route   GET /api/worker-payments/:paymentId
 * @access  Private (Worker/Admin)
 */
export const getPaymentById = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await WorkerPayment.findById(paymentId)
            .populate("workerId", "name phone email")
            .populate("customerId", "name phone email")
            .populate("bookingId");

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment not found",
            });
        }

        res.status(200).json({
            success: true,
            data: payment,
        });
    } catch (error) {
        console.error("Get Payment By ID Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch payment details",
            error: error.message,
        });
    }
};

/**
 * @desc    Webhook for customer payment completion
 * @route   POST /api/worker-payments/webhook/customer-payment
 * @access  Public
 */
export const handleCustomerPaymentWebhook = async (req, res) => {
    try {
        const { bookingId, paymentStatus, transactionId } = req.body;

        console.log(
            `Customer payment webhook received for booking ${bookingId}: ${paymentStatus}`
        );

        if (paymentStatus !== "COMPLETED") {
            return res.status(200).json({
                success: true,
                message:
                    "Customer payment not completed, skipping worker payment",
            });
        }

        // Create worker payment
        const response = await createWorkerPayment(
            { body: { bookingId } },
            {
                status: (code) => ({
                    json: (data) => {
                        if (data.success) {
                            console.log(
                                `Worker payment created for booking ${bookingId}`
                            );
                        } else {
                            console.error(
                                `Failed to create worker payment: ${data.message}`
                            );
                        }
                    },
                }),
            }
        );

        res.status(200).json({
            success: true,
            message: "Worker payment processing initiated",
        });
    } catch (error) {
        console.error("Customer Payment Webhook Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process webhook",
            error: error.message,
        });
    }
};

/**
 * @desc    Process all pending worker payments
 * @route   POST /api/worker-payments/process-pending
 * @access  Private (Admin/System)
 */
export const processPendingPayments = async (req, res) => {
    try {
        const pendingPayments = await WorkerPayment.find({
            status: "PENDING",
        }).populate("workerId");

        console.log(
            `Processing ${pendingPayments.length} pending worker payments`
        );

        const results = {
            processed: 0,
            successful: 0,
            failed: 0,
            errors: [],
        };

        for (const payment of pendingPayments) {
            try {
                await processPaymentToWorker(payment._id);
                results.processed++;
                results.successful++;
            } catch (error) {
                results.processed++;
                results.failed++;
                results.errors.push({
                    paymentId: payment._id,
                    error: error.message,
                });
                console.error(
                    `Failed to process payment ${payment._id}:`,
                    error
                );
            }
        }

        res.status(200).json({
            success: true,
            message: "Pending payments processing completed",
            data: results,
        });
    } catch (error) {
        console.error("Process Pending Payments Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process pending payments",
            error: error.message,
        });
    }
};

// Helper function to process payment to worker
const processPaymentToWorker = async (paymentId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const payment = await WorkerPayment.findById(paymentId)
            .populate("workerId")
            .session(session);

        if (!payment) {
            throw new Error("Payment not found");
        }

        if (payment.status !== "PENDING") {
            throw new Error(`Payment already ${payment.status.toLowerCase()}`);
        }

        // Update status to processing
        payment.status = "PROCESSING";
        payment.processedAt = new Date();
        await payment.save({ session });

        // Check worker earnings balance
        const workerEarnings = await WorkerEarnings.findOne({
            workerId: payment.workerId._id,
        }).session(session);

        if (
            !workerEarnings ||
            workerEarnings.availableBalance < payment.workerAmount
        ) {
            throw new Error("Insufficient worker balance for payout");
        }

        // Process via Razorpay
        try {
            const fundAccountId = await getOrCreateFundAccount(payment);

            const razorpayPayout = await razorpay.payouts.create({
                account_number: payment.bankDetails.accountNumber,
                fund_account_id: fundAccountId,
                amount: payment.workerAmount * 100, // Convert to paise
                currency: "INR",
                mode: "IMPS",
                purpose: "payout",
                queue_if_low_balance: true,
                reference_id: `WPOUT${payment._id}`,
                narration: `Workjunction Payment - ${payment.bookingId}`,
            });

            // Update payment status
            payment.status = "PAID";
            payment.razorpayPayoutId = razorpayPayout.id;
            payment.transactionId = `TXN${Date.now()}`;
            payment.paidAt = new Date();

            // Deduct from worker earnings
            await workerEarnings.processPayout(
                payment.workerAmount,
                `Payout for booking ${payment.bookingId}`,
                payment._id
            );

            await payment.save({ session });
            await workerEarnings.save({ session });
            await session.commitTransaction();

            console.log(
                `Worker payment processed successfully: ${payment._id}`
            );

            return {
                paymentId: payment._id,
                razorpayPayoutId: razorpayPayout.id,
                workerAmount: payment.workerAmount,
                status: "PAID",
                paidAt: payment.paidAt,
            };
        } catch (razorpayError) {
            // Handle Razorpay errors
            payment.status = "FAILED";
            payment.failureReason =
                razorpayError.error?.description ||
                "Razorpay processing failed";

            await payment.save({ session });
            await session.commitTransaction();

            throw new Error(
                `Razorpay payout failed: ${razorpayError.error?.description}`
            );
        }
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

// Helper function to get or create fund account
const getOrCreateFundAccount = async (payment) => {
    try {
        // Create contact
        const contact = await razorpay.contacts.create({
            name: payment.workerId.name,
            email: payment.workerId.email,
            contact: payment.workerId.phone,
            type: "employee",
        });

        // Create fund account
        const fundAccount = await razorpay.fundAccount.create({
            contact_id: contact.id,
            account_type: "bank_account",
            bank_account: {
                name: payment.bankDetails.accountHolderName,
                ifsc: payment.bankDetails.ifscCode,
                account_number: payment.bankDetails.accountNumber,
            },
        });

        return fundAccount.id;
    } catch (error) {
        console.error("Fund Account Creation Error:", error);
        throw new Error("Failed to create fund account");
    }
};

// Auto process payment (called by timeout)
const processWorkerPaymentMethod = async (paymentId) => {
    try {
        const payment = await WorkerPayment.findById(paymentId);
        if (payment && payment.status === "PENDING") {
            await processPaymentToWorker(paymentId);
        }
    } catch (error) {
        console.error(`Failed to auto process payment ${paymentId}:`, error);
    }
};

export default {
    createWorkerPayment,
    processWorkerPayment,
    getWorkerPayments,
    getPaymentById,
    handleCustomerPaymentWebhook,
    processPendingPayments,
};
