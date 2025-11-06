// routes/workerPayment.routes.js
import express from "express";
import {
    createWorkerPayment,
    processWorkerPayment,
    getWorkerPayments,
    getPaymentById,
    handleCustomerPaymentWebhook,
    processPendingPayments,
} from "../controllers/workerPayment.controller.js";
import { authorize, protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Webhook route (no authentication)
router.post("/webhook/customer-payment", handleCustomerPaymentWebhook);

// Worker routes
router.get("/worker/:workerId", protect, getWorkerPayments);
router.get("/:paymentId", protect, getPaymentById);

// System/Admin routes
router.post(
    "/create",
    protect,
    // authorize(["ADMIN", "SYSTEM"]),
    createWorkerPayment
);
router.post(
    "/process/:paymentId",
    protect,
    // authorize(["ADMIN", "SYSTEM"]),
    processWorkerPayment
);
router.post(
    "/process-pending",
    protect,
    // authorize(["ADMIN", "SYSTEM"]),
    processPendingPayments
);

export default router;
