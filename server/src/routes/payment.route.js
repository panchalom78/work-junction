// routes/payment.routes.js
import express from "express";
import {
    createRazorpayOrder,
    verifyRazorpayPayment,
    initiateCashPayment,
    verifyCashPayment,
    getPaymentStatus,
    razorpayWebhook,
} from "../controllers/payment.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public webhook route (no authentication required)
router.post("/webhook", razorpayWebhook);

// Protected routes
router.use(protect);

// Razorpay payment routes
router.post("/razorpay/create-order", createRazorpayOrder);
router.post("/razorpay/verify", verifyRazorpayPayment);

// Cash payment routes
router.post("/cash/initiate", initiateCashPayment);
router.post("/cash/verify", verifyCashPayment);

// Get payment status
router.get("/status/:bookingId", getPaymentStatus);

export default router;
