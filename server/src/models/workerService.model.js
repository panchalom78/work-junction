import mongoose, { Schema } from "mongoose";

const portfolioImageSchema = new Schema(
    {
        imageId: {
            type: Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId(),
        },
        imageUrl: { type: String, required: true },
        caption: { type: String, trim: true },
        uploadedAt: { type: Date, default: Date.now },
    },
    { _id: false }
);

const workerServiceSchema = new Schema(
    {
        workerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        skillId: {
            type: Schema.Types.ObjectId,
            ref: "Skill",
            required: true,
        },
        serviceId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        details: { type: String, trim: true },
        pricingType: {
            type: String,
            enum: ["HOURLY", "FIXED"],
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        portfolioImages: [portfolioImageSchema],
        isActive: { type: Boolean, default: true },
        estimatedDuration: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
        collection: "worker_services",
    }
);

// Indexes
workerServiceSchema.index({ workerId: 1 });
workerServiceSchema.index({ skillId: 1 });
workerServiceSchema.index({ serviceId: 1 });
workerServiceSchema.index({ workerId: 1, skillId: 1 });

const WorkerService = mongoose.model("WorkerService", workerServiceSchema);

export { WorkerService };
