import User from "../models/user.model.js";

// Get worker timetable (for authenticated worker)
export const getMyTimetable = async (req, res) => {
    try {
        const workerId = req.user._id;

        const worker = await User.findOne(
            {
                _id: workerId,
                role: "WORKER",
            },
            {
                "workerProfile.timetable": 1,
                name: 1,
            }
        );

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                timetable: worker.workerProfile?.timetable || {},
                workerName: worker.name,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching timetable",
            error: error.message,
        });
    }
};

// Update worker timetable (for authenticated worker)
export const updateMyTimetable = async (req, res) => {
    try {
        const workerId = req.user._id;
        const { timetable } = req.body;

        if (!timetable) {
            return res.status(400).json({
                success: false,
                message: "Timetable data is required",
            });
        }

        // Validate timetable structure
        const days = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ];
        for (const day of days) {
            if (timetable[day] && !Array.isArray(timetable[day])) {
                return res.status(400).json({
                    success: false,
                    message: `Timetable for ${day} must be an array`,
                });
            }

            // Validate each time slot
            if (timetable[day]) {
                for (const slot of timetable[day]) {
                    if (!slot.start || !slot.end) {
                        return res.status(400).json({
                            success: false,
                            message: `Each time slot must have start and end times`,
                        });
                    }

                    // Validate time format (optional: HH:MM format)
                    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
                    if (
                        !timeRegex.test(slot.start) ||
                        !timeRegex.test(slot.end)
                    ) {
                        return res.status(400).json({
                            success: false,
                            message: `Time slots must be in HH:MM format`,
                        });
                    }
                }
            }
        }

        const worker = await User.findOneAndUpdate(
            {
                _id: workerId,
                role: "WORKER",
            },
            {
                $set: { "workerProfile.timetable": timetable },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Timetable updated successfully",
            data: {
                timetable: worker.workerProfile.timetable,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating timetable",
            error: error.message,
        });
    }
};

// Add non-availability slot (for authenticated worker)
export const addMyNonAvailability = async (req, res) => {
    try {
        const workerId = req.user._id;
        const { startDateTime, endDateTime, reason } = req.body;

        if (!startDateTime || !endDateTime) {
            return res.status(400).json({
                success: false,
                message: "Start date time and end date time are required",
            });
        }

        const start = new Date(startDateTime);
        const end = new Date(endDateTime);

        if (end <= start) {
            return res.status(400).json({
                success: false,
                message: "End date time must be after start date time",
            });
        }

        if (start < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Cannot add non-availability for past dates",
            });
        }

        // Check for overlapping non-availability slots
        const existingWorker = await User.findOne({
            _id: workerId,
            role: "WORKER",
        });

        if (existingWorker?.workerProfile?.nonAvailability) {
            const hasOverlap =
                existingWorker.workerProfile.nonAvailability.some((slot) => {
                    const slotStart = new Date(slot.startDateTime);
                    const slotEnd = new Date(slot.endDateTime);
                    return start < slotEnd && end > slotStart;
                });

            if (hasOverlap) {
                return res.status(400).json({
                    success: false,
                    message:
                        "This time slot overlaps with existing non-availability",
                });
            }
        }

        const nonAvailabilitySlot = {
            startDateTime: start,
            endDateTime: end,
            reason: reason || "",
        };

        const worker = await User.findOneAndUpdate(
            {
                _id: workerId,
                role: "WORKER",
            },
            {
                $push: { "workerProfile.nonAvailability": nonAvailabilitySlot },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        res.status(201).json({
            success: true,
            message: "Non-availability slot added successfully",
            data: {
                nonAvailability: worker.workerProfile.nonAvailability,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error adding non-availability slot",
            error: error.message,
        });
    }
};

// Get worker non-availability (for authenticated worker)
export const getMyNonAvailability = async (req, res) => {
    try {
        const workerId = req.user._id;
        const { startDate, endDate } = req.query;

        const worker = await User.findOne(
            {
                _id: workerId,
                role: "WORKER",
            },
            {
                "workerProfile.nonAvailability": 1,
                name: 1,
            }
        );

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        let nonAvailability = worker.workerProfile?.nonAvailability || [];

        // Filter by date range if provided
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);

            nonAvailability = nonAvailability.filter((slot) => {
                const slotStart = new Date(slot.startDateTime);
                return slotStart >= start && slotStart <= end;
            });
        }

        // Sort by start date time
        nonAvailability.sort(
            (a, b) => new Date(a.startDateTime) - new Date(b.startDateTime)
        );

        res.status(200).json({
            success: true,
            data: {
                nonAvailability,
                workerName: worker.name,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching non-availability",
            error: error.message,
        });
    }
};

