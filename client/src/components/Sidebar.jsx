import React from "react";
import {
    MapPin,
    Shield,
    Users,
    MessageCircle,
    FileText,
    Send,
    Download,
    Upload,
    Smartphone,
    StarIcon,
    MessageCircleCodeIcon,
} from "lucide-react";

// Import your component views for each sidebar tab
import VerificationTab from "./tabs/VerificationTab";
import agentDashboard from "../components/tabs/agentDashboard";

// Map tab id to the corresponding component
const tabComponents = {
    verification: VerificationTab,
};

const Sidebar = ({ sidebarOpen, activeTab, setActiveTab, setSidebarOpen }) => {
    if (!sidebarOpen) return null;

    const menuItems = [
        { id: "dashboard", label: "Dashboard", icon: MapPin },
        { id: "verification", label: "Verification", icon: Shield },
        { id: "workers", label: "Worker Management", icon: Users },
        { id: "requests", label: "Worker Requests", icon: MessageCircle },
        {
            id: "non-smartphone-workers",
            label: "Non Smartphone Workers",
            icon: Smartphone,
        },
        {
            id: "reviews",
            label: "Reviews And Ratings",
            icon: StarIcon,
        },
        {
            id: "chat",
            label: "Chat",
            icon: MessageCircleCodeIcon,
        },
    ];

    // Find the component for the currently active tab
    const ActiveComponent = tabComponents[activeTab];

    return (
        <div className="w-64 bg-white/80 backdrop-blur-lg border-r border-gray-200 min-h-screen fixed h-full overflow-y-auto flex flex-col z-50">
            <div className="p-4 sm:p-6 space-y-8 flex-1">
                {/* Navigation Menu */}
                <div className="space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                                activeTab === item.id
                                    ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-100 shadow-sm"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium text-sm sm:text-base">
                                {item.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Quick Actions */}
            </div>

            {/* Render the component for the active tab */}
            <agentDashboard />
        </div>
    );
};

export default Sidebar;
