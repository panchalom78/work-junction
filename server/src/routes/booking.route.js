import express from "express";
import {
    getWorkerDetailsForBooking,
    checkWorkerAvailability,
    createBooking,
    getCustomerBookings,
    getBookingDetails,
    cancelBooking,
    getWorkerById,
} from "../controllers/booking.controller.js";
import { authorize, protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/worker/:workerId", getWorkerById);

// Public route - Get worker details for booking page
// GET /api/bookings/worker/:workerId/service/:workerServiceId
router.get(
    "/worker/:workerId/service/:workerServiceId",
    getWorkerDetailsForBooking
);

// Get available time slots for a worker on a specific date
// GET /api/bookings/worker/:workerId/available-slots?date=2024-01-15
router.get("/worker/:workerId/available-slots", getAvailableTimeSlots);

// Check worker availability for specific date and time
// POST /api/bookings/worker/:workerId/check-availability
// Body: { bookingDate, bookingTime }
router.post("/worker/:workerId/check-availability", checkWorkerAvailability);

// Protected routes - Require authentication
router.use(protect);

// Create a new booking (Customer only)
// POST /api/bookings
// Body: { workerId, workerServiceId, serviceId, bookingDate, bookingTime, customerName, customerEmail, customerPhone, address, pincode, additionalNotes }
router.post("/", authorize("CUSTOMER"), createBooking);

// Get all bookings for logged-in customer
// GET /api/bookings/my-bookings?status=PENDING&page=1&limit=10
router.get("/my-bookings", authorize("CUSTOMER"), getCustomerBookings);

// Get single booking details
// GET /api/bookings/:bookingId
router.get("/:bookingId", authorize(["CUSTOMER", "WORKER"]), getBookingDetails);

// Cancel booking (Customer only)
// PATCH /api/bookings/:bookingId/cancel
// Body: { cancellationReason }
router.patch("/:bookingId/cancel", authorize("CUSTOMER"), cancelBooking);

export default router;
