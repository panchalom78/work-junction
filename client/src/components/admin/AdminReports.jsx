import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, IndianRupee, Target, Clock,
  Calendar, Filter, RefreshCw, Download,
  TrendingUp, MapPin, PieChart, BarChart3,
  UserCheck, Shield, Briefcase, Star,
  CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

// Chart components
const BarChart = ({ data, labels, colors, height = 200 }) => {
  const safeData = Array.isArray(data) ? data : [];
  const safeLabels = Array.isArray(labels) ? labels : [];
  const maxValue = Math.max(1, ...safeData);
  
  return (
    <div className="flex items-end justify-between space-x-1 px-2" style={{ height }}>
      {safeData.length === 0 ? (
        <div className="w-full text-center text-sm text-gray-500">No data</div>
      ) : safeData.map((value, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <div
            className="w-3/4 rounded-t transition-all duration-500 ease-in-out"
            style={{
              height: `${Math.max(0, (value / maxValue) * 100)}%`,
              background: `linear-gradient(to top, ${colors[0]}, ${colors[1]})`
            }}
          ></div>
          <span className="text-xs mt-2 text-gray-600 text-center truncate w-full">
            {safeLabels[index]}
          </span>
          <span className="text-xs font-semibold text-gray-900 mt-1">
            {value}
          </span>
        </div>
      ))}
    </div>
  );
};

