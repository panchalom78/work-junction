import { Router } from "express";
const router = Router();

import { protect } from "../middlewares/auth.middleware.js";
import {
  getWorkerOverview , getWorkerServices, addServiceForWorker , updateWorkerService, deleteWorkerService
} from "../controllers/worker.controller.js";

router.use(protect);
router.get("/overview", getWorkerOverview);
router.get("/getservices", getWorkerServices);
router.post("/addWorkerServices", addServiceForWorker);
router.put("/updateWorkerService/:id", updateWorkerService);
router.delete("/deleteWorkerService/:id", deleteWorkerService);

export default router;
