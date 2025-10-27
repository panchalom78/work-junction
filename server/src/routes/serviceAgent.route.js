import express from "express";
import { setupServiceAgent, getAgentStats, getAreaStats, getWorkersForVerification  ,getWorkerDetails, approveWorkerVerification, rejectWorkerVerification, getAllWorkers, getWorkerById, suspendWorker, activateWorker} from "../controllers/serviceAgent.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { createWorker , uploadAllDocuments , addOrUpdateBankDetails , getBankDetails , addBankDetails ,updateWorkerSkillsAndAvailability } from "../controllers/physicalWorker.controller.js";
import { handleMulterError } from "../middlewares/upload.middleware.js";
import { uploadVerificationDoc } from "../config/cloudinary.js";
import { authorize } from "../middlewares/auth.middleware.js";


const router = express.Router();
router.use(protect);
router.post("/setup", setupServiceAgent);
router.get("/stats", getAgentStats);
router.get("/area-stats", getAreaStats);
router.get("/workers-for-verification", getWorkersForVerification);
router.get("/worker-details/:workerId", getWorkerDetails);
router.put("/worker-verification/:workerId/approve", approveWorkerVerification);
router.put("/worker-verification/:workerId/reject", rejectWorkerVerification);
router.get("/all-workers", getAllWorkers);
router.get("/worker-details/:workerId", getWorkerById);
router.put("/suspend-worker/:workerId", suspendWorker);
router.put("/activate-worker/:workerId", activateWorker);
router.post ("/create-worker", createWorker);

router.post(
    "/upload-documents/:workerId",
    protect,
    authorize("SERVICE_AGENT"),
    uploadVerificationDoc.fields([
        { name: "selfie", maxCount: 1 },
        { name: "aadhar", maxCount: 1 },
        { name: "policeVerification", maxCount: 1 },
    ]),
    uploadAllDocuments
);

router.post("/workers/:workerId/bank-details", addOrUpdateBankDetails);

// Get bank details
router.get("/workers/:workerId/bank-details", getBankDetails);
router.post("/:workerId/add-bank", addBankDetails);
router.post('/:workerId/skills-availability', updateWorkerSkillsAndAvailability);
export default router;