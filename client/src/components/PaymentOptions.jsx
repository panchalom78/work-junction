// src/components/Payment/PaymentOptions.jsx
import { useState, useEffect } from "react";

import { loadRazorpayScript, initializeRazorpay } from "../utils/razorpay";
import { usePaymentStore } from "../store/payment.store";

const PaymentOptions = ({ booking, onPaymentSuccess, onClose }) => {
    const [selectedOption, setSelectedOption] = useState("razorpay");
    const [otp, setOtp] = useState("");
    const [showOtpModal, setShowOtpModal] = useState(false);

    const {
        loading,
        error,
        paymentStatus,
        createRazorpayOrder,
        verifyRazorpayPayment,
        initiateCashPayment,
        verifyCashPayment,
        resetPaymentState,
        clearError,
    } = usePaymentStore();

    useEffect(() => {
        console.log(booking);

        resetPaymentState();
    }, []);

    const handleRazorpayPayment = async () => {
        try {
            clearError();

            // Load Razorpay script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                throw new Error("Failed to load payment gateway");
            }

            // Create order
            const orderData = await createRazorpayOrder(
                booking._id,
                booking.price
            );

            // Initialize Razorpay checkout
            initializeRazorpay(
                {
                    ...orderData,
                    bookingId: booking._id,
                },
                {
                    onSuccess: async (razorpayResponse) => {
                        await verifyRazorpayPayment({
                            razorpay_order_id:
                                razorpayResponse.razorpay_order_id,
                            razorpay_payment_id:
                                razorpayResponse.razorpay_payment_id,
                            razorpay_signature:
                                razorpayResponse.razorpay_signature,
                            bookingId: booking._id,
                        });

                        onPaymentSuccess({
                            paymentMethod: "razorpay",
                            transactionId: razorpayResponse.razorpay_payment_id,
                        });
                    },
                    onError: (error) => {
                        console.error("Payment error:", error);
                    },
                    onClose: () => {
                        console.log("Payment modal closed");
                    },
                }
            );
        } catch (error) {
            console.error("Payment initiation failed:", error);
        }
    };

    const handleCashPaymentInitiate = async () => {
        try {
            clearError();
            const result = await initiateCashPayment(booking._id);
            setShowOtpModal(true);
        } catch (error) {
            console.error("Cash payment initiation failed:", error);
        }
    };

    const handleCashPaymentVerify = async () => {
        try {
            clearError();
            await verifyCashPayment(booking._id, otp);
            setShowOtpModal(false);
            setOtp("");

            onPaymentSuccess({
                paymentMethod: "cash",
                transactionId: `CASH_${Date.now()}`,
            });
        } catch (error) {
            console.error("Cash payment verification failed:", error);
        }
    };

    const handleRetry = () => {
        resetPaymentState();
    };

    if (paymentStatus === "SUCCESS") {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-8 h-8 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                ></path>
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Payment Successful!
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Your payment has been processed successfully. You
                            will receive a confirmation shortly.
                        </p>
                        <button
                            onClick={onClose}
                            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Complete Payment
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            ></path>
                        </svg>
                    </button>
                </div>

                {/* Booking Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-gray-900 mb-2">
                        Booking Summary
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                            <span>Service:</span>
                            <span className="font-medium">
                                {booking.workerServiceId.details.split(".")[0]}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Worker:</span>
                            <span className="font-medium">
                                {booking.workerId.name}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Date & Time:</span>
                            <span className="font-medium">
                                {booking.bookingDate} at {booking.bookingTime}
                            </span>
                        </div>
                        <div className="flex justify-between border-t pt-2 mt-2">
                            <span className="font-semibold">Total Amount:</span>
                            <span className="font-semibold text-lg text-indigo-600">
                                ₹{booking.price}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center">
                            <svg
                                className="w-5 h-5 text-red-400 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                ></path>
                            </svg>
                            <span className="text-red-700 text-sm">
                                {error}
                            </span>
                        </div>
                        <button
                            onClick={handleRetry}
                            className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Payment Options */}
                <div className="space-y-4">
                    {/* Razorpay Option */}
                    <div className="border rounded-lg p-4 hover:border-indigo-300 transition-colors">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="razorpay"
                                checked={selectedOption === "razorpay"}
                                onChange={(e) =>
                                    setSelectedOption(e.target.value)
                                }
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="ml-3 flex-1">
                                <span className="block text-sm font-medium text-gray-900">
                                    Online Payment
                                </span>
                                <span className="block text-sm text-gray-500">
                                    Pay securely with Razorpay
                                </span>
                                <div className="mt-2 flex space-x-2">
                                    <div className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                                        Credit Card
                                    </div>
                                    <div className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                                        Debit Card
                                    </div>
                                    <div className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                                        UPI
                                    </div>
                                    <div className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                                        Net Banking
                                    </div>
                                </div>
                            </div>
                        </label>
                    </div>

                    {/* Cash Option */}
                    <div className="border rounded-lg p-4 hover:border-indigo-300 transition-colors">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="paymentMethod"
                                value="cash"
                                checked={selectedOption === "cash"}
                                onChange={(e) =>
                                    setSelectedOption(e.target.value)
                                }
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="ml-3 flex-1">
                                <span className="block text-sm font-medium text-gray-900">
                                    Pay with Cash
                                </span>
                                <span className="block text-sm text-gray-500">
                                    Pay in cash to the worker
                                </span>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Payment Button */}
                <div className="mt-6">
                    <button
                        onClick={
                            selectedOption === "razorpay"
                                ? handleRazorpayPayment
                                : handleCashPaymentInitiate
                        }
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                        {loading ? (
                            <>
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                Processing...
                            </>
                        ) : (
                            `Pay ₹${booking.price}`
                        )}
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-3">
                        Your payment is secure and encrypted
                    </p>
                </div>

                {/* OTP Modal for Cash Payment */}
                {showOtpModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
                        <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Enter OTP
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Please enter the OTP provided by the worker to
                                confirm your cash payment.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="otp"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        OTP Code
                                    </label>
                                    <input
                                        type="text"
                                        id="otp"
                                        value={otp}
                                        onChange={(e) =>
                                            setOtp(
                                                e.target.value
                                                    .replace(/\D/g, "")
                                                    .slice(0, 6)
                                            )
                                        }
                                        placeholder="Enter 6-digit OTP"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        maxLength={6}
                                    />
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setShowOtpModal(false)}
                                        className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCashPaymentVerify}
                                        disabled={
                                            !otp || otp.length !== 6 || loading
                                        }
                                        className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {loading
                                            ? "Verifying..."
                                            : "Verify OTP"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentOptions;
