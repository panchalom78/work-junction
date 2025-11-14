import React, { useState, useEffect } from 'react';
import {
  FileText, TrendingUp, BarChart3, Download,
  Calendar, Filter, RefreshCw, Eye
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

const AdminReports = () => {
  const [analytics, setAnalytics] = useState({
    userRegistrations: [],
    bookingStats: [],
    revenueStats: { totalRevenue: 0, averageOrderValue: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [reportType, setReportType] = useState('overview');

  const periods = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const reportTypes = [
    { value: 'overview', label: 'Overview' },
    { value: 'users', label: 'User Analytics' },
    { value: 'bookings', label: 'Booking Analytics' },
    { value: 'revenue', label: 'Revenue Analytics' }
  ];

  // Generate dummy analytics data
  const generateAnalytics = (period) => {
    const baseMultiplier = period === 'weekly' ? 1 : period === 'monthly' ? 4 : 52;

    return {
      userRegistrations: [
        { _id: 'CUSTOMER', count: 850 * baseMultiplier },
        { _id: 'WORKER', count: 320 * baseMultiplier },
        { _id: 'SERVICE_AGENT', count: 45 * baseMultiplier },
        { _id: 'ADMIN', count: 5 }
      ],
      bookingStats: [
        { _id: 'COMPLETED', count: 450 * baseMultiplier },
        { _id: 'PENDING', count: 35 * baseMultiplier },
        { _id: 'ACCEPTED', count: 120 * baseMultiplier },
        { _id: 'CANCELLED', count: 25 * baseMultiplier },
        { _id: 'DECLINED', count: 15 * baseMultiplier }
      ],
      revenueStats: {
        totalRevenue: 284500 * baseMultiplier,
        averageOrderValue: 1250
      }
    };
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch analytics from API
      const response = await axiosInstance.get(`/api/admin/dashboard/analytics?period=${period}`);

      if (response.data.success) {
        setAnalytics(response.data.data);
      } else {
        // Fallback to dummy data
        setAnalytics(generateAnalytics(period));
      }

    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Fallback to dummy data on error
      setAnalytics(generateAnalytics(period));
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

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'SERVICE_AGENT': return 'bg-blue-100 text-blue-800';
      case 'WORKER': return 'bg-green-100 text-green-800';
      case 'CUSTOMER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-orange-100 text-orange-800';
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800';
      case 'DECLINED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendPercentage = (role) => {
    const trends = {
      'CUSTOMER': 12,
      'WORKER': 8,
      'SERVICE_AGENT': 15,
      'ADMIN': 0,
      'COMPLETED': 18,
      'PENDING': -5,
      'ACCEPTED': 10,
      'CANCELLED': -2,
      'DECLINED': -8
    };
    return trends[role] || 0;
  };

  const OverviewReport = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-green-600">+12%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {analytics.userRegistrations.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
          </h3>
          <p className="text-gray-600 text-sm">Total Users</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-green-600">+18%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {analytics.bookingStats.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
          </h3>
          <p className="text-gray-600 text-sm">Total Bookings</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-green-600">+23%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(analytics.revenueStats.totalRevenue)}
          </h3>
          <p className="text-gray-600 text-sm">Total Revenue</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-green-600">+8%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(analytics.revenueStats.averageOrderValue)}
          </h3>
          <p className="text-gray-600 text-sm">Avg Order Value</p>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Registrations</h3>
          <div className="space-y-3">
            {analytics.userRegistrations.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(item._id)}`}>
                    {item._id.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-semibold text-gray-900">{item.count.toLocaleString()}</span>
                  <span className={`text-xs font-medium ${getTrendPercentage(item._id) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {getTrendPercentage(item._id) >= 0 ? '+' : ''}{getTrendPercentage(item._id)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h3>
          <div className="space-y-3">
            {analytics.bookingStats.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item._id)}`}>
                    {item._id}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-semibold text-gray-900">{item.count.toLocaleString()}</span>
                  <span className={`text-xs font-medium ${getTrendPercentage(item._id) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {getTrendPercentage(item._id) >= 0 ? '+' : ''}{getTrendPercentage(item._id)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">94%</div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">4.7/5</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">12min</div>
            <div className="text-sm text-gray-600">Avg Response Time</div>
          </div>
        </div>
      </div>
    </div>
  );

  const UserAnalyticsReport = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">User Registration Analytics</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User Role</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Count</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Percentage</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analytics.userRegistrations.map((item, index) => {
                const total = analytics.userRegistrations.reduce((sum, i) => sum + i.count, 0);
                const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
                const trend = getTrendPercentage(item._id);

                return (
                  <tr key={index}>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(item._id)}`}>
                        {item._id.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{item.count.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-600">{percentage}%</td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center space-x-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                        <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
                        <span className="text-sm">{trend >= 0 ? '+' : ''}{trend}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const BookingAnalyticsReport = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Booking Analytics</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Count</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Percentage</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analytics.bookingStats.map((item, index) => {
                const total = analytics.bookingStats.reduce((sum, i) => sum + i.count, 0);
                const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
                const trend = getTrendPercentage(item._id);

                return (
                  <tr key={index}>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item._id)}`}>
                        {item._id}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{item.count.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-600">{percentage}%</td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center space-x-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                        <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
                        <span className="text-sm">{trend >= 0 ? '+' : ''}{trend}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const RevenueAnalyticsReport = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Total Revenue</h4>
            <p className="text-3xl font-bold text-green-600 mb-2">
              {formatCurrency(analytics.revenueStats.totalRevenue)}
            </p>
            <p className="text-sm text-gray-600">All time revenue</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Average Order Value</h4>
            <p className="text-3xl font-bold text-purple-600 mb-2">
              {formatCurrency(analytics.revenueStats.averageOrderValue)}
            </p>
            <p className="text-sm text-gray-600">Per completed booking</p>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Service Bookings</span>
              <span className="font-semibold text-gray-900">{formatCurrency(analytics.revenueStats.totalRevenue * 0.85)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subscription Fees</span>
              <span className="font-semibold text-gray-900">{formatCurrency(analytics.revenueStats.totalRevenue * 0.12)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Other Revenue</span>
              <span className="font-semibold text-gray-900">{formatCurrency(analytics.revenueStats.totalRevenue * 0.03)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReport = () => {
    switch (reportType) {
      case 'overview': return <OverviewReport />;
      case 'users': return <UserAnalyticsReport />;
      case 'bookings': return <BookingAnalyticsReport />;
      case 'revenue': return <RevenueAnalyticsReport />;
      default: return <OverviewReport />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive platform analytics and reports</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Period Filter */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {periods.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Report Type Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        renderReport()
      )}
    </div>
  );
};

export default AdminReports;