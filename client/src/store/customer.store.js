import { create } from "zustand";

export const useCustomerStore = create((set, get) => ({
  isFilterOpen: false,
  searchQuery: "",
  selectedCategory: "All Services",

  filters: {
    skill: "",
    service: "",
    priceMin: "",
    priceMax: "",
    ratingMin: "",
    ratingMax: "",
    location: "",
    workerName: "",
    workerPhone: "",
    sortBy: "",
    page: 1,
    limit: 10,
  },

  workers: [],
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalResults: 0,
    resultsPerPage: 10,
  },
  bookings: [],
  chats: [],
  language: "en",
  loading: false,
  error: null,

  setFilterOpen: (open) => set({ isFilterOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (cat) => {
    set({ selectedCategory: cat });
    const skillMap = {
      "All Services": "",
      "Carpenters": "Carpenter",
      "Painters": "Painter",
      "Electricians": "Electrician",
      "Movers": "Mover",
      "Plumbers": "Plumber",
      "Cleaners": "Cleaner",
    };
    get().setFilter("skill", skillMap[cat] || "");
    get().searchServices();
  },
  setFilter: (key, value) => {
    set((state) => ({ filters: { ...state.filters, [key]: value, page: 1 } }));
  },
  clearFilters: () => {
    set({
      filters: {
        skill: "",
        service: "",
        priceMin: "",
        priceMax: "",
        ratingMin: "",
        ratingMax: "",
        location: "",
        workerName: "",
        workerPhone: "",
        sortBy: "",
        page: 1,
        limit: 10,
      },
      selectedCategory: "All Services",
    });
    get().searchServices();
  },

  searchServices: async () => {
    const { filters } = get();
    set({ loading: true, error: null });

    try {
      const filterMap = {
        skill: "skill",
        service: "service",
        priceMin: "minPrice",
        priceMax: "maxPrice",
        ratingMin: "minRating",
        ratingMax: "maxRating",
        location: "city",
        workerName: "workerName",
        workerPhone: "workerPhone",
        sortBy: "sortBy",
        page: "page",
        limit: "limit",
      };

      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && filterMap[key]) {
          params.append(filterMap[key], value);
        }
      });

      const url = `/api/customer/search?${params.toString()}`;
      console.log("Fetching URL:", url);

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      console.log("Response Status:", response.status);
      console.log("Response Headers:", Object.fromEntries(response.headers));

      // Check content type before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON Response:", text.substring(0, 500));
        throw new Error(
          `Server returned ${contentType || "unknown content type"} instead of JSON. ` +
          `Status: ${response.status}. This usually means the route doesn't exist or authentication failed.`
        );
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (data.success) {
        console.log("✅ API Success - Raw data:", data.data);
        console.log("Workers array:", data.data.workers);
        console.log("Workers count:", data.data.workers?.length || 0);

        if (!data.data.workers || data.data.workers.length === 0) {
          console.warn("⚠️ No workers returned from API");
          set({ 
            workers: [], 
            pagination: data.data.pagination || {
              currentPage: 1,
              totalPages: 0,
              totalResults: 0,
              resultsPerPage: 10,
            }, 
            loading: false,
            error: null
          });
          return;
        }

        const transformedWorkers = data.data.workers.map((worker) => {
          console.log("Transforming worker:", worker);
          return {
            id: worker.workerServiceId,
            name: worker.workerName,
            title: worker.skill,
            rating: worker.avgRating || 0,
            reviews: worker.ratingCount || 0,
            experience: "N/A",
            description: worker.details || "No description available",
            image: `https://i.pravatar.cc/150?u=${worker.workerId}`,
            price: worker.pricingType || "N/A",
            priceAmount: worker.price,
            available: true,
            category: worker.skill,
            location: worker.address?.city || "N/A",
            phone: worker.workerPhone,
            distance: worker.distance,
            portfolioImages: worker.portfolioImages || [],
          };
        });

        console.log("✅ Transformed Workers:", transformedWorkers);
        console.log("Setting workers in store, count:", transformedWorkers.length);
        
        set({ 
          workers: transformedWorkers, 
          pagination: data.data.pagination, 
          loading: false,
          error: null
        });

        // Verify state was updated
        console.log("Store state after update:", get().workers.length, "workers");
      } else {
        console.error("❌ API returned success:false", data.message);
        set({ 
          error: data.message || "Failed to fetch workers", 
          workers: [], 
          loading: false 
        });
      }
    } catch (err) {
      console.error("Search Services Error:", err);
      set({ 
        error: err.message || "Network error occurred", 
        workers: [], 
        loading: false 
      });
    }
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