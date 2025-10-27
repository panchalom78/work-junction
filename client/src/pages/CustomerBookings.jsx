import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Calendar,
    Clock,
    MapPin,
    User,
    Phone,
    Star,
    CheckCircle,
    XCircle,
    Clock as ClockIcon,
    AlertCircle,
    Search,
    Filter,
    ChevronDown,
    MessageCircle,
    Loader2,
    Eye,
    ThumbsUp,
    ThumbsDown,
} from "lucide-react";
import { useBookingStore } from "../store/booking.store";
import ChatInitiateButton from "../components/ChatInitiateButton";

const CustomerBookings = () => {
    const navigate = useNavigate();
    const {
        bookings,
        loading,
        error,
        getCustomerBookings,
        updateBookingStatus,
        addReview,
    } = useBookingStore();

    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });

    const statusFilters = [
        { value: "ALL", label: "All Bookings", count: bookings.length },
        {
            value: "PENDING",
            label: "Pending",
            count: bookings.filter((b) => b.status === "PENDING").length,
        },
        {
            value: "ACCEPTED",
            label: "Accepted",
            count: bookings.filter((b) => b.status === "ACCEPTED").length,
        },
        {
            value: "COMPLETED",
            label: "Completed",
            count: bookings.filter((b) => b.status === "COMPLETED").length,
        },
        {
            value: "CANCELLED",
            label: "Cancelled",
            count: bookings.filter((b) => b.status === "CANCELLED").length,
        },
        {
            value: "DECLINED",
            label: "Declined",
            count: bookings.filter((b) => b.status === "DECLINED").length,
        },
    ];

    useEffect(() => {
        fetchBookings();
    }, [selectedStatus]);

    const fetchBookings = async () => {
        try {
            await getCustomerBookings({
                status: selectedStatus === "ALL" ? "" : selectedStatus,
            });
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
        }
    };

    const filteredBookings = bookings.filter(
        (booking) =>
            booking.workerId?.name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            booking.workerServiceId?.details
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-100 text-yellow-800";
            case "ACCEPTED":
                return "bg-blue-100 text-blue-800";
            case "COMPLETED":
                return "bg-green-100 text-green-800";
            case "CANCELLED":
                return "bg-red-100 text-red-800";
            case "DECLINED":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "PENDING":
                return <ClockIcon className="w-4 h-4" />;
            case "ACCEPTED":
                return <CheckCircle className="w-4 h-4" />;
            case "COMPLETED":
                return <ThumbsUp className="w-4 h-4" />;
            case "CANCELLED":
            case "DECLINED":
                return <XCircle className="w-4 h-4" />;
            default:
                return <ClockIcon className="w-4 h-4" />;
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking?"))
            return;

        try {
            await updateBookingStatus(bookingId, {
                status: "CANCELLED",
                reason: "Cancelled by customer",
            });
            await fetchBookings();
        } catch (error) {
            console.error("Failed to cancel booking:", error);
        }
    };

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
    };

    const handleSubmitReview = async () => {
        if (!selectedBooking) return;

        try {
            await addReview(selectedBooking._id, reviewData);
            setShowReviewModal(false);
            setReviewData({ rating: 5, comment: "" });
            await fetchBookings();
        } catch (error) {
            console.error("Failed to submit review:", error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatTime = (timeString) => {
        return timeString; // Already in HH:MM format
    };

    if (loading && bookings.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                    <div className="text-gray-600">
                        Loading your bookings...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                My Bookings
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Manage and track your service bookings
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/customer")}
                            className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-colors font-semibold"
                        >
                            Book New Service
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Filters and Search */}
                <div className="bg-white rounded-3xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        {/* Status Filters */}
                        <div className="flex flex-wrap gap-2">
                            {statusFilters.map((filter) => (
                                <button
                                    key={filter.value}
                                    onClick={() =>
                                        setSelectedStatus(filter.value)
                                    }
                                    className={`px-4 py-2 rounded-2xl font-medium transition-all ${
                                        selectedStatus === filter.value
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    {filter.label}
                                    <span className="ml-2 text-sm opacity-80">
                                        ({filter.count})
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by worker or service..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:border-blue-500 w-full lg:w-64"
                            />
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                        <div className="flex items-center space-x-2 text-red-800">
                            <AlertCircle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                {/* Bookings Grid */}
                {filteredBookings.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredBookings.map((booking) => (
                            <div
                                key={booking._id}
                                className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-semibold">
                                            {booking.workerId?.name
                                                ?.split(" ")
                                                .map((n) => n[0])
                                                .join("") || "W"}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">
                                                {booking.workerId?.name ||
                                                    "Worker"}
                                            </div>
                                            <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                                                <Phone className="w-4 h-4" />
                                                <span>
                                                    {booking.workerId?.phone ||
                                                        "N/A"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                            booking.status
                                        )}`}
                                    >
                                        {getStatusIcon(booking.status)}
                                        <span className="capitalize">
                                            {booking.status.toLowerCase()}
                                        </span>
                                    </div>
                                </div>

                                {/* Service Details */}
                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            Service:
                                        </span>
                                        <span className="font-medium text-gray-900 text-right">
                                            {booking.workerServiceId?.details.split(
                                                "."
                                            )[0] || "Service"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            Date:
                                        </span>
                                        <span className="font-medium text-gray-900">
                                            {formatDate(booking.bookingDate)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            Time:
                                        </span>
                                        <span className="font-medium text-gray-900">
                                            {formatTime(booking.bookingTime)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            Amount:
                                        </span>
                                        <span className="font-bold text-gray-900">
                                            ₹{booking.price}
                                        </span>
                                    </div>
                                </div>

                                {/* Address */}
                                {booking.workerId?.address && (
                                    <div className="flex items-start space-x-2 text-sm text-gray-600 mb-4">
                                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <div>
                                            {booking.workerId.address.area && (
                                                <div>
                                                    {
                                                        booking.workerId.address
                                                            .area
                                                    }
                                                </div>
                                            )}
                                            {booking.workerId.address.city && (
                                                <div>
                                                    {
                                                        booking.workerId.address
                                                            .city
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() =>
                                            handleViewDetails(booking)
                                        }
                                        className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-2xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>Details</span>
                                    </button>

                                    {booking.status === "PENDING" && (
                                        <button
                                            onClick={() =>
                                                handleCancelBooking(booking._id)
                                            }
                                            className="flex-1 bg-red-100 text-red-700 py-2 rounded-2xl font-medium hover:bg-red-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}

                                    <ChatInitiateButton
                                        workerId={booking.workerId?._id}
                                        workerName={booking.workerId?.name}
                                        className="space-x-1 px-2"
                                    />

                                    {booking.status === "COMPLETED" &&
                                        !booking.review && (
                                            <button
                                                onClick={() => {
                                                    setSelectedBooking(booking);
                                                    setShowReviewModal(true);
                                                }}
                                                className="flex-1 bg-green-100 text-green-700 py-2 rounded-2xl font-medium hover:bg-green-200 transition-colors"
                                            >
                                                Review
                                            </button>
                                        )}
                                </div>

                                {/* Review Display */}
                                {booking.review && (
                                    <div className="mt-4 p-3 bg-gray-50 rounded-2xl">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <div className="flex items-center space-x-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`w-4 h-4 ${
                                                            star <=
                                                            booking.review
                                                                .rating
                                                                ? "text-yellow-400 fill-current"
                                                                : "text-gray-300"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                {booking.review.rating}/5
                                            </span>
                                        </div>
                                        {booking.review.comment && (
                                            <p className="text-sm text-gray-600">
                                                {booking.review.comment}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-3xl shadow-lg">
                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {searchTerm || selectedStatus !== "ALL"
                                ? "No matching bookings found"
                                : "No bookings yet"}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm || selectedStatus !== "ALL"
                                ? "Try adjusting your search or filters"
                                : "Start by booking your first service"}
                        </p>
                        {searchTerm || selectedStatus !== "ALL" ? (
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedStatus("ALL");
                                }}
                                className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-colors font-semibold"
                            >
                                Clear Filters
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate("/customer")}
                                className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-colors font-semibold"
                            >
                                Book a Service
                            </button>
                        )}
                    </div>
                )}

                {/* Loading More Indicator */}
                {loading && bookings.length > 0 && (
                    <div className="flex justify-center mt-8">
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    </div>
                )}
            </div>

            {/* Booking Details Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">
                                    Booking Details
                                </h3>
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="p-2 hover:bg-gray-100 rounded-2xl transition-colors"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Worker Info */}
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-semibold text-lg">
                                        {selectedBooking.workerId?.name
                                            ?.split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 text-lg">
                                            {selectedBooking.workerId?.name}
                                        </h4>
                                        <p className="text-gray-600">
                                            {selectedBooking.workerId?.phone}
                                        </p>
                                    </div>
                                </div>

                                {/* Service Details */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-600">
                                            Service
                                        </label>
                                        <p className="font-semibold">
                                            {
                                                selectedBooking.workerServiceId
                                                    ?.details
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">
                                            Amount
                                        </label>
                                        <p className="font-semibold">
                                            ₹{selectedBooking.price}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">
                                            Date
                                        </label>
                                        <p className="font-semibold">
                                            {formatDate(
                                                selectedBooking.bookingDate
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">
                                            Time
                                        </label>
                                        <p className="font-semibold">
                                            {formatTime(
                                                selectedBooking.bookingTime
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="text-sm text-gray-600">
                                        Status
                                    </label>
                                    <div
                                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                            selectedBooking.status
                                        )}`}
                                    >
                                        {getStatusIcon(selectedBooking.status)}
                                        <span className="capitalize">
                                            {selectedBooking.status.toLowerCase()}
                                        </span>
                                    </div>
                                </div>

                                {/* Additional Info */}
                                {selectedBooking.declineReason && (
                                    <div>
                                        <label className="text-sm text-gray-600">
                                            Decline Reason
                                        </label>
                                        <p className="text-red-600">
                                            {selectedBooking.declineReason}
                                        </p>
                                    </div>
                                )}

                                {selectedBooking.cancellationReason && (
                                    <div>
                                        <label className="text-sm text-gray-600">
                                            Cancellation Reason
                                        </label>
                                        <p className="text-red-600">
                                            {selectedBooking.cancellationReason}
                                        </p>
                                    </div>
                                )}

                                {selectedBooking.review && (
                                    <div>
                                        <label className="text-sm text-gray-600">
                                            Your Review
                                        </label>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <div className="flex items-center space-x-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`w-4 h-4 ${
                                                            star <=
                                                            selectedBooking
                                                                .review.rating
                                                                ? "text-yellow-400 fill-current"
                                                                : "text-gray-300"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="font-medium">
                                                {selectedBooking.review.rating}
                                                /5
                                            </span>
                                        </div>
                                        {selectedBooking.review.comment && (
                                            <p className="text-gray-700">
                                                {selectedBooking.review.comment}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                Rate Your Experience
                            </h3>

                            <div className="space-y-4">
                                {/* Rating */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Rating
                                    </label>
                                    <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() =>
                                                    setReviewData((prev) => ({
                                                        ...prev,
                                                        rating: star,
                                                    }))
                                                }
                                                className="p-1"
                                            >
                                                <Star
                                                    className={`w-8 h-8 ${
                                                        star <=
                                                        reviewData.rating
                                                            ? "text-yellow-400 fill-current"
                                                            : "text-gray-300"
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Comment */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Comment (Optional)
                                    </label>
                                    <textarea
                                        value={reviewData.comment}
                                        onChange={(e) =>
                                            setReviewData((prev) => ({
                                                ...prev,
                                                comment: e.target.value,
                                            }))
                                        }
                                        placeholder="Share your experience with this worker..."
                                        rows="4"
                                        className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-3 mt-6">
                                <button
                                    onClick={() => setShowReviewModal(false)}
                                    className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-2xl font-semibold hover:border-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitReview}
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                                >
                                    {loading && (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    )}
                                    <span>Submit Review</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerBookings;
