import { Router } from "express";
const router = Router();

import {
    getDashboardStats,
    getRecentActivities,
    getVerificationQueue,
    getAllUsers,
    getAllBookings,
    getAllPayments,
    getServiceAgents,
    updateUserStatus,
    updateWorkerVerification,
    getAnalytics
} from "../controllers/admin.controller.js";

import { protect, authorize } from "../middlewares/auth.middleware.js";

// Apply admin protection to all routes
router.use(protect, authorize("ADMIN"));

// Dashboard routes
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/activities", getRecentActivities);
router.get("/dashboard/analytics", getAnalytics);

// User management routes
router.get("/users", getAllUsers);
router.put("/users/:userId/status", updateUserStatus);

// Verification routes
router.get("/verification/queue", getVerificationQueue);
router.put("/verification/:workerId", updateWorkerVerification);

// Booking management routes
router.get("/bookings", getAllBookings);

// Payment management routes
router.get("/payments", getAllPayments);

// Service agent routes
router.get("/service-agents", getServiceAgents);

export default router;
