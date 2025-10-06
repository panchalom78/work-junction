import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import lottie from 'lottie-web';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiCheck, FiTool, FiUsers, FiHome, FiSettings, FiArrowLeft } from 'react-icons/fi';

import workerAnim from '../public/register.json';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    role: '',
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const lottieRef = useRef(null);
  const loadingRef = useRef(null);

  const roles = [
    { id: 'customer', title: "I'm A Customer", icon: FiHome, description: "Book services for your home or business" },
    { id: 'worker', title: "I'm A Worker", icon: FiTool, description: "Offer your professional services" },
    { id: 'service-agent', title: "Service Agent", icon: FiUsers, description: "Manage worker verifications" },
    { id: 'admin', title: "Platform Admin", icon: FiSettings, description: "Platform administration" }
  ];

  const validateField = (name, value) => {
    let error = '';
    if (name === 'fullName') {
      if (!value.trim()) error = 'Full name is required';
      else if (value.trim().length < 2) error = 'Name must be at least 2 characters';
    }
    if (name === 'phone') {
      if (!value.trim()) error = 'Phone number is required';
      else if (!/^\d{10}$/.test(value.replace(/\D/g, ''))) error = 'Enter a valid 10-digit phone number';
    }
    if (name === 'email') {
      if (!value.trim()) error = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Enter a valid email address';
    }
    if (name === 'password') {
      if (!value) error = 'Password is required';
      else if (value.length < 6) error = 'Password must be at least 6 characters';
    }
    if (name === 'confirmPassword') {
      if (!value) error = 'Please confirm your password';
      else if (value !== formData.password) error = 'Passwords do not match';
    }
    return error;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRoleSelect = (roleId) => {
    setFormData(prev => ({ ...prev, role: roleId }));
    setCurrentStep(2);
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
      console.log('Registration Data:', formData);
      setIsLoading(false);
      setCurrentStep(3);
    }, 2000);
  };

  // Lottie Animation for worker
  useEffect(() => {
    if (lottieRef.current) {
      const animation = lottie.loadAnimation({
        container: lottieRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: workerAnim
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
    togglePassword, 
    show 
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
        {togglePassword && value && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
      </div>
    </div>
  );

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Role</h2>
            <p className="text-gray-600 text-sm">Select how you want to use WorkJunction</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {roles.map((role) => (
              <motion.div
                key={role.id}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRoleSelect(role.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group
                  ${formData.role === role.id 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    formData.role === role.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                  } transition-colors`}>
                    <role.icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm mb-1">{role.title}</p>
                    <p className="text-gray-500 text-xs">{role.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {errors.role && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm text-center"
            >
              {errors.role}
            </motion.p>
          )}
        </motion.div>
      );
    }

    if (currentStep === 2) {
      return (
        <motion.form
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Your Account</h2>
            <p className="text-gray-600 text-sm">Fill in your details to get started</p>
          </div>

          <InputField
            icon={FiUser}
            label="Full Name"
            type="text"
            value={formData.fullName}
            onChange={(v) => handleInputChange('fullName', v)}
            placeholder="Enter your full name"
            error={errors.fullName}
          />

          <InputField
            icon={FiPhone}
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(v) => handleInputChange('phone', v)}
            placeholder="10-digit mobile number"
            error={errors.phone}
          />

          <InputField
            icon={FiMail}
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(v) => handleInputChange('email', v)}
            placeholder="your@email.com"
            error={errors.email}
          />

          <InputField
            icon={FiLock}
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(v) => handleInputChange('password', v)}
            placeholder="Minimum 6 characters"
            error={errors.password}
            togglePassword={() => setShowPassword(!showPassword)}
            show={showPassword}
          />

          <InputField
            icon={FiLock}
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(v) => handleInputChange('confirmPassword', v)}
            placeholder="Re-enter your password"
            error={errors.confirmPassword}
            togglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            show={showConfirmPassword}
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
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </motion.button>
        </motion.form>
      );
    }

    if (currentStep === 3) {
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
            <h2 className="text-2xl font-bold text-gray-800">Welcome to WorkJunction!</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Your account has been created successfully. You're now ready to explore all the features and services.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
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
                Join WorkJunction Today
              </h3>
              <p className="text-gray-600 text-sm lg:text-base max-w-md mx-auto">
                Connect with trusted professionals or offer your services to millions of customers across India.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Registration Card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="order-1 lg:order-2 flex justify-center"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md lg:max-w-lg p-6 sm:p-8 lg:p-10">
            {/* Step Indicator */}
            {currentStep !== 3 && (
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                  {currentStep === 2 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentStep(1)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                    >
                      <FiArrowLeft size={20} />
                    </motion.button>
                  )}
                  <span className="text-sm font-medium text-gray-500">
                    Step {currentStep} of 2
                  </span>
                </div>
                <div className="flex space-x-1">
                  {[1, 2].map((step) => (
                    <div
                      key={step}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        step === currentStep ? 'bg-blue-600 w-6' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Form Content */}
            {renderStepContent()}

            {/* Back to Login */}
            {currentStep !== 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-6 pt-6 border-t border-gray-200"
              >
                <p className="text-gray-600 text-sm">
                  Already have an account?{' '}
                  <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                  onClick={() => (window.location.href = '/login')}>
                    Sign In
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

export default RegisterPage;