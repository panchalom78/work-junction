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
        loading,
    } = useWorkerSearchStore();

    const [showFilters, setShowFilters] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationType, setLocationType] = useState("address");
    const [errors, setErrors] = useState({});

    // Load available filters on component mount
    useEffect(() => {
        loadAvailableFilters();
        console.log(availableFilters);
    }, []); // Remove availableFilters from dependencies to avoid infinite loop

    // Get services for selected skill
    const getServicesForSkill = () => {
        if (!filters.skill || !availableFilters.skills) return []; // Add null check
        const skill = availableFilters.skills.find(
            (s) => s.name === filters.skill
        );
        return skill ? skill.services : [];
    };

    // Validate form before submission
    const validateForm = () => {
        const newErrors = {};

        if (!filters.skill || filters.skill.trim() === "") {
            newErrors.skill = "Please select a skill";
        }

        if (!filters.location || filters.location.trim() === "") {
            newErrors.location = "Please enter or select a location";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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

                        setFilter("location", `${locationName}`);
                        // Clear location error if any
                        setErrors((prev) => ({ ...prev, location: "" }));
                    } else {
                        setFilter(
                            "location",
                            `Near ${latitude.toFixed(4)}, ${longitude.toFixed(
                                4
                            )}`
                        );
                        setErrors((prev) => ({ ...prev, location: "" }));
                    }
                } catch (error) {
                    console.error("Error getting location:", error);
                    setFilter(
                        "location",
                        `Near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                    );
                    setErrors((prev) => ({ ...prev, location: "" }));
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
        setErrors((prev) => ({ ...prev, location: "" }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate form before submission
        if (!validateForm()) {
            // Scroll to first error
            const firstErrorField = Object.keys(errors)[0];
            const element = document.querySelector(
                `[name="${firstErrorField}"]`
            );
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            return;
        }

        onSearch(filters);
    };

    const handleClearFilters = () => {
        clearFilters();
        setLocationType("address");
        setErrors({});
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
        setErrors((prev) => ({ ...prev, location: "" }));
    };

    // Update error state when fields change
    const handleSkillChange = (value) => {
        setFilter("skill", value);
        if (value && value.trim() !== "") {
            setErrors((prev) => ({ ...prev, skill: "" }));
        }
    };

    const handleLocationChange = (value) => {
        setFilter("location", value);
        if (value && value.trim() !== "") {
            setErrors((prev) => ({ ...prev, location: "" }));
        }
    };

    // Check if search button should be disabled
    const isSearchDisabled = () => {
        return (
            !filters.skill ||
            !filters.location ||
            (locationType === "current" && !filters.location)
        );
    };

    if (loading) return <div className="text-center py-4">Loading filters...</div>;

    return (
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 border border-gray-100 w-full overflow-hidden">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 break-words">
                Find Trusted Professionals Near You
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Main Search Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                    {/* Skill Selection */}
                    <div className="w-full">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                            Skill *
                        </label>
                        <select
                            value={filters.skill}
                            onChange={(e) => handleSkillChange(e.target.value)}
                            className={`w-full border rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-blue-500 ${
                                errors.skill
                                    ? "border-red-500"
                                    : "border-gray-300"
                            }`}
                        >
                            <option value="">Select Skill</option>
                            {/* Add null check for availableFilters.skills */}
                            {availableFilters.skills &&
                                availableFilters.skills.map((skill) => (
                                    <option key={skill._id} value={skill.name}>
                                        {skill.name}
                                    </option>
                                ))}
                        </select>
                        {errors.skill && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.skill}
                            </p>
                        )}
                    </div>

                    {/* Service Selection */}
                    <div className="w-full">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                            Service
                        </label>
                        <select
                            value={filters.service}
                            onChange={(e) =>
                                setFilter("service", e.target.value)
                            }
                            className="w-full border border-gray-300 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-blue-500"
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
                    <div className="w-full">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                            Location *
                        </label>

                        {/* Location Type Toggle */}
                        <div className="flex space-x-2 mb-3">
                            <button
                                type="button"
                                onClick={handleUseAddress}
                                className={`flex-1 flex items-center justify-center space-x-1.5 sm:space-x-2 py-2 px-2 sm:px-3 rounded-xl sm:rounded-2xl border transition-all duration-200 ${
                                    locationType === "address"
                                        ? "bg-blue-100 border-blue-500 text-blue-700"
                                        : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                                    Use Address
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={handleUseCurrentLocation}
                                disabled={isGettingLocation}
                                className={`flex-1 flex items-center justify-center space-x-1.5 sm:space-x-2 py-2 px-2 sm:px-3 rounded-xl sm:rounded-2xl border transition-all duration-200 ${
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
                                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin flex-shrink-0" />
                                ) : (
                                    <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                )}
                                <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                                    {isGettingLocation
                                        ? "Detecting..."
                                        : "Current"}
                                </span>
                            </button>
                        </div>

                        {/* Location Input */}
                        <div className="relative w-full">
                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 flex-shrink-0" />

                            {locationType === "address" ? (
                                <>
                                    <input
                                        type="text"
                                        value={filters.location}
                                        onChange={(e) =>
                                            handleLocationChange(e.target.value)
                                        }
                                        placeholder="Enter your address"
                                        className={`w-full border rounded-xl sm:rounded-2xl pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-blue-500 ${
                                            errors.location
                                                ? "border-red-500"
                                                : "border-gray-300"
                                        }`}
                                    />
                                    {filters.location && (
                                        <button
                                            type="button"
                                            onClick={clearLocation}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div
                                    className={`w-full border rounded-xl sm:rounded-2xl pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 ${
                                        errors.location
                                            ? "border-red-500 bg-red-50"
                                            : "border-green-200 bg-green-50"
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span
                                            className={`font-medium text-xs sm:text-sm break-words flex-1 ${
                                                errors.location
                                                    ? "text-red-800"
                                                    : "text-green-800"
                                            }`}
                                        >
                                            {filters.location ||
                                                'Click "Current" to detect'}
                                        </span>
                                        {filters.location && (
                                            <button
                                                type="button"
                                                onClick={clearLocation}
                                                className={`p-1 transition-colors flex-shrink-0 ${
                                                    errors.location
                                                        ? "text-red-600 hover:text-red-800"
                                                        : "text-green-600 hover:text-green-800"
                                                }`}
                                            >
                                                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Location Help Text */}
                        <p className="text-xs text-gray-500 mt-2">
                            {locationType === "address"
                                ? "Enter complete address for accurate matching"
                                : "We'll find nearby professionals"}
                        </p>
                        {errors.location && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.location}
                            </p>
                        )}
                    </div>
                </div>

                {/* Filters Toggle and Actions - Now Inside Form */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center justify-center sm:justify-start space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
                    >
                        <Filter className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span>Advanced Filters</span>
                        <ChevronDown
                            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform flex-shrink-0 ${
                                showFilters ? "rotate-180" : ""
                            }`}
                        />
                    </button>

                    <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4">
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            className="text-gray-600 hover:text-gray-700 font-medium text-sm sm:text-base"
                        >
                            Clear All
                        </button>
                        <button
                            type="submit"
                            disabled={isSearchDisabled()}
                            className={`px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl transition-all duration-300 font-semibold flex items-center justify-center space-x-2 text-sm sm:text-base ${
                                isSearchDisabled()
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg"
                            }`}
                        >
                            <Search className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                            <span>Search</span>
                        </button>
                    </div>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
                        {/* Price Range */}
                        <div className="w-full">
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                Price Range (₹
                                {availableFilters.priceRange?.minPrice || 0} - ₹
                                {availableFilters.priceRange?.maxPrice || 10000}
                                )
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    min={
                                        availableFilters.priceRange?.minPrice ||
                                        0
                                    }
                                    max={
                                        availableFilters.priceRange?.maxPrice ||
                                        10000
                                    }
                                    value={filters.minPrice}
                                    onChange={(e) =>
                                        setFilter("minPrice", e.target.value)
                                    }
                                    className="w-full border border-gray-300 rounded-xl sm:rounded-2xl px-2 sm:px-3 py-2 text-sm sm:text-base focus:outline-none focus:border-blue-500"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    min={
                                        availableFilters.priceRange?.minPrice ||
                                        0
                                    }
                                    max={
                                        availableFilters.priceRange?.maxPrice ||
                                        10000
                                    }
                                    value={filters.maxPrice}
                                    onChange={(e) =>
                                        setFilter("maxPrice", e.target.value)
                                    }
                                    className="w-full border border-gray-300 rounded-xl sm:rounded-2xl px-2 sm:px-3 py-2 text-sm sm:text-base focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Rating Range */}
                        <div className="w-full">
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                Rating (
                                {availableFilters.ratingRange?.minRating || 0} -{" "}
                                {availableFilters.ratingRange?.maxRating || 5})
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    min={
                                        availableFilters.ratingRange
                                            ?.minRating || 0
                                    }
                                    max={
                                        availableFilters.ratingRange
                                            ?.maxRating || 5
                                    }
                                    step="0.1"
                                    value={filters.minRating}
                                    onChange={(e) =>
                                        setFilter("minRating", e.target.value)
                                    }
                                    className="w-full border border-gray-300 rounded-xl sm:rounded-2xl px-2 sm:px-3 py-2 text-sm sm:text-base focus:outline-none focus:border-blue-500"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    min={
                                        availableFilters.ratingRange
                                            ?.minRating || 0
                                    }
                                    max={
                                        availableFilters.ratingRange
                                            ?.maxRating || 5
                                    }
                                    step="0.1"
                                    value={filters.maxRating}
                                    onChange={(e) =>
                                        setFilter("maxRating", e.target.value)
                                    }
                                    className="w-full border border-gray-300 rounded-xl sm:rounded-2xl px-2 sm:px-3 py-2 text-sm sm:text-base focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Worker Name */}
                        <div className="w-full">
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                Worker Name
                            </label>
                            <input
                                type="text"
                                placeholder="Search by name"
                                value={filters.workerName}
                                onChange={(e) =>
                                    setFilter("workerName", e.target.value)
                                }
                                className="w-full border border-gray-300 rounded-xl sm:rounded-2xl px-2 sm:px-3 py-2 text-sm sm:text-base focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        {/* Sort By */}
                        <div className="w-full">
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                Sort By
                            </label>
                            <select
                                value={filters.sortBy}
                                onChange={(e) =>
                                    setFilter("sortBy", e.target.value)
                                }
                                className="w-full border border-gray-300 rounded-xl sm:rounded-2xl px-2 sm:px-3 py-2 text-sm sm:text-base focus:outline-none focus:border-blue-500"
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