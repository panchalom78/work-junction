import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
    Calendar,
    Clock,
    MapPin,
    Plus,
    User,
    Landmark,
    FileText,
} from "lucide-react";
import useWorkerAvailabilityStore from "../store/workerAvailability.store";
const CreateWorkerProfile = () => {
    const navigate = useNavigate();
    const {
        setupWorkerAvailability,
        loading: availabilityLoading,
        error: availabilityError,
    } = useWorkerAvailabilityStore();

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
        address: {
            houseNo: "",
            street: "",
            area: "",
            city: "",
            state: "",
            pincode: "",
        },
        workType: "",
        selectedSkills: [],
        selectedServices: [],
        bankDetails: {
            accountNumber: "",
            accountHolderName: "",
            IFSCCode: "",
            bankName: "",
        },
        verification: {
            documents: {
                selfie: null,
                aadhar: null,
                policeVerification: null,
            },
        },
        availability: {
            weeklySlots: [],
            nonAvailability: [],
            status: "available",
        },
    });

    const [loading, setLoading] = useState(false);
    const [documentLoading, setDocumentLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [currentStep, setCurrentStep] = useState(1);
    const [imagePreview, setImagePreview] = useState(null);
    const [skillsList, setSkillsList] = useState([]);
    const [selectedSkillServices, setSelectedSkillServices] = useState([]);
    const [createdWorkerId, setCreatedWorkerId] = useState(null);
    const [workerCreated, setWorkerCreated] = useState(false);
    const [serviceDetails, setServiceDetails] = useState({});

    // Enhanced steps with icons
    const steps = [
        {
            number: 1,
            title: "Basic Info",
            icon: User,
            description: "Personal details",
        },
        {
            number: 2,
            title: "Skills",
            icon: MapPin,
            description: "Services & pricing",
        },
        {
            number: 3,
            title: "Availability",
            icon: Calendar,
            description: "Working hours",
        },
        {
            number: 4,
            title: "Bank",
            icon: Landmark,
            description: "Payment details",
        },
        {
            number: 5,
            title: "Documents",
            icon: FileText,
            description: "Verification",
        },
    ];

    // Availability state

    const [nonAvailability, setNonAvailability] = useState([]);
    const [newNonAvailableDate, setNewNonAvailableDate] = useState("");
    const [newNonAvailableReason, setNewNonAvailableReason] = useState("");

    // Fetch skills
    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const { data } = await axiosInstance.get("/api/skills");
                if (data.success) setSkillsList(data.data);
            } catch {
                toast.error("Failed to fetch skills");
            }
        };
        fetchSkills();
    }, []);

    // Update services on skill change
    useEffect(() => {
        if (formData.selectedSkills.length > 0) {
            const services = [];
            formData.selectedSkills.forEach((skillId) => {
                const skill = skillsList.find((s) => s._id === skillId);
                if (skill?.services) {
                    skill.services.forEach((service) => {
                        services.push({
                            ...service,
                            skillId: skill._id,
                            skillName: skill.name,
                        });
                    });
                }
            });
            setSelectedSkillServices(services);
        } else {
            setSelectedSkillServices([]);
        }
    }, [formData.selectedSkills, skillsList]);

    // Handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const keys = name.split(".");
        if (keys.length === 2) {
            setFormData((prev) => ({
                ...prev,
                [keys[0]]: { ...prev[keys[0]], [keys[1]]: value },
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleServiceDetailsChange = (serviceId, field, value) => {
        setServiceDetails((prev) => ({
            ...prev,
            [serviceId]: { ...prev[serviceId], [field]: value },
        }));
    };

    const handleSkillChange = (skillId) => {
        setFormData((prev) => {
            const isSelected = prev.selectedSkills.includes(skillId);
            if (isSelected) {
                const updatedSkills = prev.selectedSkills.filter(
                    (id) => id !== skillId
                );
                const updatedServices = prev.selectedServices.filter(
                    (s) => s.skillId !== skillId
                );
                const updatedDetails = { ...serviceDetails };
                selectedSkillServices
                    .filter((s) => s.skillId === skillId)
                    .forEach((s) => delete updatedDetails[s.serviceId]);
                setServiceDetails(updatedDetails);
                return {
                    ...prev,
                    selectedSkills: updatedSkills,
                    selectedServices: updatedServices,
                };
            } else {
                return {
                    ...prev,
                    selectedSkills: [...prev.selectedSkills, skillId],
                };
            }
        });
    };

    const handleServiceChange = (service) => {
        setFormData((prev) => {
            const isSelected = prev.selectedServices.some(
                (s) => s.serviceId === service.serviceId
            );
            if (isSelected) {
                const updatedDetails = { ...serviceDetails };
                delete updatedDetails[service.serviceId];
                setServiceDetails(updatedDetails);
                return {
                    ...prev,
                    selectedServices: prev.selectedServices.filter(
                        (s) => s.serviceId !== service.serviceId
                    ),
                };
            } else {
                setServiceDetails((prev) => ({
                    ...prev,
                    [service.serviceId]: {
                        details: "",
                        pricingType: "fixed",
                        price: "",
                    },
                }));
                return {
                    ...prev,
                    selectedServices: [
                        ...prev.selectedServices,
                        {
                            serviceId: service.serviceId,
                            skillId: service.skillId,
                        },
                    ],
                };
            }
        });
    };

    // Availability handlers
    const handleWeeklySlotChange = (index, field, value) => {
        const updatedSlots = [...weeklySlots];
        if (field === "enabled") {
            updatedSlots[index].enabled = value;
        } else {
            updatedSlots[index][field] = value;
        }
        setWeeklySlots(updatedSlots);
    };

    const addNonAvailableDate = () => {
        if (!newNonAvailableDate) {
            toast.error("Please select a date");
            return;
        }

        const newDate = {
            id: Date.now(),
            date: newNonAvailableDate,
            reason: newNonAvailableReason || "Not available",
            allDay: true,
        };

        setNonAvailability((prev) => [...prev, newDate]);
        setNewNonAvailableDate("");
        setNewNonAvailableReason("");
        toast.success("Non-available date added");
    };

    const removeNonAvailableDate = (id) => {
        setNonAvailability((prev) => prev.filter((date) => date.id !== id));
    };

    const selectAllServicesForSkill = (skillId) => {
        const skillServices = selectedSkillServices.filter(
            (s) => s.skillId === skillId
        );
        setFormData((prev) => ({
            ...prev,
            selectedServices: [
                ...prev.selectedServices.filter((s) => s.skillId !== skillId),
                ...skillServices,
            ],
        }));
        const newDetails = { ...serviceDetails };
        skillServices.forEach((s) => {
            if (!newDetails[s.serviceId]) {
                newDetails[s.serviceId] = {
                    details: "",
                    pricingType: "fixed",
                    price: "",
                };
            }
        });
        setServiceDetails(newDetails);
    };

    const deselectAllServicesForSkill = (skillId) => {
        setFormData((prev) => ({
            ...prev,
            selectedServices: prev.selectedServices.filter(
                (s) => s.skillId !== skillId
            ),
        }));
        const updated = { ...serviceDetails };
        selectedSkillServices
            .filter((s) => s.skillId === skillId)
            .forEach((s) => delete updated[s.serviceId]);
        setServiceDetails(updated);
    };

    const handleFileUpload = (file, field) => {
        setFormData((prev) => ({
            ...prev,
            verification: {
                ...prev.verification,
                documents: { ...prev.verification.documents, [field]: file },
            },
        }));
        if (field === "selfie") setImagePreview(URL.createObjectURL(file));
    };

    // Validation functions
    const validateStep = (step) => {
        const newErrors = {};
        if (step === 1) {
            if (!formData.name.trim()) newErrors.name = "Name required";
            if (!formData.phone.match(/^[0-9]{10}$/))
                newErrors.phone = "Valid 10-digit phone";
            if (!formData.password || formData.password.length < 6)
                newErrors.password = "Min 6 chars";
            if (!formData.address.city)
                newErrors["address.city"] = "City required";
            if (!formData.address.pincode)
                newErrors["address.pincode"] = "Pincode required";
        }
        if (step === 2) {
            if (formData.selectedSkills.length === 0)
                newErrors.skills = "Select at least one skill";
            if (formData.selectedServices.length === 0)
                newErrors.services = "Select at least one service";
        }
        if (step === 3) {
            const hasEnabledDays = weeklySlots.some((slot) => slot.enabled);
            if (!hasEnabledDays)
                newErrors.availability = "Select at least one working day";
        }
        if (step === 4) {
            if (!formData.bankDetails.accountNumber)
                newErrors.accountNumber = "Required";
            if (!formData.bankDetails.accountHolderName)
                newErrors.accountHolderName = "Required";
            if (!formData.bankDetails.IFSCCode) newErrors.IFSCCode = "Required";
            if (!formData.bankDetails.bankName) newErrors.bankName = "Required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateDocumentForm = () => {
        const newErrors = {};
        if (!formData.verification.documents.selfie)
            newErrors.selfie = "Selfie required";
        if (!formData.verification.documents.aadhar)
            newErrors.aadhar = "Aadhaar required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // API calls
    const saveBasicInformation = async () => {
        if (!validateStep(1)) return;
        setLoading(true);
        try {
            const { data } = await axiosInstance.post(
                "/api/service-agent/create-worker",
                {
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email || undefined,
                    password: formData.password,
                    address: formData.address,
                    selectedSkills: formData.selectedSkills,
                    selectedServices: formData.selectedServices.map(
                        (s) => s.serviceId
                    ),
                    bankDetails: formData.bankDetails,
                    createdByAgent: true,
                }
            );
            if (!data.success) throw new Error(data.message);
            setCreatedWorkerId(data.data.workerId || data.data._id);
            toast.success("Basic info saved");
            setCurrentStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || "Save failed");
            console.error("Error creating worker:", error);
        } finally {
            setLoading(false);
        }
    };

    const saveSkillsAndServices = async () => {
        if (!validateStep(2) || !createdWorkerId) return;
        setLoading(true);
        try {
            const servicesData = formData.selectedServices.map((s) => {
                const detail = serviceDetails[s.serviceId] || {};
                return {
                    skillId: s.skillId,
                    serviceId: s.serviceId,
                    details: detail.details || "",
                    pricingType: (detail.pricingType || "fixed").toUpperCase(),
                    price: parseFloat(detail.price) || 0,
                    estimatedDuration: detail.estimatedDuration || 60,
                };
            });

            const { data } = await axiosInstance.post(
                `/api/service-agent/addSkillService/${createdWorkerId}`,
                {
                    services: servicesData,
                    workType: formData.workType,
                    dailyAvailability: formData.dailyAvailability,
                }
            );

            if (!data.success) throw new Error(data.message);
            toast.success("Skills & services saved");
            setCurrentStep(3);
        } catch (error) {
            toast.error(error.response?.data?.message || "Save failed");
            console.error("Error saving skills and services:", error);
        } finally {
            setLoading(false);
        }
    };

    const saveAvailability = async () => {
        if (!validateStep(3) || !createdWorkerId) return;

        try {
            const availabilityData = {
                weeklySlots: weeklySlots.filter((slot) => slot.enabled),
                nonAvailability,
                status: "available",
            };

            await setupWorkerAvailability(createdWorkerId, availabilityData);
            toast.success("Availability saved successfully");
            setCurrentStep(4);
        } catch (error) {
            toast.error(error.message || "Failed to save availability");
            console.error("Error saving availability:", error);
        }
    };

    const saveBankDetails = async () => {
        if (!validateStep(4) || !createdWorkerId) return;
        setLoading(true);
        try {
            const { data } = await axiosInstance.post(
                `/api/service-agent/workers/${createdWorkerId}/bank-details`,
                formData.bankDetails
            );
            if (!data.success) throw new Error(data.message);
            setWorkerCreated(true);
            toast.success("Bank details saved");
            setCurrentStep(5);
        } catch (error) {
            toast.error(error.response?.data?.message || "Save failed");
        } finally {
            setLoading(false);
        }
    };

    const uploadDocuments = async () => {
        if (!validateDocumentForm() || !createdWorkerId) return;
        setDocumentLoading(true);
        const form = new FormData();
        Object.entries(formData.verification.documents).forEach(
            ([key, file]) => {
                if (file) form.append(key, file);
            }
        );

        try {
            const { data } = await axiosInstance.post(
                `/api/service-agent/upload-documents/${createdWorkerId}`,
                form,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            if (!data.success) throw new Error(data.message);
            toast.success("Documents uploaded! Profile created successfully!");
            navigate(-1);
        } catch (error) {
            toast.error(error.message || "Upload failed");
        } finally {
            setDocumentLoading(false);
        }
    };
    // Add these functions to your component

    // Generate time options for dropdown (15-minute intervals)
    const generateTimeOptions = () => {
        const times = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const timeString = `${hour.toString().padStart(2, "0")}:${minute
                    .toString()
                    .padStart(2, "0")}`;
                const displayTime = new Date(
                    `2000-01-01T${timeString}`
                ).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                });
                times.push({ value: timeString, label: displayTime });
            }
        }
        return times;
    };

    // Format time for display
    const formatTimeDisplay = (timeString) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString(
            "en-US",
            {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            }
        );
    };

    // Add time slot to a specific day
    const addTimeSlot = (dayIndex) => {
        const updatedSlots = [...weeklySlots];
        const lastSlot =
            updatedSlots[dayIndex].timeSlots[
                updatedSlots[dayIndex].timeSlots.length - 1
            ];

        // Default to 09:00-18:00 for first slot, or add 1 hour after last end time
        let newStartTime = "09:00";
        let newEndTime = "18:00";

        if (lastSlot) {
            const lastEnd = new Date(`2000-01-01T${lastSlot.endTime}`);
            lastEnd.setHours(lastEnd.getHours() + 1);
            newStartTime = lastEnd.toTimeString().slice(0, 5);

            const newEnd = new Date(lastEnd);
            newEnd.setHours(newEnd.getHours() + 1);
            newEndTime = newEnd.toTimeString().slice(0, 5);
        }

        updatedSlots[dayIndex].timeSlots.push({
            startTime: newStartTime,
            endTime: newEndTime,
        });
        setWeeklySlots(updatedSlots);
    };

    // Remove time slot from a specific day
    const removeTimeSlot = (dayIndex, slotIndex) => {
        const updatedSlots = [...weeklySlots];
        updatedSlots[dayIndex].timeSlots.splice(slotIndex, 1);
        setWeeklySlots(updatedSlots);
    };

    // Handle time slot changes
    const handleTimeSlotChange = (dayIndex, slotIndex, field, value) => {
        const updatedSlots = [...weeklySlots];
        updatedSlots[dayIndex].timeSlots[slotIndex][field] = value;
        setWeeklySlots(updatedSlots);
    };

    // Update your initial weeklySlots state to include timeSlots array:
    const [weeklySlots, setWeeklySlots] = useState([
        { day: "monday", enabled: false, timeSlots: [] },
        { day: "tuesday", enabled: false, timeSlots: [] },
        { day: "wednesday", enabled: false, timeSlots: [] },
        { day: "thursday", enabled: false, timeSlots: [] },
        { day: "friday", enabled: false, timeSlots: [] },
        { day: "saturday", enabled: false, timeSlots: [] },
        { day: "sunday", enabled: false, timeSlots: [] },
    ]);

    const CurrentStepIcon = steps[currentStep - 1]?.icon;

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 py-8">
            <div className="max-w-4xl mx-auto p-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Create Worker Profile
                    </h1>
                    <p className="text-gray-600">
                        Complete all steps to register a new service worker
                    </p>
                </div>

                {/* Enhanced Progress Bar */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => {
                            const StepIcon = step.icon;
                            const isCompleted = currentStep > step.number;
                            const isCurrent = currentStep === step.number;

                            return (
                                <div
                                    key={step.number}
                                    className="flex items-center flex-1"
                                >
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                isCompleted
                                                    ? "bg-green-500 text-white"
                                                    : isCurrent
                                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                                    : "bg-gray-200 text-gray-500"
                                            }`}
                                        >
                                            {isCompleted ? (
                                                <div className="w-5 h-5">✓</div>
                                            ) : (
                                                <StepIcon className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div className="mt-2 text-center">
                                            <div
                                                className={`text-xs font-medium ${
                                                    isCurrent
                                                        ? "text-blue-600"
                                                        : "text-gray-500"
                                                }`}
                                            >
                                                {step.title}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                {step.description}
                                            </div>
                                        </div>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div
                                            className={`flex-1 h-1 mx-4 transition-all duration-300 ${
                                                currentStep > step.number
                                                    ? "bg-green-500"
                                                    : "bg-gray-200"
                                            }`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Form Content */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    {/* STEP 1: Basic Information */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        Basic Information
                                    </h3>
                                    <p className="text-gray-600">
                                        Personal details and contact information
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    {
                                        label: "Full Name *",
                                        name: "name",
                                        type: "text",
                                        icon: User,
                                    },
                                    {
                                        label: "Phone Number *",
                                        name: "phone",
                                        type: "tel",
                                    },
                                    {
                                        label: "Email Address",
                                        name: "email",
                                        type: "email",
                                    },
                                    {
                                        label: "Password *",
                                        name: "password",
                                        type: "password",
                                    },
                                ].map((field) => (
                                    <div key={field.name}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {field.label}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={field.type}
                                                name={field.name}
                                                value={formData[field.name]}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                    errors[field.name]
                                                        ? "border-red-500"
                                                        : "border-gray-300"
                                                }`}
                                                placeholder={field.label}
                                            />
                                        </div>
                                        {errors[field.name] && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors[field.name]}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-6">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">
                                    Address Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        {
                                            label: "House No/Building *",
                                            name: "address.houseNo",
                                            type: "text",
                                        },
                                        {
                                            label: "Street",
                                            name: "address.street",
                                            type: "text",
                                        },
                                        {
                                            label: "Area/Locality *",
                                            name: "address.area",
                                            type: "text",
                                        },
                                        {
                                            label: "City *",
                                            name: "address.city",
                                            type: "text",
                                        },
                                        {
                                            label: "State *",
                                            name: "address.state",
                                            type: "text",
                                        },
                                        {
                                            label: "Pincode *",
                                            name: "address.pincode",
                                            type: "text",
                                        },
                                    ].map((field) => (
                                        <div key={field.name}>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {field.label}
                                            </label>
                                            <input
                                                type={field.type}
                                                name={field.name}
                                                value={
                                                    field.name.includes(".")
                                                        ? formData[
                                                              field.name.split(
                                                                  "."
                                                              )[0]
                                                          ][
                                                              field.name.split(
                                                                  "."
                                                              )[1]
                                                          ]
                                                        : formData[field.name]
                                                }
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                    errors[field.name]
                                                        ? "border-red-500"
                                                        : "border-gray-300"
                                                }`}
                                                placeholder={field.label}
                                            />
                                            {errors[field.name] && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    {errors[field.name]}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Skills & Services */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        Skills & Services
                                    </h3>
                                    <p className="text-gray-600">
                                        Select skills and configure service
                                        details
                                    </p>
                                </div>
                            </div>

                            {/* Skills Section */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Select Skills *
                                    </label>
                                    {errors.skills && (
                                        <p className="text-red-500 text-sm mb-2">
                                            {errors.skills}
                                        </p>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {skillsList.map((skill) => (
                                            <label
                                                key={skill._id}
                                                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                                    formData.selectedSkills.includes(
                                                        skill._id
                                                    )
                                                        ? "border-blue-500 bg-blue-50 shadow-sm"
                                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.selectedSkills.includes(
                                                        skill._id
                                                    )}
                                                    onChange={() =>
                                                        handleSkillChange(
                                                            skill._id
                                                        )
                                                    }
                                                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                                <span className="ml-3 flex-1 font-medium text-gray-900">
                                                    {skill.name}
                                                </span>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                    {skill.services?.length ||
                                                        0}{" "}
                                                    services
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Services Section */}
                                {formData.selectedSkills.length > 0 && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Select Services *
                                            </label>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        const allServices =
                                                            selectedSkillServices;
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            selectedServices:
                                                                allServices,
                                                        }));
                                                        const newDetails = {
                                                            ...serviceDetails,
                                                        };
                                                        allServices.forEach(
                                                            (s) => {
                                                                if (
                                                                    !newDetails[
                                                                        s
                                                                            .serviceId
                                                                    ]
                                                                ) {
                                                                    newDetails[
                                                                        s.serviceId
                                                                    ] = {
                                                                        details:
                                                                            "",
                                                                        pricingType:
                                                                            "fixed",
                                                                        price: "",
                                                                    };
                                                                }
                                                            }
                                                        );
                                                        setServiceDetails(
                                                            newDetails
                                                        );
                                                    }}
                                                    className="text-xs bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"
                                                >
                                                    Select All
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            selectedServices:
                                                                [],
                                                        }));
                                                        setServiceDetails({});
                                                    }}
                                                    className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                                                >
                                                    Clear All
                                                </button>
                                            </div>
                                        </div>
                                        {errors.services && (
                                            <p className="text-red-500 text-sm">
                                                {errors.services}
                                            </p>
                                        )}

                                        {skillsList
                                            .filter((s) =>
                                                formData.selectedSkills.includes(
                                                    s._id
                                                )
                                            )
                                            .map((skill) => {
                                                const services =
                                                    selectedSkillServices.filter(
                                                        (s) =>
                                                            s.skillId ===
                                                            skill._id
                                                    );
                                                return (
                                                    <div
                                                        key={skill._id}
                                                        className="border-2 border-gray-100 rounded-xl p-4 bg-gray-50"
                                                    >
                                                        <div className="flex justify-between items-center mb-4">
                                                            <h4 className="font-semibold text-gray-900 text-lg">
                                                                {skill.name}
                                                            </h4>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() =>
                                                                        selectAllServicesForSkill(
                                                                            skill._id
                                                                        )
                                                                    }
                                                                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                                                >
                                                                    All
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        deselectAllServicesForSkill(
                                                                            skill._id
                                                                        )
                                                                    }
                                                                    className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                                                                >
                                                                    None
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {services.map(
                                                                (service) => {
                                                                    const isSelected =
                                                                        formData.selectedServices.some(
                                                                            (
                                                                                s
                                                                            ) =>
                                                                                s.serviceId ===
                                                                                service.serviceId
                                                                        );
                                                                    const detail =
                                                                        serviceDetails[
                                                                            service
                                                                                .serviceId
                                                                        ] || {};
                                                                    return (
                                                                        <div
                                                                            key={
                                                                                service.serviceId
                                                                            }
                                                                            className="bg-white rounded-lg border"
                                                                        >
                                                                            <label
                                                                                className={`flex items-center p-3 cursor-pointer ${
                                                                                    isSelected
                                                                                        ? "border-green-500 border-l-4"
                                                                                        : "border-gray-200"
                                                                                }`}
                                                                            >
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={
                                                                                        isSelected
                                                                                    }
                                                                                    onChange={() =>
                                                                                        handleServiceChange(
                                                                                            service
                                                                                        )
                                                                                    }
                                                                                    className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                                                                                />
                                                                                <span className="ml-3 flex-1 font-medium text-gray-900">
                                                                                    {
                                                                                        service.name
                                                                                    }
                                                                                </span>
                                                                            </label>
                                                                            {isSelected && (
                                                                                <div className="p-4 border-t border-gray-100 space-y-4">
                                                                                    <textarea
                                                                                        placeholder="Service details, special instructions, or requirements..."
                                                                                        value={
                                                                                            detail.details ||
                                                                                            ""
                                                                                        }
                                                                                        onChange={(
                                                                                            e
                                                                                        ) =>
                                                                                            handleServiceDetailsChange(
                                                                                                service.serviceId,
                                                                                                "details",
                                                                                                e
                                                                                                    .target
                                                                                                    .value
                                                                                            )
                                                                                        }
                                                                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                                        rows="3"
                                                                                    />
                                                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                                                        <select
                                                                                            value={
                                                                                                detail.pricingType ||
                                                                                                "fixed"
                                                                                            }
                                                                                            onChange={(
                                                                                                e
                                                                                            ) =>
                                                                                                handleServiceDetailsChange(
                                                                                                    service.serviceId,
                                                                                                    "pricingType",
                                                                                                    e
                                                                                                        .target
                                                                                                        .value
                                                                                                )
                                                                                            }
                                                                                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                                        >
                                                                                            <option value="fixed">
                                                                                                Fixed
                                                                                                Price
                                                                                            </option>
                                                                                            <option value="hourly">
                                                                                                Hourly
                                                                                                Rate
                                                                                            </option>
                                                                                            <option value="squarefeet">
                                                                                                Per
                                                                                                Sq
                                                                                                Ft
                                                                                            </option>
                                                                                            <option value="negotiable">
                                                                                                Negotiable
                                                                                            </option>
                                                                                        </select>
                                                                                        <input
                                                                                            type="number"
                                                                                            placeholder="Price (₹)"
                                                                                            value={
                                                                                                detail.price ||
                                                                                                ""
                                                                                            }
                                                                                            onChange={(
                                                                                                e
                                                                                            ) =>
                                                                                                handleServiceDetailsChange(
                                                                                                    service.serviceId,
                                                                                                    "price",
                                                                                                    e
                                                                                                        .target
                                                                                                        .value
                                                                                                )
                                                                                            }
                                                                                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                                        />
                                                                                        <input
                                                                                            type="number"
                                                                                            placeholder="Estimated Duration (minutes)"
                                                                                            value={
                                                                                                detail.estimatedDuration ||
                                                                                                ""
                                                                                            }
                                                                                            onChange={(
                                                                                                e
                                                                                            ) =>
                                                                                                handleServiceDetailsChange(
                                                                                                    service.serviceId,
                                                                                                    "estimatedDuration",
                                                                                                    e
                                                                                                        .target
                                                                                                        .value
                                                                                                )
                                                                                            }
                                                                                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                }
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Availability */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        Availability Schedule
                                    </h3>
                                    <p className="text-gray-600">
                                        Set working hours and non-available
                                        dates
                                    </p>
                                </div>
                            </div>

                            {errors.availability && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-700 text-sm">
                                        {errors.availability}
                                    </p>
                                </div>
                            )}

                            {/* Weekly Schedule */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-blue-600" />
                                        Weekly Working Hours
                                    </h4>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                const updated = weeklySlots.map(
                                                    (slot) => ({
                                                        ...slot,
                                                        enabled: true,
                                                        timeSlots:
                                                            slot.timeSlots
                                                                .length === 0
                                                                ? [
                                                                      {
                                                                          startTime:
                                                                              "09:00",
                                                                          endTime:
                                                                              "18:00",
                                                                      },
                                                                  ]
                                                                : slot.timeSlots,
                                                    })
                                                );
                                                setWeeklySlots(updated);
                                            }}
                                            className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                                        >
                                            Enable All
                                        </button>
                                        <button
                                            onClick={() => {
                                                const updated = weeklySlots.map(
                                                    (slot) => ({
                                                        ...slot,
                                                        enabled: false,
                                                        timeSlots: [],
                                                    })
                                                );
                                                setWeeklySlots(updated);
                                            }}
                                            className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                                        >
                                            Disable All
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {weeklySlots.map((slot, dayIndex) => (
                                        <div
                                            key={slot.day}
                                            className="border border-gray-200 rounded-lg overflow-hidden"
                                        >
                                            {/* Day Header */}
                                            <div
                                                className={`flex items-center justify-between p-4 ${
                                                    slot.enabled
                                                        ? "bg-blue-50 border-b border-blue-100"
                                                        : "bg-gray-50"
                                                }`}
                                            >
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={slot.enabled}
                                                        onChange={(e) =>
                                                            handleWeeklySlotChange(
                                                                dayIndex,
                                                                "enabled",
                                                                e.target.checked
                                                            )
                                                        }
                                                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                    <span className="font-semibold text-gray-900 capitalize text-lg">
                                                        {slot.day}
                                                    </span>
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    {slot.enabled && (
                                                        <span className="text-sm text-green-600 font-medium">
                                                            {
                                                                slot.timeSlots
                                                                    .length
                                                            }{" "}
                                                            time slot
                                                            {slot.timeSlots
                                                                .length !== 1
                                                                ? "s"
                                                                : ""}
                                                        </span>
                                                    )}
                                                    <div
                                                        className={`w-3 h-3 rounded-full ${
                                                            slot.enabled
                                                                ? "bg-green-500"
                                                                : "bg-gray-400"
                                                        }`}
                                                    />
                                                </div>
                                            </div>

                                            {/* Time Slots */}
                                            {slot.enabled && (
                                                <div className="p-4 bg-white">
                                                    <div className="space-y-4">
                                                        {slot.timeSlots.map(
                                                            (
                                                                timeSlot,
                                                                slotIndex
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        slotIndex
                                                                    }
                                                                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                                                                >
                                                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        {/* Start Time */}
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                                Start
                                                                                Time
                                                                            </label>
                                                                            <select
                                                                                value={
                                                                                    timeSlot.startTime
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) =>
                                                                                    handleTimeSlotChange(
                                                                                        dayIndex,
                                                                                        slotIndex,
                                                                                        "startTime",
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    )
                                                                                }
                                                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                                                            >
                                                                                {generateTimeOptions().map(
                                                                                    (
                                                                                        time
                                                                                    ) => (
                                                                                        <option
                                                                                            key={
                                                                                                time.value
                                                                                            }
                                                                                            value={
                                                                                                time.value
                                                                                            }
                                                                                        >
                                                                                            {
                                                                                                time.label
                                                                                            }
                                                                                        </option>
                                                                                    )
                                                                                )}
                                                                            </select>
                                                                        </div>

                                                                        {/* End Time */}
                                                                        <div>
                                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                                End
                                                                                Time
                                                                            </label>
                                                                            <select
                                                                                value={
                                                                                    timeSlot.endTime
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) =>
                                                                                    handleTimeSlotChange(
                                                                                        dayIndex,
                                                                                        slotIndex,
                                                                                        "endTime",
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    )
                                                                                }
                                                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                                                            >
                                                                                {generateTimeOptions().map(
                                                                                    (
                                                                                        time
                                                                                    ) => (
                                                                                        <option
                                                                                            key={
                                                                                                time.value
                                                                                            }
                                                                                            value={
                                                                                                time.value
                                                                                            }
                                                                                        >
                                                                                            {
                                                                                                time.label
                                                                                            }
                                                                                        </option>
                                                                                    )
                                                                                )}
                                                                            </select>
                                                                        </div>
                                                                    </div>

                                                                    {/* Remove Slot Button */}
                                                                    <button
                                                                        onClick={() =>
                                                                            removeTimeSlot(
                                                                                dayIndex,
                                                                                slotIndex
                                                                            )
                                                                        }
                                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                        title="Remove time slot"
                                                                    >
                                                                        <svg
                                                                            className="w-5 h-5"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth={
                                                                                    2
                                                                                }
                                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                            />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            )
                                                        )}

                                                        {/* Add Time Slot Button */}
                                                        <button
                                                            onClick={() =>
                                                                addTimeSlot(
                                                                    dayIndex
                                                                )
                                                            }
                                                            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                                                        >
                                                            <div className="flex items-center justify-center gap-2 text-blue-600 group-hover:text-blue-700">
                                                                <Plus className="w-5 h-5" />
                                                                <span className="font-medium">
                                                                    Add Another
                                                                    Time Slot
                                                                </span>
                                                            </div>
                                                        </button>
                                                    </div>

                                                    {/* Quick Actions */}
                                                    {slot.timeSlots.length ===
                                                        0 && (
                                                        <div className="text-center py-6">
                                                            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                            <p className="text-gray-500 mb-4">
                                                                No time slots
                                                                added for{" "}
                                                                {slot.day}
                                                            </p>
                                                            <button
                                                                onClick={() =>
                                                                    addTimeSlot(
                                                                        dayIndex
                                                                    )
                                                                }
                                                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                                            >
                                                                Add First Time
                                                                Slot
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Non-Availability Dates */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-orange-600" />
                                    Non-Available Dates
                                </h4>

                                <div className="space-y-4">
                                    {/* Add Non-Available Date */}
                                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-orange-800 mb-2">
                                                    Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={newNonAvailableDate}
                                                    onChange={(e) =>
                                                        setNewNonAvailableDate(
                                                            e.target.value
                                                        )
                                                    }
                                                    min={
                                                        new Date()
                                                            .toISOString()
                                                            .split("T")[0]
                                                    }
                                                    className="w-full px-4 py-2.5 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-orange-800 mb-2">
                                                    Reason (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g., Holiday, Personal work..."
                                                    value={
                                                        newNonAvailableReason
                                                    }
                                                    onChange={(e) =>
                                                        setNewNonAvailableReason(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full px-4 py-2.5 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                                                />
                                            </div>
                                            <div className="flex items-end">
                                                <button
                                                    onClick={
                                                        addNonAvailableDate
                                                    }
                                                    className="w-full px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center justify-center gap-2"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Add Date
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Non-Available Dates List */}
                                    {nonAvailability.length > 0 && (
                                        <div className="space-y-3">
                                            <h5 className="font-medium text-gray-700">
                                                Added Dates:
                                            </h5>
                                            {nonAvailability.map((date) => (
                                                <div
                                                    key={date.id}
                                                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-300 transition-colors"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                                        <div>
                                                            <div className="font-medium text-gray-900">
                                                                {new Date(
                                                                    date.date
                                                                ).toLocaleDateString(
                                                                    "en-IN",
                                                                    {
                                                                        weekday:
                                                                            "long",
                                                                        year: "numeric",
                                                                        month: "long",
                                                                        day: "numeric",
                                                                    }
                                                                )}
                                                            </div>
                                                            {date.reason && (
                                                                <div className="text-sm text-gray-600 mt-1">
                                                                    {
                                                                        date.reason
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            removeNonAvailableDate(
                                                                date.id
                                                            )
                                                        }
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Remove date"
                                                    >
                                                        <svg
                                                            className="w-5 h-5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <svg
                                        className="w-5 h-5 text-blue-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    Schedule Summary
                                </h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <h5 className="font-medium text-gray-700 mb-3">
                                            Working Schedule:
                                        </h5>
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {weeklySlots
                                                .filter(
                                                    (slot) =>
                                                        slot.enabled &&
                                                        slot.timeSlots.length >
                                                            0
                                                )
                                                .map((slot) => (
                                                    <div
                                                        key={slot.day}
                                                        className="bg-white rounded-lg p-3 border border-blue-100"
                                                    >
                                                        <div className="font-medium text-gray-900 capitalize mb-2">
                                                            {slot.day}
                                                        </div>
                                                        <div className="space-y-1">
                                                            {slot.timeSlots.map(
                                                                (
                                                                    timeSlot,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="flex items-center justify-between text-sm"
                                                                    >
                                                                        <span className="text-gray-600">
                                                                            Slot{" "}
                                                                            {index +
                                                                                1}
                                                                            :
                                                                        </span>
                                                                        <span className="font-medium text-blue-600">
                                                                            {formatTimeDisplay(
                                                                                timeSlot.startTime
                                                                            )}{" "}
                                                                            -{" "}
                                                                            {formatTimeDisplay(
                                                                                timeSlot.endTime
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            {weeklySlots.filter(
                                                (slot) =>
                                                    slot.enabled &&
                                                    slot.timeSlots.length > 0
                                            ).length === 0 && (
                                                <div className="text-center py-4 text-gray-500">
                                                    No working days configured
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h5 className="font-medium text-gray-700 mb-3">
                                            Non-Available Dates:
                                        </h5>
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {nonAvailability.map((date) => (
                                                <div
                                                    key={date.id}
                                                    className="bg-white rounded-lg p-3 border border-orange-100"
                                                >
                                                    <div className="font-medium text-gray-900">
                                                        {new Date(
                                                            date.date
                                                        ).toLocaleDateString(
                                                            "en-IN",
                                                            {
                                                                weekday:
                                                                    "short",
                                                                month: "short",
                                                                day: "numeric",
                                                                year: "numeric",
                                                            }
                                                        )}
                                                    </div>
                                                    {date.reason && (
                                                        <div className="text-sm text-gray-600 mt-1">
                                                            {date.reason}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {nonAvailability.length === 0 && (
                                                <div className="text-center py-4 text-gray-500">
                                                    No non-available dates
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Bank Details */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <Landmark className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        Bank Details
                                    </h3>
                                    <p className="text-gray-600">
                                        Payment account information for
                                        settlements
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    {
                                        label: "Account Holder Name *",
                                        name: "bankDetails.accountHolderName",
                                    },
                                    {
                                        label: "Bank Name *",
                                        name: "bankDetails.bankName",
                                    },
                                    {
                                        label: "Account Number *",
                                        name: "bankDetails.accountNumber",
                                        type: "number",
                                    },
                                    {
                                        label: "IFSC Code *",
                                        name: "bankDetails.IFSCCode",
                                    },
                                ].map((field) => (
                                    <div key={field.name}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {field.label}
                                        </label>
                                        <input
                                            type={field.type || "text"}
                                            name={field.name}
                                            value={
                                                formData.bankDetails[
                                                    field.name.split(".")[1]
                                                ]
                                            }
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                                errors[field.name.split(".")[1]]
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            }`}
                                            placeholder={field.label}
                                        />
                                        {errors[field.name.split(".")[1]] && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {
                                                    errors[
                                                        field.name.split(".")[1]
                                                    ]
                                                }
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 5: Documents */}
                    {currentStep === 5 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        Document Verification
                                    </h3>
                                    <p className="text-gray-600">
                                        Upload required documents for
                                        verification
                                    </p>
                                </div>
                            </div>

                            {workerCreated && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        </div>
                                        <div>
                                            <p className="text-green-800 font-medium">
                                                Profile created successfully!
                                            </p>
                                            <p className="text-green-700 text-sm">
                                                Upload documents to activate the
                                                profile.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    {
                                        label: "Selfie *",
                                        field: "selfie",
                                        description: "Clear front-facing photo",
                                    },
                                    {
                                        label: "Aadhaar Card *",
                                        field: "aadhar",
                                        description: "Front and back copy",
                                    },
                                    {
                                        label: "Police Verification",
                                        field: "policeVerification",
                                        description: "If available",
                                    },
                                ].map((doc) => (
                                    <div
                                        key={doc.field}
                                        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors"
                                    >
                                        <div className="mb-4">
                                            {doc.field === "selfie" &&
                                            imagePreview ? (
                                                <img
                                                    src={imagePreview}
                                                    alt="Selfie"
                                                    className="mx-auto w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm"
                                                />
                                            ) : (
                                                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                                    <FileText className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        <label className="block text-sm font-medium text-gray-900 mb-1">
                                            {doc.label}
                                        </label>
                                        <p className="text-xs text-gray-500 mb-4">
                                            {doc.description}
                                        </p>
                                        <input
                                            type="file"
                                            accept={
                                                doc.field === "selfie"
                                                    ? "image/*"
                                                    : "image/*,.pdf"
                                            }
                                            onChange={(e) =>
                                                handleFileUpload(
                                                    e.target.files[0],
                                                    doc.field
                                                )
                                            }
                                            className="hidden"
                                            id={doc.field}
                                        />
                                        <label
                                            htmlFor={doc.field}
                                            className="cursor-pointer inline-block px-6 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                        >
                                            Upload File
                                        </label>
                                        {errors[doc.field] && (
                                            <p className="text-red-500 text-xs mt-2">
                                                {errors[doc.field]}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
                        <button
                            onClick={() =>
                                setCurrentStep(Math.max(1, currentStep - 1))
                            }
                            disabled={currentStep === 1 || loading}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                                currentStep === 1 || loading
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            }`}
                        >
                            ← Previous
                        </button>

                        <div className="flex items-center gap-3">
                            {currentStep < steps.length && (
                                <span className="text-sm text-gray-500">
                                    Step {currentStep} of {steps.length}
                                </span>
                            )}

                            {currentStep === 1 && (
                                <button
                                    onClick={saveBasicInformation}
                                    disabled={loading}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors font-medium flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        "Save & Continue →"
                                    )}
                                </button>
                            )}
                            {currentStep === 2 && (
                                <button
                                    onClick={saveSkillsAndServices}
                                    disabled={loading}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors font-medium flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        "Save & Continue →"
                                    )}
                                </button>
                            )}
                            {currentStep === 3 && (
                                <button
                                    onClick={saveAvailability}
                                    disabled={availabilityLoading}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors font-medium flex items-center gap-2"
                                >
                                    {availabilityLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        "Save & Continue →"
                                    )}
                                </button>
                            )}
                            {currentStep === 4 && (
                                <button
                                    onClick={saveBankDetails}
                                    disabled={loading}
                                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors font-medium flex items-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        "Save & Complete →"
                                    )}
                                </button>
                            )}
                            {currentStep === 5 && (
                                <button
                                    onClick={uploadDocuments}
                                    disabled={documentLoading}
                                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors font-medium flex items-center gap-2"
                                >
                                    {documentLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Uploading...
                                        </>
                                    ) : (
                                        "Submit Documents ✓"
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateWorkerProfile;
