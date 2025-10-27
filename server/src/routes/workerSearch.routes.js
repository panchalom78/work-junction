// workerSearch.routes.js
import express from "express";
import {
    getWorkerSearchResults,
    getSearchFilters,
    getWorkerProfile, // Add this import
} from "../controllers/workerSearch.controller.js";

const router = express.Router();

// Search workers with filters
router.get("/search", getWorkerSearchResults);

// Get available filters (skills, price range, etc.)
router.get("/filters", getSearchFilters);

// Get complete worker profile
router.get("/profile/:workerId", getWorkerProfile);

export default router;
