// workerAvailability.routes.js
import express from "express";
import {
    getWorkerAvailability,
    updateWorkerTimetable,
    updateWorkerNonAvailability,
    updateWorkerAvailabilityStatus,
    setupWorkerAvailability,
} from "../controllers/workerAvailability.controller.js";
import { authorize, protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Service Agent routes
router.get(
    "/:workerId/availability",
    protect,
    // authorize(["SERVICE_AGENT", "ADMIN"]),
    getWorkerAvailability
);

router.post(
    "/:workerId/availability",
    protect,
    // authorize(["SERVICE_AGENT", "ADMIN"]),
    setupWorkerAvailability
);

router.put(
    "/:workerId/timetable",
    protect,
    // authorize(["SERVICE_AGENT", "ADMIN"]),
    updateWorkerTimetable
);

router.put(
    "/:workerId/non-availability",
    protect,
    // authorize(["SERVICE_AGENT", "ADMIN"]),
    updateWorkerNonAvailability
);

router.put(
    "/:workerId/availability-status",
    protect,
    // authorize(["SERVICE_AGENT", "ADMIN", "WORKER"]),
    updateWorkerAvailabilityStatus
);

export default router;
