import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
    {
        messageId: {
            type: Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId(),
        },
        senderId: { type: Schema.Types.ObjectId, required: true },
        content: { type: String, required: true, trim: true },
        timestamp: { type: Date, default: Date.now },
    },
    { _id: false }
);

const chatSchema = new Schema(
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
        messages: [messageSchema],
        lastMessageAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        collection: "chats",
    }
);

// Indexes
chatSchema.index({ customerId: 1, workerId: 1 }, { unique: true });
chatSchema.index({ lastMessageAt: -1 });

const Chat = mongoose.model("Chat", chatSchema);

export { Chat };
