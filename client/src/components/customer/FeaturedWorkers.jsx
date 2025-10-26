import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    MapPin,
    Star,
    Shield,
    MessageCircle,
    Clock,
    Award,
    Loader2,
    RefreshCw,
} from "lucide-react";
import { useWorkerSearchStore } from "../../store/workerSearch.store";
import ChatInitiateButton from "../ChatInitiateButton";

const FeaturedWorkers = () => {
    const navigate = useNavigate();
    const { workers, searchWorkers, loading } = useWorkerSearchStore();
    const [featuredWorkers, setFeaturedWorkers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch featured workers from API
    const fetchFeaturedWorkers = async () => {
        setIsLoading(true);
        try {
            // Search for workers with featured criteria (highly rated, verified, available)
            await searchWorkers({
                skill: "",
                service: "",
                minPrice: "",
                maxPrice: "",
                minRating: "4",
                maxRating: "",
                location: "",
                workerName: "",
                workerPhone: "",
                sortBy: "rating",
                page: 1,
                limit: 6,
                // You might want to add more filters for "featured" workers
            });
        } catch (error) {
            console.error("Failed to fetch featured workers:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFeaturedWorkers();
    }, []);

    // Transform API workers to featured workers format
    useEffect(() => {
        if (workers && workers.length > 0) {
            const transformedWorkers = workers.map((worker, index) => ({
                id: worker._id || worker.workerId || `worker-${index}`,
                name: worker.workerName || worker.name || "Unknown Worker",
                skill:
                    worker.skillName ||
                    worker.primarySkill?.name ||
                    "General Service",
                service:
                    worker.serviceName ||
                    worker.primaryService?.details ||
                    "Service",
                rating: worker.avgRating || worker.rating || 4.5,
                totalRatings:
                    worker.totalRatings || Math.floor(Math.random() * 200) + 50,
                price: worker.price || worker.minServicePrice || 500,
                verified:
                    worker.isVerified ||
                    worker.workerProfile?.verification?.status === "APPROVED",
                available: worker.availabilityStatus !== "off-duty",
                completedJobs:
                    worker.totalJobsDone ||
                    Math.floor(Math.random() * 300) + 100,
                badge: getWorkerBadge(worker, index),
            }));
            setFeaturedWorkers(transformedWorkers);
        }
    }, [workers]);

    // Determine badge based on worker properties
    const getWorkerBadge = (worker, index) => {
        const badges = [
            "Top Rated",
            "Fast Responder",
            "Professional",
            "Expert",
            "Quality Pro",
            "Specialist",
        ];

        if (worker.avgRating >= 4.8) return "Top Rated";
        if (worker.totalRatings > 150) return "Professional";
        if (worker.totalCompletedJobs > 250) return "Expert";

        return badges[index % badges.length];
    };

    const getBadgeColor = (badge) => {
        switch (badge) {
            case "Top Rated":
                return "bg-yellow-100 text-yellow-800";
            case "Fast Responder":
                return "bg-green-100 text-green-800";
            case "Professional":
                return "bg-blue-100 text-blue-800";
            case "Expert":
                return "bg-purple-100 text-purple-800";
            case "Quality Pro":
                return "bg-orange-100 text-orange-800";
            case "Specialist":
                return "bg-cyan-100 text-cyan-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const handleBookNow = (workerId) => {
        navigate(`/booking/${workerId}`);
    };

    const handleMessage = (workerId) => {
        // Open chat with worker
        console.log("Message worker:", workerId);
        // You can implement chat functionality here
        navigate(`/chat/${workerId}`);
    };

    const handleViewAll = () => {
        navigate("/customer/search?sortBy=rating&minRating=4.0");
    };

    if (isLoading) {
        return (
            <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Featured Workers
                        </h2>
                        <p className="text-gray-600 mt-1">
                            Top-rated professionals in your area
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div
                            key={item}
                            className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 animate-pulse"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gray-300 rounded-2xl"></div>
                                    <div>
                                        <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                                    </div>
                                </div>
                                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                            </div>
                            <div className="space-y-3 mb-4">
                                {[1, 2, 3, 4].map((item) => (
                                    <div
                                        key={item}
                                        className="flex justify-between"
                                    >
                                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                                        <div className="h-3 bg-gray-300 rounded w-20"></div>
                                    </div>
                                ))}
                            </div>
                            <div className="h-10 bg-gray-200 rounded-2xl"></div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (!isLoading && featuredWorkers.length === 0) {
        return (
            <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Featured Workers
                        </h2>
                        <p className="text-gray-600 mt-1">
                            Top-rated professionals in your area
                        </p>
                    </div>
                    <button
                        onClick={fetchFeaturedWorkers}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Retry</span>
                    </button>
                </div>
                <div className="text-center py-12 bg-gray-50 rounded-3xl">
                    <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No featured workers available
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Check back later for top-rated professionals
                    </p>
                    <button
                        onClick={fetchFeaturedWorkers}
                        className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-colors"
                    >
                        Refresh
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Featured Workers
                    </h2>
                    <p className="text-gray-600 mt-1">
                        Top-rated professionals in your area
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={fetchFeaturedWorkers}
                        disabled={isLoading}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                        <RefreshCw
                            className={`w-4 h-4 ${
                                isLoading ? "animate-spin" : ""
                            }`}
                        />
                        <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
                    </button>
                    <button
                        onClick={handleViewAll}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        View All
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredWorkers.map((worker) => (
                    <div
                        key={worker.id}
                        className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 group"
                    >
                        {/* Header with Avatar and Badge */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-semibold text-lg">
                                        {worker.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </div>
                                    {worker.verified && (
                                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                                            <Shield className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">
                                        {worker.name}
                                    </div>
                                    <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                                        <MapPin className="w-4 h-4" />
                                        <span>{worker.distance}</span>
                                    </div>
                                </div>
                            </div>
                            <div
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(
                                    worker.badge
                                )}`}
                            >
                                {worker.badge}
                            </div>
                        </div>

                        {/* Service Details */}
                        <div className="space-y-3 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Service:</span>
                                <span className="font-semibold text-gray-900">
                                    {worker.service}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                    Completed Jobs:
                                </span>
                                <span className="font-semibold text-gray-900">
                                    {worker.completedJobs}
                                </span>
                            </div>
                        </div>

                        {/* Rating and Price */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                    <span className="font-semibold text-gray-900">
                                        {worker.rating.toFixed(1)}
                                    </span>
                                </div>
                                <span className="text-gray-500 text-sm">
                                    ({worker.totalRatings})
                                </span>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900">
                                    ₹{worker.price}
                                </div>
                                <div className="text-gray-500 text-sm">
                                    starting from
                                </div>
                            </div>
                        </div>

                        {/* Availability and Actions */}
                        <div className="space-y-3">
                            {!worker.available && (
                                <div className="text-center">
                                    <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                                        <Clock className="w-4 h-4 mr-1" />
                                        Not Available Today
                                    </div>
                                </div>
                            )}

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => {
                                        navigate(
                                            `/customer/worker/profile/${worker.id}`
                                        );
                                    }}
                                    className={`flex-1 py-3 rounded-2xl font-semibold transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg`}
                                >
                                    View Profile
                                </button>
                                <ChatInitiateButton
                                    workerId={worker.id}
                                    className="py-3 px-2 rounded-2xl font-semibold transition-all duration-300"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FeaturedWorkers;
