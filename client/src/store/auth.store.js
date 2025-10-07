import { create } from "zustand";
import axiosInstance from "../utils/axiosInstance";
export const useAuthStore = create((set) => ({
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

            return { success: true, data: res.data };
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

            return { success: true, data: res.data };
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
}));
