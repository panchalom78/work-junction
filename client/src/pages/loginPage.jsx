import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import lottie from 'lottie-web';
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiUser,
  FiArrowLeft,
} from 'react-icons/fi';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const lottieRef = useRef();

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Enter a valid email address';
        break;
      case 'password':
        if (!value) error = 'Password is required';
        else if (value.length < 6) error = 'Password must be at least 6 characters';
        break;
      default:
        break;
    }
    return error;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = (e) => {
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
    setTimeout(() => {
      console.log('Login data:', formData);
      setIsLoading(false);
    }, 1500);
  };

  // Lottie animation for branding section
  useEffect(() => {
    if (lottieRef.current) {
      const animation = lottie.loadAnimation({
        container: lottieRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: './Plumbers.json', // Assumes painter.json is in public/painter.json
      });
      return () => animation.destroy();
    }
  }, []);

  // Lottie animation for loading state
  useEffect(() => {
    if (isLoading && document.getElementById('lottie-loading')) {
      const animation = lottie.loadAnimation({
        container: document.getElementById('lottie-loading'),
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'https://lottie.host/5f7b0c2e-ffd9-4a29-b9b1-0c262e875f8b/5kI5pE1c5p.json',
      });
      return () => animation.destroy();
    }
  }, [isLoading]);

  const InputField = ({ icon: Icon, label, type, value, onChange, placeholder, error }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 flex justify-between">
        {label}
        {error && <span className="text-red-500 text-xs">{error}</span>}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className={`${error ? 'text-red-400' : 'text-gray-400'}`} size={18} />
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-3 border-2 rounded-lg focus:outline-none text-sm ${
            error ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-purple-500'
          }`}
        />
        {type === 'password' && value && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        )}
      </div>
    </div>
  );

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
            className="order-1 lg:order-2 flex justify-center items-center"
          >
            <div
              ref={lottieRef}
              className="w-full max-w-sm sm:max-w-md lg:max-w-lg h-auto"
            />
          </motion.div>

          {/* 🔹 Login Form - Right side on desktop, second on mobile */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="order-2 lg:order-2 bg-white rounded-2xl shadow-xl p-6 lg:p-8 border"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2"
              >
                Welcome Back to WorkJunction
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 text-sm lg:text-base"
              >
                Sign in to your account to continue connecting with trusted professionals.
              </motion.p>
            </div>

            {/* Login Form Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-6"
            >
              <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Login</h2>
              <p className="text-sm text-gray-500 text-center mb-6">Sign in to your account</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <InputField
                icon={FiMail}
                label="Email"
                type="email"
                value={formData.email}
                onChange={(v) => handleInputChange('email', v)}
                placeholder="Enter your email"
                error={errors.email}
              />

              <InputField
                icon={FiLock}
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(v) => handleInputChange('password', v)}
                placeholder="Enter your password"
                error={errors.password}
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Remember me</span>
                </label>

                <button
                  type="button"
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Forgot Password?
                </button>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div id="lottie-loading" className="w-5 h-5 mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Login'
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Don't have an account?
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-3 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-purple-300 hover:bg-purple-50 transition-all"
                onClick={() => window.location.href = '/register'}
              >
                Create New Account
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;