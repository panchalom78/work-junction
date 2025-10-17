import express from "express";
import {
    searchWorkers,
    getSearchFilters,
    getWorkerProfile,
    getWorkerReviews,
} from "../controllers/workerSearch.controller.js";

const router = express.Router();

// Search workers with filters
router.get("/search", searchWorkers);

// Get available filters (skills, price range, etc.)
router.get("/filters", getSearchFilters);

// Get worker profile details
router.get("/worker/:workerId", getWorkerProfile);

router.get("/worker/:workerId/reviews", getWorkerReviews);

export default router;
