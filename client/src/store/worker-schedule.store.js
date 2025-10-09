import { create } from "zustand";
import api from "../utils/axiosInstance";

const useWorkerScheduleStore = create((set, get) => ({
    // State
    timetable: null,
    nonAvailability: [],
    availabilityStatus: "available",
    loading: false,
    error: null,

    // Actions
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),

    // Get worker timetable
    getTimetable: async () => {
        try {
            set({ loading: true, error: null });
            const response = await api.get("/api/workers/my/timetable");
            set({
                timetable: response.data.data.timetable,
                loading: false,
            });
            return response.data;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message ||
                    "Failed to fetch timetable",
                loading: false,
            });
            throw error;
        }
    },

    // Update worker timetable
    updateTimetable: async (timetableData) => {
        try {
            set({ loading: true, error: null });
            const response = await api.put("/api/workers/my/timetable", {
                timetable: timetableData,
            });
            set({
                timetable: response.data.data.timetable,
                loading: false,
            });
            return response.data;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message ||
                    "Failed to update timetable",
                loading: false,
            });
            throw error;
        }
    },

    // Get non-availability
    getNonAvailability: async (startDate, endDate) => {
        try {
            set({ loading: true, error: null });
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const response = await api.get("/api/workers/my/non-availability", {
                params,
            });
            set({
                nonAvailability: response.data.data.nonAvailability,
                loading: false,
            });
            return response.data;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message ||
                    "Failed to fetch non-availability",
                loading: false,
            });
            throw error;
        }
    },

    // Add non-availability
    addNonAvailability: async (nonAvailabilityData) => {
        try {
            set({ loading: true, error: null });
            const response = await api.post(
                "/api/workers/my/non-availability",
                nonAvailabilityData
            );
            set({
                nonAvailability: response.data.data.nonAvailability,
                loading: false,
            });
            return response.data;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message ||
                    "Failed to add non-availability",
                loading: false,
            });
            throw error;
        }
    },

    // Remove non-availability
    removeNonAvailability: async (slotId) => {
        try {
            set({ loading: true, error: null });
            const response = await api.delete(
                `/api/workers/my/non-availability/${slotId}`
            );
            set({
                nonAvailability: response.data.data.nonAvailability,
                loading: false,
            });
            return response.data;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message ||
                    "Failed to remove non-availability",
                loading: false,
            });
            throw error;
        }
    },

    // Check availability for specific date
    checkAvailability: async (date) => {
        try {
            set({ loading: true, error: null });
            const response = await api.get(
                "/api/workers/my/availability-status",
                {
                    params: { date },
                }
            );
            set({ loading: false });
            return response.data;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message ||
                    "Failed to check availability",
                loading: false,
            });
            throw error;
        }
    },

    // Set availability status
    setAvailabilityStatus: async (status) => {
        try {
            set({ loading: true, error: null });
            // This would be a separate API endpoint for status management
            const response = await api.put(
                "/api/workers/my/availability-status",
                {
                    status,
                }
            );
            set({
                availabilityStatus: status,
                loading: false,
            });
            return response.data;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message ||
                    "Failed to update availability status",
                loading: false,
            });
            throw error;
        }
    },

    // Convert timetable data to frontend format
    formatTimetableForFrontend: (timetable) => {
        if (!timetable) return { weeklySlots: [], customSlots: [] };

        const weeklySlots = [];
        const customSlots = [];

        // Convert weekly timetable
        Object.keys(timetable).forEach((day) => {
            const daySlots = timetable[day];
            if (Array.isArray(daySlots)) {
                daySlots.forEach((slot, index) => {
                    weeklySlots.push({
                        id: `${day}-${index}`,
                        day: day.toLowerCase(),
                        startTime: slot.start,
                        endTime: slot.end,
                    });
                });
            }
        });

        return { weeklySlots, customSlots };
    },

    // Convert frontend format to API format
    formatTimetableForAPI: (weeklySlots) => {
        const timetable = {
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
            Saturday: [],
            Sunday: [],
        };

        weeklySlots.forEach((slot) => {
            const day = slot.day.charAt(0).toUpperCase() + slot.day.slice(1);
            if (timetable[day]) {
                timetable[day].push({
                    start: slot.startTime,
                    end: slot.endTime,
                });
            }
        });

        return timetable;
    },

    // Convert non-availability to frontend format
    formatNonAvailabilityForFrontend: (nonAvailability) => {
        return nonAvailability.map((slot) => ({
            id: slot._id,
            date: new Date(slot.startDateTime).toISOString().split("T")[0],
            startTime: new Date(slot.startDateTime).toTimeString().slice(0, 5),
            endTime: new Date(slot.endDateTime).toTimeString().slice(0, 5),
            reason: slot.reason,
        }));
    },

    // Convert frontend format to non-availability API format
    formatNonAvailabilityForAPI: (customSlot) => {
        const startDateTime = new Date(
            `${customSlot.date}T${customSlot.startTime}`
        );
        const endDateTime = new Date(
            `${customSlot.date}T${customSlot.endTime}`
        );

        return {
            startDateTime: startDateTime.toISOString(),
            endDateTime: endDateTime.toISOString(),
            reason: customSlot.reason || "",
        };
    },
}));

export default useWorkerScheduleStore;
