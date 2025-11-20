import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    User,
    Briefcase,
    Calendar,
    Image,
    Clock,
    Settings,
    Menu,
    X,
    LogOut,
    ChevronRight,
    Star,
    Shield,
    MessageCircle,
    UserRoundPen,
    House,
} from "lucide-react";

import { useAuthStore } from "../store/auth.store";
import toast from "react-hot-toast";
import RobustGujaratTranslator from "./GujaratTranslator";

const WorkerNavbar = ({ mobileMenuOpen, setMobileMenuOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const navigation = [
        {
            id: "overview",
            name: "Overview",
            icon: House,
            badge: null,
            path: "/worker",
        },
        {
            id: "services",
            name: "Services",
            icon: Briefcase,
            badge: null,
            path: "/worker/services",
        },
        {
            id: "bookings",
            name: "Bookings",
            icon: Calendar,
            path: "/worker/bookings",
        },
        {
            id: "chat",
            name: "Messages",
            icon: MessageCircle,
            path: "/worker/chat",
        },
        {
            id: "availability",
            name: "Availability",
            icon: Clock,
            badge: "New",
            path: "/worker/availability",
        },
        {
            id: "settings",
            name: "Profile",
            icon: UserRoundPen,
            badge: null,
            path: "/worker/settings",
        },
    ];

    // Function to check if a navigation item is active
    const isActive = (itemPath) => {
        if (itemPath === "/worker") {
            return location.pathname === "/worker";
        }
        return location.pathname.startsWith(itemPath);
    };

    // Function to get active tab ID
    const getActiveTab = () => {
        const activeItem = navigation.find((item) => isActive(item.path));
        return activeItem ? activeItem.id : "overview";
    };

    // Fixed blue to purple gradient theme
    const primaryGradient = "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)";
    const blueColor = "#2563EB";
    const purpleColor = "#7C3AED";
    const blueLight = "rgba(37, 99, 235, 0.1)";
    const purpleLight = "rgba(124, 58, 237, 0.1)";

    const { user, logout, message, error } = useAuthStore();
    const userStats = {
        name: user?.name || "Aarav",
        status: "verified",
        rating: "4.8",
        role: "Service Professional",
        completedJobs: "127",
    };

    const handleNavigation = (path) => {
        navigate(path);
        setMobileMenuOpen(false);
    };

    return (
        <>
            {/* ---------- Desktop Navigation ---------- */}
            <nav
                className="hidden lg:flex lg:flex-col lg:w-80 lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 
                      bg-white border-r border-gray-200 shadow-lg"
            >
                {/* Logo Section */}
                <div
                    className="flex items-center justify-between h-20 px-6 border-b border-gray-200"
                    style={{ background: primaryGradient }}
                >
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center border-4 border-white/20 shadow-lg">
                            <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-white">
                                WorkJunction
                            </span>
                            <span className="text-xs text-white/80 font-medium">
                                Professional Portal
                            </span>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 flex flex-col overflow-y-auto py-6">
                    <div className="px-4 space-y-2">
                        <div className="px-4 mb-6">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Dashboard
                            </h3>
                        </div>

                        {navigation.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavigation(item.path)}
                                    className={`w-full flex items-center justify-between px-4 py-4 rounded-xl 
                  transition-all duration-200 group relative
                  ${
                      active
                          ? "shadow-md"
                          : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                  }`}
                                    style={
                                        active
                                            ? {
                                                  background: blueLight,
                                                  borderLeft: `4px solid ${blueColor}`,
                                              }
                                            : {}
                                    }
                                >
                                    <div className="flex items-center space-x-4">
                                        <div
                                            className={`p-2 rounded-lg transition-all duration-200 ${
                                                active
                                                    ? "shadow-sm"
                                                    : "bg-gray-100 group-hover:bg-gray-200"
                                            }`}
                                            style={
                                                active
                                                    ? {
                                                          background:
                                                              primaryGradient,
                                                      }
                                                    : {}
                                            }
                                        >
                                            <item.icon
                                                className="w-5 h-5 transition-colors"
                                                style={
                                                    active
                                                        ? { color: "white" }
                                                        : { color: "#6B7280" }
                                                }
                                            />
                                        </div>
                                        <span
                                            className={`font-medium transition-colors ${
                                                active
                                                    ? "text-gray-900 font-semibold"
                                                    : "text-gray-600 group-hover:text-gray-900"
                                            }`}
                                        >
                                            {item.name}
                                        </span>
                                    </div>

                                    {/* Badge and Active Indicator */}
                                    <div className="flex items-center space-x-2">
                                        {item.badge && (
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    item.badge === "New"
                                                        ? "bg-green-100 text-green-700 border border-green-200"
                                                        : "bg-blue-100 text-blue-700"
                                                }`}
                                            >
                                                {item.badge}
                                            </span>
                                        )}
                                        {active && (
                                            <ChevronRight className="w-4 h-4 text-blue-600 transition-transform duration-200" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}

                        <RobustGujaratTranslator />
                    </div>
                </div>

                {/* User Profile Section */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <div
                        className="flex items-center space-x-4 p-4 rounded-xl border border-gray-200 
                         bg-white shadow-sm hover:shadow-md transition-all duration-200 group"
                    >
                        <div className="relative">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                                style={{ background: primaryGradient }}
                            >
                                <User className="w-6 h-6 text-white" />
                            </div>
                            {userStats.status === "verified" && (
                                <div
                                    className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full 
                              border-2 border-white flex items-center justify-center"
                                >
                                    <Shield className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {userStats.name}
                                </p>
                                {/* <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
                                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                    <span className="text-xs font-semibold text-yellow-700">
                                        {userStats.rating}
                                    </span>
                                </div> */}
                            </div>
                        </div>

                        <button
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg 
                             transition-all duration-200"
                            onClick={async () => {
                                const res = await logout();
                                if (res.success) {
                                    toast.success("Logged out successfully");
                                    navigate("/login");
                                } else {
                                    toast.error(error);
                                }
                            }}
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* ---------- Mobile Header ---------- */}
            <header className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-50 shadow-md">
                <div className="flex items-center justify-between h-16 px-4">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 text-gray-600"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>

                        <div className="flex items-center space-x-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                                style={{ background: primaryGradient }}
                            >
                                <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-gray-900">
                                    WorkJunction
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Active Tab Badge */}
                        {navigation.find((item) => isActive(item.path))
                            ?.badge && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
                                {
                                    navigation.find((item) =>
                                        isActive(item.path)
                                    )?.badge
                                }
                            </span>
                        )}

                        <div className="relative">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                                style={{ background: blueLight }}
                            >
                                <User
                                    className="w-5 h-5"
                                    style={{ color: blueColor }}
                                />
                            </div>
                            {userStats.status === "verified" && (
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Overlay */}
                {mobileMenuOpen && (
                    <div className="lg:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
                        <div className="px-4 py-6 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
                            <div className="px-3 mb-4">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                    Navigation
                                </h3>
                            </div>

                            {navigation.map((item) => {
                                const active = isActive(item.path);
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() =>
                                            handleNavigation(item.path)
                                        }
                                        className={`w-full flex items-center justify-between px-4 py-4 rounded-xl 
                            transition-all duration-200 ${
                                active
                                    ? "bg-blue-50 border-l-4 border-blue-600"
                                    : "hover:bg-gray-50"
                            }`}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div
                                                className={`p-2 rounded-lg transition-colors ${
                                                    active
                                                        ? "shadow-sm"
                                                        : "bg-gray-100"
                                                }`}
                                                style={
                                                    active
                                                        ? {
                                                              background:
                                                                  primaryGradient,
                                                          }
                                                        : {}
                                                }
                                            >
                                                <item.icon
                                                    className="w-5 h-5"
                                                    style={
                                                        active
                                                            ? { color: "white" }
                                                            : {
                                                                  color: "#6B7280",
                                                              }
                                                    }
                                                />
                                            </div>
                                            <span
                                                className={`font-medium ${
                                                    active
                                                        ? "text-gray-900 font-semibold"
                                                        : "text-gray-600"
                                                }`}
                                            >
                                                {item.name}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}

                            {/* Mobile User Info */}
                        </div>
                    </div>
                )}
            </header>
        </>
    );
};

export default WorkerNavbar;
