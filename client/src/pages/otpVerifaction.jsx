import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { useAuthStore } from "../store/auth.store.js";
import { useNavigate } from "react-router-dom";

import { FiMail, FiPhone, FiArrowLeft, FiCheck, FiClock } from "react-icons/fi";

// ✅ Import your Lottie animation
import otpVerificationAnim from "../assets/tool.json";
import toast from "react-hot-toast";

const OTPVerificationPage = () => {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const navigate = useNavigate();
    const verifyOTP = useAuthStore((state) => state.verifyOTP);
    const inputRefs = useRef([]);
    const { user, getUser, resendOTP } = useAuthStore();

    // Mock email/phone - you can pass this as props
    const contactInfo = {
        type: "email", // or 'phone'
        email: user?.email || "",
    };

    useEffect(() => {
        let timer;
        if (countdown > 0 && !canResend) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (countdown === 0 && !canResend) {
            setCanResend(true);
        }
        return () => clearTimeout(timer);
    }, [countdown, canResend]);

    const handleOtpChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text");
        const pastedNumbers = pastedData
            .replace(/\D/g, "")
            .split("")
            .slice(0, 6);

        const newOtp = [...otp];
        pastedNumbers.forEach((num, index) => {
            if (index < 6) {
                newOtp[index] = num;
            }
        });

        setOtp(newOtp);

        // Focus the next empty input or the last one
        const nextEmptyIndex = newOpto.findIndex((val) => val === "");
        const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
        if (inputRefs.current[focusIndex]) {
            inputRefs.current[focusIndex].focus();
        }
    };

    useEffect(() => {
        const getUserData = async () => {
            const response = await getUser();
            if (response.success) {
                if (response.user.isVerified) {
                    if (response.user.role == "WORKER") {
                        navigate("/worker");
                    } else if (response.user.role == "CUSTOMER") {
                        navigate("/customer/dashboard");
                    } else if (response.user.role == "SERVICE_AGENT") {
                        navigate("/serviceAgentDashboard");
                    } else if (response.user.role == "ADMIN") {
                        navigate("/adminDashboard");
                    }
                }
            }
        };
        getUserData();
    }, []);

    const handleVerify = async (e) => {
        e.preventDefault();
        const otpString = otp.join("");

        if (otpString.length !== 6) {
            return;
        }

        const result = await verifyOTP({
            otp: otpString,
            email: contactInfo.email,
        });

        setIsLoading(false);

        if (result.success) {
            toast.success("OTP verified successfully!");
            setIsVerified(true);
            const response = await getUser();
            if (response.success) {
                if (response.user.role == "WORKER") {
                    navigate("/worker/verification");
                } else if (response.user.role == "CUSTOMER") {
                    navigate("/customer/dashboard");
                } else if (response.user.role == "SERVICE_AGENT") {
                    navigate("/serviceAgentDashboard");
                } else if (response.user.role == "ADMIN") {
                    navigate("/adminDashboard");
                }
            }
        } else {
            toast.error("OTP verification failed");
        }
    };

    const handleResendOTP = async () => {
        if (!canResend) return;

        try {
            const response = await resendOTP(user?.email);
            if (response.success) {
                setCountdown(30);
                setCanResend(false);
                setOtp(["", "", "", "", "", ""]);

                // Focus first input
                if (inputRefs.current[0]) {
                    inputRefs.current[0].focus();
                }
                toast.success("OTP resent successfully!");
            } else {
                toast.error("OTP resend failed");
            }
        } catch (error) {
            toast.error("OTP resend failed. Please try again later.");
        }

        // Simulate resend API call
        console.log("Resending OTP...");
    };

    const isOtpComplete = otp.every((digit) => digit !== "");

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50/30 flex items-center justify-center p-4">
            <div className="max-w-5xl w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
                >
                    {/* 🔹 Lottie Animation - Left side on desktop, first on mobile */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="order-1 lg:order-1 flex justify-center items-center"
                    >
                        <Lottie
                            animationData={otpVerificationAnim}
                            loop
                            autoplay
                            className="w-full max-w-sm sm:max-w-md lg:max-w-lg h-auto"
                        />
                    </motion.div>

                    {/* 🔹 OTP Verification Form - Right side on desktop, second on mobile */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="order-2 lg:order-2 bg-white rounded-2xl shadow-xl p-6 lg:p-8 border"
                    >
                        {/* Back Button */}
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
                            onClick={() => window.history.back()}
                        >
                            <FiArrowLeft className="mr-2" size={16} />
                            Back
                        </motion.button>

                        {/* Header */}
                        <div className="text-center mb-8">
                            <motion.h1
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3"
                            >
                                Enter OTP
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-gray-600 text-sm lg:text-base mb-4"
                            >
                                We've sent a 6-digit code to your{" "}
                                {contactInfo.type}
                            </motion.p>

                            {/* Contact Info */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="flex items-center justify-center space-x-2 bg-purple-50 rounded-lg py-3 px-4 border border-purple-100"
                            >
                                {contactInfo.type === "email" ? (
                                    <FiMail
                                        className="text-purple-600"
                                        size={18}
                                    />
                                ) : (
                                    <FiPhone
                                        className="text-purple-600"
                                        size={18}
                                    />
                                )}
                                <span className="text-purple-700 font-medium">
                                    {contactInfo[contactInfo.type]}
                                </span>
                            </motion.div>
                        </div>

                        {!isVerified ? (
                            <form onSubmit={handleVerify} className="space-y-6">
                                {/* OTP Inputs */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                    className="space-y-4"
                                >
                                    <label className="text-sm font-medium text-gray-700 block text-center">
                                        Enter 6-digit verification code
                                    </label>

                                    <div className="flex justify-center space-x-3">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                ref={(el) =>
                                                    (inputRefs.current[index] =
                                                        el)
                                                }
                                                type="text"
                                                inputMode="numeric"
                                                maxLength="1"
                                                value={digit}
                                                onChange={(e) =>
                                                    handleOtpChange(
                                                        index,
                                                        e.target.value
                                                    )
                                                }
                                                onKeyDown={(e) =>
                                                    handleKeyDown(index, e)
                                                }
                                                onPaste={handlePaste}
                                                className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                                                autoFocus={index === 0}
                                            />
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Countdown Timer */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="text-center"
                                >
                                    {!canResend ? (
                                        <div className="flex items-center justify-center text-gray-500 text-sm">
                                            <FiClock
                                                className="mr-2"
                                                size={14}
                                            />
                                            Resend code in {countdown}s
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleResendOTP}
                                            className="text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors"
                                        >
                                            Didn't receive the code?{" "}
                                            <span className="underline">
                                                Resend OTP
                                            </span>
                                        </button>
                                    )}
                                </motion.div>

                                {/* Verify Button */}
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.9 }}
                                    type="submit"
                                    disabled={!isOtpComplete || isLoading}
                                    className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                                            Verifying...
                                        </div>
                                    ) : (
                                        "Verify OTP"
                                    )}
                                </motion.button>
                            </form>
                        ) : (
                            /* Success State */
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-6"
                            >
                                <div className="flex justify-center">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                        <FiCheck
                                            className="text-green-600"
                                            size={32}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Verified Successfully!
                                    </h3>
                                    <p className="text-gray-600">
                                        Your account has been verified
                                        successfully.
                                    </p>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all"
                                    onClick={() => {
                                        // Redirect to dashboard or next step
                                        console.log(
                                            "Proceeding to dashboard..."
                                        );
                                    }}
                                >
                                    Continue to Dashboard
                                </motion.button>
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default OTPVerificationPage;
