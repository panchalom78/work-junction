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
  FiAlertCircle
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import axiosInstance from "../utils/axiosInstance"; // Pre-configured axios instance

const ServiceAgentSetup = () => {
  const [formData, setFormData] = useState({
    city: "",
    address: "",
    pincode: "",
    preferredAreas: [],
    location: { 
      type: "Point", 
      coordinates: [0, 0],
      address: ""
    },
  });

  const [availableAreas, setAvailableAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [manualLocation, setManualLocation] = useState({
    latitude: "",
    longitude: ""
  });

  const cityInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // 🏙️ Comprehensive list of Indian cities and their areas
  const cityAreas = {
    "Mumbai": ["Andheri East", "Bandra West", "Powai", "Borivali", "Malad", "Juhu", "Santacruz", "Dadar", "Colaba", "Worli"],
    "Delhi": ["Rohini", "Saket", "Lajpat Nagar", "Dwarka", "Karol Bagh", "Connaught Place", "Hauz Khas", "Rajouri Garden", "Pitampura"],
    "Bangalore": ["Koramangala", "Indiranagar", "Whitefield", "MG Road", "Jayanagar", "HSR Layout", "Marathahalli", "Electronic City"],
    "Hyderabad": ["Banjara Hills", "Jubilee Hills", "Gachibowli", "Hitech City", "Secunderabad", "Madhapur", "Kondapur"],
    "Chennai": ["T Nagar", "Anna Nagar", "Adyar", "Velachery", "Porur", "OMR", "Guindy"],
    "Kolkata": ["Salt Lake", "Park Street", "New Town", "Howrah", "Dum Dum", "Rashbehari"],
    "Pune": ["Kothrud", "Hinjewadi", "Viman Nagar", "Baner", "Aundh", "Kharadi", "Wakad"],
    "Ahmedabad": ["Maninagar", "CG Road", "Navrangpura", "Vastrapur", "Satellite", "Bodakdev", "Prahlad Nagar"],
    "Surat": ["Adajan", "Vesu", "Katargam", "Athwa", "Varachha", "Pal", "City Light"],
    "Jaipur": ["Malviya Nagar", "Vaishali Nagar", "Bani Park", "C Scheme", "Raja Park", "Tonk Road"],
    "Lucknow": ["Gomti Nagar", "Hazratganj", "Aliganj", "Indira Nagar", "Chowk"],
    "Chandigarh": ["Sector 17", "Sector 34", "Sector 35", "Manimajra", "Industrial Area"],
    "Indore": ["Vijay Nagar", "Rau", "Scheme 54", "Bhawarkua", "Rajendra Nagar"],
    "Bhopal": ["Arera Colony", "MP Nagar", "Shahpura", "Kolar Road", "Habibganj"],
    "Coimbatore": ["RS Puram", "Saibaba Colony", "Peelamedu", "Gandhipuram", "Singanallur"],
    "Kochi": ["Marine Drive", "Panampilly Nagar", "Kadavanthra", "Edapally", "Vyttila"],
    "Visakhapatnam": ["Dwaraka Nagar", "MVP Colony", "Gajuwaka", "Madhurawada", "Rushikonda"],
    "Nagpur": ["Sitabuldi", "Dharampeth", "Manish Nagar", "Wardha Road", "Koradi"],
    "Patna": ["Boring Road", "Kankarbagh", "Rajendra Nagar", "Exhibition Road", "Fraser Road"],
    "Guwahati": ["GS Road", "Beltola", "Zoo Road", "Maligaon", "Paltan Bazar"]
  };

  // 🌆 Filter cities based on search
  const filteredCities = Object.keys(cityAreas).filter(city =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 🌆 Load preferred areas dynamically when city changes
  useEffect(() => {
    if (formData.city && cityAreas[formData.city]) {
      setAvailableAreas(cityAreas[formData.city]);
    } else {
      setAvailableAreas([]);
    }
  }, [formData.city]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          cityInputRef.current && !cityInputRef.current.contains(event.target)) {
        setShowCityDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🧭 Enhanced GPS location detection with reverse geocoding
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
          
          // Get address from coordinates (reverse geocoding)
          const address = await reverseGeocode(latitude, longitude);
          
          setFormData((prev) => ({
            ...prev,
            location: { 
              type: "Point", 
              coordinates: [longitude, latitude],
              address: address
            },
          }));
          
          setManualLocation({
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6)
          });
          
          setLocationDetected(true);
          toast.success(`📍 Location detected! ${address}`, { id: locationToast });
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          toast.error("📍 Location detected but couldn't fetch address details", { id: locationToast });
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        toast.dismiss(locationToast);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("❌ Location access denied. Please allow location permissions in your browser settings.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("📍 Location information unavailable. Please check your GPS connection.");
            break;
          case error.TIMEOUT:
            toast.error("⏰ Location request timed out. Please try again.");
            break;
          default:
            toast.error("❌ Unable to detect location. Please try manual entry.");
        }
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 60000 
      }
    );
  };

  // Reverse geocoding function
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();
      return data.locality || data.city || "Address not available";
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      return "Address not available";
    }
  };

  // Manual location input
  const handleManualLocationSubmit = () => {
    const lat = parseFloat(manualLocation.latitude);
    const lng = parseFloat(manualLocation.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      toast.error("Please enter valid latitude and longitude values.");
      return;
    }
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error("Please enter valid coordinates: Latitude (-90 to 90), Longitude (-180 to 180)");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      location: { 
        type: "Point", 
        coordinates: [lng, lat],
        address: "Manually entered coordinates"
      },
    }));
    setLocationDetected(true);
    toast.success("📍 Manual location coordinates saved!");
  };

  // ✅ Preferred area select (max 4)
  const handleAreaSelect = (area) => {
    setFormData((prev) => {
      const alreadySelected = prev.preferredAreas.includes(area);
      if (alreadySelected) {
        toast.success(`Removed ${area} from preferred areas`);
        return {
          ...prev,
          preferredAreas: prev.preferredAreas.filter((a) => a !== area),
        };
      } else if (prev.preferredAreas.length < 4) {
        toast.success(`Added ${area} to preferred areas`);
        return { ...prev, preferredAreas: [...prev.preferredAreas, area] };
      } else {
        toast.error("You can select up to 4 preferred areas only. Remove one to add another.");
        return prev;
      }
    });
  };

  // 🚀 Submit form data
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.city || !formData.address || !formData.pincode) {
      toast.error("Please fill all required fields.");
      return;
    }
    if (!formData.preferredAreas.length) {
      toast.error("Please select at least one preferred area.");
      return;
    }
    if (!/^\d{6}$/.test(formData.pincode)) {
      toast.error("Please enter a valid 6-digit pincode.");
      return;
    }
    if (!locationDetected) {
      toast.error("Please detect or manually enter your location.");
      return;
    }

    try {
      setLoading(true);
      const submitToast = toast.loading("Saving your location details...");

      // Axios request to backend
      const res = await axiosInstance.post("/api/service-agent/setup", formData);
      toast.success(res.data.message, { id: submitToast });
      navigate("/serviceAgentDashboard");

      // Reset form
      setFormData({
        city: "",
        address: "",
        pincode: "",
        preferredAreas: [],
        location: { type: "Point", coordinates: [0, 0], address: "" },
      });
      setLocationDetected(false);
      setManualLocation({ latitude: "", longitude: "" });
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
          },
        }}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-8 w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h2 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2"
          >
            Service Area Setup
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 text-sm"
          >
            Set your service areas and location to start managing workers
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* City Selection with Search */}
          <div className="relative" ref={cityInputRef}>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              City *
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowCityDropdown(true);
                }}
                onFocus={() => setShowCityDropdown(true)}
                placeholder="Search for your city..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
              />
              {formData.city && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, city: "" }));
                    setSearchQuery("");
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
                        setFormData(prev => ({ ...prev, city }));
                        setSearchQuery(city);
                        setShowCityDropdown(false);
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
          </div>

          {/* Address */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Full Address *
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl p-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all">
              <FiHome className="text-gray-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
                placeholder="Flat no, building, road name, area..."
                className="w-full outline-none text-gray-700 placeholder-gray-400"
                required
              />
            </div>
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
                value={formData.pincode}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, pincode: e.target.value.replace(/\D/g, '') }))
                }
                placeholder="Enter 6-digit pincode"
                className="w-full outline-none text-gray-700 placeholder-gray-400"
                required
              />
            </div>
          </div>

          {/* Preferred Areas */}
          {availableAreas.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3"
            >
              <label className="text-sm font-medium text-gray-700 flex justify-between items-center">
                Preferred Areas (max 4)
                <span className="text-xs text-gray-500 font-normal">
                  {formData.preferredAreas.length}/4 selected
                </span>
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                {availableAreas.map((area) => (
                  <motion.div
                    key={area}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAreaSelect(area)}
                    className={`p-3 rounded-xl cursor-pointer text-center text-sm font-medium border-2 transition-all duration-200 flex items-center justify-center gap-2 ${
                      formData.preferredAreas.includes(area)
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg"
                        : "bg-gray-50 hover:bg-blue-50 border-gray-200 text-gray-700 hover:border-blue-300"
                    }`}
                  >
                    {formData.preferredAreas.includes(area) && (
                      <FiCheck className="w-4 h-4" />
                    )}
                    {area}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Location Detection Section */}
          <div className="space-y-4 pt-4">
            {/* GPS Location Detection */}
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
              {isGettingLocation ? "Detecting Location..." : 
               locationDetected ? "📍 Location Detected" : "Detect My Location (GPS)"}
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
                    placeholder="Latitude"
                    value={manualLocation.latitude}
                    onChange={(e) => setManualLocation(prev => ({ ...prev, latitude: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Longitude"
                    value={manualLocation.longitude}
                    onChange={(e) => setManualLocation(prev => ({ ...prev, longitude: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500"
                  />
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
                  Coordinates: {formData.location.coordinates[1].toFixed(6)}, {formData.location.coordinates[0].toFixed(6)}
                </p>
              </div>
            </motion.div>
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
            💡 Your location helps us assign nearby workers for verification. You can update these settings later.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ServiceAgentSetup;