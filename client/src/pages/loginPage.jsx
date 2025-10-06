import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import lottie from 'lottie-web';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import workManagementAnim from '../assets/workmanagemnt.json';
import InputField from '../components/InputField'; // <-- new component

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const lottieRef = useRef(null);
  const loadingRef = useRef(null);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'email') {
      if (!value.trim()) error = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        error = 'Enter a valid email address';
    }
    if (name === 'password') {
      if (!value) error = 'Password is required';
      else if (value.length < 6)
        error = 'Password must be at least 6 characters';
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
    if (Object.keys(newErrors).length) return setErrors(newErrors);

    setIsLoading(true);
    setTimeout(() => {
      console.log('Login Data:', formData);
      setIsLoading(false);
    }, 2000);
  };

  useEffect(() => {
    if (lottieRef.current) {
      const animation = lottie.loadAnimation({
        container: lottieRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: workManagementAnim
      });
      return () => animation.destroy();
    }
  }, []);

  useEffect(() => {
    if (isLoading && loadingRef.current) {
      const animation = lottie.loadAnimation({
        container: loadingRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'https://lottie.host/5f7b0c2e-ffd9-4a29-b9b1-0c262e875f8b/5kI5pE1c5p.json'
      });
      return () => animation.destroy();
    }
  }, [isLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        
        {/* Left Lottie */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center items-center order-2 lg:order-1"
        >
          <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
            <div ref={lottieRef} className="w-full h-64 sm:h-80 lg:h-96" />
            <div className="text-center mt-6 space-y-3">
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-800">
                Welcome to WorkJunction
              </h3>
              <p className="text-gray-600 text-sm lg:text-base max-w-md mx-auto">
                Sign in to access your dashboard.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="order-1 lg:order-2 flex justify-center"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h1>
              <p className="text-gray-600 text-sm">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <InputField
                icon={FiMail}
                label="Email Address"
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
                showPasswordToggle
                onTogglePassword={() => setShowPassword((prev) => !prev)}
              />

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