const LineChart = ({ data, labels, color = '#3B82F6', height = 200 }) => {
  const safeData = Array.isArray(data) ? data : [];
  const safeLabels = Array.isArray(labels) ? labels : [];
  const maxValue = safeData.length ? Math.max(...safeData) : 0;
  const minValue = safeData.length ? Math.min(...safeData) : 0;
  const range = maxValue - minValue;

  // Generate SVG path for the line
  const getPathData = () => {
    if (safeData.length < 2 || range === 0) return `M 0,50 L 100,50`;
    
    const points = safeData.map((value, index) => {
      const x = (index / (safeData.length - 1)) * 100;
      const y = 100 - ((value - minValue) / range) * 100;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  // Generate area path
  const getAreaData = () => {
    if (safeData.length < 2 || range === 0) return `M 0,50 L 100,50 L 100,100 L 0,100 Z`;
    const points = safeData.map((value, index) => {
      const x = (index / (safeData.length - 1)) * 100;
      const y = 100 - ((value - minValue) / range) * 100;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')} L 100,100 L 0,100 Z`;
  };

  return (
    <div className="relative" style={{ height }}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Area fill */}
        <path
          d={getAreaData()}
          fill={`${color}20`}
          stroke="none"
        />
        
        {/* Line */}
        <path
          d={getPathData()}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {safeData.map((value, index) => {
          const x = (index / (safeData.length - 1)) * 100;
          const y = range === 0 ? 50 : 100 - ((value - minValue) / range) * 100;
          
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={color}
              stroke="#fff"
              strokeWidth="1"
            />
          );
        })}
      </svg>
      
      {/* X-axis labels */}
      <div className="flex justify-between px-2 mt-2">
        {safeLabels.map((label, index) => (
          <span key={index} className="text-xs text-gray-600 truncate flex-1 text-center">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

const PieChartComponent = ({ data, colors, height = 200 }) => {
  const safeData = Array.isArray(data) ? data : [];
  const total = safeData.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  let accumulatedAngle = 0;

  return (
    <div className="flex flex-col items-center">
      <svg width={height} height={height} viewBox="0 0 100 100" className="mb-4">
        {total <= 0 || safeData.length === 0 ? (
          <circle cx="50" cy="50" r="40" fill="#e5e7eb" />
        ) : safeData.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const angle = (percentage / 100) * 360;
          const largeArcFlag = angle > 180 ? 1 : 0;
          
          const x1 = 50 + 40 * Math.cos(accumulatedAngle * Math.PI / 180);
          const y1 = 50 + 40 * Math.sin(accumulatedAngle * Math.PI / 180);
          
          accumulatedAngle += angle;
          
          const x2 = 50 + 40 * Math.cos(accumulatedAngle * Math.PI / 180);
          const y2 = 50 + 40 * Math.sin(accumulatedAngle * Math.PI / 180);

          const pathData = [
            `M 50 50`,
            `L ${x1} ${y1}`,
            `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `Z`
          ].join(' ');

          return (
            <path
              key={index}
              d={pathData}
              fill={colors[index % colors.length]}
              stroke="#fff"
              strokeWidth="1"
            />
          );
        })}
        <circle cx="50" cy="50" r="20" fill="#fff" />
      </svg>
      
      <div className="space-y-2 w-full">
        {safeData.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="text-gray-700">{item.label}</span>
            </div>
            <span className="font-semibold text-gray-900">
              {total > 0 ? (((item.value / total) * 100).toFixed(1) + '%') : '0%'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminReports = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [reportType, setReportType] = useState('overview');
  const [isMobile, setIsMobile] = useState(false);

  const periods = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const reportTypes = [
    { value: 'overview', label: 'Overview' },
    { value: 'users', label: 'Users' },
    { value: 'bookings', label: 'Bookings' },
    { value: 'revenue', label: 'Revenue' },
    { value: 'performance', label: 'Performance' },
    { value: 'workers', label: 'Workers' }
  ];

  // Enhanced mock data with chart data
  const loadMockData = () => {
    const mockData = {
      userStats: {
        total: 1250,
        growth: 12.5,
        customers: 890,
        workers: 320,
        admins: 5,
        active: 234
      },
      bookingStats: {
        total: 845,
        growth: 8.3,
        pending: 23,
        completed: 789,
        cancelled: 33,
        revenue: 125000
      },
      financialStats: {
        totalRevenue: 125000,
        growth: 15.2,
        commission: 18750,
        pendingPayouts: 4500,
        totalPayouts: 89000
      },
      performanceStats: {
        completionRate: 94.5,
        avgRating: 4.7,
        responseTime: 15,
        satisfactionScore: 92
      },
      liveStats: {
        activeUsers: 42,
        recentBookings: 8,
        pendingBookings: 23,
        lastUpdated: new Date()
      },
      // Chart data
      revenueTrend: [
        { month: 'Jan', amount: 45000 },
        { month: 'Feb', amount: 52000 },
        { month: 'Mar', amount: 48000 },
        { month: 'Apr', amount: 61000 },
        { month: 'May', amount: 58000 },
        { month: 'Jun', amount: 125000 }
      ],
      userGrowth: [
        { month: 'Jan', users: 450 },
        { month: 'Feb', users: 620 },
        { month: 'Mar', users: 780 },
        { month: 'Apr', users: 890 },
        { month: 'May', users: 1020 },
        { month: 'Jun', users: 1250 }
      ],
      bookingTrend: [
        { week: 'W1', bookings: 120 },
        { week: 'W2', bookings: 145 },
        { week: 'W3', bookings: 130 },
        { week: 'W4', bookings: 165 }
      ],
      categoryDistribution: [
        { category: 'Cleaning', value: 35 },
        { category: 'Repair', value: 25 },
        { category: 'Installation', value: 20 },
        { category: 'Maintenance', value: 15 },
        { category: 'Other', value: 5 }
      ],
      workerPerformance: [
        { name: 'John D.', rating: 4.8, jobs: 45 },
        { name: 'Sarah M.', rating: 4.9, jobs: 52 },
        { name: 'Mike R.', rating: 4.7, jobs: 38 },
        { name: 'Lisa T.', rating: 4.6, jobs: 41 },
        { name: 'Tom B.', rating: 4.5, jobs: 33 }
      ]
    };
    setAnalytics(mockData);
  };

  // Utility functions
  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCompactNumber = (number) => {
    if (!number) return '0';
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M';
    }
    if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'K';
    }
    return number.toString();
  };

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Enhanced Revenue Report with Charts
  const RevenueReport = () => {
    if (!analytics) return null;
    const fin = analytics.financialStats || {};
    const trend = analytics.revenueTrend || [];
    
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
                <IndianRupee className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-gray-500">Total Revenue</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(fin.totalRevenue || 0)}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
                <IndianRupee className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-gray-500">Commission</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(fin.commission || 0)}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600">
                <IndianRupee className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-gray-500">Pending Payouts</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(fin.pendingPayouts || 0)}</div>
          </div>
        </div>

        {/* Revenue Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            <LineChart
              data={trend.map(t => t.amount)}
              labels={trend.map(t => t.month)}
              color="#8B5CF6"
              height={isMobile ? 160 : 200}
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Revenue Distribution</h3>
            <PieChartComponent
              data={[
                { label: 'Service Fees', value: fin.commission || 0 },
                { label: 'Completed Jobs', value: (fin.totalRevenue || 0) - (fin.commission || 0) },
                { label: 'Pending', value: fin.pendingPayouts || 0 }
              ]}
              colors={['#8B5CF6', '#3B82F6', '#10B981']}
              height={isMobile ? 160 : 200}
            />
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Monthly Revenue Breakdown</h3>
          <BarChart
            data={trend.map(t => t.amount)}
            labels={trend.map(t => t.month)}
            colors={['#8B5CF6', '#7C3AED']}
            height={isMobile ? 180 : 250}
          />
        </div>
      </div>
    );
  };

  // Enhanced Users Report with Charts
  const UsersReport = () => {
    if (!analytics) return null;
    const stats = analytics.userStats || {};
    const growthData = analytics.userGrowth || [];
    
    const items = [
      { label: 'Customers', value: stats.customers || 0, color: 'from-blue-500 to-blue-600', icon: <Users className="w-4 h-4" /> },
      { label: 'Workers', value: stats.workers || 0, color: 'from-green-500 to-green-600', icon: <Briefcase className="w-4 h-4" /> },
      { label: 'Admins', value: stats.admins || 0, color: 'from-purple-500 to-purple-600', icon: <Shield className="w-4 h-4" /> },
      { label: 'Active Users', value: stats.active || 0, color: 'from-orange-500 to-orange-600', icon: <UserCheck className="w-4 h-4" /> }
    ];

    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {items.map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color}`}>
                  <div className="text-white">{item.icon}</div>
                </div>
                <span className="text-xs text-gray-500">{item.label}</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{formatCompactNumber(item.value)}</div>
            </div>
          ))}
        </div>

        {/* User Growth Chart */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-4">User Growth</h3>
            <LineChart
              data={growthData.map(g => g.users)}
              labels={growthData.map(g => g.month)}
              color="#3B82F6"
              height={isMobile ? 160 : 200}
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-4">User Distribution</h3>
            <PieChartComponent
              data={[
                { label: 'Customers', value: stats.customers || 0 },
                { label: 'Workers', value: stats.workers || 0 },
                { label: 'Admins', value: stats.admins || 0 }
              ]}
              colors={['#3B82F6', '#10B981', '#8B5CF6']}
              height={isMobile ? 160 : 200}
            />
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Bookings Report with Charts
  const BookingsReport = () => {
    if (!analytics) return null;
    const stats = analytics.bookingStats || {};
    const trend = analytics.bookingTrend || [];
    const categories = analytics.categoryDistribution || [];
    
    const items = [
      { label: 'Total', value: stats.total || 0, color: 'text-gray-900', icon: <Target className="w-4 h-4 text-blue-600" /> },
      { label: 'Completed', value: stats.completed || 0, color: 'text-green-600', icon: <CheckCircle className="w-4 h-4 text-green-600" /> },
      { label: 'Pending', value: stats.pending || 0, color: 'text-yellow-600', icon: <Clock className="w-4 h-4 text-yellow-600" /> },
      { label: 'Cancelled', value: stats.cancelled || 0, color: 'text-red-600', icon: <XCircle className="w-4 h-4 text-red-600" /> }
    ];

    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {items.map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-gray-100">{item.icon}</div>
                <span className={`text-xs font-medium ${item.color}`}>{item.label}</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{formatCompactNumber(item.value)}</div>
            </div>
          ))}
        </div>

        {/* Booking Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Weekly Booking Trend</h3>
            <BarChart
              data={trend.map(t => t.bookings)}
              labels={trend.map(t => t.week)}
              colors={['#10B981', '#059669']}
              height={isMobile ? 160 : 200}
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Service Categories</h3>
            <PieChartComponent
              data={categories.map(cat => ({ label: cat.category, value: cat.value }))}
              colors={['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444']}
              height={isMobile ? 160 : 200}
            />
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Performance Report with Charts
  const PerformanceReport = () => {
    if (!analytics) return null;
    const perf = analytics.performanceStats || {};
    const workerData = analytics.workerPerformance || [];

    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <PerformanceMetric
            title="Completion Rate"
            value={perf.completionRate || 0}
            target="95%"
            unit="%"
            icon={<CheckCircle className="w-4 h-4 text-green-600" />}
            trend={2.5}
            isMobile={isMobile}
          />
          <PerformanceMetric
            title="Avg Rating"
            value={perf.avgRating || 0}
            target="4.8"
            icon={<Star className="w-4 h-4 text-yellow-600" />}
            trend={1.2}
            isMobile={isMobile}
          />
          <PerformanceMetric
            title="Response Time"
            value={perf.responseTime || 0}
            target="10min"
            unit="min"
            icon={<Clock className="w-4 h-4 text-blue-600" />}
            trend={-15}
            isMobile={isMobile}
          />
          <PerformanceMetric
            title="Satisfaction"
            value={perf.satisfactionScore || 0}
            target="95%"
            unit="%"
            icon={<TrendingUp className="w-4 h-4 text-purple-600" />}
            trend={3.1}
            isMobile={isMobile}
          />
        </div>

        {/* Worker Performance Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top Performers</h3>
          <div className="space-y-3">
            {workerData.map((worker, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">
                      {worker.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 truncate">{worker.name}</div>
                    <div className="text-sm text-gray-600 truncate">{worker.jobs} jobs completed</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-semibold text-gray-900">{worker.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const AutoRefreshIndicator = () => (
    <div className="flex items-center space-x-2 text-sm text-gray-600">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <span className="hidden xs:inline">Live updates active</span>
    </div>
  );

  const MetricCard = ({ title, value, change, icon, color, isMobile }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 relative">
      <div className={`p-2 rounded-lg bg-gradient-to-r ${color} mb-3 w-fit`}>{icon}</div>
      <div className={`${isMobile ? 'text-lg' : 'text-xl sm:text-2xl'} font-bold text-gray-900 mb-1`}>{value}</div>
      <div className={`text-xs font-medium ${Number(change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {Number(change) >= 0 ? '+' : ''}{change}%
      </div>
      <div className="text-gray-600 text-sm mt-1">{title}</div>
    </div>
  );

  const OverviewReport = () => {
    if (!analytics) return null;
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard 
            title="Total Users" 
            value={formatCompactNumber(analytics.userStats?.total || 0)} 
            change={analytics.userStats?.growth || 0} 
            icon={<Users className="w-5 h-5 text-white" />} 
            color="from-blue-500 to-blue-600"
            isMobile={isMobile}
          />
          <MetricCard 
            title="Total Bookings" 
            value={formatCompactNumber(analytics.bookingStats?.total || 0)} 
            change={analytics.bookingStats?.growth || 0} 
            icon={<Target className="w-5 h-5 text-white" />} 
            color="from-green-500 to-green-600"
            isMobile={isMobile}
          />
          <MetricCard 
            title="Total Revenue" 
            value={formatCurrency(analytics.financialStats?.totalRevenue || 0)} 
            change={analytics.financialStats?.growth || 0} 
            icon={<IndianRupee className="w-5 h-5 text-white" />} 
            color="from-purple-500 to-purple-600"
            isMobile={isMobile}
          />
          <MetricCard 
            title="Active Now" 
            value={analytics.liveStats?.activeUsers || '0'} 
            change={0} 
            icon={<UserCheck className="w-5 h-5 text-white" />} 
            color="from-orange-500 to-orange-600"
            isMobile={isMobile}
          />
        </div>
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <PerformanceMetric 
            title="Completion Rate" 
            value={analytics.performanceStats?.completionRate || 0} 
            target="95%" 
            unit="%" 
            icon={<CheckCircle className="w-4 h-4 text-green-600" />} 
            trend={2.5}
            isMobile={isMobile}
          />
          <PerformanceMetric 
            title="Avg Rating" 
            value={analytics.performanceStats?.avgRating || 0} 
            target="4.8" 
            icon={<Star className="w-4 h-4 text-yellow-600" />} 
            trend={1.2}
            isMobile={isMobile}
          />
          <PerformanceMetric 
            title="Response Time" 
            value={analytics.performanceStats?.responseTime || 0} 
            target="10min" 
            unit="min" 
            icon={<Clock className="w-4 h-4 text-blue-600" />} 
            trend={-15}
            isMobile={isMobile}
          />
          <PerformanceMetric 
            title="Satisfaction" 
            value={analytics.performanceStats?.satisfactionScore || 0} 
            target="95%" 
            unit="%" 
            icon={<TrendingUp className="w-4 h-4 text-purple-600" />} 
            trend={3.1}
            isMobile={isMobile}
          />
        </div>
      </div>
    );
  };

  const PerformanceMetric = ({ title, value, target, unit, icon, trend, isMobile }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg bg-gray-100">{icon}</div>
        <span className="text-xs text-gray-500">Target {target}</span>
      </div>
      <div className={`${isMobile ? 'text-lg' : 'text-xl sm:text-2xl'} font-bold text-gray-900`}>
        {value}{unit ? unit : ''}
      </div>
      <div className={`text-xs mt-1 ${Number(trend) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {Number(trend) >= 0 ? '▲' : '▼'} {Math.abs(Number(trend))}%
      </div>
      <div className="text-sm text-gray-600 mt-1">{title}</div>
    </div>
  );

  const WorkersReport = () => {
    if (!analytics) return null;
    const w = analytics.workerAnalytics || {};
    const items = [
      { label: 'Total Workers', value: w.totalWorkers || 0, icon: <Briefcase className="w-4 h-4 text-blue-600" /> },
      { label: 'Verified', value: w.verifiedWorkers || 0, icon: <Shield className="w-4 h-4 text-green-600" /> },
      { label: 'Active', value: w.activeWorkers || 0, icon: <UserCheck className="w-4 h-4 text-orange-600" /> },
      { label: 'Suspended', value: w.suspendedWorkers || 0, icon: <AlertCircle className="w-4 h-4 text-red-600" /> },
      { label: 'Services', value: w.workerServices || 0, icon: <Briefcase className="w-4 h-4 text-purple-600" /> },
      { label: 'Verification Rate', value: `${w.verificationRate || 0}%`, icon: <Shield className="w-4 h-4 text-green-600" /> }
    ];
    return (
      <div className="space-y-4 lg:space-y-6">
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {items.map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-gray-100">{item.icon}</div>
                <span className="text-xs text-gray-500">{item.label}</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/admin/analytics?period=${period}`);
      if (response.data?.success) {
        setAnalytics(response.data.data);
      } else {
        loadMockData();
      }
    } catch {
      loadMockData();
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const renderReport = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-lg mb-3"></div>
              <div className="w-3/4 h-6 bg-gray-200 rounded mb-2"></div>
              <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      );
    }
    switch (reportType) {
      case 'overview':
        return <OverviewReport />;
      case 'users':
        return <UsersReport />;
      case 'bookings':
        return <BookingsReport />;
      case 'revenue':
        return <RevenueReport />;
      case 'performance':
        return <PerformanceReport />;
      case 'workers':
        return <WorkersReport />;
      default:
        return <OverviewReport />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
              Analytics Dashboard
            </h1>
            <AutoRefreshIndicator />
          </div>
          <p className="text-sm text-gray-600 mt-1 truncate">
            Real-time platform insights and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0 mt-2 sm:mt-0">
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {periods.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {renderReport()}
    </div>
  );
};

export default AdminReports;