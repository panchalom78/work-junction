// components/AgentDashboard.js
import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";

const AgentDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");
    const [stats, setStats] = useState({
        totalWorkers: 0,
        activeWorkers: 0,
        nonSmartphoneWorkers: 0,
        totalRequests: 0,
        pendingRequests: 0,
        completedRequests: 0,
        monthlyEarnings: 0,
        customerRating: 0,
    });
    const [agentProfile, setAgentProfile] = useState({
        name: "",
        email: "",
        phone: "",
        profileImage: "",
        area: "",
        joinDate: "",
        performance: {
            completionRate: 0,
            responseTime: 0,
            customerSatisfaction: 0,
        },
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [workerDistribution, setWorkerDistribution] = useState({
        smartphoneUsers: { percentage: 0, count: 0 },
        nonSmartphoneUsers: { percentage: 0, count: 0 },
        bySkill: {},
    });
    const [loading, setLoading] = useState(true);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileForm, setProfileForm] = useState({});
    const [updating, setUpdating] = useState(false);
    const { logout } = useAuthStore();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const [statsRes, profileRes, activityRes, distributionRes] =
                await Promise.all([
                    axiosInstance.get("/api/service-agent/dashboard/stats"),
                    axiosInstance.get("/api/service-agent/dashboard/profile"),
                    axiosInstance.get(
                        "/api/service-agent/dashboard/recent-activity"
                    ),
                    axiosInstance.get(
                        "/api/service-agent/dashboard/worker-distribution"
                    ),
                ]);

            setStats(statsRes.data);
            setAgentProfile(profileRes.data);
            setRecentActivity(activityRes.data);
            setWorkerDistribution(distributionRes.data);
            setProfileForm(profileRes.data);
            setLoading(false);
        } catch (error) {
            toast.error("Failed to load dashboard data");
            setLoading(false);
            console.log(error);
        }
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        try {
            setUpdating(true);
            const response = await axiosInstance.put(
                "/api/service-agent/dashboard/profile",
                profileForm
            );
            setAgentProfile(response.data.profile || response.data);
            setShowProfileModal(false);
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setUpdating(false);
        }
    };




    const StatCard = ({ title, value, change, icon, color, suffix }) => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 group hover:border-blue-100 hover:translate-y-[-2px]">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-2">
                        {title}
                    </p>
                    <div className="flex items-baseline space-x-2">
                        <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
                            {value}
                        </h3>
                        {suffix && (
                            <span className="text-sm text-gray-500">
                                {suffix}
                            </span>
                        )}
                    </div>
                    {change && (
                        <div
                            className={`flex items-center mt-2 text-xs font-medium ${change > 0 ? "text-green-600" : "text-red-600"
                                }`}
                        >
                            <span
                                className={`mr-1 transition-transform ${change > 0
                                    ? "transform rotate-0"
                                    : "transform rotate-180"
                                    }`}
                            >
                                {change > 0 ? "↗" : "↘"}
                            </span>
                            {Math.abs(change)}% from last month
                        </div>
                    )}
                </div>
                <div
                    className={`p-3 rounded-xl ${color} bg-opacity-10 group-hover:scale-110 transition-all duration-300 group-hover:rotate-12`}
                >
                    <span className="text-xl">{icon}</span>
                </div>
            </div>
        </div>
    );

    const PerformanceMetric = ({ title, value, max, color, suffix }) => (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-blue-100">
            <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-700">
                    {title}
                </span>
                <span className="text-sm font-bold text-gray-900">
                    {value}
                    {suffix}
                </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                    className={`h-2.5 rounded-full ${color} transition-all duration-1000 ease-out hover:shadow-lg`}
                    style={{ width: `${(value / max) * 100}%` }}
                ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0{suffix}</span>
                <span>
                    {max}
                    {suffix}
                </span>
            </div>
        </div>
    );

    const ActivityItem = ({ activity }) => {
        const getActivityIcon = (type) => {
            const icons = {
                assignment: "👤",
                completion: "✅",
                payment: "💰",
                new_request: "🆕",
                feedback: "⭐",
                default: "📝",
            };
            return icons[type] || icons.default;
        };

        const getStatusColor = (status) => {
            const colors = {
                completed: "text-green-700 bg-green-50 border border-green-200 hover:bg-green-100",
                pending: "text-yellow-700 bg-yellow-50 border border-yellow-200 hover:bg-yellow-100",
                "in-progress": "text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100",
                cancelled: "text-red-700 bg-red-50 border border-red-200 hover:bg-red-100",
            };
            return colors[status] || colors.pending;
        };

        return (
            <div className="flex items-start space-x-4 p-4 hover:bg-blue-50 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-200 hover:shadow-sm group">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center text-lg group-hover:scale-110 transition-transform duration-200">
                    {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 leading-tight group-hover:text-gray-800">
                        {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1.5 flex items-center">
                        <i className="far fa-clock mr-1"></i>
                        {activity.time}
                    </p>
                </div>
                <span
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(
                        activity.status
                    )} capitalize transition-colors duration-200`}
                >
                    {activity.status}
                </span>
            </div>
        );
    };

    // Calculate circle stroke properties for pie charts
    const calculateCircleStroke = (percentage) => {
        const radius = 36;
        const circumference = 2 * Math.PI * radius;
        const strokeDasharray = circumference;
        const strokeDashoffset =
            circumference - (percentage / 100) * circumference;
        return { strokeDasharray, strokeDashoffset, radius };
    };

    const smartphoneStroke = calculateCircleStroke(
        workerDistribution.smartphoneUsers.percentage
    );
    const nonSmartphoneStroke = calculateCircleStroke(
        workerDistribution.nonSmartphoneUsers.percentage
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse space-y-6">
                        {/* Header Skeleton */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
                            <div className="space-y-3">
                                <div className="h-8 bg-gray-200 rounded w-64"></div>
                                <div className="h-4 bg-gray-200 rounded w-80"></div>
                            </div>
                            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                                <div className="space-y-2 text-right">
                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                                </div>
                                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                            </div>
                        </div>

                        {/* Stats Grid Skeleton */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-32 bg-gray-200 rounded-2xl"
                                ></div>
                            ))}
                        </div>

                        {/* Main Content Skeleton */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            <div className="space-y-6">
                                <div className="h-96 bg-gray-200 rounded-2xl"></div>
                            </div>
                            <div className="space-y-6">
                                <div className="h-64 bg-gray-200 rounded-2xl"></div>
                                <div className="h-48 bg-gray-200 rounded-2xl"></div>
                            </div>
                            <div className="space-y-6">
                                <div className="h-80 bg-gray-200 rounded-2xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
                    <div className="mb-4 lg:mb-0">
                        <h4 className="text-2xl lg:text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Agent Dashboard
                        </h4>
                        <p className="text-gray-600 mt-2 text-sm lg:text-base">
                            Welcome back,{" "}
                            <span className="font-semibold text-blue-600">
                                {agentProfile.name}
                            </span>
                            ! Here's your performance overview.
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="text-right hidden sm:block">
                            <p className="font-medium text-gray-900">
                                {agentProfile.area}
                            </p>
                            <p className="text-xs text-gray-500">
                                Assigned Area
                            </p>
                        </div>
                        <button
                            onClick={() => setShowProfileModal(true)}
                            className="flex items-center space-x-3 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-blue-200 hover:translate-y-[-1px]"
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md hover:shadow-lg transition-shadow">
                                {agentProfile.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="hidden sm:block">
                                <span className="font-medium text-gray-700 text-sm">Profile</span>
                            </div>
                        </button>
                        <button
                            onClick={async () => {
                                const res = await logout();
                                if (res.success) {
                                    toast.success("Logged out successfully");
                                    navigate("/login");
                                } else {
                                    toast.error(error);
                                }
                            }}
                            className="flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl border border-red-200 hover:bg-red-100 hover:shadow-md transition-all duration-300 hover:translate-y-[-1px]"
                        >
                            <i className="far fa-sign-out text-sm"></i>
                            <span className="text-sm font-medium hidden sm:block">Logout</span>
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                    <StatCard
                        title="Total Workers"
                        value={stats.totalWorkers}
                        change={12}
                        icon="👷"
                        color="text-blue-600"
                    />
                    <StatCard
                        title="Active Workers"
                        value={stats.activeWorkers}
                        change={8}
                        icon="✅"
                        color="text-green-600"
                    />
                    <StatCard
                        title="Non-Smartphone Workers"
                        value={stats.nonSmartphoneWorkers}
                        change={-2}
                        icon="📱"
                        color="text-purple-600"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Left Column - Profile & Performance */}
                    <div className="space-y-6">
                        {/* Agent Profile Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
                                <div className="flex items-center space-x-4 relative z-10">
                                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-white border-opacity-30 hover:scale-105 transition-transform duration-200">
                                        {agentProfile.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">
                                            {agentProfile.name}
                                        </h3>
                                        <p className="text-blue-100 opacity-90">
                                            {agentProfile.area} • Service Agent
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-4 text-sm hover:bg-blue-50 p-2 rounded-lg transition-colors duration-200">
                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors">
                                            <i className="far fa-envelope"></i>
                                        </div>
                                        <span className="text-gray-700">
                                            {agentProfile.email}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm hover:bg-green-50 p-2 rounded-lg transition-colors duration-200">
                                        <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-100 transition-colors">
                                            <i className="far fa-phone"></i>
                                        </div>
                                        <span className="text-gray-700">
                                            {agentProfile.phone}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm hover:bg-purple-50 p-2 rounded-lg transition-colors duration-200">
                                        <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 hover:bg-purple-100 transition-colors">
                                            <i className="far fa-calendar"></i>
                                        </div>
                                        <span className="text-gray-700">
                                            Joined{" "}
                                            {new Date(
                                                agentProfile.joinDate
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                                        <i className="far fa-chart-line mr-2 text-blue-600"></i>
                                        Performance Metrics
                                    </h4>
                                    <div className="space-y-4">
                                        <PerformanceMetric
                                            title="Completion Rate"
                                            value={
                                                agentProfile.performance
                                                    .completionRate
                                            }
                                            max={100}
                                            color="bg-gradient-to-r from-green-400 to-green-500"
                                            suffix="%"
                                        />
                                        <PerformanceMetric
                                            title="Avg Response Time"
                                            value={
                                                agentProfile.performance
                                                    .responseTime
                                            }
                                            max={30}
                                            color="bg-gradient-to-r from-blue-400 to-blue-500"
                                            suffix=" mins"
                                        />
                                        <PerformanceMetric
                                            title="Customer Satisfaction"
                                            value={
                                                agentProfile.performance
                                                    .customerSatisfaction
                                            }
                                            max={5}
                                            color="bg-gradient-to-r from-purple-400 to-purple-500"
                                            suffix="/5"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setShowProfileModal(true)}
                                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:translate-y-[-1px] hover:shadow-blue-200 flex items-center justify-center"
                                    >
                                        <i className="far fa-edit mr-2"></i>
                                        Update Profile
                                    </button>
                                    <button
                                        onClick={async() => {
                                            const res = await logout();
                                            if (res.success) {
                                                toast.success("Logged out successfully");
                                                navigate("/login");
                                            } else {
                                                toast.error(error);
                                            }
                                        }}
                                        className="px-4 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium hover:bg-red-100 transition-all duration-300 hover:translate-y-[-1px] flex items-center justify-center"
                                    >
                                        <i className="far fa-sign-out"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Middle Column - Worker Distribution */}
                    <div className="space-y-6">
                        {/* Worker Distribution */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
                            <h3 className="font-semibold text-gray-900 mb-6 flex items-center">
                                <i className="far fa-users mr-2 text-purple-600"></i>
                                Worker Distribution
                            </h3>

                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div className="text-center group">
                                    <div className="relative inline-block mb-3 group-hover:scale-105 transition-transform duration-300">
                                        <svg className="w-28 h-28 transform -rotate-90">
                                            <circle
                                                cx="56"
                                                cy="56"
                                                r={smartphoneStroke.radius}
                                                stroke="#f3f4f6"
                                                strokeWidth="8"
                                                fill="none"
                                            />
                                            <circle
                                                cx="56"
                                                cy="56"
                                                r={smartphoneStroke.radius}
                                                stroke="#3b82f6"
                                                strokeWidth="8"
                                                fill="none"
                                                strokeDasharray={
                                                    smartphoneStroke.strokeDasharray
                                                }
                                                strokeDashoffset={
                                                    smartphoneStroke.strokeDashoffset
                                                }
                                                strokeLinecap="round"
                                                className="hover:stroke-blue-600 transition-colors duration-300"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <span className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {Math.round(
                                                    workerDistribution
                                                        .smartphoneUsers
                                                        .percentage
                                                )}
                                                %
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500 mt-1 group-hover:text-gray-700 transition-colors">
                                        Non-Smartphone
                                    </span>
                                    <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                                        {
                                            workerDistribution.smartphoneUsers
                                                .count
                                        }{" "}
                                        workers
                                    </p>
                                </div>

                                <div className="text-center group">
                                    <div className="relative inline-block mb-3 group-hover:scale-105 transition-transform duration-300">
                                        <svg className="w-28 h-28 transform -rotate-90">
                                            <circle
                                                cx="56"
                                                cy="56"
                                                r={nonSmartphoneStroke.radius}
                                                stroke="#f3f4f6"
                                                strokeWidth="8"
                                                fill="none"
                                            />
                                            <circle
                                                cx="56"
                                                cy="56"
                                                r={nonSmartphoneStroke.radius}
                                                stroke="#8b5cf6"
                                                strokeWidth="8"
                                                fill="none"
                                                strokeDasharray={
                                                    nonSmartphoneStroke.strokeDasharray
                                                }
                                                strokeDashoffset={
                                                    nonSmartphoneStroke.strokeDashoffset
                                                }
                                                strokeLinecap="round"
                                                className="hover:stroke-purple-600 transition-colors duration-300"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <span className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                                                {Math.round(
                                                    workerDistribution
                                                        .nonSmartphoneUsers
                                                        .percentage
                                                )}
                                                %
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500 mt-1 group-hover:text-gray-700 transition-colors">
                                        Smartphone
                                    </span>
                                    <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                                        {
                                            workerDistribution
                                                .nonSmartphoneUsers.count
                                        }{" "}
                                        workers
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="font-medium text-gray-900 mb-3 text-sm">
                                    Distribution by Skill
                                </h4>
                                <div className="space-y-3">
                                    {Object.entries(
                                        workerDistribution.bySkill
                                    ).map(([skill, count]) => (
                                        <div
                                            key={skill}
                                            className="flex justify-between items-center text-sm hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200"
                                        >
                                            <span className="text-gray-600 capitalize hover:text-gray-800 transition-colors">
                                                {skill}
                                            </span>
                                            <div className="flex items-center space-x-2">
                                                <span className="font-semibold text-gray-900">
                                                    {count}
                                                </span>
                                                <span className="text-gray-400 text-xs">
                                                    workers
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <i className="far fa-chart-bar mr-2 text-blue-600"></i>
                                Request Statistics
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { label: "Total Requests", value: stats.totalRequests, color: "text-gray-900" },
                                    { label: "Pending", value: stats.pendingRequests, color: "text-yellow-600" },
                                    { label: "Completed", value: stats.completedRequests, color: "text-green-600" },
                                    { label: "Success Rate", value: `${stats.totalRequests > 0 ? ((stats.completedRequests / stats.totalRequests) * 100).toFixed(1) : 0}%`, color: "text-blue-600" },
                                ].map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0 hover:bg-blue-50 px-2 rounded-lg transition-colors duration-200"
                                    >
                                        <span className="text-gray-600">{item.label}</span>
                                        <span className={`font-bold ${item.color} hover:scale-105 transition-transform duration-200`}>
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Recent Activity */}
                    <div className="space-y-6">
                        {/* Recent Activity */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-semibold text-gray-900 flex items-center">
                                    <i className="far fa-bell mr-2 text-purple-600"></i>
                                    Recent Activity
                                </h3>
                            </div>

                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                {recentActivity.length > 0 ? (
                                    recentActivity.map((activity) => (
                                        <ActivityItem
                                            key={activity.id}
                                            activity={activity}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500 hover:text-gray-600 transition-colors">
                                        <i className="far fa-inbox text-3xl mb-3 text-gray-300 hover:text-gray-400 transition-colors"></i>
                                        <p>No recent activity</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Update Modal */}
            {showProfileModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-800">
                                Update Profile
                            </h3>
                            <button
                                onClick={() => setShowProfileModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                            >
                                <i className="far fa-times text-lg"></i>
                            </button>
                        </div>

                        <form onSubmit={updateProfile} className="p-6">
                            <div className="space-y-5">
                                {[
                                    { label: "Full Name", name: "name", type: "text", required: true },
                                    { label: "Email Address", name: "email", type: "email", required: true },
                                    { label: "Phone Number", name: "phone", type: "tel", required: true },
                                ].map((field) => (
                                    <div key={field.name}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {field.label}
                                        </label>
                                        <input
                                            type={field.type}
                                            value={profileForm[field.name] || ""}
                                            onChange={(e) =>
                                                setProfileForm((prev) => ({
                                                    ...prev,
                                                    [field.name]: e.target.value,
                                                }))
                                            }
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                                            required={field.required}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex space-x-3 mt-8">
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3.5 rounded-xl font-medium hover:shadow-lg disabled:opacity-50 transition-all duration-300 flex items-center justify-center hover:translate-y-[-1px]"
                                >
                                    {updating ? (
                                        <>
                                            <i className="far fa-spinner-third animate-spin mr-2"></i>
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="far fa-save mr-2"></i>
                                            Update Profile
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowProfileModal(false)}
                                    className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300 hover:translate-y-[-1px]"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Custom Scrollbar and Animations */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.2s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default AgentDashboard;