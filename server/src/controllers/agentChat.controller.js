// controllers/agentChat.controller.js
import { Chat } from "../models/chat.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

/**
 * Get all chats for service agents with filters
 */
export const getAgentChats = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;
        const agentId = req.user._id;

        // Verify user is a service agent
        if (req.user.role !== "SERVICE_AGENT") {
            return res.status(403).json({
                success: false,
                message: "Only service agents can access this resource",
            });
        }

        // Build base filter - get all chats where worker is created by agent
        let filter = {
            workerId: {
                $in: await User.find({
                    "workerProfile.createdBy": agentId,
                }).distinct("_id"),
            },
        };

        // Add search filter
        if (search) {
            const searchUsers = await User.find({
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { phone: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                ],
                $or: [{ role: "CUSTOMER" }, { role: "WORKER" }],
            }).distinct("_id");

            filter.$or = [
                { customerId: { $in: searchUsers } },
                { workerId: { $in: searchUsers } },
            ];
        }

        const skip = (page - 1) * limit;

        // Get chats with populated user data
        const chats = await Chat.find(filter)
            .populate("customerId", "name email phone address")
            .populate({
                path: "workerId",
                select: "name email phone workerProfile",
                populate: {
                    path: "workerProfile.skills.skillId",
                    select: "name",
                },
            })
            .sort({ lastMessageAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalChats = await Chat.countDocuments(filter);

        // Format response for agent view
        const formattedChats = chats.map((chat) => {
            const lastMessage =
                chat.messages.length > 0
                    ? chat.messages[chat.messages.length - 1]
                    : null;

            return {
                _id: chat._id,
                chatId: chat._id,
                customer: {
                    _id: chat.customerId._id,
                    name: chat.customerId.name,
                    phone: chat.customerId.phone,
                    email: chat.customerId.email,
                    address: chat.customerId.address,
                },
                worker: {
                    _id: chat.workerId._id,
                    name: chat.workerId.name,
                    phone: chat.workerId.phone,
                    email: chat.workerId.email,
                    skills: chat.workerId.workerProfile?.skills || [],
                    createdByAgent:
                        chat.workerId.workerProfile?.createdByAgent || false,
                },
                lastMessage: lastMessage
                    ? {
                          content: lastMessage.content,
                          senderId: lastMessage.senderId,
                          timestamp: lastMessage.timestamp,
                      }
                    : null,
                lastMessageAt: chat.lastMessageAt,
                unreadCount: chat.messages.filter(
                    (msg) =>
                        msg.senderId.toString() !== agentId.toString() &&
                        !msg.readBy?.includes(agentId)
                ).length,
                totalMessages: chat.messages.length,
                status: "active", // You can add status field to chat model if needed
                createdAt: chat.createdAt,
            };
        });

        res.status(200).json({
            success: true,
            data: {
                chats: formattedChats,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalChats / limit),
                    totalChats,
                    hasNext: page < Math.ceil(totalChats / limit),
                    hasPrev: page > 1,
                },
            },
        });
    } catch (error) {
        console.error("Get agent chats error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

/**
 * Send message as service agent on behalf of worker
 */
export const sendMessageAsAgent = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { content } = req.body;
        const agentId = req.user._id;

        // Verify user is a service agent
        if (req.user.role !== "SERVICE_AGENT") {
            return res.status(403).json({
                success: false,
                message:
                    "Only service agents can send messages on behalf of workers",
            });
        }

        // Validate input
        if (!content || content.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Message content is required",
            });
        }

        // Find chat
        const chat = await Chat.findById(chatId)
            .populate("customerId", "name email phone")
            .populate("workerId", "name email phone workerProfile");

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found",
            });
        }

        // Verify agent has permission (worker was created by this agent)
        if (
            chat.workerId.workerProfile?.createdBy?.toString() !==
            agentId.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "You don't have permission to send messages for this worker",
            });
        }

        // Create new message - agent sends as worker
        const newMessage = {
            messageId: new mongoose.Types.ObjectId(),
            senderId: chat.workerId._id, // Send as worker
            content: content.trim(),
            timestamp: new Date(),
        };

        // Add message to chat
        chat.messages.push(newMessage);
        chat.lastMessageAt = new Date();
        await chat.save();

        // Get updated chat with populated data
        const updatedChat = await Chat.findById(chatId)
            .populate("customerId", "name email phone")
            .populate("workerId", "name email phone workerProfile");

        res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: {
                message: newMessage,
                chat: updatedChat,
            },
        });
    } catch (error) {
        console.error("Send message as agent error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

/**
 * Get specific chat details for agent
 */
export const getAgentChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const agentId = req.user._id;

        // Verify user is a service agent
        if (req.user.role !== "SERVICE_AGENT") {
            return res.status(403).json({
                success: false,
                message: "Only service agents can access this resource",
            });
        }

        // Find chat
        const chat = await Chat.findById(chatId)
            .populate("customerId", "name email phone address")
            .populate({
                path: "workerId",
                select: "name email phone workerProfile",
                populate: {
                    path: "workerProfile.skills.skillId",
                    select: "name",
                },
            });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found",
            });
        }

        // Verify agent has permission
        if (
            chat.workerId.workerProfile?.createdBy?.toString() !==
            agentId.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to access this chat",
            });
        }

        // Format messages with sender info
        const formattedMessages = await Promise.all(
            chat.messages.map(async (message) => {
                const sender = await User.findById(message.senderId).select(
                    "name role"
                );
                return {
                    ...message.toObject(),
                    senderName: sender?.name || "Unknown",
                    senderRole: sender?.role || "unknown",
                    isAgent: sender?._id.toString() === agentId.toString(),
                };
            })
        );

        res.status(200).json({
            success: true,
            data: {
                chat: {
                    _id: chat._id,
                    customer: chat.customerId,
                    worker: chat.workerId,
                    messages: formattedMessages.sort(
                        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
                    ),
                    lastMessageAt: chat.lastMessageAt,
                    createdAt: chat.createdAt,
                },
            },
        });
    } catch (error) {
        console.error("Get agent chat error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

/**
 * Get chat messages with pagination for agent
 */
export const getAgentChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const agentId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // Verify user is a service agent
        if (req.user.role !== "SERVICE_AGENT") {
            return res.status(403).json({
                success: false,
                message: "Only service agents can access this resource",
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

        // Verify agent has permission
        const worker = await User.findById(chat.workerId);
        if (
            worker.workerProfile?.createdBy?.toString() !== agentId.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to access this chat",
            });
        }

        // Get messages with pagination
        const messages = chat.messages
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(skip, skip + limit);

        const totalMessages = chat.messages.length;
        const totalPages = Math.ceil(totalMessages / limit);

        // Get sender info for messages
        const messagesWithSenders = await Promise.all(
            messages.reverse().map(async (message) => {
                const sender = await User.findById(message.senderId).select(
                    "name role"
                );
                return {
                    ...message.toObject(),
                    senderName: sender?.name || "Unknown",
                    senderRole: sender?.role || "unknown",
                    isAgent: sender?._id.toString() === agentId.toString(),
                };
            })
        );

        res.status(200).json({
            success: true,
            data: {
                messages: messagesWithSenders,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalMessages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            },
        });
    } catch (error) {
        console.error("Get agent chat messages error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};

/**
 * Get agent dashboard statistics
 */
export const getAgentDashboardStats = async (req, res) => {
    try {
        const agentId = req.user._id;

        // Verify user is a service agent
        if (req.user.role !== "SERVICE_AGENT") {
            return res.status(403).json({
                success: false,
                message: "Only service agents can access this resource",
            });
        }

        // Get workers created by this agent
        const agentWorkers = await User.find({
            "workerProfile.createdBy": agentId,
        }).select("_id");

        const workerIds = agentWorkers.map((worker) => worker._id);

        // Get chat statistics
        const totalChats = await Chat.countDocuments({
            workerId: { $in: workerIds },
        });

        const chatsWithMessages = await Chat.find({
            workerId: { $in: workerIds },
            "messages.0": { $exists: true },
        });

        const activeChats = chatsWithMessages.filter(
            (chat) =>
                chat.messages.length > 0 &&
                Date.now() - new Date(chat.lastMessageAt).getTime() <
                    24 * 60 * 60 * 1000 // Last 24 hours
        ).length;

        const totalMessages = chatsWithMessages.reduce(
            (total, chat) => total + chat.messages.length,
            0
        );

        // Get worker statistics
        const totalWorkers = agentWorkers.length;
        const activeWorkers = await User.countDocuments({
            "workerProfile.createdBy": agentId,
            "workerProfile.availabilityStatus": "available",
        });

        res.status(200).json({
            success: true,
            data: {
                totalChats,
                activeChats,
                totalMessages,
                totalWorkers,
                activeWorkers,
            },
        });
    } catch (error) {
        console.error("Get agent dashboard stats error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};
