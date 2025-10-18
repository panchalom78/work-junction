import { create } from "zustand";
import { workerSearchService } from "../services/workerSearch.service";

export const useWorkerSearchStore = create((set, get) => ({
    // State
    workers: [],
    loading: false,
    error: null,
    filters: {
        skill: "",
        service: "",
        minPrice: "",
        maxPrice: "",
        minRating: "",
        maxRating: "",
        location: "",
        workerName: "",
        workerPhone: "",
        sortBy: "relevance",
        page: 1,
        limit: 10,
    },
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
    },
    availableFilters: {
        skills: [],
        priceRange: { minPrice: 0, maxPrice: 10000 },
        ratingRange: { minRating: 0, maxRating: 5 },
    },

    // Actions
    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
        }));
    },

    setFilter: (key, value) => {
        set((state) => ({
            filters: { ...state.filters, [key]: value },
        }));
    },

    clearFilters: () => {
        set({
            filters: {
                skill: "",
                service: "",
                minPrice: "",
                maxPrice: "",
                minRating: "",
                maxRating: "",
                location: "",
                workerName: "",
                workerPhone: "",
                sortBy: "relevance",
                page: 1,
                limit: 10,
            },
        });
    },

    // Search workers
    searchWorkers: async (customFilters = null) => {
        const { filters } = get();
        const searchFilters = customFilters || filters;

        // Don't search if no meaningful filters are provided
        if (
            !searchFilters.skill &&
            !searchFilters.location &&
            !searchFilters.workerName
        ) {
            set({ workers: [], loading: false });
            return {
                data: [],
                pagination: { page: 1, limit: 10, total: 0, pages: 0 },
            };
        }

        set({ loading: true, error: null });

        try {
            const response = await workerSearchService.searchWorkers(
                searchFilters
            );

            set({
                workers: response.data || [],
                pagination: response.pagination || {
                    page: 1,
                    limit: 10,
                    total: 0,
                    pages: 0,
                },
                loading: false,
            });

            return response;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message || "Failed to search workers",
                loading: false,
                workers: [],
            });
            throw error;
        }
    },

    // Load available filters
    loadAvailableFilters: async () => {
        set({ loading: true });

        try {
            const response = await workerSearchService.getSearchFilters();

            set({
                availableFilters: response.data,
                loading: false,
            });

            return response.data;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message || "Failed to load filters",
                loading: false,
            });
            throw error;
        }
    },

    // Load more workers (pagination)
    loadMoreWorkers: async () => {
        const { filters, pagination } = get();
        const nextPage = pagination.page + 1;

        if (nextPage > pagination.pages) return;

        set({ loading: true });

        try {
            const newFilters = { ...filters, page: nextPage };
            const response = await workerSearchService.searchWorkers(
                newFilters
            );

            set((state) => ({
                workers: [...state.workers, ...response.data],
                pagination: response.pagination,
                filters: { ...state.filters, page: nextPage },
                loading: false,
            }));

            return response;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message ||
                    "Failed to load more workers",
                loading: false,
            });
            throw error;
        }
    },

    // Get worker profile
    getWorkerProfile: async (workerId) => {
        set({ loading: true });

        try {
            const response = await workerSearchService.getWorkerProfile(
                workerId
            );
            set({ loading: false });
            return response.data;
        } catch (error) {
            set({
                error:
                    error.response?.data?.message ||
                    "Failed to load worker profile",
                loading: false,
            });
            throw error;
        }
    },
}));
