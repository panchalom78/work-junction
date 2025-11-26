// workerAvailability.controller.js
import mongoose from "mongoose";
import User from "../models/user.model.js";
import { successResponse, errorResponse } from "../utils/response.js";

/**
 * @desc Get worker availability/timetable
 */
export const getWorkerAvailability = async (req, res) => {
    try {
        const { workerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return errorResponse(res, 400, "Invalid worker ID");
        }

        const worker = await User.findOne({
            _id: workerId,
            role: "WORKER",
        }).select(
            "workerProfile.timetable workerProfile.nonAvailability workerProfile.availabilityStatus"
        );

        if (!worker) {
            return errorResponse(res, 404, "Worker not found");
        }

        const availabilityData = {
            timetable: worker.workerProfile?.timetable || {},
            nonAvailability: worker.workerProfile?.nonAvailability || [],
            availabilityStatus:
                worker.workerProfile?.availabilityStatus || "available",
        };

        return successResponse(
            res,
            200,
            "Worker availability fetched successfully",
            availabilityData
        );
    } catch (error) {
        console.error("Error fetching worker availability:", error);
        return errorResponse(res, 500, "Failed to fetch worker availability");
    }
};

/**
 * @desc Update worker timetable
 */
export const updateWorkerTimetable = async (req, res) => {
    try {
        const { workerId } = req.params;
        const { timetable } = req.body;

        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return errorResponse(res, 400, "Invalid worker ID");
        }

        if (!timetable || typeof timetable !== "object") {
            return errorResponse(res, 400, "Timetable data is required");
        }

        const worker = await User.findOne({
            _id: workerId,
            role: "WORKER",
        });

        if (!worker) {
            return errorResponse(res, 404, "Worker not found");
        }

        // Initialize workerProfile if it doesn't exist
        if (!worker.workerProfile) {
            worker.workerProfile = {};
        }

        // Update timetable
        worker.workerProfile.timetable = timetable;

        await worker.save();

        return successResponse(
            res,
            200,
            "Worker timetable updated successfully",
            { timetable: worker.workerProfile.timetable }
        );
    } catch (error) {
        console.error("Error updating worker timetable:", error);
        return errorResponse(res, 500, "Failed to update worker timetable");
    }
};

/**
 * @desc Update worker non-availability dates
 */
export const updateWorkerNonAvailability = async (req, res) => {
    try {
        const { workerId } = req.params;
        const { nonAvailability } = req.body;

        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return errorResponse(res, 400, "Invalid worker ID");
        }

        if (!Array.isArray(nonAvailability)) {
            return errorResponse(res, 400, "Non-availability must be an array");
        }

        const worker = await User.findOne({
            _id: workerId,
            role: "WORKER",
        });

        if (!worker) {
            return errorResponse(res, 404, "Worker not found");
        }

        // Initialize workerProfile if it doesn't exist
        if (!worker.workerProfile) {
            worker.workerProfile = {};
        }

        // Validate and update non-availability
        const validNonAvailability = nonAvailability.map((item) => ({
            startDateTime: new Date(item.startDateTime),
            endDateTime: new Date(item.endDateTime),
            reason: item.reason || "Not specified",
        }));

        worker.workerProfile.nonAvailability = validNonAvailability;

        await worker.save();

        return successResponse(
            res,
            200,
            "Worker non-availability updated successfully",
            { nonAvailability: worker.workerProfile.nonAvailability }
        );
    } catch (error) {
        console.error("Error updating worker non-availability:", error);
        return errorResponse(
            res,
            500,
            "Failed to update worker non-availability"
        );
    }
};

/**
 * @desc Update worker availability status
 */
export const updateWorkerAvailabilityStatus = async (req, res) => {
    try {
        const { workerId } = req.params;
        const { availabilityStatus } = req.body;

        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return errorResponse(res, 400, "Invalid worker ID");
        }

        if (!["available", "busy", "off-duty"].includes(availabilityStatus)) {
            return errorResponse(res, 400, "Invalid availability status");
        }

        const worker = await User.findOne({
            _id: workerId,
            role: "WORKER",
        });

        if (!worker) {
            return errorResponse(res, 404, "Worker not found");
        }

        // Initialize workerProfile if it doesn't exist
        if (!worker.workerProfile) {
            worker.workerProfile = {};
        }

        worker.workerProfile.availabilityStatus = availabilityStatus;
        await worker.save();

        return successResponse(
            res,
            200,
            "Worker availability status updated successfully",
            { availabilityStatus: worker.workerProfile.availabilityStatus }
        );
    } catch (error) {
        console.error("Error updating worker availability status:", error);
        return errorResponse(res, 500, "Failed to update availability status");
    }
};

/**
 * @desc Complete worker availability setup (timetable + non-availability)
 */
export const setupWorkerAvailability = async (req, res) => {
    try {
        const { workerId } = req.params;
        const { weeklySlots, nonAvailability, status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(workerId)) {
            return errorResponse(res, 400, "Invalid worker ID");
        }

        const worker = await User.findOne({
            _id: workerId,
            role: "WORKER",
        });

        if (!worker) {
            return errorResponse(res, 404, "Worker not found");
        }

        // Initialize workerProfile if it doesn't exist
        if (!worker.workerProfile) {
            worker.workerProfile = {};
        }

        // Convert weeklySlots to timetable format
        const timetable = {};
        const days = [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
        ];

        days.forEach((day) => {
            const daySlot = weeklySlots.find((slot) => slot.day === day);
            if (daySlot && daySlot.enabled && daySlot.timeSlots.length > 0) {
                timetable[day.charAt(0).toUpperCase() + day.slice(1)] =
                    daySlot.timeSlots.map((slot) => ({
                        start: slot.startTime,
                        end: slot.endTime,
                    }));
            } else {
                timetable[day.charAt(0).toUpperCase() + day.slice(1)] = [];
            }
        });

        // Update timetable
        worker.workerProfile.timetable = timetable;

        // Update non-availability
        if (nonAvailability && Array.isArray(nonAvailability)) {
            worker.workerProfile.nonAvailability = nonAvailability.map(
                (item) => ({
                    startDateTime: new Date(item.date + "T00:00:00"),
                    endDateTime: new Date(item.date + "T23:59:59"),
                    reason: item.reason || "Not available",
                })
            );
        }

        // Update availability status
        if (status) {
            worker.workerProfile.availabilityStatus = status;
        }

        await worker.save();

        return successResponse(
            res,
            200,
            "Worker availability setup completed successfully",
            {
                timetable: worker.workerProfile.timetable,
                nonAvailability: worker.workerProfile.nonAvailability,
                availabilityStatus: worker.workerProfile.availabilityStatus,
            }
        );
    } catch (error) {
        console.error("Error setting up worker availability:", error);
        return errorResponse(res, 500, "Failed to setup worker availability");
    }
};
