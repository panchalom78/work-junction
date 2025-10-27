import express from "express";
import {
    createBooking,
    getCustomerBookings,
    getWorkerBookings,
    getBookingById,
    updateBookingStatus,
    addBookingReview,
    checkWorkerAvailability,
    initiateService,
    verifyServiceOtp,
    completeService,
} from "../controllers/customer-booking.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
const router = express.Router();

// Public routes
router.get("/worker/:workerId/availability", checkWorkerAvailability);

// Protected routes
router.use(protect);

// Customer routes
router.post("/", createBooking);
router.get("/customer", getCustomerBookings);
router.post("/:bookingId/review", addBookingReview);

// Worker routes
router.get("/worker", getWorkerBookings);
router.patch("/:bookingId/status", updateBookingStatus);

// Common routes
router.get("/:bookingId", getBookingById);

router.post("/:bookingId/initiate-service", initiateService);
router.post("/:bookingId/verify-service-otp", verifyServiceOtp);
router.post("/:bookingId/complete-service", completeService);

export default router;
