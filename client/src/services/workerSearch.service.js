// workerSearch.service.js
import axiosInstance from "../utils/axiosInstance";

export const workerSearchService = {
    // Search workers with filters
    searchWorkers: async (filters) => {
        console.log(filters);

        const response = await axiosInstance.get("/api/workers-search/search", {
            // Changed from /api/customers/search
            params: filters,
        });
        return response.data;
    },

    // Get available filters
    getSearchFilters: async () => {
        const response = await axiosInstance.get("/api/workers-search/filters"); // Changed from /api/customers/filters
        return response.data;
    },

    // Get worker profile
    // Get complete worker profile with portfolio and stats
    getWorkerProfile: async (workerId) => {
        const response = await axiosInstance.get(
            `/api/workers-search/profile/${workerId}`
        );
        return response.data;
    },
};
