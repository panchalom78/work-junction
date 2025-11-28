import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Calendar,
    Clock,
    ChevronRight,
    Calculator,
    PieChart,
    User,
    MapPin,
    CreditCard,
    ArrowRight,
    PlayCircle,
    CheckCircle,
    AlertCircle,
    XCircle,
} from "lucide-react";
import { useBookingStore } from "../../store/booking.store";

const OngoingBookings = () => {
    const navigate = useNavigate();
    const { bookings, getCustomerBookings } = useBookingStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            setIsLoading(true);
            await getCustomerBookings();
            setIsLoading(false);
        };
        fetchBookings();
    }, []);

    const getStatusConfig = (status) => {
        const configs = {
            PENDING: {
                color: "bg-amber-50 text-amber-700 border-amber-200",
                icon: Clock,
                bg: "bg-amber-500",
                displayText: "Pending",
            },
            ACCEPTED: {
                color: "bg-emerald-50 text-emerald-700 border-emerald-200",
                icon: CheckCircle,
                bg: "bg-emerald-500",
                displayText: "Confirmed",
            },
            PAYMENT_PENDING: {
                color: "bg-blue-50 text-blue-700 border-blue-200",
                icon: Clock,
                bg: "bg-blue-500",
                displayText: "Payment Pending",
            },
            COMPLETED: {
                color: "bg-gray-50 text-gray-700 border-gray-200",
                icon: CheckCircle,
                bg: "bg-gray-500",
                displayText: "Completed",
            },
            CANCELLED: {
                color: "bg-red-50 text-red-700 border-red-200",
                icon: XCircle,
                bg: "bg-red-500",
                displayText: "Cancelled",
            },
            DECLINED: {
                color: "bg-red-50 text-red-700 border-red-200",
                icon: XCircle,
                bg: "bg-red-500",
                displayText: "Declined",
            },
        };
        return configs[status] || configs.PENDING;
    };

    const getPaymentStatusConfig = (status) => {
        const configs = {
            COMPLETED: {
                color: "text-emerald-600",
                bg: "bg-emerald-100",
                label: "Paid",
            },
            PENDING: {
                color: "text-amber-600",
                bg: "bg-amber-100",
                label: "Pending",
            },
            FAILED: {
                color: "text-red-600",
                bg: "bg-red-100",
                label: "Failed",
            },
        };
        return configs[status] || configs.PENDING;
    };

    const formatServiceName = (details) => {
        if (!details) return "Service Booking";
        return details.split(".")[0] || "Service Booking";
    };

    if (isLoading) {
        return (
            <section className="mb-16">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Current Bookings
                        </h2>
                        <p className="text-gray-600">
                            Track your ongoing service requests
                        </p>
                    </div>
                    <div className="w-24 h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 animate-pulse"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                                <div>
                                    <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                                    <div className="h-4 bg-gray-100 rounded w-24"></div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                                <div className="h-4 bg-gray-100 rounded w-16"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="mb-16">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Current Bookings
                        </h2>
                    </div>
                    <p className="text-gray-600 text-lg">
                        Track your ongoing service requests and appointments
                    </p>
                </div>

                {bookings.length > 0 && (
                    <button
                        onClick={() => navigate("/customer/bookings")}
                        className="group flex items-center space-x-3 bg-white text-gray-700 px-6 py-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300"
                    >
                        <span className="font-semibold">View All Bookings</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                )}
            </div>

            {/* Bookings Container */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                {bookings.length > 0 ? (
                    <div className="space-y-4">
                        {bookings.slice(0, 5).map((booking) => {
                            const statusConfig = getStatusConfig(
                                booking.status
                            );
                            const paymentConfig = getPaymentStatusConfig(
                                booking.payment?.status || "Pending"
                            );
                            const StatusIcon = statusConfig.icon;

                            return (
                                <div
                                    key={booking._id}
                                    className="group flex items-center justify-between p-5 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 cursor-pointer"
                                    onClick={() =>
                                        navigate(`/customer/bookings`)
                                    }
                                >
                                    {/* Left Section - Service Info */}
                                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                                        <div className="relative">
                                            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                <Calendar className="w-7 h-7 text-white" />
                                            </div>
                                            <div
                                                className={`absolute -top-1 -right-1 w-5 h-5 ${statusConfig.bg} rounded-full border-2 border-white shadow-sm`}
                                            ></div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">
                                                {formatServiceName(
                                                    booking.workerServiceId
                                                        ?.details
                                                )}
                                            </h3>

                                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                <div className="flex items-center space-x-1">
                                                    <User className="w-4 h-4" />
                                                    <span className="font-medium">
                                                        {booking.workerId
                                                            ?.name || "Worker"}
                                                    </span>
                                                </div>

                                                <div className="flex items-center space-x-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>
                                                        {new Date(
                                                            booking.bookingDate
                                                        ).toLocaleDateString(
                                                            "en-IN",
                                                            {
                                                                day: "numeric",
                                                                month: "short",
                                                            }
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            {booking.totalAmount && (
                                                <div className="flex items-center space-x-2 mt-2">
                                                    <CreditCard className="w-4 h-4 text-gray-400" />
                                                    <span className="font-semibold text-gray-900">
                                                        ₹{booking.totalAmount}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Section - Status */}
                                    <div className="flex flex-col items-end space-y-3 flex-shrink-0 ml-4">
                                        {/* Status Badge */}
                                        <div
                                            className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${statusConfig.color} font-semibold`}
                                        >
                                            <StatusIcon className="w-4 h-4" />
                                            <span>{booking.status}</span>
                                        </div>

                                        {/* Payment Status */}
                                        <div
                                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg ${paymentConfig.bg} ${paymentConfig.color} text-sm font-medium`}
                                        >
                                            <CreditCard className="w-3 h-3" />
                                            <span>{paymentConfig.label}</span>
                                        </div>
                                    </div>

                                    {/* Hover Arrow */}
                                    <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <Calendar className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            No Active Bookings
                        </h3>
                        <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                            You don't have any ongoing service bookings at the
                            moment
                        </p>
                        <button
                            onClick={() => navigate("/customer/search")}
                            className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105 inline-flex items-center space-x-3"
                        >
                            <span>Find Services</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* View All Footer */}
                {bookings.length > 5 && (
                    <div className="border-t border-gray-200 mt-6 pt-6 text-center">
                        <button
                            onClick={() => navigate("/customer/bookings")}
                            className="text-blue-600 hover:text-blue-700 font-semibold transition-all duration-300 hover:scale-105 inline-flex items-center space-x-2"
                        >
                            <span>View All {bookings.length} Bookings</span>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default OngoingBookings;
