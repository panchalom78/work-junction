import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store"; // Adjust path as needed
import TopNavigation from "../components/TopNavigation";
import Sidebar from "../components/Sidebar";
import DashboardContent from "../components/DashboardContent";
import DocumentViewer from "../components/DocumentViewer";
import toast from "react-hot-toast";

const ServiceAgentDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [selectedWorker, setSelectedWorker] = useState(null);
    const { user, getUser, loading } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        const initializeUser = async () => {
            if (!user) {
                const result = await getUser();
                if (!result.success) {
                    toast.error("Please log in to access the dashboard.");
                    navigate("/login");
                }
            }
        };
        initializeUser();
    }, [user, getUser, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return null; // Redirect handled by useEffect
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            <TopNavigation
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />
            <div className="flex pt-16">
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
                <DashboardContent
                    sidebarOpen={sidebarOpen}
                    activeTab={activeTab}
                    setSelectedWorker={setSelectedWorker}
                />
            </div>
            {selectedWorker && (
                <DocumentViewer
                    worker={selectedWorker}
                    onClose={() => setSelectedWorker(null)}
                />
            )}
        </div>
    );
};

export default ServiceAgentDashboard;
