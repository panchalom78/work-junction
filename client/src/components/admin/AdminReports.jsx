import React, { useState, useEffect } from 'react';
import {
  FileText, TrendingUp, BarChart3, Download,
  Calendar, Filter, RefreshCw, Eye,
  Smartphone, Monitor, PieChart
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
  const [exportLoading, setExportLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/admin/dashboard/analytics?period=${period}`);

      if (response.data.success) {
        setAnalytics(response.data.data);
      }

    } catch (error) {
      console.error('Error fetching analytics:', error);
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

  const exportCurrentPageToCSV = () => {
    try {
      setExportLoading(true);

      let csvContent = '';
      let filename = '';
      const today = new Date().toISOString().split('T')[0];

      switch (reportType) {
        case 'overview':
          filename = `overview_report_${period}_${today}.csv`;
          csvContent = generateOverviewCSV();
          break;
        case 'users':
          filename = `user_analytics_${period}_${today}.csv`;
          csvContent = generateUserAnalyticsCSV();
          break;
        case 'bookings':
          filename = `booking_analytics_${period}_${today}.csv`;
          csvContent = generateBookingAnalyticsCSV();
          break;
        case 'revenue':
          filename = `revenue_analytics_${period}_${today}.csv`;
          csvContent = generateRevenueAnalyticsCSV();
          break;
        default:
          filename = `report_${period}_${today}.csv`;
          csvContent = generateOverviewCSV();
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error exporting report. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const wrapCSV = (rows) => rows.map(row =>
    row.map(field => `"${String(field ?? '').replace(/"/g, '""')}"`).join(',')
  ).join('\n');

  const generateOverviewCSV = () => {
    const headers = [
      'Metric Type',
      'Category',
      'Count',
      'Percentage',
      'Trend',
      'Period'
    ];

    const totalUsers = analytics.userRegistrations.reduce((sum, item) => sum + item.count, 0);
    const totalBookings = analytics.bookingStats.reduce((sum, item) => sum + item.count, 0);

    const rows = [
      ...analytics.userRegistrations.map(item => {
        const percentage = totalUsers > 0 ? ((item.count / totalUsers) * 100).toFixed(1) : 0;
        const trend = getTrendPercentage(item._id);
        return [
          'User Registrations',
          item._id.replace('_', ' '),
          item.count,
          `${percentage}%`,
          `${trend >= 0 ? '+' : ''}${trend}%`,
          period.toUpperCase()
        ];
      }),
      ...analytics.bookingStats.map(item => {
        const percentage = totalBookings > 0 ? ((item.count / totalBookings) * 100).toFixed(1) : 0;
        const trend = getTrendPercentage(item._id);
        return [
          'Booking Status',
          item._id,
          item.count,
          `${percentage}%`,
          `${trend >= 0 ? '+' : ''}${trend}%`,
          period.toUpperCase()
        ];
      }),
      [
        'Revenue',
        'Total Revenue',
        analytics.revenueStats.totalRevenue,
        '100%',
        '+23%',
        period.toUpperCase()
      ],
      [
        'Revenue',
        'Average Order Value',
        analytics.revenueStats.averageOrderValue,
        'N/A',
        '+8%',
        period.toUpperCase()
      ]
    ];

    return wrapCSV([headers, ...rows]);
  };

  const generateUserAnalyticsCSV = () => {
    const headers = [
      'User Role',
      'Count',
      'Percentage',
      'Trend',
      'Period'
    ];

    const total = analytics.userRegistrations.reduce((sum, item) => sum + item.count, 0);

    const rows = analytics.userRegistrations.map(item => {
      const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
      const trend = getTrendPercentage(item._id);
      return [
        item._id.replace('_', ' '),
        item.count,
        `${percentage}%`,
        `${trend >= 0 ? '+' : ''}${trend}%`,
        period.toUpperCase()
      ];
    });

    return wrapCSV([headers, ...rows]);
  };

  const generateBookingAnalyticsCSV = () => {
    const headers = [
      'Booking Status',
      'Count',
      'Percentage',
      'Trend',
      'Period'
    ];

    const total = analytics.bookingStats.reduce((sum, item) => sum + item.count, 0);

    const rows = analytics.bookingStats.map(item => {
      const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
      const trend = getTrendPercentage(item._id);
      return [
        item._id,
        item.count,
        `${percentage}%`,
        `${trend >= 0 ? '+' : ''}${trend}%`,
        period.toUpperCase()
      ];
    });

    return wrapCSV([headers, ...rows]);
  };

  const generateRevenueAnalyticsCSV = () => {
    const headers = [
      'Revenue Metric',
      'Amount',
      'Percentage',
      'Description',
      'Period'
    ];

    const rows = [
      [
        'Total Revenue',
        analytics.revenueStats.totalRevenue,
        '100%',
        'All time revenue',
        period.toUpperCase()
      ],
      [
        'Average Order Value',
        analytics.revenueStats.averageOrderValue,
        'N/A',
        'Per completed booking',
        period.toUpperCase()
      ],
      [
        'Service Bookings Revenue',
        analytics.revenueStats.totalRevenue * 0.85,
        '85%',
        'Revenue from service bookings',
        period.toUpperCase()
      ],
      [
        'Subscription Fees',
        analytics.revenueStats.totalRevenue * 0.12,
        '12%',
        'Revenue from subscription fees',
        period.toUpperCase()
      ],
      [
        'Other Revenue',
        analytics.revenueStats.totalRevenue * 0.03,
        '3%',
        'Other revenue sources',
        period.toUpperCase()
      ]
    ];

    return wrapCSV([headers, ...rows]);
  };

  // Mobile Card Components
  const MobileUserCard = ({ item }) => {
    const total = analytics.userRegistrations.reduce((sum, i) => sum + i.count, 0);
    const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
    const trend = getTrendPercentage(item._id);

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-2">
        <div className="flex justify-between items-start mb-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(item._id)}`}>
            {item._id.replace('_', ' ')}
          </span>
          <div className={`flex items-center space-x-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
            <span className="text-xs">{trend >= 0 ? '+' : ''}{trend}%</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold text-gray-900 text-sm">{item.count.toLocaleString()}</p>
            <p className="text-xs text-gray-600">{percentage}% of total</p>
          </div>
        </div>
      </div>
    );
  };

  const MobileBookingCard = ({ item }) => {
    const total = analytics.bookingStats.reduce((sum, i) => sum + i.count, 0);
    const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
    const trend = getTrendPercentage(item._id);

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-2">
        <div className="flex justify-between items-start mb-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item._id)}`}>
            {item._id}
          </span>
          <div className={`flex items-center space-x-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
            <span className="text-xs">{trend >= 0 ? '+' : ''}{trend}%</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold text-gray-900 text-sm">{item.count.toLocaleString()}</p>
            <p className="text-xs text-gray-600">{percentage}% of total</p>
          </div>
        </div>
      </div>
    );
  };

  const OverviewReport = () => (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
            <div className="p-1.5 sm:p-2 lg:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-green-600">+12%</span>
          </div>
          <h3 className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 mb-1">
            {analytics.userRegistrations.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm">Total Users</p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
            <div className="p-1.5 sm:p-2 lg:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-green-500 to-green-600">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-green-600">+18%</span>
          </div>
          <h3 className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 mb-1">
            {analytics.bookingStats.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm">Total Bookings</p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
            <div className="p-1.5 sm:p-2 lg:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-500 to-purple-600">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-green-600">+23%</span>
          </div>
          <h3 className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(analytics.revenueStats.totalRevenue)}
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm">Total Revenue</p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
            <div className="p-1.5 sm:p-2 lg:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-orange-500 to-orange-600">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-green-600">+8%</span>
          </div>
          <h3 className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(analytics.revenueStats.averageOrderValue)}
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm">Avg Order Value</p>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 lg:p-6">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 lg:mb-4">
            User Registrations
          </h3>
          {isMobile ? (
            <div className="space-y-2">
              {analytics.userRegistrations.map((item, index) => (
                <MobileUserCard key={index} item={item} />
              ))}
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {analytics.userRegistrations.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(item._id)}`}>
                      {item._id.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">{item.count.toLocaleString()}</span>
                    <span className={`text-xs font-medium ${getTrendPercentage(item._id) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {getTrendPercentage(item._id) >= 0 ? '+' : ''}{getTrendPercentage(item._id)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 lg:p-6">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 lg:mb-4">
            Booking Status
          </h3>
          {isMobile ? (
            <div className="space-y-2">
              {analytics.bookingStats.map((item, index) => (
                <MobileBookingCard key={index} item={item} />
              ))}
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {analytics.bookingStats.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item._id)}`}>
                      {item._id}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">{item.count.toLocaleString()}</span>
                    <span className={`text-xs font-medium ${getTrendPercentage(item._id) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {getTrendPercentage(item._id) >= 0 ? '+' : ''}{getTrendPercentage(item._id)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 lg:p-6">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 lg:mb-4">
          Performance Metrics
        </h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-6">
          <div className="text-center">
            <div className="text-base sm:text-lg lg:text-2xl font-bold text-blue-600 mb-1">94%</div>
            <div className="text-xs sm:text-sm text-gray-600">Completion</div>
          </div>
          <div className="text-center">
            <div className="text-base sm:text-lg lg:text-2xl font-bold text-green-600 mb-1">4.7/5</div>
            <div className="text-xs sm:text-sm text-gray-600">Rating</div>
          </div>
          <div className="text-center">
            <div className="text-base sm:text-lg lg:text-2xl font-bold text-purple-600 mb-1">12min</div>
            <div className="text-xs sm:text-sm text-gray-600">Response</div>
          </div>
        </div>
      </div>
    </div>
  );

  const UserAnalyticsReport = () => (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 lg:p-6">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-6">
          User Registration Analytics
        </h3>
        {isMobile ? (
          <div className="space-y-2">
            {analytics.userRegistrations.map((item, index) => (
              <MobileUserCard key={index} item={item} />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">User Role</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">Count</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">Percentage</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics.userRegistrations.map((item, index) => {
                  const total = analytics.userRegistrations.reduce((sum, i) => sum + i.count, 0);
                  const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
                  const trend = getTrendPercentage(item._id);

                  return (
                    <tr key={index}>
                      <td className="px-3 py-2 sm:px-4 sm:py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(item._id)}`}>
                          {item._id.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 font-semibold text-gray-900 text-sm">{item.count.toLocaleString()}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-gray-600 text-sm">{percentage}%</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3">
                        <div className={`flex items-center space-x-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <TrendingUp className={`w-3 h-3 sm:w-4 sm:h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
                          <span className="text-xs sm:text-sm">{trend >= 0 ? '+' : ''}{trend}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const BookingAnalyticsReport = () => (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 lg:p-6">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-6">
          Booking Analytics
        </h3>
        {isMobile ? (
          <div className="space-y-2">
            {analytics.bookingStats.map((item, index) => (
              <MobileBookingCard key={index} item={item} />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">Count</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">Percentage</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics.bookingStats.map((item, index) => {
                  const total = analytics.bookingStats.reduce((sum, i) => sum + i.count, 0);
                  const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
                  const trend = getTrendPercentage(item._id);

                  return (
                    <tr key={index}>
                      <td className="px-3 py-2 sm:px-4 sm:py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item._id)}`}>
                          {item._id}
                        </span>
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 font-semibold text-gray-900 text-sm">{item.count.toLocaleString()}</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 text-gray-600 text-sm">{percentage}%</td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3">
                        <div className={`flex items-center space-x-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <TrendingUp className={`w-3 h-3 sm:w-4 sm:h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
                          <span className="text-xs sm:text-sm">{trend >= 0 ? '+' : ''}{trend}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const RevenueAnalyticsReport = () => (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 lg:p-6">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-6">
          Revenue Analytics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-3 sm:mb-4 lg:mb-6">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6">
            <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2">Total Revenue</h4>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mb-2">
              {formatCurrency(analytics.revenueStats.totalRevenue)}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">All time revenue</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6">
            <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2">Average Order Value</h4>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600 mb-2">
              {formatCurrency(analytics.revenueStats.averageOrderValue)}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">Per completed booking</p>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6">
          <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 lg:mb-4">
            Revenue Breakdown
          </h4>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs sm:text-sm">Service Bookings</span>
              <span className="font-semibold text-gray-900 text-sm">{formatCurrency(analytics.revenueStats.totalRevenue * 0.85)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs sm:text-sm">Subscription Fees</span>
              <span className="font-semibold text-gray-900 text-sm">{formatCurrency(analytics.revenueStats.totalRevenue * 0.12)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-xs sm:text-sm">Other Revenue</span>
              <span className="font-semibold text-gray-900 text-sm">{formatCurrency(analytics.revenueStats.totalRevenue * 0.03)}</span>
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
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Comprehensive platform analytics and reports</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchAnalytics}
            className="px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center text-xs sm:text-sm"
          >
            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Refresh</span>
            <span className="sm:hidden">Reload</span>
          </button>
          <button
            onClick={exportCurrentPageToCSV}
            disabled={exportLoading}
            className="px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exportLoading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600 mr-1 sm:mr-2"></div>
                <span className="hidden sm:inline">Exporting...</span>
                <span className="sm:hidden">Exporting</span>
              </>
            ) : (
              <>
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
                <span className="sm:hidden">CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4">
          {/* Period Filter */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="flex-1 px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {periods.map(p => (
                <option key={p.value} value={p.value}>
                  {isMobile ? p.label.slice(0, 3) : p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Report Type Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="flex-1 px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {isMobile ? type.label.split(' ')[0] : type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="flex items-center justify-center h-32 sm:h-48 lg:h-64">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        renderReport()
      )}
    </div>
  );
};

export default AdminReports;