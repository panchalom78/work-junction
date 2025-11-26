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
    MessageCircle,
    Eye,
    ThumbsUp,
    ThumbsDown,
    Filter,
    Loader2,
    IndianRupee,
    Key,
    Play,
    Square,
    CreditCard,
    Edit,
} from "lucide-react";
import { useBookingStore } from "../store/booking.store";

const WorkerBookings = () => {
    const navigate = useNavigate();
    const {
        bookings,
        loading,
        error,
        getWorkerBookings,
        updateBookingStatus,
        initiateService,
        verifyServiceOtp,
        completeService,
        updateBookingPrice,
    } = useBookingStore();

    const [selectedStatus, setSelectedStatus] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showActionModal, setShowActionModal] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [actionType, setActionType] = useState("");
    const [reason, setReason] = useState("");
    const [otp, setOtp] = useState("");
    const [serviceLoading, setServiceLoading] = useState(false);
    const [updatedPrice, setUpdatedPrice] = useState("");
    const [priceUpdateReason, setPriceUpdateReason] = useState("");

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
            await getWorkerBookings({
                status: selectedStatus === "ALL" ? "" : selectedStatus,
            });
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
        }
    };

    const filteredBookings = bookings.filter(
        (booking) =>
            booking.customerId?.name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            booking.workerServiceId?.details
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            booking.customerId?.phone?.includes(searchTerm)
    );

    const getStatusColor = (status) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "ACCEPTED":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "PAYMENT_PENDING":
                return "bg-orange-100 text-orange-800 border-orange-200";
            case "COMPLETED":
                return "bg-green-100 text-green-800 border-green-200";
            case "CANCELLED":
                return "bg-red-100 text-red-800 border-red-200";
            case "DECLINED":
                return "bg-gray-100 text-gray-800 border-gray-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "PENDING":
                return <ClockIcon className="w-4 h-4" />;
            case "ACCEPTED":
                return <CheckCircle className="w-4 h-4" />;
            case "PAYMENT_PENDING":
                return <CreditCard className="w-4 h-4" />;
            case "COMPLETED":
                return <ThumbsUp className="w-4 h-4" />;
            case "CANCELLED":
            case "DECLINED":
                return <XCircle className="w-4 h-4" />;
            default:
                return <ClockIcon className="w-4 h-4" />;
        }
    };

    const handleAction = (booking, action) => {
        setSelectedBooking(booking);
        setActionType(action);
        setReason("");
        setShowActionModal(true);
    };

    const handleInitiateService = async (booking) => {
        setServiceLoading(true);
        try {
            const response = await initiateService(booking._id);
            alert(
                "OTP sent to customer successfully! Please ask the customer for the OTP to start the service."
            );
            await fetchBookings();
        } catch (error) {
            alert(
                error.response?.data?.message || "Failed to initiate service"
            );
        } finally {
            setServiceLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            alert("Please enter a valid 6-digit OTP");
            return;
        }

        setServiceLoading(true);
        try {
            const response = await verifyServiceOtp(selectedBooking._id, otp);
            alert("Service started successfully!");
            setShowOtpModal(false);
            setOtp("");
            setSelectedBooking(null);
            await fetchBookings();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to verify OTP");
        } finally {
            setServiceLoading(false);
        }
    };

    const handleCompleteService = async (booking) => {
        setSelectedBooking(booking);
        setUpdatedPrice(booking.price.toString());
        setPriceUpdateReason("");
        setShowPriceModal(true);
    };

    const handleUpdatePriceAndComplete = async () => {
        if (!selectedBooking) return;

        const newPrice = parseFloat(updatedPrice);
        if (isNaN(newPrice) || newPrice <= 0) {
            alert("Please enter a valid price");
            return;
        }

        setServiceLoading(true);
        try {
            if (newPrice !== selectedBooking.price) {
                await updateBookingPrice(selectedBooking._id, {
                    newPrice: newPrice,
                    reason:
                        priceUpdateReason ||
                        "Service charge updated during completion",
                });
            }

            const response = await completeService(selectedBooking._id);
            alert("Service completed successfully!");
            setShowPriceModal(false);
            setSelectedBooking(null);
            setUpdatedPrice("");
            setPriceUpdateReason("");
            await fetchBookings();
        } catch (error) {
            console.log(error);

            alert(
                error.response?.data?.message || "Failed to complete service"
            );
        } finally {
            setServiceLoading(false);
        }
    };

    const confirmAction = async () => {
        if (!selectedBooking) return;

        try {
            await updateBookingStatus(selectedBooking._id, {
                status:
                    actionType === "accept"
                        ? "ACCEPTED"
                        : actionType === "decline"
                        ? "DECLINED"
                        : "COMPLETED",
                reason: actionType === "decline" ? reason : undefined,
            });

            setShowActionModal(false);
            setSelectedBooking(null);
            setActionType("");
            setReason("");
            await fetchBookings();
        } catch (error) {
            console.error("Failed to update booking:", error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatTime = (timeString) => {
        return timeString;
    };

    const getServiceStatus = (booking) => {
        if (
            booking.status !== "ACCEPTED" &&
            booking.status !== "PAYMENT_PENDING"
        )
            return null;

        if (!booking.serviceInitiated) {
            return {
                text: "Ready to Start",
                color: "text-blue-600",
                bg: "bg-blue-50",
            };
        } else if (booking.serviceInitiated && !booking.serviceStartedAt) {
            return {
                text: "Waiting for OTP",
                color: "text-orange-600",
                bg: "bg-orange-50",
            };
        } else if (booking.serviceStartedAt && !booking.serviceCompletedAt) {
            return {
                text: "Service in Progress",
                color: "text-purple-600",
                bg: "bg-purple-50",
            };
        } else if (booking.serviceCompletedAt) {
            return {
                text: "Service Completed",
                color: "text-green-600",
                bg: "bg-green-50",
            };
        }
        return null;
    };

    const getPaymentStatus = (booking) => {
        if (booking.status === "PAYMENT_PENDING") {
            return {
                text: "Payment Required",
                color: "text-orange-600",
                bg: "bg-orange-50",
            };
        }
        if (booking.payment?.status === "COMPLETED") {
            return {
                text: "Payment Received",
                color: "text-green-600",
                bg: "bg-green-50",
            };
        }
        if (
            booking.payment?.status === "PENDING" &&
            booking.status === "ACCEPTED"
        ) {
            return {
                text: "Payment Pending",
                color: "text-yellow-600",
                bg: "bg-yellow-50",
            };
        }
        return null;
    };

    const getActionButtons = (booking) => {
        const serviceStatus = getServiceStatus(booking);
        const paymentStatus = getPaymentStatus(booking);

        switch (booking.status) {
            case "PENDING":
                return (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleAction(booking, "accept")}
                            className="flex-1 bg-green-600 text-white py-3 px-3 rounded-lg hover:bg-green-700 transition-colors text-base font-medium"
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => handleAction(booking, "decline")}
                            className="flex-1 bg-red-600 text-white py-3 px-3 rounded-lg hover:bg-red-700 transition-colors text-base font-medium"
                        >
                            Decline
                        </button>
                    </div>
                );
            case "ACCEPTED":
            case "PAYMENT_PENDING":
                return (
                    <div className="space-y-3">
                        {paymentStatus && (
                            <div
                                className={`text-center text-sm md:text-base font-medium px-2 py-2 rounded-lg ${paymentStatus.bg} ${paymentStatus.color}`}
                            >
                                {paymentStatus.text}
                            </div>
                        )}

                        {serviceStatus && (
                            <div
                                className={`text-center text-sm md:text-base font-medium px-2 py-2 rounded-lg ${serviceStatus.bg} ${serviceStatus.color}`}
                            >
                                {serviceStatus.text}
                            </div>
                        )}

                        {!booking.serviceInitiated ? (
                            <button
                                onClick={() => handleInitiateService(booking)}
                                disabled={serviceLoading}
                                className="w-full bg-blue-600 text-white py-3 px-3 rounded-lg hover:bg-blue-700 transition-colors text-base font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {serviceLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Play className="w-4 h-4" />
                                )}
                                Start Service
                            </button>
                        ) : !booking.serviceStartedAt ? (
                            <button
                                onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowOtpModal(true);
                                }}
                                className="w-full bg-green-600 text-white py-3 px-3 rounded-lg hover:bg-green-700 transition-colors text-base font-medium flex items-center justify-center gap-2"
                            >
                                <Key className="w-4 h-4" />
                                Verify OTP
                            </button>
                        ) : (
                            <button
                                onClick={() => handleCompleteService(booking)}
                                disabled={
                                    serviceLoading ||
                                    booking.status === "PAYMENT_PENDING"
                                }
                                className="w-full bg-purple-600 text-white py-3 px-3 rounded-lg hover:bg-purple-700 transition-colors text-base font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {serviceLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Square className="w-4 h-4" />
                                )}
                                {booking.status === "PAYMENT_PENDING"
                                    ? "Complete Payment First"
                                    : "Complete Service"}
                            </button>
                        )}

                        <button
                            onClick={() =>
                                navigate(`/chat/${booking.customerId._id}`)
                            }
                            className="w-full bg-gray-600 text-white py-3 px-3 rounded-lg hover:bg-gray-700 transition-colors text-base font-medium flex items-center justify-center gap-2"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Chat
                        </button>

                        {booking.status === "PAYMENT_PENDING" && (
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                <p className="text-orange-700 text-sm md:text-base text-center">
                                    <strong>Note:</strong> Waiting for customer
                                    to complete payment
                                </p>
                            </div>
                        )}
                    </div>
                );
            case "COMPLETED":
                return (
                    <div className="text-center">
                        <div className="text-green-600 text-base font-medium">
                            Completed
                        </div>
                        {booking.review && (
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-base text-gray-600">
                                    {booking.review.rating}/5
                                </span>
                            </div>
                        )}
                        {booking.payment?.status === "COMPLETED" && (
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mt-2">
                                <CheckCircle className="w-3 h-3" />
                                <span>Paid</span>
                            </div>
                        )}
                    </div>
                );
            default:
                return (
                    <div className="text-center text-gray-500 text-base">
                        {booking.status.charAt(0) +
                            booking.status
                                .slice(1)
                                .toLowerCase()
                                .replace("_", " ")}
                    </div>
                );
        }
    };

    if (loading && bookings.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                    <div className="text-gray-600 text-base">
                        Loading your bookings...
                    </div>
                </div>
            </div>
        );
    }

    return (
        // Top-level text sizing + relaxed line-height to increase font sizes everywhere
        <div className="min-h-screen bg-gray-50 text-base md:text-lg leading-relaxed">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 break-words">
                                My Bookings
                            </h1>
                            <p className="text-gray-600 mt-1 text-base md:text-lg break-words">
                                Manage and track your service bookings
                            </p>
                        </div>
                        <div className="flex gap-6">
                            <div className="text-right">
                                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                                    {
                                        bookings.filter(
                                            (b) => b.status === "PENDING"
                                        ).length
                                    }
                                </div>
                                <div className="text-sm md:text-base text-gray-600">
                                    Pending Requests
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl md:text-3xl font-bold text-orange-600">
                                    {
                                        bookings.filter(
                                            (b) =>
                                                b.status === "PAYMENT_PENDING"
                                        ).length
                                    }
                                </div>
                                <div className="text-sm md:text-base text-gray-600">
                                    Payment Pending
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Filters and Search */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        {/* Status Filters */}
                        <div className="flex flex-wrap gap-2">
                            {statusFilters.map((filter) => (
                                <button
                                    key={filter.value}
                                    onClick={() =>
                                        setSelectedStatus(filter.value)
                                    }
                                    className={`px-4 py-2 rounded-xl font-medium transition-all border text-base md:text-lg ${
                                        selectedStatus === filter.value
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    {filter.label}
                                    <span className="ml-2 text-sm md:text-base opacity-80">
                                        ({filter.count})
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative w-full lg:w-auto">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by customer or service..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 w-full lg:w-64 text-base md:text-lg"
                            />
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                        <div className="flex items-center space-x-2 text-red-800 text-base md:text-lg">
                            <AlertCircle className="w-5 h-5" />
                            <span className="break-words">{error}</span>
                        </div>
                    </div>
                )}

                {/* Bookings Grid */}
                {filteredBookings.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                        {filteredBookings.map((booking) => (
                            <div
                                key={booking._id}
                                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-semibold text-lg">
                                            {booking.customerId?.name
                                                ?.split(" ")
                                                .map((n) => n[0])
                                                .join("") || "C"}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-semibold text-gray-900 text-base md:text-lg break-words">
                                                {booking.customerId?.name ||
                                                    "Customer"}
                                            </div>
                                            <div className="flex items-center space-x-1 text-sm md:text-base text-gray-600 mt-1 break-words">
                                                <Phone className="w-4 h-4" />
                                                <span className="break-words">
                                                    {booking.customerId
                                                        ?.phone || "N/A"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end space-y-1">
                                        <div
                                            className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm md:text-base font-medium border ${getStatusColor(
                                                booking.status
                                            )}`}
                                        >
                                            {getStatusIcon(booking.status)}
                                            <span className="capitalize break-words">
                                                {booking.status
                                                    .toLowerCase()
                                                    .replace("_", " ")}
                                            </span>
                                        </div>
                                        {booking.payment?.status ===
                                            "COMPLETED" && (
                                            <div className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs md:text-sm font-medium bg-green-100 text-green-800">
                                                <CheckCircle className="w-3 h-3" />
                                                <span>Paid</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Service Details */}
                                <div className="space-y-3 mb-4 text-base md:text-lg">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 ">
                                            Service:
                                        </span>
                                        <span className="font-medium text-gray-900 text-right break-words max-w-[60%]">
                                            {booking.workerServiceId?.details ||
                                                "Service"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between font-bold">
                                        <span className="text-gray-600">
                                            Date:
                                        </span>
                                        <span className="font-medium text-gray-900 break-words">
                                            {formatDate(booking.bookingDate)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 font-bold">
                                            Time:
                                        </span>
                                        <span className="font-medium text-gray-900 break-words">
                                            {formatTime(booking.bookingTime)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600 font-bold">
                                            Amount:
                                        </span>
                                        <span className="font-bold text-gray-900 flex items-center break-words">
                                            <IndianRupee className="w-4 h-4" />
                                            <span className="ml-1">
                                                {booking.price}
                                            </span>
                                            {booking.originalPrice &&
                                                booking.originalPrice !==
                                                    booking.price && (
                                                    <span className="ml-2 text-xs md:text-sm text-gray-500 line-through break-words">
                                                        ₹{booking.originalPrice}
                                                    </span>
                                                )}
                                        </span>
                                    </div>
                                </div>

                                {/* Payment Info */}
                                {booking.payment && (
                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg text-base md:text-lg">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                Payment:
                                            </span>
                                            <span
                                                className={`font-medium ${
                                                    booking.payment.status ===
                                                    "COMPLETED"
                                                        ? "text-green-600"
                                                        : booking.payment
                                                              .status ===
                                                          "PENDING"
                                                        ? "text-orange-600"
                                                        : "text-red-600"
                                                }`}
                                            >
                                                {booking.payment.status}
                                            </span>
                                        </div>
                                        {booking.payment.paymentType && (
                                            <div className="flex justify-between mt-1">
                                                <span className="text-gray-600">
                                                    Method:
                                                </span>
                                                <span className="font-medium text-gray-900 break-words">
                                                    {booking.payment.paymentType.replace(
                                                        "_",
                                                        " "
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                        {booking.priceUpdateReason && (
                                            <div className="mt-2 text-sm md:text-base text-gray-600 break-words">
                                                <strong>Note:</strong>{" "}
                                                {booking.priceUpdateReason}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Customer Address */}
                                {booking.customerId?.address && (
                                    <div className="flex items-start space-x-2 text-sm md:text-base text-gray-600 mb-4">
                                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 break-words">
                                            {booking.customerId.address
                                                .street && (
                                                <div className="break-words">
                                                    {
                                                        booking.customerId
                                                            .address.street
                                                    }
                                                </div>
                                            )}
                                            {booking.customerId.address
                                                .area && (
                                                <div className="break-words">
                                                    {
                                                        booking.customerId
                                                            .address.area
                                                    }
                                                </div>
                                            )}
                                            {booking.customerId.address
                                                .city && (
                                                <div className="break-words">
                                                    {
                                                        booking.customerId
                                                            .address.city
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="mt-4">
                                    {getActionButtons(booking)}
                                </div>

                                {/* Additional Info */}
                                {booking.declineReason && (
                                    <div className="mt-3 p-3 bg-red-50 rounded-lg text-base md:text-lg">
                                        <p className="text-red-700 break-words">
                                            <strong>Decline Reason:</strong>{" "}
                                            {booking.declineReason}
                                        </p>
                                    </div>
                                )}

                                {booking.cancellationReason && (
                                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg text-base md:text-lg">
                                        <p className="text-yellow-700 break-words">
                                            <strong>
                                                Cancellation Reason:
                                            </strong>{" "}
                                            {booking.cancellationReason}
                                        </p>
                                    </div>
                                )}

                                {booking.review && (
                                    <div className="mt-3 p-3 bg-green-50 rounded-lg text-base md:text-lg">
                                        <div className="flex items-center space-x-2 mb-1">
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
                                            <span className="text-base font-medium text-gray-900">
                                                {booking.review.rating}/5
                                            </span>
                                        </div>
                                        {booking.review.comment && (
                                            <p className="text-gray-700 text-base break-words">
                                                {booking.review.comment}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2 break-words">
                            {searchTerm || selectedStatus !== "ALL"
                                ? "No matching bookings found"
                                : "No bookings yet"}
                        </h3>
                        <p className="text-gray-600 mb-6 text-base md:text-lg break-words">
                            {searchTerm || selectedStatus !== "ALL"
                                ? "Try adjusting your search or filters"
                                : "Your booking requests will appear here"}
                        </p>
                        {(searchTerm || selectedStatus !== "ALL") && (
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedStatus("ALL");
                                }}
                                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-base md:text-lg"
                            >
                                Clear Filters
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

            {/* Action Confirmation Modal */}
            {showActionModal && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                                {actionType === "accept" && "Accept Booking"}
                                {actionType === "decline" && "Decline Booking"}
                                {actionType === "complete" &&
                                    "Mark as Complete"}
                            </h3>

                            <div className="space-y-4 text-base md:text-lg">
                                <p className="text-gray-600 break-words">
                                    {actionType === "accept" &&
                                        `Are you sure you want to accept this booking from ${selectedBooking.customerId?.name}?`}
                                    {actionType === "decline" &&
                                        `Are you sure you want to decline this booking from ${selectedBooking.customerId?.name}?`}
                                    {actionType === "complete" &&
                                        `Mark this booking with ${selectedBooking.customerId?.name} as completed?`}
                                </p>

                                {actionType === "decline" && (
                                    <div>
                                        <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                                            Reason for declining (optional)
                                        </label>
                                        <textarea
                                            value={reason}
                                            onChange={(e) =>
                                                setReason(e.target.value)
                                            }
                                            placeholder="Provide a reason for declining this booking..."
                                            rows="3"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base md:text-lg focus:outline-none focus:border-blue-500 resize-none"
                                        />
                                    </div>
                                )}

                                {actionType === "complete" && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-blue-800 text-sm md:text-base">
                                            <strong>Note:</strong> Marking as
                                            complete will allow the customer to
                                            leave a review.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex space-x-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowActionModal(false);
                                        setSelectedBooking(null);
                                        setActionType("");
                                        setReason("");
                                    }}
                                    className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:border-gray-400 transition-colors text-base md:text-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmAction}
                                    disabled={loading}
                                    className={`flex-1 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 text-base md:text-lg ${
                                        actionType === "accept"
                                            ? "bg-green-600 hover:bg-green-700"
                                            : actionType === "decline"
                                            ? "bg-red-600 hover:bg-red-700"
                                            : "bg-blue-600 hover:bg-blue-700"
                                    } disabled:opacity-50`}
                                >
                                    {loading && (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    )}
                                    <span>
                                        {actionType === "accept" && "Accept"}
                                        {actionType === "decline" && "Decline"}
                                        {actionType === "complete" &&
                                            "Complete"}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* OTP Verification Modal */}
            {showOtpModal && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Key className="w-6 h-6 text-green-600" />
                                Verify OTP
                            </h3>

                            <div className="space-y-4 text-base md:text-lg">
                                <p className="text-gray-600 break-words">
                                    Please enter the 6-digit OTP received from{" "}
                                    <strong>
                                        {selectedBooking.customerId?.name}
                                    </strong>{" "}
                                    to start the service.
                                </p>

                                <div>
                                    <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                                        OTP Code
                                    </label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => {
                                            const value = e.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 6);
                                            setOtp(value);
                                        }}
                                        placeholder="Enter 6-digit OTP"
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-xl font-mono focus:outline-none focus:border-blue-500"
                                        maxLength={6}
                                    />
                                    <p className="text-sm md:text-base text-gray-500 mt-2 text-center break-words">
                                        Ask the customer for the OTP sent to
                                        their email
                                    </p>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-blue-800 text-sm md:text-base">
                                        <strong>Note:</strong> The OTP ensures
                                        that service only starts with customer's
                                        consent.
                                    </p>
                                </div>
                            </div>

                            <div className="flex space-x-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowOtpModal(false);
                                        setOtp("");
                                        setSelectedBooking(null);
                                    }}
                                    className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:border-gray-400 transition-colors text-base md:text-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleVerifyOtp}
                                    disabled={
                                        serviceLoading || otp.length !== 6
                                    }
                                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-base md:text-lg"
                                >
                                    {serviceLoading && (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    )}
                                    <span>Verify & Start Service</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Price Update Modal */}
            {showPriceModal && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Edit className="w-6 h-6 text-purple-600" />
                                Update Service Charge & Complete
                            </h3>

                            <div className="space-y-4 text-base md:text-lg">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-blue-800 text-sm md:text-base">
                                        <strong>Note:</strong> You can update
                                        the service charge if the actual work
                                        differs from the original quote. The
                                        customer will need to pay the updated
                                        amount.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                                        Original Amount
                                    </label>
                                    <div className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
                                        <IndianRupee className="w-5 h-5" />
                                        <span className="break-words">
                                            {selectedBooking.price}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                                        Updated Service Charge
                                    </label>
                                    <div className="relative">
                                        <IndianRupee className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="number"
                                            value={updatedPrice}
                                            onChange={(e) =>
                                                setUpdatedPrice(e.target.value)
                                            }
                                            placeholder="Enter updated amount"
                                            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-base md:text-lg focus:outline-none focus:border-blue-500"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    {parseFloat(updatedPrice) >
                                        selectedBooking.price && (
                                        <p className="text-green-600 text-sm md:text-base mt-1 break-words">
                                            Additional ₹
                                            {parseFloat(updatedPrice) -
                                                selectedBooking.price}{" "}
                                            will be charged
                                        </p>
                                    )}
                                    {parseFloat(updatedPrice) <
                                        selectedBooking.price && (
                                        <p className="text-orange-600 text-sm md:text-base mt-1 break-words">
                                            ₹
                                            {selectedBooking.price -
                                                parseFloat(updatedPrice)}{" "}
                                            discount applied
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                                        Reason for Price Change (Optional)
                                    </label>
                                    <textarea
                                        value={priceUpdateReason}
                                        onChange={(e) =>
                                            setPriceUpdateReason(e.target.value)
                                        }
                                        placeholder="Explain the reason for price change (e.g., additional work, material cost, etc.)"
                                        rows="3"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base md:text-lg focus:outline-none focus:border-blue-500 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowPriceModal(false);
                                        setSelectedBooking(null);
                                        setUpdatedPrice("");
                                        setPriceUpdateReason("");
                                    }}
                                    className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:border-gray-400 transition-colors text-base md:text-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdatePriceAndComplete}
                                    disabled={serviceLoading || !updatedPrice}
                                    className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed text-base md:text-lg"
                                >
                                    {serviceLoading && (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    )}
                                    <span>
                                        {parseFloat(updatedPrice) !==
                                        selectedBooking.price
                                            ? "Update Price & Complete"
                                            : "Complete Service"}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkerBookings;
