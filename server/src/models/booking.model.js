import mongoose, { Schema } from "mongoose";
import { type } from "os";

const paymentSchema = new Schema(
    {
        paymentId: {
            type: String,
        },
        amount: { type: Number, required: true, min: 0 },
        status: {
            type: String,
            enum: ["PENDING", "COMPLETED", "FAILED"],
            default: "PENDING",
        },
        paymentType: {
            type: String,
            enum: ["RAZORPAY", "CASH"],
        },
        transactionId: { type: String },
        transactionDate: { type: Date },
    },
    { _id: false }
);

const reviewSchema = new Schema(
    {
        reviewId: {
            type: Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId(),
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true,
        },
        comment: { type: String, trim: true },
        reviewedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const bookingSchema = new Schema(
    {
        customerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        workerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        workerServiceId: {
            type: Schema.Types.ObjectId,
            ref: "WorkerService",
            required: true,
        },
        serviceId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        status: {
            type: String,
<<<<<<< HEAD
            enum: ["PENDING", "ACCEPTED", "DECLINED", "COMPLETED", "CANCELLED" , "IN_PROGRESS"],
=======
            enum: [
                "PENDING",
                "ACCEPTED",
                "DECLINED",
                "PAYMENT_PENDING",
                "COMPLETED",
                "CANCELLED",
            ],
>>>>>>> 2b29f9f6e505c9ea42a3ec30a5a93c604a313680
            default: "PENDING",
        },
        bookingDate: { type: Date, required: true },
        bookingTime: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },

        // Nested Payment
        payment: paymentSchema,

        // Nested Review (only after completion)
        review: reviewSchema,

        serviceInitiated: {
            type: Boolean,
            default: false,
        },
        serviceInitiatedAt: {
            type: Date,
        },
        serviceOtp: {
            type: String,
        },
        serviceOtpExpires: {
            type: Date,
        },
        serviceStartedAt: {
            type: Date,
        },
        serviceCompletedAt: {
            type: Date,
        },

        cancellationReason: { type: String, trim: true },
        declineReason: { type: String, trim: true },
    },
    {
        timestamps: true,
        collection: "bookings",
    }
);

// Indexes
bookingSchema.index({ customerId: 1 });
bookingSchema.index({ workerId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingDate: 1 });
bookingSchema.index({ customerId: 1, status: 1 });
bookingSchema.index({ workerId: 1, status: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

export { Booking };
