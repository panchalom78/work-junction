import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import lottie from 'lottie-web';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import workManagementAnim from '../../public/workmanagemnt.json';
const LoginPage = () => {
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '' 
  });
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
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Enter a valid email address';
    }
    if (name === 'password') {
      if (!value) error = 'Password is required';
      else if (value.length < 6) error = 'Password must be at least 6 characters';
    }
    return error;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    // Validate all fields
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log('Login Data:', formData);
      setIsLoading(false);
      // Handle successful login here
    }, 2000);
  };

  // Lottie Animation for work management
  useEffect(() => {
    if (lottieRef.current) {
      const animation = lottie.loadAnimation({
        container: lottieRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: workManagementAnim
      });

      return () => {
        animation.destroy();
      };
    }
  }, []);

  // Loading animation
  useEffect(() => {
    if (isLoading && loadingRef.current) {
      const animation = lottie.loadAnimation({
        container: loadingRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'https://lottie.host/5f7b0c2e-ffd9-4a29-b9b1-0c262e875f8b/5kI5pE1c5p.json',
      });

      return () => {
        animation.destroy();
      };
    }
  }, [isLoading]);

  const InputField = ({ 
    icon: Icon, 
    label, 
    type, 
    value, 
    onChange, 
    placeholder, 
    error,
    showPasswordToggle = false
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 flex justify-between items-center">
        {label}
        {error && (
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-red-500 text-xs font-normal"
          >
            {error}
          </motion.span>
        )}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className={`${error ? 'text-red-500' : 'text-gray-400'}`} size={18} />
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 bg-white'
            }`}
        />
        {showPasswordToggle && value && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        
        {/* Lottie Animation Section */}
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
                Welcome to WorkJunction
              </h3>
              <p className="text-gray-600 text-sm lg:text-base max-w-md mx-auto">
                Sign in to access your dashboard and manage your services efficiently.
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
            
            {/* Header */}
            <div className="text-center mb-8">
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2"
              >
                Welcome Back
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-gray-600 text-sm"
              >
                Sign in to your WorkJunction account
              </motion.p>
            </div>

            {/* Login Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <InputField
                icon={FiMail}
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(v) => handleInputChange('email', v)}
                placeholder="Enter your email address"
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
                showPasswordToggle={true}
              />

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                    Remember me
                  </span>
                </label>

                <button 
                  type="button" 
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
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
                  <>
                    <span>Sign In</span>
                    <FiArrowRight size={16} />
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm">or</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              {/* Sign Up Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <p className="text-gray-600 text-sm">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => window.location.href = '/signup'}
                    className="text-blue-600 font-semibold hover:text-blue-700 transition-colors underline"
                  >
                    Create New Account
                  </button>
                </p>
              </motion.div>
            </motion.form>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200"
            >
              <p className="text-blue-700 text-xs text-center">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;