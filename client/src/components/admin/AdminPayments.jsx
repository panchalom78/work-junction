import React, { useState, useEffect } from 'react';
import {
  DollarSign, Search, Filter, Eye, CheckCircle, XCircle,
  Clock, AlertCircle, TrendingUp, User, Phone, Mail,
  ChevronLeft, ChevronRight, Download, Calendar,
  MoreVertical, Smartphone, Monitor
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    completedPayments: 0,
    pendingPayments: 0,
    failedPayments: 0
  });

  const statuses = [
    { value: 'ALL', label: 'All Payments' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'FAILED', label: 'Failed' }
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
    fetchPayments();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: isMobile ? 5 : 10,
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await axiosInstance.get(`/api/admin/payments?${params}`);

      if (response.data.success) {
        setPayments(response.data.data.payments);
        setTotalPages(response.data.data.pagination.pages);
        setAnalytics(response.data.data.analytics);
      }

    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
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
      case 'PENDING': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'FAILED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const PaymentModal = () => {
    if (!selectedPayment) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 max-w-2xl w-full max-h-[95vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Payment Details</h2>
            <button
              onClick={() => setShowPaymentModal(false)}
              className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            {/* Payment Info */}
            <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                    Payment #{selectedPayment.payment?.paymentId?.slice(-8) || selectedPayment._id.slice(-8)}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    Transaction Date: {selectedPayment.payment?.transactionDate ?
                      formatDate(selectedPayment.payment.transactionDate) :
                      formatDate(selectedPayment.createdAt)
                    }
                  </p>
                </div>
                <div className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(selectedPayment.payment?.status)} flex-shrink-0 mt-2 sm:mt-0`}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(selectedPayment.payment?.status)}
                    <span className="truncate">{selectedPayment.payment?.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Payment Amount</h4>
              <div className="text-center">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">
                  {formatCurrency(selectedPayment.payment?.amount || selectedPayment.price)}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Service Fee</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Payment Method</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Payment Type</p>
                  <p className="font-medium text-sm sm:text-base">{selectedPayment.payment?.paymentType || 'N/A'}</p>
                </div>
                {selectedPayment.payment?.transactionId && (
                  <div className="sm:col-span-2">
                    <p className="text-xs sm:text-sm text-gray-600">Transaction ID</p>
                    <p className="font-medium font-mono text-xs sm:text-sm break-all bg-gray-50 p-2 rounded mt-1">
                      {selectedPayment.payment.transactionId}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Customer & Worker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
              {/* Customer */}
              <div className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Customer</h4>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                      {selectedPayment.customerId?.name || 'N/A'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      {selectedPayment.customerId?.phone || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Worker */}
              <div className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Worker</h4>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                      {selectedPayment.workerId?.name || 'N/A'}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">
                      {selectedPayment.workerId?.phone || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Service Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Service Date</p>
                  <p className="font-medium text-sm sm:text-base">{formatDate(selectedPayment.bookingDate)}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Service Time</p>
                  <p className="font-medium text-sm sm:text-base">{selectedPayment.bookingTime}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Service Type</p>
                  <p className="font-medium text-sm sm:text-base">{selectedPayment.serviceType}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Booking Status</p>
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedPayment.status)} mt-1`}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(selectedPayment.status)}
                      <span className="truncate">{selectedPayment.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Mobile Card View
  const MobilePaymentCard = ({ payment }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 mb-3">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-xs text-gray-900 font-medium mb-1">
            #{payment.payment?.paymentId?.slice(-8) || payment._id.slice(-8)}
          </p>
          <p className="text-xs text-gray-600">
            {payment.payment?.transactionDate ?
              formatDate(payment.payment.transactionDate) :
              formatDate(payment.createdAt)
            }
          </p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.payment?.status)} flex-shrink-0 ml-2`}>
          <div className="flex items-center space-x-1">
            {getStatusIcon(payment.payment?.status)}
            <span>{payment.payment?.status}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Amount:</span>
          <span className="font-semibold text-green-600 text-sm">
            {formatCurrency(payment.payment?.amount || payment.price)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Customer:</span>
          <span className="font-medium text-xs truncate ml-2 max-w-[120px]">
            {payment.customerId?.name}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Worker:</span>
          <span className="font-medium text-xs truncate ml-2 max-w-[120px]">
            {payment.workerId?.name}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Method:</span>
          <span className="text-xs">{payment.payment?.paymentType || 'N/A'}</span>
        </div>
      </div>

      <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={() => {
            setSelectedPayment(payment);
            setShowPaymentModal(true);
          }}
          className="flex items-center space-x-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs font-medium"
        >
          <Eye className="w-3 h-3" />
          <span>View Details</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Monitor and manage all payment transactions</p>
        </div>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
            <div className="p-1.5 sm:p-2 lg:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-green-500 to-green-600">
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-green-600">+23%</span>
          </div>
          <h3 className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(analytics.totalRevenue)}
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm">Total Revenue</p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
            <div className="p-1.5 sm:p-2 lg:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-green-600">+18%</span>
          </div>
          <h3 className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 mb-1">
            {analytics.completedPayments}
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm">Completed</p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
            <div className="p-1.5 sm:p-2 lg:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-orange-500 to-orange-600">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-orange-600">+5%</span>
          </div>
          <h3 className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 mb-1">
            {analytics.pendingPayments}
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm">Pending</p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
            <div className="p-1.5 sm:p-2 lg:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-red-500 to-red-600">
              <XCircle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-red-600">-2%</span>
          </div>
          <h3 className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 mb-1">
            {analytics.failedPayments}
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm">Failed</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={isMobile ? "Search payments..." : "Search payments by transaction ID, customer, or worker..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {isMobile ? status.label.split(' ')[0] : status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Payments List/Table */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32 sm:h-48 lg:h-64">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {isMobile ? (
              // Mobile Card View
              <div className="p-3 sm:p-4">
                {payments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 sm:h-48">
                    <DollarSign className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-2 sm:mb-3" />
                    <p className="text-sm sm:text-base text-gray-600 font-medium">No payments found</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 text-center">
                      Try adjusting your filters or search term
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
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 sm:px-6 text-left text-xs sm:text-sm font-semibold text-gray-900">Transaction ID</th>
                        <th className="px-4 py-3 sm:px-6 text-left text-xs sm:text-sm font-semibold text-gray-900">Customer</th>
                        <th className="px-4 py-3 sm:px-6 text-left text-xs sm:text-sm font-semibold text-gray-900">Worker</th>
                        <th className="px-4 py-3 sm:px-6 text-left text-xs sm:text-sm font-semibold text-gray-900">Amount</th>
                        <th className="px-4 py-3 sm:px-6 text-left text-xs sm:text-sm font-semibold text-gray-900">Method</th>
                        <th className="px-4 py-3 sm:px-6 text-left text-xs sm:text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-4 py-3 sm:px-6 text-left text-xs sm:text-sm font-semibold text-gray-900">Date</th>
                        <th className="px-4 py-3 sm:px-6 text-left text-xs sm:text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {payments.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="px-4 py-8 sm:px-6 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <DollarSign className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-2 sm:mb-3" />
                              <p className="text-sm sm:text-base text-gray-600 font-medium">No payments found</p>
                              <p className="text-xs sm:text-sm text-gray-500 mt-1">Try adjusting your filters or search term</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        payments.map((payment) => (
                          <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 sm:px-6">
                              <p className="font-mono text-xs sm:text-sm text-gray-900">
                                #{payment.payment?.paymentId?.slice(-8) || payment._id.slice(-8)}
                              </p>
                            </td>
                            <td className="px-4 py-3 sm:px-6">
                              <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{payment.customerId?.name}</p>
                                  <p className="text-xs text-gray-500 truncate">{payment.customerId?.phone}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 sm:px-6">
                              <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{payment.workerId?.name}</p>
                                  <p className="text-xs text-gray-500 truncate">{payment.workerId?.phone}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 sm:px-6">
                              <p className="font-medium text-green-600 text-xs sm:text-sm">
                                {formatCurrency(payment.payment?.amount || payment.price)}
                              </p>
                            </td>
                            <td className="px-4 py-3 sm:px-6 text-xs sm:text-sm text-gray-900">
                              {payment.payment?.paymentType || 'N/A'}
                            </td>
                            <td className="px-4 py-3 sm:px-6">
                              <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.payment?.status)}`}>
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(payment.payment?.status)}
                                  <span className="truncate">{payment.payment?.status}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 sm:px-6 text-xs sm:text-sm text-gray-900">
                              {payment.payment?.transactionDate ?
                                formatDate(payment.payment.transactionDate) :
                                formatDate(payment.createdAt)
                              }
                            </td>
                            <td className="px-4 py-3 sm:px-6">
                              <button
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setShowPaymentModal(true);
                                }}
                                className="p-1 sm:p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
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

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-4 lg:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 gap-2 sm:gap-3">
              <p className="text-xs sm:text-sm text-gray-700">
                Showing page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 sm:p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 sm:p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showPaymentModal && <PaymentModal />}
    </div>
  );
};

export default AdminPayments;