import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Calendar,
    Clock,
    MapPin,
    Phone,
    Mail,
    User,
    DollarSign,
    MessageSquare,
    XCircle,
    CheckCircle,
    AlertCircle,
    Loader,
    ArrowLeft,
    Filter,
    ChevronDown,
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
            PENDING: {
                label: "Pending",
                color: "bg-yellow-100 text-yellow-700 border-yellow-200",
                icon: <AlertCircle size={16} />,
                description: "Awaiting worker confirmation",
            },
            ACCEPTED: {
                label: "Accepted",
                color: "bg-blue-100 text-blue-700 border-blue-200",
                icon: <CheckCircle size={16} />,
                description: "Worker has accepted your booking",
            },
            IN_PROGRESS: {
                label: "In Progress",
                color: "bg-purple-100 text-purple-700 border-purple-200",
                icon: <Loader size={16} />,
                description: "Work is currently ongoing",
            },
            COMPLETED: {
                label: "Completed",
                color: "bg-green-100 text-green-700 border-green-200",
                icon: <CheckCircle size={16} />,
                description: "Service has been completed",
            },
            CANCELLED: {
                label: "Cancelled",
                color: "bg-red-100 text-red-700 border-red-200",
                icon: <XCircle size={16} />,
                description: "Booking has been cancelled",
            },
        };
        return configs[status] || configs.PENDING;
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
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
        }).format(price);
    };

    const statusFilters = [
        { value: "all", label: "All Bookings" },
        { value: "PENDING", label: "Pending" },
        { value: "ACCEPTED", label: "Accepted" },
        { value: "IN_PROGRESS", label: "In Progress" },
        { value: "COMPLETED", label: "Completed" },
        { value: "CANCELLED", label: "Cancelled" },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate("/customer-dashboard")}
                                className="p-2 hover:bg-gray-100 rounded-full transition"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    My Bookings
                                </h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    Track and manage your service bookings
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={20} className="text-purple-600" />
                            <span className="text-sm font-medium text-gray-600">
                                {pagination.total} Total Bookings
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Filters */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {statusFilters.map((filter) => (
                            <button
                                key={filter.value}
                                onClick={() => {
                                    setSelectedStatus(filter.value);
                                    setPagination({ ...pagination, page: 1 });
                                }}
                                className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition ${
                                    selectedStatus === filter.value
                                        ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        <p className="font-medium">Error loading bookings:</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && filteredBookings.length === 0 && (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <Calendar
                            size={64}
                            className="mx-auto text-gray-300 mb-4"
                        />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            No bookings found
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {selectedStatus === "all"
                                ? "You haven't made any bookings yet"
                                : `No ${selectedStatus.toLowerCase()} bookings`}
                        </p>
                        <button
                            onClick={() => navigate("/customer")}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition font-medium"
                        >
                            Browse Services
                        </button>
                    </div>
                )}

                {/* Bookings Grid */}
                {!loading && !error && filteredBookings.length > 0 && (
                    <div className="space-y-4">
                        {filteredBookings.map((booking) => {
                            const statusConfig = getStatusConfig(
                                booking.status
                            );
                            return (
                                <div
                                    key={booking._id}
                                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <img
                                                src={
                                                    booking.workerId
                                                        ?.profileImage ||
                                                    "https://i.pravatar.cc/150"
                                                }
                                                alt={booking.workerId?.name}
                                                className="w-16 h-16 rounded-full object-cover"
                                            />
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    {booking.workerId?.name ||
                                                        "Worker"}
                                                </h3>
                                                <p className="text-purple-600 text-sm font-medium">
                                                    {booking.workerServiceId
                                                        ?.details || "Service"}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}
                                                    >
                                                        {statusConfig.icon}
                                                        {statusConfig.label}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-gray-900">
                                                {formatPrice(
                                                    booking.payment?.amount ||
                                                        booking.price
                                                )}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {booking.payment?.status ||
                                                    "PENDING"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Booking Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Calendar
                                                size={18}
                                                className="text-purple-600 flex-shrink-0"
                                            />
                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Date
                                                </p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {formatDate(
                                                        booking.bookingDate
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Clock
                                                size={18}
                                                className="text-purple-600 flex-shrink-0"
                                            />
                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Time
                                                </p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {booking.bookingTime}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <MapPin
                                                size={18}
                                                className="text-purple-600 flex-shrink-0"
                                            />
                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Location
                                                </p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {booking.address},{" "}
                                                    {booking.pincode}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone
                                                size={18}
                                                className="text-purple-600 flex-shrink-0"
                                            />
                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    Contact
                                                </p>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {booking.phone}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Notes */}
                                    {booking.additionalNotes && (
                                        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                            <div className="flex items-start gap-2">
                                                <MessageSquare
                                                    size={16}
                                                    className="text-blue-600 mt-1"
                                                />
                                                <div>
                                                    <p className="text-xs text-blue-600 font-medium mb-1">
                                                        Additional Notes
                                                    </p>
                                                    <p className="text-sm text-gray-700">
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
                                            <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-100">
                                                <div className="flex items-start gap-2">
                                                    <XCircle
                                                        size={16}
                                                        className="text-red-600 mt-1"
                                                    />
                                                    <div>
                                                        <p className="text-xs text-red-600 font-medium mb-1">
                                                            Cancellation Reason
                                                        </p>
                                                        <p className="text-sm text-gray-700">
                                                            {
                                                                booking.cancellationReason
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-4 border-t">
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/booking/${booking._id}`
                                                )
                                            }
                                            className="flex-1 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition font-medium"
                                        >
                                            View Details
                                        </button>
                                        {(booking.status === "PENDING" ||
                                            booking.status === "ACCEPTED") && (
                                            <button
                                                onClick={() => {
                                                    setSelectedBooking(booking);
                                                    setShowCancelModal(true);
                                                }}
                                                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                                            >
                                                Cancel Booking
                                            </button>
                                        )}
                                        {booking.status === "COMPLETED" && (
                                            <button className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition font-medium">
                                                Write Review
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {!loading &&
                    filteredBookings.length > 0 &&
                    pagination.totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <button
                                onClick={() =>
                                    setPagination({
                                        ...pagination,
                                        page: pagination.page - 1,
                                    })
                                }
                                disabled={pagination.page === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-2 text-sm text-gray-600">
                                Page {pagination.page} of{" "}
                                {pagination.totalPages}
                            </span>
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
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <>
                    <div
                        onClick={() => setShowCancelModal(false)}
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    ></div>
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-red-100 rounded-full">
                                    <XCircle
                                        size={24}
                                        className="text-red-600"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Cancel Booking
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        This action cannot be undone
                                    </p>
                                </div>
                            </div>

                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">
                                    <strong>Worker:</strong>{" "}
                                    {selectedBooking?.workerId?.name}
                                </p>
                                <p className="text-sm text-gray-700 mt-1">
                                    <strong>Date:</strong>{" "}
                                    {formatDate(selectedBooking?.bookingDate)}
                                </p>
                                <p className="text-sm text-gray-700 mt-1">
                                    <strong>Time:</strong>{" "}
                                    {selectedBooking?.bookingTime}
                                </p>
                            </div>

                            <textarea
                                placeholder="Please provide a reason for cancellation..."
                                value={cancellationReason}
                                onChange={(e) =>
                                    setCancellationReason(e.target.value)
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
                                rows="4"
                            ></textarea>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowCancelModal(false);
                                        setCancellationReason("");
                                    }}
                                    className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                                >
                                    Keep Booking
                                </button>
                                <button
                                    onClick={handleCancelBooking}
                                    disabled={!cancellationReason.trim()}
                                    className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel Booking
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
