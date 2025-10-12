import { create } from "zustand";
import verificationService from "../services/verification.service";

export const useVerificationStore = create((set, get) => ({
    // State
    status: null,
    loading: false,
    error: null,
    message: null,

    // Actions
    setLoading: (loading) => set({ loading }),

    setError: (error) => set({ error, loading: false, message: null }),

    setMessage: (message) => set({ message, error: null }),

    clearMessages: () => set({ error: null, message: null }),

    // Fetch verification status
    fetchStatus: async () => {
        set({ loading: true, error: null });
        try {
            const response = await verificationService.getStatus();

            if (response.success) {
                set({
                    status: response.data,
                    loading: false,
                    error: null,
                });
            }
        } catch (error) {
            console.error("Fetch status error:", error);
            set({
                error: error.message || "Failed to fetch verification status",
                loading: false,
            });
        }
    },

    // Upload selfie
    uploadSelfie: async (file) => {
        set({ loading: true, error: null, message: null });
        try {
            const formData = new FormData();
            formData.append("selfie", file);

            const response = await verificationService.uploadSelfie(formData);

            if (response.success) {
                set({
                    message: response.message,
                    loading: false,
                });

                // Refresh status
                await get().fetchStatus();
                return { success: true };
            }
        } catch (error) {
            console.error("Upload selfie error:", error);
            set({
                error: error.message || "Failed to upload selfie",
                loading: false,
            });
            return { success: false, error: error.message };
        }
    },

    // Upload Aadhar
    uploadAadhar: async (file) => {
        set({ loading: true, error: null, message: null });
        try {
            const formData = new FormData();
            formData.append("aadhar", file);

            const response = await verificationService.uploadAadhar(formData);

            if (response.success) {
                set({
                    message: response.message,
                    loading: false,
                });

                await get().fetchStatus();
                return { success: true };
            }
        } catch (error) {
            console.error("Upload Aadhar error:", error);
            set({
                error: error.message || "Failed to upload Aadhar",
                loading: false,
            });
            return { success: false, error: error.message };
        }
    },

    // Upload police verification
    uploadPoliceVerification: async (file) => {
        set({ loading: true, error: null, message: null });
        try {
            const formData = new FormData();
            formData.append("policeVerification", file);

            const response = await verificationService.uploadPoliceVerification(
                formData
            );

            if (response.success) {
                set({
                    message: response.message,
                    loading: false,
                });

                await get().fetchStatus();
                return { success: true };
            }
        } catch (error) {
            console.error("Upload police verification error:", error);
            set({
                error: error.message || "Failed to upload police verification",
                loading: false,
            });
            return { success: false, error: error.message };
        }
    },

    // Upload all documents at once
    uploadAllDocuments: async (formData) => {
        set({ loading: true, error: null, message: null });
        try {
            const response = await verificationService.uploadAllDocuments(
                formData
            );

            if (response.success) {
                set({
                    message: response.message,
                    loading: false,
                });

                await get().fetchStatus();
                return { success: true };
            }
        } catch (error) {
            console.error("Upload all documents error:", error);
            set({
                error: error.message || "Failed to upload documents",
                loading: false,
            });
            return { success: false, error: error.message };
        }
    },

    // Delete document
    deleteDocument: async (documentType) => {
        set({ loading: true, error: null, message: null });
        try {
            const response = await verificationService.deleteDocument(
                documentType
            );

            if (response.success) {
                set({
                    message: response.message,
                    loading: false,
                });

                await get().fetchStatus();
                return { success: true };
            }
        } catch (error) {
            console.error("Delete document error:", error);
            set({
                error: error.message || "Failed to delete document",
                loading: false,
            });
            return { success: false, error: error.message };
        }
    },
}));
