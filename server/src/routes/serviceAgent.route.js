import express from "express";
import { setupServiceAgent } from "../controllers/serviceAgent.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.use(protect);
router.post("/setup", setupServiceAgent);

export default router;