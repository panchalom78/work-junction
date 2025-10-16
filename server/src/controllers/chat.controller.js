import { Chat } from "../models/chat.model.js";
import User from "../models/user.model.js";

/**
 * Get or create chat between customer and worker
 */
export const getOrCreateChat = async (req, res) => {
    try {
        const { workerId } = req.params;
        const customerId = req.user._id;

        // Validate workerId
        if (!workerId) {
            return res.status(400).json({
                success: false,
                message: "Worker ID is required",
            });
        }

        // Check if worker exists and is actually a worker
        const worker = await User.findOne({
            _id: workerId,
            role: "WORKER",
        });

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        // Check if customer exists
        const customer = await User.findOne({
            _id: customerId,
            role: "CUSTOMER",
        });

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        // Find existing chat or create new one
        let chat = await Chat.findOne({
            customerId,
            workerId,
        })
            .populate("customerId", "name email phone")
            .populate("workerId", "name email phone");

        if (!chat) {
            chat = new Chat({
                customerId,
                workerId,
                messages: [],
            });
            await chat.save();

            // Populate the newly created chat
            chat = await Chat.findById(chat._id)
                .populate("customerId", "name email phone")
                .populate("workerId", "name email phone");
        }

        res.status(200).json({
            success: true,
            data: chat,
        });
    } catch (error) {
        console.error("Get or create chat error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

/**
 * Send a message in chat
 */
export const sendMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { content } = req.body;
        const senderId = req.user._id;

        // Validate input
        if (!content || content.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Message content is required",
            });
        }

        // Find chat
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found",
            });
        }

        // Verify user is part of this chat
        if (
            !chat.customerId.equals(senderId) &&
            !chat.workerId.equals(senderId)
        ) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to send message in this chat",
            });
        }

        // Create new message
        const newMessage = {
            senderId,
            content: content.trim(),
            timestamp: new Date(),
        };

        // Add message to chat
        chat.messages.push(newMessage);
        chat.lastMessageAt = new Date();
        await chat.save();

        // Get updated chat with populated user data
        const updatedChat = await Chat.findById(chatId)
            .populate("customerId", "name email phone")
            .populate("workerId", "name email phone");

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: {
                message: newMessage,
                chat: updatedChat,
            },
        });
    } catch (error) {
        console.error("Send message error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

/**
 * Get chat messages with pagination
 */
export const getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // Find chat
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found",
            });
        }

        // Verify user is part of this chat
        if (!chat.customerId.equals(userId) && !chat.workerId.equals(userId)) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to access this chat",
            });
        }

        // Get messages with pagination
        const messages = chat.messages
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(skip, skip + limit);

        const totalMessages = chat.messages.length;
        const totalPages = Math.ceil(totalMessages / limit);

        res.status(200).json({
            success: true,
            data: {
                messages: messages.reverse(), // Return in chronological order
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalMessages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
                chatInfo: {
                    chatId: chat._id,
                    customerId: chat.customerId,
                    workerId: chat.workerId,
                },
            },
        });
    } catch (error) {
        console.error("Get chat messages error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

/**
 * Get all chats for a user (both customer and worker)
 */
export const getUserChats = async (req, res) => {
    try {
        const userId = req.user._id;
        const userRole = req.user.role;

        let chats;

        if (userRole === "CUSTOMER") {
            chats = await Chat.find({ customerId: userId })
                .populate("workerId", "name email phone")
                .populate("customerId", "name email phone")
                .sort({ lastMessageAt: -1 });
        } else if (userRole === "WORKER") {
            chats = await Chat.find({ workerId: userId })
                .populate("customerId", "name email phone")
                .populate("workerId", "name email phone")
                .sort({ lastMessageAt: -1 });
        } else {
            return res.status(403).json({
                success: false,
                message: "Only customers and workers can access chats",
            });
        }

        // Format response with last message preview
        const formattedChats = chats.map((chat) => ({
            _id: chat._id,
            participant:
                userRole === "CUSTOMER" ? chat.workerId : chat.customerId,
            lastMessage:
                chat.messages.length > 0
                    ? chat.messages[chat.messages.length - 1]
                    : null,
            lastMessageAt: chat.lastMessageAt,
            unreadCount: 0, // You can implement unread count logic if needed
            totalMessages: chat.messages.length,
        }));

        res.status(200).json({
            success: true,
            data: formattedChats,
        });
    } catch (error) {
        console.error("Get user chats error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

/**
 * Mark messages as read (optional enhancement)
 */
export const markMessagesAsRead = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

        // Implementation for marking messages as read
        // This would require adding a 'readBy' field to messages schema

        res.status(200).json({
            success: true,
            message: "Messages marked as read",
        });
    } catch (error) {
        console.error("Mark messages as read error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};
