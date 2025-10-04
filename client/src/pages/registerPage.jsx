import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';

import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiTool,
  FiUsers,
  FiHome,
  FiSettings
} from 'react-icons/fi';

// ✅ Import your Lottie animation
import workerConnectAnim from '../../public/tool.json';

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
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const lottieRef = useRef();

  const roles = [
    { id: 'customer', title: "I'm A Customer", icon: FiHome },
    { id: 'worker', title: "I'm A Worker", icon: FiTool },
    { id: 'service-agent', title: "Service Agent", icon: FiUsers },
    { id: 'admin', title: "Platform Admin", icon: FiSettings },
  ];

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'fullName':
        if (!value.trim()) error = 'Full name is required';
        else if (value.trim().length < 2) error = 'Name must be at least 2 characters';
        break;
      case 'phone':
        if (!value.trim()) error = 'Phone number is required';
        else if (!/^\d{10}$/.test(value.replace(/\D/g, ''))) error = 'Enter a valid 10-digit phone number';
        break;
      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Enter a valid email address';
        break;
      case 'password':
        if (!value) error = 'Password is required';
        else if (value.length < 6) error = 'Password must be at least 6 characters';
        break;
      case 'confirmPassword':
        if (!value) error = 'Please confirm your password';
        else if (value !== formData.password) error = 'Passwords do not match';
        break;
      default:
        break;
    }
    return error;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleRoleSelect = (roleId) => {
    setFormData(prev => ({ ...prev, role: roleId }));
    setCurrentStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'role') {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });
    if (!formData.role) newErrors.role = 'Please select a role';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      console.log('Registration data:', formData);
      setIsLoading(false);
      setCurrentStep(3);
    }, 1500);
  };

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
        {(type.includes('password') && value) && (
          <button
            type="button"
            onClick={() =>
              type === 'password'
                ? setShowPassword(!showPassword)
                : setShowConfirmPassword(!showConfirmPassword)
            }
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            {(type === 'password' ? showPassword : showConfirmPassword)
              ? <FiEyeOff size={16} />
              : <FiEye size={16} />}
          </button>
        )}
      </div>
    </div>
  );

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[1, 2, 3].map(step => (
        <React.Fragment key={step}>
          <div className={`flex flex-col items-center ${step <= currentStep ? 'text-purple-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-semibold ${
              step < currentStep ? 'bg-purple-500 border-purple-500 text-white' :
              step === currentStep ? 'border-purple-500 text-purple-500' : 'border-gray-300 text-gray-400'
            }`}>
              {step < currentStep ? <FiCheck size={16} /> : step}
            </div>
            <span className="text-xs mt-1">
              {step === 1 && 'Role'}
              {step === 2 && 'Details'}
              {step === 3 && 'Complete'}
            </span>
          </div>
          {step < 3 && <div className={`w-10 h-1 mx-2 ${step < currentStep ? 'bg-purple-500' : 'bg-gray-300'}`} />}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-center">Choose Your Role</h2>
          <div className="grid grid-cols-2 gap-4">
            {roles.map(role => (
              <div
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.role === role.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <role.icon className="mb-2 text-purple-600" size={20} />
                <p className="text-sm font-medium">{role.title}</p>
              </div>
            ))}
          </div>
          {errors.role && <p className="text-center text-red-500 text-sm">{errors.role}</p>}
        </div>
      );
    }

    if (currentStep === 2) {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            icon={FiUser}
            label="Full Name"
            type="text"
            value={formData.fullName}
            onChange={(v) => handleInputChange('fullName', v)}
            placeholder="John Doe"
            error={errors.fullName}
          />
          <InputField
            icon={FiPhone}
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(v) => handleInputChange('phone', v)}
            placeholder="9876543210"
            error={errors.phone}
          />
          <InputField
            icon={FiMail}
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(v) => handleInputChange('email', v)}
            placeholder="you@example.com"
            error={errors.email}
          />
          <InputField
            icon={FiLock}
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(v) => handleInputChange('password', v)}
            placeholder="Min. 6 characters"
            error={errors.password}
          />
          <InputField
            icon={FiLock}
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(v) => handleInputChange('confirmPassword', v)}
            placeholder="Re-enter your password"
            error={errors.confirmPassword}
          />

          <button
            type="submit"
            className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all"
          >
            {isLoading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
      );
    }

    if (currentStep === 3) {
      return (
        <div className="text-center space-y-4">
          <FiCheck size={50} className="mx-auto text-green-500" />
          <h2 className="text-xl font-bold">Welcome!</h2>
          <p className="text-gray-600">Your account has been created successfully.</p>
          <button className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            Go to Dashboard
          </button>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50/30 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          // ✅ Lottie first on small screens
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
        >
          {/* 🔹 Lottie Animation - shows FIRST on small screens */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="order-1 lg:order-2 flex justify-center items-center"
          >
            <Lottie
              animationData={workerConnectAnim}
              loop
              autoplay
              className="w-full max-w-sm sm:max-w-md h-auto"
            />
          </motion.div>

          {/* 🔹 Registration Form - shows SECOND on small screens */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="order-2 lg:order-1 bg-white rounded-2xl shadow-xl p-6 lg:p-8 border"
          >
            <StepIndicator />
            {renderStepContent()}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
