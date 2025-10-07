import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import lottie from "lottie-web";
import {
    FiMail,
    FiLock,
    FiEye,
    FiEyeOff,
    FiArrowLeft,
    FiCheck,
} from "react-icons/fi";
import { useAuthStore } from "../store/auth.store";
import InputField from "../components/InputField";
import workManagementAnim from "../assets/workmanagemnt.json";
const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [currentStep, setCurrentStep] = useState(1);

    const lottieRef = useRef(null);
    const loadingRef = useRef(null);

    const { login, error, message } = useAuthStore();

    // Lottie for hero animation
    useEffect(() => {
        if (lottieRef.current) {
            const animation = lottie.loadAnimation({
                container: lottieRef.current,
                renderer: "svg",
                loop: true,
                autoplay: true,
                animationData: workManagementAnim,
            });
            return () => animation.destroy();
        }
    }, []);

    // Lottie for loading spinner
    useEffect(() => {
        if (isLoading && loadingRef.current) {
            const animation = lottie.loadAnimation({
                container: loadingRef.current,
                renderer: "svg",
                loop: true,
                autoplay: true,
                path: "https://lottie.host/5f7b0c2e-ffd9-4a29-b9b1-0c262e875f8b/5kI5pE1c5p.json",
            });
            return () => animation.destroy();
        }
    }, [isLoading]);

    const validateField = (name, value) => {
        let error = "";
        if (name === "email") {
            if (!value.trim()) error = "Email is required";
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                error = "Enter a valid email";
        }
        if (name === "password") {
            if (!value) error = "Password is required";
            else if (value.length < 6)
                error = "Password must be at least 6 characters";
        }
        return error;
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        const res = await login(formData);
        setIsLoading(false);

        if (res.success) {
            setCurrentStep(2);
        } else {
            setErrors({ submit: res.message || "Invalid credentials" });
        }
    };

    const renderStepContent = () => {
        if (currentStep === 1) {
            return (
                <motion.form
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Welcome Back 👋
                        </h2>
                        <p className="text-gray-600 text-sm">
                            Login to continue using WorkJunction
                        </p>
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm text-center">
                            {error}
                        </p>
                    )}
                    {message && (
                        <p className="text-green-600 text-sm text-center">
                            {message}
                        </p>
                    )}
                    {errors.submit && (
                        <p className="text-red-500 text-sm text-center">
                            {errors.submit}
                        </p>
                    )}

                    <InputField
                        icon={FiMail}
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={(v) => handleInputChange("email", v)}
                        placeholder="your@email.com"
                        error={errors.email}
                    />

                    <InputField
                        icon={FiLock}
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(v) => handleInputChange("password", v)}
                        placeholder="Enter your password"
                        error={errors.password}
                        togglePassword={() => setShowPassword(!showPassword)}
                        show={showPassword}
                    />

                    <motion.button
                        type="submit"
                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <div ref={loadingRef} className="w-5 h-5" />
                                <span>Signing In...</span>
                            </>
                        ) : (
                            <span>Sign In</span>
                        )}
                    </motion.button>
                </motion.form>
            );
        }

        if (currentStep === 2) {
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6 py-4"
                >
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <FiCheck size={40} className="text-green-600" />
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Login Successful 🎉
                        </h2>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            You’re now signed in. Redirecting to dashboard...
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => (window.location.href = "/dashboard")}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        Go to Dashboard
                    </motion.button>
                </motion.div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-12 items-center">
                {/* Animation Section */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex justify-center items-center order-2 lg:order-1"
                >
                    <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
                        <div
                            ref={lottieRef}
                            className="w-full h-64 sm:h-80 lg:h-96 xl:h-[500px]"
                        />
                        <div className="text-center mt-6 space-y-3">
                            <h3 className="text-2xl lg:text-3xl font-bold text-gray-800">
                                Welcome Back to WorkJunction
                            </h3>
                            <p className="text-gray-600 text-sm lg:text-base max-w-md mx-auto">
                                Connect, collaborate, and manage your services
                                seamlessly.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Login Card */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="order-1 lg:order-2 flex justify-center"
                >
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md lg:max-w-lg p-6 sm:p-8 lg:p-10">
                        {renderStepContent()}

                        {currentStep === 1 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-center mt-6 pt-6 border-t border-gray-200"
                            >
                                <p className="text-gray-600 text-sm">
                                    Don’t have an account?{" "}
                                    <button
                                        className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                                        onClick={() =>
                                            (window.location.href = "/register")
                                        }
                                    >
                                        Register Now
                                    </button>
                                </p>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
