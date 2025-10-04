import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import React from 'react'
import Login from "../pages/loginPage";
import Register from "../pages/registerPage";
import OTPVerificationPage from "../pages/otpVerifaction";
import WorkerVerificationPage from "../pages/workerVerificationPage";
import WorkerDashboard from "../pages/workerDashboard";


const Routers = () => {
    return (
        <div>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Register />} />
                    <Route path="/otpVerifaction" element={<OTPVerificationPage />} />
                    <Route path="/verification" element={<WorkerVerificationPage />} />
                    <Route path="/workerDashboard" element={<WorkerDashboard />} />

                </Routes>
            </Router>
        </div>
    );
};

export default Routers;
