import React, { useState, useEffect } from 'react';
import {
  Users, Clock, CheckCircle, IndianRupee , TrendingUp,
  Shield, Calendar, MapPin, FileText, AlertCircle, Search,
  ChevronRight, MoreVertical
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
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [loading, setLoading] = useState(true);

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
        toast.success('Dashboard data loaded successfully!');
      }

      // Fetch recent activities
      const activitiesResponse = await axiosInstance.get('/api/admin/dashboard/activities');
      if (activitiesResponse.data.success) {
        setActivities(activitiesResponse.data.data);
      }

      // Fetch verification queue
      const verificationResponse = await axiosInstance.get('/api/admin/verification/queue');
      if (verificationResponse.data.success) {
        setVerificationQueue(verificationResponse.data.data.workers);
      }

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
      case 'verification': return <Shield className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'booking': return <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'payment': return <IndianRupee  className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'agent': return <Users className="w-3 h-3 sm:w-4 sm:h-4" />;
      default: return <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
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
      <div className="flex items-center justify-center h-32 sm:h-64">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-6 p-2 sm:p-4 md:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">Welcome back! Here's what's happening today.</p>
        </div>

      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 md:p-6 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="p-1 sm:p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-green-600 bg-green-50 px-1 sm:px-2 py-0.5 rounded-full">+12%</span>
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1">{stats.totalUsers.toLocaleString()}</h3>
          <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm">Total Users</p>
          <div className="mt-2 flex items-center text-[10px] sm:text-xs text-green-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>5.2% increase</span>
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 md:p-6 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="p-1 sm:p-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 group-hover:scale-110 transition-transform duration-300">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-orange-600 bg-orange-50 px-1 sm:px-2 py-0.5 rounded-full">+5%</span>
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1">{stats.pendingVerifications}</h3>
          <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm">Pending Verifications</p>
          <div className="mt-2 flex items-center text-[10px] sm:text-xs text-orange-600">
            <AlertCircle className="w-3 h-3 mr-1" />
            <span>Requires attention</span>
          </div>
        </div>

        {/* Active Bookings */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 md:p-6 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="p-1 sm:p-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-green-600 bg-green-50 px-1 sm:px-2 py-0.5 rounded-full">+18%</span>
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1">{stats.activeBookings}</h3>
          <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm">Active Bookings</p>
          <div className="mt-2 flex items-center text-[10px] sm:text-xs text-green-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>18.7% increase</span>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 md:p-6 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="p-1 sm:p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 group-hover:scale-110 transition-transform duration-300">
              <IndianRupee  className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-green-600 bg-green-50 px-1 sm:px-2 py-0.5 rounded-full">+23%</span>
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1">{formatCurrency(stats.totalRevenue)}</h3>
          <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm">Total Revenue</p>
          <div className="mt-2 flex items-center text-[10px] sm:text-xs text-green-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>23.1% increase</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Recent Activities</h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm flex items-center gap-1">
              View All
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
          <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
            {activities.length === 0 ? (
              <div className="text-center py-4 sm:py-8">
                <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                <p className="text-sm sm:text-base text-gray-600">No activities found</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Activities will appear here as they occur</p>
              </div>
            ) : (
              activities.slice(0, 6).map((activity, index) => (
                <div key={index} className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-xs sm:text-sm md:text-base truncate">{activity.user}</p>
                    <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm truncate">{activity.action}</p>
                  </div>
                  <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                    {formatTimeAgo(activity.time)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Verification Queue */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-4">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Verification Queue</h2>
              <div className="sm:hidden">
                <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center">
                  View All
                  <ChevronRight className="w-3 h-3 ml-1" />
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none min-w-0">
                <input
                  type="text"
                  placeholder="Search workers..."
                  className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-48 md:w-56"
                />
                <Search className="w-3 h-3 sm:w-4 sm:h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <button className="hidden sm:flex px-3 py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap items-center gap-2">
                <span>View All</span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
            {verificationQueue.length === 0 ? (
              <div className="text-center py-4 sm:py-8">
                <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-green-400 mx-auto mb-2 sm:mb-3" />
                <p className="text-sm sm:text-base text-gray-600">All verifications processed</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">No pending verifications in queue</p>
              </div>
            ) : (
              verificationQueue.slice(0, 6).map((worker, index) => (
                <div key={index} className="flex items-center justify-between p-2 sm:p-3 md:p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 bg-white">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${worker.priority === 'HIGH' ? 'bg-red-500' :
                      worker.priority === 'MEDIUM' ? 'bg-orange-500' : 'bg-green-500'
                      }`}></div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-xs sm:text-sm md:text-base truncate">{worker.name}</p>
                      <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm truncate">{worker.service}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-[10px] sm:text-xs text-gray-500">{worker.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 ml-2">
                    <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap hidden xs:inline">
                      {formatTimeAgo(worker.submitted)}
                    </span>
                    <button className="px-2 sm:px-3 py-1 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      <span className="hidden xs:inline">Review</span>
                    </button>
                    <button className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                      <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions - Mobile Only */}
      <div className="lg:hidden bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <button className="p-3 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" />
            View Reports
          </button>
          <button className="p-3 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <Users className="w-4 h-4" />
            Manage Users
          </button>
          <button className="p-3 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </button>
          <button className="p-3 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>        
      </div>
  );
};

export default AdminOverview;