
import React, { useState, useEffect, useCallback } from 'react';
import {
  IndianRupee, Search, Filter, Eye, CheckCircle, XCircle,
  Clock, AlertCircle, TrendingUp, User, Phone, Mail,
  ChevronLeft, ChevronRight, Download, Calendar,
  MoreVertical, Smartphone, Monitor, ChevronDown,
  BarChart3, RefreshCw, FileText, CreditCard,
  Shield, Zap, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    completedPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    revenueGrowth: 23,
    completedGrowth: 18,
    pendingGrowth: 5,
    failedGrowth: -2
  });

  const statuses = [
    { value: 'ALL', label: 'All Payments', color: 'bg-gradient-to-r from-gray-500 to-gray-700' },
    { value: 'PENDING', label: 'Pending', color: 'bg-gradient-to-r from-orange-500 to-orange-600' },
    { value: 'COMPLETED', label: 'Completed', color: 'bg-gradient-to-r from-green-500 to-green-600' },
    { value: 'FAILED', label: 'Failed', color: 'bg-gradient-to-r from-red-500 to-red-600' }
  ];

  // Enhanced responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: isMobile ? 6 : 12,
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await axiosInstance.get(`/api/admin/payments?${params}`);

      if (response.data.success) {
        setPayments(response.data.data.payments);
        setTotalPages(response.data.data.pagination.pages);
        setAnalytics(prev => ({
          ...prev,
          ...response.data.data.analytics
        }));
      }

    } catch (error) {
      console.error('Error fetching payments:', error);
      const message = error.response?.data?.message || 'Failed to load payments';
      toast.error(message);
      setPayments([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
      setRefreshLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshLoading(true);
    fetchPayments();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'COMPLETED': return 'bg-green-50 text-green-800 border-green-200';
      case 'FAILED': return 'bg-red-50 text-red-800 border-red-200';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'FAILED': return <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      default: return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />;
    }
  };

  // Enhanced Payment Modal Component
  const PaymentModal = () => {
    if (!selectedPayment) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl transform transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
                <p className="text-gray-600">Complete transaction information</p>
              </div>
            </div>
            <button
              onClick={() => setShowPaymentModal(false)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
            >
              <XCircle className="w-6 h-6 text-gray-400 hover:text-gray-600" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Payment Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 truncate">
                      Payment #{selectedPayment.payment?.paymentId?.slice(-8) || selectedPayment._id.slice(-8)}
                    </h3>
                    <p className="text-gray-600 mt-2">
                      Transaction Date: {selectedPayment.payment?.transactionDate ?
                        formatDate(selectedPayment.payment.transactionDate) :
                        formatDate(selectedPayment.createdAt)
                      }
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(selectedPayment.payment?.status)} flex-shrink-0`}>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(selectedPayment.payment?.status)}
                      <span className="truncate">{selectedPayment.payment?.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount Card */}
              <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border border-green-100">
                <h4 className="font-semibold text-gray-900 mb-4 text-lg">Payment Amount</h4>
                <div className="text-center">
                  <p className="text-3xl lg:text-4xl font-bold text-green-600">
                    {formatCurrency(selectedPayment.payment?.amount || selectedPayment.price)}
                  </p>
                  <p className="text-gray-600 mt-2">Service Fee</p>
                </div>
              </div>
            </div>

            {/* Payment Method & Transaction */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 border border-purple-100">
                <h4 className="font-semibold text-gray-900 mb-4 text-lg flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <span>Payment Method</span>
                </h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Payment Type</p>
                    <p className="font-semibold text-gray-900 text-lg">{selectedPayment.payment?.paymentType || 'N/A'}</p>
                  </div>
                  {selectedPayment.payment?.transactionId && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Transaction ID</p>
                      <p className="font-medium font-mono text-sm break-all bg-gray-50 p-3 rounded-lg mt-1 border">
                        {selectedPayment.payment.transactionId}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Details */}
              <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-6 border border-orange-100">
                <h4 className="font-semibold text-gray-900 mb-4 text-lg flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  <span>Service Details</span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Service Date</p>
                    <p className="font-semibold text-gray-900">{formatDate(selectedPayment.bookingDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Service Time</p>
                    <p className="font-semibold text-gray-900">{selectedPayment.bookingTime}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-gray-600">Service Type</p>
                    <p className="font-semibold text-gray-900">{selectedPayment.serviceType}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer & Worker Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Card */}
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border border-blue-100">
                <h4 className="font-semibold text-gray-900 mb-4 text-lg flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Customer Information</span>
                </h4>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 text-lg truncate">
                      {selectedPayment.customerId?.name || 'N/A'}
                    </p>
                    <p className="text-gray-600 truncate">
                      {selectedPayment.customerId?.phone || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedPayment.customerId?.email || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Worker Card */}
              <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 border border-green-100">
                <h4 className="font-semibold text-gray-900 mb-4 text-lg flex items-center space-x-2">
                  <User className="w-5 h-5 text-green-600" />
                  <span>Worker Information</span>
                </h4>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 text-lg truncate">
                      {selectedPayment.workerId?.name || 'N/A'}
                    </p>
                    <p className="text-gray-600 truncate">
                      {selectedPayment.workerId?.phone || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedPayment.workerId?.email || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="flex-1 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Mobile Payment Card
  const MobilePaymentCard = ({ payment }) => {
    const statusColor = getStatusColor(payment.payment?.status);
    
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-mono text-sm text-gray-900 font-bold">
                  #{payment.payment?.paymentId?.slice(-8) || payment._id.slice(-8)}
                </p>
                <p className="text-xs text-gray-600">
                  {payment.payment?.transactionDate ?
                    formatDate(payment.payment.transactionDate) :
                    formatDate(payment.createdAt)
                  }
                </p>
              </div>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 ${statusColor} flex-shrink-0 ml-2`}>
            <div className="flex items-center space-x-1">
              {getStatusIcon(payment.payment?.status)}
              <span>{payment.payment?.status}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
            <span className="text-sm font-medium text-gray-600">Amount:</span>
            <span className="font-bold text-green-600 text-lg">
              {formatCurrency(payment.payment?.amount || payment.price)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-600">Customer</p>
              <p className="font-semibold text-gray-900 text-sm truncate">{payment.customerId?.name}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-600">Worker</p>
              <p className="font-semibold text-gray-900 text-sm truncate">{payment.workerId?.name}</p>
            </div>
          </div>

          <div className="flex justify-between items-center bg-purple-50 rounded-lg p-3">
            <span className="text-sm font-medium text-gray-600">Method:</span>
            <span className="font-semibold text-gray-900">{payment.payment?.paymentType || 'N/A'}</span>
          </div>
        </div>

        <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => {
              setSelectedPayment(payment);
              setShowPaymentModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </button>
        </div>
      </div>
    );
  };

  // Enhanced Stats Card Component
  const StatCard = ({ title, value, growth, icon: Icon, color }) => {
    const isPositive = growth >= 0;
    
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${color} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold ${
            isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            <span>{Math.abs(growth)}%</span>
          </div>
        </div>
        <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          {title === 'Total Revenue' ? formatCurrency(value) : value}
        </h3>
        <p className="text-gray-600 font-medium">{title}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-10xl mx-auto space-y-6 md:space-y-8">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
              Payment Management
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Monitor and manage all payment transactions with real-time analytics and insights
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={refreshLoading}
              className="p-4 bg-white rounded-2xl shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-6 h-6 text-gray-600 ${refreshLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Enhanced Payment Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="Total Revenue"
            value={analytics.totalRevenue}
            growth={analytics.revenueGrowth}
            icon={IndianRupee}
            color="bg-gradient-to-r from-green-500 to-green-600"
          />
          <StatCard
            title="Completed"
            value={analytics.completedPayments}
            growth={analytics.completedGrowth}
            icon={CheckCircle}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
          />
          <StatCard
            title="Pending"
            value={analytics.pendingPayments}
            growth={analytics.pendingGrowth}
            icon={Clock}
            color="bg-gradient-to-r from-orange-500 to-orange-600"
          />
          <StatCard
            title="Failed"
            value={analytics.failedPayments}
            growth={analytics.failedGrowth}
            icon={XCircle}
            color="bg-gradient-to-r from-red-500 to-red-600"
          />
        </div>

        {/* Enhanced Filters Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="flex flex-col xl:flex-row gap-6">
            {/* Search Area */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search payments by transaction ID, customer, or worker..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-base transition-all duration-200"
                    aria-label="Search payments"
                  />
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={refreshLoading}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold flex items-center justify-center min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {refreshLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-3" />
                      <span>Search</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Enhanced Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-3 bg-gray-50 rounded-xl p-3 border border-gray-200">
                <Filter className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700 font-medium text-base"
                  aria-label="Filter by status"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Filter Toggle */}
              <div className="sm:hidden">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-700">More Filters</span>
                  </div>
                  <div className={`transform transition-transform duration-200 ${showMobileFilters ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Payments List/Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading payments...</p>
              </div>
            </div>
          ) : (
            <>
              {isMobile ? (
                // Mobile Card View
                <div className="p-6">
                  {payments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300">
                      <CreditCard className="w-16 h-16 text-gray-400 mb-4" />
                      <p className="text-lg font-semibold text-gray-600 mb-2">No payments found</p>
                      <p className="text-gray-500 text-center max-w-sm">
                        Try adjusting your filters or search term to find payments
                      </p>
                    </div>
                  ) : (
                    payments.map((payment) => (
                      <MobilePaymentCard key={payment._id} payment={payment} />
                    ))
                  )}
                </div>
              ) : (
                // Desktop Table View
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Transaction</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Worker</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Method</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {payments.length === 0 ? (
                          <tr>
                            <td colSpan="8" className="px-6 py-12 text-center">
                              <div className="flex flex-col items-center justify-center">
                                <CreditCard className="w-16 h-16 text-gray-400 mb-4" />
                                <p className="text-lg font-semibold text-gray-600 mb-2">No payments found</p>
                                <p className="text-gray-500 max-w-md">
                                  Try adjusting your filters or search term to find payments
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          payments.map((payment) => (
                            <tr key={payment._id} className="hover:bg-blue-50 transition-colors duration-200 group">
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                                    <CreditCard className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-mono font-bold text-gray-900">
                                      #{payment.payment?.paymentId?.slice(-8) || payment._id.slice(-8)}
                                    </p>
                                    {payment.payment?.transactionId && (
                                      <p className="text-xs text-gray-500 font-mono truncate max-w-[120px]">
                                        {payment.payment.transactionId.slice(-12)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{payment.customerId?.name}</p>
                                    <p className="text-sm text-gray-500 truncate">{payment.customerId?.phone}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{payment.workerId?.name}</p>
                                    <p className="text-sm text-gray-500 truncate">{payment.workerId?.phone}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-bold text-green-600 text-lg">
                                  {formatCurrency(payment.payment?.amount || payment.price)}
                                </p>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-semibold text-gray-900">{payment.payment?.paymentType || 'N/A'}</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(payment.payment?.status)}`}>
                                  <div className="flex items-center space-x-2">
                                    {getStatusIcon(payment.payment?.status)}
                                    <span>{payment.payment?.status}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="font-semibold text-gray-900">
                                  {payment.payment?.transactionDate ?
                                    formatDate(payment.payment.transactionDate) :
                                    formatDate(payment.createdAt)
                                  }
                                </p>
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => {
                                    setSelectedPayment(payment);
                                    setShowPaymentModal(true);
                                  }}
                                  className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                  <span>View</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Enhanced Pagination */}
              {payments.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200 gap-4">
                  <p className="text-sm font-semibold text-gray-700">
                    Showing page {currentPage} of {totalPages} • {payments.length} payments
                  </p>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-3 rounded-xl border-2 border-gray-300 hover:bg-white hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center space-x-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                              currentPage === pageNum
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                                : 'text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      {totalPages > 5 && (
                        <span className="px-3 text-gray-500 font-semibold">...</span>
                      )}
                    </div>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="p-3 rounded-xl border-2 border-gray-300 hover:bg-white hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {showPaymentModal && <PaymentModal />}
      </div>
    </div>
  );
};

export default AdminPayments;
