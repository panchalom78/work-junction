import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Calendar,
    Clock,
    MapPin,
    User,
    CheckCircle,
    AlertCircle,
    ChevronLeft,
    Loader2,
    Home,
} from "lucide-react";
import { useBookingStore } from "../store/booking.store";
import { useWorkerSearchStore } from "../store/workerSearch.store";
import { useAuthStore } from "../store/auth.store";

const BookingPage = () => {
    const { workerId } = useParams();
    const navigate = useNavigate();
    const { createBooking, loading, error } = useBookingStore();
    const { getWorkerProfile } = useWorkerSearchStore();
    const { user, getUser } = useAuthStore();

    const [worker, setWorker] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [bookingData, setBookingData] = useState({
        bookingDate: "",
        bookingTime: "",
        specialInstructions: "",
    });
    const [step, setStep] = useState(1); // 1: Service, 2: DateTime, 3: Address, 4: Confirmation

    useEffect(() => {
        getUser();
    }, []);

    useEffect(() => {
        const fetchWorkerData = async () => {
            try {
                const response = await getWorkerProfile(workerId);
                setWorker(response.data);
                // Auto-select first service if available
                if (
                    response.data.services &&
                    response.data.services.length > 0
                ) {
                    setSelectedService(response.data.services[0]);
                }
            } catch (error) {
                console.error("Failed to fetch worker data:", error);
            }
        };

        if (workerId) {
            fetchWorkerData();
        }
    }, [workerId, getWorkerProfile]);

    const handleInputChange = (field, value) => {
        setBookingData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleNextStep = () => {
        if (step < 4) setStep(step + 1);
    };

    const handlePrevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmitBooking = async () => {
        if (
            !selectedService ||
            !bookingData.bookingDate ||
            !bookingData.bookingTime
        ) {
            alert("Please fill all required fields");
            return;
        }

        try {
            const bookingPayload = {
                workerId,
                workerServiceId: selectedService._id,
                serviceId: selectedService.serviceId,
                bookingDate: bookingData.bookingDate,
                bookingTime: bookingData.bookingTime,
                price: selectedService.price,
                paymentType: "CASH", // Default to cash payment after service
                specialInstructions: bookingData.specialInstructions,
                // Address will be taken from user's profile automatically
            };

            const response = await createBooking(bookingPayload);

            if (response.success) {
                setStep(4); // Success step
            }
        } catch (error) {
            console.error("Booking failed:", error);
        }
    };

    const timeSlots = [
        "09:00",
        "09:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "12:00",
        "12:30",
        "13:00",
        "13:30",
        "14:00",
        "14:30",
        "15:00",
        "15:30",
        "16:00",
        "16:30",
        "17:00",
        "17:30",
        "18:00",
        "18:30",
        "19:00",
        "19:30",
    ];

    // Format user address for display
    const getUserAddress = () => {
        if (!user?.address) return "No address saved in your profile";

        const { street, area, city, state, pincode } = user.address;
        const addressParts = [street, area, city, state, pincode].filter(
            Boolean
        );
        return addressParts.join(", ");
    };

    if (!worker) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                    <div className="text-gray-600">
                        Loading worker information...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-2xl transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Book Service
                            </h1>
                            <p className="text-gray-600">
                                Book a service with {worker.name}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Booking Steps */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
                            {/* Progress Steps */}
                            <div className="flex justify-between mb-8">
                                {[1, 2, 3, 4].map((stepNumber) => (
                                    <div
                                        key={stepNumber}
                                        className="flex flex-col items-center"
                                    >
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-semibold ${
                                                stepNumber < step
                                                    ? "bg-green-500 border-green-500 text-white"
                                                    : stepNumber === step
                                                    ? "bg-blue-600 border-blue-600 text-white"
                                                    : "bg-white border-gray-300 text-gray-500"
                                            }`}
                                        >
                                            {stepNumber < step ? (
                                                <CheckCircle className="w-5 h-5" />
                                            ) : (
                                                stepNumber
                                            )}
                                        </div>
                                        <div className="text-xs mt-2 text-gray-600 text-center">
                                            {
                                                [
                                                    "Service",
                                                    "Date & Time",
                                                    "Review",
                                                    "Confirm",
                                                ][stepNumber - 1]
                                            }
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Step 1: Service Selection */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                                        Select Service
                                    </h3>
                                    <div className="space-y-4">
                                        {worker.services?.map((service) => (
                                            <div
                                                key={service._id}
                                                className={`border-2 rounded-2xl p-4 cursor-pointer transition-all ${
                                                    selectedService?._id ===
                                                    service._id
                                                        ? "border-blue-500 bg-blue-50"
                                                        : "border-gray-200 hover:border-gray-300"
                                                }`}
                                                onClick={() =>
                                                    setSelectedService(service)
                                                }
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">
                                                            {service.details}
                                                        </h4>
                                                        <p className="text-gray-600 text-sm mt-1">
                                                            {worker.skills?.find(
                                                                (s) =>
                                                                    s._id.toString() ===
                                                                    service.skillId.toString()
                                                            )?.name ||
                                                                "General Service"}
                                                        </p>
                                                        {service.pricingType && (
                                                            <p className="text-gray-500 text-sm">
                                                                {service.pricingType ===
                                                                "HOURLY"
                                                                    ? "Hourly rate"
                                                                    : "Fixed price"}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-gray-900">
                                                            ₹{service.price}
                                                        </div>
                                                        {service.pricingType ===
                                                            "HOURLY" && (
                                                            <div className="text-gray-500 text-sm">
                                                                / hour
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Date & Time */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                                        Select Date & Time
                                    </h3>

                                    {/* Date Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Select Date *
                                        </label>
                                        <input
                                            type="date"
                                            min={
                                                new Date()
                                                    .toISOString()
                                                    .split("T")[0]
                                            }
                                            value={bookingData.bookingDate}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "bookingDate",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    {/* Time Selection */}
                                    {bookingData.bookingDate && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Select Time *
                                            </label>
                                            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                                                {timeSlots.map((time) => (
                                                    <button
                                                        key={time}
                                                        type="button"
                                                        onClick={() =>
                                                            handleInputChange(
                                                                "bookingTime",
                                                                time
                                                            )
                                                        }
                                                        className={`py-3 px-4 border rounded-2xl text-sm font-medium transition-all ${
                                                            bookingData.bookingTime ===
                                                            time
                                                                ? "bg-blue-600 text-white border-blue-600"
                                                                : "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                                                        }`}
                                                    >
                                                        {time}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 3: Review Details */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                                        Review Booking Details
                                    </h3>

                                    {/* Service Address (Read-only) */}
                                    <div className="border-2 border-gray-200 rounded-2xl p-4">
                                        <div className="flex items-start space-x-3">
                                            <Home className="w-5 h-5 text-gray-500 mt-0.5" />
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 mb-2">
                                                    Service Address
                                                </h4>
                                                <p className="text-gray-700 mb-3">
                                                    {getUserAddress()}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    This is your saved address
                                                    from your profile. The
                                                    professional will come to
                                                    this location.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Special Instructions */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Special Instructions (Optional)
                                        </label>
                                        <textarea
                                            value={
                                                bookingData.specialInstructions
                                            }
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "specialInstructions",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Any special requirements or instructions for the worker..."
                                            rows="3"
                                            className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500 resize-none"
                                        />
                                    </div>

                                    {/* Payment Information */}
                                    <div className="border-2 border-green-200 bg-green-50 rounded-2xl p-4">
                                        <div className="flex items-center space-x-3">
                                            <CheckCircle className="w-6 h-6 text-green-600" />
                                            <div>
                                                <h4 className="font-semibold text-green-800">
                                                    Payment after Service
                                                </h4>
                                                <p className="text-green-700 text-sm">
                                                    Pay directly to the
                                                    professional after the
                                                    service is completed. No
                                                    upfront payment required.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Confirmation */}
                            {step === 4 && (
                                <div className="text-center py-8">
                                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        Booking Confirmed!
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Your booking with {worker.name} has been
                                        confirmed successfully.
                                    </p>
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 rounded-2xl p-4 text-left">
                                            <h4 className="font-semibold text-gray-900 mb-2">
                                                Booking Details:
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                <strong>Service:</strong>{" "}
                                                {selectedService?.details}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <strong>Date:</strong>{" "}
                                                {new Date(
                                                    bookingData.bookingDate
                                                ).toLocaleDateString()}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <strong>Time:</strong>{" "}
                                                {bookingData.bookingTime}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                <strong>Address:</strong>{" "}
                                                {getUserAddress()}
                                            </p>
                                        </div>
                                        <div className="flex space-x-4 justify-center">
                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        "/customer/bookings"
                                                    )
                                                }
                                                className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-colors font-semibold"
                                            >
                                                View Bookings
                                            </button>
                                            <button
                                                onClick={() =>
                                                    navigate("/customer")
                                                }
                                                className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-2xl hover:border-gray-400 transition-colors font-semibold"
                                            >
                                                Back to Home
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            {step < 4 && (
                                <div className="flex justify-between pt-6 border-t border-gray-200">
                                    <button
                                        onClick={handlePrevStep}
                                        disabled={step === 1}
                                        className={`px-6 py-3 rounded-2xl font-semibold transition-colors ${
                                            step === 1
                                                ? "text-gray-400 cursor-not-allowed"
                                                : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={
                                            step === 3
                                                ? handleSubmitBooking
                                                : handleNextStep
                                        }
                                        disabled={
                                            loading ||
                                            (step === 2 &&
                                                (!bookingData.bookingDate ||
                                                    !bookingData.bookingTime))
                                        }
                                        className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-colors font-semibold flex items-center space-x-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        {loading && (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        )}
                                        <span>
                                            {step === 3
                                                ? "Confirm Booking"
                                                : "Continue"}
                                        </span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                                <div className="flex items-center space-x-2 text-red-800">
                                    <AlertCircle className="w-5 h-5" />
                                    <span>{error}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-lg p-6 sticky top-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                Order Summary
                            </h3>

                            {/* Worker Info */}
                            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-200">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-semibold">
                                    {worker.name
                                        ?.split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">
                                        {worker.name}
                                    </div>
                                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4" />
                                        <span>
                                            {worker.address?.city || "City"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Service Details */}
                            {selectedService && (
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            Service:
                                        </span>
                                        <span className="font-medium text-gray-900 text-right">
                                            {selectedService.details}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            Price:
                                        </span>
                                        <span className="font-bold text-gray-900">
                                            ₹{selectedService.price}
                                            {selectedService.pricingType ===
                                                "HOURLY" && "/hour"}
                                        </span>
                                    </div>
                                    {bookingData.bookingDate && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">
                                                Date:
                                            </span>
                                            <span className="font-medium text-gray-900">
                                                {new Date(
                                                    bookingData.bookingDate
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                    {bookingData.bookingTime && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">
                                                Time:
                                            </span>
                                            <span className="font-medium text-gray-900">
                                                {bookingData.bookingTime}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Total */}
                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-900">
                                        Total Amount:
                                    </span>
                                    <span className="text-2xl font-bold text-gray-900">
                                        ₹{selectedService?.price || 0}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">
                                    Pay after service completion
                                </p>
                            </div>

                            {/* Trust Badges */}
                            <div className="mt-6 space-y-3">
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Pay After Service</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Verified Professional</span>
                                </div>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Secure Booking</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
