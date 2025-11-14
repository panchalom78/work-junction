import express from "express";
import { setupServiceAgent, getAgentStats, getAreaStats, getWorkerById, approveWorkerVerification  } from "../controllers/serviceAgent.controller.js";
import { getPendingWorkerVerifications, getWorkerVerificationDetails, getWorkerDocuments, updateDocumentVerification, approveVerification, rejectVerification } from "../controllers/serviceAgent-verification.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import {
  createWorker,
  uploadAllDocuments,
  addOrUpdateBankDetails,
  getBankDetails,
  addBankDetails,
  addSkillsAndServices,
  updateWorkerSkillsAndAvailability,
  getAgentWorkers,
  updateAvailability,
  getAgentWorkerBookings,
  getServiceRequests,
  updateRequestStatus,
  getBookingsByStatus,
  getPendingBookings,
  getAssignedBookings,
  getInProgressBookings,
  getCompletedBookings,
  getCancelledBookings,
  getAllBookings,
  getWorkerBookings
} from "../controllers/physicalWorker.controller.js";
import { uploadVerificationDoc } from "../config/cloudinary.js";
import { authorize } from "../middlewares/auth.middleware.js";
import { getAllWorkers, suspendWorker, getWorkerDetails, activateWorker, updatePersonal, updateAddress, updateBank, updateSkillsAndServices, getSkills } from "../controllers/workerManagement.controller.js";

const router = express.Router();
router.use(protect);
router.post("/setup", setupServiceAgent);
router.get("/stats", getAgentStats);
router.get("/area-stats", getAreaStats);
router.get("/workers-for-verification", getPendingWorkerVerifications);
router.get("/worker-details/:workerId", getWorkerDetails);
router.get('/worker-verification-details/:workerId', getWorkerVerificationDetails);
router.patch('/verify-worker/:workerId', approveWorkerVerification);
router.patch('/reject-worker/:workerId', rejectVerification);
router.get('/worker-documents/:workerId', getWorkerDocuments);
router.patch('/update-document-verification/:workerId', updateDocumentVerification);
router.post('/create-worker', createWorker);
router.post('/addSkillService/:workerId', addSkillsAndServices);


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
router.post('/addBankDetails/:workerId', addBankDetails);
router.post('/:workerId/skills-availability', updateWorkerSkillsAndAvailability);


router.get('/all-workers', getAllWorkers);
router.get('/worker-details/:workerId', getWorkerDetails);
router.patch('/suspend-worker/:workerId', suspendWorker);
router.patch('/activate-worker/:workerId', activateWorker);



router.put(
  "/worker/:id/personal", updatePersonal
);

router.put(
  "/worker/:id/address",
  updateAddress
);

router.put(
  "/worker/:id/bank",
  updateBank
);

router.put(
  "/worker/:id/skills-services",
  updateSkillsAndServices
);

router.get('/skills', getSkills);


router.get(
  "/non-smartphone-workers",
  authorize("SERVICE_AGENT"),
  getAgentWorkers
);

// UPDATE availability
router.patch(
  "/worker/:id/availability",
  authorize("SERVICE_AGENT"),
  updateAvailability
);

router.get('/service-requests', getAgentWorkerBookings);
router.get('/bookings', getServiceRequests);
router.patch('/bookings/:requestId/status', updateRequestStatus); 
router.get('/bookings/status/:status', getBookingsByStatus);
router.get('/pending', getPendingBookings);
router.get('/assigned', getAssignedBookings);
router.get('/in-progress', getInProgressBookings);
router.get('/completed', getCompletedBookings);
router.get('/cancelled', getCancelledBookings);
router.get('/all', getAllBookings);

// GET bookings for a specific worker
router.get('/bookings/:workerId', getWorkerBookings);

export default router;