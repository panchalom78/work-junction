import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    MapPin,
    Star,
    Shield,
    MessageCircle,
    Clock,
    Award,
    Calendar,
    DollarSign,
    CheckCircle,
    X,
    ChevronLeft,
    Camera,
    User,
    Briefcase,
    Phone,
    Mail,
    Globe,
    ThumbsUp,
} from "lucide-react";
import { useWorkerSearchStore } from "../store/workerSearch.store";
import ChatInitiateButton from "../components/ChatInitiateButton";

const WorkerProfile = () => {
    const { workerId } = useParams();
    const navigate = useNavigate();
    const { getWorkerProfile, loading } = useWorkerSearchStore();

    const [worker, setWorker] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [activeTab, setActiveTab] = useState("services");

    useEffect(() => {
        const fetchWorkerProfile = async () => {
            try {
                const response = await getWorkerProfile(workerId);
                setWorker(response.data);
            } catch (error) {
                console.error("Failed to fetch worker profile:", error);
            }
        };

        if (workerId) {
            fetchWorkerProfile();
        }
    }, [workerId, getWorkerProfile]);

    // Get all portfolio images from services
    const getAllPortfolioImages = () => {
        if (!worker?.services) return [];
        return worker.services.flatMap(
            (service) =>
                service.portfolioImages?.map((image) => ({
                    ...image,
                    serviceName: service.details,
                })) || []
        );
    };

    const handleBookNow = () => {
        navigate(`/customer/booking/${workerId}`);
    };

    const handleMessage = () => {
        navigate(`/chat/${workerId}`);
    };

    const formatPrice = (price, pricingType) => {
        return `₹${price}${pricingType === "HOURLY" ? "/hour" : ""}`;
    };

    const getVerificationStatus = () => {
        const verification = worker?.workerProfile?.verification;
        if (!verification)
            return {
                status: "Not Verified",
                color: "text-gray-500",
                bgColor: "bg-gray-100",
            };

        switch (verification.status) {
            case "APPROVED":
                return {
                    status: "Verified",
                    color: "text-green-600",
                    bgColor: "bg-green-100",
                };
            case "PENDING":
                return {
                    status: "Verification Pending",
                    color: "text-yellow-600",
                    bgColor: "bg-yellow-100",
                };
            case "REJECTED":
                return {
                    status: "Verification Failed",
                    color: "text-red-600",
                    bgColor: "bg-red-100",
                };
            default:
                return {
                    status: "Not Verified",
                    color: "text-gray-500",
                    bgColor: "bg-gray-100",
                };
        }
    };

    if (loading && !worker) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <div className="text-gray-600">Loading profile...</div>
                </div>
            </div>
        );
    }

    if (!worker) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Worker not found
                    </h3>
                    <p className="text-gray-600 mb-6">
                        The worker profile you're looking for doesn't exist.
                    </p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const verification = getVerificationStatus();
    const portfolioImages = getAllPortfolioImages();
    const ratingStats = worker.ratingStats || {
        avgRating: 0,
        totalRatings: 0,
        ratingDistribution: [],
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-2xl transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Worker Profile
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-lg p-6 sticky top-8">
                            {/* Profile Header */}
                            <div className="text-center mb-6">
                                <div className="relative inline-block">
                                    <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center text-white font-bold text-2xl mb-4">
                                        {worker.name
                                            ?.split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </div>
                                    {worker.workerProfile?.verification
                                        ?.status === "APPROVED" && (
                                        <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                                            <Shield className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">
                                    {worker.name}
                                </h2>
                                <div
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${verification.bgColor} ${verification.color}`}
                                >
                                    {verification.status}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                        <span className="font-semibold">
                                            Rating
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-gray-900">
                                            {ratingStats.avgRating.toFixed(1)}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            ({ratingStats.totalRatings} reviews)
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Briefcase className="w-5 h-5 text-blue-500" />
                                        <span className="font-semibold">
                                            Jobs Done
                                        </span>
                                    </div>
                                    <div className="font-bold text-gray-900">
                                        {worker.totalCompletedJobs || 0}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <ThumbsUp className="w-5 h-5 text-green-500" />
                                        <span className="font-semibold">
                                            Response Rate
                                        </span>
                                    </div>
                                    <div className="font-bold text-gray-900">
                                        {Math.round(worker.responseRate || 0)}%
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <DollarSign className="w-5 h-5 text-green-500" />
                                        <span className="font-semibold">
                                            Total Earned
                                        </span>
                                    </div>
                                    <div className="font-bold text-gray-900">
                                        ₹
                                        {(
                                            worker.totalEarnings || 0
                                        ).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-3 mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3">
                                    Contact Info
                                </h3>
                                {worker.phone && (
                                    <div className="flex items-center space-x-3 text-gray-600">
                                        <Phone className="w-4 h-4" />
                                        <span>{worker.phone}</span>
                                    </div>
                                )}
                                {worker.email && (
                                    <div className="flex items-center space-x-3 text-gray-600">
                                        <Mail className="w-4 h-4" />
                                        <span className="text-sm truncate">
                                            {worker.email}
                                        </span>
                                    </div>
                                )}
                                {worker.address && (
                                    <div className="flex items-start space-x-3 text-gray-600">
                                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <div className="text-sm">
                                            {worker.address.street && (
                                                <div>
                                                    {worker.address.street}
                                                </div>
                                            )}
                                            {worker.address.area && (
                                                <div>{worker.address.area}</div>
                                            )}
                                            {worker.address.city && (
                                                <div>
                                                    {worker.address.city},{" "}
                                                    {worker.address.state}
                                                </div>
                                            )}
                                            {worker.address.pincode && (
                                                <div>
                                                    {worker.address.pincode}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={handleBookNow}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300"
                                >
                                    Book Now
                                </button>
                                <ChatInitiateButton
                                    workerId={worker._id}
                                    workerName={worker.name}
                                    className="w-full rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 text-center py-3"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Tabs */}
                        <div className="bg-white rounded-3xl shadow-lg mb-8">
                            <div className="border-b border-gray-200">
                                <nav className="flex space-x-8 px-6">
                                    {[
                                        {
                                            id: "services",
                                            name: "Services",
                                            count: worker.services?.length || 0,
                                        },
                                        {
                                            id: "portfolio",
                                            name: "Portfolio",
                                            count: portfolioImages.length,
                                        },
                                        {
                                            id: "reviews",
                                            name: "Reviews",
                                            count: ratingStats.totalRatings,
                                        },
                                        { id: "about", name: "About" },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                                activeTab === tab.id
                                                    ? "border-blue-600 text-blue-600"
                                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                            }`}
                                        >
                                            {tab.name}
                                            {tab.count !== undefined && (
                                                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                                                    {tab.count}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            <div className="p-6">
                                {/* Services Tab */}
                                {activeTab === "services" && (
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                                            Services Offered
                                        </h3>
                                        {worker.services?.map((service) => (
                                            <div
                                                key={service._id}
                                                className="bg-gray-50 rounded-2xl p-6"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 text-lg">
                                                            {
                                                                service.details.split(
                                                                    "."
                                                                )[0]
                                                            }
                                                        </h4>
                                                        <p className="mb-2">
                                                            Details:
                                                            {
                                                                service.details.split(
                                                                    "."
                                                                )[1]
                                                            }
                                                        </p>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                            <span className="flex items-center space-x-1">
                                                                <Briefcase className="w-4 h-4" />
                                                                <span>
                                                                    {worker.skills?.find(
                                                                        (s) =>
                                                                            s._id.toString() ===
                                                                            service.skillId.toString()
                                                                    )?.name ||
                                                                        "General Service"}
                                                                </span>
                                                            </span>
                                                            <span className="flex items-center space-x-1">
                                                                <DollarSign className="w-4 h-4" />
                                                                <span>
                                                                    {formatPrice(
                                                                        service.price,
                                                                        service.pricingType
                                                                    )}
                                                                </span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-gray-900">
                                                            ₹{service.price}
                                                        </div>
                                                        <div className="text-sm text-gray-500 capitalize">
                                                            {service.pricingType?.toLowerCase()}
                                                        </div>
                                                    </div>
                                                </div>
                                                {service.portfolioImages &&
                                                    service.portfolioImages
                                                        .length > 0 && (
                                                        <div className="mt-4">
                                                            <h5 className="font-medium text-gray-900 mb-3">
                                                                Portfolio Images
                                                            </h5>
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                                {service.portfolioImages
                                                                    .slice(0, 4)
                                                                    .map(
                                                                        (
                                                                            image,
                                                                            index
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    image.imageId
                                                                                }
                                                                                className="aspect-square bg-gray-200 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                                                                                onClick={() =>
                                                                                    setSelectedImage(
                                                                                        {
                                                                                            ...image,
                                                                                            serviceName:
                                                                                                service.details,
                                                                                        }
                                                                                    )
                                                                                }
                                                                            >
                                                                                <img
                                                                                    src={
                                                                                        image.imageUrl
                                                                                    }
                                                                                    alt={
                                                                                        image.caption ||
                                                                                        service.details
                                                                                    }
                                                                                    className="w-full h-full object-cover"
                                                                                />
                                                                            </div>
                                                                        )
                                                                    )}
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Portfolio Tab */}
                                {activeTab === "portfolio" && (
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-6">
                                            Portfolio Gallery
                                        </h3>
                                        {portfolioImages.length > 0 ? (
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {portfolioImages.map(
                                                    (image) => (
                                                        <div
                                                            key={image.imageId}
                                                            className="aspect-square bg-gray-200 rounded-xl overflow-hidden cursor-pointer group relative"
                                                            onClick={() =>
                                                                setSelectedImage(
                                                                    image
                                                                )
                                                            }
                                                        >
                                                            <img
                                                                src={
                                                                    image.imageUrl
                                                                }
                                                                alt={
                                                                    image.caption ||
                                                                    "Portfolio image"
                                                                }
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-end">
                                                                {image.caption && (
                                                                    <div className="p-3 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                                        {
                                                                            image.caption
                                                                        }
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                                    No Portfolio Images
                                                </h4>
                                                <p className="text-gray-600">
                                                    This worker hasn't added any
                                                    portfolio images yet.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Reviews Tab */}
                                {activeTab === "reviews" && (
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-6">
                                            Customer Reviews
                                        </h3>
                                        {ratingStats.totalRatings > 0 ? (
                                            <div className="space-y-6">
                                                {/* Rating Summary */}
                                                <div className="bg-gray-50 rounded-2xl p-6">
                                                    <div className="flex items-center space-x-6">
                                                        <div className="text-center">
                                                            <div className="text-5xl font-bold text-gray-900 mb-2">
                                                                {ratingStats.avgRating.toFixed(
                                                                    1
                                                                )}
                                                            </div>
                                                            <div className="flex items-center justify-center space-x-1 mb-2">
                                                                {[
                                                                    1, 2, 3, 4,
                                                                    5,
                                                                ].map(
                                                                    (star) => (
                                                                        <Star
                                                                            key={
                                                                                star
                                                                            }
                                                                            className={`w-5 h-5 ${
                                                                                star <=
                                                                                Math.floor(
                                                                                    ratingStats.avgRating
                                                                                )
                                                                                    ? "text-yellow-400 fill-current"
                                                                                    : "text-gray-300"
                                                                            }`}
                                                                        />
                                                                    )
                                                                )}
                                                            </div>
                                                            <div className="text-gray-600 text-sm">
                                                                {
                                                                    ratingStats.totalRatings
                                                                }{" "}
                                                                reviews
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 space-y-2">
                                                            {[
                                                                5, 4, 3, 2, 1,
                                                            ].map((star) => {
                                                                const distribution =
                                                                    ratingStats.ratingDistribution?.find(
                                                                        (d) =>
                                                                            d.stars ===
                                                                            star
                                                                    );
                                                                const count =
                                                                    distribution?.count ||
                                                                    0;
                                                                const percentage =
                                                                    ratingStats.totalRatings >
                                                                    0
                                                                        ? (count /
                                                                              ratingStats.totalRatings) *
                                                                          100
                                                                        : 0;

                                                                return (
                                                                    <div
                                                                        key={
                                                                            star
                                                                        }
                                                                        className="flex items-center space-x-3"
                                                                    >
                                                                        <div className="flex items-center space-x-1 w-16">
                                                                            <span className="text-sm text-gray-600 w-4">
                                                                                {
                                                                                    star
                                                                                }
                                                                            </span>
                                                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                                        </div>
                                                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                                            <div
                                                                                className="bg-yellow-400 h-2 rounded-full"
                                                                                style={{
                                                                                    width: `${percentage}%`,
                                                                                }}
                                                                            ></div>
                                                                        </div>
                                                                        <div className="text-sm text-gray-600 w-12 text-right">
                                                                            {
                                                                                count
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Reviews List - You can expand this to show actual reviews */}
                                                <div className="text-center py-8">
                                                    <p className="text-gray-600">
                                                        Detailed reviews will be
                                                        shown here when
                                                        available.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                                    No Reviews Yet
                                                </h4>
                                                <p className="text-gray-600">
                                                    This worker hasn't received
                                                    any reviews yet.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* About Tab */}
                                {activeTab === "about" && (
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold text-gray-900">
                                            About {worker.name}
                                        </h3>

                                        {/* Availability */}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3">
                                                Availability
                                            </h4>
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className={`w-3 h-3 rounded-full ${
                                                        worker.workerProfile
                                                            ?.availabilityStatus ===
                                                        "available"
                                                            ? "bg-green-500"
                                                            : worker
                                                                  .workerProfile
                                                                  ?.availabilityStatus ===
                                                              "busy"
                                                            ? "bg-yellow-500"
                                                            : "bg-gray-500"
                                                    }`}
                                                ></div>
                                                <span className="capitalize">
                                                    {worker.workerProfile?.availabilityStatus?.replace(
                                                        "-",
                                                        " "
                                                    ) || "Not specified"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Languages */}
                                        {worker.workerProfile
                                            ?.preferredLanguage && (
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-3">
                                                    Languages
                                                </h4>
                                                <div className="flex items-center space-x-2">
                                                    <Globe className="w-4 h-4 text-gray-600" />
                                                    <span>
                                                        {
                                                            worker.workerProfile
                                                                .preferredLanguage
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Member Since */}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3">
                                                Member Since
                                            </h4>
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="w-4 h-4 text-gray-600" />
                                                <span>
                                                    {new Date(
                                                        worker.createdAt
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        }
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-4xl max-h-[90vh] overflow-hidden">
                        <div className="relative">
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <img
                                src={selectedImage.imageUrl}
                                alt={selectedImage.caption || "Portfolio image"}
                                className="w-full h-auto max-h-[70vh] object-contain"
                            />
                        </div>
                        <div className="p-6">
                            {selectedImage.caption && (
                                <p className="text-gray-900 font-medium mb-2">
                                    {selectedImage.caption}
                                </p>
                            )}
                            {selectedImage.serviceName && (
                                <p className="text-gray-600 text-sm">
                                    From: {selectedImage.serviceName}
                                </p>
                            )}
                            {selectedImage.uploadedAt && (
                                <p className="text-gray-500 text-xs mt-2">
                                    Uploaded:{" "}
                                    {new Date(
                                        selectedImage.uploadedAt
                                    ).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkerProfile;
