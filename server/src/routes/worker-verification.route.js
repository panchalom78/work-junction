import { Router } from "express";
const router = Router();

import {
    uploadSelfie,
    uploadAadhar,
    uploadPoliceVerification,
    uploadAllDocuments,
    getVerificationStatus,
    deleteDocument,
} from "../controllers/worker-verification.controller.js";

import {
    getPendingVerifications,
    getWorkerVerificationDetails,
    approveVerification,
    rejectVerification,
    getVerificationStats,
    getMyAreaWorkers,
} from "../controllers/serviceAgent-verification.controller.js";

import { protect, authorize } from "../middlewares/auth.middleware.js";
import {
    handleMulterError,
    validateFileType,
} from "../middlewares/upload.middleware.js";
import {
    uploadSelfie as multerSelfie,
    uploadAadhar as multerAadhar,
    uploadPoliceVerification as multerPolice,
    uploadVerificationDoc,
} from "../config/cloudinary.js";

// Worker routes - upload documents
router.post(
    "/upload-selfie",
    protect,
    authorize("WORKER"),
    multerSelfie.single("selfie"),
    handleMulterError,
    validateFileType(["image"]),
    uploadSelfie
);

router.post(
    "/upload-aadhar",
    protect,
    authorize("WORKER"),
    multerAadhar.single("aadhar"),
    handleMulterError,
    validateFileType(["image", "pdf"]),
    uploadAadhar
);

router.post(
    "/upload-police-verification",
    protect,
    authorize("WORKER"),
    multerPolice.single("policeVerification"),
    handleMulterError,
    validateFileType(["image", "pdf"]),
    uploadPoliceVerification
);

router.post(
    "/upload-all",
    protect,
    authorize("WORKER"),
    uploadVerificationDoc.fields([
        { name: "selfie", maxCount: 1 },
        { name: "aadhar", maxCount: 1 },
        { name: "policeVerification", maxCount: 1 },
    ]),
    handleMulterError,
    uploadAllDocuments
);

router.get("/status", protect, authorize("WORKER"), getVerificationStatus);

router.delete("/:documentType", protect, authorize("WORKER"), deleteDocument);

// Service Agent / Admin routes - verify workers
router.get(
    "/pending",
    protect,
    authorize("SERVICE_AGENT", "ADMIN"),
    getPendingVerifications
);

router.get(
    "/stats",
    protect,
    authorize("SERVICE_AGENT", "ADMIN"),
    getVerificationStats
);

router.get(
    "/my-area-workers",
    protect,
    authorize("SERVICE_AGENT"),
    getMyAreaWorkers
);

router.get(
    "/:workerId",
    protect,
    authorize("SERVICE_AGENT", "ADMIN"),
    getWorkerVerificationDetails
);

router.put(
    "/:workerId/approve",
    protect,
    authorize("SERVICE_AGENT", "ADMIN"),
    approveVerification
);

router.put(
    "/:workerId/reject",
    protect,
    authorize("SERVICE_AGENT", "ADMIN"),
    rejectVerification
);

export default router;
