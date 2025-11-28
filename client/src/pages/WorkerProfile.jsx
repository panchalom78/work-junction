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
    IndianRupee,
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
    Bookmark,
    Share2,
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
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        const fetchWorkerProfile = async () => {
            try {
                const response = await getWorkerProfile(workerId);
                console.log(response.data);
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

    const formatPrice = (price, pricingType) => {
        return `₹${price}${pricingType === "HOURLY" ? "/hour" : ""}`;
    };

    const getRatingCount = (worker) => {
        if (!worker) return 0;
        let count = 0;
        worker.ratingStats.ratingDistribution.forEach(
            (r) => (count += r.count)
        );
        return count;
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <div className="text-gray-600 text-sm sm:text-base">
                        Loading profile...
                    </div>
                </div>
            </div>
        );
    }

    if (!worker) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Worker not found
                    </h3>
                    <p className="text-gray-600 mb-6 text-sm sm:text-base">
                        The worker profile you're looking for doesn't exist.
                    </p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors text-sm sm:text-base"
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
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-3 sm:py-4">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                                Worker Profile
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 lg:sticky lg:top-24">
                            {/* Profile Header */}
                            <div className="text-center mb-4 sm:mb-6">
                                <div className="relative inline-block">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl sm:rounded-3xl flex items-center justify-center text-white font-bold text-xl sm:text-2xl mb-3 sm:mb-4 overflow-hidden">
                                        <img
                                            src={
                                                worker.workerProfile
                                                    .verification.selfieUrl
                                            }
                                            alt={worker.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {worker.workerProfile?.verification
                                        ?.status === "APPROVED" && (
                                        <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-green-500 rounded-full p-1 sm:p-2">
                                            <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                                <h2 className="text-lg sm:text-xl lg:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
                                    {worker.name}
                                </h2>
                                <div
                                    className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${verification.bgColor} ${verification.color}`}
                                >
                                    {verification.status}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                                        <span className="font-semibold text-sm sm:text-base">
                                            Rating
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-gray-900 text-sm sm:text-base">
                                            {ratingStats.avgRating.toFixed(1)}
                                        </div>
                                        <div className="text-xs sm:text-sm text-gray-500">
                                            ({getRatingCount(worker)} reviews)
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                                        <span className="font-semibold text-sm sm:text-base">
                                            Jobs Done
                                        </span>
                                    </div>
                                    <div className="font-bold text-gray-900 text-sm sm:text-base">
                                        {worker.totalCompletedJobs || 0}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                                        <span className="font-semibold text-sm sm:text-base">
                                            Total Earned
                                        </span>
                                    </div>
                                    <div className="font-bold text-gray-900 text-sm sm:text-base">
                                        ₹
                                        {(
                                            worker.totalEarnings || 0
                                        ).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                                <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
                                    Contact Info
                                </h3>
                                {worker.phone && (
                                    <div className="flex items-center space-x-2 sm:space-x-3 text-gray-600 text-xs sm:text-sm">
                                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                        <span className="break-all">
                                            {worker.phone}
                                        </span>
                                    </div>
                                )}
                                {worker.email && (
                                    <div className="flex items-center space-x-2 sm:space-x-3 text-gray-600 text-xs sm:text-sm">
                                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                        <span className="break-all">
                                            {worker.email}
                                        </span>
                                    </div>
                                )}
                                {worker.address && (
                                    <div className="flex items-start space-x-2 sm:space-x-3 text-gray-600 text-xs sm:text-sm">
                                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            {worker.address.area && (
                                                <div className="truncate">
                                                    {worker.address.area}
                                                </div>
                                            )}
                                            {worker.address.city && (
                                                <div className="truncate">
                                                    {worker.address.city},{" "}
                                                    {worker.address.state}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-2 sm:space-y-3">
                                <button
                                    onClick={handleBookNow}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 sm:py-3 rounded-xl sm:rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
                                >
                                    Book Now
                                </button>
                                <ChatInitiateButton
                                    workerId={worker._id}
                                    workerName={worker.name}
                                    className="w-full bg-white text-gray-900 border border-gray-300 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 text-center text-sm sm:text-base"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:w-2/3">
                        {/* Tabs */}
                        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg mb-4 sm:mb-6 lg:mb-8 overflow-hidden">
                            <div className="border-b border-gray-200 overflow-x-auto">
                                <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 min-w-max">
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
                                            count: getRatingCount(worker),
                                        },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center py-3 sm:py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
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

                            <div className="p-4 sm:p-6">
                                {/* Services Tab */}
                                {activeTab === "services" && (
                                    <div className="space-y-4 sm:space-y-6">
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
                                            Services Offered
                                        </h3>
                                        <div className="space-y-4 sm:space-y-6">
                                            {worker.services?.map((service) => (
                                                <div
                                                    key={service._id}
                                                    className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6"
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-gray-900 text-base sm:text-lg mb-1 sm:mb-2">
                                                                {
                                                                    worker.skills
                                                                        .find(
                                                                            (
                                                                                skill
                                                                            ) =>
                                                                                skill._id ===
                                                                                service.skillId
                                                                        )
                                                                        ?.services.find(
                                                                            (
                                                                                s
                                                                            ) =>
                                                                                s.serviceId ==
                                                                                service.serviceId
                                                                        )?.name
                                                                }
                                                            </h4>
                                                            <p className="text-gray-600 text-sm sm:text-base mb-2">
                                                                {service.details ||
                                                                    "Not specified"}
                                                            </p>
                                                            <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                                                <span className="flex items-center space-x-1">
                                                                    <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                    <span>
                                                                        {worker.skills?.find(
                                                                            (
                                                                                s
                                                                            ) =>
                                                                                s._id.toString() ===
                                                                                service.skillId.toString()
                                                                        )
                                                                            ?.name ||
                                                                            "General Service"}
                                                                    </span>
                                                                </span>
                                                                <span className="flex items-center space-x-1">
                                                                    <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                    <span>
                                                                        {formatPrice(
                                                                            service.price,
                                                                            service.pricingType
                                                                        )}
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right sm:text-left">
                                                            <div className="text-xl sm:text-2xl font-bold text-green-700">
                                                                ₹{service.price}
                                                            </div>
                                                            <div className="text-xs sm:text-sm text-gray-500 capitalize">
                                                                {service.pricingType?.toLowerCase()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {service.portfolioImages &&
                                                        service.portfolioImages
                                                            .length > 0 && (
                                                            <div className="mt-3 sm:mt-4">
                                                                <h5 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
                                                                    Portfolio
                                                                    Images
                                                                </h5>
                                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                                                    {service.portfolioImages
                                                                        .slice(
                                                                            0,
                                                                            4
                                                                        )
                                                                        .map(
                                                                            (
                                                                                image,
                                                                                index
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        image.imageId
                                                                                    }
                                                                                    className="aspect-square bg-gray-200 rounded-lg sm:rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
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
                                    </div>
                                )}

                                {/* Portfolio Tab */}
                                {activeTab === "portfolio" && (
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                                            Portfolio Gallery
                                        </h3>
                                        {portfolioImages.length > 0 ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                                                {portfolioImages.map(
                                                    (image) => (
                                                        <div
                                                            key={image.imageId}
                                                            className="aspect-square bg-gray-200 rounded-lg sm:rounded-xl overflow-hidden cursor-pointer group relative"
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
                                                            <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-end">
                                                                {image.caption && (
                                                                    <div className="p-2 sm:p-3 text-white text-xs sm:text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                                            <div className="text-center py-8 sm:py-12">
                                                <Camera className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                                                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                                                    No Portfolio Images
                                                </h4>
                                                <p className="text-gray-600 text-sm sm:text-base">
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
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                                            Customer Reviews
                                        </h3>
                                        {ratingStats.totalRatings > 0 ? (
                                            <div className="space-y-4 sm:space-y-6">
                                                {/* Rating Summary */}
                                                <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 lg:space-x-6 space-y-4 sm:space-y-0">
                                                        <div className="text-center">
                                                            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-1 sm:mb-2">
                                                                {ratingStats.avgRating.toFixed(
                                                                    1
                                                                )}
                                                            </div>
                                                            <div className="flex items-center justify-center space-x-1 mb-1 sm:mb-2">
                                                                {[
                                                                    1, 2, 3, 4,
                                                                    5,
                                                                ].map(
                                                                    (star) => (
                                                                        <Star
                                                                            key={
                                                                                star
                                                                            }
                                                                            className={`w-4 h-4 sm:w-5 sm:h-5 ${
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
                                                                {getRatingCount(
                                                                    worker
                                                                )}{" "}
                                                                reviews
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 space-y-1 sm:space-y-2">
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
                                                                        className="flex items-center space-x-2 sm:space-x-3"
                                                                    >
                                                                        <div className="flex items-center space-x-1 w-12 sm:w-16">
                                                                            <span className="text-xs sm:text-sm text-gray-600 w-3 sm:w-4">
                                                                                {
                                                                                    star
                                                                                }
                                                                            </span>
                                                                            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                                                                        </div>
                                                                        <div className="flex-1 bg-gray-200 rounded-full h-1.5 sm:h-2">
                                                                            <div
                                                                                className="bg-yellow-400 h-1.5 sm:h-2 rounded-full"
                                                                                style={{
                                                                                    width: `${percentage}%`,
                                                                                }}
                                                                            ></div>
                                                                        </div>
                                                                        <div className="text-xs sm:text-sm text-gray-600 w-8 sm:w-12 text-right">
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

                                                {/* Reviews List */}
                                                <div className="space-y-3 sm:space-y-4">
                                                    {ratingStats.ratingDistribution
                                                        ?.map((ratingGroup) =>
                                                            ratingGroup.reviews?.map(
                                                                (
                                                                    review,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={`${ratingGroup.stars}-${index}`}
                                                                        className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-md transition-shadow"
                                                                    >
                                                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                                                                            <div className="flex items-center space-x-2 sm:space-x-3">
                                                                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                                                    {review.customerName
                                                                                        ?.charAt(
                                                                                            0
                                                                                        )
                                                                                        ?.toUpperCase() ||
                                                                                        "C"}
                                                                                </div>
                                                                                <div>
                                                                                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                                                                                        {review.customerName ||
                                                                                            "Anonymous Customer"}
                                                                                    </h4>
                                                                                    <div className="flex items-center space-x-1 sm:space-x-2 mt-1">
                                                                                        <div className="flex items-center space-x-0.5 sm:space-x-1">
                                                                                            {[
                                                                                                1,
                                                                                                2,
                                                                                                3,
                                                                                                4,
                                                                                                5,
                                                                                            ].map(
                                                                                                (
                                                                                                    star
                                                                                                ) => (
                                                                                                    <Star
                                                                                                        key={
                                                                                                            star
                                                                                                        }
                                                                                                        className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                                                                                            star <=
                                                                                                            review.rating
                                                                                                                ? "text-yellow-400 fill-current"
                                                                                                                : "text-gray-300"
                                                                                                        }`}
                                                                                                    />
                                                                                                )
                                                                                            )}
                                                                                        </div>
                                                                                        <span className="text-xs sm:text-sm text-gray-500">
                                                                                            {
                                                                                                review.rating
                                                                                            }
                                                                                            .0
                                                                                        </span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="text-right text-xs sm:text-sm text-gray-500">
                                                                                {review.reviewedAt ? (
                                                                                    <>
                                                                                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                                                                                        {new Date(
                                                                                            review.reviewedAt
                                                                                        ).toLocaleDateString(
                                                                                            "en-US",
                                                                                            {
                                                                                                year: "numeric",
                                                                                                month: "short",
                                                                                                day: "numeric",
                                                                                            }
                                                                                        )}
                                                                                    </>
                                                                                ) : (
                                                                                    "Date not available"
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        {review.comment && (
                                                                            <p className="text-gray-700 bg-gray-50 rounded-lg p-3 sm:p-4 text-xs sm:text-sm leading-relaxed">
                                                                                "
                                                                                {
                                                                                    review.comment
                                                                                }

                                                                                "
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                )
                                                            )
                                                        )
                                                        .flat()
                                                        .filter(Boolean)}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 sm:py-12">
                                                <Star className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                                                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                                                    No Reviews Yet
                                                </h4>
                                                <p className="text-gray-600 text-sm sm:text-base">
                                                    This worker hasn't received
                                                    any reviews yet.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4">
                    <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl max-w-full sm:max-w-2xl lg:max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="relative">
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 bg-black/50 text-white p-1 sm:p-2 rounded-full hover:bg-black/70 transition-colors"
                            >
                                <X className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                            </button>
                            <img
                                src={selectedImage.imageUrl}
                                alt={selectedImage.caption || "Portfolio image"}
                                className="w-full h-auto max-h-[60vh] sm:max-h-[70vh] object-contain"
                            />
                        </div>
                        <div className="p-3 sm:p-4 lg:p-6">
                            {selectedImage.caption && (
                                <p className="text-gray-900 font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                                    {selectedImage.caption}
                                </p>
                            )}
                            {selectedImage.serviceName && (
                                <p className="text-gray-600 text-xs sm:text-sm">
                                    From: {selectedImage.serviceName}
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
