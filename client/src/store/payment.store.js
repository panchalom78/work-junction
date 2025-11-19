// src/store/paymentStore.js
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axiosInstance from "../utils/axiosInstance";

const paymentStore = (set, get) => ({
    // State
    loading: false,
    error: null,
    paymentStatus: null,
    razorpayOrder: null,

    // Actions
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    clearError: () => set({ error: null }),

    // Create Razorpay Order
    createRazorpayOrder: async (bookingId, amount) => {
        try {
            set({ loading: true, error: null });

            const response = await axiosInstance.post(
                "/api/payments/razorpay/create-order",
                {
                    bookingId,
                    amount,
                }
            );

            set({
                razorpayOrder: response.data.data,
                loading: false,
            });

            return response.data.data;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message ||
                    "Failed to create payment order",
                loading: false,
            });
            throw error;
        }
    },

    // Verify Razorpay Payment
    verifyRazorpayPayment: async (paymentData) => {
        try {
            set({ loading: true, error: null });

            const response = await axiosInstance.post(
                "/api/payments/razorpay/verify",
                paymentData
            );

            set({
                paymentStatus: "SUCCESS",
                loading: false,
            });

            return response.data;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message ||
                    "Payment verification failed",
                paymentStatus: "FAILED",
                loading: false,
            });
            throw error;
        }
    },

    // Initiate Cash Payment
    initiateCashPayment: async (bookingId) => {
        try {
            set({ loading: true, error: null });

            const response = await axiosInstance.post(
                "/api/payments/cash/initiate",
                {
                    bookingId,
                }
            );

            set({ loading: false });
            return response.data.data;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message ||
                    "Failed to initiate cash payment",
                loading: false,
            });
            throw error;
        }
    },

    // Verify Cash Payment
    verifyCashPayment: async (bookingId, otp) => {
        try {
            set({ loading: true, error: null });

            const response = await axiosInstance.post(
                "/api/payments/cash/verify",
                {
                    bookingId,
                    otp,
                }
            );

            set({
                paymentStatus: "SUCCESS",
                loading: false,
            });

            return response.data;
        } catch (error) {
            set({
                error: error.response?.data?.message || "Invalid OTP",
                loading: false,
            });
            throw error;
        }
    },

    // Get Payment Status
    getPaymentStatus: async (bookingId) => {
        try {
            set({ loading: true, error: null });

            const response = await axiosInstance.get(
                `/api/payments/status/${bookingId}`
            );

            set({ loading: false });
            return response.data.data;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message ||
                    "Failed to fetch payment status",
                loading: false,
            });
            throw error;
        }
    },

    // Reset Payment State
    resetPaymentState: () =>
        set({
            loading: false,
            error: null,
            paymentStatus: null,
            razorpayOrder: null,
        }),
});

export const usePaymentStore = create(devtools(paymentStore));
