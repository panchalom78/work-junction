import express from "express";
import { setupServiceAgent, getAgentStats, getAreaStats, getWorkersForVerification } from "../controllers/serviceAgent.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.use(protect);
router.post("/setup", setupServiceAgent);
router.get("/stats", getAgentStats);
router.get("/area-stats", getAreaStats);
router.get("/workers-for-verification", getWorkersForVerification);

export default router;