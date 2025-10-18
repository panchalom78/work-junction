import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Search,
    MapPin,
    Filter,
    ChevronDown,
    X,
    Navigation,
    Loader2,
    Home,
} from "lucide-react";
import { useWorkerSearchStore } from "../../store/workerSearch.store";

const SearchBar = ({ onSearch, initialFilters = {} }) => {
    const navigate = useNavigate();
    const {
        filters,
        setFilters,
        setFilter,
        clearFilters,
        availableFilters,
        loadAvailableFilters,
    } = useWorkerSearchStore();

    const [showFilters, setShowFilters] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationType, setLocationType] = useState("address");

    // Load available filters on component mount
    useEffect(() => {
        loadAvailableFilters();
    }, []);

    // Get services for selected skill
    const getServicesForSkill = () => {
        if (!filters.skill) return [];
        const skill = availableFilters.skills.find(
            (s) => s.name === filters.skill
        );
        return skill ? skill.services : [];
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsGettingLocation(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    const response = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                    );

                    if (response.ok) {
                        const data = await response.json();
                        const locationName =
                            data.locality ||
                            data.city ||
                            data.principalSubdivision ||
                            "Current Location";

                        setFilter(
                            "location",
                            `${locationName} (Current Location)`
                        );
                    } else {
                        setFilter(
                            "location",
                            `Near ${latitude.toFixed(4)}, ${longitude.toFixed(
                                4
                            )}`
                        );
                    }
                } catch (error) {
                    console.error("Error getting location:", error);
                    setFilter(
                        "location",
                        `Near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                    );
                } finally {
                    setIsGettingLocation(false);
                }
            },
            (error) => {
                setIsGettingLocation(false);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        alert(
                            "Location access denied. Please allow location access to use this feature."
                        );
                        break;
                    case error.POSITION_UNAVAILABLE:
                        alert("Location information unavailable.");
                        break;
                    case error.TIMEOUT:
                        alert("Location request timed out.");
                        break;
                    default:
                        alert(
                            "An unknown error occurred while getting location."
                        );
                        break;
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000,
            }
        );
    };

    const handleUseCurrentLocation = () => {
        setLocationType("current");
        getCurrentLocation();
    };

    const handleUseAddress = () => {
        setLocationType("address");
        setFilter("location", "");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(filters);
    };

    const handleClearFilters = () => {
        clearFilters();
        setLocationType("address");
        onSearch({
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
        });
    };

    const clearLocation = () => {
        setFilter("location", "");
        setLocationType("address");
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
                Find Trusted Professionals Near You
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Main Search Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Skill Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Skill
                        </label>
                        <select
                            value={filters.skill}
                            onChange={(e) => setFilter("skill", e.target.value)}
                            className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500"
                        >
                            <option value="">Select Skill</option>
                            {availableFilters.skills.map((skill) => (
                                <option key={skill._id} value={skill.name}>
                                    {skill.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Service Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Service
                        </label>
                        <select
                            value={filters.service}
                            onChange={(e) =>
                                setFilter("service", e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500"
                            disabled={!filters.skill}
                        >
                            <option value="">Select Service</option>
                            {getServicesForSkill().map((service) => (
                                <option
                                    key={service.serviceId}
                                    value={service.name}
                                >
                                    {service.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                        </label>

                        {/* Location Type Toggle */}
                        <div className="flex space-x-2 mb-3">
                            <button
                                type="button"
                                onClick={handleUseAddress}
                                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-2xl border transition-all duration-200 ${
                                    locationType === "address"
                                        ? "bg-blue-100 border-blue-500 text-blue-700"
                                        : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                <Home className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    Use Address
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={handleUseCurrentLocation}
                                disabled={isGettingLocation}
                                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-2xl border transition-all duration-200 ${
                                    locationType === "current"
                                        ? "bg-green-100 border-green-500 text-green-700"
                                        : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"
                                } ${
                                    isGettingLocation
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                            >
                                {isGettingLocation ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Navigation className="w-4 h-4" />
                                )}
                                <span className="text-sm font-medium">
                                    {isGettingLocation
                                        ? "Detecting..."
                                        : "Current Location"}
                                </span>
                            </button>
                        </div>

                        {/* Location Input */}
                        <div className="relative">
                            <MapPin className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

                            {locationType === "address" ? (
                                <>
                                    <input
                                        type="text"
                                        value={filters.location}
                                        onChange={(e) =>
                                            setFilter(
                                                "location",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter your address (street, area, city)"
                                        className="w-full border border-gray-300 rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500"
                                    />
                                    {filters.location && (
                                        <button
                                            type="button"
                                            onClick={clearLocation}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="w-full border border-green-200 bg-green-50 rounded-2xl pl-10 pr-4 py-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-green-800 font-medium">
                                            {filters.location ||
                                                'Click "Current Location" to detect your location'}
                                        </span>
                                        {filters.location && (
                                            <button
                                                type="button"
                                                onClick={clearLocation}
                                                className="p-1 text-green-600 hover:text-green-800 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Location Help Text */}
                        <p className="text-xs text-gray-500 mt-2">
                            {locationType === "address"
                                ? "Enter your complete address for accurate service matching"
                                : "We'll use your current location to find nearby professionals"}
                        </p>
                    </div>
                </div>

                {/* Filters Toggle */}
                <div className="flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                        <Filter className="w-5 h-5" />
                        <span>Advanced Filters</span>
                        <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                                showFilters ? "rotate-180" : ""
                            }`}
                        />
                    </button>

                    <div className="flex items-center space-x-4">
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            className="text-gray-600 hover:text-gray-700 font-medium"
                        >
                            Clear All
                        </button>
                        <button
                            type="submit"
                            disabled={
                                !filters.location && locationType === "current"
                            }
                            className={`px-8 py-3 rounded-2xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center space-x-2 ${
                                !filters.location && locationType === "current"
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg"
                            }`}
                        >
                            <Search className="w-5 h-5" />
                            <span>Search</span>
                        </button>
                    </div>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-gray-200">
                        {/* Price Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price Range (₹
                                {availableFilters.priceRange.minPrice} - ₹
                                {availableFilters.priceRange.maxPrice})
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    min={availableFilters.priceRange.minPrice}
                                    max={availableFilters.priceRange.maxPrice}
                                    value={filters.minPrice}
                                    onChange={(e) =>
                                        setFilter("minPrice", e.target.value)
                                    }
                                    className="w-full border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:border-blue-500"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    min={availableFilters.priceRange.minPrice}
                                    max={availableFilters.priceRange.maxPrice}
                                    value={filters.maxPrice}
                                    onChange={(e) =>
                                        setFilter("maxPrice", e.target.value)
                                    }
                                    className="w-full border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Rating Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rating ({availableFilters.ratingRange.minRating}{" "}
                                - {availableFilters.ratingRange.maxRating})
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    min={availableFilters.ratingRange.minRating}
                                    max={availableFilters.ratingRange.maxRating}
                                    step="0.1"
                                    value={filters.minRating}
                                    onChange={(e) =>
                                        setFilter("minRating", e.target.value)
                                    }
                                    className="w-full border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:border-blue-500"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    min={availableFilters.ratingRange.minRating}
                                    max={availableFilters.ratingRange.maxRating}
                                    step="0.1"
                                    value={filters.maxRating}
                                    onChange={(e) =>
                                        setFilter("maxRating", e.target.value)
                                    }
                                    className="w-full border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Worker Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Worker Name
                            </label>
                            <input
                                type="text"
                                placeholder="Search by name"
                                value={filters.workerName}
                                onChange={(e) =>
                                    setFilter("workerName", e.target.value)
                                }
                                className="w-full border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Sort By */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sort By
                            </label>
                            <select
                                value={filters.sortBy}
                                onChange={(e) =>
                                    setFilter("sortBy", e.target.value)
                                }
                                className="w-full border border-gray-300 rounded-2xl px-3 py-2 focus:outline-none focus:border-blue-500"
                            >
                                <option value="relevance">Relevance</option>
                                <option value="rating">Rating</option>
                                <option value="price">Price</option>
                                <option value="distance">Distance</option>
                            </select>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default SearchBar;
