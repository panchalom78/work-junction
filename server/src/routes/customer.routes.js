import { Router } from "express";
import {
    searchServices,
    getBookingHistory,
    submitReview,
    sendMessage,
    getChatHistory,
    getUserChats,
    updateLanguagePreference,
    getLanguagePreference,
    getWorkerList
} from "../controllers/customer.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
const router = Router();

// All routes require authentication

// REQ-CU-001: Service Search and Browsing
router.route("/search").get(protect, searchServices);
router.route("/workers").get(protect, getWorkerList);
// REQ-CU-002: Booking History
router.route("/bookings/history").get( getBookingHistory);

// REQ-CU-003: Ratings and Reviews
router.route("/review").post( submitReview);

// REQ-CU-004: In-App Chat
router.route("/chat/send").post(sendMessage);
router.route("/chat/:chatId").get(getChatHistory);
router.route("/chats").get(getUserChats);

// REQ-CU-005: Multi-Language Support
router.route("/language").get(getLanguagePreference);
router.route("/language").put(updateLanguagePreference);

export default router;