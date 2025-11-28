import React, { useState, useEffect, useRef } from "react";
import { useVerificationStore } from "../store/verification.store.js";
import { useAuthStore } from "../store/auth.store.js";
import { useNavigate } from "react-router-dom";
import {
    MapPin,
    Navigation,
    Home,
    Loader2,
    CheckCircle,
    X,
    Camera,
    Upload,
    FileText,
} from "lucide-react";
import toast from "react-hot-toast";

const WorkerVerificationPage = () => {
    const navigate = useNavigate();
    const {
        status,
        loading,
        error,
        message,
        fetchStatus,
        uploadAllDocuments,
        deleteDocument,
    } = useVerificationStore();

    const { updateProfile, user, getUser } = useAuthStore();

    const [showRejectionDetails, setShowRejectionDetails] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(true);
    const [uploadedDocuments, setUploadedDocuments] = useState({
        aadhar: null,
        selfie: null,
        policeVerification: null,
    });
    const [addressData, setAddressData] = useState({
        street: "",
        area: "",
        city: "",
        state: "",
        pincode: "",
        landmark: "",
        coordinates: {
            latitude: null,
            longitude: null,
        },
    });
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [addressLoading, setAddressLoading] = useState(false);

    // Camera states for document upload
    const [cameraStream, setCameraStream] = useState(null);
    const [capturedSelfie, setCapturedSelfie] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Fetch verification status on component mount
    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    useEffect(() => {
        const navigateUser = async () => {
            const response = await getUser();
            console.log(response);
            if (response.success) {
                if (!response.user.isVerified) {
                    navigate("/otpVerification");
                } else {
                    if (response.user.role == "WORKER") {
                        if (
                            response.user?.workerProfile?.verification
                                ?.status == "APPROVED"
                        ) {
                            navigate("/worker");
                        } else {
                            navigate("/worker/verification");
                        }
                    } else if (response.user.role == "CUSTOMER") {
                        navigate("/customer");
                    } else if (response.user.role == "SERVICE_AGENT") {
                        navigate("/serviceAgentDashboard");
                    } else if (response.user.role == "ADMIN") {
                        navigate("/adminDashboard");
                    }
                }
            } else {
                navigate("/login");
            }
        };
        navigateUser();
    }, []);

    // Check if user already has address
    useEffect(() => {
        if (user?.address) {
            setAddressData({
                street: user.address.street || "",
                area: user.address.area || "",
                city: user.address.city || "",
                state: user.address.state || "",
                pincode: user.address.pincode || "",
                landmark: user.address.landmark || "",
                coordinates: user.address.coordinates || {
                    latitude: null,
                    longitude: null,
                },
            });
            if (user.address.street && user.address.city) {
                setShowAddressModal(false);
            }
        }
    }, [user]);

    // Navigate to worker landing page when verified
    useEffect(() => {
        if (status?.verificationStatus === "APPROVED") {
            const timer = setTimeout(() => {
                navigate("/worker");
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [status?.verificationStatus, navigate]);

    // Get current location using browser geolocation
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

                        setAddressData((prev) => ({
                            ...prev,
                            street:
                                data.localityInfo?.informative?.[0]?.name ||
                                data.locality ||
                                "",
                            area:
                                data.localityInfo?.informative?.[1]?.name ||
                                data.locality ||
                                "",
                            city:
                                data.city ||
                                data.locality ||
                                data.principalSubdivision ||
                                "",
                            state: data.principalSubdivision || "",
                            coordinates: {
                                latitude,
                                longitude,
                            },
                        }));
                    }
                } catch (error) {
                    console.error("Error getting location:", error);
                    setAddressData((prev) => ({
                        ...prev,
                        coordinates: {
                            latitude,
                            longitude,
                        },
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

    // Handle address input changes
    const handleAddressChange = (field, value) => {
        setAddressData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Validate address form
    const validateAddress = () => {
        const { street, area, city, state, pincode } = addressData;

        if (!street.trim()) {
            alert("Please enter your street address");
            return false;
        }
        if (!area.trim()) {
            alert("Please enter your area/locality");
            return false;
        }
        if (!city.trim()) {
            alert("Please enter your city");
            return false;
        }
        if (!state.trim()) {
            alert("Please enter your state");
            return false;
        }
        if (!pincode.trim() || pincode.length !== 6) {
            alert("Please enter a valid 6-digit pincode");
            return false;
        }

        return true;
    };

    // Save address to profile
    const handleSaveAddress = async () => {
        if (!validateAddress()) return;

        setAddressLoading(true);
        try {
            const response = await updateProfile({
                address: addressData,
            });

            if (response.success) {
                setShowAddressModal(false);
            } else {
                alert("Failed to save address. Please try again.");
            }
        } catch (error) {
            console.error("Error saving address:", error);
            alert("Failed to save address. Please try again.");
        } finally {
            setAddressLoading(false);
        }
    };

    // Document Upload Functions
    const handleDocumentUpload = (documentType, file) => {
        setUploadedDocuments((prev) => ({
            ...prev,
            [documentType]: file,
        }));
    };

    const handleSubmitDocuments = async () => {
        try {
            const allDocumentsUploaded =
                uploadedDocuments.aadhar && uploadedDocuments.selfie;

            if (!allDocumentsUploaded) {
                alert(
                    "Please upload both Aadhaar Card and Live Selfie documents"
                );
                return;
            }

            const formData = new FormData();
            formData.append("selfie", uploadedDocuments.selfie);
            formData.append("aadhar", uploadedDocuments.aadhar);
            if (uploadedDocuments.policeVerification) {
                formData.append(
                    "policeVerification",
                    uploadedDocuments.policeVerification
                );
            }

            const result = await uploadAllDocuments(formData);

            if (result.success) {
                setShowUploadModal(false);
                setUploadedDocuments({
                    aadhar: null,
                    selfie: null,
                    policeVerification: null,
                });
            }
        } catch (error) {
            toast.error(error.message || "Failed to upload documents");
        }
    };

    // Camera functions
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
            });
            setCameraStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera access denied:", err);
            alert(
                "Unable to access camera. Please grant permission and try again."
            );
        }
    };

    const captureSelfie = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        canvas.toBlob((blob) => {
            const file = new File([blob], "selfie.jpg", {
                type: "image/jpeg",
            });
            setCapturedSelfie(URL.createObjectURL(blob));
            handleDocumentUpload("selfie", file);
        }, "image/jpeg");
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach((track) => track.stop());
        }
        setCameraStream(null);
    };

    // Start camera when upload modal opens
    useEffect(() => {
        if (showUploadModal) {
            startCamera();
        }
        return () => {
            if (showUploadModal) {
                stopCamera();
            }
        };
    }, [showUploadModal]);

    // Map backend status to UI status
    const getCurrentStatus = () => {
        if (!status) return "unverified";
        switch (status.verificationStatus) {
            case "VERIFIED":
                return "verified";
            case "PENDING":
                return "pending";
            case "REJECTED":
                return "rejected";
            default:
                return "unverified";
        }
    };

    const currentStatus = getCurrentStatus();

    // Get status data based on current verification status
    const getStatusData = () => {
        const baseData = {
            unverified: {
                status: "Unverified",
                description:
                    "Please upload required documents to start verification",
                icon: "⏳",
                color: "gray",
                actions: ["upload_documents"],
            },
            pending: {
                status: "Pending Review",
                description:
                    "Your documents are under review by our verification team",
                icon: "🔍",
                color: "purple",
                actions: ["view_details"],
            },
            verified: {
                status: "Verified",
                description: "Your account has been successfully verified",
                icon: "✅",
                color: "green",
                actions: ["view_certificate"],
            },
            rejected: {
                status: "Rejected",
                description:
                    "Your verification request requires additional information",
                icon: "❌",
                color: "red",
                actions: ["resubmit"],
            },
        };

        return baseData[currentStatus];
    };

    const statusData = getStatusData();

    const getStatusColor = (color) => {
        const colors = {
            green: "bg-green-100 text-green-800 border-green-200",
            purple: "bg-purple-100 text-purple-800 border-purple-200",
            red: "bg-red-100 text-red-800 border-red-200",
            gray: "bg-gray-100 text-gray-800 border-gray-200",
        };
        return colors[color] || colors.gray;
    };

    const getStatusSteps = () => {
        const steps = [
            { id: 1, name: "Address Setup", status: "pending" },
            { id: 2, name: "Document Upload", status: "pending" },
            { id: 3, name: "Under Review", status: "pending" },
            { id: 4, name: "Verification Complete", status: "pending" },
        ];

        const hasAddress = user?.address?.street && user?.address?.city;

        if (!hasAddress) {
            steps[0].status = "current";
            steps[1].status = "pending";
            steps[2].status = "pending";
            steps[3].status = "pending";
        } else if (currentStatus === "unverified") {
            steps[0].status = "complete";
            steps[1].status = "current";
            steps[2].status = "pending";
            steps[3].status = "pending";
        } else if (currentStatus === "pending") {
            steps[0].status = "complete";
            steps[1].status = "complete";
            steps[2].status = "current";
            steps[3].status = "pending";
        } else if (currentStatus === "verified") {
            steps[0].status = "complete";
            steps[1].status = "complete";
            steps[2].status = "complete";
            steps[3].status = "complete";
        } else if (currentStatus === "rejected") {
            steps[0].status = "complete";
            steps[1].status = "complete";
            steps[2].status = "complete";
            steps[3].status = "error";
        }

        return steps;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getVerificationHistory = () => {
        if (!status) return [];

        const history = [];

        if (status.documentsUploadedAt) {
            history.push({
                action: "Documents Uploaded",
                timestamp: status.documentsUploadedAt,
                by: "You",
                details: "All required documents submitted",
            });
        }

        if (status.verificationStatus === "VERIFIED" && status.verifiedAt) {
            history.push({
                action: "Verification Approved",
                timestamp: status.verifiedAt,
                by: status.verifiedBy?.name || "Verification Agent",
                details: "All documents verified successfully",
            });
        }

        if (status.verificationStatus === "REJECTED" && status.rejectedAt) {
            history.push({
                action: "Verification Rejected",
                timestamp: status.rejectedAt,
                by: status.rejectedBy?.name || "Verification Agent",
                details:
                    status.rejectionReason || "Additional information required",
                rejectionReason: status.rejectionReason,
            });
        }

        return history;
    };

    const StatusStep = ({ step, isLast }) => {
        const getStepColor = (status) => {
            switch (status) {
                case "complete":
                    return "bg-purple-500";
                case "current":
                    return "bg-purple-300";
                case "error":
                    return "bg-red-500";
                default:
                    return "bg-gray-300";
            }
        };

        const getTextColor = (status) => {
            switch (status) {
                case "complete":
                    return "text-purple-600";
                case "current":
                    return "text-purple-700";
                case "error":
                    return "text-red-600";
                default:
                    return "text-gray-500";
            }
        };

        return (
            <div className="flex items-center flex-1">
                <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${getStepColor(
                        step.status
                    )} text-white font-semibold`}
                >
                    {step.status === "complete"
                        ? "✓"
                        : step.status === "error"
                        ? "✕"
                        : step.id}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                    <div
                        className={`text-sm font-medium ${getTextColor(
                            step.status
                        )}`}
                    >
                        {step.name}
                    </div>
                </div>
                {!isLast && (
                    <div
                        className={`flex-1 h-1 mx-4 ${
                            step.status === "complete"
                                ? "bg-purple-500"
                                : "bg-gray-200"
                        }`}
                    />
                )}
            </div>
        );
    };

    if (loading && !status) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">
                        Loading verification status...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl text-purple-600">🔒</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Identity Verification
                    </h1>
                    <p className="text-lg text-purple-600 font-medium">
                        Track your verification status
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Success Message */}
                {message && !error && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <p className="text-green-800">{message}</p>
                    </div>
                )}

                {/* Address Status Card */}
                {user?.address?.street && (
                    <div className="bg-white rounded-2xl shadow-lg border-0 p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <Home className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Service Address Added
                                    </h3>
                                    <p className="text-gray-600">
                                        {user.address.street},{" "}
                                        {user.address.area}, {user.address.city}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAddressModal(true)}
                                className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                            >
                                <MapPin className="w-4 h-4" />
                                <span>Edit Address</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Status Card */}
                <div className="bg-white rounded-2xl shadow-lg border-0 p-8 mb-8 transform hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <div
                                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                                    currentStatus === "verified"
                                        ? "bg-green-100"
                                        : currentStatus === "pending"
                                        ? "bg-purple-100"
                                        : currentStatus === "rejected"
                                        ? "bg-red-100"
                                        : "bg-gray-100"
                                }`}
                            >
                                <span className="text-2xl">
                                    {statusData.icon}
                                </span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Verification Status
                                </h2>
                                <p className="text-gray-600 mt-1">
                                    {statusData.description}
                                </p>
                            </div>
                        </div>
                        <span
                            className={`px-6 py-3 rounded-full font-semibold border-2 ${getStatusColor(
                                statusData.color
                            )}`}
                        >
                            {statusData.status.toUpperCase()}
                        </span>
                    </div>

                    {/* Progress Steps */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Verification Progress
                            </h3>
                        </div>
                        <div className="flex items-center space-x-2">
                            {getStatusSteps().map((step, index) => (
                                <StatusStep
                                    key={step.id}
                                    step={step}
                                    isLast={
                                        index === getStatusSteps().length - 1
                                    }
                                />
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4">
                        {!user?.address?.street && (
                            <button
                                onClick={() => setShowAddressModal(true)}
                                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform flex items-center space-x-2"
                            >
                                <Home className="w-4 h-4" />
                                <span>Add Address First</span>
                            </button>
                        )}
                        {statusData.actions.includes("upload_documents") &&
                            user?.address?.street && (
                                <button
                                    onClick={() => setShowUploadModal(true)}
                                    disabled={loading}
                                    className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform disabled:opacity-50 flex items-center space-x-2"
                                >
                                    <Upload className="w-4 h-4" />
                                    <span>Upload Documents</span>
                                </button>
                            )}
                        {statusData.actions.includes("resubmit") &&
                            user?.address?.street && (
                                <button
                                    onClick={() => setShowUploadModal(true)}
                                    disabled={loading}
                                    className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform disabled:opacity-50 flex items-center space-x-2"
                                >
                                    <FileText className="w-4 h-4" />
                                    <span>Resubmit Documents</span>
                                </button>
                            )}
                        {/* {statusData.actions.includes("view_details") && (
                            <button className="bg-white text-purple-600 border-2 border-purple-200 px-8 py-3 rounded-lg hover:bg-purple-50 transition-colors font-semibold flex items-center space-x-2">
                                <FileText className="w-4 h-4" />
                                <span>View Details</span>
                            </button>
                        )} */}
                        {statusData.actions.includes("view_certificate") && (
                            <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform flex items-center space-x-2">
                                <FileText className="w-4 h-4" />
                                <span>Download Certificate</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Status-specific Cards */}
                {currentStatus === "verified" && status && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-100 border border-green-200 rounded-2xl p-6 mb-8">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl text-green-600">
                                    🎉
                                </span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-green-900">
                                    Verification Successful!
                                </h3>
                                <p className="text-green-700">
                                    Your account is now fully verified and
                                    active
                                </p>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div className="bg-white rounded-lg p-3 shadow-sm">
                                <span className="font-semibold text-green-800">
                                    Verified On:
                                </span>
                                <p className="text-green-700">
                                    {formatDate(status.verifiedAt)}
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-3 shadow-sm">
                                <span className="font-semibold text-green-800">
                                    Approved By:
                                </span>
                                <p className="text-green-700">
                                    {status.verifiedBy?.name ||
                                        "Verification Agent"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {currentStatus === "pending" && (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-100 border border-purple-200 rounded-2xl p-6 mb-8">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <span className="text-2xl text-purple-600">
                                    ⏳
                                </span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-purple-900">
                                    Under Review
                                </h3>
                                <p className="text-purple-700">
                                    Your documents are being verified by our
                                    team
                                </p>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-purple-800 font-medium">
                                Estimated completion:{" "}
                                <span className="text-purple-600">
                                    24-48 hours
                                </span>
                            </p>
                        </div>
                    </div>
                )}

                {currentStatus === "rejected" && status && (
                    <div className="bg-gradient-to-r from-red-50 to-pink-100 border border-red-200 rounded-2xl p-6 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <span className="text-2xl text-red-600">
                                        ⚠️
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-red-900">
                                        Verification Required
                                    </h3>
                                    <p className="text-red-700">
                                        Additional information needed
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() =>
                                    setShowRejectionDetails(
                                        !showRejectionDetails
                                    )
                                }
                                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors font-medium"
                            >
                                {showRejectionDetails
                                    ? "Hide Details"
                                    : "View Details"}
                            </button>
                        </div>

                        {showRejectionDetails && (
                            <div className="space-y-4 bg-white rounded-lg p-4 shadow-sm">
                                <div>
                                    <span className="font-semibold text-red-800">
                                        Rejection Reason:
                                    </span>
                                    <p className="text-red-700 mt-2 p-3 bg-red-50 rounded-lg">
                                        {status.rejectionReason ||
                                            "Additional information required"}
                                    </p>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div className="bg-red-50 rounded-lg p-3">
                                        <span className="font-semibold text-red-800">
                                            Rejected On:
                                        </span>
                                        <p className="text-red-700">
                                            {formatDate(status.rejectedAt)}
                                        </p>
                                    </div>
                                    <div className="bg-red-50 rounded-lg p-3">
                                        <span className="font-semibold text-red-800">
                                            Reviewed By:
                                        </span>
                                        <p className="text-red-700">
                                            {status.rejectedBy?.name ||
                                                "Verification Agent"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Activity Timeline */}
                {/* <div className="bg-white rounded-2xl shadow-lg border-0 p-8">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600">📋</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">
                            Verification Timeline
                        </h3>
                    </div>

                    <div className="space-y-6">
                        {getVerificationHistory().length > 0 ? (
                            getVerificationHistory().map((event, index) => (
                                <div
                                    key={index}
                                    className="flex space-x-4 relative"
                                >
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-4 h-4 rounded-full ${
                                                event.action.includes(
                                                    "Rejected"
                                                )
                                                    ? "bg-red-500"
                                                    : event.action.includes(
                                                          "Approved"
                                                      )
                                                    ? "bg-green-500"
                                                    : "bg-purple-500"
                                            }`}
                                        ></div>
                                        {index <
                                            getVerificationHistory().length -
                                                1 && (
                                            <div className="w-0.5 h-full bg-gray-200 mt-2 absolute top-4 left-2"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 pb-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-semibold text-gray-900 text-lg">
                                                {event.action}
                                            </span>
                                            <span className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                                                {formatDate(event.timestamp)}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-2">
                                            By: {event.by}
                                        </p>
                                        {event.details && (
                                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                                                {event.details}
                                            </p>
                                        )}
                                        {event.rejectionReason && (
                                            <p className="text-red-600 bg-red-50 p-3 rounded-lg mt-2">
                                                {event.rejectionReason}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-2xl text-gray-400">
                                        📝
                                    </span>
                                </div>
                                <p className="text-gray-500">
                                    No verification activity yet
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                    Start by uploading your documents
                                </p>
                            </div>
                        )}
                    </div>
                </div> */}
            </div>

            {/* Address Collection Modal */}
            {showAddressModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    Add Your Service Address
                                </h3>
                                <p className="text-gray-600 text-sm mt-1">
                                    This address will be used for service
                                    verification and customer bookings
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    if (!user?.address?.street) {
                                        alert(
                                            "Address is required to continue with verification"
                                        );
                                        return;
                                    }
                                    setShowAddressModal(false);
                                }}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Current Location Button */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Navigation className="w-6 h-6 text-blue-600" />
                                        <div>
                                            <h4 className="font-semibold text-blue-900">
                                                Use Current Location
                                            </h4>
                                            <p className="text-blue-700 text-sm">
                                                Automatically fill address using
                                                your current location
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={getCurrentLocation}
                                        disabled={isGettingLocation}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center space-x-2"
                                    >
                                        {isGettingLocation ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <MapPin className="w-4 h-4" />
                                        )}
                                        <span>
                                            {isGettingLocation
                                                ? "Detecting..."
                                                : "Get Location"}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* Address Form */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Street Address *
                                        </label>
                                        <input
                                            type="text"
                                            value={addressData.street}
                                            onChange={(e) =>
                                                handleAddressChange(
                                                    "street",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="House no., Building, Street"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Area/Locality *
                                        </label>
                                        <input
                                            type="text"
                                            value={addressData.area}
                                            onChange={(e) =>
                                                handleAddressChange(
                                                    "area",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Area or Locality name"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            value={addressData.city}
                                            onChange={(e) =>
                                                handleAddressChange(
                                                    "city",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="City"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            State *
                                        </label>
                                        <input
                                            type="text"
                                            value={addressData.state}
                                            onChange={(e) =>
                                                handleAddressChange(
                                                    "state",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="State"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pincode *
                                        </label>
                                        <input
                                            type="text"
                                            value={addressData.pincode}
                                            onChange={(e) => {
                                                const value = e.target.value
                                                    .replace(/\D/g, "")
                                                    .slice(0, 6);
                                                handleAddressChange(
                                                    "pincode",
                                                    value
                                                );
                                            }}
                                            placeholder="6-digit pincode"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                                            maxLength={6}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Landmark (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={addressData.landmark}
                                            onChange={(e) =>
                                                handleAddressChange(
                                                    "landmark",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Nearby landmark"
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Location Status */}
                            {addressData.coordinates.latitude && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <div className="flex items-center space-x-2 text-green-800">
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="text-sm font-medium">
                                            Location captured:{" "}
                                            {addressData.coordinates?.latitude},{" "}
                                            {addressData.coordinates?.longitude}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => {
                                        if (!user?.address?.street) {
                                            alert(
                                                "Address is required to continue with verification"
                                            );
                                            return;
                                        }
                                        setShowAddressModal(false);
                                    }}
                                    className="flex-1 bg-white text-gray-700 border-2 border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                                >
                                    {user?.address?.street ? "Skip" : "Cancel"}
                                </button>
                                <button
                                    onClick={handleSaveAddress}
                                    disabled={addressLoading}
                                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    {addressLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Home className="w-4 h-4" />
                                    )}
                                    <span>
                                        {addressLoading
                                            ? "Saving..."
                                            : "Save Address & Continue"}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">
                                Upload Verification Documents
                            </h3>
                            <button
                                onClick={() => {
                                    stopCamera();
                                    setShowUploadModal(false);
                                }}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Aadhaar Card Upload */}
                            <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">
                                            Aadhaar Card{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Front and back copy of your Aadhaar
                                            card
                                        </p>
                                    </div>
                                    {uploadedDocuments.aadhar && (
                                        <span className="text-green-600 text-sm font-medium">
                                            ✓ Uploaded
                                        </span>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) =>
                                        handleDocumentUpload(
                                            "aadhar",
                                            e.target.files[0]
                                        )
                                    }
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                />
                                {uploadedDocuments.aadhar && (
                                    <p className="text-sm text-gray-600 mt-2">
                                        Selected:{" "}
                                        {uploadedDocuments.aadhar.name}
                                    </p>
                                )}
                            </div>

                            {/* Live Selfie Section */}
                            <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors">
                                <h4 className="font-semibold text-gray-900 mb-2">
                                    Live Selfie Capture{" "}
                                    <span className="text-red-500">*</span>
                                </h4>
                                <div className="relative flex flex-col items-center space-y-3">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        className="rounded-lg w-full max-w-sm border border-gray-200"
                                    />
                                    <canvas ref={canvasRef} hidden />
                                    <div className="flex space-x-4">
                                        <button
                                            onClick={captureSelfie}
                                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center space-x-2"
                                        >
                                            <Camera className="w-4 h-4" />
                                            <span>Capture</span>
                                        </button>
                                        <button
                                            onClick={stopCamera}
                                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition flex items-center space-x-2"
                                        >
                                            <X className="w-4 h-4" />
                                            <span>Stop Camera</span>
                                        </button>
                                    </div>
                                    {capturedSelfie && (
                                        <div className="mt-3 text-center">
                                            <p className="text-sm text-gray-600 mb-2">
                                                Preview:
                                            </p>
                                            <img
                                                src={capturedSelfie}
                                                alt="Captured Selfie"
                                                className="rounded-lg border border-gray-300 w-40 h-40 object-cover"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Police Verification Upload */}
                            <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">
                                            Police Verification Certificate
                                            (Optional)
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            Police verification certificate if
                                            available
                                        </p>
                                    </div>
                                    {uploadedDocuments.policeVerification && (
                                        <span className="text-green-600 text-sm font-medium">
                                            ✓ Uploaded
                                        </span>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) =>
                                        handleDocumentUpload(
                                            "policeVerification",
                                            e.target.files[0]
                                        )
                                    }
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                />
                                {uploadedDocuments.policeVerification && (
                                    <p className="text-sm text-gray-600 mt-2">
                                        Selected:{" "}
                                        {
                                            uploadedDocuments.policeVerification
                                                .name
                                        }
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => {
                                        stopCamera();
                                        setShowUploadModal(false);
                                    }}
                                    disabled={loading}
                                    className="flex-1 bg-white text-gray-700 border-2 border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitDocuments}
                                    disabled={loading}
                                    className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Upload className="w-4 h-4" />
                                    )}
                                    <span>
                                        {loading
                                            ? "Uploading..."
                                            : "Submit for Verification"}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkerVerificationPage;
