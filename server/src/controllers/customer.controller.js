import { successResponse, errorResponse, formatUserResponse } from "../utils/response.js";
import User from "../models/user.model.js";
import { WorkerService } from "../models/workerService.model.js";
import { Skill } from "../models/skill.model.js";
import { Booking } from "../models/booking.model.js";
import { Chat } from "../models/chat.model.js";
import mongoose from "mongoose";

// Async Handler - wraps async functions to catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.success = false;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Haversine distance calculation
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};


// REQ-CU-002: Booking History
const getBookingHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = { customerId: userId };

    if (startDate || endDate) {
        filter.bookingDate = {};
        if (startDate) filter.bookingDate.$gte = new Date(startDate);
        if (endDate) filter.bookingDate.$lte = new Date(endDate);
    }

    // Get total count
    const totalBookings = await Booking.countDocuments(filter);

    // Get bookings with pagination
    const bookings = await Booking.find(filter)
        .populate("workerId", "name phone")
        .populate("workerServiceId", "details pricingType")
        .sort({ bookingDate: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean();

    // Enrich with service details
    const enrichedBookings = await Promise.all(
        bookings.map(async (booking) => {
            const workerService = await WorkerService.findById(booking.workerServiceId)
                .populate("skillId", "name services");
            
            let serviceName = "N/A";
            if (workerService && workerService.skillId) {
                const service = workerService.skillId.services.find(
                    (s) => s.serviceId.toString() === booking.serviceId.toString()
                );
                serviceName = service ? service.name : "N/A";
            }

            return {
                bookingId: booking._id,
                serviceName,
                serviceType: workerService?.skillId?.name || "N/A",
                workerDetails: {
                    workerId: booking.workerId._id,
                    name: booking.workerId.name,
                    phone: booking.workerId.phone,
                },
                bookingDate: booking.bookingDate,
                bookingTime: booking.bookingTime,
                status: booking.status,
                price: booking.price,
                payment: booking.payment,
                review: booking.review,
                cancellationReason: booking.cancellationReason,
                declineReason: booking.declineReason,
                createdAt: booking.createdAt,
            };
        })
    );

    const pagination = {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalBookings / limit),
        totalBookings,
        bookingsPerPage: parseInt(limit),
    };

    if (enrichedBookings.length === 0) {
        return res.status(200).json(
            successResponse(200, { bookings: [], pagination }, "No booking history available")
        );
    }

    return res.status(200).json(
        successResponse(
            200,
            { bookings: enrichedBookings, pagination },
            "Booking history retrieved successfully"
        )
    );
});

// REQ-CU-003: Ratings and Reviews
const submitReview = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { bookingId, rating, comment } = req.body;

    // Validation
    if (!bookingId || !rating) {
        throw new ApiError(400, "Booking ID and rating are required");
    }

    if (rating < 1 || rating > 5) {
        throw new ApiError(400, "Rating must be between 1 and 5");
    }

    // Find booking and validate
    const booking = await Booking.findById(bookingId);
    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }

    if (booking.customerId.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized to review this booking");
    }

    if (booking.status !== "COMPLETED") {
        throw new ApiError(400, "Can only review completed bookings");
    }

    if (booking.review && booking.review.rating) {
        throw new ApiError(400, "Review already submitted for this booking");
    }

    // Create review using MongoDB transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Update booking with review
        booking.review = {
            rating: parseInt(rating),
            comment: comment || "",
            reviewedAt: new Date(),
        };
        await booking.save({ session });

        // Recalculate worker's average rating
        const workerBookings = await Booking.find({
            workerId: booking.workerId,
            "review.rating": { $exists: true },
        }).session(session);

        const totalRatings = workerBookings.reduce(
            (sum, b) => sum + b.review.rating,
            0
        );
        const avgRating = totalRatings / workerBookings.length;
        const ratingCount = workerBookings.length;

        // Note: You might want to store these in Worker profile or a separate collection
        // For now, they'll be calculated on-demand from bookings

        await session.commitTransaction();

        // Send notification to worker (implement notification service)
        // await sendNotification(booking.workerId, 'NEW_REVIEW', {...});

        return res.status(200).json(
            successResponse(
                200,
                {
                    review: booking.review,
                    workerStats: { avgRating, ratingCount },
                },
                "Review submitted successfully"
            )
        );
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});

