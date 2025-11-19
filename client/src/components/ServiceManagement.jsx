import React, { useState, useEffect } from "react";
import {
    Plus,
    Edit3,
    Trash2,
    Briefcase,
    Loader2,
    AlertCircle,
    ChevronDown,
    Clock,
    Save,
    X,
    Image,
    Upload,
    Eye,
} from "lucide-react";
import axiosInstance from "../utils/axiosInstance";

const WorkerServiceManagement = ({ onShowServiceModal }) => {
    const [services, setServices] = useState([]);
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [showSkillDropdown, setShowSkillDropdown] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [savingServiceId, setSavingServiceId] = useState(null);
    const [serviceDetails, setServiceDetails] = useState({
        price: "",
        pricingType: "FIXED",
        description: "",
        estimatedDuration: "1 hour",
    });
    const [editForm, setEditForm] = useState({
        price: "",
        pricingType: "FIXED",
        description: "",
        estimatedDuration: "",
    });
    const [uploadingImages, setUploadingImages] = useState({});
    const [imageCaptions, setImageCaptions] = useState({});
    const [previewImage, setPreviewImage] = useState(null);

    // Fetch all skills and worker services
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch all skills with their services
                const skillsResponse = await axiosInstance.get("/api/skills");
                setSkills(skillsResponse.data.data || []);

                // Fetch worker's existing services
                await fetchWorkerServices();
            } catch (err) {
                console.error("Error fetching data:", err);
                setError(
                    err.response?.data?.message ||
                        "Failed to fetch data. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Fetch worker services separately
    const fetchWorkerServices = async () => {
        try {
            const servicesResponse = await axiosInstance.get(
                "/api/worker/services"
            );
            setServices(servicesResponse.data.data || []);
        } catch (err) {
            console.error("Error fetching worker services:", err);
            setError("Failed to load your services");
        }
    };

    // Get services for selected skill
    const getServicesForSelectedSkill = () => {
        if (!selectedSkill) return [];
        const skill = skills.find((s) => s._id === selectedSkill);
        return skill?.services || [];
    };

    // Handle skill selection
    const handleSkillSelect = (skillId) => {
        setSelectedSkill(skillId);
        setSelectedService(null);
        setShowSkillDropdown(false);
        setServiceDetails((prev) => ({
            ...prev,
            description: "",
            estimatedDuration: "1 hour",
        }));
    };

    // Handle service selection
    const handleServiceSelect = (service) => {
        setSelectedService(service);
        setServiceDetails((prev) => ({
            ...prev,
            description: `Professional ${service.name} service. I provide high-quality work with attention to detail and customer satisfaction.`,
            estimatedDuration: service.name.toLowerCase().includes("cleaning")
                ? "2-3 hours"
                : service.name.toLowerCase().includes("repair")
                ? "1-2 hours"
                : "1 hour",
        }));
    };

    // Add new service to worker profile
    const handleAddService = async () => {
        if (!selectedSkill || !selectedService) {
            setError("Please select both skill and service");
            return;
        }

        if (!serviceDetails.price || serviceDetails.price <= 0) {
            setError("Please enter a valid price");
            return;
        }

        if (!serviceDetails.description.trim()) {
            setError("Please enter a service description");
            return;
        }

        try {
            setLoading(true);
            const serviceData = {
                skillId: selectedSkill,
                serviceId: selectedService.serviceId,
                details: serviceDetails.description,
                pricingType: serviceDetails.pricingType,
                price: parseFloat(serviceDetails.price),
                estimatedDuration: serviceDetails.estimatedDuration,
            };

            const response = await axiosInstance.post(
                "/api/worker/services",
                serviceData
            );

            // Add the new service to local state
            setServices((prev) => [response.data.data, ...prev]);

            // Reset form
            setSelectedSkill(null);
            setSelectedService(null);
            setServiceDetails({
                price: "",
                pricingType: "FIXED",
                description: "",
                estimatedDuration: "1 hour",
            });

            setError(null);
        } catch (err) {
            console.error("Error adding service:", err);
            setError(err.response?.data?.message || "Failed to add service");
        } finally {
            setLoading(false);
        }
    };

    // Update service
    // Update service
    const handleUpdateService = async (serviceId, updates) => {
        try {
            setSavingServiceId(serviceId); // Set saving state

            const response = await axiosInstance.put(
                `/api/worker/services/${serviceId}`,
                updates
            );

            setServices((prev) =>
                prev.map((service) =>
                    service._id === serviceId
                        ? { ...service, ...response.data.data }
                        : service
                )
            );

            // Exit edit mode and reset saving state on success
            setEditingId(null);
            setSavingServiceId(null);
            setEditForm({
                price: "",
                pricingType: "FIXED",
                description: "",
                estimatedDuration: "",
            });
        } catch (err) {
            console.error("Error updating service:", err);
            setError(err.response?.data?.message || "Failed to update service");
            // Reset saving state but keep edit mode open for corrections
            setSavingServiceId(null);
        }
    };

    // Delete service
    const handleDeleteService = async (serviceId) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this service? This action cannot be undone."
            )
        )
            return;

        try {
            setDeletingId(serviceId);
            await axiosInstance.delete(`/api/worker/services/${serviceId}`);
            setServices((prev) =>
                prev.filter((service) => service._id !== serviceId)
            );
        } catch (err) {
            console.error("Error deleting service:", err);
            setError(err.response?.data?.message || "Failed to delete service");
        } finally {
            setDeletingId(null);
        }
    };

    // Upload portfolio image
    const handleImageUpload = async (serviceId, file) => {
        try {
            setUploadingImages((prev) => ({ ...prev, [serviceId]: true }));

            const formData = new FormData();
            formData.append("image", file);
            formData.append("caption", imageCaptions[serviceId] || "");

            const response = await axiosInstance.post(
                `/api/worker/services/${serviceId}/portfolio`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            // Update service with new image
            setServices((prev) =>
                prev.map((service) =>
                    service._id === serviceId
                        ? response.data.data.service
                        : service
                )
            );

            setImageCaptions((prev) => ({ ...prev, [serviceId]: "" }));
        } catch (err) {
            console.error("Error uploading image:", err);
            setError(err.response?.data?.message || "Failed to upload image");
        } finally {
            setUploadingImages((prev) => ({ ...prev, [serviceId]: false }));
        }
    };

    // Delete portfolio image
    const handleDeleteImage = async (serviceId, imageId) => {
        if (!window.confirm("Are you sure you want to delete this image?"))
            return;

        try {
            await axiosInstance.delete(
                `/api/worker/services/${serviceId}/portfolio/${imageId}`
            );

            // Update service by removing the image
            setServices((prev) =>
                prev.map((service) =>
                    service._id === serviceId
                        ? {
                              ...service,
                              portfolioImages: service.portfolioImages.filter(
                                  (img) => img.imageId !== imageId
                              ),
                          }
                        : service
                )
            );
        } catch (err) {
            console.error("Error deleting image:", err);
            setError(err.response?.data?.message || "Failed to delete image");
        }
    };

    // Update image caption
    const handleUpdateCaption = async (serviceId, imageId, caption) => {
        try {
            await axiosInstance.put(
                `/api/worker/services/${serviceId}/portfolio/${imageId}/caption`,
                {
                    caption,
                }
            );

            // Update local state
            setServices((prev) =>
                prev.map((service) =>
                    service._id === serviceId
                        ? {
                              ...service,
                              portfolioImages: service.portfolioImages.map(
                                  (img) =>
                                      img.imageId === imageId
                                          ? { ...img, caption }
                                          : img
                              ),
                          }
                        : service
                )
            );
        } catch (err) {
            console.error("Error updating caption:", err);
            setError(err.response?.data?.message || "Failed to update caption");
        }
    };

    // Start editing a service
    const startEditing = (service) => {
        setEditingId(service._id);
        setEditForm({
            price: service.price.toString(),
            pricingType: service.pricingType,
            description: service.details,
            estimatedDuration: service.estimatedDuration,
        });
        setImageCaptions((prev) => ({ ...prev, [service._id]: "" }));
    };

    // Cancel editing
    // Cancel editing
    const cancelEditing = () => {
        setEditingId(null);
        setSavingServiceId(null); // Also reset saving state
        setEditForm({
            price: "",
            pricingType: "FIXED",
            description: "",
            estimatedDuration: "",
        });
        setImageCaptions({});
        setPreviewImage(null);
    };

    // Quick actions
    const handleQuickAction = async (serviceId, action, value) => {
        try {
            const updates = {};
            if (action === "price") updates.price = value;
            if (action === "status") updates.isActive = value;

            await handleUpdateService(serviceId, updates);
        } catch (err) {
            console.error("Error in quick action:", err);
        }
    };

    if (loading && services.length === 0)
        return (
            <div className="min-h-96 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-600">Loading your services...</p>
            </div>
        );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                            Service Management
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl">
                            Manage your services, set pricing, and showcase your
                            skills to potential clients
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">
                                {services.length}
                            </p>
                            <p className="text-sm text-gray-600">
                                Total Services
                            </p>
                        </div>
                    </div>
                </div>

                {/* Add Service Form */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Add New Service
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Skill Selection */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Skill Category *
                            </label>
                            <button
                                onClick={() =>
                                    setShowSkillDropdown(!showSkillDropdown)
                                }
                                className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white hover:border-gray-400 transition-colors"
                            >
                                <span
                                    className={
                                        selectedSkill
                                            ? "text-gray-900"
                                            : "text-gray-500"
                                    }
                                >
                                    {selectedSkill
                                        ? skills.find(
                                              (s) => s._id === selectedSkill
                                          )?.name
                                        : "Choose a skill category"}
                                </span>
                                <ChevronDown className="w-4 h-4" />
                            </button>

                            {showSkillDropdown && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                                    {skills.map((skill) => (
                                        <button
                                            key={skill._id}
                                            onClick={() =>
                                                handleSkillSelect(skill._id)
                                            }
                                            className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
                                        >
                                            <div className="font-medium text-gray-900">
                                                {skill.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {skill.services.length} services
                                                available
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Service Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Specific Service *
                            </label>
                            <select
                                value={selectedService?.serviceId || ""}
                                onChange={(e) => {
                                    const service =
                                        getServicesForSelectedSkill().find(
                                            (s) =>
                                                s.serviceId === e.target.value
                                        );
                                    handleServiceSelect(service);
                                }}
                                disabled={!selectedSkill}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white disabled:bg-gray-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Choose a service</option>
                                {getServicesForSelectedSkill().map(
                                    (service) => (
                                        <option
                                            key={service.serviceId}
                                            value={service.serviceId}
                                        >
                                            {service.name}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>
                    </div>

                    {/* Service Details Form */}
                    {selectedService && (
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Price (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        value={serviceDetails.price}
                                        onChange={(e) =>
                                            setServiceDetails((prev) => ({
                                                ...prev,
                                                price: e.target.value,
                                            }))
                                        }
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pricing Type *
                                    </label>
                                    <select
                                        value={serviceDetails.pricingType}
                                        onChange={(e) =>
                                            setServiceDetails((prev) => ({
                                                ...prev,
                                                pricingType: e.target.value,
                                            }))
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="FIXED">
                                            Fixed Price
                                        </option>
                                        <option value="HOURLY">
                                            Hourly Rate
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Estimated Duration *
                                    </label>
                                    <input
                                        type="text"
                                        value={serviceDetails.estimatedDuration}
                                        onChange={(e) =>
                                            setServiceDetails((prev) => ({
                                                ...prev,
                                                estimatedDuration:
                                                    e.target.value,
                                            }))
                                        }
                                        placeholder="e.g., 2 hours, 30 mins"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Service Description *
                                </label>
                                <textarea
                                    value={serviceDetails.description}
                                    onChange={(e) =>
                                        setServiceDetails((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    placeholder="Describe your service in detail. What do you offer? What makes you special?"
                                    rows="4"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    {serviceDetails.description.length}/500
                                    characters
                                </p>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={handleAddService}
                                    disabled={loading}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Plus className="w-4 h-4" />
                                    )}
                                    {loading
                                        ? "Adding Service..."
                                        : "Add Service"}
                                </button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg mt-4">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}
                </div>

                {/* Services List */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">
                            Your Services ({services.length})
                        </h3>
                        <button
                            onClick={fetchWorkerServices}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-2"
                        >
                            <Loader2 className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>

                    {services.length === 0 ? (
                        <div className="text-center py-12">
                            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                No Services Added Yet
                            </h2>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                Start by adding your first service above to
                                showcase your skills and start receiving
                                bookings.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                            {services.map((service) => (
                                <div
                                    key={service._id}
                                    className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-blue-300 transition-all duration-200"
                                >
                                    {editingId === service._id ? (
                                        // Edit Form with Portfolio Images
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        {service.serviceName}
                                                    </h4>
                                                    <span className="inline-flex text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700 mt-1">
                                                        {service.skillName}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-md font-medium text-gray-700 mb-1">
                                                        Description
                                                    </label>
                                                    <textarea
                                                        value={
                                                            editForm.description
                                                        }
                                                        onChange={(e) =>
                                                            setEditForm(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    description:
                                                                        e.target
                                                                            .value,
                                                                })
                                                            )
                                                        }
                                                        className="w-full px-3 py-2 border text-2xl border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        rows="3"
                                                        placeholder="Describe your service..."
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Price (₹)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={
                                                                editForm.price
                                                            }
                                                            onChange={(e) =>
                                                                setEditForm(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        price: e
                                                                            .target
                                                                            .value,
                                                                    })
                                                                )
                                                            }
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Pricing Type
                                                        </label>
                                                        <select
                                                            value={
                                                                editForm.pricingType
                                                            }
                                                            onChange={(e) =>
                                                                setEditForm(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        pricingType:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    })
                                                                )
                                                            }
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                        >
                                                            <option value="FIXED">
                                                                Fixed
                                                            </option>
                                                            <option value="HOURLY">
                                                                Hourly
                                                            </option>
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Portfolio Images Section */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Portfolio Images (
                                                        {service.portfolioImages
                                                            ?.length || 0}
                                                        )
                                                    </label>

                                                    {/* Image Upload */}
                                                    <div className="mb-3 p-3 border border-dashed border-gray-300 rounded-lg">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => {
                                                                const file =
                                                                    e.target
                                                                        .files[0];
                                                                if (file) {
                                                                    handleImageUpload(
                                                                        service._id,
                                                                        file
                                                                    );
                                                                }
                                                            }}
                                                            className="hidden"
                                                            id={`image-upload-${service._id}`}
                                                        />
                                                        <label
                                                            htmlFor={`image-upload-${service._id}`}
                                                            className="flex items-center justify-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-blue-600"
                                                        >
                                                            {uploadingImages[
                                                                service._id
                                                            ] ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Upload className="w-4 h-4" />
                                                            )}
                                                            {uploadingImages[
                                                                service._id
                                                            ]
                                                                ? "Uploading..."
                                                                : "Upload Image"}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={
                                                                imageCaptions[
                                                                    service._id
                                                                ] || ""
                                                            }
                                                            onChange={(e) =>
                                                                setImageCaptions(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        [service._id]:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    })
                                                                )
                                                            }
                                                            placeholder="Image caption (optional)"
                                                            className="w-full mt-2 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                        />
                                                    </div>

                                                    {/* Existing Images */}
                                                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                                                        {service.portfolioImages?.map(
                                                            (image) => (
                                                                <div
                                                                    key={
                                                                        image.imageId
                                                                    }
                                                                    className="relative group"
                                                                >
                                                                    <img
                                                                        src={
                                                                            image.imageUrl
                                                                        }
                                                                        alt={
                                                                            image.caption
                                                                        }
                                                                        className="w-full h-20 object-cover rounded border cursor-pointer"
                                                                        onClick={() =>
                                                                            setPreviewImage(
                                                                                image
                                                                            )
                                                                        }
                                                                    />
                                                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                                        <button
                                                                            onClick={() =>
                                                                                setPreviewImage(
                                                                                    image
                                                                                )
                                                                            }
                                                                            className="p-1 text-white hover:text-blue-200"
                                                                        >
                                                                            <Eye className="w-3 h-3" />
                                                                        </button>
                                                                        <button
                                                                            onClick={() =>
                                                                                handleDeleteImage(
                                                                                    service._id,
                                                                                    image.imageId
                                                                                )
                                                                            }
                                                                            className="p-1 text-white hover:text-red-200 ml-1"
                                                                        >
                                                                            <Trash2 className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                    <input
                                                                        type="text"
                                                                        value={
                                                                            image.caption
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            handleUpdateCaption(
                                                                                service._id,
                                                                                image.imageId,
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        placeholder="Add caption"
                                                                        className="w-full mt-1 px-1 py-0.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                                                                    />
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={() =>
                                                        handleUpdateService(
                                                            service._id,
                                                            editForm
                                                        )
                                                    }
                                                    disabled={
                                                        savingServiceId ===
                                                        service._id
                                                    }
                                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-xl"
                                                >
                                                    {savingServiceId ===
                                                    service._id ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <Save className="w-3 h-3" />
                                                    )}
                                                    {savingServiceId ===
                                                    service._id
                                                        ? "Saving..."
                                                        : "Save Changes"}
                                                </button>
                                                <button
                                                    onClick={cancelEditing}
                                                    disabled={
                                                        savingServiceId ===
                                                        service._id
                                                    }
                                                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // Display Mode
                                        <>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        {service.serviceName}
                                                    </h4>
                                                    <span className="inline-flex text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700 mt-1">
                                                        {service.skillName}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() =>
                                                            startEditing(
                                                                service
                                                            )
                                                        }
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                                        title="Edit service"
                                                    >
                                                        <Edit3 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteService(
                                                                service._id
                                                            )
                                                        }
                                                        disabled={
                                                            deletingId ===
                                                            service._id
                                                        }
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                                        title="Delete service"
                                                    >
                                                        {deletingId ===
                                                        service._id ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            <p className="text-gray-600 text-xl mb-3 line-clamp-3">
                                                {service.details}
                                            </p>

                                            {/* Portfolio Images Preview */}
                                            {service.portfolioImages &&
                                                service.portfolioImages.length >
                                                    0 && (
                                                    <div className="mb-3">
                                                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                                            <Image className="w-3 h-3" />
                                                            <span>
                                                                Portfolio (
                                                                {
                                                                    service
                                                                        .portfolioImages
                                                                        .length
                                                                }
                                                                )
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-1">
                                                            {service.portfolioImages
                                                                .slice(0, 3)
                                                                .map(
                                                                    (
                                                                        image,
                                                                        index
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                image.imageId
                                                                            }
                                                                            className="relative"
                                                                        >
                                                                            <img
                                                                                src={
                                                                                    image.imageUrl
                                                                                }
                                                                                alt={
                                                                                    image.caption
                                                                                }
                                                                                className="w-full h-16 object-cover rounded border cursor-pointer"
                                                                                onClick={() =>
                                                                                    setPreviewImage(
                                                                                        image
                                                                                    )
                                                                                }
                                                                            />
                                                                            {index ===
                                                                                2 &&
                                                                                service
                                                                                    .portfolioImages
                                                                                    .length >
                                                                                    3 && (
                                                                                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center">
                                                                                        <span className="text-white text-xs font-bold">
                                                                                            +
                                                                                            {service
                                                                                                .portfolioImages
                                                                                                .length -
                                                                                                3}
                                                                                        </span>
                                                                                    </div>
                                                                                )}
                                                                        </div>
                                                                    )
                                                                )}
                                                        </div>
                                                    </div>
                                                )}

                                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>
                                                    {service.estimatedDuration}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center border-t pt-3 border-gray-200">
                                                <span className="text-xl font-bold text-gray-900">
                                                    ₹{service.price}
                                                </span>
                                                <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                                                    {service.pricingType.toLowerCase()}
                                                </span>
                                            </div>

                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={() =>
                                                        handleQuickAction(
                                                            service._id,
                                                            "price",
                                                            service.price + 100
                                                        )
                                                    }
                                                    className="flex-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                                                >
                                                    +₹100
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleQuickAction(
                                                            service._id,
                                                            "price",
                                                            service.price - 100
                                                        )
                                                    }
                                                    disabled={
                                                        service.price <= 100
                                                    }
                                                    className="flex-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded transition-colors disabled:opacity-50"
                                                >
                                                    -₹100
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Image Preview Modal */}
                {previewImage && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-2xl max-h-full overflow-auto">
                            <div className="p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">
                                        Image Preview
                                    </h3>
                                    <button
                                        onClick={() => setPreviewImage(null)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <img
                                    src={previewImage.imageUrl}
                                    alt={previewImage.caption}
                                    className="w-full h-auto rounded"
                                />
                                {previewImage.caption && (
                                    <p className="mt-3 text-gray-600">
                                        {previewImage.caption}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkerServiceManagement;
