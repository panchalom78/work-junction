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
import WorkerChat from "../pages/WorkerChat";
import Overview from "../components/Overview";
import WorkerServiceManagement from "../components/ServiceManagement";
import BookingManagement from "../components/BookingManagement";
import AvailabilityManagement from "../components/AvailabilityManagement";
import Settings from "../components/Settings";
import CustomerHomePage from "../pages/CustomerHomePage";
import SearchResultsPage from "../pages/SearchResultsPage";
import CustomerBookingHostory from "../pages/Customer.bookingHistory";

const Routers = () => {
    return (
        <div>
            <Router>
                <Routes>
                    <Route path="/" element={<WorkJunctionLanding />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Register />} />

                    <Route path="/otpVerifaction" element={<OTPVerificationPage />} />
                    <Route path="/verification" element={<WorkerVerificationPage />} />
                    <Route path="/workerDashboard" element={<WorkerDashboard />} />
                    <Route path="/admin/*" element={<AdminDashboard />} />
                    <Route path="/serviceAgentDashboard" element={<ServiceAgentDashboard />} />
                    <Route
                        path="/otpVerification"
                        element={<OTPVerificationPage />}
                    />
                    <Route
                        path="/reset-password"
                        element={<ResetPasswordPage />}
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
                        element={<ServiceBooking />}
                    ></Route>

                    {/* Service Agent */}
                    <Route
                        path="/serviceAgentDashboard"
                        element={<ServiceAgentDashboard />}
                    />
                    <Route
                        path="/serviceAgentSetup"
                        element={<ServiceAgentSetup />}
                    />
                    <Route path="worker" element={<WorkerDashboard />}>
                        <Route index element={<Overview />} />
                        <Route
                            path="services"
                            element={<WorkerServiceManagement />}
                        />
                        <Route
                            path="bookings"
                            element={<BookingManagement />}
                        />
                        <Route
                            path="availability"
                            element={<AvailabilityManagement />}
                        />
                        <Route path="settings" element={<Settings />} />
                        <Route path="chat" element={<WorkerChat />} />
                        <Route path="chat/:chatId" element={<WorkerChat />} />
                        <Route
                            path="chat/with/:customerId"
                            element={<WorkerChat />}
                        />
                    </Route>
                    <Route
                        path="/worker/verification"
                        element={<WorkerVerificationPage />}
                    />
                    <Route path="customer">
                        <Route index element={<CustomerHomePage />} />
                        <Route path="search" element={<SearchResultsPage />} />
                    </Route>

                    <Route
                        path="/customer/booking/history"
                        element={<CustomerBookingHostory />}
                    ></Route>

                </Routes>
            </Router>
        </div>
    );
};

export default Routers;
