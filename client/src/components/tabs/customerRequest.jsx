// components/NonSmartphoneWorkers.js
import React, { useState, useEffect, useMemo } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

const NonSmartphoneWorkers = () => {
    const [activeTab, setActiveTab] = useState("pending");
    const [requests, setRequests] = useState([]);
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

    // FETCH BY STATUS - NON-SMARTPHONE ONLY
    const fetchBookingsByStatus = async (tab) => {
        const endpoints = {
            pending: "/api/service-agent/pending",
            assigned: "/api/service-agent/assigned",
            "in-progress": "/api/service-agent/in-progress",
            completed: "/api/service-agent/completed",
            cancelled: "/api/service-agent/cancelled",
            all: "/api/service-agent/all",
        };

        try {
            setLoading(true);
            const { data } = await axiosInstance.get(endpoints[tab]);
            if (data.success) setRequests(data.data || []);
            console.log(data);
        } catch (error) {
            toast.error(`Failed to load ${tab} jobs`);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookingsByStatus(activeTab);
    }, [activeTab]);

    // SEARCH FILTER
    const filteredRequests = useMemo(() => {
        if (!searchQuery) return requests;
        const q = searchQuery.toLowerCase();
        return requests.filter((r) => {
            const c = r.customer || {};
            const w = r.worker || {};
            const s = r.serviceDetails?.serviceId || {};
            const sk = r.serviceDetails?.skillName || "";

            return (
                c.name?.toLowerCase().includes(q) ||
                c.phone?.includes(q) ||
                c.address?.area?.toLowerCase().includes(q) ||
                c.address?.city?.toLowerCase().includes(q) ||
                w.name?.toLowerCase().includes(q) ||
                w.phone?.includes(q) ||
                s.name?.toLowerCase().includes(q) ||
                sk.toLowerCase().includes(q)
            );
        });
    }, [requests, searchQuery]);

    // UPDATE STATUS
    const updateStatus = async () => {
        if (!newStatus) return toast.error("Select a status");
        try {
            const { data } = await axiosInstance.patch(
                `/api/service-agent/bookings/${selectedBooking._id}/status`,
                { status: newStatus, remarks, updatedBy: "agent" }
            );
            if (data.success) {
                toast.success("Status updated");
                fetchBookingsByStatus(activeTab);
                setShowStatusModal(false);
                setRemarks("");
            }
        } catch (error) {
            toast.error("Update failed");
            console.log(error);
        }
    };

    const openStatusModal = (booking) => {
        setSelectedBooking(booking);
        setNewStatus(booking.status);
        setRemarks("");
        setShowStatusModal(true);
    };

    // PROGRESS DOTS
    const ProgressDots = ({ b }) => {
        const steps = ["PENDING", "ACCEPTED", "IN_PROGRESS", "COMPLETED"];
        const idx = steps.indexOf(b.status);
        const done = b.serviceCompletedAt
            ? 4
            : b.serviceStartedAt
            ? 3
            : b.serviceInitiatedAt
            ? 2
            : 1;

        return (
            <div className="flex items-center space-x-1">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                            i <= done
                                ? "bg-green-500"
                                : i === idx + 1
                                ? "bg-blue-500 animate-pulse"
                                : "bg-gray-300"
                        }`}
                    />
                ))}
            </div>
        );
    };

    // BOOKING CARD - OPTIMIZED FOR MOBILE
    const BookingCard = ({ b }) => {
        const c = b.customer || {};
        const w = b.worker || {};
        const s = b.serviceDetails?.serviceId || {};
        const sk = b.serviceDetails?.skillName || "General";

        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-all">
                {/* Header - Compact */}
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                            {c.name?.[0]?.toUpperCase() || "C"}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">
                                {c.name || "—"}
                            </h3>
                            <p className="text-xs text-gray-600 truncate">
                                {c.phone || "—"}
                            </p>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                        <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                                b.status === "PENDING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : b.status === "ACCEPTED"
                                    ? "bg-indigo-100 text-indigo-800"
                                    : b.status === "IN_PROGRESS"
                                    ? "bg-purple-100 text-purple-800"
                                    : b.status === "COMPLETED"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                        >
                            {b.status?.replace("_", " ") || "—"}
                        </span>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                            {safeFormat(b.bookingInfo?.date)} •{" "}
                            {b.bookingInfo?.time || "—"}
                        </p>
                    </div>
                </div>

                {/* Service - Compact */}
                <div className="bg-blue-50 p-2 rounded-md mb-2 text-xs">
                    <p className="truncate">
                        <strong>Service:</strong> {s.name || "—"}
                    </p>
                    <p className="truncate">
                        <strong>Skill:</strong> {sk}
                    </p>
                    <p className="font-bold text-green-600 text-sm">
                        ₹{b.serviceDetails?.price || 0}
                    </p>
                </div>

                {/* Customer Address - Compact */}
                <div className="bg-gray-50 p-2 rounded-md mb-2 text-[11px]">
                    <p className="font-medium text-gray-800 mb-0.5">
                        Customer Address
                    </p>
                    <p className="truncate">
                        {c.address?.area || "—"}, {c.address?.city || "—"}
                    </p>
                    <p className="truncate">
                        {c.address?.state || "—"} - {c.address?.pincode || "—"}
                    </p>
                    <a
                        href={`tel:${c.phone}`}
                        className="text-blue-600 font-medium mt-0.5 inline-block text-xs"
                    >
                        📞 Call Customer
                    </a>
                </div>

                {/* Worker - Compact */}
                {w.name && (
                    <div className="bg-teal-50 p-2 rounded-md mb-2 text-[11px]">
                        <p className="font-medium text-teal-800 mb-0.5">
                            Assigned Worker
                        </p>
                        <p className="truncate">
                            <strong>Name:</strong> {w.name}
                        </p>
                        <p className="truncate">
                            <strong>Phone:</strong> {w.phone}
                        </p>
                        <a
                            href={`tel:${w.phone}`}
                            className="text-teal-600 font-medium mt-0.5 inline-block text-xs"
                        >
                            📞 Call Worker
                        </a>
                    </div>
                )}

                {/* Progress */}
                <div className="flex justify-between items-center mb-2">
                    <ProgressDots b={b} />
                    <span className="text-[10px] text-gray-600">
                        {b.serviceCompletedAt
                            ? "Done"
                            : b.serviceStartedAt
                            ? "Started"
                            : b.serviceInitiatedAt
                            ? "Reached"
                            : w.name
                            ? "Assigned"
                            : "Pending"}
                    </span>
                </div>

                {/* Actions - Stacked on Mobile */}
                <div className="flex flex-col gap-1.5">
                    <button
                        onClick={() => openStatusModal(b)}
                        className="w-full py-2 bg-amber-600 text-white text-xs rounded-md hover:bg-amber-700 font-medium"
                    >
                        Update Status
                    </button>
                </div>
            </div>
        );
    };

    const tabs = [
        { id: "pending", label: "Pending" },
        { id: "assigned", label: "Assigned" },
        { id: "in-progress", label: "In Progress" },
        { id: "completed", label: "Completed" },
        { id: "cancelled", label: "Cancelled" },
        { id: "all", label: "All" },
    ];

    // SKELETON LOADER - MOBILE OPTIMIZED
    const SkeletonLoader = () => (
        <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className="bg-white rounded-lg p-3 animate-pulse border border-gray-200"
                >
                    <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-1.5">
                            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="space-y-1">
                            <div className="h-4 bg-gray-200 rounded w-12"></div>
                            <div className="h-2 bg-gray-200 rounded w-10"></div>
                        </div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                </div>
            ))}
        </div>
    );

    if (loading) {
        return (
            <div className="p-3">
                <SkeletonLoader />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/30 p-2 space-y-3">
            {/* Header - Mobile Optimized */}
            <div className="bg-white rounded-lg shadow-sm p-3">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg font-bold text-gray-800 truncate">
                                Non-Smartphone Worker Jobs
                            </h1>
                            <p className="text-gray-600 text-xs">
                                Agent-created workers only
                            </p>
                        </div>
                        <button
                            onClick={() => fetchBookingsByStatus(activeTab)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 font-medium flex-shrink-0 ml-2"
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* Search - Mobile Optimized */}
            <div className="bg-white rounded-lg shadow-sm p-3">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        <svg
                            className="h-3.5 w-3.5 text-gray-400"
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
                        placeholder="Search by name, phone, address, service..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-xs"
                    />
                </div>
            </div>

            {/* Tabs - Horizontal Scroll for Mobile */}
            <div className="bg-white rounded-lg shadow-sm p-2">
                <div className="flex space-x-1 overflow-x-auto pb-1 hide-scrollbar">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`px-3 py-1.5 rounded-md font-medium text-xs whitespace-nowrap transition-all flex-shrink-0 ${
                                activeTab === t.id
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Count */}
            <div className="px-1">
                <p className="text-xs text-gray-600">
                    Showing {filteredRequests.length} of {requests.length} jobs
                </p>
            </div>

            {/* Cards Grid - Single Column on Mobile */}
            <div className="grid grid-cols-1 gap-2">
                {filteredRequests.map((b) => (
                    <BookingCard key={b._id} b={b} />
                ))}
            </div>

            {/* Empty State */}
            {filteredRequests.length === 0 && (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-sm">
                    <div className="w-12 h-12 mx-auto mb-2 text-gray-300">
                        <svg
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                        </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                        No {activeTab} jobs found
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                        Try changing your search or filters
                    </p>
                </div>
            )}

            {/* STATUS MODAL - MOBILE OPTIMIZED */}
            {showStatusModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-end justify-center p-0 z-50 sm:items-center sm:p-4">
                    <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-full sm:max-w-md max-h-[85vh] overflow-y-auto animate-slide-up">
                        <div className="p-4">
                            {/* Header */}
                            <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-bold text-gray-900">
                                        Update Job Status
                                    </h3>
                                    <p className="text-xs text-gray-600 mt-0.5 truncate">
                                        Booking ID:{" "}
                                        <span className="font-mono">
                                            #
                                            {selectedBooking._id?.slice(-6) ||
                                                "—"}
                                        </span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowStatusModal(false)}
                                    className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 ml-2"
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
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Status *
                                    </label>
                                    <select
                                        value={newStatus}
                                        onChange={(e) =>
                                            setNewStatus(e.target.value)
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="ACCEPTED">
                                            Assigned
                                        </option>
                                        <option value="PAYMENT_PENDING">
                                            In Progress
                                        </option>
                                        <option value="COMPLETED">
                                            Completed
                                        </option>
                                        <option value="CANCELLED">
                                            Cancelled
                                        </option>
                                        <option value="DECLINED">
                                            Declined
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                        Remarks (optional)
                                    </label>
                                    <textarea
                                        placeholder="Add any remarks or notes..."
                                        value={remarks}
                                        onChange={(e) =>
                                            setRemarks(e.target.value)
                                        }
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                                    />
                                </div>

                                <div className="flex flex-col gap-2 pt-2">
                                    <button
                                        onClick={updateStatus}
                                        className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                                    >
                                        Update Status
                                    </button>
                                    <button
                                        onClick={() =>
                                            setShowStatusModal(false)
                                        }
                                        className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom CSS to hide scrollbar but keep functionality */}
            <style jsx>{`
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default NonSmartphoneWorkers;
