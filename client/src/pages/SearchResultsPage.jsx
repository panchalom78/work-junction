import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    MapPin,
    Star,
    Shield,
    MessageCircle,
    Clock,
    Loader2,
    Search,
} from "lucide-react";
import SearchBar from "../components/customer/SearchBar";
import { useWorkerSearchStore } from "../store/workerSearch.store";
import ChatInitiateButton from "../components/ChatInitiateButton";

const SearchResultsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const {
        workers,
        loading,
        error,
        filters,
        pagination,
        searchWorkers,
        setFilters,
        loadMoreWorkers,
    } = useWorkerSearchStore();

    // Parse URL parameters on component mount and when location.search changes
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);

        // Only proceed if there are query parameters
        if (queryParams.toString()) {
            const urlFilters = {};

            queryParams.forEach((value, key) => {
                if (value) urlFilters[key] = value;
            });

            // Update filters and search
            setFilters(urlFilters);
            searchWorkers(urlFilters).finally(() => {
                setIsInitialLoad(false);
            });
        } else {
            // If no query parameters, set initial load to false
            setIsInitialLoad(false);
        }
    }, [location.search]); // Only depend on location.search

    const handleSearch = (searchFilters) => {
        setIsInitialLoad(true);
        const queryParams = new URLSearchParams();
        Object.entries(searchFilters).forEach(([key, value]) => {
            if (value) queryParams.append(key, value);
        });

        navigate(`/customer/search?${queryParams.toString()}`);
        // The useEffect will handle the search when URL changes
    };

    const handleBackToHome = () => {
        navigate("/customer");
    };

    const handleLoadMore = () => {
        loadMoreWorkers();
    };

    const handleBookNow = (workerId) => {
        navigate(`/customer/worker/profile/${workerId}`);
    };

    const handleMessage = (workerId) => {
        console.log("Message worker:", workerId);
    };

    // Show loading only during initial load or when explicitly loading with no workers
    if (isInitialLoad && workers.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <div className="text-gray-600">
                        Searching for professionals...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            {/* Search Bar at Top */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <SearchBar
                        onSearch={handleSearch}
                        initialFilters={filters}
                    />
                </div>
            </div>

            {/* Search Results */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Search Results
                        </h1>
                        <p className="text-gray-600">
                            {workers.length > 0
                                ? `Found ${pagination.total} professionals matching your criteria`
                                : "No professionals found for your search criteria"}
                        </p>
                    </div>
                    <button
                        onClick={handleBackToHome}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        ← Back to Home
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
                        <div className="text-red-800 font-medium">{error}</div>
                    </div>
                )}

                {/* Active Filters */}
                {Object.values(filters).some((value) => value) && (
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
                        <h3 className="font-semibold text-gray-900 mb-4">
                            Active Filters
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {filters.skill && (
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                    Skill: {filters.skill}
                                </span>
                            )}
                            {filters.service && (
                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                    Service: {filters.service}
                                </span>
                            )}
                            {filters.location && (
                                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                                    Location: {filters.location}
                                </span>
                            )}
                            {(filters.minPrice || filters.maxPrice) && (
                                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                                    Price: ₹{filters.minPrice || "0"} - ₹
                                    {filters.maxPrice || "Any"}
                                </span>
                            )}
                            {(filters.minRating || filters.maxRating) && (
                                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                                    Rating: {filters.minRating || "0"} -{" "}
                                    {filters.maxRating || "5"}
                                </span>
                            )}
                            {filters.sortBy &&
                                filters.sortBy !== "relevance" && (
                                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                                        Sort: {filters.sortBy}
                                    </span>
                                )}
                        </div>
                    </div>
                )}

                {/* Loading indicator for subsequent loads */}
                {loading && workers.length > 0 && (
                    <div className="flex justify-center mb-4">
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    </div>
                )}

                {/* Results Grid */}
                {workers.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {workers.map((worker) => (
                                <div
                                    key={worker._id}
                                    className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-semibold text-lg">
                                                {worker.workerName
                                                    ?.split(" ")
                                                    .map((n) => n[0])
                                                    .join("") || "W"}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900 text-lg">
                                                    {worker.workerName ||
                                                        "Unknown Worker"}
                                                </div>
                                                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>
                                                        {worker.workerAddress
                                                            ?.city ||
                                                            worker.workerAddress
                                                                ?.area ||
                                                            "Location not specified"}
                                                    </span>
                                                    {worker.distance && (
                                                        <>
                                                            <span>•</span>
                                                            <span>
                                                                {worker.distance.toFixed(
                                                                    1
                                                                )}{" "}
                                                                km away
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {worker.isVerified === "APPROVED" && (
                                            <Shield className="w-6 h-6 text-green-500 flex-shrink-0" />
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <div className="text-sm text-gray-600">
                                                Service
                                            </div>
                                            <div className="font-semibold text-gray-900">
                                                {String(
                                                    worker.serviceName
                                                ).split(".")[0] || "Service"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">
                                                Skill
                                            </div>
                                            <div className="font-semibold text-gray-900">
                                                {worker.skillName || "Skill"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">
                                                Price
                                            </div>
                                            <div className="font-semibold text-gray-900">
                                                ₹{worker.price || "0"}{" "}
                                                {worker.pricingType === "HOURLY"
                                                    ? "/hour"
                                                    : ""}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">
                                                Availability
                                            </div>
                                            <div className="font-semibold text-gray-900 capitalize">
                                                {worker.availabilityStatus?.replace(
                                                    "-",
                                                    " "
                                                ) || "Available"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="flex items-center space-x-1">
                                                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                                <span className="font-semibold text-gray-900">
                                                    {worker.avgRating
                                                        ? worker.avgRating.toFixed(
                                                              1
                                                          )
                                                        : "New"}
                                                </span>
                                            </div>
                                            {worker.totalRatings > 0 && (
                                                <span className="text-gray-500 text-sm">
                                                    ({worker.totalRatings}{" "}
                                                    reviews)
                                                </span>
                                            )}
                                        </div>
                                        {worker.availabilityStatus ===
                                            "off-duty" && (
                                            <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                                                <Clock className="w-4 h-4 mr-1" />
                                                Not Available
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() =>
                                                handleBookNow(worker.workerId)
                                            }
                                            disabled={
                                                worker.availabilityStatus ===
                                                "off-duty"
                                            }
                                            className={`flex-1 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                                                worker.availabilityStatus !==
                                                "off-duty"
                                                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg"
                                                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                            }`}
                                        >
                                            {worker.availabilityStatus !==
                                            "off-duty"
                                                ? "Show Profile"
                                                : "Not Available"}
                                        </button>
                                        <ChatInitiateButton
                                            workerId={worker._id}
                                            workerName={worker.workerName}
                                            className="py-3 rounded-2xl font-semibold transition-all duration-300 px-2 hover:shadow-lg text-sm"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Load More Button */}
                        {pagination.page < pagination.pages && (
                            <div className="text-center">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loading}
                                    className="bg-white border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-2xl hover:bg-blue-50 transition-all duration-300 font-semibold flex items-center space-x-2 mx-auto"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : null}
                                    <span>
                                        {loading ? "Loading..." : "Load More"}
                                    </span>
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    /* No Results State - only show when not loading and no workers */
                    !loading && (
                        <div className="text-center py-12">
                            <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Search className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No professionals found
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {location.search
                                    ? "Try adjusting your search criteria or filters"
                                    : "Use the search bar above to find professionals"}
                            </p>
                            <button
                                onClick={handleBackToHome}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-2xl hover:shadow-lg transition-all duration-300 font-semibold"
                            >
                                {location.search
                                    ? "Modify Search"
                                    : "Start Searching"}
                            </button>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default SearchResultsPage;
