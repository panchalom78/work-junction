// src/components/BookingCard.jsx
import { useState } from "react";
import PaymentOptions from "./PaymentOptions";

const BookingCard = ({ booking }) => {
    const [showPayment, setShowPayment] = useState(false);

    const handlePaymentSuccess = (paymentResult) => {
        console.log("Payment successful:", paymentResult);
        setShowPayment(false);
        // Refresh booking status or navigate to success page
    };

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

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {booking.workerServiceId?.details || "Service"}
                    </h3>
                    <p className="text-gray-600">
                        with {booking.workerId?.name || "Worker"}
                    </p>
                    <p className="text-sm text-gray-500">
                        {new Date(booking.bookingDate).toLocaleDateString()} at{" "}
                        {booking.bookingTime}
                    </p>
                    <div className="mt-2 flex items-center space-x-2">
                        <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                booking.status
                            )}`}
                        >
                            {booking.status.replace("_", " ")}
                        </span>
                        {booking.payment?.status === "COMPLETED" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Paid
                            </span>
                        )}
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600">
                        ₹{booking.price}
                    </div>
                    {booking.status === "PAYMENT_PENDING" && (
                        <button
                            onClick={() => setShowPayment(true)}
                            className="mt-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                        >
                            Pay Now
                        </button>
                    )}
                </div>
            </div>

            {/* Payment Modal */}
            {showPayment && (
                <PaymentOptions
                    booking={booking}
                    onPaymentSuccess={handlePaymentSuccess}
                    onClose={() => setShowPayment(false)}
                />
            )}
        </div>
    );
};

export default BookingCard;
