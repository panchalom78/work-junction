// routes/admin.routes.js
import { Router } from "express";
const router = Router();

import {
    getDashboardStats,
    getRecentActivities,
    getVerificationQueue,
    exportVerificationCSV,
    getAllUsers,
    getAllBookings,
    getAllPayments,
    getServiceAgents,
    updateUserStatus,
    updateWorkerVerification,
    getAnalytics
} from "../controllers/admin.controller.js";
import {
    getAvailableAreas,
    assignAreaToAgent,
    getNearbyAreas,
    removeAreaAssignment,
    getServiceAgentById,
    updateServiceAgent,
    deleteServiceAgent,
    hardDeleteServiceAgent,
    reactivateServiceAgent
} from '../controllers/adminManage.controller.js';
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
router.get("/verification/export", exportVerificationCSV);

// Booking management routes
router.get("/bookings", getAllBookings);

// Payment management routes
router.get("/payments", getAllPayments);

// Service agent routes
router.get("/service-agents", getServiceAgents);
router.get("/service-agents/:agentId", getServiceAgentById);
router.get("/service-agents/areas/available", getAvailableAreas);
router.get("/service-agents/:agentId/areas/nearby", getNearbyAreas);
router.patch("/service-agents/:agentId/assign-area", assignAreaToAgent);
router.patch("/service-agents/:agentId/remove-area", removeAreaAssignment);
router.put("/service-agents/:agentId", updateServiceAgent);
router.delete("/service-agents/:agentId", deleteServiceAgent);
router.delete("/service-agents/:agentId/hard", hardDeleteServiceAgent);
router.patch("/service-agents/:agentId/reactivate", reactivateServiceAgent);

export default router;