import React from "react";
import {
    MapPin,
    Star,
    Shield,
    MessageCircle,
    Clock,
    Award,
} from "lucide-react";

const FeaturedWorkers = () => {
    const featuredWorkers = [
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
            completedJobs: 234,
            badge: "Top Rated",
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
            completedJobs: 156,
            badge: "Fast Responder",
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
            completedJobs: 189,
            badge: "Professional",
        },
        {
            id: 4,
            name: "Suresh Patel",
            skill: "Carpentry",
            service: "Furniture Repair",
            rating: 4.6,
            totalRatings: 78,
            price: 450,
            distance: "1.8 km",
            verified: true,
            available: true,
            experience: "6 years",
            responseTime: "20 min",
            completedJobs: 312,
            badge: "Expert",
        },
        {
            id: 5,
            name: "Anita Desai",
            skill: "Painting",
            service: "Wall Painting",
            rating: 4.9,
            totalRatings: 145,
            price: 1200,
            distance: "2.5 km",
            verified: true,
            available: true,
            experience: "4 years",
            responseTime: "30 min",
            completedJobs: 198,
            badge: "Quality Pro",
        },
        {
            id: 6,
            name: "Raj Kumar",
            skill: "AC Repair",
            service: "AC Service",
            rating: 4.8,
            totalRatings: 112,
            price: 600,
            distance: "2.8 km",
            verified: true,
            available: false,
            experience: "5 years",
            responseTime: "45 min",
            completedJobs: 267,
            badge: "Specialist",
        },
    ];

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
        // Navigate to booking page or open booking modal
        console.log("Booking worker:", workerId);
    };

    const handleMessage = (workerId) => {
        // Open chat with worker
        console.log("Message worker:", workerId);
    };

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
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                    View All
                </button>
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
                                    Experience:
                                </span>
                                <span className="font-semibold text-gray-900">
                                    {worker.experience}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                    Response Time:
                                </span>
                                <span className="font-semibold text-gray-900 flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{worker.responseTime}</span>
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                    Completed Jobs:
                                </span>
                                <span className="font-semibold text-gray-900">
                                    {worker.completedJobs}+
                                </span>
                            </div>
                        </div>

                        {/* Rating and Price */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                    <span className="font-semibold text-gray-900">
                                        {worker.rating}
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
                                    onClick={() => handleBookNow(worker.id)}
                                    disabled={!worker.available}
                                    className={`flex-1 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                                        worker.available
                                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg"
                                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    }`}
                                >
                                    {worker.available
                                        ? "Book Now"
                                        : "Not Available"}
                                </button>
                                <button
                                    onClick={() => handleMessage(worker.id)}
                                    className="w-12 h-12 border border-gray-300 rounded-2xl flex items-center justify-center hover:border-blue-600 hover:text-blue-600 transition-colors"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FeaturedWorkers;
