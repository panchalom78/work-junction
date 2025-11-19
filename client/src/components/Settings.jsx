import React, { useState, useEffect, useRef } from "react";
import {
    User,
    MapPin,
    Navigation,
    Search,
    Camera,
    Eye,
    Edit,
    X,
} from "lucide-react";
import { useAuthStore } from "../store/auth.store";

// Compact translator used across the app (dropdown-friendly)
import RobustGujaratTranslatorDropdown from "../components/RobustGujaratTranslatorDropdown";
import RobustGujaratTranslator from "./GujaratTranslator";

const Settings = () => {
    const { user, loading, error, getUser, updateProfile } = useAuthStore();

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

    // Loading states
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [searchTimeout, setSearchTimeout] = useState(null);

    // Verification documents states
    const [verificationDocs, setVerificationDocs] = useState({
        selfie: null,
        aadhar: null,
        policeVerification: null,
    });
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [editingSelfie, setEditingSelfie] = useState(false);
    const [newSelfieFile, setNewSelfieFile] = useState(null);
    const [uploadingSelfie, setUploadingSelfie] = useState(false);

    // Autocomplete states
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

    const searchInputRef = useRef(null);
    const suggestionsRef = useRef(null);
    const fileInputRef = useRef(null);

    // Initialize form data when user data is loaded
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

            // Load verification documents if user is a worker
            if (user.role === "WORKER" && user.workerProfile?.verification) {
                const verification = user.workerProfile.verification;
                setVerificationDocs({
                    selfie: verification.selfieUrl || null,
                    aadhar: verification.addharDocUrl || null,
                    policeVerification:
                        verification.policeVerificationDocUrl || null,
                });
            }
        }
    }, [user]);

    // Fetch profile on component mount
    useEffect(() => {
        getUser();
    }, [getUser]);

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
        if (field.startsWith("address.")) {
            const addressField = field.replace("address.", "");
            if (addressField.startsWith("coordinates.")) {
                const coordField = addressField.replace("coordinates.", "");
                setFormData((prev) => ({
                    ...prev,
                    address: {
                        ...prev.address,
                        coordinates: {
                            ...prev.address.coordinates,
                            [coordField]: value,
                        },
                    },
                }));
            } else {
                setFormData((prev) => ({
                    ...prev,
                    address: {
                        ...prev.address,
                        [addressField]: value,
                    },
                }));
            }
        } else {
            setFormData((prev) => ({ ...prev, [field]: value }));
        }
    };

    // Handle selfie file selection
    const handleSelfieChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith("image/")) {
                alert("Please select an image file");
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert("File size should be less than 5MB");
                return;
            }

            setNewSelfieFile(file);
        }
    };

    // Upload new selfie
    const uploadSelfie = async () => {
        if (!newSelfieFile) return;

        setUploadingSelfie(true);
        try {
            const form = new FormData();
            form.append("selfie", newSelfieFile);

            const response = await fetch(
                "/api/worker/verification/upload-selfie",
                {
                    method: "POST",
                    body: form,
                }
            );

            if (!response.ok) {
                throw new Error("Failed to upload selfie");
            }

            const result = await response.json();

            // Update local state
            setVerificationDocs((prev) => ({
                ...prev,
                selfie: result.data.selfieUrl,
            }));

            setEditingSelfie(false);
            setNewSelfieFile(null);
            setSuccessMessage("Selfie updated successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);

            // Refresh user data
            getUser();
        } catch (err) {
            console.error("Error uploading selfie:", err);
            alert("Failed to upload selfie. Please try again.");
        } finally {
            setUploadingSelfie(false);
        }
    };

    // Cancel selfie editing
    const cancelSelfieEdit = () => {
        setEditingSelfie(false);
        setNewSelfieFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // LocationIQ Reverse Geocoding
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by this browser.");
            return;
        }

        setIsLoadingLocation(true);

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
                                    address.county ||
                                    prev.address.area,
                                city:
                                    address.city ||
                                    address.town ||
                                    address.village ||
                                    address.municipality ||
                                    address.state_district ||
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

                    setSuccessMessage("Location fetched successfully!");
                    setTimeout(() => setSuccessMessage(""), 3000);
                } catch (error) {
                    console.error("Error fetching address:", error);
                    setSuccessMessage(
                        "Location coordinates fetched, but could not get address details."
                    );
                    setTimeout(() => setSuccessMessage(""), 3000);
                } finally {
                    setIsLoadingLocation(false);
                }
            },
            (error) => {
                console.error("Error getting location:", error);
                let errorMessage = "Failed to get location: ";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += "Location permission denied.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += "Location information unavailable.";
                        break;
                    case error.TIMEOUT:
                        errorMessage += "Location request timed out.";
                        break;
                    default:
                        errorMessage += "An unknown error occurred.";
                        break;
                }
                alert(errorMessage);
                setIsLoadingLocation(false);
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
                )}&format=json&limit=10&bounded=1&&viewbox=68.1756585,20.1195321,74.4764325,24.7118932`
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

        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Set new timeout
        const timeout = setTimeout(() => {
            searchAddress(query);
        }, 500);

        setSearchTimeout(timeout);
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
        setSuccessMessage("Address selected successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaveLoading(true);
        setSuccessMessage("");

        try {
            // Prepare data for API - only include fields that have values
            const updateData = {};

            if (formData.name.trim()) updateData.name = formData.name.trim();
            if (formData.phone.trim()) updateData.phone = formData.phone.trim();

            // Only include address if at least one field has value
            const hasAddressData = Object.values(formData.address).some(
                (value) => {
                    if (typeof value === "object") {
                        return Object.values(value).some((val) =>
                            val.toString().trim()
                        );
                    }
                    return value.toString().trim();
                }
            );

            if (hasAddressData) {
                updateData.address = {};

                // Add address fields that have values
                Object.entries(formData.address).forEach(([key, value]) => {
                    if (key === "coordinates") {
                        const hasCoords = Object.values(value).some((val) =>
                            val.toString().trim()
                        );
                        if (hasCoords) {
                            updateData.address.coordinates = {};
                            Object.entries(value).forEach(
                                ([coordKey, coordValue]) => {
                                    if (coordValue.toString().trim()) {
                                        updateData.address.coordinates[
                                            coordKey
                                        ] = coordValue.toString().trim();
                                    }
                                }
                            );
                        }
                    } else if (value.toString().trim()) {
                        updateData.address[key] = value.toString().trim();
                    }
                });
            }

            await updateProfile(updateData);
            setSuccessMessage("Profile updated successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setSaveLoading(false);
        }
    };

    if (loading && !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        Profile Settings
                    </h2>
                    <p className="text-base text-gray-600">
                        Manage your personal information and address
                    </p>
                </div>

                {/* Compact translator placed in header (top-right) */}
                <div className="ml-4 w-40 hidden sm:block">
                    <RobustGujaratTranslator />
                </div>
            </div>

            {/* Error and Success Messages */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">{error}</p>
                </div>
            )}

            {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 text-sm">{successMessage}</p>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        {/* Personal Information */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 m-0">
                                        Personal Information
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Update your basic personal details
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "name",
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "phone",
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter 10-digit phone number"
                                        pattern="[0-9]{10}"
                                        maxLength="10"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        10-digit number without country code
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Worker Verification Documents Section */}
                        {user?.role === "WORKER" && (
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <Camera className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 m-0">
                                                Verification Documents
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Manage your verification
                                                documents
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowVerificationModal(true)
                                        }
                                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>View Documents</span>
                                    </button>
                                </div>

                                {/* Selfie Section with Edit Option */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Selfie Photo
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEditingSelfie(true)
                                            }
                                            className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            <Edit className="w-3 h-3" />
                                            <span>Edit</span>
                                        </button>
                                    </div>

                                    {editingSelfie ? (
                                        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={
                                                        handleSelfieChange
                                                    }
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={cancelSelfieEdit}
                                                    className="p-2 text-gray-500 hover:text-gray-700"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                            {newSelfieFile && (
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-sm text-gray-600">
                                                        Selected:{" "}
                                                        {newSelfieFile.name}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={uploadSelfie}
                                                        disabled={
                                                            uploadingSelfie
                                                        }
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    >
                                                        {uploadingSelfie
                                                            ? "Uploading..."
                                                            : "Upload"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-3">
                                            {verificationDocs.selfie ? (
                                                <div className="flex items-center space-x-3">
                                                    <img
                                                        src={
                                                            verificationDocs.selfie
                                                        }
                                                        alt="Selfie"
                                                        className="w-16 h-16 rounded-lg object-cover border border-gray-300"
                                                    />
                                                    <span className="text-sm text-green-600 font-medium">
                                                        Selfie uploaded
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500">
                                                    No selfie uploaded
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <p className="text-xs text-gray-500">
                                        Upload a clear selfie photo for
                                        verification purposes
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Address Information */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <MapPin className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 m-0">
                                        Address Information
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Update your current address and location
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {/* Address Search Autocomplete */}
                                <div>
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
                                                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Search for your address..."
                                            />
                                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                        </div>

                                        {/* Suggestions Dropdown */}
                                        {showSuggestions && (
                                            <div
                                                ref={suggestionsRef}
                                                className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
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

                                {/* Get Location Button */}
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-medium text-gray-700">
                                        Or use current location
                                    </span>
                                    <button
                                        type="button"
                                        onClick={getCurrentLocation}
                                        disabled={isLoadingLocation}
                                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Navigation className="w-4 h-4" />
                                        <span>
                                            {isLoadingLocation
                                                ? "Getting Location..."
                                                : "Get Location"}
                                        </span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            House/Apartment Number
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="House/Apartment number"
                                        />
                                    </div>

                                    <div className="col-span-2">
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Street name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Area
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Area/Locality"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            City
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="City"
                                        />
                                    </div>

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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="State"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            PIN Code
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="PIN code"
                                            maxLength="6"
                                        />
                                    </div>

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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Latitude"
                                            readOnly
                                        />
                                    </div>

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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Longitude"
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end mt-8">
                    <button
                        type="submit"
                        disabled={saveLoading || loading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        {saveLoading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>

            {/* Verification Documents Modal */}
            {showVerificationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">
                                    Verification Documents
                                </h3>
                                <button
                                    onClick={() =>
                                        setShowVerificationModal(false)
                                    }
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Selfie Document */}
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                                        Selfie Photo
                                    </h4>
                                    {verificationDocs.selfie ? (
                                        <div className="flex flex-col items-center space-y-3">
                                            <img
                                                src={verificationDocs.selfie}
                                                alt="Selfie"
                                                className="w-48 h-48 rounded-lg object-cover border border-gray-300"
                                            />
                                            <button
                                                onClick={() =>
                                                    setEditingSelfie(true)
                                                }
                                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                                <span>Change Selfie</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                                            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-500 mb-3">
                                                No selfie uploaded
                                            </p>
                                            <button
                                                onClick={() =>
                                                    setEditingSelfie(true)
                                                }
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Upload Selfie
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Aadhar Document */}
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                                        Aadhar Document
                                    </h4>
                                    {verificationDocs.aadhar ? (
                                        <div className="flex flex-col items-center space-y-3">
                                            {verificationDocs.aadhar.endsWith(
                                                ".pdf"
                                            ) ? (
                                                <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <div className="text-center">
                                                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                                                            <span className="text-red-600 font-bold text-sm">
                                                                PDF
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600">
                                                            Aadhar Document
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <img
                                                    src={
                                                        verificationDocs.aadhar
                                                    }
                                                    alt="Aadhar"
                                                    className="w-48 h-48 rounded-lg object-cover border border-gray-300"
                                                />
                                            )}
                                            <a
                                                href={verificationDocs.aadhar}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 underline"
                                            >
                                                View Full Document
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                                            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-500">
                                                No Aadhar document uploaded
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Police Verification Document */}
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                                        Police Verification Document
                                    </h4>
                                    {verificationDocs.policeVerification ? (
                                        <div className="flex flex-col items-center space-y-3">
                                            {verificationDocs.policeVerification.endsWith(
                                                ".pdf"
                                            ) ? (
                                                <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <div className="text-center">
                                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                                                            <span className="text-blue-600 font-bold text-sm">
                                                                PDF
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600">
                                                            Police Verification
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <img
                                                    src={
                                                        verificationDocs.policeVerification
                                                    }
                                                    alt="Police Verification"
                                                    className="w-48 h-48 rounded-lg object-cover border border-gray-300"
                                                />
                                            )}
                                            <a
                                                href={
                                                    verificationDocs.policeVerification
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 underline"
                                            >
                                                View Full Document
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                                            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-gray-500">
                                                No police verification document
                                                uploaded
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
