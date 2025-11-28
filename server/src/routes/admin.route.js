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
    getBookingStats,
    getAllPayments,
    getServiceAgents,
    updateUserStatus,
    updateWorkerVerification,
    
    getUserRoleStats,
    getWorkerStats,
    getWorkers,
    updateWorkerStatus,
    getAllSkills,
    getAllSkillsWithServices,
    getServicesBySkill
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
    reactivateServiceAgent,
} from '../controllers/adminManage.controller.js';
import { protect, authorize } from "../middlewares/auth.middleware.js";
import { getAdminAnalytics } from '../controllers/analytics.controller.js';
import { getUserDistribution, getBookingAnalytics, getVerificationStats, getAgentPerformance , generateExcelReport , generatePDFReport} from '../controllers/adminReport.controller.js';
import { fetchWorkers } from '../controllers/admin.fetchworker.controller.js';
import { updateAdminProfile, changeAdminPassword } from "../controllers/admin.controller.js";
// Apply admin protection to all routes
router.use(protect, authorize("ADMIN"));

// Dashboard routes
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/activities", getRecentActivities);
router.get("/stats", getUserRoleStats);

// User management routes
router.get("/users", getAllUsers);
router.put("/users/:userId/status", updateUserStatus);

// Verification routes
router.get("/verification/queue", getVerificationQueue);
router.put("/verification/:workerId", updateWorkerVerification);
router.get("/verification/export", exportVerificationCSV);

// Booking management routes
router.get("/bookings", getAllBookings);
router.get("/bookings/stats", getBookingStats);

// Payment management routes
router.get("/payments", getAllPayments);

// Worker management routes
router.get("/workers/stats", getWorkerStats);
router.get("/workers", getWorkers);
router.put("/workers/:workerId/status", updateWorkerStatus);

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

router.get('/skills-services', getAllSkillsWithServices);
router.get('/skills', getAllSkills);
router.get('/:skillId/services', getServicesBySkill);



router.get('/analytics', getAdminAnalytics);

router.put('/profile', updateAdminProfile);
router.put('/change-password', changeAdminPassword);

// Reports routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/user-distribution', getUserDistribution);
router.get('/dashboard/bookings', getBookingAnalytics);
router.get('/dashboard/verifications', getVerificationStats);
router.get('/dashboard/agent-performance', getAgentPerformance);
router.get('/dashboard/recent-activities', getRecentActivities);
router.get('/reports/generate-pdf', generatePDFReport);

// For Excel reports (if you fix the 500 error)
router.get('/reports/generate-excel', generateExcelReport);
export default router;
