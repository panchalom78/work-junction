import React from "react";
import { MapPin, Star, Shield, MessageCircle, Clock } from "lucide-react";

const SearchResults = ({ results, filters, onBackToSearch }) => {
    // Mock search results - replace with actual API data
    const mockResults = [
        {
            id: 1,
            name: "Amit Sharma",
            skill: "Plumbing",
            service: "Pipe Repair",
            rating: 4.8,
            totalRatings: 127,
            price: 500,
            distance: "2.1 km",
            verified: true,
            available: true,
            experience: "5 years",
            responseTime: "15 min",
        },
        {
            id: 2,
            name: "Priya Singh",
            skill: "Electrical",
            service: "Fan Installation",
            rating: 4.9,
            totalRatings: 89,
            price: 300,
            distance: "1.5 km",
            verified: true,
            available: true,
            experience: "3 years",
            responseTime: "10 min",
        },
        {
            id: 3,
            name: "Rahul Verma",
            skill: "Cleaning",
            service: "Home Cleaning",
            rating: 4.7,
            totalRatings: 203,
            price: 800,
            distance: "3.2 km",
            verified: true,
            available: false,
            experience: "4 years",
            responseTime: "25 min",
        },
    ];

    const resultsToShow = mockResults; // Replace with actual results from API

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Search Results
                        </h1>
                        <p className="text-gray-600">
                            Found {resultsToShow.length} professionals matching
                            your criteria
                        </p>
                    </div>
                    <button
                        onClick={onBackToSearch}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        ← Back to Search
                    </button>
                </div>

                {/* Active Filters */}
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
                                Price: {filters.minPrice || "0"} -{" "}
                                {filters.maxPrice || "Any"}
                            </span>
                        )}
                        {filters.sortBy && (
                            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                                Sort: {filters.sortBy}
                            </span>
                        )}
                    </div>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {resultsToShow.map((worker) => (
                        <div
                            key={worker.id}
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
                                        {/* Updated worker name */}
                                        <div className="font-semibold text-gray-900 text-lg">
                                            {worker.workerName ||
                                                "Unknown Worker"}
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                                            <MapPin className="w-4 h-4" />
                                            {/* Updated address */}
                                            <span>
                                                {worker.workerAddress?.city ||
                                                    worker.workerAddress
                                                        ?.area ||
                                                    "Location not specified"}
                                            </span>
                                            <span>•</span>
                                            <span>
                                                {worker.experience} experience
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {worker.verified && (
                                    <Shield className="w-6 h-6 text-green-500 flex-shrink-0" />
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <div className="text-sm text-gray-600">
                                        Service
                                    </div>
                                    {/* Updated service name */}
                                    <div className="font-semibold text-gray-900">
                                        {worker.serviceName || "Service"}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">
                                        Skill
                                    </div>
                                    {/* Updated skill name */}
                                    <div className="font-semibold text-gray-900">
                                        {worker.skillName || "Skill"}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">
                                        Response Time
                                    </div>
                                    <div className="font-semibold text-gray-900">
                                        {worker.responseTime}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">
                                        Price
                                    </div>
                                    <div className="font-semibold text-gray-900">
                                        ₹{worker.price}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    <div className="flex items-center space-x-1">
                                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                        {/* Updated rating */}
                                        <span className="font-semibold text-gray-900">
                                            {worker.avgRating
                                                ? worker.avgRating.toFixed(1)
                                                : "New"}
                                        </span>
                                    </div>
                                    <span className="text-gray-500 text-sm">
                                        ({worker.totalRatings} reviews)
                                    </span>
                                </div>
                                {!worker.available && (
                                    <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                                        <Clock className="w-4 h-4 mr-1" />
                                        Not Available
                                    </div>
                                )}
                            </div>

                            <div className="flex space-x-3">
                                <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300">
                                    Book Now
                                </button>
                                <button className="w-12 h-12 border border-gray-300 rounded-2xl flex items-center justify-center hover:border-blue-600 hover:text-blue-600 transition-colors">
                                    <MessageCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* No Results State */}
                {resultsToShow.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Search className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No professionals found
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Try adjusting your search criteria or filters
                        </p>
                        <button
                            onClick={onBackToSearch}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-2xl hover:shadow-lg transition-all duration-300 font-semibold"
                        >
                            Modify Search
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResults;
