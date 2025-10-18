import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMapPin,
  FiMap,
  FiSend,
  FiCrosshair,
  FiHome,
  FiSearch,
  FiCheck,
  FiX,
  FiNavigation,
  FiAlertCircle,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";

const ServiceAgentSetup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    houseNo: "",
    street: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    location: { type: "Point", coordinates: [0, 0], address: "" },
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [manualLocation, setManualLocation] = useState({
    latitude: "",
    longitude: "",
  });

  const cityInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Comprehensive list of Indian cities
  const cities = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune",
    "Ahmedabad", "Surat", "Jaipur", "Lucknow", "Chandigarh", "Indore", "Bhopal",
    "Coimbatore", "Kochi", "Visakhapatnam", "Nagpur", "Patna", "Guwahati",
    "Kanpur", "Agra", "Vadodara", "Thane", "Nashik", "Ranchi", "Dehradun",
    "Bhubaneswar", "Amritsar", "Ludhiana", "Aurangabad", "Raipur", "Jodhpur",
    "Gurgaon", "Noida", "Faridabad", "Ghaziabad",
  ].sort();

  // Indian states for dropdown
  const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  ].sort();

  // Filter cities based on search
  const filteredCities = cities.filter(city =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Click outside to close city dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        cityInputRef.current &&
        !cityInputRef.current.contains(event.target)
      ) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Geolocation detection with auto-fill
  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this device.");
      return;
    }

    setIsGettingLocation(true);
    const locationToast = toast.loading("🛰️ Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const addressData = await reverseGeocode(latitude, longitude);

          setFormData((prev) => ({
            ...prev,
            area: addressData.area || prev.area,
            city: addressData.city || prev.city,
            state: addressData.state || prev.state,
            pincode: addressData.postalCode || prev.pincode,
            location: {
              type: "Point",
              coordinates: [longitude, latitude],
              address: addressData.fullAddress,
            },
          }));
          

          setSearchQuery(addressData.city || "");
          setManualLocation({
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6),
          });

          setErrors((prev) => ({
            ...prev,
            city: "",
            state: "",
            pincode: "",
            area: "",
            location: "",
            latitude: "",
            longitude: "",
          }));

          setLocationDetected(true);
          toast.success(`📍 Auto-filled: ${addressData.area}, ${addressData.city}, ${addressData.state} (${addressData.postalCode})`, {
            id: locationToast,
          });
          
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          toast.error("📍 Location detected but couldn't fetch address details", {
            id: locationToast,
          });
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        toast.dismiss(locationToast);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("❌ Location access denied. Please allow location permissions.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("📍 Location information unavailable.");
            break;
          case error.TIMEOUT:
            toast.error("⏰ Location request timed out.");
            break;
          default:
            toast.error("❌ Unable to detect location.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Enhanced reverse geocoding function with auto-fill
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();
  
      // Smart fallback logic for Indian address extraction
      const addressData = {
        area: data.locality || data.cityDistrict || data.suburb || "",
        city:
          data.city ||
          data.locality ||
          data.principalSubdivision ||
          data.localityInfo?.administrative?.find((item) =>
            item.description.includes("city")
          )?.name ||
          "",
        state: data.principalSubdivision || "",
        postalCode:
          data.postcode ||
          data.localityInfo?.administrative?.find((item) =>
            item.description.includes("postal")
          )?.name ||
          "",
        fullAddress:
          `${data.locality || data.cityDistrict || ""}, ${data.city || ""}, ${data.principalSubdivision || ""} ${data.postcode || ""}`.trim() ||
          "Address not available",
      };
  
      return addressData;
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      return {
        area: "",
        city: "",
        state: "",
        postalCode: "",
        fullAddress: "Address not available",
      };
    }
  };
  

  // Manual location input
  const handleManualLocationSubmit = () => {
    const lat = parseFloat(manualLocation.latitude);
    const lng = parseFloat(manualLocation.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setErrors((prev) => ({
        ...prev,
        latitude: "Please enter a valid latitude.",
        longitude: "Please enter a valid longitude.",
      }));
      toast.error("Please enter valid latitude and longitude values.");
      return;
    }

    if (lat < -90 || lat > 90) {
      setErrors((prev) => ({ ...prev, latitude: "Latitude must be between -90 and 90." }));
      toast.error("Latitude must be between -90 and 90.");
      return;
    }

    if (lng < -180 || lng > 180) {
      setErrors((prev) => ({ ...prev, longitude: "Longitude must be between -180 and 180." }));
      toast.error("Longitude must be between -180 and 180.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      location: {
        type: "Point",
        coordinates: [lng, lat],
        address: "Manually entered coordinates",
      },
    }));
    setErrors((prev) => ({ ...prev, latitude: "", longitude: "", location: "" }));
    setLocationDetected(true);
    toast.success("📍 Manual location coordinates saved!");
  };

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // City input change handler
  const handleCityInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setFormData((prev) => ({ ...prev, city: value }));
    setErrors((prev) => ({ ...prev, city: "" }));
    setShowCityDropdown(true);
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    if (!formData.street.trim()) {
      newErrors.street = "Street address is required.";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required.";
    }
    if (!formData.state.trim()) {
      newErrors.state = "State is required.";
    }
    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required.";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Pincode must be a 6-digit number.";
    }
    if (!locationDetected) {
      newErrors.location = "Please detect or manually enter your location.";
    }
    return newErrors;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill all required fields correctly.");
      return;
    }

    try {
      setLoading(true);
      const submitToast = toast.loading("Saving your location details...");

      const payload = {
        houseNo: formData.houseNo,
        address: formData.street, // Maps to street in User.address
        area: formData.area,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        location: {
          type: formData.location.type,
          coordinates: formData.location.coordinates,
        },
      };

      const res = await axiosInstance.post("/api/service-agent/setup", payload);
      toast.success(res.data.message || "Setup completed successfully!", { id: submitToast });
      navigate("/serviceAgentDashboard");

      // Reset form
      setFormData({
        houseNo: "",
        street: "",
        area: "",
        city: "",
        state: "",
        pincode: "",
        location: { type: "Point", coordinates: [0, 0], address: "" },
      });
      setSearchQuery("");
      setLocationDetected(false);
      setManualLocation({ latitude: "", longitude: "" });
      setErrors({});
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to save details. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex justify-center items-center p-4 md:p-8">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: '#fff',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            fontSize: '14px',
            padding: '12px',
          },
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-8 w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
          >
            Service Agent Setup
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 text-sm"
          >
            Provide your address and location to start managing workers
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* House Number */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              House No. <span className="text-gray-400">(Optional)</span>
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl p-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
              <FiHome className="text-gray-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                name="houseNo"
                value={formData.houseNo}
                onChange={handleInputChange}
                placeholder="e.g., Flat 101"
                className="w-full outline-none text-gray-700 placeholder-gray-400"
              />
            </div>
            {errors.houseNo && (
              <p className="text-red-500 text-xs mt-1">{errors.houseNo}</p>
            )}
          </div>

          {/* Street */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Street Address *
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl p-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
              <FiHome className="text-gray-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                placeholder="e.g., Main Street"
                className="w-full outline-none text-gray-700 placeholder-gray-400"
                required
              />
            </div>
            {errors.street && (
              <p className="text-red-500 text-xs mt-1">{errors.street}</p>
            )}
          </div>

          {/* Area */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Area <span className="text-gray-400">(Optional)</span>
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl p-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
              <FiMapPin className="text-gray-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                placeholder="e.g., Andheri East"
                className="w-full outline-none text-gray-700 placeholder-gray-400"
              />
            </div>
            {errors.area && (
              <p className="text-red-500 text-xs mt-1">{errors.area}</p>
            )}
          </div>

          {/* City */}
          <div className="relative" ref={cityInputRef}>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              City *
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="city"
                value={searchQuery}
                onChange={handleCityInputChange}
                onFocus={() => setShowCityDropdown(true)}
                placeholder="Search for your city..."
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                required
              />
              {formData.city && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, city: "" }));
                    setSearchQuery("");
                    setErrors((prev) => ({ ...prev, city: "" }));
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX size={18} />
                </button>
              )}
            </div>
            <AnimatePresence>
              {showCityDropdown && filteredCities.length > 0 && (
                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                >
                  {filteredCities.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, city }));
                        setSearchQuery(city);
                        setShowCityDropdown(false);
                        setErrors((prev) => ({ ...prev, city: "" }));
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center justify-between"
                    >
                      <span className="text-gray-700">{city}</span>
                      {formData.city === city && <FiCheck className="text-blue-600" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            {errors.city && (
              <p className="text-red-500 text-xs mt-1">{errors.city}</p>
            )}
          </div>

          {/* State */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              State *
            </label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all appearance-none"
                required
              >
                <option value="" disabled>Select a state</option>
                {states.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            {errors.state && (
              <p className="text-red-500 text-xs mt-1">{errors.state}</p>
            )}
          </div>

          {/* Pincode */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Pincode *
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl p-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
              <FiMap className="text-gray-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                maxLength={6}
                name="pincode"
                value={formData.pincode}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, pincode: e.target.value.replace(/\D/g, '') }))
                }
                placeholder="Enter 6-digit pincode"
                className="w-full outline-none text-gray-700 placeholder-gray-400"
                required
              />
            </div>
            {errors.pincode && (
              <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>
            )}
          </div>

          {/* Location Detection Section */}
          <div className="space-y-4 pt-4">
            <motion.button
              type="button"
              whileHover={{ scale: isGettingLocation ? 1 : 1.02 }}
              whileTap={{ scale: isGettingLocation ? 1 : 0.98 }}
              onClick={handleDetectLocation}
              disabled={isGettingLocation}
              className={`w-full py-3.5 flex justify-center items-center gap-3 border-2 rounded-xl font-semibold transition-all duration-200 ${
                locationDetected
                  ? "border-green-500 text-green-600 bg-green-50"
                  : "border-blue-500 text-blue-600 hover:bg-blue-50"
              } ${isGettingLocation ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isGettingLocation ? (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiCrosshair className="w-5 h-5" />
              )}
              {isGettingLocation
                ? "Detecting Location..."
                : locationDetected
                ? "📍 Location Detected"
                : "Detect My Location (GPS)"}
            </motion.button>

            {/* Manual Location Input */}
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
              <label className="text-sm font-medium text-gray-700 mb-3 block flex items-center gap-2">
                <FiNavigation className="text-gray-400" />
                Or Enter Coordinates Manually
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="Latitude (-90 to 90)"
                    value={manualLocation.latitude}
                    onChange={(e) =>
                      setManualLocation((prev) => ({ ...prev, latitude: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
                  />
                  {errors.latitude && (
                    <p className="text-red-500 text-xs mt-1">{errors.latitude}</p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Longitude (-180 to 180)"
                    value={manualLocation.longitude}
                    onChange={(e) =>
                      setManualLocation((prev) => ({ ...prev, longitude: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
                  />
                  {errors.longitude && (
                    <p className="text-red-500 text-xs mt-1">{errors.longitude}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleManualLocationSubmit}
                className="w-full mt-3 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Save Manual Coordinates
              </button>
            </div>
          </div>

          {/* Location Status */}
          {locationDetected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
            >
              <FiCheck className="text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-green-800 text-sm font-medium">Location Ready</p>
                <p className="text-green-700 text-xs">
                  Coordinates: {formData.location.coordinates[1].toFixed(6)},{" "}
                  {formData.location.coordinates[0].toFixed(6)}
                </p>
                <p className="text-green-700 text-xs">{formData.location.address}</p>
              </div>
            </motion.div>
          )}
          {errors.location && (
            <p className="text-red-500 text-xs mt-1">{errors.location}</p>
          )}

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            disabled={loading || !locationDetected}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <FiSend className="w-5 h-5" />
            {loading ? "Saving..." : "Complete Setup"}
          </motion.button>
        </form>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200"
        >
          <p className="text-blue-700 text-xs text-center">
            💡 Your address and location help us assign nearby workers for verification. You can update these settings later.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ServiceAgentSetup;