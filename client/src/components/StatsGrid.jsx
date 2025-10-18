import React from 'react';
import { Users, Clock, CheckCircle, TrendingUp } from 'lucide-react';

const StatsGrid = ({ stats }) => {
  const getIcon = (iconName) => {
    const icons = {
      Users: Users,
      Clock: Clock,
      CheckCircle: CheckCircle,
      TrendingUp: TrendingUp
    };
    return icons[iconName] || Users;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, index) => {
        const IconComponent = getIcon(stat.icon);
        return (
          <div key={index} className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} group-hover:scale-110 transition-transform`}>
                <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className={`text-xs sm:text-sm font-medium px-2 py-1 rounded-full ${
                stat.change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-600 text-xs sm:text-sm">{stat.title}</p>
          </div>
        );
      })}
    </div>
  );
};

export default StatsGrid;