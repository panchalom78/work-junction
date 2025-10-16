import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { assignAreaToServiceAgent } from "../controllers/admin.controller.js";
const router = express.Router();
router.use(protect);
router.post("/assign-area", assignAreaToServiceAgent);

export default router;