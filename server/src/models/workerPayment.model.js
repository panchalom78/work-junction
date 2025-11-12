// models/workerPayment.model.js
import mongoose, { Schema } from "mongoose";

const workerPaymentSchema = new Schema(
    {
        workerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        customerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        bookingId: {
            type: Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
            unique: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        platformFee: {
            type: Number,
            default: 0,
            min: 0,
        },
        workerAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ["PENDING", "PROCESSING", "PAID", "FAILED", "CANCELLED"],
            default: "PENDING",
        },
        paymentMethod: {
            type: String,
            enum: ["BANK_TRANSFER", "UPI", "WALLET"],
            default: "BANK_TRANSFER",
        },
        bankDetails: {
            accountNumber: { type: String },
            ifscCode: { type: String },
            accountHolderName: { type: String },
            bankName: { type: String },
        },
        transactionId: {
            type: String,
            sparse: true,
        },
        razorpayPayoutId: {
            type: String,
            sparse: true,
        },
        failureReason: {
            type: String,
        },
        paidAt: {
            type: Date,
        },
        processedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
        collection: "workerPayments",
    }
);

// Indexes
workerPaymentSchema.index({ workerId: 1 });
workerPaymentSchema.index({ bookingId: 1 });
workerPaymentSchema.index({ status: 1 });
workerPaymentSchema.index({ createdAt: 1 });
workerPaymentSchema.index({ paidAt: 1 });

// Pre-save hook to calculate worker amount
workerPaymentSchema.pre("save", function (next) {
    if (this.isModified("amount") || this.isModified("platformFee")) {
        this.workerAmount = this.amount - this.platformFee;
    }
    next();
});

const WorkerPayment = mongoose.model("WorkerPayment", workerPaymentSchema);

export { WorkerPayment };
