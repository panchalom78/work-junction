import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import { useBookingStore } from "../../store/booking.store";

const OngoingBookings = () => {
    const navigate = useNavigate();
    const { bookings, getCustomerBookings } = useBookingStore();

    useEffect(() => {
        getCustomerBookings();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case "Confirmed":
                return "bg-green-100 text-green-800";
            case "In Progress":
                return "bg-blue-100 text-blue-800";
            case "Pending":
                return "bg-yellow-100 text-yellow-800";
            case "Completed":
                return "bg-gray-100 text-gray-800";
            case "Cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case "Paid":
                return "text-green-600";
            case "Pending":
                return "text-yellow-600";
            case "Failed":
                return "text-red-600";
            default:
                return "text-gray-600";
        }
    };

    return (
        <section className="mb-8 sm:mb-12 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Ongoing Bookings
                </h2>
                {bookings.length > 0 && (
                    <button
                        onClick={() => navigate("/customer/bookings")}
                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2 self-start sm:self-auto"
                    >
                        <span className="text-sm sm:text-base">View All</span>
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 border border-gray-100 w-full overflow-hidden">
                {bookings.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                        {bookings.map((booking) => (
                            <div
                                key={booking._id}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-xl sm:rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer w-full"
                                onClick={() => navigate(`/customer/bookings`)}
                            >
                                <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                                            {
                                                booking.workerServiceId?.details.split(
                                                    "."
                                                )[0]
                                            }
                                        </div>
                                        <div className="text-gray-600 text-xs sm:text-sm break-words">
                                            Worker: {booking.workerId?.name}
                                        </div>
                                        <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 mt-1">
                                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                            <span className="break-words">
                                                {new Date(
                                                    booking.bookingDate
                                                ).toLocaleDateString("en-IN", {
                                                    weekday: "short",
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-0 sm:text-right flex-shrink-0">
                                    <div
                                        className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${getStatusColor(
                                            booking.status
                                        )}`}
                                    >
                                        {booking.status}
                                    </div>
                                    <div
                                        className={`text-xs sm:text-sm font-medium sm:mt-1 whitespace-nowrap ${getPaymentStatusColor(
                                            booking.payment?.status || "Pending"
                                        )}`}
                                    >
                                        Payment:{" "}
                                        {booking?.payment?.status || "Pending"}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 sm:py-8">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                        </div>
                        <div className="text-gray-500 text-base sm:text-lg mb-2">
                            No ongoing bookings
                        </div>
                        <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 px-4">
                            Book your first service to get started
                        </p>
                        <button
                            onClick={() => navigate("/customer/search")}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 sm:px-6 py-2 rounded-xl sm:rounded-2xl hover:shadow-lg transition-all duration-300 font-semibold text-sm sm:text-base"
                        >
                            Book a Service
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default OngoingBookings;