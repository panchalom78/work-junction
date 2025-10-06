// InputField.jsx
import React from 'react';
import { motion } from 'framer-motion';

const InputField = ({
  icon: Icon,
  label,
  type,
  value,
  onChange,
  placeholder,
  error,
  showPasswordToggle,
  onTogglePassword
}) => {
  return (
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
            ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 bg-white'
            }`}
        />
        {showPasswordToggle && value && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            {type === 'password' ? '👁️' : '🙈'}
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(InputField);
