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
import WorkerProfile from "../pages/WorkerProfile";
import BookingPage from "../pages/BookingPage";
import CustomerBookings from "../pages/CustomerBookings";
import WorkerBookings from "../pages/WorkerBookings";
import CustomerProfile from "../pages/CustomerProfile";
import CustomerChatPage from "../pages/CustomerChatPage";

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
                    //Worker
                    <Route path="worker" element={<WorkerDashboard />}>
                        <Route index element={<Overview />} />
                        <Route
                            path="services"
                            element={<WorkerServiceManagement />}
                        />
                        <Route
                            path="availability"
                            element={<AvailabilityManagement />}
                        />
                        // Add this to your worker routing
                        <Route path="bookings" element={<WorkerBookings />} />
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
                    //customer
                    <Route path="customer">
                        <Route index element={<CustomerHomePage />} />
                        <Route path="search" element={<SearchResultsPage />} />
                        // Add this route to your customer routes
                        <Route
                            path="worker/profile/:workerId"
                            element={<WorkerProfile />}
                        />
                        <Route
                            path="booking/:workerId"
                            element={<BookingPage />}
                        />
                        // Add this to your customer routing
                        <Route path="bookings" element={<CustomerBookings />} />
                        // In your customer routes
                        <Route path="profile" element={<CustomerProfile />} />
                        <Route path="chat" element={<CustomerChatPage />} />
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