// REQ-CU-004: In-App Chat - Send Message
const sendMessage = asyncHandler(async (req, res) => {
    const senderId = req.user._id;
    const { receiverId, content } = req.body;

    // Validation
    if (!receiverId || !content) {
        throw new ApiError(400, "Receiver ID and message content are required");
    }

    if (content.trim().length === 0) {
        throw new ApiError(400, "Message content cannot be empty");
    }

    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
        throw new ApiError(404, "Receiver not found");
    }

    // Ensure sender is customer and receiver is worker (or vice versa)
    const senderRole = req.user.role;
    const receiverRole = receiver.role;

    if (
        !(
            (senderRole === "CUSTOMER" && receiverRole === "WORKER") ||
            (senderRole === "WORKER" && receiverRole === "CUSTOMER")
        )
    ) {
        throw new ApiError(400, "Messages can only be sent between customers and workers");
    }

    // Determine customer and worker IDs
    let customerId, workerId;
    if (senderRole === "CUSTOMER") {
        customerId = senderId;
        workerId = receiverId;
    } else {
        customerId = receiverId;
        workerId = senderId;
    }

    // Find or create chat
    let chat = await Chat.findOne({ customerId, workerId });

    const newMessage = {
        senderId,
        content: content.trim(),
        timestamp: new Date(),
    };

    if (chat) {
        chat.messages.push(newMessage);
        chat.lastMessageAt = new Date();
        await chat.save();
    } else {
        chat = await Chat.create({
            customerId,
            workerId,
            messages: [newMessage],
            lastMessageAt: new Date(),
        });
    }

    // Send push notification to receiver (implement notification service)
    // await sendPushNotification(receiverId, {...});

    return res.status(200).json(
        successResponse(
            200,
            { message: newMessage, chatId: chat._id },
            "Message sent successfully"
        )
    );
});

// Get Chat History
const getChatHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Find chat
    const chat = await Chat.findById(chatId)
        .populate("customerId", "name")
        .populate("workerId", "name");

    if (!chat) {
        throw new ApiError(404, "Chat not found");
    }

    // Verify user is part of this chat
    if (
        chat.customerId._id.toString() !== userId.toString() &&
        chat.workerId._id.toString() !== userId.toString()
    ) {
        throw new ApiError(403, "Unauthorized to access this chat");
    }

    // Paginate messages (most recent first)
    const totalMessages = chat.messages.length;
    const startIndex = Math.max(0, totalMessages - page * limit);
    const endIndex = totalMessages - (page - 1) * limit;
    const messages = chat.messages.slice(startIndex, endIndex).reverse();

    const pagination = {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        messagesPerPage: parseInt(limit),
    };

    return res.status(200).json(
        successResponse(
            200,
            {
                chatId: chat._id,
                customer: { id: chat.customerId._id, name: chat.customerId.name },
                worker: { id: chat.workerId._id, name: chat.workerId.name },
                messages,
                pagination,
            },
            "Chat history retrieved successfully"
        )
    );
});

// Get All Chats for User
const getUserChats = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const userRole = req.user.role;

    let filter = {};
    if (userRole === "CUSTOMER") {
        filter.customerId = userId;
    } else if (userRole === "WORKER") {
        filter.workerId = userId;
    } else {
        throw new ApiError(403, "Only customers and workers can access chats");
    }

    const chats = await Chat.find(filter)
        .populate("customerId", "name")
        .populate("workerId", "name")
        .sort({ lastMessageAt: -1 })
        .lean();

    const enrichedChats = chats.map((chat) => {
        const lastMessage = chat.messages[chat.messages.length - 1];
        return {
            chatId: chat._id,
            customer: { id: chat.customerId._id, name: chat.customerId.name },
            worker: { id: chat.workerId._id, name: chat.workerId.name },
            lastMessage: lastMessage
                ? {
                      content: lastMessage.content,
                      senderId: lastMessage.senderId,
                      timestamp: lastMessage.timestamp,
                  }
                : null,
            lastMessageAt: chat.lastMessageAt,
            messageCount: chat.messages.length,
        };
    });

    return res.status(200).json(
        successResponse(200, { chats: enrichedChats }, "Chats retrieved successfully")
    );
});

// REQ-CU-005: Multi-Language Support
const updateLanguagePreference = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { language } = req.body;

    if (!language) {
        throw new ApiError(400, "Language preference is required");
    }

    // Supported languages
    const supportedLanguages = ["en", "hi", "gu", "mr", "ta", "te", "kn", "bn"];
    if (!supportedLanguages.includes(language)) {
        throw new ApiError(400, `Language must be one of: ${supportedLanguages.join(", ")}`);
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Update based on role
    if (user.role === "CUSTOMER") {
        user.customerProfile = user.customerProfile || {};
        user.customerProfile.preferredLanguage = language;
    } else if (user.role === "WORKER") {
        user.workerProfile = user.workerProfile || {};
        user.workerProfile.preferredLanguage = language;
    } else {
        throw new ApiError(400, "Language preference only available for customers and workers");
    }

    await user.save();

    return res.status(200).json(
        successResponse(
            200,
            { language },
            "Language preference updated successfully"
        )
    );
});

const getLanguagePreference = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    let language = "en"; // default
    if (user.role === "CUSTOMER" && user.customerProfile?.preferredLanguage) {
        language = user.customerProfile.preferredLanguage;
    } else if (user.role === "WORKER" && user.workerProfile?.preferredLanguage) {
        language = user.workerProfile.preferredLanguage;
    }

    return res.status(200).json(
        successResponse(200, { language }, "Language preference retrieved successfully")
    );
});

export {
    getBookingHistory,
    submitReview,
    sendMessage,
    getChatHistory,
    getUserChats,
    updateLanguagePreference,
    getLanguagePreference
};