// workerAvailability.store.js
import { create } from "zustand";
import axiosInstance from "../utils/axiosInstance";

const useWorkerAvailabilityStore = create((set, get) => ({
    // State
    availability: null,
    loading: false,
    error: null,
    success: false,

    // Actions
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setSuccess: (success) => set({ success }),
    clearState: () =>
        set({
            loading: false,
            error: null,
            success: false,
        }),

    // Get worker availability
    getWorkerAvailability: async (workerId) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get(
                `/api/service-agent/workers/${workerId}/availability`
            );

            if (response.data.success) {
                set({
                    availability: response.data.data,
                    loading: false,
                    error: null,
                });
                return response.data.data;
            } else {
                throw new Error(
                    response.data.message || "Failed to fetch availability"
                );
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            set({
                error: errorMessage,
                loading: false,
            });
            throw error;
        }
    },

    // Setup worker availability (complete setup)
    setupWorkerAvailability: async (workerId, availabilityData) => {
        set({ loading: true, error: null, success: false });
        try {
            const response = await axiosInstance.post(
                `/api/service-agent/workers/${workerId}/availability`,
                availabilityData
            );

            if (response.data.success) {
                set({
                    availability: response.data.data,
                    loading: false,
                    success: true,
                    error: null,
                });
                return response.data.data;
            } else {
                throw new Error(
                    response.data.message || "Failed to setup availability"
                );
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            set({
                error: errorMessage,
                loading: false,
                success: false,
            });
            throw error;
        }
    },

    // Update timetable
    updateTimetable: async (workerId, timetable) => {
        set({ loading: true, error: null, success: false });
        try {
            const response = await axiosInstance.put(
                `/api/service-agent/workers/${workerId}/timetable`,
                { timetable }
            );

            if (response.data.success) {
                const currentAvailability = get().availability;
                set({
                    availability: {
                        ...currentAvailability,
                        timetable: response.data.data.timetable,
                    },
                    loading: false,
                    success: true,
                    error: null,
                });
                return response.data.data;
            } else {
                throw new Error(
                    response.data.message || "Failed to update timetable"
                );
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            set({
                error: errorMessage,
                loading: false,
                success: false,
            });
            throw error;
        }
    },

    // Update non-availability
    updateNonAvailability: async (workerId, nonAvailability) => {
        set({ loading: true, error: null, success: false });
        try {
            const response = await axiosInstance.put(
                `/api/service-agent/workers/${workerId}/non-availability`,
                { nonAvailability }
            );

            if (response.data.success) {
                const currentAvailability = get().availability;
                set({
                    availability: {
                        ...currentAvailability,
                        nonAvailability: response.data.data.nonAvailability,
                    },
                    loading: false,
                    success: true,
                    error: null,
                });
                return response.data.data;
            } else {
                throw new Error(
                    response.data.message || "Failed to update non-availability"
                );
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            set({
                error: errorMessage,
                loading: false,
                success: false,
            });
            throw error;
        }
    },

    // Update availability status
    updateAvailabilityStatus: async (workerId, availabilityStatus) => {
        set({ loading: true, error: null, success: false });
        try {
            const response = await axiosInstance.put(
                `/api/service-agent/workers/${workerId}/availability-status`,
                { availabilityStatus }
            );

            if (response.data.success) {
                const currentAvailability = get().availability;
                set({
                    availability: {
                        ...currentAvailability,
                        availabilityStatus:
                            response.data.data.availabilityStatus,
                    },
                    loading: false,
                    success: true,
                    error: null,
                });
                return response.data.data;
            } else {
                throw new Error(
                    response.data.message ||
                        "Failed to update availability status"
                );
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            set({
                error: errorMessage,
                loading: false,
                success: false,
            });
            throw error;
        }
    },
}));

export default useWorkerAvailabilityStore;
