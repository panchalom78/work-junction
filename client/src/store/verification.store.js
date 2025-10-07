import { create } from "zustand";
import axiosInstance from "../utils/axiosInstance";

export const useVerificationStore = create((set, get) => ({
  status: null,
  loading: false,
  error: null,
  message: null,
  documents: {
    selfie: null,
    aadhar: null,
    policeVerification: null,
  },

  // ✅ Fetch current worker verification status
  fetchStatus: async () => {
    try {
      set({ loading: true, error: null });
      const res = await axiosInstance.get("/api/worker/verification/status");
      set({
        status: res.data?.data || null,
        message: "Verification status fetched",
        loading: false,
      });
    } catch (err) {
      console.error("Fetch status error:", err);
      set({
        loading: false,
        error: err.response?.data?.message || "Failed to load status",
      });
    }
  },

  // ✅ Upload all documents together
  uploadAllDocuments: async (formData) => {
    try {
      set({ loading: true, error: null, message: null });
      const res = await axiosInstance.post(
        "/api/worker/verification/upload-all",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      set({
        message: res.data?.message || "Documents uploaded successfully",
        status: res.data?.data || get().status, 
        loading: false,
      });

      // Refresh status after upload
      await get().fetchStatus();

      return { success: true };
    } catch (err) {
      console.error("Upload error:", err);
      set({
        loading: false,
        error:
          err.response?.data?.message ||
          "Failed to upload documents. Please try again.",
      });
      return { success: false };
    }
  },

  // ✅ Delete a specific document (e.g. selfie, aadhar)
  deleteDocument: async (documentType) => {
    try {
      set({ loading: true, error: null });
      const res = await axiosInstance.delete(
        `/api/worker/verification/${documentType}`
      );
      set({
        message: res.data?.message || "Document deleted successfully",
        loading: false,
      });
      await get().fetchStatus();
    } catch (err) {
      console.error("Delete document error:", err);
      set({
        loading: false,
        error:
          err.response?.data?.message || "Failed to delete the document.",
      });
    }
  },
}));
