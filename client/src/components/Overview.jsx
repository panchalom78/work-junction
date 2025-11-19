import { useState, useEffect } from "react";
import {
    TrendingUp,
    DollarSign,
    CheckCircle,
    Star,
    Clock,
    User,
    Calendar,
} from "lucide-react";
import StatsCard from "./StatsCard";
import axiosInstance from "../utils/axiosInstance";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { useNavigate } from "react-router-dom";

const Overview = ({ onShowServiceModal, onSetActiveTab }) => {
    const [workerData, setWorkerData] = useState({
        name: "",
        earnings: 0,
        completedJobs: 0,
        upcomingJobs: 0,
        rating: 0,
        earningsData: [],
        availabilityStatus: "available",
    });
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOverviewData();
    }, []);

    const fetchOverviewData = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get("/api/worker/overview");
            const { worker, bookings } = response.data.data;
            setWorkerData(worker);
            setBookings(bookings);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch overview data:", err);
            setError("Failed to fetch dashboard data");
            setLoading(false);
        }
    };

    const getAvailabilityColor = (status) => {
        switch (status) {
            case "available":
                return "text-green-600 bg-green-100";
            case "busy":
                return "text-yellow-600 bg-yellow-100";
            case "off-duty":
                return "text-red-600 bg-red-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    const getAvailabilityText = (status) => {
        switch (status) {
            case "available":
                return "Available for work";
            case "busy":
                return "Currently busy";
            case "off-duty":
                return "Off duty";
            default:
                return "Available for work";
        }
    };

    const maxEarning =
        workerData.earningsData.length > 0
            ? Math.max(...workerData.earningsData.map((item) => item.amount))
            : 1;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <div className="text-gray-600">Loading dashboard...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-lg mb-4">{error}</div>
                    <button
                        onClick={fetchOverviewData}
                        className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
            {/* Welcome Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {workerData.name} 👋
                </h1>
                <p className="text-gray-600 text-lg">
                    Here's your work overview for today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    icon={DollarSign}
                    label="Total Earnings"
                    value={`₹${workerData.earnings?.toLocaleString() || 0}`}
                    color="green"
                />
                <StatsCard
                    icon={CheckCircle}
                    label="Completed Jobs"
                    value={workerData.completedJobs}
                    color="blue"
                />
                <StatsCard
                    icon={Star}
                    label="Average Rating"
                    value={workerData.rating}
                    color="yellow"
                />
                <StatsCard
                    icon={Clock}
                    label="Upcoming Jobs"
                    value={workerData.upcomingJobs}
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Status Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">
                                    Current Status
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                    <div
                                        className={`w-3 h-3 rounded-full ${
                                            workerData.availabilityStatus ===
                                            "available"
                                                ? "bg-green-500"
                                                : workerData.availabilityStatus ===
                                                  "busy"
                                                ? "bg-yellow-500"
                                                : "bg-red-500"
                                        }`}
                                    ></div>
                                    <span className="text-lg font-semibold text-gray-900">
                                        {getAvailabilityText(
                                            workerData.availabilityStatus
                                        )}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-gray-600 text-sm font-medium">
                                    Quick Stats
                                </p>
                                <div className="flex items-center space-x-4 mt-1">
                                    <div>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {workerData.upcomingJobs}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Upcoming
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-green-600">
                                            {workerData.completedJobs}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Completed
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Earnings Chart */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">
                                Earnings Overview
                            </h3>
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>

                        {workerData.earningsData.length === 0 ? (
                            <div className="text-center py-12">
                                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">
                                    No earnings data available yet
                                </p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Complete your first job to see earnings data
                                </p>
                            </div>
                        ) : (
                            <div className="h-64 mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={workerData.earningsData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value) =>
                                                `₹${value.toLocaleString(
                                                    "en-IN"
                                                )}`
                                            }
                                        />
                                        <Bar
                                            dataKey="amount"
                                            fill="#2563eb"
                                            radius={[6, 6, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Quick Actions */}

                    {/* Recent Bookings */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Recent Bookings
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {bookings.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">
                                            No recent bookings
                                        </p>
                                        <p className="text-sm text-gray-400 mt-1">
                                            Your bookings will appear here
                                        </p>
                                    </div>
                                ) : (
                                    bookings.map((booking) => (
                                        <div
                                            key={booking.id}
                                            className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <User className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-base font-semibold text-gray-900 truncate">
                                                        {booking.customer}
                                                    </h4>
                                                    <span
                                                        className={`text-xs px-2 py-1 rounded-full ${
                                                            booking.status ===
                                                                "confirmed" ||
                                                            booking.status ===
                                                                "accepted"
                                                                ? "bg-green-100 text-green-800"
                                                                : booking.status ===
                                                                  "completed"
                                                                ? "bg-blue-100 text-blue-800"
                                                                : "bg-yellow-100 text-yellow-800"
                                                        }`}
                                                    >
                                                        {booking.status
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            booking.status.slice(
                                                                1
                                                            )}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1 truncate">
                                                    {booking.service}
                                                </p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <p className="text-xs text-gray-500">
                                                        {booking.date}
                                                    </p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        ₹{booking.amount}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            {bookings.length > 0 && (
                                <button
                                    onClick={() => navigate("/worker/bookings")}
                                    className="w-full mt-4 text-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                                >
                                    View All Bookings →
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
