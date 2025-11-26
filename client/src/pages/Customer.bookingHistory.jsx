import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Calendar,
    Clock,
    MapPin,
    Phone,
    Mail,
    User,
    IndianRupee ,
    MessageSquare,
    XCircle,
    CheckCircle,
    AlertCircle,
    Loader,
    ArrowLeft,
    Filter,
    ChevronDown,
    ChevronLeft,
    Home,
    Search,
    Star,
    Shield,
    Sparkles,
} from "lucide-react";
import { useBookingStore } from "../store/serviceBooking.store";

const CustomerBookings = () => {
    const navigate = useNavigate();
    const { getMyBookings, cancelBooking, loading, error } = useBookingStore();

    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [cancellationReason, setCancellationReason] = useState("");
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    useEffect(() => {
        fetchBookings();
    }, [pagination.page, selectedStatus]);

    const fetchBookings = async () => {
        const status = selectedStatus === "all" ? null : selectedStatus;
        const result = await getMyBookings(
            status,
            pagination.page,
            pagination.limit
        );

        if (result && result.success) {
            setBookings(result.data);
            setFilteredBookings(result.data);
            if (result.pagination) {
                setPagination(result.pagination);
            }
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            pending: {
                label: "Pending",
                color: "bg-amber-50 text-amber-700 border-amber-200",
                icon: <AlertCircle size={16} className="text-amber-600" />,
                description: "Awaiting worker confirmation",
                bgColor: "bg-amber-500",
            },
            accepted: {
                label: "Accepted",
                color: "bg-blue-50 text-blue-700 border-blue-200",
                icon: <CheckCircle size={16} className="text-blue-600" />,
                description: "Worker has accepted your booking",
                bgColor: "bg-blue-500",
            },
            IN_PROGRESS: {
                label: "In Progress",
                color: "bg-purple-50 text-purple-700 border-purple-200",
                icon: <Loader size={16} className="text-purple-600" />,
                description: "Work is currently ongoing",
                bgColor: "bg-purple-500",
            },
            completed: {
                label: "Completed",
                color: "bg-emerald-50 text-emerald-700 border-emerald-200",
                icon: <CheckCircle size={16} className="text-emerald-600" />,
                description: "Service has been completed",
                bgColor: "bg-emerald-500",
            },
            CANCELLED: {
                label: "Cancelled",
                color: "bg-red-50 text-red-700 border-red-200",
                icon: <XCircle size={16} className="text-red-600" />,
                description: "Booking has been cancelled",
                bgColor: "bg-red-500",
            },
        };
        return configs[status] || configs.pending;
    };

    const handleCancelBooking = async () => {
        if (!selectedBooking || !cancellationReason.trim()) {
            alert("Please provide a cancellation reason");
            return;
        }

        const result = await cancelBooking(
            selectedBooking._id,
            cancellationReason
        );
        if (result) {
            setShowCancelModal(false);
            setSelectedBooking(null);
            setCancellationReason("");
            fetchBookings();
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatPrice = (price) => {
        if (!price) return "₹0";
        return `₹${price}`;
    };

    const handleBack = () => {
        // Check if there's previous page in history, else go to home
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate("/customer");
        }
    };

    const statusFilters = [
        { value: "all", label: "All Bookings", count: pagination.total },
        { value: "pending", label: "Pending" },
        { value: "accepted", label: "Accepted" },
        { value: "IN_PROGRESS", label: "In Progress" },
        { value: "completed", label: "Completed" },
        { value: "CANCELLED", label: "Cancelled" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-8">
            {/* Enhanced Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        {/* Back Button and Title */}
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleBack}
                                className="group flex items-center space-x-2 p-2 text-gray-600 hover:text-blue-600 transition-all duration-200 hover:bg-blue-50 rounded-lg"
                            >
                                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                <span className="font-medium hidden sm:block">
                                    Back
                                </span>
                            </button>

                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                                        My Bookings
                                    </h1>
                                    <p className="text-gray-600 text-sm">
                                        Manage and track your service
                                        appointments
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Total Bookings Counter */}
                        <div className="flex items-center space-x-3">
                            <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900">
                                    {pagination.total}
                                </div>
                                <div className="text-gray-500 text-sm">
                                    Total Bookings
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Enhanced Filters */}
            <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/40 sticky top-16 lg:top-20 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 hidden sm:block">
                            Filter by Status
                        </h3>

                        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide w-full sm:w-auto">
                            {statusFilters.map((filter) => {
                                const isActive =
                                    selectedStatus === filter.value;
                                return (
                                    <button
                                        key={filter.value}
                                        onClick={() => {
                                            setSelectedStatus(filter.value);
                                            setPagination({
                                                ...pagination,
                                                page: 1,
                                            });
                                        }}
                                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl whitespace-nowrap font-medium transition-all duration-200 ${
                                            isActive
                                                ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/25"
                                                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
                                        }`}
                                    >
                                        <span className="text-sm font-semibold">
                                            {filter.label}
                                        </span>
                                        {filter.value === "all" &&
                                            filter.count > 0 && (
                                                <span
                                                    className={`px-1.5 py-0.5 rounded-full text-xs ${
                                                        isActive
                                                            ? "bg-white/20 text-white"
                                                            : "bg-blue-100 text-blue-700"
                                                    }`}
                                                >
                                                    {filter.count}
                                                </span>
                                            )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Error State */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center space-x-3">
                            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-red-800">
                                    Unable to load bookings
                                </h3>
                                <p className="text-red-600 text-sm mt-1">
                                    {error}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={fetchBookings}
                            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-600 text-lg">
                            Loading your bookings...
                        </p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && filteredBookings.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <Calendar className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            No bookings found
                        </h3>
                        <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                            {selectedStatus === "all"
                                ? "You haven't made any bookings yet. Start by exploring our services!"
                                : `No ${selectedStatus.toLowerCase()} bookings at the moment.`}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate("/customer")}
                                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
                            >
                                Browse Services
                            </button>
                            <button
                                onClick={fetchBookings}
                                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>
                )}

                {/* Bookings Grid */}
                {!loading && !error && filteredBookings.length > 0 && (
                    <div className="space-y-6">
                        {filteredBookings.map((booking) => {
                            const statusConfig = getStatusConfig(
                                booking.status
                            );
                            return (
                                <div
                                    key={booking._id}
                                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
                                >
                                    <div className="p-6">
                                        {/* Header Section */}
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-start space-x-4 flex-1 min-w-0">
                                                <div className="relative">
                                                    <img
                                                        src={
                                                            booking.workerId
                                                                ?.profileImage ||
                                                            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                                                        }
                                                        alt={
                                                            booking.workerId
                                                                ?.name
                                                        }
                                                        className="w-16 h-16 rounded-2xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                    <div
                                                        className={`absolute -top-1 -right-1 w-5 h-5 ${statusConfig.bgColor} rounded-full border-2 border-white shadow-sm`}
                                                    ></div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="text-xl font-bold text-gray-900 truncate">
                                                            {booking.workerId
                                                                ?.name ||
                                                                "Professional Worker"}
                                                        </h3>
                                                        <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                    </div>
                                                    <p className="text-blue-600 font-semibold text-lg mb-2">
                                                        {booking.workerServiceId
                                                            ?.details ||
                                                            "Professional Service"}
                                                    </p>
                                                    <div className="flex items-center space-x-3">
                                                        <div
                                                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border ${statusConfig.color} font-medium`}
                                                        >
                                                            {statusConfig.icon}
                                                            <span className="text-sm">
                                                                {
                                                                    statusConfig.label
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-1 text-gray-500">
                                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                            <span className="text-sm font-medium">
                                                                4.8
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0 ml-4">
                                                <div className="text-3xl font-bold text-gray-900 mb-1">
                                                    {formatPrice(
                                                        booking.payment
                                                            ?.amount ||
                                                            booking.price
                                                    )}
                                                </div>
                                                <div
                                                    className={`text-sm font-medium ${
                                                        booking.payment
                                                            ?.status === "Paid"
                                                            ? "text-emerald-600"
                                                            : booking.payment
                                                                  ?.status ===
                                                              "Pending"
                                                            ? "text-amber-600"
                                                            : "text-gray-500"
                                                    }`}
                                                >
                                                    {booking.payment?.status ||
                                                        "PENDING"}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Booking Details Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border">
                                                    <Calendar className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Booking Date
                                                    </p>
                                                    <p className="font-semibold text-gray-900">
                                                        {formatDate(
                                                            booking.bookingDate
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border">
                                                    <Clock className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Time Slot
                                                    </p>
                                                    <p className="font-semibold text-gray-900">
                                                        {booking.bookingTime}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border">
                                                    <MapPin className="w-5 h-5 text-red-600" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm text-gray-500">
                                                        Location
                                                    </p>
                                                    <p className="font-semibold text-gray-900 truncate">
                                                        {booking.workerId
                                                            ?.address?.street &&
                                                        booking.workerId
                                                            ?.address?.city
                                                            ? `${booking.workerId.address.street}, ${booking.workerId.address.city}`
                                                            : "Location not specified"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border">
                                                    <Phone className="w-5 h-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        Contact
                                                    </p>
                                                    <p className="font-semibold text-gray-900">
                                                        {booking.workerId
                                                            ?.phone ||
                                                            "Not available"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Additional Notes */}
                                        {booking.additionalNotes && (
                                            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                                <div className="flex items-start space-x-3">
                                                    <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-blue-800 mb-1">
                                                            Additional Notes
                                                        </p>
                                                        <p className="text-gray-700 leading-relaxed">
                                                            {
                                                                booking.additionalNotes
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Cancellation Reason */}
                                        {booking.status === "CANCELLED" &&
                                            booking.cancellationReason && (
                                                <div className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
                                                    <div className="flex items-start space-x-3">
                                                        <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-semibold text-red-800 mb-1">
                                                                Cancellation
                                                                Reason
                                                            </p>
                                                            <p className="text-gray-700 leading-relaxed">
                                                                {
                                                                    booking.cancellationReason
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200">
                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/booking/${booking._id}`
                                                    )
                                                }
                                                className="flex-1 py-3 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 font-semibold hover:scale-105"
                                            >
                                                View Full Details
                                            </button>
                                            {(booking.status === "pending" ||
                                                booking.status ===
                                                    "accepted") && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedBooking(
                                                            booking
                                                        );
                                                        setShowCancelModal(
                                                            true
                                                        );
                                                    }}
                                                    className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold hover:scale-105"
                                                >
                                                    Cancel Booking
                                                </button>
                                            )}
                                            {booking.status === "completed" && (
                                                <button className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold hover:scale-105">
                                                    Write Review
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Enhanced Pagination */}
                {!loading &&
                    filteredBookings.length > 0 &&
                    pagination.totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-4 mt-8">
                            <button
                                onClick={() =>
                                    setPagination({
                                        ...pagination,
                                        page: pagination.page - 1,
                                    })
                                }
                                disabled={pagination.page === 1}
                                className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Previous</span>
                            </button>

                            <div className="flex items-center space-x-2">
                                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold">
                                    {pagination.page}
                                </span>
                                <span className="text-gray-600 font-medium">
                                    of {pagination.totalPages}
                                </span>
                            </div>

                            <button
                                onClick={() =>
                                    setPagination({
                                        ...pagination,
                                        page: pagination.page + 1,
                                    })
                                }
                                disabled={
                                    pagination.page === pagination.totalPages
                                }
                                className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                            >
                                <span>Next</span>
                                <ChevronLeft className="w-4 h-4 rotate-180" />
                            </button>
                        </div>
                    )}
            </div>

            {/* Enhanced Cancel Modal */}
            {showCancelModal && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                        onClick={() => setShowCancelModal(false)}
                    ></div>
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                                    <XCircle className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Cancel Booking
                                    </h3>
                                    <p className="text-gray-600">
                                        This action cannot be undone
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <div className="space-y-2">
                                    <p className="font-semibold text-gray-900">
                                        Worker:{" "}
                                        {selectedBooking?.workerId?.name}
                                    </p>
                                    <p className="text-gray-600">
                                        Date:{" "}
                                        {formatDate(
                                            selectedBooking?.bookingDate
                                        )}
                                    </p>
                                    <p className="text-gray-600">
                                        Time: {selectedBooking?.bookingTime}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Cancellation Reason *
                                </label>
                                <textarea
                                    placeholder="Please provide a reason for cancellation..."
                                    value={cancellationReason}
                                    onChange={(e) =>
                                        setCancellationReason(e.target.value)
                                    }
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    rows="4"
                                />
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    onClick={() => {
                                        setShowCancelModal(false);
                                        setCancellationReason("");
                                    }}
                                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                                >
                                    Keep Booking
                                </button>
                                <button
                                    onClick={handleCancelBooking}
                                    disabled={!cancellationReason.trim()}
                                    className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Confirm Cancellation
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CustomerBookings;
