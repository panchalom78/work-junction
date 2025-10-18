import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    FiMail,
    FiLock,
    FiEye,
    FiEyeOff,
    FiArrowLeft,
    FiCheck,
    FiClock,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/auth.store";

// Import your Lottie animation
import otpVerificationAnim from "../assets/tool.json";

const ResetPasswordPage = () => {
    const [step, setStep] = useState(1); // 1: Request OTP, 2: Verify OTP & Set Password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const inputRefs = useRef([]);
    const { resendOTP, verifyOTP, message } = useAuthStore();

    // Check if email is passed via query params (from login page)
    useEffect(() => {
        const emailFromParams = searchParams.get("email");
        if (emailFromParams) {
            setEmail(emailFromParams);
        }
    }, [searchParams]);

    // Countdown timer
    useEffect(() => {
        let timer;
        if (countdown > 0 && !canResend) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else if (countdown === 0 && !canResend) {
            setCanResend(true);
        }
        return () => clearTimeout(timer);
    }, [countdown, canResend]);

    // OTP input handlers
    const handleOtpChange = (index, value) => {
        if (!/^\d?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

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
        const nextEmptyIndex = newOtp.findIndex((val) => val === "");
        const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
        if (inputRefs.current[focusIndex]) {
            inputRefs.current[focusIndex].focus();
        }
    };

    // Step 1: Request OTP
    const handleRequestOTP = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error("Please enter your email address");
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        setIsLoading(true);

        try {
            // Replace with your actual API call
            const response = await resendOTP(email, "PASSWORD_RESET");

            if (response.success) {
                setStep(2);
                setCountdown(30);
                setCanResend(false);
                toast.success("OTP sent to your email!");
            } else {
                toast.error(message || "Failed to send OTP");
            }
        } catch (error) {
            toast.error(message || "Failed to send OTP. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify OTP and Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        const otpString = otp.join("");

        if (otpString.length !== 6) {
            toast.error("Please enter the complete 6-digit OTP");
            return;
        }

        if (password.length < 8) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            // Replace with your actual API call
            const response = await verifyOTP({
                email,
                otp: otpString,
                newPassword: password,
                purpose: "PASSWORD_RESET",
            });

            if (response.success) {
                setIsVerified(true);
                toast.success(message);

                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                toast.error(message || "Failed to reset password");
            }
        } catch (error) {
            toast.error(
                message || "Failed to reset password. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!canResend) return;

        try {
            // Replace with your actual API call
            const response = await requestPasswordResetOTP(email);

            if (response.success) {
                setCountdown(30);
                setCanResend(false);
                setOtp(["", "", "", "", "", ""]);

                if (inputRefs.current[0]) {
                    inputRefs.current[0].focus();
                }
                toast.success("OTP resent successfully!");
            } else {
                toast.error("Failed to resend OTP");
            }
        } catch (error) {
            toast.error("Failed to resend OTP. Please try again.");
        }
    };

    const isOtpComplete = otp.every((digit) => digit !== "");
    const isFormValid = password.length >= 6 && password === confirmPassword;

    // Mock API functions - replace with your actual API calls
    const requestPasswordResetOTP = async (email) => {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, message: "OTP sent successfully" });
            }, 1000);
        });
    };

    const verifyAndResetPassword = async (email, otp, newPassword) => {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: "Password reset successfully",
                });
            }, 1000);
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50/30 flex items-center justify-center p-4">
            <div className="max-w-5xl w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
                >
                    {/* 🔹 Lottie Animation */}
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

                    {/* 🔹 Reset Password Form */}
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
                            onClick={() =>
                                step === 1 ? navigate(-1) : setStep(1)
                            }
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
                                {step === 1
                                    ? "Reset Your Password"
                                    : "Create New Password"}
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-gray-600 text-sm lg:text-base"
                            >
                                {step === 1
                                    ? "Enter your email address to receive a verification code"
                                    : "Enter the OTP sent to your email and create a new password"}
                            </motion.p>
                        </div>

                        {!isVerified ? (
                            <form
                                onSubmit={
                                    step === 1
                                        ? handleRequestOTP
                                        : handleResetPassword
                                }
                                className="space-y-6"
                            >
                                {/* Step 1: Email Input */}
                                {step === 1 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className="space-y-4"
                                    >
                                        <div className="relative">
                                            <FiMail
                                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                size={20}
                                            />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) =>
                                                    setEmail(e.target.value)
                                                }
                                                placeholder="Enter your email address"
                                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                                required
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 2: OTP and Password Inputs */}
                                {step === 2 && (
                                    <>
                                        {/* Email Display */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="flex items-center justify-center space-x-2 bg-blue-50 rounded-lg py-3 px-4 border border-blue-100 mb-6"
                                        >
                                            <FiMail
                                                className="text-blue-600"
                                                size={18}
                                            />
                                            <span className="text-blue-700 font-medium">
                                                {email}
                                            </span>
                                        </motion.div>

                                        {/* OTP Input */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.6 }}
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
                                                            (inputRefs.current[
                                                                index
                                                            ] = el)
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
                                                            handleKeyDown(
                                                                index,
                                                                e
                                                            )
                                                        }
                                                        onPaste={handlePaste}
                                                        className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                                        autoFocus={index === 0}
                                                    />
                                                ))}
                                            </div>
                                        </motion.div>

                                        {/* New Password */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.7 }}
                                            className="space-y-4"
                                        >
                                            <div className="relative">
                                                <FiLock
                                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                    size={20}
                                                />
                                                <input
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={password}
                                                    onChange={(e) =>
                                                        setPassword(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="New password"
                                                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                                    required
                                                    minLength="6"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            !showPassword
                                                        )
                                                    }
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    {showPassword ? (
                                                        <FiEyeOff size={20} />
                                                    ) : (
                                                        <FiEye size={20} />
                                                    )}
                                                </button>
                                            </div>

                                            {/* Confirm Password */}
                                            <div className="relative">
                                                <FiLock
                                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                    size={20}
                                                />
                                                <input
                                                    type={
                                                        showConfirmPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    value={confirmPassword}
                                                    onChange={(e) =>
                                                        setConfirmPassword(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Confirm new password"
                                                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                                    required
                                                    minLength="6"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowConfirmPassword(
                                                            !showConfirmPassword
                                                        )
                                                    }
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    {showConfirmPassword ? (
                                                        <FiEyeOff size={20} />
                                                    ) : (
                                                        <FiEye size={20} />
                                                    )}
                                                </button>
                                            </div>

                                            {/* Password Requirements */}
                                            <div className="text-xs text-gray-500 space-y-1">
                                                <div
                                                    className={
                                                        password.length >= 6
                                                            ? "text-green-600"
                                                            : ""
                                                    }
                                                >
                                                    • At least 6 characters long
                                                </div>
                                                <div
                                                    className={
                                                        password ===
                                                            confirmPassword &&
                                                        confirmPassword
                                                            ? "text-green-600"
                                                            : ""
                                                    }
                                                >
                                                    • Passwords must match
                                                </div>
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
                                                    className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                                                >
                                                    Didn't receive the code?{" "}
                                                    <span className="underline">
                                                        Resend OTP
                                                    </span>
                                                </button>
                                            )}
                                        </motion.div>
                                    </>
                                )}

                                {/* Submit Button */}
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.9 }}
                                    type="submit"
                                    disabled={
                                        step === 1
                                            ? !email || isLoading
                                            : !isOtpComplete ||
                                              !isFormValid ||
                                              isLoading
                                    }
                                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                                            {step === 1
                                                ? "Sending OTP..."
                                                : "Resetting Password..."}
                                        </div>
                                    ) : step === 1 ? (
                                        "Send OTP"
                                    ) : (
                                        "Reset Password"
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
                                        Password Reset Successful!
                                    </h3>
                                    <p className="text-gray-600">
                                        Your password has been reset
                                        successfully. Redirecting to login...
                                    </p>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
                                    onClick={() => navigate("/login")}
                                >
                                    Go to Login
                                </motion.button>
                            </motion.div>
                        )}
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
