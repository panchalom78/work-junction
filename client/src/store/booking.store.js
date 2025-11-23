import { create } from "zustand";
import { bookingService } from "../services/booking.service";
import axiosInstance from "../utils/axiosInstance";

export const useBookingStore = create((set, get) => ({
    // State
    bookings: [],
    currentBooking: null,
    loading: false,
    error: null,

    // Actions
    createBooking: async (bookingData) => {
        set({ loading: true, error: null });
        try {
            const response = await bookingService.createBooking(bookingData);
            set({ loading: false });
            return response;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message || "Failed to create booking",
                loading: false,
            });
            throw error;
        }
    },

    getCustomerBookings: async (filters = {}) => {
        set({ loading: true, error: null });
        try {
            const response = await bookingService.getCustomerBookings(filters);
            set({
                bookings: response.data,
                loading: false,
            });
            console.log(response.data);

            return response;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message || "Failed to fetch bookings",
                loading: false,
            });
            throw error;
        }
    },

    getBookingById: async (bookingId) => {
        set({ loading: true, error: null });
        try {
            const response = await bookingService.getBookingById(bookingId);
            set({
                currentBooking: response.data,
                loading: false,
            });
            return response;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message || "Failed to fetch booking",
                loading: false,
            });
            throw error;
        }
    },

    updateBookingStatus: async (bookingId, statusData) => {
        set({ loading: true, error: null });
        try {
            const response = await bookingService.updateBookingStatus(
                bookingId,
                statusData
            );

            // Update the booking in local state
            set((state) => ({
                bookings: state.bookings.map((booking) =>
                    booking._id === bookingId ? response.data : booking
                ),
                currentBooking:
                    state.currentBooking?._id === bookingId
                        ? response.data
                        : state.currentBooking,
                loading: false,
            }));

            return response;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message || "Failed to update booking",
                loading: false,
            });
            throw error;
        }
    },

    addReview: async (bookingId, reviewData) => {
        set({ loading: true, error: null });
        try {
            const response = await bookingService.addReview(
                bookingId,
                reviewData
            );

            // Update the booking in local state
            set((state) => ({
                bookings: state.bookings.map((booking) =>
                    booking._id === bookingId ? response.data : booking
                ),
                currentBooking:
                    state.currentBooking?._id === bookingId
                        ? response.data
                        : state.currentBooking,
                loading: false,
            }));

            return response;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message || "Failed to submit review",
                loading: false,
            });
            throw error;
        }
    },

    checkAvailability: async (workerId, date, time) => {
        set({ loading: true, error: null });
        try {
            const response = await bookingService.checkAvailability(
                workerId,
                date,
                time
            );
            set({ loading: false });
            return response;
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
    // In your booking.store.js, ensure you have:
    getWorkerBookings: async (filters = {}) => {
        set({ loading: true, error: null });
        try {
            const response = await bookingService.getWorkerBookings(filters);
            set({
                bookings: response.data,
                loading: false,
            });
            return response;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message || "Failed to fetch bookings",
                loading: false,
            });
            throw error;
        }
    },
    initiateService: async (bookingId) => {
        set({ loading: true, error: null });
        try {
            const response = await bookingService.initiateService(bookingId);
            set({ loading: false });
            return response;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message ||
                    "Failed to initiate service",
                loading: false,
            });
            throw error;
        }
    },

    // Verify service OTP to start service
    verifyServiceOtp: async (bookingId, otp) => {
        set({ loading: true, error: null });
        try {
            const response = await bookingService.verifyServiceOtp(
                bookingId,
                otp
            );
            set({ loading: false });
            return response;
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to verify OTP",
                loading: false,
            });
            throw error;
        }
    },

    // Complete service
    completeService: async (bookingId) => {
        set({ loading: true, error: null });
        try {
            const response = await bookingService.completeService(bookingId);

            // Update the booking in local state
            set((state) => ({
                bookings: state.bookings.map((booking) =>
                    booking._id === bookingId ? response.data : booking
                ),
                currentBooking:
                    state.currentBooking?._id === bookingId
                        ? response.data
                        : state.currentBooking,
                loading: false,
            }));

            return response;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message ||
                    "Failed to complete service",
                loading: false,
            });
            throw error;
        }
    },

    // Add this to your store/booking.store.js

    // Update booking price
    updateBookingPrice: async (bookingId, updateData) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.patch(
                `/api/bookings/${bookingId}/price`,
                updateData
            );

            // Update the local state
            set((state) => ({
                bookings: state.bookings.map((booking) =>
                    booking._id === bookingId
                        ? { ...booking, ...response.data.data }
                        : booking
                ),
                loading: false,
            }));

            return response.data;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message || "Failed to update price",
                loading: false,
            });
            throw error;
        }
    },

    getAvailableSlotsForWeek: async (workerId, duration) => {
        set({ loading: true, error: null });
        try {
            const response = await bookingService.getAvailableSlotsForWeek(
                workerId,
                duration
            );
            set({ loading: false });
            return response;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message ||
                    "Failed to fetch available slots",
                loading: false,
            });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
    clearCurrentBooking: () => set({ currentBooking: null }),
}));
