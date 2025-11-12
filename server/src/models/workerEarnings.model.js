// models/workerEarnings.model.js
import mongoose, { Schema } from "mongoose";

const earningsTransactionSchema = new Schema(
    {
        transactionId: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["CREDIT", "DEBIT", "HOLD", "RELEASE"],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        description: {
            type: String,
            required: true,
        },
        referenceId: {
            type: Schema.Types.ObjectId,
        },
        status: {
            type: String,
            enum: ["PENDING", "COMPLETED", "FAILED"],
            default: "COMPLETED",
        },
        metadata: {
            type: Map,
            of: Schema.Types.Mixed,
        },
    },
    { _id: false, timestamps: true }
);

const workerEarningsSchema = new Schema(
    {
        workerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        totalEarnings: {
            type: Number,
            default: 0,
            min: 0,
        },
        availableBalance: {
            type: Number,
            default: 0,
            min: 0,
        },
        pendingBalance: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalWithdrawn: {
            type: Number,
            default: 0,
            min: 0,
        },
        lastPayoutDate: {
            type: Date,
        },
        transactions: [earningsTransactionSchema],
    },
    {
        timestamps: true,
        collection: "workerEarnings",
    }
);

// Indexes
workerEarningsSchema.index({ workerId: 1 });
workerEarningsSchema.index({ availableBalance: 1 });

// Methods
workerEarningsSchema.methods.addEarning = async function (
    amount,
    description,
    referenceId,
    metadata = {}
) {
    const transactionId = `EARN${Date.now()}${Math.random()
        .toString(36)
        .substr(2, 9)}`;

    this.totalEarnings += amount;
    this.availableBalance += amount;

    this.transactions.push({
        transactionId,
        type: "CREDIT",
        amount,
        description,
        referenceId,
        status: "COMPLETED",
        metadata,
    });

    await this.save();
    return transactionId;
};

workerEarningsSchema.methods.holdAmount = async function (amount, description) {
    if (this.availableBalance < amount) {
        throw new Error("Insufficient available balance");
    }

    const transactionId = `HOLD${Date.now()}${Math.random()
        .toString(36)
        .substr(2, 9)}`;

    this.availableBalance -= amount;
    this.pendingBalance += amount;

    this.transactions.push({
        transactionId,
        type: "HOLD",
        amount,
        description,
        status: "COMPLETED",
    });

    await this.save();
    return transactionId;
};

workerEarningsSchema.methods.releaseHold = async function (
    amount,
    description
) {
    if (this.pendingBalance < amount) {
        throw new Error("Insufficient pending balance");
    }

    const transactionId = `RLS${Date.now()}${Math.random()
        .toString(36)
        .substr(2, 9)}`;

    this.pendingBalance -= amount;
    this.availableBalance += amount;

    this.transactions.push({
        transactionId,
        type: "RELEASE",
        amount,
        description,
        status: "COMPLETED",
    });

    await this.save();
    return transactionId;
};

workerEarningsSchema.methods.processPayout = async function (
    amount,
    description,
    referenceId
) {
    if (this.availableBalance < amount) {
        throw new Error("Insufficient available balance for payout");
    }

    const transactionId = `POUT${Date.now()}${Math.random()
        .toString(36)
        .substr(2, 9)}`;

    this.availableBalance -= amount;
    this.totalWithdrawn += amount;
    this.lastPayoutDate = new Date();

    this.transactions.push({
        transactionId,
        type: "DEBIT",
        amount,
        description,
        referenceId,
        status: "COMPLETED",
    });

    await this.save();
    return transactionId;
};

const WorkerEarnings = mongoose.model("WorkerEarnings", workerEarningsSchema);

export { WorkerEarnings };
