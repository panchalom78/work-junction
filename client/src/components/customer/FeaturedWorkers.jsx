import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    MapPin,
    Star,
    Shield,
    Clock,
    Award,
    Loader2,
    RefreshCw,
    Calculator,
    PieChart,
    Code,
    Zap,
    TrendingUp,
    BadgeCheck,
    Sparkles,
} from "lucide-react";
import { useWorkerSearchStore } from "../../store/workerSearch.store";
import ChatInitiateButton from "../ChatInitiateButton";

const FeaturedWorkers = () => {
    const navigate = useNavigate();
    const { workers, searchWorkers, loading } = useWorkerSearchStore();
    const [featuredWorkers, setFeaturedWorkers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hoveredCard, setHoveredCard] = useState(null);

    const fetchFeaturedWorkers = async () => {
        setIsLoading(true);
        try {
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
                experience: Math.floor(Math.random() * 8) + 2,
                responseTime: Math.floor(Math.random() * 30) + 5,
            }));
            setFeaturedWorkers(transformedWorkers);
        }
    }, [workers]);

    const getWorkerBadge = (worker, index) => {
        const badges = [
            { name: "Top Rated", icon: Star, color: "amber" },
            { name: "Fast Responder", icon: Zap, color: "emerald" },
            { name: "Professional", icon: BadgeCheck, color: "blue" },
            { name: "Expert", icon: TrendingUp, color: "purple" },
            { name: "Quality Pro", icon: Sparkles, color: "orange" },
            { name: "Specialist", icon: Award, color: "cyan" },
        ];

        if (worker.avgRating >= 4.8) return badges[0];
        if (worker.totalRatings > 150) return badges[2];
        if (worker.totalCompletedJobs > 250) return badges[3];

        return badges[index % badges.length];
    };

    const getBadgeColor = (badge) => {
        const colors = {
            amber: "bg-amber-50 text-amber-700 border-amber-200",
            emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
            blue: "bg-blue-50 text-blue-700 border-blue-200",
            purple: "bg-purple-50 text-purple-700 border-purple-200",
            orange: "bg-orange-50 text-orange-700 border-orange-200",
            cyan: "bg-cyan-50 text-cyan-700 border-cyan-200",
        };
        return colors[badge.color] || colors.blue;
    };

    const handleViewAll = () => {
        navigate("/customer/search?sortBy=rating&minRating=4.0");
    };

    if (isLoading) {
        return (
            <section className="mb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div
                            key={item}
                            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-pulse"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
                                    <div>
                                        <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                                        <div className="h-4 bg-gray-100 rounded w-24"></div>
                                    </div>
                                </div>
                                <div className="h-7 bg-gray-200 rounded-full w-20"></div>
                            </div>
                            <div className="space-y-3 mb-4">
                                {[1, 2, 3].map((item) => (
                                    <div
                                        key={item}
                                        className="flex justify-between"
                                    >
                                        <div className="h-4 bg-gray-100 rounded w-20"></div>
                                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                                    </div>
                                ))}
                            </div>
                            <div className="h-12 bg-gray-200 rounded-xl"></div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (!isLoading && featuredWorkers.length === 0) {
        return (
            <section className="mb-16">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Featured Professionals
                        </h2>
                        <p className="text-gray-600 mt-2">
                            Top-rated professionals in your area
                        </p>
                    </div>
                    <button
                        onClick={fetchFeaturedWorkers}
                        className="flex items-center space-x-3 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 hover:shadow-lg"
                    >
                        <RefreshCw className="w-5 h-5" />
                        <span>Try Again</span>
                    </button>
                </div>
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
                    <Award className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                        No Featured Professionals Available
                    </h3>
                    <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                        We're currently updating our list of top-rated
                        professionals. Please check back soon.
                    </p>
                    <button
                        onClick={fetchFeaturedWorkers}
                        className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold"
                    >
                        Refresh List
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="mb-16">
            {/* Header Section */}

            {/* Controls */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={fetchFeaturedWorkers}
                    disabled={isLoading}
                    className="flex items-center space-x-3 bg-white text-gray-700 px-5 py-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 disabled:opacity-50"
                >
                    <RefreshCw
                        className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
                    />
                    <span className="font-medium">
                        {isLoading ? "Refreshing..." : "Refresh List"}
                    </span>
                </button>

                <button
                    onClick={handleViewAll}
                    className="group flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold transition-all duration-300"
                >
                    <span>View All Professionals</span>
                    <TrendingUp className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Workers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredWorkers.map((worker, index) => {
                    const BadgeIcon = worker.badge.icon;
                    return (
                        <div
                            key={worker.id}
                            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden"
                            onMouseEnter={() => setHoveredCard(worker.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            {/* Background Glow Effect */}
                            <div
                                className={`absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                                    hoveredCard === worker.id
                                        ? "opacity-100"
                                        : ""
                                }`}
                            ></div>

                            <div className="relative z-10 p-6">
                                {/* Header with Avatar and Info */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative">
                                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                {worker.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                            </div>
                                            {worker.verified && (
                                                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 shadow-lg border-2 border-white">
                                                    <Shield className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg leading-tight">
                                                {worker.name}
                                            </h3>
                                            <p className="text-gray-600 text-sm mt-1">
                                                {worker.service}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Badge */}
                                    <div
                                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold ${getBadgeColor(
                                            worker.badge
                                        )}`}
                                    >
                                        <BadgeIcon className="w-4 h-4" />
                                        <span>{worker.badge.name}</span>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="text-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex items-center justify-center space-x-1 mb-1">
                                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                            <span className="font-bold text-gray-900">
                                                {worker.rating.toFixed(1)}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {worker.totalRatings} reviews
                                        </div>
                                    </div>

                                    <div className="text-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                        <div className="font-bold text-gray-900 mb-1">
                                            {worker.completedJobs}+
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            Jobs done
                                        </div>
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            ₹{worker.price}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Starting price
                                        </div>
                                    </div>
                                    {worker.available ? (
                                        <div className="flex items-center space-x-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-sm font-semibold">
                                                Available
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-1.5 text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-sm font-semibold">
                                                Busy
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/customer/worker/profile/${worker.id}`
                                            )
                                        }
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 transform text-center"
                                    >
                                        View Profile
                                    </button>
                                    <ChatInitiateButton
                                        workerId={worker.id}
                                        className="flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3.5 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 transform min-w-[60px]"
                                    />
                                </div>
                            </div>

                            {/* Hover Effect Border */}
                            <div
                                className={`absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 ${
                                    hoveredCard === worker.id
                                        ? "opacity-100"
                                        : ""
                                }`}
                            >
                                <div className="absolute inset-[2px] rounded-2xl bg-white"></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-12">
                <button
                    onClick={handleViewAll}
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-12 py-4 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105 transform inline-flex items-center space-x-3"
                >
                    <span>Explore All Professionals</span>
                    <TrendingUp className="w-5 h-5" />
                </button>
            </div>
        </section>
    );
};

export default FeaturedWorkers;
