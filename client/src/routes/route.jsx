import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import React from "react";
import Login from "../pages/loginPage";
import Register from "../pages/registerPage";
import OTPVerificationPage from "../pages/otpVerifaction";
import WorkerVerificationPage from "../pages/workerVerificationPage";
import WorkerDashboard from "../pages/workerDashboard";
import WorkJunctionLanding from "../pages/WorkJunctionLanding";
import AdminDashboard from "../pages/AdminDashboard";
import ServiceAgentDashboard from "../pages/ServiceAgentDashboard";
import CustomerDashboard from "../pages/customerdahboard";
import ServiceBooking from "../pages/servicebooking";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import ServiceAgentSetup from "../pages/ServiceAgentSetup";

const Routers = () => {
    return (
        <div>
            <Router>
                <Routes>
                    <Route path="/" element={<WorkJunctionLanding />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Register />} />
                    <Route
                        path="/otpVerification"
                        element={<OTPVerificationPage />}
                    />
                    <Route
                        path="/reset-password"
                        element={<ResetPasswordPage />}
                    />
                    <Route
                        path="/worker/verification"
                        element={<WorkerVerificationPage />}
                    />
                    <Route
                        path="/worker/dashboard"
                        element={<WorkerDashboard />}
                    />
                    <Route
                        path="/adminDashboard"
                        element={<AdminDashboard />}
                    />
                    <Route
                        path="/serviceAgentDashboard"
                        element={<ServiceAgentDashboard />}
                    />
                    <Route
                        path="/customer/dashboard"
                        element={<CustomerDashboard />}
                    ></Route>

                    <Route
                        path="/servicebooking/:id"
                        element={<ServiceBooking/>}>
                    </Route>
                   
                    {/* Service Agent */}
                    <Route
                        path="/serviceAgentDashboard"
                        element={<ServiceAgentDashboard />}
                    />
                    <Route
                        path="/serviceAgentSetup"
                        element={<ServiceAgentSetup />}
                    />
                </Routes>
            </Router>
        </div>
    );
};

export default Routers;
