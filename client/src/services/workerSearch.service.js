import axiosInstance from "../utils/axiosInstance";

export const workerSearchService = {
    // Search workers with filters
    searchWorkers: async (filters) => {
        console.log(filters);

        const response = await axiosInstance.get("/api/customers/search", {
            params: filters,
        });
        return response.data;
    },

    // Get available filters
    getSearchFilters: async () => {
        const response = await axiosInstance.get("/api/customers/filters");
        return response.data;
    },

    // Get worker profile
    getWorkerProfile: async (workerId) => {
        const response = await axiosInstance.get(
            `/api/customers/worker/${workerId}`
        );
        return response.data;
    },
};
