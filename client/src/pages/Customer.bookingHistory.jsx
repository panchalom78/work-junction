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
    const result = await getMyBookings(status, pagination.page, pagination.limit);
    
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
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
        icon: <AlertCircle size={14} className="sm:w-4 sm:h-4" />,
        description: "Awaiting worker confirmation",
      },
      accepted: {
        label: "Accepted",
        color: "bg-blue-100 text-blue-700 border-blue-200",
        icon: <CheckCircle size={14} className="sm:w-4 sm:h-4" />,
        description: "Worker has accepted your booking",
      },
      IN_PROGRESS: {
        label: "In Progress",
        color: "bg-purple-100 text-purple-700 border-purple-200",
        icon: <Loader size={14} className="sm:w-4 sm:h-4" />,
        description: "Work is currently ongoing",
      },
      completed: {
        label: "Completed",
        color: "bg-green-100 text-green-700 border-green-200",
        icon: <CheckCircle size={14} className="sm:w-4 sm:h-4" />,
        description: "Service has been completed",
      },
      CANCELLED: {
        label: "Cancelled",
        color: "bg-red-100 text-red-700 border-red-200",
        icon: <XCircle size={14} className="sm:w-4 sm:h-4" />,
        description: "Booking has been cancelled",
      },
    };
    return configs[status] || configs.pending;
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking || !cancellationReason.trim()) {
      alert("Please provide a cancellation reason");
      return;
    }

    const result = await cancelBooking(selectedBooking._id, cancellationReason);
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
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => navigate("/customer-dashboard")}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  My Bookings
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                  Track and manage your service bookings
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Calendar size={18} className="sm:w-5 sm:h-5 text-purple-600" />
              <span className="text-xs sm:text-sm font-medium text-gray-600">
                {pagination.total} Total
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b sticky top-[72px] sm:top-[80px] z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => {
                  setSelectedStatus(filter.value);
                  setPagination({ ...pagination, page: 1 });
                }}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg whitespace-nowrap font-medium transition text-xs sm:text-sm ${
                  selectedStatus === filter.value
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md"
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg mb-4 sm:mb-6 text-sm">
            <p className="font-medium">Error loading bookings:</p>
            <p className="text-xs sm:text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-purple-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredBookings.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center">
            <Calendar size={48} className="sm:w-16 sm:h-16 mx-auto text-gray-300 mb-3 sm:mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              No bookings found
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              {selectedStatus === "all"
                ? "You haven't made any bookings yet"
                : `No ${selectedStatus.toLowerCase()} bookings`}
            </p>
            <button
              onClick={() => navigate("/customer/dashboard")}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition font-medium text-sm sm:text-base"
            >
              Browse Services
            </button>
          </div>
        )}

        {/* Bookings Grid */}
        {!loading && !error && filteredBookings.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            {filteredBookings.map((booking) => {
              const statusConfig = getStatusConfig(booking.status);
              return (
                <div
                  key={booking._id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-4 sm:p-6"
                >
                  {/* Header Section */}
                  <div className="flex items-start justify-between mb-3 sm:mb-4 gap-3">
                    <div className="flex items-start gap-2 sm:gap-4 flex-1 min-w-0">
                      <img
                        src={
                          booking.workerId?.profileImage ||
                          "https://i.pravatar.cc/150"
                        }
                        alt={booking.workerId?.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                          {booking.workerId?.name || "Worker"}
                        </h3>
                        <p className="text-purple-600 text-xs sm:text-sm font-medium truncate">
                          {booking.workerServiceId?.details || "Service"}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 sm:mt-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium border ${statusConfig.color}`}
                          >
                            {statusConfig.icon}
                            <span className="hidden xs:inline">{statusConfig.label}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">
                        {formatPrice(booking.payment?.amount || booking.price)}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                        {booking.payment?.status || "PENDING"}
                      </p>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Calendar
                        size={16}
                        className="sm:w-[18px] sm:h-[18px] text-purple-600 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] sm:text-xs text-gray-500">Date</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                          {formatDate(booking.bookingDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Clock
                        size={16}
                        className="sm:w-[18px] sm:h-[18px] text-purple-600 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] sm:text-xs text-gray-500">Time</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                          {booking.bookingTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <MapPin
                        size={16}
                        className="sm:w-[18px] sm:h-[18px] text-purple-600 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] sm:text-xs text-gray-500">Worker Location</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                          {booking.workerId?.address?.street && booking.workerId?.address?.city
                            ? `${booking.workerId.address.street}, ${booking.workerId.address.city}`
                            : "Not available"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Phone
                        size={16}
                        className="sm:w-[18px] sm:h-[18px] text-purple-600 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] sm:text-xs text-gray-500">Worker Contact</p>
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                          {booking.workerId?.phone || "Not available"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  {booking.additionalNotes && (
                    <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-start gap-2">
                        <MessageSquare size={14} className="sm:w-4 sm:h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] sm:text-xs text-blue-600 font-medium mb-1">
                            Additional Notes
                          </p>
                          <p className="text-xs sm:text-sm text-gray-700 break-words">
                            {booking.additionalNotes}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cancellation Reason */}
                  {booking.status === "CANCELLED" && booking.cancellationReason && (
                    <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-red-50 rounded-lg border border-red-100">
                      <div className="flex items-start gap-2">
                        <XCircle size={14} className="sm:w-4 sm:h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] sm:text-xs text-red-600 font-medium mb-1">
                            Cancellation Reason
                          </p>
                          <p className="text-xs sm:text-sm text-gray-700 break-words">
                            {booking.cancellationReason}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
                    <button
                      onClick={() => navigate(`/booking/${booking._id}`)}
                      className="flex-1 py-2 sm:py-2.5 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition font-medium text-xs sm:text-sm"
                    >
                      View Details
                    </button>
                    {(booking.status === "pending" || booking.status === "accepted") && (
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowCancelModal(true);
                        }}
                        className="flex-1 py-2 sm:py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-xs sm:text-sm"
                      >
                        Cancel Booking
                      </button>
                    )}
                    {booking.status === "completed" && (
                      <button
                        className="flex-1 py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition font-medium text-xs sm:text-sm"
                      >
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
        {!loading && filteredBookings.length > 0 && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6 sm:mt-8">
            <button
              onClick={() =>
                setPagination({ ...pagination, page: pagination.page - 1 })
              }
              disabled={pagination.page === 1}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() =>
                setPagination({ ...pagination, page: pagination.page + 1 })
              }
              disabled={pagination.page === pagination.totalPages}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-red-100 rounded-full">
                  <XCircle size={20} className="sm:w-6 sm:h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                    Cancel Booking
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-700">
                  <strong>Worker:</strong> {selectedBooking?.workerId?.name}
                </p>
                <p className="text-xs sm:text-sm text-gray-700 mt-1">
                  <strong>Date:</strong> {formatDate(selectedBooking?.bookingDate)}
                </p>
                <p className="text-xs sm:text-sm text-gray-700 mt-1">
                  <strong>Time:</strong> {selectedBooking?.bookingTime}
                </p>
              </div>

              <textarea
                placeholder="Please provide a reason for cancellation..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3 sm:mb-4"
                rows="4"
              ></textarea>

              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancellationReason("");
                  }}
                  className="flex-1 py-2 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-xs sm:text-sm"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancelBooking}
                  disabled={!cancellationReason.trim()}
                  className="flex-1 py-2 sm:py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
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