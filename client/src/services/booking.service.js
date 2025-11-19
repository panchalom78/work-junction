import axiosInstance from "../utils/axiosInstance";

export const bookingService = {
    // Create new booking
    createBooking: async (bookingData) => {
        const response = await axiosInstance.post("/api/bookings", bookingData);
        return response.data;
    },

    // Get customer bookings
    getCustomerBookings: async (filters = {}) => {
        const response = await axiosInstance.get("/api/bookings/customer", {
            params: filters,
        });
        return response.data;
    },

    // Get worker bookings
    getWorkerBookings: async (filters = {}) => {
        const response = await axiosInstance.get("/api/bookings/worker", {
            params: filters,
        });
        return response.data;
    },

    // Get booking by ID
    getBookingById: async (bookingId) => {
        const response = await axiosInstance.get(`/api/bookings/${bookingId}`);
        return response.data;
    },

    // Update booking status
    updateBookingStatus: async (bookingId, statusData) => {
        const response = await axiosInstance.patch(
            `/api/bookings/${bookingId}/status`,
            statusData
        );
        return response.data;
    },

    // Add review
    addReview: async (bookingId, reviewData) => {
        const response = await axiosInstance.post(
            `/api/bookings/${bookingId}/review`,
            reviewData
        );
        return response.data;
    },

    // Check worker availability
    checkAvailability: async (workerId, date, time) => {
        const response = await axiosInstance.get(
            `/api/bookings/worker/${workerId}/availability`,
            {
                params: { date, time },
            }
        );
        return response.data;
    },

    initiateService: async (bookingId) => {
        const response = await axiosInstance.post(
            `/api/bookings/${bookingId}/initiate-service`
        );
        return response.data;
    },

    // Verify service OTP to start service
    verifyServiceOtp: async (bookingId, otp) => {
        const response = await axiosInstance.post(
            `/api/bookings/${bookingId}/verify-service-otp`,
            { otp }
        );
        return response.data;
    },

    // Complete service
    completeService: async (bookingId) => {
        const response = await axiosInstance.post(
            `/api/bookings/${bookingId}/complete-service`
        );
        return response.data;
    },
};
