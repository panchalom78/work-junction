
import React, { useState, useEffect } from 'react';
import {
  Users, Clock, CheckCircle, IndianRupee, TrendingUp,
  Shield, Calendar, AlertCircle, ChevronRight
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingVerifications: 0,
    activeBookings: 0,
    totalRevenue: 0
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllActivities, setShowAllActivities] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats
      const statsResponse = await axiosInstance.get('/api/admin/dashboard/stats');
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      // Fetch recent activities
      const activitiesResponse = await axiosInstance.get('/api/admin/dashboard/activities');
      if (activitiesResponse.data.success) {
        setActivities(activitiesResponse.data.data);
      }

      toast.success('Dashboard data loaded successfully!');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'verification': return <Shield className="w-3 h-3 xs:w-4 xs:h-4 sm:w-4 sm:h-4" />;
      case 'booking': return <Calendar className="w-3 h-3 xs:w-4 xs:h-4 sm:w-4 sm:h-4" />;
      case 'payment': return <IndianRupee className="w-3 h-3 xs:w-4 xs:h-4 sm:w-4 sm:h-4" />;
      case 'agent': return <Users className="w-3 h-3 xs:w-4 xs:h-4 sm:w-4 sm:h-4" />;
      default: return <AlertCircle className="w-3 h-3 xs:w-4 xs:h-4 sm:w-4 sm:h-4" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'verification': return 'bg-orange-100 text-orange-600';
      case 'booking': return 'bg-blue-100 text-blue-600';
      case 'payment': return 'bg-green-100 text-green-600';
      case 'agent': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8">
      {/* Header Section */}
      <div className="mb-6 sm:mb-7 md:mb-8 lg:mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 leading-tight">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg">
              Welcome back! Here's what's happening today.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button 
              onClick={fetchDashboardData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {[
            {
              label: 'Total Users',
              value: stats.totalUsers,
              change: '+12%',
              icon: Users,
              color: 'from-blue-500 to-blue-600',
              trend: 'up',
              trendValue: '5.2% increase'
            },
            {
              label: 'Pending Verifications',
              value: stats.pendingVerifications,
              change: '+5%',
              icon: Clock,
              color: 'from-orange-500 to-orange-600',
              trend: 'attention',
              trendValue: 'Requires attention'
            },
            {
              label: 'Active Bookings',
              value: stats.activeBookings,
              change: '+18%',
              icon: CheckCircle,
              color: 'from-green-500 to-green-600',
              trend: 'up',
              trendValue: '18.7% increase'
            },
            {
              label: 'Total Revenue',
              value: formatCurrency(stats.totalRevenue),
              change: '+23%',
              icon: IndianRupee,
              color: 'from-purple-500 to-purple-600',
              trend: 'up',
              trendValue: '23.1% increase'
            }
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 lg:p-6 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={`p-2 sm:p-3 rounded-lg bg-gradient-to-r ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.trend === 'up' 
                    ? 'text-green-600 bg-green-50' 
                    : 'text-orange-600 bg-orange-50'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2 leading-tight">
                {stat.value}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base mb-2 sm:mb-3">{stat.label}</p>
              <div className={`flex items-center text-xs sm:text-sm ${
                stat.trend === 'up' ? 'text-green-600' : 'text-orange-600'
              }`}>
                {stat.trend === 'up' ? (
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                ) : (
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                )}
                <span>{stat.trendValue}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities - Full Width */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-5 lg:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1">
                Recent Activities
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Latest activities and events in the system
              </p>
            </div>
            <button
              onClick={() => setShowAllActivities(v => !v)}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <span>{showAllActivities ? 'Show Less' : 'View All'}</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${showAllActivities ? 'rotate-90' : ''}`} />
            </button>
          </div>
        </div>
        
        <div className="p-4 sm:p-5 lg:p-6">
          <div className="space-y-3 sm:space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-8 sm:py-12 lg:py-16">
                <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-base sm:text-lg mb-2">No activities found</p>
                <p className="text-gray-500 text-sm sm:text-base">
                  Activities will appear here as they occur in the system
                </p>
              </div>
            ) : (
              (showAllActivities ? activities : activities.slice(0, 8)).map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100 hover:border-gray-200 group"
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)} group-hover:scale-105 transition-transform`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                        {activity.user}
                      </p>
                      <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap flex-shrink-0">
                        {formatTimeAgo(activity.time)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-2">
                      {activity.action}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Show More/Less indicator */}
          {activities.length > 8 && (
            <div className="mt-4 sm:mt-6 text-center">
              <button
                onClick={() => setShowAllActivities(v => !v)}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base"
              >
                {showAllActivities 
                  ? `Show Less (${activities.length} activities)` 
                  : `Show More (${activities.length - 8} more activities)`
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add missing RefreshCw icon component
const RefreshCw = ({ className = "w-4 h-4" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);

export default AdminOverview;