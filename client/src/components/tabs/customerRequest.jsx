// components/NonSmartphoneWorkers.js
import React, { useState, useEffect, useMemo } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

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

    // FETCH ALL WORKERS
    const fetchWorkers = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get("/api/service-agent/non-smartphone-workers");
            if (data.success) setWorkers(data.data || []);
        } catch (error) {
            toast.error("Failed to load workers");
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
                setWorkerJobs(data.data || []);
                console.log("Worker Jobs:", data.data || []);
                return true;
            }
            return false;
        } catch (error) {
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

    // UPDATE JOB STATUS
    const updateStatus = async () => {
        if (!newStatus) return toast.error("Select a status");
        try {
            const { data } = await axiosInstance.patch(
                `/api/service-agent/bookings/${selectedBooking._id}/status`,
                { status: newStatus, remarks, updatedBy: "agent" }
            );
            if (data.success) {
                toast.success("Status updated");
                // Refresh worker jobs
                if (selectedWorker) {
                    await fetchWorkerJobs(selectedWorker._id);
                }
                setShowStatusModal(false);
                setRemarks("");
            }
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const openStatusModal = (booking) => {
        setSelectedBooking(booking);
        setNewStatus(booking.status);
        setRemarks("");
        setShowStatusModal(true);
    };

    // WORKER PROFILE VIEW
    const WorkerProfileView = () => {
        if (!selectedWorker) return null;

        const pendingJobs = getWorkerJobsByStatus("PENDING");
        const assignedJobs = getWorkerJobsByStatus("ASSIGNED");
        const inProgressJobs = getWorkerJobsByStatus("IN_PROGRESS");
        const completedJobs = getWorkerJobsByStatus("COMPLETED");

        return (
            <div className="space-y-3">
                {/* Worker Header */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                        <button
                            onClick={goBackToWorkers}
                            className="flex items-center text-blue-600 font-medium text-sm"
                        >
                            ← Back to Workers
                        </button>
                        <button
                            onClick={() => fetchWorkerJobs(selectedWorker._id)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
                        >
                            Refresh
                        </button>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {selectedWorker.name?.[0]?.toUpperCase() || "W"}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-gray-900">{selectedWorker.name}</h2>
                            <p className="text-gray-600 text-sm">{selectedWorker.phone}</p>
                            <p className="text-gray-500 text-xs">{selectedWorker.email}</p>
                        </div>
                        <a
                            href={`tel:${selectedWorker.phone}`}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                        >
                            📞 Call
                        </a>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <p className="text-yellow-800 font-bold text-lg">{pendingJobs.length}</p>
                        <p className="text-yellow-600 text-xs">Pending</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-blue-800 font-bold text-lg">{assignedJobs.length + inProgressJobs.length}</p>
                        <p className="text-blue-600 text-xs">Active</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <p className="text-green-800 font-bold text-lg">{completedJobs.length}</p>
                        <p className="text-green-600 text-xs">Completed</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <p className="text-purple-800 font-bold text-lg">{workerJobs.length}</p>
                        <p className="text-purple-600 text-xs">Total</p>
                    </div>
                </div>

                {/* Pending Jobs */}
                {pendingJobs.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-2">Pending Acceptance ({pendingJobs.length})</h3>
                        <div className="space-y-2">
                            {pendingJobs.map(job => (
                                <JobCard key={job._id} job={job} onUpdateStatus={openStatusModal} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Active Jobs */}
                {(assignedJobs.length > 0 || inProgressJobs.length > 0) && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-2">Active Jobs ({assignedJobs.length + inProgressJobs.length})</h3>
                        <div className="space-y-2">
                            {[...assignedJobs, ...inProgressJobs].map(job => (
                                <JobCard key={job._id} job={job} onUpdateStatus={openStatusModal} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Completed Jobs */}
                {completedJobs.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-2">Completed ({completedJobs.length})</h3>
                        <div className="space-y-2">
                            {completedJobs.map(job => (
                                <JobCard key={job._id} job={job} onUpdateStatus={openStatusModal} />
                            ))}
                        </div>
                    </div>
                )}

                {workerJobs.length === 0 && (
                    <div className="text-center py-8 bg-white rounded-lg">
                        <p className="text-gray-500">No jobs assigned to this worker</p>
                    </div>
                )}
            </div>
        );
    };

    // JOB CARD COMPONENT
    const JobCard = ({ job, onUpdateStatus }) => {
        const customer = job.customer || {};
        const service = job.serviceDetails?.serviceId || {};
        
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">{customer.name || "—"}</h4>
                        <p className="text-gray-600 text-xs">{customer.phone || "—"}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        job.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                        job.status === "ASSIGNED" ? "bg-blue-100 text-blue-800" :
                        job.status === "IN_PROGRESS" ? "bg-purple-100 text-purple-800" :
                        job.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"
                    }`}>
                        {job.status?.replace("_", " ")}
                    </span>
                </div>

                <div className="space-y-1.5 mb-3">
                    <p className="text-xs"><strong>Service:</strong> {service.name || "—"}</p>
                    <p className="text-xs"><strong>Address:</strong> {customer.address?.area || "—"}, {customer.address?.city || "—"}</p>
                    <p className="text-xs"><strong>Time:</strong> {safeFormat(job.bookingInfo?.date)} {job.bookingInfo?.time || ""}</p>
                    <p className="text-sm font-bold text-green-600">₹{job.serviceDetails?.price || 0}</p>
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={() => onUpdateStatus(job)}
                        className="flex-1 py-2 bg-amber-600 text-white text-xs rounded-md hover:bg-amber-700 font-medium"
                    >
                        Update Status
                    </button>
                    <a
                        href={`tel:${customer.phone}`}
                        className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs font-medium"
                    >
                        📞 Call
                    </a>
                </div>
            </div>
        );
    };

    // WORKER LIST CARD
    const WorkerCard = ({ worker }) => {
        return (
            <div 
                onClick={() => openWorkerProfile(worker)}
                className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-all cursor-pointer"
            >
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {worker.name?.[0]?.toUpperCase() || "W"}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{worker.name}</h3>
                        <p className="text-gray-600 text-xs">{worker.phone}</p>
                        <p className="text-gray-500 text-xs truncate">{worker.email}</p>
                    </div>
                    <div className="text-right">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-500">Active</span>
                    </div>
                </div>
            </div>
        );
    };

    // SKELETON LOADER
    const SkeletonLoader = () => (
        <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg p-3 animate-pulse border border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/30 p-2 space-y-3">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-3">
                <h1 className="text-lg font-bold text-gray-800">
                    {selectedWorker ? `${selectedWorker.name}'s Jobs` : "Non-Smartphone Workers"}
                </h1>
                <p className="text-gray-600 text-xs">
                    {selectedWorker ? "Manage all jobs for this worker" : "Agent-created workers - Tap to manage jobs"}
                </p>
            </div>

            {/* Search */}
            {!selectedWorker && (
                <div className="bg-white rounded-lg shadow-sm p-3">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                            <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search workers by name, phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-xs"
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
                <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                        <p className="text-xs text-gray-600">
                            Showing {filteredWorkers.length} workers
                        </p>
                    </div>
                    <div className="space-y-2">
                        {filteredWorkers.map(worker => (
                            <WorkerCard key={worker._id} worker={worker} />
                        ))}
                    </div>
                    {filteredWorkers.length === 0 && (
                        <div className="text-center py-8 bg-white rounded-lg">
                            <p className="text-gray-500">No workers found</p>
                        </div>
                    )}
                </div>
            )}

            {/* STATUS MODAL */}
            {showStatusModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-end justify-center p-0 z-50 sm:items-center sm:p-4">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-full sm:max-w-md max-h-[85vh] overflow-y-auto animate-slide-up">
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
                                <h3 className="text-base font-bold text-gray-900">Update Job Status</h3>
                                <button onClick={() => setShowStatusModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Status *</label>
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="ASSIGNED">Assigned</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Remarks</label>
                                    <textarea
                                        placeholder="Add any remarks..."
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                                    />
                                </div>

                                <div className="flex flex-col gap-2 pt-2">
                                    <button
                                        onClick={updateStatus}
                                        className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                                    >
                                        Update Status
                                    </button>
                                    <button
                                        onClick={() => setShowStatusModal(false)}
                                        className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NonSmartphoneWorkers;