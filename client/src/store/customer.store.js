import { create } from "zustand";

export const useCustomerStore = create((set, get) => ({
  workers: [],
    selectedWorker: null,
    loading: false,
    error: null,
    isFilterOpen: false,
    selectedCategory: "All Services",
    searchQuery: "",

    // Filters
    filters: {
        skill: "",
        service: "",
        workerName: "",
        workerPhone: "",
        ratingMin: "",
        ratingMax: "",
        priceMin: "",
        priceMax: "",
        location: "",
        sortBy: "",
    },

    // Actions
    setFilterOpen: (isOpen) => set({ isFilterOpen: isOpen }),

    setSelectedCategory: (category) => {
        set({ selectedCategory: category });
        // Auto-trigger search when category changes
        get().searchServices();
    },

    setFilter: (key, value) => {
        set((state) => ({
            filters: {
                ...state.filters,
                [key]: value,
            },
        }));
    },

    clearFilters: () => {
        set({
            filters: {
                skill: "",
                service: "",
                workerName: "",
                workerPhone: "",
                ratingMin: "",
                ratingMax: "",
                priceMin: "",
                priceMax: "",
                location: "",
                sortBy: "",
            },
            selectedCategory: "All Services",
            searchQuery: "",
        });
        // Re-fetch workers after clearing filters
        get().searchServices();
    },

    // Search/Fetch workers with filters
    searchServices: async () => {
        const state = get();
        set({ loading: true, error: null });

        try {
            // Build query parameters
            const params = new URLSearchParams();

            // Add category as skill filter if not "All Services"
            if (state.selectedCategory !== "All Services") {
                const categoryToSkillMap = {
                    Carpenters: "Carpenter",
                    Painters: "Painter",
                    Electricians: "Electrician",
                    Movers: "Mover",
                    Plumbers: "Plumber",
                    Cleaners: "Cleaner",
                };
                const skill = categoryToSkillMap[state.selectedCategory];
                if (skill) {
                    params.append("skill", skill);
                }
            }

            // Add filters from sidebar
            Object.entries(state.filters).forEach(([key, value]) => {
                if (value) {
                    params.append(key, value);
                }
            });

            // Add limit
            params.append("limit", "20");

            console.log("Fetching workers with params:", params.toString());

            const response = await fetch(
                `/api/customer/search?${params.toString()}`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch workers");
            }

            const result = await response.json();

            console.log("Workers fetched successfully:", result.data.length);

            set({
                workers: result.data || [],
                loading: false,
                error: null,
            });
        } catch (error) {
            console.error("Error searching workers:", error);
            set({
                workers: [],
                loading: false,
                error: error.message || "Failed to load workers. Please try again.",
            });
        }
    },

    // Fetch single worker details
    fetchWorkerById: async (workerId) => {
        set({ loading: true, error: null });

        try {
            const response = await fetch(
                `/api/customer/workers/${workerId}`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch worker details");
            }

            const result = await response.json();

            set({
                selectedWorker: result.data,
                loading: false,
                error: null,
            });

            return result.data;
        } catch (error) {
            console.error("Error fetching worker:", error);
            set({
                selectedWorker: null,
                loading: false,
                error: error.message || "Failed to load worker details",
            });
            throw error;
        }
    },

    // Clear selected worker
    clearSelectedWorker: () => {
        set({ selectedWorker: null });
    },

    // Reset entire store
    resetStore: () => {
        set({
            workers: [],
            selectedWorker: null,
            loading: false,
            error: null,
            isFilterOpen: false,
            selectedCategory: "All Services",
            searchQuery: "",
            filters: {
                skill: "",
                service: "",
                workerName: "",
                workerPhone: "",
                ratingMin: "",
                ratingMax: "",
                priceMin: "",
                priceMax: "",
                location: "",
                sortBy: "",
            },
        });
    },

  // Booking History
  getBookingHistory: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/customer/bookings/history", {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        set({ bookings: data.data.bookings, loading: false });
      } else {
        set({ error: data.message, loading: false });
      }
    } catch (err) {
      console.error("Get Booking History Error:", err);
      set({ error: err.message, loading: false });
    }
  },

  // Reviews
  submitReview: async (bookingId, rating, comment) => {
    set({ error: null });
    try {
      const response = await fetch("/api/customer/review", {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, rating, comment }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        await get().getBookingHistory();
        return data;
      } else {
        set({ error: data.message });
        throw new Error(data.message);
      }
    } catch (err) {
      console.error("Submit Review Error:", err);
      set({ error: err.message });
      throw err;
    }
  },

  // Chats
  sendMessage: async (receiverId, content) => {
    set({ error: null });
    try {
      const response = await fetch("/api/customer/chat/send", {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId, content }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        return data.data;
      } else {
        set({ error: data.message });
        throw new Error(data.message);
      }
    } catch (err) {
      console.error("Send Message Error:", err);
      set({ error: err.message });
      throw err;
    }
  },

  getChats: async () => {
    set({ error: null });
    try {
      const response = await fetch("/api/customer/chats", {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        set({ chats: data.data.chats });
      } else {
        set({ error: data.message });
      }
    } catch (err) {
      console.error("Get Chats Error:", err);
      set({ error: err.message });
    }
  },

  getChatHistory: async (chatId) => {
    set({ error: null });
    try {
      const response = await fetch(`/api/customer/chats/${chatId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        return data.data;
      } else {
        set({ error: data.message });
        throw new Error(data.message);
      }
    } catch (err) {
      console.error("Get Chat History Error:", err);
      set({ error: err.message });
      throw err;
    }
  },

  // Language
  setLanguage: async (language) => {
    set({ error: null });
    try {
      const response = await fetch("/api/customer/language", {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        set({ language });
      } else {
        set({ error: data.message });
      }
    } catch (err) {
      console.error("Set Language Error:", err);
      set({ error: err.message });
    }
  },
}));