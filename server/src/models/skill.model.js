import mongoose, { Schema } from "mongoose";

const skillSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        description: { type: String, trim: true },
        services: [
            {
                serviceId: {
                    type: Schema.Types.ObjectId,
                    default: () => new mongoose.Types.ObjectId(),
                },
                name: { type: String, required: true, trim: true },
                description: { type: String, trim: true },
                price : { type: Number, default: 0 },
                duration : { type: String, default: 'N/A' },
                createdAt: { type: Date, default: Date.now },
                updatedAt: { type: Date, default: Date.now }
            },
        ],
    },
    {
        timestamps: true,
        collection: "skills",
    }
);

skillSchema.index({ name: 1 });

const Skill = mongoose.model("Skill", skillSchema);

export { Skill };
