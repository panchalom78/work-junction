import express from "express";
import {
    getMyTimetable,
    updateMyTimetable,
    addMyNonAvailability,
    getMyNonAvailability,
    removeMyNonAvailability,
    getMyAvailability,
    getWorkerTimetable,
    getAvailabilityStatus,
    setAvailabilityStatus,
} from "../controllers/worker-schedule.controller.js";
import { authorize, protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect, authorize("WORKER"));

// Worker's own schedule management (for WORKER role)
router.get("/my/timetable", getMyTimetable);
router.put("/my/timetable", updateMyTimetable);
router.get("/my/non-availability", getMyNonAvailability);
router.post("/my/non-availability", addMyNonAvailability);
router.delete("/my/non-availability/:slotId", removeMyNonAvailability);
router.get("/my/availability", getMyAvailability);

// Admin/Service Agent routes to manage other workers
router.get("/:workerId/timetable", getWorkerTimetable);

router.get("/my/availability-status", getAvailabilityStatus); // GET status
router.put("/my/availability-status", setAvailabilityStatus); // UPDATE status

export default router;
