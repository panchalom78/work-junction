import React from 'react';

const QuickAction = ({ icon: Icon, label, onClick, color = "blue" }) => {
  const colorClasses = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', hover: 'hover:bg-blue-100' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', hover: 'hover:bg-green-100' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', hover: 'hover:bg-orange-100' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', hover: 'hover:bg-purple-100' }
  };

  const { bg, border, text, hover } = colorClasses[color] || colorClasses.blue;

  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-3 p-4 ${bg} ${border} ${hover} rounded-xl transition-colors border w-full text-left`}
    >
      <Icon className={`w-5 h-5 ${text}`} />
      <span className="font-medium text-gray-700">{label}</span>
    </button>
  );
};

export default QuickAction;