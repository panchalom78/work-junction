import React, { useEffect } from "react";
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
    Calculator,
    PieChart,
    BarChart3,
    Target,
} from "lucide-react";

import { useAuthStore } from "../store/auth.store";
import toast from "react-hot-toast";
import RobustGujaratTranslator, {
    applyPreferredLanguageAsync,
} from "./GujaratTranslator";

const WorkerNavbar = ({ mobileMenuOpen, setMobileMenuOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();

    // Deep navy blue color theme with #17182A as primary
    const theme = {
        primary: {
            dark: "#17182A", // Primary deep navy
            blue: "#2563EB", // Accent blue
            purple: "#7C3AED", // Accent purple
            gradient: "linear-gradient(135deg, #17182A 0%, #2D1B69 100%)",
            lightGradient:
                "linear-gradient(135deg, rgba(23, 24, 42, 0.1) 0%, rgba(45, 27, 105, 0.1) 100%)",
        },
        accents: {
            gold: "#F59E0B", // For ratings/math symbols
            teal: "#0D9488", // Complementary accent
            amber: "#D97706", // Secondary accent
            electric: "#6366F1", // Electric indigo for highlights
        },
        background: {
            light: "#F8FAFC",
            card: "#FFFFFF",
            sidebar: "#FFFFFF",
        },
        text: {
            primary: "#17182A",
            secondary: "#4B5563",
            light: "#9CA3AF",
        },
    };

    const navigation = [
        {
            id: "overview",
            name: "Overview",
            icon: PieChart,
            badge: null,
            path: "/worker",
        },
        {
            id: "services",
            name: "Services",
            icon: Calculator,
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

    // Mathematical decoration component
    const MathDecoration = () => (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-4 -right-4 w-8 h-8 opacity-20">
                <div className="text-2xl font-mono text-white">∑</div>
            </div>
            <div className="absolute bottom-2 left-4 w-6 h-6 opacity-20">
                <div className="text-xl font-mono text-white">π</div>
            </div>
            <div className="absolute top-1/2 right-8 w-4 h-4 opacity-20">
                <div className="text-lg font-mono text-white">∫</div>
            </div>
        </div>
    );
    useEffect(() => {
        // attempt to apply saved language; await is optional
        applyPreferredLanguageAsync(5000).then((applied) => {
            console.log("preferred language applied:", applied);
        });
    }, []);

    return (
        <>
            {/* ---------- Desktop Navigation ---------- */}
            <nav
                className="hidden lg:flex lg:flex-col lg:w-80 lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 
                      bg-white border-r border-gray-200/60 shadow-lg backdrop-blur-sm"
                style={{ background: theme.background.sidebar }}
            >
                {/* Logo Section with Deep Navy Theme */}
                <div
                    className="flex items-center justify-between h-20 px-6 border-b border-white/10 relative overflow-hidden"
                    style={{ background: theme.primary.gradient }}
                >
                    <MathDecoration />
                    <div className="flex items-center space-x-3 relative z-10">
                        <div className="w-12 h-12 flex items-center justify-center">
                            <img src="/logo.jpeg" alt="logo" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-white font-sans">
                                WorkJunction
                            </span>
                            <span className="text-xs text-white/80 font-medium font-mono">
                                Professional Portal
                            </span>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 flex flex-col overflow-y-auto py-6">
                    <div className="px-4 space-y-2">
                        {navigation.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavigation(item.path)}
                                    className={`w-full flex items-center justify-between px-4 py-4 rounded-xl 
                  transition-all duration-200 group relative overflow-hidden
                  ${
                      active
                          ? "shadow-lg"
                          : "hover:bg-gray-50/80 text-gray-600 hover:text-gray-900"
                  }`}
                                    style={
                                        active
                                            ? {
                                                  background:
                                                      theme.primary
                                                          .lightGradient,
                                                  borderLeft: `4px solid ${theme.primary.dark}`,
                                              }
                                            : {}
                                    }
                                >
                                    {/* Active state mathematical decoration */}
                                    {active && (
                                        <div className="absolute top-2 right-2 opacity-10">
                                            <div
                                                className="text-lg font-mono"
                                                style={{
                                                    color: theme.primary.dark,
                                                }}
                                            >
                                                ∂
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-4 relative z-10">
                                        <div
                                            className={`p-2 rounded-lg transition-all duration-200 ${
                                                active
                                                    ? "shadow-sm"
                                                    : "bg-gray-100/80 group-hover:bg-gray-200/80 backdrop-blur-sm"
                                            }`}
                                            style={
                                                active
                                                    ? {
                                                          background:
                                                              theme.primary
                                                                  .gradient,
                                                      }
                                                    : {}
                                            }
                                        >
                                            <item.icon
                                                className="w-5 h-5 transition-colors"
                                                style={
                                                    active
                                                        ? { color: "white" }
                                                        : {
                                                              color: theme.text
                                                                  .secondary,
                                                          }
                                                }
                                            />
                                        </div>
                                        <span
                                            className={`font-medium transition-colors ${
                                                active
                                                    ? "font-semibold"
                                                    : "text-gray-600 group-hover:text-gray-900"
                                            }`}
                                            style={
                                                active
                                                    ? {
                                                          color: theme.text
                                                              .primary,
                                                      }
                                                    : {}
                                            }
                                        >
                                            {item.name}
                                        </span>
                                    </div>

                                    {/* Badge and Active Indicator */}
                                    <div className="flex items-center space-x-2 relative z-10">
                                        {item.badge && (
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold font-mono ${
                                                    item.badge === "New"
                                                        ? "bg-green-100 text-green-700 border border-green-200"
                                                        : "bg-amber-100 text-amber-700 border border-amber-200"
                                                }`}
                                            >
                                                {item.badge}
                                            </span>
                                        )}
                                        {active && (
                                            <ChevronRight
                                                className="w-4 h-4 transition-transform duration-200"
                                                style={{
                                                    color: theme.primary.dark,
                                                }}
                                            />
                                        )}
                                    </div>
                                </button>
                            );
                        })}

                        {/* Translator with deep navy styling */}
                        <div className="mt-6 px-4">
                            <div className="border-t border-gray-200/60 pt-6">
                                <RobustGujaratTranslator />
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Profile Section */}
                <div className="p-6 border-t border-gray-200/60 bg-gray-50/50 backdrop-blur-sm">
                    <div
                        className="flex items-center space-x-4 p-4 rounded-xl border border-gray-200/60 
                         bg-white/80 shadow-sm hover:shadow-md transition-all duration-200 group backdrop-blur-sm relative overflow-hidden"
                    >
                        {/* Mathematical background pattern */}
                        <div className="absolute inset-0 opacity-[0.02]">
                            <div
                                className="absolute top-2 left-4 font-mono"
                                style={{ color: theme.primary.dark }}
                            >
                                ∇
                            </div>
                            <div
                                className="absolute bottom-2 right-4 font-mono"
                                style={{ color: theme.primary.dark }}
                            >
                                ∆
                            </div>
                        </div>

                        <div className="relative">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm backdrop-blur-sm"
                                style={{ background: theme.primary.gradient }}
                            >
                                <User className="w-6 h-6 text-white" />
                            </div>
                            {userStats.status === "verified" && (
                                <div
                                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full 
                              border-2 border-white flex items-center justify-center shadow-sm"
                                    style={{ background: theme.accents.teal }}
                                >
                                    <Shield className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                                <p
                                    className="text-sm font-semibold truncate"
                                    style={{ color: theme.text.primary }}
                                >
                                    {userStats.name}
                                </p>
                            </div>
                        </div>

                        <button
                            className="p-2 hover:bg-gray-100/80 rounded-lg transition-all duration-200 backdrop-blur-sm"
                            style={{ color: theme.text.secondary }}
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
            <header
                className="lg:hidden bg-white/95 border-b border-gray-200/60 sticky top-0 z-50 shadow-md backdrop-blur-sm"
                style={{ background: theme.background.card }}
            >
                <div className="flex items-center justify-between h-16 px-4">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100/80 transition-all duration-200 backdrop-blur-sm"
                            style={{ color: theme.text.secondary }}
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>

                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm backdrop-blur-sm">
                                <div className="text-white font-bold text-sm font-mono flex items-center justify-center">
                                    <img src="/logo_plane.png" alt="" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span
                                    className="text-lg font-bold"
                                    style={{ color: theme.text.primary }}
                                >
                                    WorkJunction
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        {/* Active Tab Badge */}
                        {navigation.find((item) => isActive(item.path))
                            ?.badge && (
                            <span
                                className="px-2 py-1 rounded-full text-xs font-semibold border font-mono shadow-sm"
                                style={{
                                    background: `linear-gradient(135deg, ${theme.accents.gold}20 0%, ${theme.accents.amber}20 100%)`,
                                    color: theme.accents.amber,
                                    borderColor: `${theme.accents.gold}40`,
                                }}
                            >
                                {
                                    navigation.find((item) =>
                                        isActive(item.path)
                                    )?.badge
                                }
                            </span>
                        )}

                        <div className="relative">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm backdrop-blur-sm"
                                style={{
                                    background: theme.primary.lightGradient,
                                }}
                            >
                                <User
                                    className="w-5 h-5"
                                    style={{ color: theme.primary.dark }}
                                />
                            </div>
                            {userStats.status === "verified" && (
                                <div
                                    className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white shadow-sm"
                                    style={{ background: theme.accents.teal }}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation Overlay */}
                {mobileMenuOpen && (
                    <div
                        className="lg:hidden absolute top-16 left-0 right-0 border-b border-gray-200/60 shadow-lg backdrop-blur-sm"
                        style={{ background: theme.background.card }}
                    >
                        <div className="px-4 py-6 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
                            <div className="px-3 mb-4">
                                <h3
                                    className="text-sm font-semibold uppercase tracking-wider font-mono"
                                    style={{ color: theme.text.secondary }}
                                >
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
                            transition-all duration-200 relative overflow-hidden
                            ${
                                active
                                    ? "shadow-lg border-l-4"
                                    : "hover:bg-gray-50/80"
                            }`}
                                        style={
                                            active
                                                ? {
                                                      background:
                                                          theme.primary
                                                              .lightGradient,
                                                      borderLeftColor:
                                                          theme.primary.dark,
                                                  }
                                                : {}
                                        }
                                    >
                                        {/* Mathematical decoration for active items */}
                                        {active && (
                                            <div className="absolute top-2 right-2 opacity-10">
                                                <div
                                                    className="text-lg font-mono"
                                                    style={{
                                                        color: theme.primary
                                                            .dark,
                                                    }}
                                                >
                                                    ∂
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center space-x-4 relative z-10">
                                            <div
                                                className={`p-2 rounded-lg transition-colors ${
                                                    active
                                                        ? "shadow-sm"
                                                        : "bg-gray-100/80"
                                                }`}
                                                style={
                                                    active
                                                        ? {
                                                              background:
                                                                  theme.primary
                                                                      .gradient,
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
                                                                  color: theme
                                                                      .text
                                                                      .secondary,
                                                              }
                                                    }
                                                />
                                            </div>
                                            <span
                                                className={`font-medium ${
                                                    active
                                                        ? "font-semibold"
                                                        : "text-gray-600"
                                                }`}
                                                style={
                                                    active
                                                        ? {
                                                              color: theme.text
                                                                  .primary,
                                                          }
                                                        : {}
                                                }
                                            >
                                                {item.name}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}

                            {/* Mathematical divider */}
                            <div className="px-3 mt-6">
                                <div className="border-t border-gray-200/60 pt-4">
                                    <div className="flex justify-center opacity-20">
                                        <div
                                            className="text-sm font-mono"
                                            style={{
                                                color: theme.primary.dark,
                                            }}
                                        >
                                            ∑ WorkJunction π
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </header>
        </>
    );
};

export default WorkerNavbar;
