// components/NonSmartphoneWorkers.js
import React, { useState, useEffect, useMemo } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import {
  Search,
  RefreshCw,
  Phone,
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Wrench,
  Trophy,
  MoreHorizontal,
  Eye,
  IndianRupee,
  CreditCard,
  User,
  Briefcase,
  FileText,
  Shield,
  Star,
  AlertCircle,
  Edit3,
  Trash2,
  ChevronRight,
  Info,
  Home,
  Navigation
} from "lucide-react";

const NonSmartphoneWorkers = () => {
    const [activeTab, setActiveTab] = useState("workerProfiles");
    const [workers, setWorkers] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [workerJobs, setWorkerJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [newStatus, setNewStatus] = useState("");
    const [remarks, setRemarks] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("CASH");

    // Safe Date Formatter
    const safeFormat = (dateStr, fallback = "—") => {
        if (!dateStr) return fallback;
        try {
            const d = new Date(dateStr);
            return isNaN(d.getTime()) ? fallback : format(d, "dd MMM, yyyy");
        } catch {
            return fallback;
        }
    };

    // Safe Time Formatter
    const safeTimeFormat = (timeStr, fallback = "—") => {
        if (!timeStr) return fallback;
        return timeStr;
    };

    // Safe DateTime Formatter
    const safeDateTimeFormat = (dateStr, fallback = "—") => {
        if (!dateStr) return fallback;
        try {
            const d = new Date(dateStr);
            return isNaN(d.getTime()) ? fallback : format(d, "dd MMM, yyyy 'at' hh:mm a");
        } catch {
            return fallback;
        }
    };

    // FETCH ALL WORKERS
    // components/NonSmartphoneWorkerDashboard.js - Updated fetch function

const fetchWorkers = async () => {
  try {
    setLoading(true);
    const { data } = await axiosInstance.get("/api/service-agent/workers-with-pending-bookings");
    
    if (data.success) {
      if (Array.isArray(data.data)) {
        setWorkers(data.data);
      } else {
        setWorkers([]);
      }
    } else {
      setWorkers([]);
    }
  } catch (error) {
    console.error("Fetch workers with pending bookings error:", error);
    toast.error("Failed to load workers with pending bookings");
    setWorkers([]);
  } finally {
    setLoading(false);
  }
};



    // FETCH WORKER'S JOBS
    const fetchWorkerJobs = async (workerId) => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get(`/api/service-agent/bookings/${workerId}`);
            
            if (data.success) {
                let bookings = [];
                
                if (Array.isArray(data.data)) {
                    bookings = data.data;
                } else if (data.data && Array.isArray(data.data.bookings)) {
                    bookings = data.data.bookings;
                } else if (Array.isArray(data.bookings)) {
                    bookings = data.bookings;
                } else if (data.data && data.data.bookings) {
                    bookings = data.data.bookings;
                }
                
                setWorkerJobs(bookings);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Fetch worker jobs error:", error);
            toast.error("Failed to load worker jobs");
            setWorkerJobs([]);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // OPEN WORKER PROFILE
    const openWorkerProfile = async (worker) => {
        setSelectedWorker(worker);
        const success = await fetchWorkerJobs(worker._id);
        if (success) {
            setActiveTab("workerProfile");
        }
    };

    // GO BACK TO WORKERS LIST
    const goBackToWorkers = () => {
        setSelectedWorker(null);
        setWorkerJobs([]);
        setActiveTab("workerProfiles");
    };

    useEffect(() => {
        if (activeTab === "workerProfiles") {
            fetchWorkers();
        }
    }, [activeTab]);

    // FILTER WORKERS
    const filteredWorkers = useMemo(() => {
        if (!searchQuery) return workers;
        const q = searchQuery.toLowerCase();
        return workers.filter((worker) =>
            worker.name?.toLowerCase().includes(q) ||
            worker.phone?.includes(q) ||
            worker.email?.toLowerCase().includes(q)
        );
    }, [workers, searchQuery]);

    // FILTER WORKER JOBS BY STATUS
    const getWorkerJobsByStatus = (status) => {
        if (!workerJobs.length) return [];
        return workerJobs.filter(job => job.status === status);
    };

    // QUICK ACTIONS
    const handleQuickAction = async (booking, action) => {
        setActionLoading(true);
        try {
            let status = action;
            let remarks = "";

            switch (action) {
                case "ACCEPTED":
                    remarks = "Job accepted by agent";
                    break;
                case "DECLINED":
                    remarks = "Job declined by agent";
                    break;
                case "PAYMENT_PENDING":
                    remarks = "Work started";
                    break;
                case "COMPLETED":
                    remarks = "Work completed successfully";
                    break;
            }

            const { data } = await axiosInstance.patch(
                `/api/service-agent/bookings/${booking._id}/status`,
                { status, remarks, updatedBy: "agent" }
            );

            if (data.success) {
                toast.success(`Job ${action.toLowerCase().replace('_', ' ')}`);
                if (selectedWorker) {
                    await fetchWorkerJobs(selectedWorker._id);
                }
            }
        } catch (error) {
            toast.error("Action failed");
        } finally {
            setActionLoading(false);
        }
    };

    // UPDATE JOB STATUS
    const updateStatus = async () => {
        if (!newStatus) return toast.error("Select a status");
        setActionLoading(true);
        try {
            const { data } = await axiosInstance.patch(
                `/api/service-agent/bookings/${selectedBooking._id}/status`,
                { status: newStatus, remarks, updatedBy: "agent" }
            );
            if (data.success) {
                toast.success("Status updated");
                if (selectedWorker) {
                    await fetchWorkerJobs(selectedWorker._id);
                }
                setShowStatusModal(false);
                setRemarks("");
            }
        } catch (error) {
            toast.error("Update failed");
        } finally {
            setActionLoading(false);
        }
    };

    // UPDATE PAYMENT STATUS
    const updatePaymentStatus = async () => {
        setActionLoading(true);
        try {
            const { data } = await axiosInstance.patch(
                `/api/service-agent/bookings/${selectedBooking._id}/payment`,
                { 
                    paymentType: paymentMethod,
                    status: "COMPLETED",
                    updatedBy: "agent"
                }
            );
            if (data.success) {
                toast.success("Payment status updated");
                if (selectedWorker) {
                    await fetchWorkerJobs(selectedWorker._id);
                }
                setShowPaymentModal(false);
            }
        } catch (error) {
            toast.error("Payment update failed");
        } finally {
            setActionLoading(false);
        }
    };

    const openStatusModal = (booking) => {
        setSelectedBooking(booking);
        setNewStatus(booking.status);
        setRemarks("");
        setShowStatusModal(true);
    };

    const openDetailsModal = (booking) => {
        setSelectedBooking(booking);
        setShowDetailsModal(true);
    };

    const openPaymentModal = (booking) => {
        setSelectedBooking(booking);
        setShowPaymentModal(true);
    };

    // PROGRESS TRACKER COMPONENT
    const ProgressTracker = ({ job }) => {
        const steps = [
            { key: "PENDING", label: "Pending", icon: <Clock className="w-3 h-3" /> },
            { key: "ACCEPTED", label: "Accepted", icon: <CheckCircle className="w-3 h-3" /> },
            { key: "PAYMENT_PENDING", label: "In Progress", icon: <Wrench className="w-3 h-3" /> },
            { key: "COMPLETED", label: "Completed", icon: <Trophy className="w-3 h-3" /> }
        ];

        const currentStepIndex = steps.findIndex(step => step.key === job.status);

        return (
            <div className="flex items-center justify-between mb-3">
                {steps.map((step, index) => (
                    <div key={step.key} className="flex flex-col items-center flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            index < currentStepIndex 
                                ? "bg-green-500 text-white" 
                                : index === currentStepIndex 
                                ? "bg-blue-500 text-white animate-pulse"
                                : "bg-gray-200 text-gray-500"
                        }`}>
                            {index < currentStepIndex ? "✓" : step.icon}
                        </div>
                        <span className={`text-xs mt-1 text-center ${
                            index <= currentStepIndex ? "text-gray-900 font-medium" : "text-gray-500"
                        }`}>
                            {step.label}
                        </span>
                        {index < steps.length - 1 && (
                            <div className={`h-0.5 w-full mt-3 ${
                                index < currentStepIndex ? "bg-green-500" : "bg-gray-200"
                            }`} />
                        )}
                    </div>
                ))}
            </div>
        );
    };

    // GET ACTION BUTTONS BASED ON CURRENT STATUS
    const getActionButtons = (job) => {
        const actions = [];
        
        switch (job.status) {
            case "PENDING":
                actions.push(
                    {
                        label: "Accept Job",
                        color: "bg-green-600 hover:bg-green-700",
                        action: "ACCEPTED",
                        icon: <CheckCircle className="w-4 h-4" />
                    },
                    {
                        label: "Decline",
                        color: "bg-red-600 hover:bg-red-700",
                        action: "DECLINED", 
                        icon: <XCircle className="w-4 h-4" />
                    }
                );
                break;
                
            case "ACCEPTED":
                actions.push({
                    label: "Start Work",
                    color: "bg-blue-600 hover:bg-blue-700",
                    action: "PAYMENT_PENDING",
                    icon: <Wrench className="w-4 h-4" />
                });
                break;
                
            case "PAYMENT_PENDING":
                actions.push({
                    label: "Mark Complete", 
                    color: "bg-purple-600 hover:bg-purple-700",
                    action: "COMPLETED",
                    icon: <Trophy className="w-4 h-4" />
                });
                break;
                
            default:
                actions.push({
                    label: "Update Status",
                    color: "bg-amber-600 hover:bg-amber-700",
                    action: "MODAL",
                    icon: <Edit3 className="w-4 h-4" />
                });
        }
        
        return actions;
    };

    // WORKER PROFILE VIEW
    const WorkerProfileView = () => {
        if (!selectedWorker) return null;

        const pendingJobs = getWorkerJobsByStatus("PENDING");
        const acceptedJobs = getWorkerJobsByStatus("ACCEPTED");
        const inProgressJobs = getWorkerJobsByStatus("PAYMENT_PENDING");
        const completedJobs = getWorkerJobsByStatus("COMPLETED");
        const activeJobs = [...acceptedJobs, ...inProgressJobs];

        return (
            <div className="space-y-4">
                {/* Worker Header */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <button
                            onClick={goBackToWorkers}
                            className="flex items-center text-blue-600 font-medium text-sm hover:text-blue-700"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Workers
                        </button>
                        <button
                            onClick={() => fetchWorkerJobs(selectedWorker._id)}
                            disabled={actionLoading}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                        >
                            <RefreshCw className="w-3 h-3" />
                            Refresh
                        </button>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {selectedWorker.name?.[0]?.toUpperCase() || "W"}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-gray-900">{selectedWorker.name}</h2>
                            <p className="text-gray-600 text-sm flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {selectedWorker.phone}
                            </p>
                            <p className="text-gray-500 text-xs flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {selectedWorker.email || "No email"}
                            </p>
                        </div>
                        <a
                            href={`tel:${selectedWorker.phone}`}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center gap-1"
                        >
                            <Phone className="w-4 h-4" />
                            Call Worker
                        </a>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 shadow-sm">
                        <p className="text-yellow-800 font-bold text-xl">{pendingJobs.length}</p>
                        <p className="text-yellow-600 text-xs font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Pending
                        </p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 shadow-sm">
                        <p className="text-blue-800 font-bold text-xl">{activeJobs.length}</p>
                        <p className="text-blue-600 text-xs font-medium flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            Active
                        </p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200 shadow-sm">
                        <p className="text-green-800 font-bold text-xl">{completedJobs.length}</p>
                        <p className="text-green-600 text-xs font-medium flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            Completed
                        </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 shadow-sm">
                        <p className="text-purple-800 font-bold text-xl">{workerJobs.length}</p>
                        <p className="text-purple-600 text-xs font-medium flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            Total Jobs
                        </p>
                    </div>
                </div>

                {/* Pending Jobs */}
                {pendingJobs.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                            Pending Acceptance ({pendingJobs.length})
                        </h3>
                        <div className="space-y-3">
                            {pendingJobs.map(job => (
                                <JobCard key={job._id} job={job} onQuickAction={handleQuickAction} onUpdateStatus={openStatusModal} onViewDetails={openDetailsModal} onUpdatePayment={openPaymentModal} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Active Jobs */}
                {activeJobs.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            Active Jobs ({activeJobs.length})
                        </h3>
                        <div className="space-y-3">
                            {activeJobs.map(job => (
                                <JobCard key={job._id} job={job} onQuickAction={handleQuickAction} onUpdateStatus={openStatusModal} onViewDetails={openDetailsModal} onUpdatePayment={openPaymentModal} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Completed Jobs */}
                {completedJobs.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Completed ({completedJobs.length})
                        </h3>
                        <div className="space-y-3">
                            {completedJobs.map(job => (
                                <JobCard key={job._id} job={job} onQuickAction={handleQuickAction} onUpdateStatus={openStatusModal} onViewDetails={openDetailsModal} onUpdatePayment={openPaymentModal} />
                            ))}
                        </div>
                    </div>
                )}

                {workerJobs.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-900 font-medium">No jobs assigned</p>
                        <p className="text-gray-600 text-sm mt-1">This worker doesn't have any jobs yet</p>
                    </div>
                )}
            </div>
        );
    };

    // JOB CARD COMPONENT
    const JobCard = ({ job, onQuickAction, onUpdateStatus, onViewDetails, onUpdatePayment }) => {
        const customer = job.customer || {};
        const service = job.serviceDetails || {};
        const actions = getActionButtons(job);

        return (
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all">
                {/* Progress Tracker */}
                <ProgressTracker job={job} />

                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {customer.name?.[0]?.toUpperCase() || "C"}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">{customer.name || "—"}</h4>
                                <p className="text-gray-600 text-xs flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {customer.phone || "—"}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            job.status === "PENDING" ? "bg-yellow-100 text-yellow-800 border border-yellow-200" :
                            job.status === "ACCEPTED" ? "bg-blue-100 text-blue-800 border border-blue-200" :
                            job.status === "PAYMENT_PENDING" ? "bg-purple-100 text-purple-800 border border-purple-200" :
                            job.status === "COMPLETED" ? "bg-green-100 text-green-800 border border-green-200" :
                            "bg-red-100 text-red-800 border border-red-200"
                        }`}>
                            {job.status?.replace("_", " ")}
                        </span>
                        <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {safeFormat(job.bookingInfo?.date)} • {safeTimeFormat(job.bookingInfo?.time)}
                        </p>
                    </div>
                </div>

                {/* Service Details */}
                <div className="bg-blue-50 p-3 rounded-lg mb-3 border border-blue-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-gray-900 text-sm">{service.skillName || service.name || "—"}</p>
                            <p className="text-gray-600 text-xs">{service.serviceName || "General Service"}</p>
                        </div>
                        <p className="font-bold text-green-600 text-lg flex items-center gap-1">
                            <IndianRupee className="w-4 h-4" />
                            {service.price || job.price || 0}
                        </p>
                    </div>
                </div>

                {/* Customer Address */}
                <div className="bg-gray-50 p-3 rounded-lg mb-3 border border-gray-100">
                    <p className="font-semibold text-gray-800 text-xs mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Customer Address
                    </p>
                    <p className="text-gray-700 text-xs">
                        {customer.address?.area || "—"}, {customer.address?.city || "—"}
                    </p>
                    <p className="text-gray-600 text-xs">
                        {customer.address?.state || "—"} - {customer.address?.pincode || "—"}
                    </p>
                    <a
                        href={`tel:${customer.phone}`}
                        className="text-blue-600 font-medium mt-1 inline-block text-xs hover:text-blue-700 flex items-center gap-1"
                    >
                        <Phone className="w-3 h-3" />
                        {customer.phone ? customer.phone : "No phone number"}
                    </a>
                </div>

                {/* Booking Timeline */}
                <div className="bg-gray-50 p-3 rounded-lg mb-3 border border-gray-100">
                    <p className="font-semibold text-gray-800 text-xs mb-2 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Booking Timeline
                    </p>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-xs font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Scheduled:
                            </span>
                            <span className="text-gray-700 text-xs">
                                {safeFormat(job.bookingInfo?.date)} • {safeTimeFormat(job.bookingInfo?.time)}
                            </span>
                        </div>

                        {job.timeline?.serviceInitiatedAt && (
                            <div className="flex justify-between items-center">
                                <span className="text-blue-600 text-xs font-medium flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Accepted:
                                </span>
                                <span className="text-blue-700 text-xs">
                                    {safeFormat(job.timeline.serviceInitiatedAt)}
                                </span>
                            </div>
                        )}

                        {job.timeline?.serviceStartedAt && (
                            <div className="flex justify-between items-center">
                                <span className="text-purple-600 text-xs font-medium flex items-center gap-1">
                                    <Wrench className="w-3 h-3" />
                                    Work Started:
                                </span>
                                <span className="text-purple-700 text-xs">
                                    {safeFormat(job.timeline.serviceStartedAt)}
                                </span>
                            </div>
                        )}

                        {job.timeline?.serviceCompletedAt && (
                            <div className="flex justify-between items-center">
                                <span className="text-green-600 text-xs font-medium flex items-center gap-1">
                                    <Trophy className="w-3 h-3" />
                                    Completed:
                                </span>
                                <span className="text-green-700 text-xs">
                                    {safeFormat(job.timeline.serviceCompletedAt)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        {actions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => action.action === "MODAL" ? onUpdateStatus(job) : onQuickAction(job, action.action)}
                                disabled={actionLoading}
                                className={`flex-1 py-2.5 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${action.color} disabled:opacity-50`}
                            >
                                {action.icon} {action.label}
                            </button>
                        ))}
                    </div>
                    
                    {/* Additional Options */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => onViewDetails(job)}
                            className="flex-1 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-1"
                        >
                            <Eye className="w-3 h-3" />
                            View Details
                        </button>
                        <button
                            onClick={() => onUpdatePayment(job)}
                            className="flex-1 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-1"
                        >
                            <CreditCard className="w-3 h-3" />
                            Payment
                        </button>
                    </div>

                    {/* Utility Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => onUpdateStatus(job)}
                            className="flex-1 py-2 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 font-medium border border-gray-300 flex items-center justify-center gap-1"
                        >
                            <Edit3 className="w-3 h-3" />
                            More Options
                        </button>
                        <a
                            href={`https://maps.google.com/?q=${customer.address?.area},${customer.address?.city}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium flex items-center gap-1"
                        >
                            <Navigation className="w-3 h-3" />
                            Maps
                        </a>
                    </div>
                </div>
            </div>
        );
    };

    // WORKER LIST CARD
    const WorkerCard = ({ worker }) => {
        return (
            <div 
                onClick={() => openWorkerProfile(worker)}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
            >
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {worker.name?.[0]?.toUpperCase() || "W"}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-sm">{worker.name}</h3>
                        <p className="text-gray-600 text-xs flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {worker.phone}
                        </p>
                        <p className="text-gray-500 text-xs truncate flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {worker.email || "No email"}
                        </p>
                        <div className="flex gap-2 mt-1">
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                                <Briefcase className="w-2 h-2" />
                                {worker.workerProfile?.services?.length || 0} services
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 ${
                                worker.workerProfile?.verification?.status === "APPROVED" 
                                    ? "bg-green-100 text-green-700" 
                                    : "bg-yellow-100 text-yellow-700"
                            }`}>
                                <Shield className="w-2 h-2" />
                                {worker.workerProfile?.verification?.status || "PENDING"}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`w-3 h-3 rounded-full animate-pulse mb-1 ${
                            worker.workerProfile?.availabilityStatus === "available" 
                                ? "bg-green-500" 
                                : "bg-gray-400"
                        }`}></div>
                        <span className="text-[10px] text-gray-500 font-medium capitalize">
                            {worker.workerProfile?.availabilityStatus || "unknown"}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    // SKELETON LOADER
    const SkeletonLoader = () => (
        <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg p-4 animate-pulse border border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    // DETAILS MODAL
    const DetailsModal = () => {
        if (!selectedBooking) return null;
        
        const customer = selectedBooking.customer || {};
        const service = selectedBooking.serviceDetails || {};
        const worker = selectedBooking.worker || {};
        const payment = selectedBooking.payment || {};

        return (
            <div className="fixed inset-0 bg-black/60 flex items-end justify-center p-0 z-50 sm:items-center sm:p-4">
                <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Booking Details</h3>
                                <p className="text-gray-600 text-sm mt-1">
                                    Booking ID: #{selectedBooking._id?.slice(-8) || "—"}
                                </p>
                            </div>
                            <button 
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Customer Details */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600" />
                                    Customer Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Name</p>
                                        <p className="font-medium text-gray-900">{customer.name || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Phone</p>
                                        <p className="font-medium text-gray-900 flex items-center gap-1">
                                            <Phone className="w-4 h-4" />
                                            {customer.phone || "—"}
                                        </p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-gray-600">Address</p>
                                        <p className="font-medium text-gray-900">
                                            {customer.address?.houseNo && `${customer.address.houseNo}, `}
                                            {customer.address?.street && `${customer.address.street}, `}
                                            {customer.address?.area || "—"}, {customer.address?.city || "—"}
                                            <br />
                                            {customer.address?.state || "—"} - {customer.address?.pincode || "—"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Worker Details */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-blue-600" />
                                    Worker Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Name</p>
                                        <p className="font-medium text-gray-900">{worker.name || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Phone</p>
                                        <p className="font-medium text-gray-900 flex items-center gap-1">
                                            <Phone className="w-4 h-4" />
                                            {worker.phone || "—"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Email</p>
                                        <p className="font-medium text-gray-900">{worker.email || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Status</p>
                                        <p className="font-medium text-gray-900 capitalize">
                                            {worker.availabilityStatus || "—"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Service Details */}
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <Wrench className="w-5 h-5 text-green-600" />
                                    Service Details
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Skill</p>
                                        <p className="font-medium text-gray-900">{service.skillName || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Service</p>
                                        <p className="font-medium text-gray-900">{service.serviceName || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Category</p>
                                        <p className="font-medium text-gray-900">{service.category || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Price</p>
                                        <p className="font-bold text-green-600 text-lg flex items-center gap-1">
                                            <IndianRupee className="w-4 h-4" />
                                            {service.price || 0}
                                        </p>
                                    </div>
                                    {service.description && (
                                        <div className="md:col-span-2">
                                            <p className="text-gray-600">Description</p>
                                            <p className="font-medium text-gray-900">{service.description}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-purple-600" />
                                    Payment Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Amount</p>
                                        <p className="font-bold text-green-600 text-lg flex items-center gap-1">
                                            <IndianRupee className="w-4 h-4" />
                                            {payment.amount || service.price || 0}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Status</p>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            payment.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                                            payment.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                                            "bg-red-100 text-red-800"
                                        }`}>
                                            {payment.status || "PENDING"}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Payment Type</p>
                                        <p className="font-medium text-gray-900">{payment.paymentType || "—"}</p>
                                    </div>
                                    {payment.transactionId && (
                                        <div>
                                            <p className="text-gray-600">Transaction ID</p>
                                            <p className="font-medium text-gray-900 font-mono text-xs">{payment.transactionId}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-orange-600" />
                                    Booking Timeline
                                </h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Created</span>
                                        <span className="font-medium text-gray-900">{safeDateTimeFormat(selectedBooking.createdAt)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Scheduled</span>
                                        <span className="font-medium text-gray-900">
                                            {safeFormat(selectedBooking.bookingInfo?.date)} at {safeTimeFormat(selectedBooking.bookingInfo?.time)}
                                        </span>
                                    </div>
                                    {selectedBooking.timeline?.serviceInitiatedAt && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-blue-600">Accepted</span>
                                            <span className="font-medium text-blue-700">{safeDateTimeFormat(selectedBooking.timeline.serviceInitiatedAt)}</span>
                                        </div>
                                    )}
                                    {selectedBooking.timeline?.serviceStartedAt && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-purple-600">Work Started</span>
                                            <span className="font-medium text-purple-700">{safeDateTimeFormat(selectedBooking.timeline.serviceStartedAt)}</span>
                                        </div>
                                    )}
                                    {selectedBooking.timeline?.serviceCompletedAt && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-green-600">Completed</span>
                                            <span className="font-medium text-green-700">{safeDateTimeFormat(selectedBooking.timeline.serviceCompletedAt)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-6 mt-6 border-t border-gray-200">
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium text-sm flex items-center justify-center gap-2"
                            >
                                <XCircle className="w-4 h-4" />
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    openPaymentModal(selectedBooking);
                                }}
                                className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium text-sm flex items-center justify-center gap-2"
                            >
                                <CreditCard className="w-4 h-4" />
                                Update Payment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // PAYMENT MODAL
    const PaymentModal = () => {
        if (!selectedBooking) return null;
        
        const service = selectedBooking.serviceDetails || {};

        return (
            <div className="fixed inset-0 bg-black/60 flex items-end justify-center p-0 z-50 sm:items-center sm:p-4">
                <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-full sm:max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Update Payment</h3>
                                <p className="text-gray-600 text-sm mt-1">
                                    Amount: <span className="font-bold text-green-600">₹{service.price || 0}</span>
                                </p>
                            </div>
                            <button 
                                onClick={() => setShowPaymentModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Payment Method Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Payment Method *</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setPaymentMethod("CASH")}
                                        className={`p-4 border-2 rounded-xl text-center transition-all ${
                                            paymentMethod === "CASH" 
                                                ? "border-green-500 bg-green-50" 
                                                : "border-gray-300 bg-white hover:border-gray-400"
                                        }`}
                                    >
                                        <IndianRupee className={`w-8 h-8 mx-auto mb-2 ${
                                            paymentMethod === "CASH" ? "text-green-600" : "text-gray-400"
                                        }`} />
                                        <p className={`font-medium ${
                                            paymentMethod === "CASH" ? "text-green-700" : "text-gray-700"
                                        }`}>Cash</p>
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod("RAZORPAY")}
                                        className={`p-4 border-2 rounded-xl text-center transition-all ${
                                            paymentMethod === "RAZORPAY" 
                                                ? "border-blue-500 bg-blue-50" 
                                                : "border-gray-300 bg-white hover:border-gray-400"
                                        }`}
                                    >
                                        <CreditCard className={`w-8 h-8 mx-auto mb-2 ${
                                            paymentMethod === "RAZORPAY" ? "text-blue-600" : "text-gray-400"
                                        }`} />
                                        <p className={`font-medium ${
                                            paymentMethod === "RAZORPAY" ? "text-blue-700" : "text-gray-700"
                                        }`}>UPI</p>
                                    </button>
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <Info className="w-4 h-4" />
                                    Payment Summary
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Service Amount</span>
                                        <span className="font-medium text-gray-900">₹{service.price || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Payment Method</span>
                                        <span className="font-medium text-gray-900 capitalize">{paymentMethod}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-gray-200">
                                        <span className="text-gray-900 font-semibold">Total Amount</span>
                                        <span className="font-bold text-green-600 text-lg">₹{service.price || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-6 mt-6 border-t border-gray-200">
                            <button
                                onClick={updatePaymentStatus}
                                disabled={actionLoading}
                                className="w-full py-3.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {actionLoading ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <CheckCircle className="w-4 h-4" />
                                )}
                                {actionLoading ? "Processing..." : "Confirm Payment"}
                            </button>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium text-sm flex items-center justify-center gap-2"
                            >
                                <XCircle className="w-4 h-4" />
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-3 space-y-4">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            {selectedWorker ? `${selectedWorker.name}'s Dashboard` : "Non-Smartphone Workers"}
                        </h1>
                        <p className="text-gray-600 text-sm mt-1">
                            {selectedWorker ? "Manage all jobs and track progress" : "Agent-managed workers - Tap to view jobs"}
                        </p>
                    </div>
                    {!selectedWorker && (
                        <button
                            onClick={fetchWorkers}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                    )}
                </div>
            </div>

            {/* Search */}
            {!selectedWorker && (
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search workers by name, phone, email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                        />
                    </div>
                </div>
            )}

            {/* Content */}
            {loading ? (
                <SkeletonLoader />
            ) : selectedWorker ? (
                <WorkerProfileView />
            ) : (
                <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                        <p className="text-sm text-gray-600 font-medium">
                            {filteredWorkers.length} workers found
                        </p>
                    </div>
                    <div className="space-y-3">
                        {filteredWorkers.map(worker => (
                            <WorkerCard key={worker._id} worker={worker} />
                        ))}
                    </div>
                    {filteredWorkers.length === 0 && !loading && (
                        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-900 font-medium text-lg">No workers found</p>
                            <p className="text-gray-600 text-sm mt-2">
                                {searchQuery ? "Try changing your search query" : "No workers available"}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* STATUS MODAL */}
            {showStatusModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/60 flex items-end justify-center p-0 z-50 sm:items-center sm:p-4">
                    <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-full sm:max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Update Job Status</h3>
                                    <p className="text-gray-600 text-sm mt-1">
                                        Booking ID: #{selectedBooking._id?.slice(-8) || "—"}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setShowStatusModal(false)}
                                    className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status *</label>
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                                    >
                                        <option value="PENDING">⏳ Pending</option>
                                        <option value="ACCEPTED">✅ Accepted</option>
                                        <option value="PAYMENT_PENDING">🔧 In Progress</option>
                                        <option value="COMPLETED">🎉 Completed</option>
                                        <option value="CANCELLED">❌ Cancelled</option>
                                        <option value="DECLINED">🚫 Declined</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Remarks <span className="text-gray-500 text-xs">(optional)</span>
                                    </label>
                                    <textarea
                                        placeholder="Add any remarks or notes for this status change..."
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                                    />
                                </div>

                                <div className="flex flex-col gap-3 pt-4">
                                    <button
                                        onClick={updateStatus}
                                        disabled={actionLoading}
                                        className="w-full py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {actionLoading ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Edit3 className="w-4 h-4" />
                                        )}
                                        {actionLoading ? "Updating..." : "Update Status"}
                                    </button>
                                    <button
                                        onClick={() => setShowStatusModal(false)}
                                        className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium text-sm flex items-center justify-center gap-2"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* DETAILS MODAL */}
            {showDetailsModal && <DetailsModal />}

            {/* PAYMENT MODAL */}
            {showPaymentModal && <PaymentModal />}
        </div>
    );
};

export default NonSmartphoneWorkers