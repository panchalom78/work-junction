import express from "express";
import { protect } from "../middlewares/auth.middleware.js";

import {
    getAgentDashboardStats,
  getAgentProfile,
  getRecentActivity,
  updateAgentProfile,
  getWorkerDistribution,
  getEarningsOverview
} from '../controllers/agentDashboard.controller.js'

const router = express.Router();
router.use(protect);
// Dashboard stat
router.get('/stats', getAgentDashboardStats);

// Agent profile
router.get('/profile', getAgentProfile);
router.put('/profile', updateAgentProfile);

// Recent activity
router.get('/recent-activity', getRecentActivity);

// Analytics
router.get('/worker-distribution', getWorkerDistribution);
router.get('/earnings-overview', getEarningsOverview);

export default router;
