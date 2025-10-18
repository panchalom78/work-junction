import express from "express";
import {
    addWorkerService,
    getWorkerServices,
    updateWorkerService,
    deleteWorkerService,
    addPortfolioImage,
    deletePortfolioImage,
    updatePortfolioImageCaption,
} from "../controllers/worker-service.controller.js";
import multer from "multer";
import { authorize, protect } from "../middlewares/auth.middleware.js";
import { uploadPortfolio } from "../config/cloudinary.js";

const router = express.Router();

// Configure multer for memory storage (files will be processed by Cloudinary)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed!"), false);
        }
    },
});

// Apply authentication and worker authorization to all routes
router.use(protect, authorize("WORKER"));

// Get all worker services
router.get("/", getWorkerServices);

// Get single worker service
// router.get("/:serviceId", getWorkerServiceById);

// Add new service to worker profile
router.post("/", addWorkerService);

// Update worker service
router.put("/:serviceId", updateWorkerService);

// Delete worker service
router.delete("/:serviceId", deleteWorkerService);

// Portfolio image routes
router.post(
    "/:serviceId/portfolio",
    uploadPortfolio.single("image"),
    addPortfolioImage
);
router.delete("/:serviceId/portfolio/:imageId", deletePortfolioImage);
router.put(
    "/:serviceId/portfolio/:imageId/caption",
    updatePortfolioImageCaption
);

export default router;
