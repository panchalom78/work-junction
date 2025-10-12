import React, { useState, useEffect } from "react";
import { User, MapPin, Navigation } from "lucide-react";
import { useAuthStore } from "../store/auth.store";

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

    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

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
        }
    }, [user]);

    // Fetch profile on component mount
    useEffect(() => {
        getUser();
    }, [getUser]);

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

                    // Reverse geocoding to get address details
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();

                    if (data.address) {
                        setFormData((prev) => ({
                            ...prev,
                            address: {
                                ...prev.address,
                                houseNo:
                                    data.address.house_number ||
                                    prev.address.houseNo,
                                street:
                                    data.address.road || prev.address.street,
                                area:
                                    data.address.suburb ||
                                    data.address.neighbourhood ||
                                    prev.address.area,
                                city:
                                    data.address.city ||
                                    data.address.town ||
                                    data.address.village ||
                                    prev.address.city,
                                state: data.address.state || prev.address.state,
                                pincode:
                                    data.address.postcode ||
                                    prev.address.pincode,
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

    const SettingSection = ({ title, icon: Icon, children, description }) => (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 m-0">
                        {title}
                    </h3>
                    {description && (
                        <p className="text-sm text-gray-600 mt-1">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            {children}
        </div>
    );

    if (loading && !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Profile Settings
                </h2>
                <p className="text-base text-gray-600">
                    Manage your personal information and address
                </p>
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
                        <SettingSection
                            title="Personal Information"
                            icon={User}
                            description="Update your basic personal details"
                        >
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
                        </SettingSection>
                    </div>

                    <div className="space-y-6">
                        {/* Address Information */}
                        <SettingSection
                            title="Address Information"
                            icon={MapPin}
                            description="Update your current address and location"
                        >
                            <div className="space-y-4">
                                {/* Get Location Button */}
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-medium text-gray-700">
                                        Use current location
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
                        </SettingSection>
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
        </div>
    );
};

export default Settings;
