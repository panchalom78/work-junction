import { useState, useEffect } from "react";
import {
    TrendingUp,
    DollarSign,
    CheckCircle,
    Star,
    Clock,
    User,
    Calendar,
    PieChart,
    Target,
    AlertCircle,
    RefreshCw,
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
import { useAuthStore } from "../store/auth.store";

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
    const { getUser } = useAuthStore();

    // Deep navy blue color theme matching the navbar
    const theme = {
        primary: {
            dark: "#17182A",
            blue: "#2563EB",
            purple: "#7C3AED",
            gradient: "linear-gradient(135deg, #17182A 0%, #2D1B69 100%)",
            lightGradient:
                "linear-gradient(135deg, rgba(23, 24, 42, 0.1) 0%, rgba(45, 27, 105, 0.1) 100%)",
        },
        accents: {
            gold: "#F59E0B",
            teal: "#0D9488",
            amber: "#D97706",
            electric: "#6366F1",
        },
        background: {
            light: "#F8FAFC",
            card: "#FFFFFF",
        },
        text: {
            primary: "#17182A",
            secondary: "#4B5563",
            light: "#9CA3AF",
        },
    };

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
                    <div
                        className="w-8 h-8 border-4 rounded-full animate-spin mx-auto mb-4"
                        style={{
                            borderColor: theme.primary.dark,
                            borderTopColor: "transparent",
                        }}
                    ></div>
                    <div className="text-gray-600">Loading dashboard...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <div className="text-red-600 text-lg mb-4">{error}</div>
                    <button
                        onClick={fetchOverviewData}
                        className="flex items-center space-x-2 text-white px-6 py-3 rounded-2xl hover:shadow-lg transition-all duration-200"
                        style={{ background: theme.primary.gradient }}
                    >
                        <RefreshCw size={16} />
                        <span>Retry</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
            {/* Welcome Section */}
            <div
                className="rounded-2xl shadow-sm border border-gray-200 p-8 relative overflow-hidden"
                style={{ background: theme.background.card }}
            >
                {/* Mathematical background pattern */}
                <div className="absolute top-4 right-4 opacity-5">
                    <div className="text-4xl font-mono">∑</div>
                </div>
                <div className="absolute bottom-4 left-4 opacity-5">
                    <div className="text-3xl font-mono">π</div>
                </div>

                <h1
                    className="text-3xl font-bold mb-2 relative z-10"
                    style={{ color: theme.text.primary }}
                >
                    Welcome back, {workerData.name} 👋
                </h1>
                <p
                    className="text-lg relative z-10"
                    style={{ color: theme.text.secondary }}
                >
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
                    theme={theme}
                />
                <StatsCard
                    icon={CheckCircle}
                    label="Completed Jobs"
                    value={workerData.completedJobs}
                    color="blue"
                    theme={theme}
                />
                <StatsCard
                    icon={Star}
                    label="Average Rating"
                    value={workerData.rating}
                    color="yellow"
                    theme={theme}
                />
                <StatsCard
                    icon={Clock}
                    label="Upcoming Jobs"
                    value={workerData.upcomingJobs}
                    color="purple"
                    theme={theme}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Status Card */}
                    <div
                        className="rounded-2xl shadow-sm border border-gray-200 p-6 relative overflow-hidden"
                        style={{ background: theme.background.card }}
                    >
                        <div className="absolute top-3 right-3 opacity-5">
                            <div className="text-2xl font-mono">∂</div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p
                                    className="text-sm font-medium"
                                    style={{ color: theme.text.secondary }}
                                >
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
                                    <span
                                        className="text-lg font-semibold"
                                        style={{ color: theme.text.primary }}
                                    >
                                        {getAvailabilityText(
                                            workerData.availabilityStatus
                                        )}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p
                                    className="text-sm font-medium"
                                    style={{ color: theme.text.secondary }}
                                >
                                    Quick Stats
                                </p>
                                <div className="flex items-center space-x-4 mt-1">
                                    <div>
                                        <p
                                            className="text-2xl font-bold"
                                            style={{
                                                color: theme.primary.dark,
                                            }}
                                        >
                                            {workerData.upcomingJobs}
                                        </p>
                                        <p
                                            className="text-xs"
                                            style={{ color: theme.text.light }}
                                        >
                                            Upcoming
                                        </p>
                                    </div>
                                    <div>
                                        <p
                                            className="text-2xl font-bold"
                                            style={{
                                                color: theme.accents.teal,
                                            }}
                                        >
                                            {workerData.completedJobs}
                                        </p>
                                        <p
                                            className="text-xs"
                                            style={{ color: theme.text.light }}
                                        >
                                            Completed
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Earnings Chart */}
                    <div
                        className="rounded-2xl shadow-sm border border-gray-200 p-6 relative overflow-hidden"
                        style={{ background: theme.background.card }}
                    >
                        <div className="absolute top-4 right-4 opacity-5">
                            <div className="text-2xl font-mono">∫</div>
                        </div>

                        <div className="flex items-center justify-between mb-6">
                            <h3
                                className="text-xl font-semibold"
                                style={{ color: theme.text.primary }}
                            >
                                Earnings Overview
                            </h3>
                            <div className="flex items-center space-x-2">
                                <TrendingUp
                                    className="w-5 h-5"
                                    style={{ color: theme.accents.teal }}
                                />
                            </div>
                        </div>

                        {workerData.earningsData.length === 0 ? (
                            <div className="text-center py-12">
                                <DollarSign
                                    className="w-12 h-12 mx-auto mb-4"
                                    style={{ color: theme.text.light }}
                                />
                                <p style={{ color: theme.text.secondary }}>
                                    No earnings data available yet
                                </p>
                                <p
                                    className="text-sm mt-1"
                                    style={{ color: theme.text.light }}
                                >
                                    Complete your first job to see earnings data
                                </p>
                            </div>
                        ) : (
                            <div className="h-64 mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={workerData.earningsData}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#f0f0f0"
                                        />
                                        <XAxis
                                            dataKey="month"
                                            style={{
                                                fill: theme.text.secondary,
                                            }}
                                        />
                                        <YAxis
                                            style={{
                                                fill: theme.text.secondary,
                                            }}
                                        />
                                        <Tooltip
                                            formatter={(value) =>
                                                `₹${value.toLocaleString(
                                                    "en-IN"
                                                )}`
                                            }
                                            contentStyle={{
                                                background:
                                                    theme.background.card,
                                                border: `1px solid #e5e7eb`,
                                                borderRadius: "12px",
                                                color: theme.text.primary,
                                            }}
                                        />
                                        <Bar
                                            dataKey="amount"
                                            style={{ fill: theme.primary.dark }}
                                            radius={[6, 6, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Recent Bookings */}
                    <div
                        className="rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden"
                        style={{ background: theme.background.card }}
                    >
                        <div className="absolute top-3 right-3 opacity-5">
                            <div className="text-xl font-mono">∇</div>
                        </div>

                        <div className="p-6 border-b border-gray-200">
                            <h3
                                className="text-lg font-semibold flex items-center"
                                style={{ color: theme.text.primary }}
                            >
                                <Calendar
                                    className="w-5 h-5 mr-2"
                                    style={{ color: theme.primary.dark }}
                                />
                                Recent Bookings
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {bookings.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Calendar
                                            className="w-12 h-12 mx-auto mb-4"
                                            style={{ color: theme.text.light }}
                                        />
                                        <p
                                            style={{
                                                color: theme.text.secondary,
                                            }}
                                        >
                                            No recent bookings
                                        </p>
                                        <p
                                            className="text-sm mt-1"
                                            style={{ color: theme.text.light }}
                                        >
                                            Your bookings will appear here
                                        </p>
                                    </div>
                                ) : (
                                    bookings.map((booking) => (
                                        <div
                                            key={booking.id}
                                            className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                                        >
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                                                style={{
                                                    background:
                                                        theme.primary
                                                            .lightGradient,
                                                }}
                                            >
                                                <User
                                                    className="w-5 h-5"
                                                    style={{
                                                        color: theme.primary
                                                            .dark,
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h4
                                                        className="text-base font-semibold truncate group-hover:text-gray-900 transition-colors"
                                                        style={{
                                                            color: theme.text
                                                                .primary,
                                                        }}
                                                    >
                                                        {booking.customer}
                                                    </h4>
                                                    <span
                                                        className={`text-xs px-2 py-1 rounded-full border ${
                                                            booking.status ===
                                                                "confirmed" ||
                                                            booking.status ===
                                                                "accepted"
                                                                ? "bg-green-100 text-green-800 border-green-200"
                                                                : booking.status ===
                                                                  "completed"
                                                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                                                : "bg-yellow-100 text-yellow-800 border-yellow-200"
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
                                                <p
                                                    className="text-sm mt-1 truncate"
                                                    style={{
                                                        color: theme.text
                                                            .secondary,
                                                    }}
                                                >
                                                    {booking.service}
                                                </p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <p
                                                        className="text-xs"
                                                        style={{
                                                            color: theme.text
                                                                .light,
                                                        }}
                                                    >
                                                        {booking.date}
                                                    </p>
                                                    <p
                                                        className="text-sm font-medium"
                                                        style={{
                                                            color: theme.text
                                                                .primary,
                                                        }}
                                                    >
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
                                    className="w-full mt-4 text-center font-medium text-sm hover:underline transition-all duration-200 flex items-center justify-center space-x-1"
                                    style={{ color: theme.primary.dark }}
                                >
                                    <span>View All Bookings</span>
                                    <span className="group-hover:translate-x-1 transition-transform">
                                        →
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions Card */}
                    <div
                        className="rounded-2xl shadow-sm border border-gray-200 p-6 relative overflow-hidden"
                        style={{ background: theme.background.card }}
                    >
                        <div className="absolute bottom-3 right-3 opacity-5">
                            <div className="text-2xl font-mono">∆</div>
                        </div>

                        <h3
                            className="text-lg font-semibold mb-4 flex items-center"
                            style={{ color: theme.text.primary }}
                        >
                            <Target
                                className="w-5 h-5 mr-2"
                                style={{ color: theme.primary.dark }}
                            />
                            Quick Actions
                        </h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => onSetActiveTab("services")}
                                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 group"
                                style={{
                                    background: theme.primary.lightGradient,
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p
                                            className="font-medium group-hover:text-gray-900 transition-colors"
                                            style={{
                                                color: theme.text.primary,
                                            }}
                                        >
                                            Manage Services
                                        </p>
                                        <p
                                            className="text-sm mt-1"
                                            style={{
                                                color: theme.text.secondary,
                                            }}
                                        >
                                            Add or update your services
                                        </p>
                                    </div>
                                    <div
                                        className="p-2 rounded-lg group-hover:scale-110 transition-transform duration-200"
                                        style={{
                                            background: theme.primary.gradient,
                                        }}
                                    >
                                        <CheckCircle className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => onSetActiveTab("availability")}
                                className="w-full text-left p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 group"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p
                                            className="font-medium group-hover:text-gray-900 transition-colors"
                                            style={{
                                                color: theme.text.primary,
                                            }}
                                        >
                                            Update Availability
                                        </p>
                                        <p
                                            className="text-sm mt-1"
                                            style={{
                                                color: theme.text.secondary,
                                            }}
                                        >
                                            Set your working hours
                                        </p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors duration-200">
                                        <Clock
                                            className="w-4 h-4"
                                            style={{
                                                color: theme.text.secondary,
                                            }}
                                        />
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
