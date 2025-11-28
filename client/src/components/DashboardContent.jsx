import React, { useEffect, useState } from "react";
import StatsGrid from "./StatsGrid";
import VerificationQueue from "./VerificationQueue";
import WorkerRequests from "./WorkerRequests";
import ProgressStats from "./ProgressStats";
import WorkerManagement from "../components/tabs/WorkerManagement";
import NonSmartphoneWorkers from "../components/tabs/nonSmartPhone"; // New import
import VerificationTab from "../components/tabs/VerificationTab";
import CustomerRequests from "../components/tabs/customerRequest";
import axiosInstance from "../utils/axiosInstance";
import ServiceAgentDashboard from "../components/tabs/agentDashboard";
import ServiceAgentReviews from "./tabs/reviewPage";
import ServiceAgentChat from "./tabs/ServiceAgentChat";

const DashboardContent = ({ sidebarOpen, activeTab, setSelectedWorker }) => {
    const [areaStats, setAreaStats] = useState([]);
    const [queue, setQueue] = useState([]);
    const [workerRequests, setWorkerRequests] = useState([]);
    const [progressStats, setProgressStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                // Fetch Area Stats
                const areaStatsRes = await axiosInstance.get(
                    "/api/service-agent/area-stats"
                );
                console.log("Area Stats Response:", areaStatsRes);
                if (areaStatsRes.data && areaStatsRes.data.success) {
                    setAreaStats(areaStatsRes.data.data);
                }

                // Fetch Progress Stats
                const progressRes = await axiosInstance.get(
                    "/api/service-agent/stats"
                );
                if (progressRes.data && progressRes.data.success) {
                    setProgressStats(
                        progressRes.data.data.verificationsCompleted
                    );
                }

                // Mock data
                setQueue([
                    {
                        id: 1,
                        name: "Sanjay Verma",
                        service: "Plumber",
                        submitted: "2 hours ago",
                        priority: "high",
                        documents: {
                            aadhaar: true,
                            selfie: true,
                            police: true,
                        },
                        location: "Andheri East",
                    },
                ]);
                setWorkerRequests([
                    {
                        name: "Amit Sharma",
                        type: "Profile Update",
                        time: "30 min ago",
                        status: "pending",
                    },
                ]);
            } catch (e) {
                setAreaStats([]);
                setQueue([]);
                setWorkerRequests([]);
            }
            setLoading(false);
        };

        fetchStats();
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case "verification":
                return <VerificationTab />;

            case "workers":
                return <WorkerManagement />;

            case "non-smartphone-workers":
                return <NonSmartphoneWorkers />;

            case "requests":
                return <CustomerRequests />;

            case "dashboard":
                return <ServiceAgentDashboard />;
            case "reviews":
                return <ServiceAgentReviews />;
            case "chat":
                return <ServiceAgentChat />;

            default:
                <ServiceAgentDashboard />;
        }
    };

    return (
        <div
            className={`flex-1 transition-all duration-300 ${
                sidebarOpen ? "ml-0 lg:ml-64" : "ml-0"
            }`}
        >
            <div className="p-4 sm:p-6 space-y-6">{renderContent()}</div>
        </div>
    );
};

export default DashboardContent;
