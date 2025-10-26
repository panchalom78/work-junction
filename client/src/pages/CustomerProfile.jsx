import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    User,
    Phone,
    MapPin,
    Mail,
    Save,
    ArrowLeft,
    Loader2,
    Navigation,
    Home,
    Map,
    CheckCircle,
    AlertCircle,
    Search,
} from "lucide-react";
import { useAuthStore } from "../store/auth.store";
import toast from "react-hot-toast";

const CustomerProfile = () => {
    const navigate = useNavigate();
    const { user, updateProfile, loading, error, getUser } = useAuthStore();

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: {
            houseNo: "",
            street: "",
            area: "",
            city: "",
            state: "",
            pincode: "",
            coordinates: {
                latitude: "",
                longitude: "",
            },
        },
    });

    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationType, setLocationType] = useState("manual"); // 'manual' or 'current'

    // Autocomplete states
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

    const searchInputRef = useRef(null);
    const suggestionsRef = useRef(null);

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                phone: user.phone || "",
                address: {
                    houseNo: user.address?.houseNo || "",
                    street: user.address?.street || "",
                    area: user.address?.area || "",
                    city: user.address?.city || "",
                    state: user.address?.state || "",
                    pincode: user.address?.pincode || "",
                    coordinates: {
                        latitude: user.address?.coordinates?.latitude || "",
                        longitude: user.address?.coordinates?.longitude || "",
                    },
                },
            });
        }
    }, [user]);

    useEffect(() => {
        getUser();
    }, []);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target) &&
                searchInputRef.current &&
                !searchInputRef.current.contains(event.target)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleInputChange = (field, value) => {
        if (field.includes(".")) {
            const [parent, child] = field.split(".");
            if (parent === "address" && child.includes(".")) {
                const [subParent, subChild] = child.split(".");
                setFormData((prev) => ({
                    ...prev,
                    address: {
                        ...prev.address,
                        [subParent]: {
                            ...prev.address[subParent],
                            [subChild]: value,
                        },
                    },
                }));
            } else {
                setFormData((prev) => ({
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: value,
                    },
                }));
            }
        } else {
            setFormData((prev) => ({
                ...prev,
                [field]: value,
            }));
        }
    };

    // LocationIQ Reverse Geocoding
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setIsGettingLocation(true);
        setLocationType("current");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;

                    // Update coordinates in form
                    setFormData((prev) => ({
                        ...prev,
                        address: {
                            ...prev.address,
                            coordinates: {
                                latitude: latitude.toString(),
                                longitude: longitude.toString(),
                            },
                        },
                    }));

                    // LocationIQ Reverse Geocoding
                    const API_KEY = import.meta.env.VITE_LOCATION_API_KEY;
                    const response = await fetch(
                        `https://us1.locationiq.com/v1/reverse.php?key=${API_KEY}&lat=${latitude}&lon=${longitude}&format=json&accept-language=en`
                    );

                    if (!response.ok) {
                        throw new Error(
                            `HTTP error! status: ${response.status}`
                        );
                    }

                    const data = await response.json();

                    if (data.address) {
                        const address = data.address;
                        setFormData((prev) => ({
                            ...prev,
                            address: {
                                ...prev.address,
                                houseNo:
                                    address.house_number ||
                                    address.house_name ||
                                    prev.address.houseNo,
                                street:
                                    address.road ||
                                    address.footway ||
                                    prev.address.street,
                                area:
                                    address.suburb ||
                                    address.neighbourhood ||
                                    address.city_district ||
                                    prev.address.area,
                                city:
                                    address.city ||
                                    address.town ||
                                    address.village ||
                                    address.municipality ||
                                    prev.address.city,
                                state:
                                    address.state ||
                                    address.region ||
                                    prev.address.state,
                                pincode:
                                    address.postcode || prev.address.pincode,
                            },
                        }));
                    }

                    toast.success("Location fetched successfully!");
                } catch (error) {
                    console.error("Error fetching address:", error);
                    toast.success(
                        "Location coordinates fetched, but could not get address details."
                    );
                } finally {
                    setIsGettingLocation(false);
                }
            },
            (error) => {
                setIsGettingLocation(false);
                setLocationType("manual");

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        toast.error(
                            "Location access denied. Please allow location access."
                        );
                        break;
                    case error.POSITION_UNAVAILABLE:
                        toast.error("Location information unavailable.");
                        break;
                    case error.TIMEOUT:
                        toast.error("Location request timed out.");
                        break;
                    default:
                        toast.error(
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

    // LocationIQ Autocomplete Search
    const searchAddress = async (query) => {
        if (!query.trim() || query.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsLoadingSuggestions(true);
        try {
            const API_KEY = import.meta.env.VITE_LOCATION_API_KEY;
            const response = await fetch(
                `https://us1.locationiq.com/v1/autocomplete?key=${API_KEY}&q=${encodeURIComponent(
                    query
                )}&format=json&limit=10&bounded=1&viewbox=68.1756585,20.1195321,74.4764325,24.7118932`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setSuggestions(data);
            setShowSuggestions(true);
        } catch (error) {
            console.error("Error fetching address suggestions:", error);
            setSuggestions([]);
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        searchAddress(query);
    };

    const handleSuggestionSelect = (suggestion) => {
        const { lat, lon, display_name, address } = suggestion;

        setFormData((prev) => ({
            ...prev,
            address: {
                ...prev.address,
                houseNo:
                    address.house_number ||
                    address.house_name ||
                    prev.address.houseNo,
                street: address.road || address.footway || "",
                area:
                    address.name ||
                    address.suburb ||
                    address.neighbourhood ||
                    address.city_district ||
                    "",
                city:
                    address.city ||
                    address.town ||
                    address.village ||
                    address.municipality ||
                    address.county ||
                    "",
                state: address.state || address.region || "",
                pincode: address.postcode || "",
                coordinates: {
                    latitude: lat || "",
                    longitude: lon || "",
                },
            },
        }));

        setSearchQuery(display_name);
        setShowSuggestions(false);
        setLocationType("manual");
        toast.success("Address selected successfully!");
    };

    const handleUseManualAddress = () => {
        setLocationType("manual");
        setFormData((prev) => ({
            ...prev,
            address: {
                ...prev.address,
                coordinates: {
                    latitude: "",
                    longitude: "",
                },
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name.trim()) {
            toast.error("Please enter your name");
            return;
        }

        if (!formData.phone.trim() || !/^[0-9]{10}$/.test(formData.phone)) {
            toast.error("Please enter a valid 10-digit phone number");
            return;
        }

        // Address validation
        if (
            !formData.address.area ||
            !formData.address.city ||
            !formData.address.pincode
        ) {
            toast.error("Please fill in area, city, and pincode");
            return;
        }

        try {
            const result = await updateProfile(formData);

            if (result?.success) {
                toast.success("Profile updated successfully!");
                navigate(-1); // Go back to previous page
            } else {
                toast.error(result?.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Profile update error:", error);
            toast.error("Failed to update profile");
        }
    };

    const isFormValid = () => {
        return (
            formData.name.trim() &&
            /^[0-9]{10}$/.test(formData.phone) &&
            formData.address.area &&
            formData.address.city &&
            formData.address.pincode
        );
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                    <div className="text-gray-600">Loading profile...</div>
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
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Profile Settings
                            </h1>
                            <p className="text-gray-600">
                                Update your personal information
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                        <div className="flex items-center space-x-2 text-red-800">
                            <AlertCircle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal Information Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <User className="w-5 h-5 mr-2 text-blue-600" />
                                    Personal Information
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name *
                                        </label>
                                        <div className="relative">
                                            <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "name",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full border border-gray-300 rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500"
                                                placeholder="Enter your full name"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number *
                                        </label>
                                        <div className="relative">
                                            <Phone className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "phone",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full border border-gray-300 rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500"
                                                placeholder="10-digit phone number"
                                                pattern="[0-9]{10}"
                                                maxLength="10"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Email (Read-only) */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="email"
                                                value={user.email}
                                                className="w-full border border-gray-300 rounded-2xl pl-10 pr-4 py-3 bg-gray-50 text-gray-500"
                                                disabled
                                                readOnly
                                            />
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Email cannot be changed
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Address Information Card */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <MapPin className="w-5 h-5 mr-2 text-green-600" />
                                    Address Information
                                </h2>

                                {/* Address Search Autocomplete */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Search Address
                                    </label>
                                    <div
                                        className="relative"
                                        ref={searchInputRef}
                                    >
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={handleSearchChange}
                                                className="w-full border border-gray-300 rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:border-blue-500"
                                                placeholder="Search for your address..."
                                            />
                                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                        </div>

                                        {/* Suggestions Dropdown */}
                                        {showSuggestions && (
                                            <div
                                                ref={suggestionsRef}
                                                className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-2xl shadow-lg max-h-60 overflow-y-auto"
                                            >
                                                {isLoadingSuggestions ? (
                                                    <div className="p-3 text-center text-gray-500">
                                                        Loading suggestions...
                                                    </div>
                                                ) : suggestions.length > 0 ? (
                                                    suggestions.map(
                                                        (suggestion, index) => (
                                                            <div
                                                                key={index}
                                                                className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                                                onClick={() =>
                                                                    handleSuggestionSelect(
                                                                        suggestion
                                                                    )
                                                                }
                                                            >
                                                                <div className="font-medium text-sm text-gray-900">
                                                                    {
                                                                        suggestion.display_name
                                                                    }
                                                                </div>
                                                            </div>
                                                        )
                                                    )
                                                ) : (
                                                    <div className="p-3 text-center text-gray-500">
                                                        No addresses found
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Start typing to search for your address
                                        (minimum 3 characters)
                                    </p>
                                </div>

                                {/* Location Type Toggle */}
                                <div className="flex space-x-3 mb-6">
                                    <button
                                        type="button"
                                        onClick={handleUseManualAddress}
                                        className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl border transition-all duration-200 ${
                                            locationType === "manual"
                                                ? "bg-blue-100 border-blue-500 text-blue-700"
                                                : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200"
                                        }`}
                                    >
                                        <Home className="w-4 h-4" />
                                        <span className="text-sm font-medium">
                                            Enter Manually
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={getCurrentLocation}
                                        disabled={isGettingLocation}
                                        className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl border transition-all duration-200 ${
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
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Navigation className="w-4 h-4" />
                                        )}
                                        <span className="text-sm font-medium">
                                            {isGettingLocation
                                                ? "Detecting..."
                                                : "Use Current Location"}
                                        </span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* House No */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            House/Building No
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.address.houseNo}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "address.houseNo",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                            placeholder="House/Building number"
                                        />
                                    </div>

                                    {/* Street */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Street
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.address.street}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "address.street",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                            placeholder="Street name"
                                        />
                                    </div>

                                    {/* Area */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Area/Locality *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.address.area}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "address.area",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                            placeholder="Area or locality"
                                            required
                                        />
                                    </div>

                                    {/* City */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.address.city}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "address.city",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                            placeholder="City"
                                            required
                                        />
                                    </div>

                                    {/* State */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            State
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.address.state}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "address.state",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                            placeholder="State"
                                        />
                                    </div>

                                    {/* Pincode */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pincode *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.address.pincode}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "address.pincode",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500"
                                            placeholder="6-digit pincode"
                                            pattern="[0-9]{6}"
                                            maxLength="6"
                                            required
                                        />
                                    </div>

                                    {/* Latitude */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Latitude
                                        </label>
                                        <input
                                            type="text"
                                            value={
                                                formData.address.coordinates
                                                    .latitude
                                            }
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "address.coordinates.latitude",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border border-gray-300 rounded-2xl px-4 py-3 bg-gray-50 text-gray-500"
                                            placeholder="Latitude"
                                            readOnly
                                        />
                                    </div>

                                    {/* Longitude */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Longitude
                                        </label>
                                        <input
                                            type="text"
                                            value={
                                                formData.address.coordinates
                                                    .longitude
                                            }
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "address.coordinates.longitude",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border border-gray-300 rounded-2xl px-4 py-3 bg-gray-50 text-gray-500"
                                            placeholder="Longitude"
                                            readOnly
                                        />
                                    </div>
                                </div>

                                {/* Coordinates Display (if available) */}
                                {formData.address.coordinates.latitude &&
                                    formData.address.coordinates.longitude && (
                                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                                            <div className="flex items-center space-x-2 text-green-800">
                                                <CheckCircle className="w-4 h-4" />
                                                <span className="text-sm font-medium">
                                                    Location coordinates
                                                    captured
                                                </span>
                                            </div>
                                            <p className="text-xs text-green-600 mt-1">
                                                Lat:{" "}
                                                {
                                                    formData.address.coordinates
                                                        .latitude
                                                }
                                                , Lng:{" "}
                                                {
                                                    formData.address.coordinates
                                                        .longitude
                                                }
                                            </p>
                                        </div>
                                    )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-4">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-2xl font-semibold hover:border-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !isFormValid()}
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Save className="w-5 h-5" />
                                    )}
                                    <span>
                                        {loading ? "Saving..." : "Save Changes"}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Sidebar - Profile Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Profile Summary
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white font-semibold">
                                        {user.name
                                            ?.split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {user.name}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            Phone:
                                        </span>
                                        <span className="font-medium text-gray-900">
                                            {user.phone}
                                        </span>
                                    </div>

                                    {user.address && (
                                        <>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">
                                                    Address:
                                                </span>
                                                <span className="font-medium text-gray-900 text-right">
                                                    {user.address.area &&
                                                        `${user.address.area}, `}
                                                    {user.address.city}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">
                                                    Pincode:
                                                </span>
                                                <span className="font-medium text-gray-900">
                                                    {user.address.pincode}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <p className="text-xs text-gray-500">
                                        Last updated:{" "}
                                        {new Date(
                                            user.updatedAt
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerProfile;
