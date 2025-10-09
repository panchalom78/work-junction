import { create } from "zustand";
import axiosInstance from "../utils/axiosInstance";
export const useAuthStore = create((set, get) => ({
    user: null,
    loading: false,
    error: null,
    message: null,

    register: async (formData) => {
        try {
            set({ loading: true, error: null, message: null });

            const res = await axiosInstance.post(
                "/api/auth/register",
                formData,
                {
                    withCredentials: true, // to handle cookies if JWT is sent via cookie
                }
            );

            set({
                user: res.data?.data?.user || null,
                message: res.data?.message || "Registered successfully",
                loading: false,
            });

            return { success: true, user: res.data?.data?.user || null };
        } catch (err) {
            console.error("Register API error:", err);
            set({
                loading: false,
                error:
                    err.response?.data?.message ||
                    "Registration failed, please try again",
            });
            return { success: false };
        }
    },
    login: async (formData) => {
        try {
            // Start loading and reset error/message
            set({ loading: true, error: null, message: null });

            // API call to login
            const res = await axiosInstance.post("/api/auth/login", formData, {
                withCredentials: true, // Important if JWT is sent via cookie
            });

            // Update store with user and success message
            set({
                user: res.data?.data || null, // adjust if your API wraps user differently
                message: res.data?.message || "Login successful",
                loading: false,
            });

            return { success: true, user: res.data?.data || null };
        } catch (err) {
            console.error("Login API error:", err);

            // Set error in store
            set({
                loading: false,
                error:
                    err.response?.data?.message ||
                    "Login failed, please try again",
            });

            return { success: false };
        }
    },
    verifyOTP: async ({ otp, email }) => {
        try {
            set({ loading: true, error: null, message: null });

            const res = await axiosInstance.post("/api/otp/verify", {
                otp,
                email,
            });

            if (res.data.success) {
                set({
                    loading: false,
                    message: res.data.message || "OTP verified successfully",
                });
                return { success: true };
            } else {
                set({
                    loading: false,
                    error: res.data.message || "OTP verification failed",
                });
                return { success: false };
            }
        } catch (err) {
            console.error("OTP verification error:", err);
            set({
                loading: false,
                error: err.response?.data?.message || "OTP verification failed",
            });
            return { success: false };
        }
    },
    resendOTP: async (email) => {
        try {
            set({ loading: true, error: null, message: null });

            const res = await axiosInstance.post("/api/otp/resend", { email });

            if (res.data.success) {
                set({
                    loading: false,
                    message: res.data.message || "OTP resent successfully",
                });
                return { success: true };
            } else {
                set({
                    loading: false,
                    error: res.data.message || "Failed to resend OTP",
                });
                return { success: false };
            }
        } catch (err) {
            console.error("Resend OTP API error:", err);
            set({
                loading: false,
                error: err.response?.data?.message || "Failed to resend OTP",
            });
            return { success: false };
        }
    },
    getUser: async () => {
        try {
            // ✅ If user data already exists in store, return it immediately
            const currentUser = get().user;
            if (currentUser) {
                return { success: true, user: currentUser, cached: true };
            }

            // Otherwise, fetch from API
            set({ loading: true, error: null, message: null });

            const res = await axiosInstance.get("/api/auth/me", {
                withCredentials: true, // include cookie if JWT is stored as cookie
            });

            set({
                user: res.data?.data || null,
                message: res.data?.message || "User fetched successfully",
                loading: false,
            });

            return {
                success: true,
                user: res.data?.data || null,
                cached: false,
            };
        } catch (err) {
            console.error("Get user API error:", err);
            set({
                loading: false,
                error: err.response?.data?.message || "Failed to fetch user",
            });
            return { success: false };
        }
    },
}));
