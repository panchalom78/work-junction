import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";

const WorkerManagement = () => {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editTab, setEditTab] = useState("personal");
    const [error, setError] = useState("");
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalWorkers: 0,
        limit: 10,
    });
    // Add these state variables near the other state declarations
    const [selectedSkill, setSelectedSkill] = useState("");
    const [selectedService, setSelectedService] = useState("");
    const [availableServices, setAvailableServices] = useState([]);
    const [workerCounts, setWorkerCounts] = useState({
        total: 0,
        bySkill: {},
        byService: {},
    });

    // Add this useEffect to fetch skills and worker counts
    useEffect(() => {
        const fetchSkillsAndCounts = async () => {
            try {
                const [skillsRes, countsRes] = await Promise.all([
                    axiosInstance.get("/api/skills"),
                    axiosInstance.get("/api/service-agent/worker-counts"),
                ]);

                if (skillsRes.data.success) {
                    setMasterSkills(skillsRes.data.data);
                }

                if (countsRes.data.success) {
                    setWorkerCounts(countsRes.data.data);
                }
            } catch (error) {
                console.error("Error fetching skills and counts:", error);
            }
        };

        fetchSkillsAndCounts();
    }, []);

    // EDIT FORM DATA
    const [editFormData, setEditFormData] = useState({
        name: "",
        phone: "",
        email: "",
        address: {
            houseNo: "",
            street: "",
            area: "",
            city: "",
            state: "",
            pincode: "",
        },
        bankDetails: {
            accountNumber: "",
            accountHolderName: "",
            IFSCCode: "",
            bankName: "",
        },
        workType: "",
        services: [],
        // Add availability data
        availability: {
            timetable: {},
            nonAvailability: [],
            availabilityStatus: "available",
        },
    });

    // MASTER SKILLS & SELECTED SKILL IDS
    const [masterSkills, setMasterSkills] = useState([]);
    const [selectedSkillIds, setSelectedSkillIds] = useState([]);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [suspendWorkerData, setSuspendWorkerData] = useState({
        id: null,
        name: "",
        reason: "",
    });

    // DEBOUNCE
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    // FETCH WORKERS WITH PROPER STATUS MAPPING
    // In the fetchWorkers function, update the API call to include availability data
    // FETCH WORKERS WITH PROPER STATUS MAPPING
    // FETCH WORKERS WITH PROPER STATUS MAPPING - NO PAGINATION
    const fetchWorkers = useCallback(
        async (
            search = searchTerm,
            status = filterStatus,
            skill = selectedSkill,
            service = selectedService
        ) => {
            setLoading(true);
            setError("");
            try {
                const params = new URLSearchParams({
                    ...(search && { search }),
                    ...(status !== "all" && { status }),
                    ...(skill && { skill }),
                    ...(service && { service }),
                });

                const { data } = await axiosInstance.get(
                    `/api/service-agent/all-workers?${params}`
                );

                console.log("API Response:", data);

                if (data.success) {
                    const list = Array.isArray(data.data)
                        ? data.data
                        : data.data?.workers || [];

                    // Fetch availability for each worker
                    const workersWithAvailability = await Promise.all(
                        list.map(async (worker) => {
                            try {
                                // Fetch availability data for each worker
                                const availabilityRes = await axiosInstance.get(
                                    `/api/service-agent/workers/${worker._id}/availability`
                                );

                                const availabilityData = availabilityRes.data
                                    .success
                                    ? availabilityRes.data.data
                                    : {};

                                // First check if worker is suspended (highest priority)
                                if (worker.workerProfile?.isSuspended) {
                                    return {
                                        ...worker,
                                        status: "suspended",
                                        availabilityStatus:
                                            availabilityData.availabilityStatus ||
                                            "available",
                                        workerProfile: {
                                            ...worker.workerProfile,
                                            timetable:
                                                availabilityData.timetable ||
                                                {},
                                            nonAvailability:
                                                availabilityData.nonAvailability ||
                                                [],
                                        },
                                    };
                                }

                                // Then check verification status
                                const verificationStatus =
                                    worker.workerProfile?.verification?.status;
                                if (verificationStatus === "PENDING") {
                                    return {
                                        ...worker,
                                        status: "pending",
                                        availabilityStatus:
                                            availabilityData.availabilityStatus ||
                                            "available",
                                        workerProfile: {
                                            ...worker.workerProfile,
                                            timetable:
                                                availabilityData.timetable ||
                                                {},
                                            nonAvailability:
                                                availabilityData.nonAvailability ||
                                                [],
                                        },
                                    };
                                }

                                if (verificationStatus === "REJECTED") {
                                    return {
                                        ...worker,
                                        status: "rejected",
                                        availabilityStatus:
                                            availabilityData.availabilityStatus ||
                                            "available",
                                        workerProfile: {
                                            ...worker.workerProfile,
                                            timetable:
                                                availabilityData.timetable ||
                                                {},
                                            nonAvailability:
                                                availabilityData.nonAvailability ||
                                                [],
                                        },
                                    };
                                }

                                // If not suspended and verification is approved or null, consider active
                                return {
                                    ...worker,
                                    status: "active",
                                    availabilityStatus:
                                        availabilityData.availabilityStatus ||
                                        "available",
                                    workerProfile: {
                                        ...worker.workerProfile,
                                        timetable:
                                            availabilityData.timetable || {},
                                        nonAvailability:
                                            availabilityData.nonAvailability ||
                                            [],
                                    },
                                };
                            } catch (error) {
                                console.error(
                                    `Error fetching availability for worker ${worker._id}:`,
                                    error
                                );
                                // Return worker without availability data if fetch fails
                                if (worker.workerProfile?.isSuspended) {
                                    return {
                                        ...worker,
                                        status: "suspended",
                                        availabilityStatus: "available",
                                    };
                                }

                                const verificationStatus =
                                    worker.workerProfile?.verification?.status;
                                if (verificationStatus === "PENDING") {
                                    return {
                                        ...worker,
                                        status: "pending",
                                        availabilityStatus: "available",
                                    };
                                }

                                if (verificationStatus === "REJECTED") {
                                    return {
                                        ...worker,
                                        status: "rejected",
                                        availabilityStatus: "available",
                                    };
                                }

                                return {
                                    ...worker,
                                    status: "active",
                                    availabilityStatus: "available",
                                };
                            }
                        })
                    );

                    setWorkers(workersWithAvailability);
                    // Update pagination with total count only
                    setPagination({
                        currentPage: 1,
                        totalPages: 1,
                        totalWorkers: workersWithAvailability.length,
                        limit: workersWithAvailability.length,
                    });
                } else throw new Error(data.message);
            } catch (err) {
                console.error(err);
                setError(
                    err.response?.data?.message || "Failed to load workers"
                );
                setWorkers([]);
                setPagination({
                    currentPage: 1,
                    totalPages: 1,
                    totalWorkers: 0,
                    limit: 0,
                });
            } finally {
                setLoading(false);
            }
        },
        [searchTerm, filterStatus, selectedSkill, selectedService]
    );
    const handleSkillChange = async (skillId) => {
        setSelectedSkill(skillId);
        setSelectedService("");

        if (skillId) {
            try {
                const servicesRes = await axiosInstance.get(
                    `/api/skills/${skillId}/services`
                );
                if (servicesRes.data.success) {
                    setAvailableServices(servicesRes.data.data.services || []);
                }
            } catch (error) {
                console.error("Error fetching services:", error);
                setAvailableServices([]);
            }
        } else {
            setAvailableServices([]);
        }
    };

    // AVAILABILITY UPDATE
    const handleUpdateAvailability = async (workerId, availabilityStatus) => {
        try {
            setActionLoading(workerId);
            await axiosInstance.put(
                `/api/service-agent/workers/${workerId}/availability-status`,
                { availabilityStatus }
            );
            toast.success(`Availability updated to ${availabilityStatus}`);
            fetchWorkers();
        } catch (error) {
            handleApiError(error, "Failed to update availability");
        } finally {
            setActionLoading(null);
        }
    };

    const debouncedSearch = useCallback(
        debounce((s) => fetchWorkers(), 500),
        [fetchWorkers, filterStatus, selectedSkill, selectedService]
    );
    useEffect(() => {
        if (searchTerm || selectedSkill || selectedService) {
            debouncedSearch(searchTerm);
        } else {
            fetchWorkers();
        }
    }, [
        searchTerm,
        filterStatus,
        selectedSkill,
        selectedService,
        debouncedSearch,
        fetchWorkers,
    ]);
    // Add this useEffect to fetch skills and worker counts
    useEffect(() => {
        const fetchSkillsAndCounts = async () => {
            try {
                const [skillsRes, countsRes] = await Promise.all([
                    axiosInstance.get("/api/skills"),
                    axiosInstance.get("/api/service-agent/worker-counts"),
                ]);

                if (skillsRes.data.success) {
                    setMasterSkills(skillsRes.data.data);
                }

                if (countsRes.data.success) {
                    setWorkerCounts(countsRes.data.data);
                }
            } catch (error) {
                console.error("Error fetching skills and counts:", error);
            }
        };

        fetchSkillsAndCounts();
    }, []);

    const clearFilters = () => {
        setSelectedSkill("");
        setSelectedService("");
        setSearchTerm("");
        setFilterStatus("all");
        setAvailableServices([]);
        fetchWorkers();
    };

    useEffect(() => {
        if (
            searchTerm ||
            selectedSkill ||
            selectedService ||
            filterStatus !== "all"
        ) {
            debouncedSearch(searchTerm);
        } else {
            fetchWorkers();
        }
    }, [
        searchTerm,
        filterStatus,
        selectedSkill,
        selectedService,
        debouncedSearch,
        fetchWorkers,
    ]);

    // ACTIONS
    const handleSuspendWorker = async (id, name) => {
        setSuspendWorkerData({
            id,
            name,
            reason: "",
        });
        setShowSuspendModal(true);
    };

    const confirmSuspendWorker = async () => {
        const { id, name, reason } = suspendWorkerData;

        if (!reason?.trim()) {
            toast.error("Please provide a reason for suspension");
            return;
        }

        try {
            setActionLoading(id);
            await axiosInstance.patch(
                `/api/service-agent/suspend-worker/${id}`,
                { reason: reason.trim() }
            );
            toast.success("Worker suspended successfully");
            setShowSuspendModal(false);
            setSuspendWorkerData({ id: null, name: "", reason: "" });
            fetchWorkers();
        } catch (e) {
            toast.error(
                e.response?.data?.message || "Failed to suspend worker"
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleActivateWorker = async (id, name) => {
        if (!window.confirm(`Activate ${name}?`)) return;
        try {
            setActionLoading(id);
            await axiosInstance.patch(
                `/api/service-agent/activate-worker/${id}`
            );
            toast.success("Worker activated successfully");
            fetchWorkers();
            toast.error(
                e.response?.data?.message || "Failed to activate worker"
            );
        } finally {
            setActionLoading(null);
        }
    };

    // VIEW DETAILS
    const handleViewDetails = async (worker) => {
        try {
            setLoading(true);
            const [detailsRes, availabilityRes] = await Promise.all([
                axiosInstance.get(
                    `/api/service-agent/worker-details/${worker._id}`
                ),
                axiosInstance.get(
                    `/api/service-agent/workers/${worker._id}/availability`
                ),
            ]);

            if (detailsRes.data.success) {
                const workerData = detailsRes.data.data;
                const availabilityData = availabilityRes.data.success
                    ? availabilityRes.data.data
                    : {};

                // Merge availability data with worker data
                const workerWithAvailability = {
                    ...workerData,
                    availabilityStatus:
                        availabilityData.availabilityStatus || "available",
                    workerProfile: {
                        ...workerData.workerProfile,
                        timetable: availabilityData.timetable || {},
                        nonAvailability: availabilityData.nonAvailability || [],
                    },
                };

                console.log(workerWithAvailability);

                setSelectedWorker(workerWithAvailability);
                setShowDetailsModal(true);
            } else throw new Error(detailsRes.data.message);
        } catch (e) {
            toast.error(e.response?.data?.message || "Failed to load details");
        } finally {
            setLoading(false);
        }
    };

    // OPEN EDIT MODAL
    // In the openEditModal function, update the availability API call:
    const openEditModal = async (worker) => {
        try {
            const [workerRes, skillsRes, availabilityRes] = await Promise.all([
                axiosInstance.get(
                    `/api/service-agent/worker-details/${worker._id}`
                ),
                axiosInstance.get(`/api/service-agent/skills/`),
                axiosInstance.get(
                    `/api/service-agent/workers/${worker._id}/availability`
                ),
            ]);

            if (!workerRes.data.success || !skillsRes.data.success) {
                throw new Error("Failed to load data");
            }

            const w = workerRes.data.data;
            const allSkills = skillsRes.data.data;

            // Handle availability response
            let availabilityData;
            if (availabilityRes.data.success) {
                availabilityData =
                    availabilityRes.data.data || availabilityRes.data;
            } else {
                availabilityData = {
                    timetable: {},
                    nonAvailability: [],
                    availabilityStatus: "available",
                };
            }

            setMasterSkills(allSkills);

            // Get skills from workerProfile or services
            const currentSkillIds = (w.workerProfile?.skills || []).map(
                (s) => s._id
            );
            setSelectedSkillIds(currentSkillIds);

            // Get services from workerProfile or services array
            const workerServices =
                w.workerProfile?.services || w.services || [];

            setEditFormData({
                name: w.name || "",
                phone: w.phone || "",
                email: w.email || "",
                address: w.address || {
                    houseNo: "",
                    street: "",
                    area: "",
                    city: "",
                    state: "",
                    pincode: "",
                },
                bankDetails: w.workerProfile?.bankDetails || {
                    accountNumber: "",
                    accountHolderName: "",
                    IFSCCode: "",
                    bankName: "",
                },
                workType: w.workerProfile?.workType || "",
                services: workerServices.map((s) => ({
                    serviceId: s.serviceId?._id || s.serviceId,
                    skillId: s.skillId?._id || s.skillId,
                    name: s.serviceId?.name || "Unknown Service",
                    details: s.details || "",
                    pricingType: s.pricingType || "FIXED",
                    price: s.price?.toString() || "",
                })),
                availability: availabilityData,
            });

            setSelectedWorker(w);
            setShowEditModal(true);
            setEditTab("personal");
        } catch (e) {
            console.error("Edit modal load error:", e);
            toast.error("Failed to load edit data");
        }
    };
    // Add these state variables near the other state declarations
    const [newNonAvailableDate, setNewNonAvailableDate] = useState("");
    const [newNonAvailableReason, setNewNonAvailableReason] = useState("");

    // Add these helper functions
    const addNonAvailableDate = () => {
        if (!newNonAvailableDate) return;

        const newDate = {
            date: newNonAvailableDate, // Use 'date' field instead of startDateTime/endDateTime
            reason: newNonAvailableReason || "Not available",
        };

        setEditFormData((prev) => ({
            ...prev,
            availability: {
                ...prev.availability,
                nonAvailability: [
                    ...prev.availability.nonAvailability,
                    newDate,
                ],
            },
        }));

        setNewNonAvailableDate("");
        setNewNonAvailableReason("");
    };
    // Add these functions for individual updates if needed
    const updateTimetableOnly = async (workerId, timetable) => {
        try {
            await axiosInstance.put(
                `/api/service-agent/workers/${workerId}/timetable`,
                { timetable }
            );
            toast.success("Timetable updated successfully");
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Failed to update timetable"
            );
            throw error;
        }
    };

    const updateNonAvailabilityOnly = async (workerId, nonAvailability) => {
        try {
            await axiosInstance.put(
                `/api/service-agent/workers/${workerId}/non-availability`,
                { nonAvailability }
            );
            toast.success("Non-availability dates updated successfully");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "Failed to update non-availability"
            );
            throw error;
        }
    };

    const removeNonAvailableDate = (index) => {
        setEditFormData((prev) => ({
            ...prev,
            availability: {
                ...prev.availability,
                nonAvailability: prev.availability.nonAvailability.filter(
                    (_, i) => i !== index
                ),
            },
        }));
    };
    const convertTimetableToWeeklySlots = (timetable) => {
        const days = [
            { day: "monday", key: "Monday" },
            { day: "tuesday", key: "Tuesday" },
            { day: "wednesday", key: "Wednesday" },
            { day: "thursday", key: "Thursday" },
            { day: "friday", key: "Friday" },
            { day: "saturday", key: "Saturday" },
            { day: "sunday", key: "Sunday" },
        ];

        return days.map(({ day, key }) => {
            const daySlots = timetable?.[key] || [];
            return {
                day,
                enabled: daySlots.length > 0,
                timeSlots: daySlots.map((slot) => ({
                    startTime: slot.start,
                    endTime: slot.end,
                })),
            };
        });
    };

    // Add this save function with the other save functions
    const saveAvailability = async () => {
        setSaveLoading((prev) => ({ ...prev, availability: true }));
        try {
            // Prepare data in the format expected by setupWorkerAvailability
            const availabilityData = {
                weeklySlots: convertTimetableToWeeklySlots(
                    editFormData.availability.timetable
                ),
                nonAvailability: editFormData.availability.nonAvailability.map(
                    (item) => ({
                        date: new Date(item.startDateTime || item.date)
                            .toISOString()
                            .split("T")[0],
                        reason: item.reason,
                    })
                ),
                status: editFormData.availability.availabilityStatus,
            };

            await axiosInstance.post(
                `/api/service-agent/workers/${selectedWorker._id}/availability`,
                availabilityData
            );
            toast.success("Availability updated successfully");
            fetchWorkers();
        } catch (e) {
            console.error("Availability save error:", e);
            toast.error(
                e.response?.data?.message || "Failed to update availability"
            );
        } finally {
            setSaveLoading((prev) => ({ ...prev, availability: false }));
        }
    };
    const handleApiError = (error, defaultMessage) => {
        console.error("API Error:", error);
        if (error.response?.status === 404) {
            toast.error("Worker not found");
        } else if (error.response?.status === 400) {
            toast.error(error.response.data.message || "Invalid data format");
        } else {
            toast.error(error.response?.data?.message || defaultMessage);
        }
    };
    // Add to the saveLoading state initialization
    const [saveLoading, setSaveLoading] = useState({
        personal: false,
        address: false,
        bank: false,
        skills: false,
        availability: false, // Add this
    });

    // INPUT HANDLER
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith("address.")) {
            const field = name.split(".")[1];
            setEditFormData((p) => ({
                ...p,
                address: { ...p.address, [field]: value },
            }));
        } else if (name.startsWith("bankDetails.")) {
            const field = name.split(".")[1];
            setEditFormData((p) => ({
                ...p,
                bankDetails: { ...p.bankDetails, [field]: value },
            }));
        } else {
            setEditFormData((p) => ({ ...p, [name]: value }));
        }
    };

    // SAVE HANDLERS
    const savePersonal = async () => {
        setSaveLoading((prev) => ({ ...prev, personal: true }));
        try {
            await axiosInstance.put(
                `/api/service-agent/worker/${selectedWorker._id}/personal`,
                {
                    name: editFormData.name,
                    phone: editFormData.phone,
                    email: editFormData.email,
                    workType: editFormData.workType,
                }
            );
            toast.success("Personal details updated");
            fetchWorkers();
        } catch (e) {
            toast.error(
                e.response?.data?.message || "Failed to update personal details"
            );
        } finally {
            setSaveLoading((prev) => ({ ...prev, personal: false }));
        }
    };

    const saveAddress = async () => {
        setSaveLoading((prev) => ({ ...prev, address: true }));
        try {
            await axiosInstance.put(
                `/api/service-agent/worker/${selectedWorker._id}/address`,
                editFormData.address
            );
            toast.success("Address updated");
            fetchWorkers();
        } catch (e) {
            toast.error(
                e.response?.data?.message || "Failed to update address"
            );
        } finally {
            setSaveLoading((prev) => ({ ...prev, address: false }));
        }
    };

    const saveBank = async () => {
        setSaveLoading((prev) => ({ ...prev, bank: true }));
        try {
            await axiosInstance.put(
                `/api/service-agent/worker/${selectedWorker._id}/bank`,
                editFormData.bankDetails
            );
            toast.success("Bank details updated");
            fetchWorkers();
        } catch (e) {
            toast.error(
                e.response?.data?.message || "Failed to update bank details"
            );
        } finally {
            setSaveLoading((prev) => ({ ...prev, bank: false }));
        }
    };

    const saveSkillsAndServices = async () => {
        setSaveLoading((prev) => ({ ...prev, skills: true }));
        try {
            const payload = {
                skills: selectedSkillIds,
                services: editFormData.services.map((s) => ({
                    skillId: s.skillId,
                    serviceId: s.serviceId,
                    details: s.details,
                    pricingType: s.pricingType,
                    price: parseFloat(s.price) || 0,
                })),
            };

            await axiosInstance.put(
                `/api/service-agent/worker/${selectedWorker._id}/skills-services`,
                payload
            );
            toast.success("Skills & Services updated");
            fetchWorkers();
        } catch (e) {
            toast.error(
                e.response?.data?.message ||
                    "Failed to update skills & services"
            );
        } finally {
            setSaveLoading((prev) => ({ ...prev, skills: false }));
        }
    };

    // PAGE CHANGE
    const handlePageChange = (p) => {
        if (p >= 1 && p <= pagination.totalPages) fetchWorkers();
    };

    // UI HELPERS
    const getStatusBadge = (worker) => {
        const accountStatus = worker.status;
        const availabilityStatus = worker.availabilityStatus;

        const accountStatusMap = {
            active: "bg-emerald-100 text-emerald-800 border border-emerald-200",
            suspended: "bg-rose-100 text-rose-800 border border-rose-200",
            pending: "bg-amber-100 text-amber-800 border border-amber-200",
            rejected: "bg-red-100 text-red-800 border border-red-200",
        };

        const availabilityStatusMap = {
            available: "bg-green-50 text-green-700 border border-green-200",
            busy: "bg-orange-50 text-orange-700 border border-orange-200",
            "off-duty": "bg-slate-100 text-slate-600 border border-slate-200",
        };

        return (
            <div className="flex flex-col gap-1.5 min-w-[100px]">
                <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold text-center ${
                        accountStatusMap[accountStatus] ||
                        "bg-gray-100 text-gray-800"
                    }`}
                >
                    {accountStatus
                        ? accountStatus.charAt(0).toUpperCase() +
                          accountStatus.slice(1)
                        : "Unknown"}
                </span>
                <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium text-center ${
                        availabilityStatusMap[availabilityStatus] ||
                        "bg-gray-100 text-gray-600"
                    }`}
                >
                    {availabilityStatus
                        ? availabilityStatus.replace("-", " ").toUpperCase()
                        : "AVAILABLE"}
                </span>
            </div>
        );
    };

    const getInitials = (name) => {
        if (!name) return "??";
        return name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const renderRating = (rating) => {
        const fullStars = Math.floor(rating || 0);
        const hasHalfStar = (rating || 0) % 1 >= 0.5;

        return (
            <div className="flex items-center space-x-1">
                <div className="flex">
                    {[...Array(5)].map((_, i) => (
                        <span
                            key={i}
                            className={`text-sm ${
                                i < fullStars
                                    ? "text-yellow-400"
                                    : i === fullStars && hasHalfStar
                                    ? "text-yellow-300"
                                    : "text-gray-300"
                            }`}
                        >
                            ★
                        </span>
                    ))}
                </div>
                <span className="text-xs text-gray-600 font-medium">
                    ({rating?.toFixed(1) || "0.0"})
                </span>
            </div>
        );
    };

    const getLocation = (address) => {
        if (!address) return "—";
        const { area, city } = address;
        return area && city ? `${area}, ${city}` : area || city || "—";
    };

    // SKELETON LOADER
    const SkeletonLoader = () => (
        <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <div
                    key={i}
                    className="bg-white rounded-2xl shadow-sm p-6 animate-pulse"
                >
                    <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-6 bg-gray-200 rounded w-20"></div>
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    if (loading && !workers.length) return <SkeletonLoader />;

    return (
        <div className="min-h-screen bg-gray-50/30 p-4 lg:p-6">
            {/* HEADER */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div className="flex-1">
                        <h4 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                            Worker Management
                        </h4>
                        <p className="text-gray-600 text-sm lg:text-base">
                            Manage service workers, their availability, and
                            account status
                        </p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 lg:p-6 text-white text-center min-w-[140px]">
                        <div className="text-2xl lg:text-3xl font-bold">
                            {pagination.totalWorkers}
                        </div>
                        <div className="text-blue-100 text-sm font-medium">
                            Total Workers
                        </div>
                    </div>
                </div>
            </div>

            {/* ERROR ALERT */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start space-x-3">
                    <div className="flex-shrink-0 w-5 h-5 text-red-600 mt-0.5">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <p className="text-sm text-red-700 flex-1">{error}</p>
                </div>
            )}

            {/* FILTERS & SEARCH */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg
                                className="h-5 w-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search workers by name, phone, or service..."
                            className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-sm transition-all duration-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Skills Dropdown */}
                    <div className="relative">
                        <select
                            className="lg:w-48 px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-sm"
                            value={selectedSkill}
                            onChange={(e) => handleSkillChange(e.target.value)}
                        >
                            <option value="">All Skills</option>
                            {masterSkills.map((skill) => (
                                <option key={skill._id} value={skill._id}>
                                    {skill.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Services Dropdown */}
                    <select
                        className="lg:w-48 px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-sm disabled:opacity-50"
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        disabled={!selectedSkill}
                    >
                        <option value="">All Services</option>
                        {availableServices.map((service) => (
                            <option
                                key={service.serviceId || service._id}
                                value={service.serviceId || service._id}
                            >
                                {service.name}{" "}
                            </option>
                        ))}
                    </select>
                    {/* Status Filter */}
                    <select
                        className="lg:w-48 px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-sm"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    {/* Clear Filters Button */}
                    {(selectedSkill ||
                        selectedService ||
                        searchTerm ||
                        filterStatus !== "all") && (
                        <button
                            onClick={clearFilters}
                            className="px-4 py-3.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors text-sm font-medium flex items-center"
                        >
                            <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                            Clear
                        </button>
                    )}
                </div>

                {/* Active Filters Display */}
                {(selectedSkill || selectedService) && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {selectedSkill && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Skill:{" "}
                                {
                                    masterSkills.find(
                                        (s) => s._id === selectedSkill
                                    )?.name
                                }
                                <button
                                    onClick={() => {
                                        setSelectedSkill("");
                                        setSelectedService("");
                                        setAvailableServices([]);
                                    }}
                                    className="ml-2 hover:bg-blue-200 rounded-full p-0.5"
                                >
                                    <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </span>
                        )}
                        {selectedService && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Service:{" "}
                                {
                                    availableServices.find(
                                        (s) => s.serviceId === selectedService
                                    )?.name
                                }
                                <button
                                    onClick={() => setSelectedService("")}
                                    className="ml-2 hover:bg-green-200 rounded-full p-0.5"
                                >
                                    <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* WORKERS TABLE/CARDS */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Worker
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Location
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Rating
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Services
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {workers.length > 0 ? (
                                workers.map((worker) => (
                                    <tr
                                        key={worker._id}
                                        className="hover:bg-gray-50/50 transition-colors duration-150"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                                                    {getInitials(worker.name)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {worker.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {worker.phone}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {getLocation(worker.address)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(worker)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {renderRating(worker.rating)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">
                                                {worker.completedJobs || 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() =>
                                                            handleViewDetails(
                                                                worker
                                                            )
                                                        }
                                                        className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                                                        title="View Details"
                                                    >
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                            />
                                                        </svg>
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            openEditModal(
                                                                worker
                                                            )
                                                        }
                                                        className="text-green-600 hover:text-green-800 p-1.5 rounded-lg hover:bg-green-50 transition-colors"
                                                        title="Edit Worker"
                                                    >
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                            />
                                                        </svg>
                                                    </button>

                                                    {worker.status ===
                                                        "active" && (
                                                        <button
                                                            onClick={() =>
                                                                handleSuspendWorker(
                                                                    worker._id,
                                                                    worker.name
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading ===
                                                                worker._id
                                                            }
                                                            className="text-amber-600 hover:text-amber-800 p-1.5 rounded-lg hover:bg-amber-50 transition-colors disabled:opacity-50"
                                                            title="Suspend Worker"
                                                        >
                                                            <svg
                                                                className="w-4 h-4"
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
                                                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                                                />
                                                            </svg>
                                                        </button>
                                                    )}
                                                    {worker.status ===
                                                        "suspended" && (
                                                        <button
                                                            onClick={() =>
                                                                handleActivateWorker(
                                                                    worker._id,
                                                                    worker.name
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading ===
                                                                worker._id
                                                            }
                                                            className="text-emerald-600 hover:text-emerald-800 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-50"
                                                            title="Activate Worker"
                                                        >
                                                            <svg
                                                                className="w-4 h-4"
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
                                                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                                                />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-12 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <svg
                                                className="w-16 h-16 mb-4 text-gray-300"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1}
                                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                                                />
                                            </svg>
                                            <p className="text-lg font-medium text-gray-900 mb-2">
                                                No workers found
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Try adjusting your search or
                                                filter criteria
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden space-y-4 p-4">
                    {workers.length > 0 ? (
                        workers.map((worker) => (
                            <div
                                key={worker._id}
                                className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                            {getInitials(worker.name)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {worker.name}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {worker.phone}
                                            </p>
                                        </div>
                                    </div>
                                    {getStatusBadge(worker)}
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">
                                            Location
                                        </span>
                                        <p className="font-medium">
                                            {getLocation(worker.address)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">
                                            Rating
                                        </span>
                                        {renderRating(worker.rating)}
                                    </div>
                                    <div>
                                        <span className="text-gray-500">
                                            Jobs Completed
                                        </span>
                                        <p className="font-medium">
                                            {worker.completedJobs || 0}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">
                                            Service
                                        </span>
                                        <p className="font-medium text-xs">
                                            {worker.workerProfile?.services?.[0]
                                                ?.serviceId?.name ||
                                                worker.services?.[0]?.serviceId
                                                    ?.name ||
                                                "No services"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col space-y-3">
                                    <select
                                        value={
                                            worker.availabilityStatus ||
                                            "available"
                                        }
                                        onChange={(e) =>
                                            handleUpdateAvailability(
                                                worker._id,
                                                e.target.value
                                            )
                                        }
                                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        disabled={
                                            actionLoading === worker._id ||
                                            worker.status === "suspended"
                                        }
                                    >
                                        <option value="available">
                                            Available
                                        </option>
                                        <option value="busy">Busy</option>
                                        <option value="off-duty">
                                            Off Duty
                                        </option>
                                    </select>

                                    <div className="flex justify-between space-x-2">
                                        <button
                                            onClick={() =>
                                                handleViewDetails(worker)
                                            }
                                            className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                />
                                            </svg>
                                            <span>View</span>
                                        </button>

                                        <button
                                            onClick={() =>
                                                openEditModal(worker)
                                            }
                                            className="flex-1 bg-green-50 text-green-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center justify-center space-x-1"
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                            </svg>
                                            <span>Edit</span>
                                        </button>

                                        {worker.status === "active" && (
                                            <button
                                                onClick={() =>
                                                    handleSuspendWorker(
                                                        worker._id,
                                                        worker.name
                                                    )
                                                }
                                                disabled={
                                                    actionLoading === worker._id
                                                }
                                                className="flex-1 bg-amber-50 text-amber-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors flex items-center justify-center space-x-1 disabled:opacity-50"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                                    />
                                                </svg>
                                                <span>Suspend</span>
                                            </button>
                                        )}
                                        {worker.status === "suspended" && (
                                            <button
                                                onClick={() =>
                                                    handleActivateWorker(
                                                        worker._id,
                                                        worker.name
                                                    )
                                                }
                                                disabled={
                                                    actionLoading === worker._id
                                                }
                                                className="flex-1 bg-emerald-50 text-emerald-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors flex items-center justify-center space-x-1 disabled:opacity-50"
                                            >
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                                    />
                                                </svg>
                                                <span>Activate</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <svg
                                className="w-16 h-16 mx-auto text-gray-300 mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1}
                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                                />
                            </svg>
                            <p className="text-gray-500 text-lg font-medium mb-2">
                                No workers found
                            </p>
                            <p className="text-gray-400 text-sm">
                                Adjust your search or filters
                            </p>
                        </div>
                    )}
                </div>

                {/* PAGINATION */}
            </div>
            {/* ==================== DETAILS MODAL ==================== */}
            {showDetailsModal && selectedWorker && (
                <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        Worker Details
                                    </h3>
                                    <p className="text-gray-600 mt-1">
                                        Complete information about{" "}
                                        {selectedWorker.name}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            {/* Worker Profile Header */}
                            <div className="flex items-center space-x-4 mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                    {getInitials(selectedWorker.name)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-xl font-bold text-gray-900">
                                        {selectedWorker.name}
                                    </h4>
                                    <p className="text-gray-600">
                                        {selectedWorker.phone} •{" "}
                                        {selectedWorker.email}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                selectedWorker.status ===
                                                "active"
                                                    ? "bg-green-100 text-green-800 border border-green-200"
                                                    : selectedWorker.status ===
                                                      "suspended"
                                                    ? "bg-red-100 text-red-800 border border-red-200"
                                                    : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                            }`}
                                        >
                                            {selectedWorker.status?.toUpperCase()}
                                        </span>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                selectedWorker.availabilityStatus ===
                                                "available"
                                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                                    : selectedWorker.availabilityStatus ===
                                                      "busy"
                                                    ? "bg-orange-100 text-orange-800 border border-orange-200"
                                                    : "bg-gray-100 text-gray-800 border border-gray-200"
                                            }`}
                                        >
                                            {selectedWorker.availabilityStatus
                                                ?.replace("-", " ")
                                                .toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                <div className="bg-white p-4 rounded-xl border border-gray-200 text-center shadow-sm">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {selectedWorker.completedJobs || 0}
                                    </div>
                                    <div className="text-sm text-gray-600 font-medium">
                                        Jobs Done
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-200 text-center shadow-sm">
                                    <div className="text-2xl font-bold text-green-600">
                                        ₹
                                        {(
                                            selectedWorker.earnings || 0
                                        ).toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-600 font-medium">
                                        Total Earnings
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-200 text-center shadow-sm">
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {selectedWorker.rating || 0}/5
                                    </div>
                                    <div className="text-sm text-gray-600 font-medium">
                                        Rating
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-200 text-center shadow-sm">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {new Date(
                                            selectedWorker.createdAt
                                        ).toLocaleDateString()}
                                    </div>
                                    <div className="text-sm text-gray-600 font-medium">
                                        Joined Date
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information */}
                            <section className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-200">
                                <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                                    <svg
                                        className="w-5 h-5 mr-2 text-blue-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                    Personal Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-700 mb-1">
                                            Full Name
                                        </span>
                                        <span className="text-gray-900">
                                            {selectedWorker.name}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-700 mb-1">
                                            Phone Number
                                        </span>
                                        <span className="text-gray-900">
                                            {selectedWorker.phone}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-700 mb-1">
                                            Email Address
                                        </span>
                                        <span className="text-gray-900">
                                            {selectedWorker.email || "—"}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-700 mb-1">
                                            Member Since
                                        </span>
                                        <span className="text-gray-900">
                                            {new Date(
                                                selectedWorker.createdAt
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </section>

                            {/* Address Information */}
                            {selectedWorker.address && (
                                <section className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-200">
                                    <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                                        <svg
                                            className="w-5 h-5 mr-2 text-green-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                        Address Details
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        {Object.entries(selectedWorker.address)
                                            .filter(
                                                ([key]) => key !== "coordinates"
                                            )
                                            .map(([key, value]) => (
                                                <div
                                                    key={key}
                                                    className="flex flex-col"
                                                >
                                                    <span className="font-semibold text-gray-700 mb-1 capitalize">
                                                        {key.replace(
                                                            /([A-Z])/g,
                                                            " $1"
                                                        )}
                                                    </span>
                                                    <span className="text-gray-900">
                                                        {value || "—"}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </section>
                            )}

                            {/* Professional Information */}
                            <section className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-200">
                                <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                                    <svg
                                        className="w-5 h-5 mr-2 text-purple-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                                        />
                                    </svg>
                                    Professional Information
                                </h4>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Skills Section */}
                                    <div>
                                        <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                                            <svg
                                                className="w-4 h-4 mr-2 text-green-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            Skills & Expertise
                                        </h5>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedWorker.workerProfile
                                                ?.skills?.length > 0 ? (
                                                selectedWorker.workerProfile.skills.map(
                                                    (skill) => (
                                                        <span
                                                            key={skill._id}
                                                            className="bg-green-100 text-green-800 px-3 py-2 rounded-xl text-sm font-medium border border-green-200 shadow-sm"
                                                        >
                                                            {skill.name}
                                                        </span>
                                                    )
                                                )
                                            ) : (
                                                <div className="text-center py-4 text-gray-500">
                                                    <svg
                                                        className="w-8 h-8 mx-auto mb-2 text-gray-300"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                        />
                                                    </svg>
                                                    <p className="text-sm">
                                                        No skills assigned
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Services Section */}
                                    <div>
                                        <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                                            <svg
                                                className="w-4 h-4 mr-2 text-blue-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                                />
                                            </svg>
                                            Services Offered
                                        </h5>
                                        {selectedWorker.workerProfile?.services
                                            ?.length > 0 ? (
                                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                                {selectedWorker.workerProfile.services.map(
                                                    (service) => (
                                                        <div
                                                            key={service._id}
                                                            className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow"
                                                        >
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h6 className="font-semibold text-blue-900 text-sm">
                                                                    {
                                                                        service.serviceName
                                                                    }
                                                                </h6>
                                                                <span
                                                                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                                        service.pricingType ===
                                                                        "FIXED"
                                                                            ? "bg-green-100 text-green-800"
                                                                            : "bg-orange-100 text-orange-800"
                                                                    }`}
                                                                >
                                                                    {
                                                                        service.pricingType
                                                                    }
                                                                </span>
                                                            </div>
                                                            {service.details && (
                                                                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                                                    {
                                                                        service.details
                                                                    }
                                                                </p>
                                                            )}
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm font-bold text-green-700">
                                                                    ₹
                                                                    {
                                                                        service.price
                                                                    }
                                                                </span>
                                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                                    {
                                                                        service
                                                                            .skillId
                                                                            ?.name
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-gray-500">
                                                <svg
                                                    className="w-8 h-8 mx-auto mb-2 text-gray-300"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                    />
                                                </svg>
                                                <p className="text-sm">
                                                    No services added
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Bank Details */}
                            {selectedWorker.workerProfile?.bankDetails && (
                                <section className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-200">
                                    <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                                        <svg
                                            className="w-5 h-5 mr-2 text-yellow-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                            />
                                        </svg>
                                        Bank Account Details
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        {Object.entries(
                                            selectedWorker.workerProfile
                                                .bankDetails
                                        ).map(([key, value]) => (
                                            <div
                                                key={key}
                                                className="flex flex-col"
                                            >
                                                <span className="font-semibold text-gray-700 mb-1 capitalize">
                                                    {key.replace(
                                                        /([A-Z])/g,
                                                        " $1"
                                                    )}
                                                </span>
                                                <span className="text-gray-900 font-mono">
                                                    {value || "—"}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Verification Status */}
                            <section className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-200">
                                <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                                    <svg
                                        className="w-5 h-5 mr-2 text-indigo-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                        />
                                    </svg>
                                    Verification Status
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                    {/* Selfie Verification */}
                                    <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border">
                                        <div
                                            className={`w-3 h-3 rounded-full mb-2 ${
                                                selectedWorker.workerProfile
                                                    ?.verification
                                                    ?.isSelfieVerified
                                                    ? "bg-green-500"
                                                    : "bg-gray-300"
                                            }`}
                                        />
                                        <span className="font-semibold text-gray-700">
                                            Selfie Verified
                                        </span>
                                        <span className="text-xs text-gray-500 mt-1">
                                            {selectedWorker.workerProfile
                                                ?.verification?.isSelfieVerified
                                                ? "APPROVED"
                                                : "PENDING"}
                                        </span>
                                    </div>

                                    {/* Aadhaar Verification */}
                                    <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border">
                                        <div
                                            className={`w-3 h-3 rounded-full mb-2 ${
                                                selectedWorker.workerProfile
                                                    ?.verification
                                                    ?.isAddharDocVerified
                                                    ? "bg-green-500"
                                                    : "bg-gray-300"
                                            }`}
                                        />
                                        <span className="font-semibold text-gray-700">
                                            Aadhaar Verified
                                        </span>
                                        <span className="text-xs text-gray-500 mt-1">
                                            {selectedWorker.workerProfile
                                                ?.verification
                                                ?.isAddharDocVerified
                                                ? "APPROVED"
                                                : "PENDING"}
                                        </span>
                                    </div>

                                    {/* Police Verification */}
                                    <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border">
                                        <div
                                            className={`w-3 h-3 rounded-full mb-2 ${
                                                selectedWorker.workerProfile
                                                    ?.verification
                                                    ?.isPoliceVerificationDocVerified
                                                    ? "bg-green-500"
                                                    : "bg-gray-300"
                                            }`}
                                        />
                                        <span className="font-semibold text-gray-700">
                                            Police Verified
                                        </span>
                                        <span className="text-xs text-gray-500 mt-1">
                                            {selectedWorker.workerProfile
                                                ?.verification
                                                ?.isPoliceVerificationDocVerified
                                                ? "APPROVED"
                                                : "PENDING"}
                                        </span>
                                    </div>

                                    {/* Overall Status */}
                                    <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl border">
                                        <div
                                            className={`px-3 py-1 rounded-full mb-2 text-xs font-bold ${
                                                selectedWorker.workerProfile
                                                    ?.verification?.status ===
                                                "APPROVED"
                                                    ? "bg-green-100 text-green-800 border border-green-200"
                                                    : selectedWorker
                                                          .workerProfile
                                                          ?.verification
                                                          ?.status ===
                                                      "REJECTED"
                                                    ? "bg-red-100 text-red-800 border border-red-200"
                                                    : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                            }`}
                                        >
                                            {selectedWorker.workerProfile
                                                ?.verification?.status ||
                                                "PENDING"}
                                        </div>
                                        <span className="font-semibold text-gray-700">
                                            Overall Status
                                        </span>
                                        <span className="text-xs text-gray-500 mt-1 capitalize">
                                            {selectedWorker.workerProfile?.verification?.status?.toLowerCase() ||
                                                "pending"}
                                        </span>
                                    </div>
                                </div>
                            </section>
                            {/* Availability Information */}
                            <section className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-200">
                                <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                                    <svg
                                        className="w-5 h-5 mr-2 text-purple-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    Availability Information
                                </h4>

                                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                                    {/* Current Status */}
                                    {/* <div className="bg-white p-4 rounded-xl border border-gray-200">
                                        <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                                            <svg
                                                className="w-4 h-4 mr-2 text-blue-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            Current Status
                                        </h5>
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className={`w-3 h-3 rounded-full ${
                                                    selectedWorker.availabilityStatus ===
                                                    "available"
                                                        ? "bg-green-500"
                                                        : selectedWorker.availabilityStatus ===
                                                          "busy"
                                                        ? "bg-orange-500"
                                                        : "bg-gray-500"
                                                }`}
                                            ></div>
                                            <span
                                                className={`font-semibold text-sm ${
                                                    selectedWorker.availabilityStatus ===
                                                    "available"
                                                        ? "text-green-700"
                                                        : selectedWorker.availabilityStatus ===
                                                          "busy"
                                                        ? "text-orange-700"
                                                        : "text-gray-700"
                                                }`}
                                            >
                                                {selectedWorker.availabilityStatus
                                                    ? selectedWorker.availabilityStatus
                                                          .replace("-", " ")
                                                          .toUpperCase()
                                                    : "NOT SET"}
                                            </span>
                                        </div>
                                    </div> */}

                                    {/* Weekly Schedule */}
                                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                                        <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                                            <svg
                                                className="w-4 h-4 mr-2 text-green-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                            Weekly Schedule
                                        </h5>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {selectedWorker.workerProfile
                                                ?.timetable ? (
                                                Object.entries(
                                                    selectedWorker.workerProfile
                                                        .timetable
                                                ).map(
                                                    ([day, slots]) =>
                                                        slots.length > 0 && (
                                                            <div
                                                                key={day}
                                                                className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0"
                                                            >
                                                                <span className="text-sm font-medium text-gray-700 capitalize">
                                                                    {day}
                                                                </span>
                                                                <div className="text-xs text-gray-600">
                                                                    {slots.map(
                                                                        (
                                                                            slot,
                                                                            index
                                                                        ) => (
                                                                            <span
                                                                                key={
                                                                                    index
                                                                                }
                                                                                className="bg-blue-100 text-blue-700 px-2 py-1 rounded mr-1"
                                                                            >
                                                                                {
                                                                                    slot.start
                                                                                }{" "}
                                                                                -{" "}
                                                                                {
                                                                                    slot.end
                                                                                }
                                                                            </span>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )
                                                )
                                            ) : (
                                                <div className="text-center py-2 text-gray-500">
                                                    <svg
                                                        className="w-8 h-8 mx-auto mb-2 text-gray-300"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                    <p className="text-sm">
                                                        No schedule configured
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Non-Available Dates */}
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 lg:col-span-2">
                                        <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                                            <svg
                                                className="w-4 h-4 mr-2 text-red-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                            Non-Available Dates
                                        </h5>
                                        {selectedWorker.workerProfile
                                            ?.nonAvailability?.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                                                {selectedWorker.workerProfile.nonAvailability.map(
                                                    (date, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                                <div>
                                                                    <div className="font-medium text-red-900 text-sm">
                                                                        {new Date(
                                                                            date.startDateTime
                                                                        ).toLocaleDateString(
                                                                            "en-IN",
                                                                            {
                                                                                weekday:
                                                                                    "short",
                                                                                year: "numeric",
                                                                                month: "short",
                                                                                day: "numeric",
                                                                            }
                                                                        )}
                                                                    </div>
                                                                    {date.reason && (
                                                                        <div className="text-xs text-red-700 mt-1">
                                                                            {
                                                                                date.reason
                                                                            }
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                                                                Full Day
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-gray-500">
                                                <svg
                                                    className="w-8 h-8 mx-auto mb-2 text-gray-300"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                                <p className="text-sm">
                                                    No non-available dates
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <h6 className="font-semibold text-gray-700 mb-3 text-sm">
                                        Quick Actions
                                    </h6>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => {
                                                setShowDetailsModal(false);
                                                openEditModal(selectedWorker);
                                                setEditTab("availability");
                                            }}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center"
                                        >
                                            <svg
                                                className="w-4 h-4 mr-2"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                            </svg>
                                            Edit Availability
                                        </button>

                                        {/* Quick Status Update Buttons */}
                                        {selectedWorker.availabilityStatus !==
                                            "available" && (
                                            <button
                                                onClick={() =>
                                                    handleUpdateAvailability(
                                                        selectedWorker._id,
                                                        "available"
                                                    )
                                                }
                                                disabled={
                                                    actionLoading ===
                                                    selectedWorker._id
                                                }
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center disabled:opacity-50"
                                            >
                                                <svg
                                                    className="w-4 h-4 mr-2"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                                Set Available
                                            </button>
                                        )}

                                        {selectedWorker.availabilityStatus !==
                                            "busy" && (
                                            <button
                                                onClick={() =>
                                                    handleUpdateAvailability(
                                                        selectedWorker._id,
                                                        "busy"
                                                    )
                                                }
                                                disabled={
                                                    actionLoading ===
                                                    selectedWorker._id
                                                }
                                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium flex items-center disabled:opacity-50"
                                            >
                                                <svg
                                                    className="w-4 h-4 mr-2"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                Set Busy
                                            </button>
                                        )}

                                        {selectedWorker.availabilityStatus !==
                                            "off-duty" && (
                                            <button
                                                onClick={() =>
                                                    handleUpdateAvailability(
                                                        selectedWorker._id,
                                                        "off-duty"
                                                    )
                                                }
                                                disabled={
                                                    actionLoading ===
                                                    selectedWorker._id
                                                }
                                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium flex items-center disabled:opacity-50"
                                            >
                                                <svg
                                                    className="w-4 h-4 mr-2"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                                                    />
                                                </svg>
                                                Set Off Duty
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center justify-center"
                                >
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        openEditModal(selectedWorker);
                                    }}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                                >
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                    </svg>
                                    Edit Worker
                                </button>
                                {selectedWorker.status === "active" ? (
                                    <button
                                        onClick={() =>
                                            handleSuspendWorker(
                                                selectedWorker._id,
                                                selectedWorker.name
                                            )
                                        }
                                        disabled={actionLoading}
                                        className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50"
                                    >
                                        <svg
                                            className="w-4 h-4 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                            />
                                        </svg>
                                        {actionLoading
                                            ? "Suspending..."
                                            : "Suspend Worker"}
                                    </button>
                                ) : selectedWorker.status === "suspended" ? (
                                    <button
                                        onClick={() =>
                                            handleActivateWorker(
                                                selectedWorker._id,
                                                selectedWorker.name
                                            )
                                        }
                                        disabled={actionLoading}
                                        className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50"
                                    >
                                        <svg
                                            className="w-4 h-4 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                            />
                                        </svg>
                                        {actionLoading
                                            ? "Activating..."
                                            : "Activate Worker"}
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {/* ==================== EDIT MODAL ==================== */}
            {showEditModal && selectedWorker && (
                <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        Edit Worker
                                    </h3>
                                    <p className="text-gray-600 mt-1">
                                        Update {selectedWorker.name}'s
                                        information
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                                {[
                                    {
                                        key: "personal",
                                        label: "Personal",
                                        icon: "👤",
                                    },
                                    {
                                        key: "address",
                                        label: "Address",
                                        icon: "🏠",
                                    },
                                    {
                                        key: "bank",
                                        label: "Bank Details",
                                        icon: "💳",
                                    },
                                    {
                                        key: "skills",
                                        label: "Skills & Services",
                                        icon: "🛠️",
                                    },
                                    {
                                        key: "availability",
                                        label: "Availability",
                                        icon: "📅",
                                    },
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setEditTab(tab.key)}
                                        className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                                            editTab === tab.key
                                                ? "border-blue-600 text-blue-600 bg-blue-50"
                                                : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                        }`}
                                    >
                                        <span className="mr-2 text-base">
                                            {tab.icon}
                                        </span>
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Personal Information Tab */}
                            {editTab === "personal" && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Full Name *
                                            </label>
                                            <input
                                                name="name"
                                                value={editFormData.name}
                                                onChange={handleEditChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                                                placeholder="Enter full name"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Phone Number *
                                            </label>
                                            <input
                                                name="phone"
                                                value={editFormData.phone}
                                                onChange={handleEditChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                                                placeholder="Enter phone number"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                name="email"
                                                type="email"
                                                value={editFormData.email}
                                                onChange={handleEditChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                                                placeholder="Enter email address"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Work Type
                                            </label>
                                            <select
                                                name="workType"
                                                value={editFormData.workType}
                                                onChange={handleEditChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                                            >
                                                <option value="">
                                                    Select work type
                                                </option>
                                                <option value="Full Time">
                                                    Full Time
                                                </option>
                                                <option value="Part Time">
                                                    Part Time
                                                </option>
                                                <option value="Contract">
                                                    Contract
                                                </option>
                                                <option value="Freelance">
                                                    Freelance
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Address Tab */}
                            {editTab === "address" && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[
                                            {
                                                key: "houseNo",
                                                label: "House No/Building",
                                                required: true,
                                            },
                                            {
                                                key: "street",
                                                label: "Street",
                                                required: true,
                                            },
                                            {
                                                key: "area",
                                                label: "Area/Locality",
                                                required: true,
                                            },
                                            {
                                                key: "city",
                                                label: "City",
                                                required: true,
                                            },
                                            {
                                                key: "state",
                                                label: "State",
                                                required: true,
                                            },
                                            {
                                                key: "pincode",
                                                label: "Pincode",
                                                required: true,
                                            },
                                        ].map((field) => (
                                            <div key={field.key}>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    {field.label}{" "}
                                                    {field.required && "*"}
                                                </label>
                                                <input
                                                    name={`address.${field.key}`}
                                                    value={
                                                        editFormData.address[
                                                            field.key
                                                        ]
                                                    }
                                                    onChange={handleEditChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                                                    placeholder={`Enter ${field.label.toLowerCase()}`}
                                                    required={field.required}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Bank Details Tab */}
                            {editTab === "bank" && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[
                                            {
                                                key: "accountNumber",
                                                label: "Account Number",
                                                required: true,
                                            },
                                            {
                                                key: "accountHolderName",
                                                label: "Account Holder Name",
                                                required: true,
                                            },
                                            {
                                                key: "IFSCCode",
                                                label: "IFSC Code",
                                                required: true,
                                            },
                                            {
                                                key: "bankName",
                                                label: "Bank Name",
                                                required: true,
                                            },
                                        ].map((field) => (
                                            <div key={field.key}>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    {field.label}{" "}
                                                    {field.required && "*"}
                                                </label>
                                                <input
                                                    name={`bankDetails.${field.key}`}
                                                    value={
                                                        editFormData
                                                            .bankDetails[
                                                            field.key
                                                        ]
                                                    }
                                                    onChange={handleEditChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors font-mono"
                                                    placeholder={`Enter ${field.label.toLowerCase()}`}
                                                    required={field.required}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Skills & Services Tab */}
                            {editTab === "skills" && (
                                <div className="space-y-6">
                                    {/* Skills Selection */}
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                            Select Skills
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-2">
                                            {masterSkills.map((skill) => (
                                                <label
                                                    key={skill._id}
                                                    className="flex items-center p-3 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-colors"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedSkillIds.includes(
                                                            skill._id
                                                        )}
                                                        onChange={(e) => {
                                                            if (
                                                                e.target.checked
                                                            ) {
                                                                setSelectedSkillIds(
                                                                    (prev) => [
                                                                        ...prev,
                                                                        skill._id,
                                                                    ]
                                                                );
                                                            } else {
                                                                setSelectedSkillIds(
                                                                    (prev) =>
                                                                        prev.filter(
                                                                            (
                                                                                id
                                                                            ) =>
                                                                                id !==
                                                                                skill._id
                                                                        )
                                                                );
                                                                setEditFormData(
                                                                    (p) => ({
                                                                        ...p,
                                                                        services:
                                                                            p.services.filter(
                                                                                (
                                                                                    s
                                                                                ) =>
                                                                                    s.skillId !==
                                                                                    skill._id
                                                                            ),
                                                                    })
                                                                );
                                                            }
                                                        }}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                    <span className="ml-3 text-sm font-medium text-gray-700">
                                                        {skill.name}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Services Configuration */}
                                    {selectedSkillIds.length > 0 && (
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                Configure Services
                                            </h4>
                                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                                {selectedSkillIds.map(
                                                    (skillId) => {
                                                        const skill =
                                                            masterSkills.find(
                                                                (s) =>
                                                                    s._id ===
                                                                    skillId
                                                            );
                                                        const currentServices =
                                                            editFormData.services.filter(
                                                                (s) =>
                                                                    s.skillId ===
                                                                    skillId
                                                            );

                                                        return (
                                                            <div
                                                                key={skillId}
                                                                className="p-4 border border-gray-200 rounded-xl bg-gray-50"
                                                            >
                                                                <h5 className="font-semibold text-gray-800 mb-3 text-lg">
                                                                    {skill.name}
                                                                </h5>
                                                                <div className="space-y-4">
                                                                    {skill.services.map(
                                                                        (
                                                                            service
                                                                        ) => {
                                                                            const existing =
                                                                                currentServices.find(
                                                                                    (
                                                                                        cs
                                                                                    ) =>
                                                                                        cs.serviceId ===
                                                                                        service.serviceId
                                                                                );

                                                                            return (
                                                                                <div
                                                                                    key={
                                                                                        service.serviceId
                                                                                    }
                                                                                    className="bg-white p-4 rounded-xl border border-gray-200"
                                                                                >
                                                                                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
                                                                                        {/* Service Name */}
                                                                                        <div>
                                                                                            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                                                                                                Service
                                                                                            </label>
                                                                                            <p className="text-sm font-medium text-gray-900">
                                                                                                {
                                                                                                    service.name
                                                                                                }
                                                                                            </p>
                                                                                        </div>

                                                                                        {/* Service Details */}
                                                                                        <div className="lg:col-span-2">
                                                                                            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                                                                                                Description
                                                                                            </label>
                                                                                            <textarea
                                                                                                rows={
                                                                                                    3
                                                                                                }
                                                                                                value={
                                                                                                    existing?.details ||
                                                                                                    ""
                                                                                                }
                                                                                                onChange={(
                                                                                                    e
                                                                                                ) => {
                                                                                                    const val =
                                                                                                        e
                                                                                                            .target
                                                                                                            .value;
                                                                                                    setEditFormData(
                                                                                                        (
                                                                                                            p
                                                                                                        ) => ({
                                                                                                            ...p,
                                                                                                            services:
                                                                                                                existing
                                                                                                                    ? p.services.map(
                                                                                                                          (
                                                                                                                              s
                                                                                                                          ) =>
                                                                                                                              s.serviceId ===
                                                                                                                              service.serviceId
                                                                                                                                  ? {
                                                                                                                                        ...s,
                                                                                                                                        details:
                                                                                                                                            val,
                                                                                                                                    }
                                                                                                                                  : s
                                                                                                                      )
                                                                                                                    : [
                                                                                                                          ...p.services,
                                                                                                                          {
                                                                                                                              serviceId:
                                                                                                                                  service.serviceId,
                                                                                                                              skillId:
                                                                                                                                  skillId,
                                                                                                                              name: service.name,
                                                                                                                              details:
                                                                                                                                  val,
                                                                                                                              pricingType:
                                                                                                                                  "FIXED",
                                                                                                                              price: "",
                                                                                                                          },
                                                                                                                      ],
                                                                                                        })
                                                                                                    );
                                                                                                }}
                                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                                                                                                placeholder="Describe this service..."
                                                                                            />
                                                                                        </div>

                                                                                        {/* Pricing */}
                                                                                        <div className="grid grid-cols-2 gap-3">
                                                                                            <div>
                                                                                                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                                                                                                    Pricing
                                                                                                    Type
                                                                                                </label>
                                                                                                <select
                                                                                                    value={
                                                                                                        existing?.pricingType ||
                                                                                                        "FIXED"
                                                                                                    }
                                                                                                    onChange={(
                                                                                                        e
                                                                                                    ) => {
                                                                                                        const val =
                                                                                                            e
                                                                                                                .target
                                                                                                                .value;
                                                                                                        setEditFormData(
                                                                                                            (
                                                                                                                p
                                                                                                            ) => ({
                                                                                                                ...p,
                                                                                                                services:
                                                                                                                    existing
                                                                                                                        ? p.services.map(
                                                                                                                              (
                                                                                                                                  s
                                                                                                                              ) =>
                                                                                                                                  s.serviceId ===
                                                                                                                                  service.serviceId
                                                                                                                                      ? {
                                                                                                                                            ...s,
                                                                                                                                            pricingType:
                                                                                                                                                val,
                                                                                                                                        }
                                                                                                                                      : s
                                                                                                                          )
                                                                                                                        : [
                                                                                                                              ...p.services,
                                                                                                                              {
                                                                                                                                  serviceId:
                                                                                                                                      service.serviceId,
                                                                                                                                  skillId:
                                                                                                                                      skillId,
                                                                                                                                  name: service.name,
                                                                                                                                  details:
                                                                                                                                      "",
                                                                                                                                  pricingType:
                                                                                                                                      val,
                                                                                                                                  price: "",
                                                                                                                              },
                                                                                                                          ],
                                                                                                            })
                                                                                                        );
                                                                                                    }}
                                                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                                                                >
                                                                                                    <option value="FIXED">
                                                                                                        Fixed
                                                                                                    </option>
                                                                                                    <option value="HOURLY">
                                                                                                        Hourly
                                                                                                    </option>
                                                                                                    <option value="SQUARE_FEET">
                                                                                                        Square
                                                                                                        Feet
                                                                                                    </option>
                                                                                                    <option value="PER_UNIT">
                                                                                                        Per
                                                                                                        Unit
                                                                                                    </option>
                                                                                                </select>
                                                                                            </div>
                                                                                            <div>
                                                                                                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                                                                                                    Price
                                                                                                    (₹)
                                                                                                </label>
                                                                                                <input
                                                                                                    type="number"
                                                                                                    step="0.01"
                                                                                                    min="0"
                                                                                                    value={
                                                                                                        existing?.price ||
                                                                                                        ""
                                                                                                    }
                                                                                                    onChange={(
                                                                                                        e
                                                                                                    ) => {
                                                                                                        const val =
                                                                                                            e
                                                                                                                .target
                                                                                                                .value;
                                                                                                        setEditFormData(
                                                                                                            (
                                                                                                                p
                                                                                                            ) => ({
                                                                                                                ...p,
                                                                                                                services:
                                                                                                                    existing
                                                                                                                        ? p.services.map(
                                                                                                                              (
                                                                                                                                  s
                                                                                                                              ) =>
                                                                                                                                  s.serviceId ===
                                                                                                                                  service.serviceId
                                                                                                                                      ? {
                                                                                                                                            ...s,
                                                                                                                                            price: val,
                                                                                                                                        }
                                                                                                                                      : s
                                                                                                                          )
                                                                                                                        : [
                                                                                                                              ...p.services,
                                                                                                                              {
                                                                                                                                  serviceId:
                                                                                                                                      service.serviceId,
                                                                                                                                  skillId:
                                                                                                                                      skillId,
                                                                                                                                  name: service.name,
                                                                                                                                  details:
                                                                                                                                      "",
                                                                                                                                  pricingType:
                                                                                                                                      "FIXED",
                                                                                                                                  price: val,
                                                                                                                              },
                                                                                                                          ],
                                                                                                            })
                                                                                                        );
                                                                                                    }}
                                                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                                                                    placeholder="0.00"
                                                                                                />
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        }
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* Availability Tab */}

                            {editTab === "availability" && (
                                <div className="space-y-6">
                                    {/* Availability Status
                                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                            Availability Status
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {[
                                                {
                                                    value: "available",
                                                    label: "Available",
                                                    color: "bg-green-500",
                                                },
                                                {
                                                    value: "busy",
                                                    label: "Busy",
                                                    color: "bg-orange-500",
                                                },
                                                {
                                                    value: "off-duty",
                                                    label: "Off Duty",
                                                    color: "bg-gray-500",
                                                },
                                            ].map((status) => (
                                                <label
                                                    key={status.value}
                                                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                                        editFormData
                                                            .availability
                                                            .availabilityStatus ===
                                                        status.value
                                                            ? "border-blue-500 bg-blue-50"
                                                            : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="availabilityStatus"
                                                        value={status.value}
                                                        checked={
                                                            editFormData
                                                                .availability
                                                                .availabilityStatus ===
                                                            status.value
                                                        }
                                                        onChange={(e) =>
                                                            setEditFormData(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    availability:
                                                                        {
                                                                            ...prev.availability,
                                                                            availabilityStatus:
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                        },
                                                                })
                                                            )
                                                        }
                                                        className="hidden"
                                                    />
                                                    <div
                                                        className={`w-4 h-4 rounded-full border-2 mr-3 ${
                                                            editFormData
                                                                .availability
                                                                .availabilityStatus ===
                                                            status.value
                                                                ? "border-blue-500 bg-blue-500"
                                                                : "border-gray-300"
                                                        }`}
                                                    ></div>
                                                    <div className="flex items-center">
                                                        <div
                                                            className={`w-3 h-3 rounded-full mr-2 ${status.color}`}
                                                        ></div>
                                                        <span className="font-medium text-gray-700">
                                                            {status.label}
                                                        </span>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div> */}

                                    {/* Weekly Timetable */}
                                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                            Weekly Schedule
                                        </h4>
                                        <div className="space-y-4">
                                            {[
                                                {
                                                    day: "Monday",
                                                    key: "Monday",
                                                },
                                                {
                                                    day: "Tuesday",
                                                    key: "Tuesday",
                                                },
                                                {
                                                    day: "Wednesday",
                                                    key: "Wednesday",
                                                },
                                                {
                                                    day: "Thursday",
                                                    key: "Thursday",
                                                },
                                                {
                                                    day: "Friday",
                                                    key: "Friday",
                                                },
                                                {
                                                    day: "Saturday",
                                                    key: "Saturday",
                                                },
                                                {
                                                    day: "Sunday",
                                                    key: "Sunday",
                                                },
                                            ].map(({ day, key }) => {
                                                const daySlots =
                                                    editFormData.availability
                                                        .timetable?.[key] || [];

                                                return (
                                                    <div
                                                        key={key}
                                                        className="border border-gray-200 rounded-lg p-4"
                                                    >
                                                        <div className="flex items-center justify-between mb-3">
                                                            <label className="flex items-center cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        daySlots.length >
                                                                        0
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        const newTimetable =
                                                                            {
                                                                                ...editFormData
                                                                                    .availability
                                                                                    .timetable,
                                                                            };
                                                                        if (
                                                                            e
                                                                                .target
                                                                                .checked
                                                                        ) {
                                                                            newTimetable[
                                                                                key
                                                                            ] =
                                                                                [
                                                                                    {
                                                                                        start: "09:00",
                                                                                        end: "18:00",
                                                                                    },
                                                                                ];
                                                                        } else {
                                                                            delete newTimetable[
                                                                                key
                                                                            ];
                                                                        }
                                                                        setEditFormData(
                                                                            (
                                                                                prev
                                                                            ) => ({
                                                                                ...prev,
                                                                                availability:
                                                                                    {
                                                                                        ...prev.availability,
                                                                                        timetable:
                                                                                            newTimetable,
                                                                                    },
                                                                            })
                                                                        );
                                                                    }}
                                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                                />
                                                                <span className="ml-3 font-medium text-gray-900">
                                                                    {day}
                                                                </span>
                                                            </label>
                                                            {daySlots.length >
                                                                0 && (
                                                                <span className="text-sm text-green-600 font-medium">
                                                                    {
                                                                        daySlots.length
                                                                    }{" "}
                                                                    time slot
                                                                    {daySlots.length !==
                                                                    1
                                                                        ? "s"
                                                                        : ""}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {daySlots.length >
                                                            0 && (
                                                            <div className="space-y-3">
                                                                {daySlots.map(
                                                                    (
                                                                        slot,
                                                                        index
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg"
                                                                        >
                                                                            <div className="flex-1 grid grid-cols-2 gap-3">
                                                                                <div>
                                                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                                        Start
                                                                                        Time
                                                                                    </label>
                                                                                    <input
                                                                                        type="time"
                                                                                        value={
                                                                                            slot.start
                                                                                        }
                                                                                        onChange={(
                                                                                            e
                                                                                        ) => {
                                                                                            const newTimetable =
                                                                                                {
                                                                                                    ...editFormData
                                                                                                        .availability
                                                                                                        .timetable,
                                                                                                };
                                                                                            newTimetable[
                                                                                                key
                                                                                            ][
                                                                                                index
                                                                                            ].start =
                                                                                                e.target.value;
                                                                                            setEditFormData(
                                                                                                (
                                                                                                    prev
                                                                                                ) => ({
                                                                                                    ...prev,
                                                                                                    availability:
                                                                                                        {
                                                                                                            ...prev.availability,
                                                                                                            timetable:
                                                                                                                newTimetable,
                                                                                                        },
                                                                                                })
                                                                                            );
                                                                                        }}
                                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                                                    />
                                                                                </div>
                                                                                <div>
                                                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                                        End
                                                                                        Time
                                                                                    </label>
                                                                                    <input
                                                                                        type="time"
                                                                                        value={
                                                                                            slot.end
                                                                                        }
                                                                                        onChange={(
                                                                                            e
                                                                                        ) => {
                                                                                            const newTimetable =
                                                                                                {
                                                                                                    ...editFormData
                                                                                                        .availability
                                                                                                        .timetable,
                                                                                                };
                                                                                            newTimetable[
                                                                                                key
                                                                                            ][
                                                                                                index
                                                                                            ].end =
                                                                                                e.target.value;
                                                                                            setEditFormData(
                                                                                                (
                                                                                                    prev
                                                                                                ) => ({
                                                                                                    ...prev,
                                                                                                    availability:
                                                                                                        {
                                                                                                            ...prev.availability,
                                                                                                            timetable:
                                                                                                                newTimetable,
                                                                                                        },
                                                                                                })
                                                                                            );
                                                                                        }}
                                                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    const newTimetable =
                                                                                        {
                                                                                            ...editFormData
                                                                                                .availability
                                                                                                .timetable,
                                                                                        };
                                                                                    newTimetable[
                                                                                        key
                                                                                    ].splice(
                                                                                        index,
                                                                                        1
                                                                                    );
                                                                                    if (
                                                                                        newTimetable[
                                                                                            key
                                                                                        ]
                                                                                            .length ===
                                                                                        0
                                                                                    ) {
                                                                                        delete newTimetable[
                                                                                            key
                                                                                        ];
                                                                                    }
                                                                                    setEditFormData(
                                                                                        (
                                                                                            prev
                                                                                        ) => ({
                                                                                            ...prev,
                                                                                            availability:
                                                                                                {
                                                                                                    ...prev.availability,
                                                                                                    timetable:
                                                                                                        newTimetable,
                                                                                                },
                                                                                        })
                                                                                    );
                                                                                }}
                                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                            >
                                                                                <svg
                                                                                    className="w-4 h-4"
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

                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newTimetable =
                                                                            {
                                                                                ...editFormData
                                                                                    .availability
                                                                                    .timetable,
                                                                            };
                                                                        if (
                                                                            !newTimetable[
                                                                                key
                                                                            ]
                                                                        ) {
                                                                            newTimetable[
                                                                                key
                                                                            ] =
                                                                                [];
                                                                        }
                                                                        newTimetable[
                                                                            key
                                                                        ].push({
                                                                            start: "09:00",
                                                                            end: "18:00",
                                                                        });
                                                                        setEditFormData(
                                                                            (
                                                                                prev
                                                                            ) => ({
                                                                                ...prev,
                                                                                availability:
                                                                                    {
                                                                                        ...prev.availability,
                                                                                        timetable:
                                                                                            newTimetable,
                                                                                    },
                                                                            })
                                                                        );
                                                                    }}
                                                                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-blue-600 font-medium text-sm"
                                                                >
                                                                    + Add
                                                                    Another Time
                                                                    Slot
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Non-Availability Dates */}
                                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                            Non-Available Dates
                                        </h4>

                                        {/* Add New Non-Available Date */}
                                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mb-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-orange-800 mb-1">
                                                        Date
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={
                                                            newNonAvailableDate
                                                        }
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
                                                        className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-orange-800 mb-1">
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
                                                        className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-sm"
                                                    />
                                                </div>
                                                <div className="flex items-end">
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            addNonAvailableDate
                                                        }
                                                        disabled={
                                                            !newNonAvailableDate
                                                        }
                                                        className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Add Date
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Non-Available Dates List */}
                                        {editFormData.availability
                                            .nonAvailability.length > 0 && (
                                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                                {editFormData.availability.nonAvailability.map(
                                                    (date, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                                                <div>
                                                                    <div className="font-medium text-gray-900 text-sm">
                                                                        {new Date(
                                                                            date.startDateTime
                                                                        ).toLocaleDateString(
                                                                            "en-IN",
                                                                            {
                                                                                weekday:
                                                                                    "short",
                                                                                year: "numeric",
                                                                                month: "short",
                                                                                day: "numeric",
                                                                            }
                                                                        )}
                                                                    </div>
                                                                    {date.reason && (
                                                                        <div className="text-xs text-gray-600 mt-1">
                                                                            {
                                                                                date.reason
                                                                            }
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeNonAvailableDate(
                                                                        index
                                                                    )
                                                                }
                                                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            >
                                                                <svg
                                                                    className="w-4 h-4"
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
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center justify-center"
                                >
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                    Cancel
                                </button>
                                {editTab === "personal" && (
                                    <button
                                        type="button"
                                        onClick={savePersonal}
                                        disabled={saveLoading.personal}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50"
                                    >
                                        {saveLoading.personal ? (
                                            <>
                                                <svg
                                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <svg
                                                    className="w-4 h-4 mr-2"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                                Save Personal Details
                                            </>
                                        )}
                                    </button>
                                )}
                                {editTab === "address" && (
                                    <button
                                        type="button"
                                        onClick={saveAddress}
                                        disabled={saveLoading.address}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50"
                                    >
                                        {saveLoading.address ? (
                                            <>
                                                <svg
                                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <svg
                                                    className="w-4 h-4 mr-2"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                                Save Address
                                            </>
                                        )}
                                    </button>
                                )}
                                {editTab === "bank" && (
                                    <button
                                        type="button"
                                        onClick={saveBank}
                                        disabled={saveLoading.bank}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50"
                                    >
                                        {saveLoading.bank ? (
                                            <>
                                                <svg
                                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <svg
                                                    className="w-4 h-4 mr-2"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                                Save Bank Details
                                            </>
                                        )}
                                    </button>
                                )}
                                {editTab === "skills" && (
                                    <button
                                        type="button"
                                        onClick={saveSkillsAndServices}
                                        disabled={saveLoading.skills}
                                        className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50"
                                    >
                                        {saveLoading.skills ? (
                                            <>
                                                <svg
                                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <svg
                                                    className="w-4 h-4 mr-2"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                                Save Skills & Services
                                            </>
                                        )}
                                    </button>
                                )}
                                {/* Availability Tab */}
                                {editTab === "availability" && (
                                    <button
                                        type="button"
                                        onClick={saveAvailability}
                                        disabled={saveLoading.availability}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50"
                                    >
                                        {saveLoading.availability ? (
                                            <>
                                                <svg
                                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <svg
                                                    className="w-4 h-4 mr-2"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                                Save Availability
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Suspend Confirmation Modal */}
            {showSuspendModal && (
                <div className="absolute inset-0 bg-white/20 backdrop-blur-lg shadow-xl rounded-xl flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-scaleIn">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                                <svg
                                    className="w-5 h-5 mr-2 text-amber-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                </svg>
                                Suspend Worker
                            </h3>
                            <button
                                onClick={() => {
                                    setShowSuspendModal(false);
                                    setSuspendWorkerData({
                                        id: null,
                                        name: "",
                                        reason: "",
                                    });
                                }}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-4">
                                <p className="text-gray-700 mb-2">
                                    You are about to suspend{" "}
                                    <span className="font-semibold text-gray-900">
                                        {suspendWorkerData.name}
                                    </span>
                                    .
                                </p>
                                <p className="text-sm text-gray-600 mb-4">
                                    Please provide a reason for suspension. This
                                    will be recorded and visible to the worker.
                                </p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Reason for Suspension *
                                </label>
                                <textarea
                                    value={suspendWorkerData.reason}
                                    onChange={(e) =>
                                        setSuspendWorkerData((prev) => ({
                                            ...prev,
                                            reason: e.target.value,
                                        }))
                                    }
                                    placeholder="Enter the reason for suspending this worker..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white transition-colors resize-none"
                                    rows="4"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                    Minimum 10 characters required
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => {
                                        setShowSuspendModal(false);
                                        setSuspendWorkerData({
                                            id: null,
                                            name: "",
                                            reason: "",
                                        });
                                    }}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmSuspendWorker}
                                    disabled={
                                        !suspendWorkerData.reason.trim() ||
                                        suspendWorkerData.reason.trim().length <
                                            10 ||
                                        actionLoading === suspendWorkerData.id
                                    }
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {actionLoading === suspendWorkerData.id ? (
                                        <>
                                            <svg
                                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Suspending...s
                                        </>
                                    ) : (
                                        "Confirm Suspend"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkerManagement;
