// routes/chatRoutes.js
import express from "express";
import {
    getOrCreateChat,
    sendMessage,
    getChatMessages,
    getUserChats,
    markMessagesAsRead,
} from "../controllers/chat.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

/**
 * @route   GET /api/chats
 * @desc    Get all chats for the authenticated user
 * @access  Private (Customer/Worker)
 */
router.get("/", getUserChats);

/**
 * @route   GET /api/chats/with/:workerId
 * @desc    Get or create chat between customer and worker
 * @access  Private (Customer)
 */
router.get("/with/:workerId", getOrCreateChat);

/**
 * @route   POST /api/chats/:chatId/messages
 * @desc    Send a message in a chat
 * @access  Private (Customer/Worker)
 */
router.post("/:chatId/messages", sendMessage);

/**
 * @route   GET /api/chats/:chatId/messages
 * @desc    Get messages from a chat with pagination
 * @access  Private (Customer/Worker)
 */
router.get("/:chatId/messages", getChatMessages);

/**
 * @route   PATCH /api/chats/:chatId/read
 * @desc    Mark messages as read
 * @access  Private (Customer/Worker)
 */
router.patch("/:chatId/read", markMessagesAsRead);

export default router;
