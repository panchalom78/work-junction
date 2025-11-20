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
        <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Ongoing Bookings
                </h2>
                {bookings.length > 0 && (
                    <button
                        onClick={() => navigate("/customer/bookings")}
                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2"
                    >
                        <span>View All</span>
                        <ChevronRight className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                {bookings.length > 0 ? (
                    <div className="space-y-4">
                        {bookings.slice(0, 5).map((booking) => (
                            <div
                                key={booking._id}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => navigate(`/customer/bookings`)}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">
                                            {
                                                booking.workerServiceId.details.split(
                                                    "."
                                                )[0]
                                            }
                                        </div>
                                        <div className="text-gray-600">
                                            Worker: {booking.workerId.name}
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                                            <Clock className="w-4 h-4" />
                                            <span>
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
                                <div className="text-right">
                                    <div
                                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                            booking.status
                                        )}`}
                                    >
                                        {booking.status}
                                    </div>
                                    <div
                                        className={`text-sm font-medium mt-1 ${getPaymentStatusColor(
                                            booking.payment?.status || "Pending"
                                        )}`}
                                    >
                                        Payment :{" "}
                                        {booking?.payment?.status || "Pending"}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="text-gray-500 text-lg mb-2">
                            No ongoing bookings
                        </div>
                        <p className="text-gray-400 text-sm mb-4">
                            Book your first service to get started
                        </p>
                        <button
                            onClick={() => navigate("/customer/search")}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-2xl hover:shadow-lg transition-all duration-300 font-semibold"
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
