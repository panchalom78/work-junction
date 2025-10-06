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
