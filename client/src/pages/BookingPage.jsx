import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Clock,
    MapPin,
    CheckCircle,
    AlertCircle,
    ChevronLeft,
    Loader2,
    Home,
    Navigation,
    X,
} from "lucide-react";
import { useBookingStore } from "../store/booking.store";
import { useWorkerSearchStore } from "../store/workerSearch.store";
import { useAuthStore } from "../store/auth.store";

const BookingPage = () => {
    const { workerId } = useParams();
    const navigate = useNavigate();
    const { createBooking, loading, error, getAvailableSlotsForWeek } =
        useBookingStore();
    const { getWorkerProfile } = useWorkerSearchStore();
    const { user, getUser } = useAuthStore();

    const [worker, setWorker] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [bookingData, setBookingData] = useState({
        bookingDate: "",
        bookingTime: "",
        specialInstructions: "",
        address: "",
    });
    const [step, setStep] = useState(1); // 1: Service, 2: DateTime, 3: Address, 4: Confirmation
    const [locationType, setLocationType] = useState("saved"); // saved, current, manual
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [manualAddress, setManualAddress] = useState({
        street: "",
        area: "",
        city: "",
        state: "",
        pincode: "",
    });
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    useEffect(() => {
        getUser();
    }, [getUser]);

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

    // Fetch available slots when service is selected
    useEffect(() => {
        if (selectedService && workerId) {
            fetchAvailableSlots();
        }
    }, [selectedService, workerId]);

    // In your fetchAvailableSlots function, add more logging:
    const fetchAvailableSlots = async () => {
        if (!selectedService) return;

        setLoadingSlots(true);
        try {
            const duration = selectedService.estimatedDuration * 60 || 60;
            console.log(
                "Fetching slots for worker:",
                workerId,
                "duration:",
                duration
            );
            const response = await getAvailableSlotsForWeek(workerId, duration);
            if (response.success) {
                console.log("Raw API response:", response.data);
                console.log("Available slots:", response.data.availableSlots);
                setAvailableSlots(response.data.availableSlots || []);
            }
        } catch (error) {
            console.error("Failed to fetch available slots:", error);
            setAvailableSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    // Set saved address when user data loads
    useEffect(() => {
        if (user?.address && locationType === "saved") {
            const { street, area, city, state, pincode } = user.address;
            const addressParts = [street, area, city, state, pincode].filter(
                Boolean
            );
            setBookingData((prev) => ({
                ...prev,
                address: addressParts.join(", "),
            }));
        }
    }, [user, locationType]);

    const handleInputChange = (field, value) => {
        setBookingData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // If date changes, reset time
        if (field === "bookingDate" && value !== bookingData.bookingDate) {
            setBookingData((prev) => ({
                ...prev,
                bookingTime: "",
            }));
        }
    };
    // Check if a date has available slots - FIXED
    // Check if a date has available slots - FIXED
    const hasAvailableSlots = (dateString) => {
        if (!availableSlots.length) return false;

        // Direct comparison first
        const directMatch = availableSlots.find(
            (slot) => slot.date === dateString
        );
        if (directMatch) {
            return (
                directMatch.availableSlots &&
                directMatch.availableSlots.length > 0
            );
        }

        // Normalized comparison as fallback
        const normalizedDate = new Date(dateString + "T00:00:00Z")
            .toISOString()
            .split("T")[0];
        const normalizedMatch = availableSlots.find((slot) => {
            const normalizedSlotDate = new Date(slot.date + "T00:00:00Z")
                .toISOString()
                .split("T")[0];
            return normalizedSlotDate === normalizedDate;
        });

        return (
            normalizedMatch &&
            normalizedMatch.availableSlots &&
            normalizedMatch.availableSlots.length > 0
        );
    };

    // Get available time slots for selected date - FIXED
    // Get available time slots for selected date - FIXED
    const getTimeSlotsForSelectedDate = () => {
        if (!bookingData.bookingDate || !availableSlots.length) return [];

        console.log("Selected booking date:", bookingData.bookingDate);
        console.log("Available slots data:", availableSlots);

        // Direct string comparison first
        const selectedDayData = availableSlots.find((slot) => {
            console.log(
                "Comparing:",
                bookingData.bookingDate,
                "with",
                slot.date
            );
            return bookingData.bookingDate === slot.date;
        });

        if (selectedDayData) {
            console.log("Found matching date data:", selectedDayData);
            return selectedDayData.availableSlots || [];
        }

        // If direct comparison fails, try normalized comparison
        const normalizedSelectedDate = new Date(
            bookingData.bookingDate + "T00:00:00Z"
        )
            .toISOString()
            .split("T")[0];
        console.log("Normalized selected date:", normalizedSelectedDate);

        const normalizedDayData = availableSlots.find((slot) => {
            const normalizedSlotDate = new Date(slot.date + "T00:00:00Z")
                .toISOString()
                .split("T")[0];
            console.log(
                "Normalized comparison:",
                normalizedSelectedDate,
                "with",
                normalizedSlotDate
            );
            return normalizedSelectedDate === normalizedSlotDate;
        });

        console.log("Normalized found data:", normalizedDayData);
        return normalizedDayData ? normalizedDayData.availableSlots : [];
    };

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        setIsGettingLocation(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    const response = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                    );

                    if (response.ok) {
                        const data = await response.json();
                        const locationName =
                            data.locality ||
                            data.city ||
                            data.principalSubdivision ||
                            "Current Location";

                        const fullAddress = [
                            data.locality,
                            data.city,
                            data.principalSubdivision,
                            data.countryName,
                        ]
                            .filter(Boolean)
                            .join(", ");

                        setBookingData((prev) => ({
                            ...prev,
                            address:
                                fullAddress ||
                                `Near ${latitude.toFixed(
                                    4
                                )}, ${longitude.toFixed(4)}`,
                        }));
                    } else {
                        setBookingData((prev) => ({
                            ...prev,
                            address: `Near ${latitude.toFixed(
                                4
                            )}, ${longitude.toFixed(4)}`,
                        }));
                    }
                } catch (error) {
                    console.error("Error getting location:", error);
                    setBookingData((prev) => ({
                        ...prev,
                        address: `Near ${latitude.toFixed(
                            4
                        )}, ${longitude.toFixed(4)}`,
                    }));
                } finally {
                    setIsGettingLocation(false);
                }
            },
            (error) => {
                setIsGettingLocation(false);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        alert(
                            "Location access denied. Please allow location access to use this feature."
                        );
                        break;
                    case error.POSITION_UNAVAILABLE:
                        alert("Location information unavailable.");
                        break;
                    case error.TIMEOUT:
                        alert("Location request timed out.");
                        break;
                        A;
                    default:
                        alert(
                            "An unknown error occurred while getting location."
                        );
                        break;
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000,
            }
        );
    };

    const handleUseSavedAddress = () => {
        setLocationType("saved");
        if (user?.address) {
            const { street, area, city, state, pincode } = user.address;
            const addressParts = [street, area, city, state, pincode].filter(
                Boolean
            );
            setBookingData((prev) => ({
                ...prev,
                address: addressParts.join(", "),
            }));
        }
    };

    const handleUseCurrentLocation = () => {
        setLocationType("current");
        getCurrentLocation();
    };

    const handleUseManualAddress = () => {
        setLocationType("manual");
        setManualAddress({
            street: "",
            area: "",
            city: "",
            state: "",
            pincode: "",
        });
        setBookingData((prev) => ({
            ...prev,
            address: "",
        }));
    };

    const handleManualAddressChange = (field, value) => {
        setManualAddress((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Update booking address
        const updatedAddress = { ...manualAddress, [field]: value };
        const addressParts = [
            updatedAddress.street,
            updatedAddress.area,
            updatedAddress.city,
            updatedAddress.state,
            updatedAddress.pincode,
        ].filter(Boolean);

        setBookingData((prev) => ({
            ...prev,
            address: addressParts.join(", "),
        }));
    };

    const clearAddress = () => {
        setBookingData((prev) => ({
            ...prev,
            address: "",
        }));
        if (locationType === "manual") {
            setManualAddress({
                street: "",
                area: "",
                city: "",
                state: "",
                pincode: "",
            });
        }
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
            !bookingData.bookingTime ||
            !bookingData.address
        ) {
            alert("Please fill all required fields including address");
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
                paymentType: "CASH",
                specialInstructions: bookingData.specialInstructions,
                serviceAddress: bookingData.address,
            };

            const response = await createBooking(bookingPayload);

            if (response.success) {
                setStep(4); // Success step
            }
        } catch (error) {
            console.error("Booking failed:", error);
        }
    };

    const getUserAddress = () => {
        if (!user?.address) return "No address saved in your profile";

        const { street, area, city, state, pincode } = user.address;
        const addressParts = [street, area, city, state, pincode].filter(
            Boolean
        );
        return addressParts.join(", ");
    };

    // Get dates for the next 7 days - FIXED
    const getNextSevenDays = () => {
        const dates = [];
        const today = new Date();

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            // Use UTC to avoid timezone issues
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, "0");
            const day = String(date.getUTCDate()).padStart(2, "0");
            const formattedDate = `${year}-${month}-${day}`;

            dates.push({
                date: formattedDate,
                day: date.toLocaleDateString("en-US", { weekday: "short" }),
                dateNum: date.getDate(),
                month: date.toLocaleDateString("en-US", { month: "short" }),
                fullDate: date,
            });
        }

        console.log("Generated dates:", dates);
        return dates;
    };

    if (!worker) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 animate-spin mx-auto mb-4" />
                    <div className="text-gray-600 text-sm sm:text-base">
                        Loading worker information...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 w-full">
                <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-xl sm:rounded-2xl transition-colors flex-shrink-0"
                        >
                            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 break-words">
                                Book Service
                            </h1>
                            <p className="text-gray-600 text-xs sm:text-sm md:text-base break-words">
                                Book a service with {worker.name}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                    {/* Booking Steps */}
                    <div className="lg:col-span-2 w-full">
                        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 w-full overflow-hidden">
                            {/* Progress Steps */}
                            <div className="flex justify-between mb-6 sm:mb-8 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                                <div className="flex justify-between w-full min-w-max sm:min-w-0">
                                    {[1, 2, 3, 4].map((stepNumber) => (
                                        <div
                                            key={stepNumber}
                                            className="flex flex-col items-center flex-1 px-2"
                                        >
                                            <div
                                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 font-semibold text-sm sm:text-base ${
                                                    stepNumber < step
                                                        ? "bg-green-500 border-green-500 text-white"
                                                        : stepNumber === step
                                                        ? "bg-blue-600 border-blue-600 text-white"
                                                        : "bg-white border-gray-300 text-gray-500"
                                                }`}
                                            >
                                                {stepNumber < step ? (
                                                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                                ) : (
                                                    stepNumber
                                                )}
                                            </div>
                                            <div className="text-xs mt-2 text-gray-600 text-center whitespace-nowrap">
                                                {
                                                    [
                                                        "Service",
                                                        "Date & Time",
                                                        "Address",
                                                        "Confirm",
                                                    ][stepNumber - 1]
                                                }
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Step 1: Service Selection */}
                            {step === 1 && (
                                <div className="space-y-4 sm:space-y-6">
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                                        Select Service
                                    </h3>
                                    <div className="space-y-3 sm:space-y-4">
                                        {worker.services?.map((service) => (
                                            <div
                                                key={service._id}
                                                className={`border-2 rounded-xl sm:rounded-2xl p-3 sm:p-4 cursor-pointer transition-all ${
                                                    selectedService?._id ===
                                                    service._id
                                                        ? "border-blue-500 bg-blue-50"
                                                        : "border-gray-200 hover:border-gray-300"
                                                }`}
                                                onClick={() =>
                                                    setSelectedService(service)
                                                }
                                            >
                                                <div className="flex justify-between items-start gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                                                            {service.details}
                                                        </h4>
                                                        <p className="text-gray-600 text-xs sm:text-sm mt-1">
                                                            {worker.skills?.find(
                                                                (s) =>
                                                                    s._id.toString() ===
                                                                    service.skillId.toString()
                                                            )?.name ||
                                                                "General Service"}
                                                        </p>
                                                        {service.pricingType && (
                                                            <p className="text-gray-500 text-xs sm:text-sm">
                                                                {service.pricingType ===
                                                                "HOURLY"
                                                                    ? "Hourly rate"
                                                                    : "Fixed price"}
                                                            </p>
                                                        )}
                                                        {service.estimatedDuration && (
                                                            <p className="text-blue-600 text-xs sm:text-sm font-medium mt-1">
                                                                Duration:{" "}
                                                                {
                                                                    service.estimatedDuration
                                                                }{" "}
                                                                hours
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <div className="text-xl sm:text-2xl font-bold text-gray-900">
                                                            ₹{service.price}
                                                        </div>
                                                        {service.pricingType ===
                                                            "HOURLY" && (
                                                            <div className="text-gray-500 text-xs sm:text-sm">
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
                                <div className="space-y-4 sm:space-y-6">
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                                        Select Date & Time
                                    </h3>

                                    {/* Date Selection */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                                            Select Date *
                                        </label>
                                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-4">
                                            {getNextSevenDays().map((day) => {
                                                const hasSlots =
                                                    hasAvailableSlots(day.date);

                                                return (
                                                    // Replace the existing button with this:
                                                    <button
                                                        key={day.date}
                                                        type="button"
                                                        onClick={() =>
                                                            handleInputChange(
                                                                "bookingDate",
                                                                day.date
                                                            )
                                                        }
                                                        className={`flex flex-col items-center p-2 sm:p-3 border rounded-xl sm:rounded-2xl text-xs sm:text-sm transition-all ${
                                                            bookingData.bookingDate ===
                                                            day.date
                                                                ? "bg-blue-600 text-white border-blue-600"
                                                                : hasSlots
                                                                ? "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                                                                : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                        }`}
                                                        disabled={!hasSlots}
                                                    >
                                                        <span className="font-medium">
                                                            {day.day}
                                                        </span>
                                                        <span className="text-xs">
                                                            {day.dateNum}
                                                        </span>
                                                        <span className="text-xs opacity-75">
                                                            {day.month}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {loadingSlots && (
                                            <div className="flex items-center justify-center py-2">
                                                <Loader2 className="w-4 h-4 text-blue-600 animate-spin mr-2" />
                                                <span className="text-xs text-gray-600">
                                                    Loading available dates...
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Time Selection */}
                                    {bookingData.bookingDate && (
                                        <div>
                                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                                                Select Time *
                                            </label>
                                            {loadingSlots ? (
                                                <div className="flex justify-center py-8">
                                                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                                                    {getTimeSlotsForSelectedDate().map(
                                                        (slot) => (
                                                            <button
                                                                key={slot.time}
                                                                type="button"
                                                                onClick={() =>
                                                                    handleInputChange(
                                                                        "bookingTime",
                                                                        slot.displayTime
                                                                    )
                                                                }
                                                                className={`py-2 sm:py-3 px-2 sm:px-4 border rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium transition-all ${
                                                                    bookingData.bookingTime ===
                                                                    slot.displayTime
                                                                        ? "bg-blue-600 text-white border-blue-600"
                                                                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                                                                }`}
                                                            >
                                                                {
                                                                    slot.displayTime
                                                                }
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            )}
                                            {getTimeSlotsForSelectedDate()
                                                .length === 0 &&
                                                !loadingSlots && (
                                                    <div className="text-center py-4 text-gray-500 text-sm">
                                                        No available time slots
                                                        for this date. Please
                                                        select another date.
                                                    </div>
                                                )}
                                        </div>
                                    )}

                                    {/* Service Duration Info */}
                                    {selectedService && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
                                            <div className="flex items-center space-x-2 text-blue-800 text-xs sm:text-sm">
                                                <Clock className="w-4 h-4 flex-shrink-0" />
                                                <span>
                                                    Service duration:{" "}
                                                    {selectedService.estimatedDuration ||
                                                        1}{" "}
                                                    hours
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 3: Address Selection */}
                            {step === 3 && (
                                <div className="space-y-4 sm:space-y-6">
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                                        Select Service Address
                                    </h3>

                                    {/* Address Type Toggle */}
                                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                        <button
                                            type="button"
                                            onClick={handleUseSavedAddress}
                                            disabled={!user?.address}
                                            className={`flex flex-col items-center justify-center space-y-1.5 sm:space-y-2 py-3 sm:py-4 px-2 sm:px-3 rounded-xl sm:rounded-2xl border transition-all duration-200 ${
                                                locationType === "saved"
                                                    ? "bg-blue-100 border-blue-500 text-blue-700"
                                                    : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"
                                            } ${
                                                !user?.address
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }`}
                                        >
                                            <Home className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm font-medium text-center">
                                                Saved Address
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleUseCurrentLocation}
                                            disabled={isGettingLocation}
                                            className={`flex flex-col items-center justify-center space-y-1.5 sm:space-y-2 py-3 sm:py-4 px-2 sm:px-3 rounded-xl sm:rounded-2xl border transition-all duration-200 ${
                                                locationType === "current"
                                                    ? "bg-green-100 border-green-500 text-green-700"
                                                    : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"
                                            } ${
                                                isGettingLocation
                                                    ? "opacity-50 cursor-not-allowed"
                                                    : ""
                                            }`}
                                        >
                                            {isGettingLocation ? (
                                                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin flex-shrink-0" />
                                            ) : (
                                                <Navigation className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                            )}
                                            <span className="text-xs sm:text-sm font-medium text-center">
                                                {isGettingLocation
                                                    ? "Detecting..."
                                                    : "Current"}
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleUseManualAddress}
                                            className={`flex flex-col items-center justify-center space-y-1.5 sm:space-y-2 py-3 sm:py-4 px-2 sm:px-3 rounded-xl sm:rounded-2xl border transition-all duration-200 ${
                                                locationType === "manual"
                                                    ? "bg-purple-100 border-purple-500 text-purple-700"
                                                    : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"
                                            }`}
                                        >
                                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                            <span className="text-xs sm:text-sm font-medium text-center">
                                                Enter Manual
                                            </span>
                                        </button>
                                    </div>

                                    {/* Address Display/Input */}
                                    {locationType === "saved" &&
                                        user?.address && (
                                            <div className="border-2 border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-gray-50">
                                                <div className="flex items-start space-x-2 sm:space-x-3">
                                                    <Home className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                                                            Service Address
                                                        </h4>
                                                        <p className="text-gray-700 mb-2 sm:mb-3 text-xs sm:text-sm break-words">
                                                            {getUserAddress()}
                                                        </p>
                                                        <p className="text-xs sm:text-sm text-gray-500">
                                                            This is your saved
                                                            address from your
                                                            profile.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                    {locationType === "current" && (
                                        <div
                                            className={`relative w-full border rounded-xl sm:rounded-2xl pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 ${
                                                bookingData.address
                                                    ? "border-green-200 bg-green-50"
                                                    : "border-gray-300 bg-gray-50"
                                            }`}
                                        >
                                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 flex-shrink-0" />
                                            <div className="flex items-center justify-between gap-2">
                                                <span
                                                    className={`font-medium text-xs sm:text-sm break-words flex-1 ${
                                                        bookingData.address
                                                            ? "text-green-800"
                                                            : "text-gray-600"
                                                    }`}
                                                >
                                                    {bookingData.address ||
                                                        'Click "Current" to detect your location'}
                                                </span>
                                                {bookingData.address && (
                                                    <button
                                                        type="button"
                                                        onClick={clearAddress}
                                                        className="p-1 transition-colors flex-shrink-0 text-green-600 hover:text-green-800"
                                                    >
                                                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {locationType === "manual" && (
                                        <div className="space-y-3 sm:space-y-4">
                                            <div>
                                                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                                    Street / House No *
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter street address"
                                                    value={manualAddress.street}
                                                    onChange={(e) =>
                                                        handleManualAddressChange(
                                                            "street",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full border border-gray-300 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-blue-500"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                <div>
                                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                                        Pincode *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Enter pincode"
                                                        value={
                                                            manualAddress.pincode
                                                        }
                                                        onChange={(e) =>
                                                            handleManualAddressChange(
                                                                "pincode",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full border border-gray-300 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Special Instructions */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
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
                                            className="w-full border border-gray-300 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:border-blue-500 resize-none"
                                        />
                                    </div>

                                    {/* Payment Information */}
                                    <div className="border-2 border-green-200 bg-green-50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                                        <div className="flex items-start space-x-2 sm:space-x-3">
                                            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-0.5" />
                                            <div className="min-w-0">
                                                <h4 className="font-semibold text-green-800 text-sm sm:text-base">
                                                    Payment after Service
                                                </h4>
                                                <p className="text-green-700 text-xs sm:text-sm break-words">
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
                                <div className="text-center py-6 sm:py-8">
                                    <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-4" />
                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                                        Booking Confirmed!
                                    </h3>
                                    <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base px-4">
                                        Your booking with {worker.name} has been
                                        confirmed successfully.
                                    </p>
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-left">
                                            <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                                                Booking Details:
                                            </h4>
                                            <p className="text-xs sm:text-sm text-gray-600 break-words">
                                                <strong>Service:</strong>{" "}
                                                {selectedService?.details}
                                            </p>
                                            <p className="text-xs sm:text-sm text-gray-600">
                                                <strong>Date:</strong>{" "}
                                                {new Date(
                                                    bookingData.bookingDate
                                                ).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs sm:text-sm text-gray-600">
                                                <strong>Time:</strong>{" "}
                                                {bookingData.bookingTime}
                                            </p>
                                            <p className="text-xs sm:text-sm text-gray-600 break-words">
                                                <strong>Address:</strong>{" "}
                                                {bookingData.address}
                                            </p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        "/customer/bookings"
                                                    )
                                                }
                                                className="bg-blue-600 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl hover:bg-blue-700 transition-colors font-semibold text-sm sm:text-base"
                                            >
                                                View Bookings
                                            </button>
                                            <button
                                                onClick={() =>
                                                    navigate("/customer")
                                                }
                                                className="border-2 border-gray-300 text-gray-700 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl hover:border-gray-400 transition-colors font-semibold text-sm sm:text-base"
                                            >
                                                Back to Home
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            {step < 4 && (
                                <div className="flex justify-between pt-4 sm:pt-6 border-t border-gray-200">
                                    <button
                                        onClick={handlePrevStep}
                                        disabled={step === 1}
                                        className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold transition-colors text-sm sm:text-base ${
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
                                            (step === 1 && !selectedService) ||
                                            (step === 2 &&
                                                (!bookingData.bookingDate ||
                                                    !bookingData.bookingTime)) ||
                                            (step === 3 && !bookingData.address)
                                        }
                                        className="bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl hover:bg-blue-700 transition-colors font-semibold flex items-center space-x-2 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm sm:text-base"
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
                            <div className="bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 w-full">
                                <div className="flex items-center space-x-2 text-red-800 text-sm sm:text-base">
                                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                    <span className="break-words">{error}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1 w-full">
                        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 sticky top-4 sm:top-8">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                                Order Summary
                            </h3>

                            {/* Worker Info */}
                            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6 pb-4 border-b border-gray-200">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-semibold text-sm sm:text-base flex-shrink-0">
                                    {worker.name
                                        ?.split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </div>
                                <div className="min-w-0">
                                    <div className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                                        {worker.name}
                                    </div>
                                    <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-600">
                                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                        <span className="break-words">
                                            {worker.address?.city || "City"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Service Details */}
                            {selectedService && (
                                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                                    <div className="flex justify-between text-xs sm:text-sm gap-2">
                                        <span className="text-gray-600 flex-shrink-0">
                                            Service:
                                        </span>
                                        <span className="font-medium text-gray-900 text-right break-words">
                                            {selectedService.details}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-gray-600 flex-shrink-0">
                                            Price:
                                        </span>
                                        <span className="font-bold text-gray-900 whitespace-nowrap">
                                            ₹{selectedService.price}
                                            {selectedService.pricingType ===
                                                "HOURLY" && "/hour"}
                                        </span>
                                    </div>
                                    {selectedService.estimatedDuration && (
                                        <div className="flex justify-between text-xs sm:text-sm">
                                            <span className="text-gray-600 flex-shrink-0">
                                                Duration:
                                            </span>
                                            <span className="font-medium text-gray-900 whitespace-nowrap">
                                                {
                                                    selectedService.estimatedDuration
                                                }{" "}
                                                hours
                                            </span>
                                        </div>
                                    )}
                                    {bookingData.bookingDate && (
                                        <div className="flex justify-between text-xs sm:text-sm">
                                            <span className="text-gray-600 flex-shrink-0">
                                                Date:
                                            </span>
                                            <span className="font-medium text-gray-900 whitespace-nowrap">
                                                {new Date(
                                                    bookingData.bookingDate
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                    {bookingData.bookingTime && (
                                        <div className="flex justify-between text-xs sm:text-sm">
                                            <span className="text-gray-600 flex-shrink-0">
                                                Time:
                                            </span>
                                            <span className="font-medium text-gray-900 whitespace-nowrap">
                                                {bookingData.bookingTime}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Total */}
                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-900 text-sm sm:text-base">
                                        Total Amount:
                                    </span>
                                    <span className="text-xl sm:text-2xl font-bold text-gray-900">
                                        ₹{selectedService?.price || 0}
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-600 mt-2">
                                    Pay after service completion
                                </p>
                            </div>

                            {/* Trust Badges */}
                            <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                                    <span>Pay After Service</span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                                    <span>Verified Professional</span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
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
