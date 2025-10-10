import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Servicebooking from "./servicebooking";
import {
  Search,
  SlidersHorizontal,
  Star,
  X,
  User,
  Calendar,
} from "lucide-react";
import { useCustomerStore } from "../store/customer.store";

const CustomerDashboard = () => {
  const {
    isFilterOpen,
    setFilterOpen,
    searchQuery,
    setFilter,
    selectedCategory,
    setSelectedCategory,
    filters,
    clearFilters,
    workers,
    searchServices,
    loading,
    error,
  } = useCustomerStore();

  const navigate = useNavigate();

  useEffect(() => {
    searchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = [
    { name: "All Services", icon: "🔧" },
    { name: "Carpenters", icon: "🪚" },
    { name: "Painters", icon: "🎨" },
    { name: "Electricians", icon: "⚡" },
    { name: "Movers", icon: "🚚" },
    { name: "Plumbers", icon: "🔧" },
    { name: "Cleaners", icon: "🧹" },
  ];

  const toggleFilter = (key, value) => {
    setFilter(key, value);
  };

  const getFilteredWorkers = () => {
    return workers
      .filter((worker) => {
        if (selectedCategory !== "All Services") {
          const categoryMap = {
            Carpenters: "Carpenter",
            Painters: "Painter",
            Electricians: "Electrician",
            Movers: "Mover",
            Plumbers: "Plumber",
            Cleaners: "Cleaner",
          };
          const expectedSkill = categoryMap[selectedCategory];
          if (expectedSkill && worker.category !== expectedSkill) {
            return false;
          }
        }

        if (filters.skill && worker.category !== filters.skill) return false;

        if (
          filters.service &&
          !worker.title?.toLowerCase().includes(filters.service.toLowerCase())
        )
          return false;

        if (
          filters.workerName &&
          !worker.name?.toLowerCase().includes(filters.workerName.toLowerCase())
        )
          return false;

        if (filters.workerPhone && !worker.phone?.includes(filters.workerPhone))
          return false;

        if (filters.ratingMin && worker.rating < Number(filters.ratingMin))
          return false;
        if (filters.ratingMax && worker.rating > Number(filters.ratingMax))
          return false;

        if (filters.priceMin && worker.priceAmount < Number(filters.priceMin))
          return false;
        if (filters.priceMax && worker.priceAmount > Number(filters.priceMax))
          return false;

        if (
          filters.location &&
          !worker.location
            ?.toLowerCase()
            .includes(filters.location.toLowerCase())
        )
          return false;

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case "rating":
            return b.rating - a.rating;
          case "price":
            return (a.priceAmount || 0) - (b.priceAmount || 0);
          case "name":
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
  };

  const filteredWorkers = getFilteredWorkers();
  const activeFilterCount = Object.values(filters).filter((v) => v).length;

  const handleBookingClick = (workerId) => {
    navigate(`/servicebooking/${workerId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              WorkJunction
            </h1>
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
                <User size={20} />
                <span className="hidden sm:inline">Profile</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
                <Calendar size={20} />
                <span className="hidden sm:inline">My Bookings</span>
              </button>
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Find & Hire{" "}
              <span className="text-purple-600">Trusted Professionals</span>
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              Search for any service you need, and we'll connect you with the
              best pros in your area.
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex gap-3 max-w-3xl mx-auto">
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="What service are you looking for?"
                value={searchQuery}
                onChange={(e) => setFilter("service", e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={searchServices}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition font-medium"
            >
              Search
            </button>
          </div>
        </div>
      </header>

      {/* Categories */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  selectedCategory === cat.name
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <span>{cat.icon}</span>
                <span className="font-medium">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {selectedCategory === "All Services"
                ? "All Professionals"
                : selectedCategory}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {filteredWorkers.length} professionals found
            </p>
          </div>
          <button
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <SlidersHorizontal size={20} />
            <span className="font-medium">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="font-medium">Error loading workers:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredWorkers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No professionals found</p>
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        )}

        {/* Workers Grid */}
        {!loading && !error && filteredWorkers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkers.map((worker) => (
              <div
                key={worker.id || worker._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6"
              >
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={worker.image || "https://i.pravatar.cc/150"}
                    alt={worker.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-900">
                      {worker.name}
                    </h4>
                    <p className="text-purple-600 text-sm font-medium">
                      {worker.title || "Professional"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star
                          size={16}
                          className="fill-yellow-400 text-yellow-400"
                        />
                        <span className="font-semibold text-sm">
                          {worker.rating || "N/A"}
                        </span>
                      </div>
                      <span className="text-gray-400 text-sm">•</span>
                      <span className="text-gray-600 text-sm">
                        {worker.reviews || 0} reviews
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {worker.description ||
                    "Trusted professional ready to help with your needs."}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-gray-500">
                    Experience: {worker.experience || "N/A"}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      worker.available
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {worker.available ? "Available" : "Busy"}
                  </span>
                </div>
                {/* ✅ Corrected navigation */}
                <button
                  onClick={() => handleBookingClick(worker.id || worker._id)}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition font-medium"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Sidebar */}
      {isFilterOpen && (
        <>
          <div
            onClick={() => setFilterOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          ></div>
          <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white z-50 shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Filters</h3>
              <button
                onClick={() => setFilterOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Skill */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Skill</h4>
                <input
                  type="text"
                  placeholder="Select skill (e.g., Plumbing)"
                  value={filters.skill}
                  onChange={(e) => toggleFilter("skill", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Service */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Service</h4>
                <input
                  type="text"
                  placeholder="Select service (e.g., Pipe Repair)"
                  value={filters.service}
                  onChange={(e) => toggleFilter("service", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Price Range */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Min Price</h4>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.priceMin}
                    onChange={(e) => toggleFilter("priceMin", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Max Price</h4>
                  <input
                    type="number"
                    placeholder="1000"
                    value={filters.priceMax}
                    onChange={(e) => toggleFilter("priceMax", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Rating Range */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Min Rating</h4>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="0"
                    value={filters.ratingMin}
                    onChange={(e) => toggleFilter("ratingMin", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Max Rating</h4>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="5"
                    value={filters.ratingMax}
                    onChange={(e) => toggleFilter("ratingMax", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Location</h4>
                <input
                  type="text"
                  placeholder="City or Pincode"
                  value={filters.location}
                  onChange={(e) => toggleFilter("location", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Worker Name */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Worker Name
                </h4>
                <input
                  type="text"
                  placeholder="Search by name"
                  value={filters.workerName}
                  onChange={(e) => toggleFilter("workerName", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Worker Phone */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Worker Phone
                </h4>
                <input
                  type="text"
                  placeholder="Search by phone"
                  value={filters.workerPhone}
                  onChange={(e) => toggleFilter("workerPhone", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Sort By */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Sort By</h4>
                <select
                  value={filters.sortBy}
                  onChange={(e) => toggleFilter("sortBy", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Relevance</option>
                  <option value="rating">Rating</option>
                  <option value="price">Price</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3">
              <button
                onClick={clearFilters}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Clear All
              </button>
              <button
                onClick={() => setFilterOpen(false)}
                className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerDashboard;
