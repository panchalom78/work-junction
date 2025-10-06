import React, { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Star,
  X,
  User,
  Calendar,
} from "lucide-react";

const CustomerDashboard = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Services");
  const [filters, setFilters] = useState({
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
  });

  const categories = [
    { name: "All Services", icon: "🔧" },
    { name: "Carpenters", icon: "🪚" },
    { name: "Painters", icon: "🎨" },
    { name: "Electricians", icon: "⚡" },
    { name: "Movers", icon: "🚚" },
    { name: "Plumbers", icon: "🔧" },
    { name: "Cleaners", icon: "🧹" },
  ];

  const workers = [
    {
      id: 1,
      name: "Rajesh Kumar",
      title: "Master Carpenter",
      rating: 4.9,
      reviews: 156,
      experience: "10+ years",
      description:
        "Specialized in custom furniture and home renovation with 100+ satisfied clients.",
      image: "https://i.pravatar.cc/150?img=12",
      price: "Premium",
      available: true,
      category: "Carpenters",
      location: "Vadodara",
      phone: "9876543210",
    },
    {
      id: 2,
      name: "Vikram Singh",
      title: "Electrical Engineer",
      rating: 4.8,
      reviews: 142,
      experience: "8+ years",
      description:
        "Expert in home wiring, switchboard repairs and smart home installations.",
      image: "https://i.pravatar.cc/150?img=33",
      price: "Mid-Range",
      available: true,
      category: "Electricians",
      location: "Ahmedabad",
      phone: "9876501234",
    },
    // ... other workers remain the same
  ];

  const toggleFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
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
    });
  };

  const getFilteredWorkers = () => {
    return workers
      .filter((worker) => {
        // Skill / Service
        if (filters.skill && worker.category !== filters.skill) return false;
        if (
          filters.service &&
          !worker.title.toLowerCase().includes(filters.service.toLowerCase())
        )
          return false;

        // Worker Name / Phone
        if (
          filters.workerName &&
          !worker.name.toLowerCase().includes(filters.workerName.toLowerCase())
        )
          return false;
        if (filters.workerPhone && !worker.phone.includes(filters.workerPhone))
          return false;

        // Rating
        if (filters.ratingMin && worker.rating < Number(filters.ratingMin))
          return false;
        if (filters.ratingMax && worker.rating > Number(filters.ratingMax))
          return false;

        // Price (assume Budget=1, Mid-Range=2, Premium=3 for comparison)
        const priceMap = { Budget: 1, "Mid-Range": 2, Premium: 3 };
        if (
          filters.priceMin &&
          priceMap[worker.price] < Number(filters.priceMin)
        )
          return false;
        if (
          filters.priceMax &&
          priceMap[worker.price] > Number(filters.priceMax)
        )
          return false;

        // Location
        if (
          filters.location &&
          !worker.location
            .toLowerCase()
            .includes(filters.location.toLowerCase())
        )
          return false;

        // Category selection
        if (
          selectedCategory !== "All Services" &&
          worker.category !== selectedCategory
        )
          return false;

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case "rating":
            return b.rating - a.rating;
          case "price":
            return a.price.localeCompare(b.price);
          case "name":
            return a.name.localeCompare(b.name);
          default:
            return 0; // default relevance
        }
      });
  };

  const filteredWorkers = getFilteredWorkers();
  const activeFilterCount = Object.values(filters).filter((v) => v).length;

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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition font-medium">
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
            onClick={() => setIsFilterOpen(true)}
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

        {/* Workers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkers.map((worker) => (
            <div
              key={worker.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={worker.image}
                  alt={worker.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-900">
                    {worker.name}
                  </h4>
                  <p className="text-purple-600 text-sm font-medium">
                    {worker.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star
                        size={16}
                        className="fill-yellow-400 text-yellow-400"
                      />
                      <span className="font-semibold text-sm">
                        {worker.rating}
                      </span>
                    </div>
                    <span className="text-gray-400 text-sm">•</span>
                    <span className="text-gray-600 text-sm">
                      {worker.reviews} reviews
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {worker.description}
              </p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-gray-500">
                  Experience: {worker.experience}
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
              <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition font-medium">
                View Profile
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Sidebar */}
      {isFilterOpen && (
        <>
          {/* Dim background */}
          <div
            className={`fixed top-0 right-0 w-80 h-full bg-white shadow-2xl transform transition-transform duration-300 z-50 ${
              isFilterOpen ? "translate-x-0" : "translate-x-full"
            }`}
          />
          <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white z-50 shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Filters</h3>
              <button
                onClick={() => setIsFilterOpen(false)}
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
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Min Price
                  </h4>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.priceMin}
                    onChange={(e) => toggleFilter("priceMin", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Max Price
                  </h4>
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
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Min Rating
                  </h4>
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
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Max Rating
                  </h4>
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
                onClick={clearAllFilters}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition font-medium"
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
