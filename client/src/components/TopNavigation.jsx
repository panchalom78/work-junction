import React, { useEffect } from "react";
import { MapPin, Bell, User, ChevronDown, Menu, X } from "lucide-react";
import { useAuthStore } from "../store/auth.store";

const TopNavigation = ({ sidebarOpen, setSidebarOpen }) => {
    const { user, getUser } = useAuthStore();

    useEffect(() => {
        // Fetch user data on component mount
        getUser();
    }, [getUser]);

    return (
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
            <div className="px-4 sm:px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            {sidebarOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center">
                                <img src="/logo_plane.png" alt="logo" />
                            </div>
                            <div className="hidden sm:block">
                                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Service Agent
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3 bg-gray-100 rounded-xl px-3 py-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-semibold text-gray-900">
                                    {user?.name || "User"}
                                </p>
                                <p className="text-xs text-gray-600">
                                    {user?.role || "Role"}
                                </p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-600" />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default TopNavigation;
