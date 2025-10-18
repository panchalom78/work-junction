import mongoose, { Schema } from "mongoose";

const skillSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        services: [
            {
                serviceId: {
                    type: Schema.Types.ObjectId,
                    default: () => new mongoose.Types.ObjectId(),
                },
                name: { type: String, required: true, trim: true },
                createdAt: { type: Date, default: Date.now },
                updatedAt: { type: Date, default: Date.now },
            },
        ],
    },
    {
        timestamps: true,
        collection: "skills",
    }
);

const Skill = mongoose.model("Skill", skillSchema);

export { Skill };
