// components/ServiceAgentReviews.js
import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";
import {
    Star,
    Filter,
    Search,
    User,
    Phone,
    MapPin,
    Calendar,
    MessageCircle,
    CheckCircle,
    XCircle,
    Eye,
    Shield,
    AlertTriangle,
    ThumbsUp,
    ThumbsDown,
    Download,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    BarChart3,
    TrendingUp,
    TrendingDown,
    Clock,
    Mail,
    Briefcase,
    Award,
    FileText,
    Users,
    StarHalf,
    MoreVertical,
} from "lucide-react";

const ServiceAgentReviews = () => {
    const [activeView, setActiveView] = useState("reviews");
    const [reviews, setReviews] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        rating: "all",
        worker: "all",
        status: "all",
        dateRange: "all",
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedReview, setSelectedReview] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        averageRating: 0,
        positive: 0,
        negative: 0,
        pendingAction: 0,
    });
    const [expandedReview, setExpandedReview] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Fetch reviews and workers data
    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch workers
            const workersResponse = await axiosInstance.get(
                "/api/service-agent/non-smartphone-workers"
            );
            if (workersResponse.data.success) {
                setWorkers(workersResponse.data.data || []);
            }

            // Fetch reviews for all workers
            await fetchReviews();
        } catch (error) {
            console.error("Fetch data error:", error);
            toast.error("Failed to load reviews data");
        } finally {
            setLoading(false);
        }
    };

    // Fetch all reviews for agent's workers
    const fetchReviews = async () => {
        try {
            const reviewsResponse = await axiosInstance.get(
                "/api/service-agent/all-worker-reviews"
            );
            if (reviewsResponse.data.success) {
                const allReviews = reviewsResponse.data.data?.reviews || [];
                setReviews(allReviews);
                setWorkers(reviewsResponse.data.data?.workers || []);
                calculateStats(allReviews);
            }
        } catch (error) {
            console.error("Fetch reviews error:", error);
            toast.error("Failed to load reviews");
        }
    };

    // Update worker status
    const handleWorkerStatusChange = async (workerId, newStatus) => {
        try {
            const { data } = await axiosInstance.patch(
                `/api/service-agent/worker-status/${workerId}`,
                { isActive: newStatus }
            );

            if (data.success) {
                toast.success(
                    `Worker ${
                        newStatus ? "activated" : "deactivated"
                    } successfully`
                );
                await fetchReviews(); // Refresh data
            }
        } catch (error) {
            console.error("Update worker status error:", error);
            toast.error("Failed to update worker status");
        }
    };

    // Handle review action
    const handleReviewAction = async (reviewId, action) => {
        try {
            const { data } = await axiosInstance.post(
                `/api/service-agent/review-action/${reviewId}`,
                { action, notes: `Action taken by agent: ${action}` }
            );

            if (data.success) {
                toast.success(`Review ${action} successfully`);
                await fetchReviews(); // Refresh data
            }
        } catch (error) {
            console.error("Review action error:", error);
            toast.error("Failed to process review action");
        }
    };

    // Calculate statistics
    const calculateStats = (reviewsData) => {
        const total = reviewsData.length;
        const averageRating =
            total > 0
                ? reviewsData.reduce((sum, review) => sum + review.rating, 0) /
                  total
                : 0;
        const positive = reviewsData.filter(
            (review) => review.rating >= 4
        ).length;
        const negative = reviewsData.filter(
            (review) => review.rating <= 2
        ).length;
        const pendingAction = reviewsData.filter(
            (review) =>
                review.rating <= 2 &&
                review.worker?.workerProfile?.isActive !== false
        ).length;

        setStats({
            total,
            averageRating: Math.round(averageRating * 10) / 10,
            positive,
            negative,
            pendingAction,
        });
    };

    // Filter reviews based on filters and search
    const filteredReviews = reviews.filter((review) => {
        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                review.worker?.name?.toLowerCase().includes(searchLower) ||
                review.customer?.name?.toLowerCase().includes(searchLower) ||
                review.comment?.toLowerCase().includes(searchLower) ||
                review.service?.serviceName
                    ?.toLowerCase()
                    .includes(searchLower);
            if (!matchesSearch) return false;
        }

        // Rating filter
        if (filters.rating !== "all") {
            const rating = parseInt(filters.rating);
            if (review.rating !== rating) return false;
        }

        // Worker filter
        if (filters.worker !== "all" && review.worker?._id !== filters.worker) {
            return false;
        }

        // Status filter (based on rating and worker status)
        if (filters.status !== "all") {
            if (filters.status === "positive" && review.rating < 4)
                return false;
            if (filters.status === "negative" && review.rating > 2)
                return false;
            if (
                filters.status === "needs_action" &&
                (review.rating > 2 ||
                    review.worker?.workerProfile?.isActive === false)
            ) {
                return false;
            }
        }

        // Date range filter (simplified)
        if (filters.dateRange !== "all") {
            const reviewDate = new Date(review.createdAt);
            const now = new Date();
            const daysDiff = Math.floor(
                (now - reviewDate) / (1000 * 60 * 60 * 24)
            );

            if (filters.dateRange === "today" && daysDiff > 0) return false;
            if (filters.dateRange === "week" && daysDiff > 7) return false;
            if (filters.dateRange === "month" && daysDiff > 30) return false;
        }

        return true;
    });

    // Export reviews to CSV
    const exportToCSV = () => {
        const headers = [
            "Worker Name",
            "Customer Name",
            "Rating",
            "Comment",
            "Date",
            "Service",
            "Status",
        ];
        const csvData = filteredReviews.map((review) => [
            review.worker?.name || "N/A",
            review.customer?.name || "N/A",
            review.rating,
            `"${(review.comment || "").replace(/"/g, '""')}"`,
            new Date(review.createdAt).toLocaleDateString(),
            review.service?.serviceName || "N/A",
            review.rating >= 4
                ? "Positive"
                : review.rating <= 2
                ? "Negative"
                : "Neutral",
        ]);

        const csvContent = [headers, ...csvData]
            .map((row) => row.join(","))
            .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `worker-reviews-${
            new Date().toISOString().split("T")[0]
        }.csv`;
        link.click();
        URL.revokeObjectURL(url);

        toast.success("Reviews exported successfully");
    };

    // Star rating component
    const StarRating = ({ rating, size = "sm" }) => {
        const starSize = size === "lg" ? "w-4 h-4" : "w-3 h-3";

        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`${starSize} ${
                            star <= rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                        }`}
                    />
                ))}
                <span
                    className={`ml-1 font-medium ${
                        size === "lg" ? "text-base" : "text-xs"
                    } ${getRatingColor(rating)}`}
                >
                    {rating.toFixed(1)}
                </span>
            </div>
        );
    };

    // Get rating color based on score
    const getRatingColor = (rating) => {
        if (rating >= 4) return "text-green-600";
        if (rating >= 3) return "text-yellow-600";
        return "text-red-600";
    };

    // Get rating label
    const getRatingLabel = (rating) => {
        if (rating >= 4.5) return "Excellent";
        if (rating >= 4) return "Very Good";
        if (rating >= 3) return "Good";
        if (rating >= 2) return "Fair";
        return "Poor";
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Refresh data
    const handleRefresh = () => {
        fetchData();
        toast.success("Data refreshed");
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Stats Cards Component - Mobile Responsive
    const StatsCards = () => (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 md:gap-4 mb-4 md:mb-6">
            {/* Total Reviews */}
            <div className="bg-white rounded-lg md:rounded-xl p-2 md:p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-lg md:text-2xl font-bold text-gray-900">
                            {stats.total}
                        </p>
                        <p className="text-gray-600 text-xs md:text-sm">
                            Total Reviews
                        </p>
                    </div>
                    <div className="p-1 md:p-2 bg-blue-100 rounded-lg">
                        <FileText className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
                    </div>
                </div>
            </div>

            {/* Average Rating */}
            <div className="bg-white rounded-lg md:rounded-xl p-2 md:p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-lg md:text-2xl font-bold text-gray-900">
                            {stats.averageRating}
                        </p>
                        <p className="text-gray-600 text-xs md:text-sm">
                            Avg Rating
                        </p>
                    </div>
                    <div className="p-1 md:p-2 bg-yellow-100 rounded-lg">
                        <Star className="w-4 h-4 md:w-6 md:h-6 text-yellow-600 fill-current" />
                    </div>
                </div>
            </div>

            {/* Positive Reviews */}
            <div className="bg-white rounded-lg md:rounded-xl p-2 md:p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-lg md:text-2xl font-bold text-green-600">
                            {stats.positive}
                        </p>
                        <p className="text-gray-600 text-xs md:text-sm">
                            Positive
                        </p>
                    </div>
                    <div className="p-1 md:p-2 bg-green-100 rounded-lg">
                        <ThumbsUp className="w-4 h-4 md:w-6 md:h-6 text-green-600" />
                    </div>
                </div>
            </div>

            {/* Negative Reviews */}
            <div className="bg-white rounded-lg md:rounded-xl p-2 md:p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-lg md:text-2xl font-bold text-red-600">
                            {stats.negative}
                        </p>
                        <p className="text-gray-600 text-xs md:text-sm">
                            Negative
                        </p>
                    </div>
                    <div className="p-1 md:p-2 bg-red-100 rounded-lg">
                        <ThumbsDown className="w-4 h-4 md:w-6 md:h-6 text-red-600" />
                    </div>
                </div>
            </div>

            {/* Needs Action */}
            <div className="bg-white rounded-lg md:rounded-xl p-2 md:p-4 shadow-sm border border-gray-200 col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-lg md:text-2xl font-bold text-orange-600">
                            {stats.pendingAction}
                        </p>
                        <p className="text-gray-600 text-xs md:text-sm">
                            Needs Action
                        </p>
                    </div>
                    <div className="p-1 md:p-2 bg-orange-100 rounded-lg">
                        <AlertTriangle className="w-4 h-4 md:w-6 md:h-6 text-orange-600" />
                    </div>
                </div>
            </div>
        </div>
    );

    // Review Card Component - Mobile Responsive
    const ReviewCard = ({ review }) => {
        const isNegative = review.rating <= 2;
        const isPositive = review.rating >= 4;
        const worker = review.worker || {};
        const customer = review.customer || {};
        const service = review.service || {};

        return (
            <div
                className={`bg-white rounded-lg md:rounded-xl shadow-sm border transition-all hover:shadow-md ${
                    isNegative
                        ? "border-red-200"
                        : isPositive
                        ? "border-green-200"
                        : "border-gray-200"
                }`}
            >
                {/* Header */}
                <div className="p-3 md:p-4 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs md:text-sm flex-shrink-0">
                                {worker.name?.[0]?.toUpperCase() || "W"}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1">
                                    <h3 className="font-bold text-gray-900 text-sm md:text-base truncate">
                                        {worker.name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <StarRating rating={review.rating} />
                                    </div>
                                </div>
                                <p className="text-gray-600 text-xs flex items-center gap-1 truncate mt-1">
                                    <Phone className="w-3 h-3 flex-shrink-0" />
                                    {worker.phone}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Review Content */}
                <div className="p-3 md:p-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2 md:mb-3">
                        <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm md:text-base truncate">
                                {service.serviceName || "Service"}
                            </h4>
                            <p className="text-gray-600 text-xs truncate">
                                Customer: {customer.name || "Anonymous"}
                            </p>
                        </div>
                        <div className="text-right text-xs text-gray-500 flex items-center gap-1 flex-shrink-0">
                            <Calendar className="w-3 h-3" />
                            {formatDate(review.createdAt)}
                        </div>
                    </div>

                    {review.comment && (
                        <div className="mb-3 md:mb-4">
                            <p className="text-gray-700 bg-gray-50 rounded-lg p-2 md:p-3 text-xs md:text-sm line-clamp-2">
                                "{review.comment}"
                            </p>
                        </div>
                    )}

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 gap-2 text-xs text-gray-600 mb-3 md:mb-4">
                        {customer.phone && (
                            <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">
                                    {customer.phone}
                                </span>
                            </div>
                        )}
                        {customer.address && (
                            <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">
                                    {customer.address.area},{" "}
                                    {customer.address.city}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons - Stack on mobile */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex flex-wrap gap-2">
                            {isNegative &&
                                worker.workerProfile?.isActive !== false && (
                                    <button
                                        onClick={() =>
                                            handleWorkerStatusChange(
                                                worker._id,
                                                false
                                            )
                                        }
                                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-2 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium transition-colors min-w-[100px]"
                                    >
                                        <Shield className="w-3 h-3" />
                                        <span>Deactivate</span>
                                    </button>
                                )}

                            {isNegative &&
                                worker.workerProfile?.isActive === false && (
                                    <button
                                        onClick={() =>
                                            handleWorkerStatusChange(
                                                worker._id,
                                                true
                                            )
                                        }
                                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-2 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium transition-colors min-w-[100px]"
                                    >
                                        <CheckCircle className="w-3 h-3" />
                                        <span>Activate</span>
                                    </button>
                                )}

                            <button
                                onClick={() =>
                                    setExpandedReview(
                                        expandedReview === review._id
                                            ? null
                                            : review._id
                                    )
                                }
                                className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-xs font-medium transition-colors min-w-[80px]"
                            >
                                <Eye className="w-3 h-3" />
                                {expandedReview === review._id
                                    ? "Less"
                                    : "More"}
                            </button>
                        </div>

                        <a
                            href={`tel:${worker.phone}`}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium transition-colors min-w-[100px]"
                        >
                            <Phone className="w-3 h-3" />
                            Call Worker
                        </a>
                    </div>

                    {/* Expanded Details */}
                    {expandedReview === review._id && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <h5 className="font-semibold text-gray-900 mb-2 text-sm">
                                Detailed Information
                            </h5>
                            <div className="grid grid-cols-1 gap-3 text-xs">
                                <div>
                                    <h6 className="font-medium text-gray-700 mb-1">
                                        Worker Details
                                    </h6>
                                    <div className="space-y-1">
                                        <p className="truncate">
                                            <span className="font-medium">
                                                Email:
                                            </span>{" "}
                                            {worker.email || "N/A"}
                                        </p>
                                        <p className="flex items-center">
                                            <span className="font-medium">
                                                Status:
                                            </span>
                                            <span
                                                className={`ml-2 px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                                    worker.workerProfile
                                                        ?.isActive !== false
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {worker.workerProfile
                                                    ?.isActive !== false
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </p>
                                        {worker.address && (
                                            <p className="truncate">
                                                <span className="font-medium">
                                                    Address:
                                                </span>{" "}
                                                {worker.address.area},{" "}
                                                {worker.address.city}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h6 className="font-medium text-gray-700 mb-1">
                                        Service Details
                                    </h6>
                                    <div className="space-y-1">
                                        <p className="truncate">
                                            <span className="font-medium">
                                                Service:
                                            </span>{" "}
                                            {service.serviceName || "N/A"}
                                        </p>
                                        <p className="truncate">
                                            <span className="font-medium">
                                                Skill:
                                            </span>{" "}
                                            {service.skillName || "N/A"}
                                        </p>
                                        <p>
                                            <span className="font-medium">
                                                Price:
                                            </span>{" "}
                                            ₹{service.price || "N/A"}
                                        </p>
                                        {review.bookingDate && (
                                            <p>
                                                <span className="font-medium">
                                                    Booking Date:
                                                </span>{" "}
                                                {formatDate(review.bookingDate)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Loading Skeleton
    const LoadingSkeleton = () => (
        <div className="space-y-3 md:space-y-4">
            {[1, 2, 3].map((item) => (
                <div
                    key={item}
                    className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 shadow-sm border border-gray-200 animate-pulse"
                >
                    <div className="flex justify-between items-start mb-3 md:mb-4">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full"></div>
                            <div>
                                <div className="h-3 md:h-4 bg-gray-200 rounded w-16 md:w-24 mb-1 md:mb-2"></div>
                                <div className="h-2 md:h-3 bg-gray-200 rounded w-12 md:w-16"></div>
                            </div>
                        </div>
                        <div className="h-3 md:h-4 bg-gray-200 rounded w-8 md:w-12"></div>
                    </div>
                    <div className="space-y-1 md:space-y-2">
                        <div className="h-2 md:h-3 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-2 md:h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                    <div className="flex justify-between items-center py-3 md:py-4">
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-base md:text-lg flex-shrink-0">
                                <Award className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate">
                                    Worker Reviews
                                </h1>
                                <p className="text-gray-600 text-xs md:text-sm hidden xs:block truncate">
                                    Monitor and manage worker performance
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2">
                            <button
                                onClick={exportToCSV}
                                className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-xs md:text-sm transition-colors"
                            >
                                <Download className="w-3 h-3 md:w-4 md:h-4" />
                                <span className="hidden sm:inline">
                                    Export CSV
                                </span>
                                <span className="sm:hidden">Export</span>
                            </button>
                            <button
                                onClick={handleRefresh}
                                className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-xs md:text-sm transition-colors"
                            >
                                <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
                                <span className="hidden sm:inline">
                                    Refresh
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 md:py-6">
                {/* Stats */}
                <StatsCards />

                {/* Filters and Search */}
                <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 shadow-sm border border-gray-200 mb-4 md:mb-6">
                    <div className="flex flex-col gap-3">
                        {/* Search and Filter Toggle */}
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 md:w-4 md:h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search reviews..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="w-full pl-8 md:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors flex-shrink-0"
                            >
                                <Filter className="w-4 h-4" />
                                <span className="hidden xs:inline">
                                    Filters
                                </span>
                                {showFilters ? (
                                    <ChevronUp className="w-4 h-4" />
                                ) : (
                                    <ChevronDown className="w-4 h-4" />
                                )}
                            </button>
                        </div>

                        {/* Filters - Collapsible on mobile */}
                        {showFilters && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-t pt-3 md:border-t-0 md:pt-0">
                                {/* Rating Filter */}
                                <select
                                    value={filters.rating}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            rating: e.target.value,
                                        }))
                                    }
                                    className="px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm col-span-1"
                                >
                                    <option value="all">All Ratings</option>
                                    <option value="5">5 Stars</option>
                                    <option value="4">4 Stars</option>
                                    <option value="3">3 Stars</option>
                                    <option value="2">2 Stars</option>
                                    <option value="1">1 Star</option>
                                </select>

                                {/* Worker Filter */}
                                <select
                                    value={filters.worker}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            worker: e.target.value,
                                        }))
                                    }
                                    className="px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm col-span-1"
                                >
                                    <option value="all">All Workers</option>
                                    {workers.map((worker) => (
                                        <option
                                            key={worker._id}
                                            value={worker._id}
                                        >
                                            {worker.name}
                                        </option>
                                    ))}
                                </select>

                                {/* Status Filter */}
                                <select
                                    value={filters.status}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            status: e.target.value,
                                        }))
                                    }
                                    className="px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm col-span-2 md:col-span-1"
                                >
                                    <option value="all">All Status</option>
                                    <option value="positive">
                                        Positive (4-5★)
                                    </option>
                                    <option value="negative">
                                        Negative (1-2★)
                                    </option>
                                    <option value="needs_action">
                                        Needs Action
                                    </option>
                                </select>

                                {/* Date Range Filter */}
                                <select
                                    value={filters.dateRange}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            dateRange: e.target.value,
                                        }))
                                    }
                                    className="px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm col-span-2 md:col-span-1"
                                >
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Count */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 md:mb-4">
                    <p className="text-gray-600 text-xs md:text-sm">
                        Showing {filteredReviews.length} of {reviews.length}{" "}
                        reviews
                    </p>
                    {filteredReviews.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                            <BarChart3 className="w-3 h-3 md:w-4 md:h-4" />
                            <span>
                                {stats.averageRating} avg • {stats.positive} pos
                                • {stats.negative} neg
                            </span>
                        </div>
                    )}
                </div>

                {/* Reviews List */}
                {loading ? (
                    <LoadingSkeleton />
                ) : filteredReviews.length > 0 ? (
                    <div className="space-y-3 md:space-y-4">
                        {filteredReviews.map((review) => (
                            <ReviewCard key={review._id} review={review} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 md:py-12 bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200">
                        <FileText className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-gray-300" />
                        <h3 className="text-base md:text-lg font-medium text-gray-900 mb-1 md:mb-2">
                            No reviews found
                        </h3>
                        <p className="text-gray-500 text-sm mb-4 md:mb-6 px-4">
                            {reviews.length === 0
                                ? "No reviews available for your workers yet."
                                : "No reviews match your current filters."}
                        </p>
                        {(filters.rating !== "all" ||
                            filters.worker !== "all" ||
                            filters.status !== "all" ||
                            searchTerm) && (
                            <button
                                onClick={() => {
                                    setFilters({
                                        rating: "all",
                                        worker: "all",
                                        status: "all",
                                        dateRange: "all",
                                    });
                                    setSearchTerm("");
                                    setShowFilters(false);
                                }}
                                className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ServiceAgentReviews;
