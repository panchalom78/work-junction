import { useEffect, useState } from "react";
import WorkerNavbar from "../components/WorkerNavbar";
import { useAuthStore } from "../store/auth.store";
import { Outlet, useNavigate } from "react-router-dom";

const WorkerDashboard = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { getUser } = useAuthStore();

    const navigate = useNavigate();

    useEffect(() => {
        const getUserData = async () => {
            const response = await getUser();
            if (response.success) {
                if (response.user.role == "WORKER") {
                    if (!response.user.isVerified) {
                        navigate("/otpVerification");
                    }
                    if (
                        !response.user?.workerProfile?.verification?.status ==
                        "APPROVED"
                    ) {
                        navigate("/worker/verification");
                    }
                } else if (response.user.role == "CUSTOMER") {
                    navigate("/customer/dashboard");
                } else if (response.user.role == "SERVICE_AGENT") {
                    navigate("/serviceAgentDashboard");
                } else if (response.user.role == "ADMIN") {
                    navigate("/adminDashboard");
                }
            } else {
                navigate("/login");
            }
        };
        getUserData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 lg:pl-64">
            {/* 🔹 Navigation */}
            <WorkerNavbar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
            />

            {/* 🔹 Main Content */}
            <main className="lg:ml-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default WorkerDashboard;
