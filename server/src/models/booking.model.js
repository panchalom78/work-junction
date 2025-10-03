import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema(
    {
        paymentId: {
            type: Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId(),
        },
        amount: { type: Number, required: true, min: 0 },
        status: {
            type: String,
            enum: ["PENDING", "COMPLETED", "FAILED"],
            default: "PENDING",
        },
        paymentType: {
            type: String,
            enum: ["CREDIT_CARD", "DEBIT_CARD", "UPI", "NET_BANKING", "CASH"],
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
            enum: ["PENDING", "ACCEPTED", "DECLINED", "COMPLETED", "CANCELLED"],
            default: "PENDING",
        },
        bookingDate: { type: Date, required: true },
        bookingTime: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },

        // Nested Payment
        payment: paymentSchema,

        // Nested Review (only after completion)
        review: reviewSchema,

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
