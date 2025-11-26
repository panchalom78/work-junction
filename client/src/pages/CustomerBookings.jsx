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
    CreditCard,
    IndianRupee ,
} from "lucide-react";
import { useBookingStore } from "../store/booking.store";
import ChatInitiateButton from "../components/ChatInitiateButton";
import BookingCard from "../components/BookingCard";
import PaymentOptions from "../components/PaymentOptions";

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
    const [showPaymentModal, setShowPaymentModal] = useState(false);
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
            value: "PAYMENT_PENDING",
            label: "Payment Pending",
            count: bookings.filter((b) => b.status === "PAYMENT_PENDING")
                .length,
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
            case "PAYMENT_PENDING":
                return "bg-orange-100 text-orange-800";
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
                return <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4" />;
            case "ACCEPTED":
                return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
            case "PAYMENT_PENDING":
                return <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />;
            case "COMPLETED":
                return <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />;
            case "CANCELLED":
            case "DECLINED":
                return <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
            default:
                return <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4" />;
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

    const handlePaymentSuccess = (paymentResult) => {
        console.log("Payment successful:", paymentResult);
        setShowPaymentModal(false);
        fetchBookings(); // Refresh bookings to update status
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

    const getPaymentStatusText = (booking) => {
        if (booking.status === "PAYMENT_PENDING") {
            return "Payment Required";
        }
        if (booking.payment?.status === "COMPLETED") {
            return "Paid";
        }
        if (booking.payment?.status === "PENDING") {
            return "Payment Pending";
        }
        return "";
    };

    if (loading && bookings.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 animate-spin mx-auto mb-4" />
                    <div className="text-gray-600 text-sm sm:text-base">
                        Loading your bookings...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 w-full">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                                My Bookings
                            </h1>
                            <p className="text-gray-600 mt-1 text-xs sm:text-sm md:text-base">
                                Manage and track your service bookings
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/customer")}
                            className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl hover:bg-blue-700 transition-colors font-semibold text-sm sm:text-base whitespace-nowrap"
                        >
                            Book New Service
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 w-full">
                {/* Filters and Search */}
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 w-full overflow-hidden">
                    <div className="flex flex-col space-y-4">
                        {/* Status Filters */}
                        <div className="w-full overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                            <div className="flex flex-nowrap sm:flex-wrap gap-2 min-w-max sm:min-w-0">
                                {statusFilters.map((filter) => (
                                    <button
                                        key={filter.value}
                                        onClick={() =>
                                            setSelectedStatus(filter.value)
                                        }
                                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl font-medium transition-all text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                                            selectedStatus === filter.value
                                                ? "bg-blue-600 text-white"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                    >
                                        {filter.label}
                                        <span className="ml-1 sm:ml-2 opacity-80">
                                            ({filter.count})
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative w-full">
                            <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Search by worker or service..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-xl sm:rounded-2xl focus:outline-none focus:border-blue-500 w-full text-sm sm:text-base"
                            />
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 w-full">
                        <div className="flex items-center space-x-2 text-red-800 text-sm sm:text-base">
                            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                            <span className="break-words">{error}</span>
                        </div>
                    </div>
                )}

                {/* Bookings Grid */}
                {filteredBookings.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 w-full">
                        {filteredBookings.map((booking) => (
                            <div
                                key={booking._id}
                                className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 w-full"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4 gap-2">
                                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-semibold text-sm sm:text-base flex-shrink-0">
                                            {booking.workerId?.name
                                                ?.split(" ")
                                                .map((n) => n[0])
                                                .join("") || "W"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                                                {booking.workerId?.name ||
                                                    "Worker"}
                                            </div>
                                            <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-600 mt-1">
                                                <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                                <span className="break-all">
                                                    {booking.workerId?.phone ||
                                                        "N/A"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                                        <div
                                            className={`inline-flex items-center space-x-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${getStatusColor(
                                                booking.status
                                            )}`}
                                        >
                                            {getStatusIcon(booking.status)}
                                            <span className="capitalize">
                                                {booking.status
                                                    .toLowerCase()
                                                    .replace("_", " ")}
                                            </span>
                                        </div>
                                        {booking.status ===
                                            "PAYMENT_PENDING" && (
                                            <div className="inline-flex items-center space-x-1 px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 whitespace-nowrap">
                                                <CreditCard className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                                                <span>Pay Required</span>
                                            </div>
                                        )}
                                        {booking.payment?.status ===
                                            "COMPLETED" && (
                                            <div className="inline-flex items-center space-x-1 px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 whitespace-nowrap">
                                                <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                                                <span>Paid</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Service Details */}
                                <div className="space-y-2 sm:space-y-3 mb-4">
                                    <div className="flex justify-between text-xs sm:text-sm gap-2">
                                        <span className="text-gray-600 flex-shrink-0">
                                            Service:
                                        </span>
                                        <span className="font-medium text-gray-900 text-right break-words">
                                            {booking.workerServiceId?.details?.split(
                                                "."
                                            )[0] || "Service"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-gray-600 flex-shrink-0">
                                            Date:
                                        </span>
                                        <span className="font-medium text-gray-900 whitespace-nowrap">
                                            {formatDate(booking.bookingDate)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-gray-600 flex-shrink-0">
                                            Time:
                                        </span>
                                        <span className="font-medium text-gray-900 whitespace-nowrap">
                                            {formatTime(booking.bookingTime)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-gray-600 flex-shrink-0">
                                            Amount:
                                        </span>
                                        <span className="font-bold text-gray-900 whitespace-nowrap">
                                            ₹{booking.price}
                                        </span>
                                    </div>
                                </div>

                                {/* Address */}
                                {booking.workerId?.address && (
                                    <div className="flex items-start space-x-2 text-xs sm:text-sm text-gray-600 mb-4">
                                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                                        <div className="break-words">
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
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() =>
                                            handleViewDetails(booking)
                                        }
                                        className="flex-1 min-w-[100px] bg-gray-100 text-gray-700 py-2 rounded-xl sm:rounded-2xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1.5 text-xs sm:text-sm"
                                    >
                                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                        <span>Details</span>
                                    </button>

                                    {booking.status === "PENDING" && (
                                        <button
                                            onClick={() =>
                                                handleCancelBooking(booking._id)
                                            }
                                            className="flex-1 min-w-[100px] bg-red-100 text-red-700 py-2 rounded-xl sm:rounded-2xl font-medium hover:bg-red-200 transition-colors text-xs sm:text-sm"
                                        >
                                            Cancel
                                        </button>
                                    )}

                                    {booking.status === "PAYMENT_PENDING" && (
                                        <button
                                            onClick={() => {
                                                setSelectedBooking(booking);
                                                setShowPaymentModal(true);
                                            }}
                                            className="flex-1 min-w-[100px] bg-orange-500 text-white py-2 rounded-xl sm:rounded-2xl font-medium hover:bg-orange-600 transition-colors flex items-center justify-center space-x-1.5 text-xs sm:text-sm"
                                        >
                                            <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                            <span>Pay Now</span>
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
                                                className="flex-1 min-w-[100px] bg-green-100 text-green-700 py-2 rounded-xl sm:rounded-2xl font-medium hover:bg-green-200 transition-colors text-xs sm:text-sm"
                                            >
                                                Review
                                            </button>
                                        )}
                                </div>

                                {/* Review Display */}
                                {booking.review && (
                                    <div className="mt-4 p-3 bg-gray-50 rounded-xl sm:rounded-2xl">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <div className="flex items-center space-x-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                                            star <=
                                                            booking.review
                                                                .rating
                                                                ? "text-yellow-400 fill-current"
                                                                : "text-gray-300"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-xs sm:text-sm font-medium text-gray-900">
                                                {booking.review.rating}/5
                                            </span>
                                        </div>
                                        {booking.review.comment && (
                                            <p className="text-xs sm:text-sm text-gray-600 break-words">
                                                {booking.review.comment}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 sm:py-12 bg-white rounded-2xl sm:rounded-3xl shadow-lg">
                        <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                            {searchTerm || selectedStatus !== "ALL"
                                ? "No matching bookings found"
                                : "No bookings yet"}
                        </h3>
                        <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base px-4">
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
                                className="bg-blue-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl hover:bg-blue-700 transition-colors font-semibold text-sm sm:text-base"
                            >
                                Clear Filters
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate("/customer")}
                                className="bg-blue-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl hover:bg-blue-700 transition-colors font-semibold text-sm sm:text-base"
                            >
                                Book a Service
                            </button>
                        )}
                    </div>
                )}

                {/* Loading More Indicator */}
                {loading && bookings.length > 0 && (
                    <div className="flex justify-center mt-6 sm:mt-8">
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 animate-spin" />
                    </div>
                )}
            </div>

            {/* Booking Details Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
                    <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                                    Booking Details
                                </h3>
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="p-2 hover:bg-gray-100 rounded-xl sm:rounded-2xl transition-colors"
                                >
                                    <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                            </div>

                            {/* Booking Card Component */}
                            <BookingCard booking={selectedBooking} />

                            <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                                {/* Worker Info */}
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-semibold text-base sm:text-lg flex-shrink-0">
                                        {selectedBooking.workerId?.name
                                            ?.split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-semibold text-gray-900 text-base sm:text-lg break-words">
                                            {selectedBooking.workerId?.name}
                                        </h4>
                                        <p className="text-gray-600 text-sm sm:text-base break-all">
                                            {selectedBooking.workerId?.phone}
                                        </p>
                                    </div>
                                </div>

                                {/* Service Details */}
                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <label className="text-xs sm:text-sm text-gray-600">
                                            Service
                                        </label>
                                        <p className="font-semibold text-sm sm:text-base break-words">
                                            {
                                                selectedBooking.workerServiceId
                                                    ?.details
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs sm:text-sm text-gray-600">
                                            Amount
                                        </label>
                                        <p className="font-semibold text-sm sm:text-base">
                                            ₹{selectedBooking.price}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs sm:text-sm text-gray-600">
                                            Date
                                        </label>
                                        <p className="font-semibold text-sm sm:text-base">
                                            {formatDate(
                                                selectedBooking.bookingDate
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs sm:text-sm text-gray-600">
                                            Time
                                        </label>
                                        <p className="font-semibold text-sm sm:text-base">
                                            {formatTime(
                                                selectedBooking.bookingTime
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Payment Status */}
                                {selectedBooking.payment && (
                                    <div>
                                        <label className="text-xs sm:text-sm text-gray-600">
                                            Payment Status
                                        </label>
                                        <div className="flex items-center space-x-2 flex-wrap gap-2">
                                            <div
                                                className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                                                    selectedBooking.payment
                                                        .status === "COMPLETED"
                                                        ? "bg-green-100 text-green-800"
                                                        : selectedBooking
                                                              .payment
                                                              .status ===
                                                          "PENDING"
                                                        ? "bg-orange-100 text-orange-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {selectedBooking.payment
                                                    .status === "COMPLETED" ? (
                                                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                                ) : selectedBooking.payment
                                                      .status === "PENDING" ? (
                                                    <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                                ) : (
                                                    <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                                )}
                                                <span className="capitalize">
                                                    {selectedBooking.payment.status.toLowerCase()}
                                                </span>
                                            </div>
                                            {selectedBooking.payment
                                                .paymentType && (
                                                <span className="text-xs sm:text-sm text-gray-600">
                                                    (
                                                    {selectedBooking.payment.paymentType.replace(
                                                        "_",
                                                        " "
                                                    )}
                                                    )
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Additional Info */}
                                {selectedBooking.declineReason && (
                                    <div>
                                        <label className="text-xs sm:text-sm text-gray-600">
                                            Decline Reason
                                        </label>
                                        <p className="text-red-600 text-sm sm:text-base break-words">
                                            {selectedBooking.declineReason}
                                        </p>
                                    </div>
                                )}

                                {selectedBooking.cancellationReason && (
                                    <div>
                                        <label className="text-xs sm:text-sm text-gray-600">
                                            Cancellation Reason
                                        </label>
                                        <p className="text-red-600 text-sm sm:text-base break-words">
                                            {selectedBooking.cancellationReason}
                                        </p>
                                    </div>
                                )}

                                {selectedBooking.review && (
                                    <div>
                                        <label className="text-xs sm:text-sm text-gray-600">
                                            Your Review
                                        </label>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <div className="flex items-center space-x-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                                            star <=
                                                            selectedBooking
                                                                .review.rating
                                                                ? "text-yellow-400 fill-current"
                                                                : "text-gray-300"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="font-medium text-sm sm:text-base">
                                                {selectedBooking.review.rating}
                                                /5
                                            </span>
                                        </div>
                                        {selectedBooking.review.comment && (
                                            <p className="text-gray-700 text-sm sm:text-base break-words">
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
                <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
                    <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full">
                        <div className="p-4 sm:p-6">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                                Rate Your Experience
                            </h3>

                            <div className="space-y-4">
                                {/* Rating */}
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
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
                                                    className={`w-7 h-7 sm:w-8 sm:h-8 ${
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
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
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
                                        className="w-full border border-gray-300 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:border-blue-500 resize-none text-sm sm:text-base"
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-3 mt-6">
                                <button
                                    onClick={() => setShowReviewModal(false)}
                                    className="flex-1 border-2 border-gray-300 text-gray-700 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold hover:border-gray-400 transition-colors text-sm sm:text-base"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitReview}
                                    disabled={loading}
                                    className="flex-1 bg-blue-600 text-white py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
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

            {/* Payment Modal */}
            {showPaymentModal && selectedBooking && (
                <PaymentOptions
                    booking={selectedBooking}
                    onPaymentSuccess={handlePaymentSuccess}
                    onClose={() => setShowPaymentModal(false)}
                />
            )}
        </div>
    );
};

export default CustomerBookings;