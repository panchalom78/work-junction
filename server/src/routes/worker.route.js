import { Router } from "express";
const router = Router();

import { protect } from "../middlewares/auth.middleware.js";
import {
  getWorkerOverview
} from "../controllers/worker.controller.js";

router.use(protect);
router.get("/overview", getWorkerOverview);

export default router;
