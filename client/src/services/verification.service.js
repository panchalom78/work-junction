import axiosInstance from "../utils/axiosInstance";

const verificationService = {
    // Get verification status
    getStatus: async () => {
        try {
            const response = await axiosInstance.get(
                "/api/worker/verification/status"
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Upload selfie
    uploadSelfie: async (formData) => {
        try {
            const response = await axiosInstance.post(
                "/api/worker/verification/upload-selfie",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Upload Aadhar
    uploadAadhar: async (formData) => {
        try {
            const response = await axiosInstance.post(
                "/api//worker/verification/upload-aadhar",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Upload police verification
    uploadPoliceVerification: async (formData) => {
        try {
            const response = await axiosInstance.post(
                "/api/worker/verification/upload-police-verification",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Upload all documents at once
    uploadAllDocuments: async (formData) => {
        try {
            const response = await axiosInstance.post(
                "/api/worker/verification/upload-all",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Delete document
    deleteDocument: async (documentType) => {
        try {
            const response = await axiosInstance.delete(
                `/api/worker/verification/${documentType}`
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default verificationService;