// Remove non-availability slot (for authenticated worker)
export const removeMyNonAvailability = async (req, res) => {
    try {
        const workerId = req.user._id;
        const { slotId } = req.params;

        const worker = await User.findOneAndUpdate(
            {
                _id: workerId,
                role: "WORKER",
            },
            {
                $pull: {
                    "workerProfile.nonAvailability": {
                        _id: slotId,
                    },
                },
            },
            {
                new: true,
            }
        );

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found or slot does not exist",
            });
        }

        res.status(200).json({
            success: true,
            message: "Non-availability slot removed successfully",
            data: {
                nonAvailability: worker.workerProfile.nonAvailability,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error removing non-availability slot",
            error: error.message,
        });
    }
};

// Get worker availability for a specific date (for authenticated worker)
export const getMyAvailability = async (req, res) => {
    try {
        const workerId = req.user._id;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Date parameter is required",
            });
        }

        const targetDate = new Date(date);
        const dayOfWeek = targetDate.toLocaleDateString("en-US", {
            weekday: "long",
        });

        const worker = await User.findOne(
            {
                _id: workerId,
                role: "WORKER",
            },
            {
                "workerProfile.timetable": 1,
                "workerProfile.nonAvailability": 1,
                name: 1,
            }
        );

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        // Get regular timetable for the day
        const dayTimetable = worker.workerProfile?.timetable?.[dayOfWeek] || [];

        // Check for non-availability on the specific date
        const nonAvailabilitySlots =
            worker.workerProfile?.nonAvailability?.filter((slot) => {
                const slotDate = new Date(slot.startDateTime).toDateString();
                return slotDate === targetDate.toDateString();
            }) || [];

        // Calculate available slots by excluding non-availability
        let availableSlots = [...dayTimetable];

        nonAvailabilitySlots.forEach((nonAvailSlot) => {
            const nonAvailStart = nonAvailSlot.startDateTime
                .toTimeString()
                .slice(0, 5);
            const nonAvailEnd = nonAvailSlot.endDateTime
                .toTimeString()
                .slice(0, 5);

            availableSlots = availableSlots.filter((availSlot) => {
                // Check if available slot overlaps with non-availability
                return !(
                    availSlot.start < nonAvailEnd &&
                    availSlot.end > nonAvailStart
                );
            });
        });

        res.status(200).json({
            success: true,
            data: {
                date: targetDate.toISOString().split("T")[0],
                dayOfWeek,
                regularTimetable: dayTimetable,
                nonAvailability: nonAvailabilitySlots,
                availableSlots,
                workerName: worker.name,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error checking availability",
            error: error.message,
        });
    }
};

// Admin/SERVICE_AGENT routes to manage other workers' schedules
export const getWorkerTimetable = async (req, res) => {
    try {
        const { workerId } = req.params;

        // Check if requester has permission (admin or service agent)
        if (!["ADMIN", "SERVICE_AGENT"].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message:
                    "Access denied. Only admins and service agents can view other workers' timetables",
            });
        }

        const worker = await User.findOne(
            {
                _id: workerId,
                role: "WORKER",
            },
            {
                "workerProfile.timetable": 1,
                name: 1,
            }
        );

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                timetable: worker.workerProfile?.timetable || {},
                workerName: worker.name,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching timetable",
            error: error.message,
        });
    }
};

export const setAvailabilityStatus = async (req, res) => {
    try {
        const workerId = req.user._id;
        const { status } = req.body;

        if (!status || !["available", "busy", "off-duty"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Valid status is required (available, busy, off-duty)",
            });
        }

        const worker = await User.findOneAndUpdate(
            {
                _id: workerId,
                role: "WORKER",
            },
            {
                $set: { "workerProfile.availabilityStatus": status },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Availability status updated successfully",
            data: {
                status: worker.workerProfile.availabilityStatus,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating availability status",
            error: error.message,
        });
    }
};

// Get availability status (updated for worker profile schema)
export const getAvailabilityStatus = async (req, res) => {
    try {
        const workerId = req.user._id;

        const worker = await User.findOne(
            {
                _id: workerId,
                role: "WORKER",
            },
            {
                name: 1,
                "workerProfile.availabilityStatus": 1,
            }
        );

        if (!worker) {
            return res.status(404).json({
                success: false,
                message: "Worker not found",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                status: worker.workerProfile?.availabilityStatus || "available",
                workerName: worker.name,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching availability status",
            error: error.message,
        });
    }
};
