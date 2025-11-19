import React, { useState, useEffect } from 'react';
import {
  DollarSign, Search, Filter, Eye, CheckCircle, XCircle,
  Clock, AlertCircle, TrendingUp, User, Phone, Mail,
  ChevronLeft, ChevronRight, Download, Calendar
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

  useEffect(() => {
    fetchPayments();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
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
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'FAILED': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const PaymentModal = () => {
    if (!selectedPayment) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
            <button
              onClick={() => setShowPaymentModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Payment Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Payment #{selectedPayment.payment?.paymentId?.slice(-8) || selectedPayment._id.slice(-8)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Transaction Date: {selectedPayment.payment?.transactionDate ?
                      formatDate(selectedPayment.payment.transactionDate) :
                      formatDate(selectedPayment.createdAt)
                    }
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedPayment.payment?.status)}`}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(selectedPayment.payment?.status)}
                    <span>{selectedPayment.payment?.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Amount */}
            <div className="border border-gray-200 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Payment Amount</h4>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(selectedPayment.payment?.amount || selectedPayment.price)}
                </p>
                <p className="text-sm text-gray-600 mt-1">Service Fee</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="border border-gray-200 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Payment Method</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Payment Type</p>
                  <p className="font-medium">{selectedPayment.payment?.paymentType || 'N/A'}</p>
                </div>
                {selectedPayment.payment?.transactionId && (
                  <div>
                    <p className="text-sm text-gray-600">Transaction ID</p>
                    <p className="font-medium font-mono text-sm">{selectedPayment.payment.transactionId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Customer & Worker */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Customer</h4>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedPayment.customerId?.name}</p>
                    <p className="text-sm text-gray-600">{selectedPayment.customerId?.phone}</p>
                  </div>
                </div>
              </div>

              {/* Worker */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Worker</h4>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedPayment.workerId?.name}</p>
                    <p className="text-sm text-gray-600">{selectedPayment.workerId?.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="border border-gray-200 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Service Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Service Date</p>
                  <p className="font-medium">{formatDate(selectedPayment.bookingDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Service Time</p>
                  <p className="font-medium">{selectedPayment.bookingTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Service Type</p>
                  <p className="font-medium">{selectedPayment.serviceType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Booking Status</p>
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedPayment.status)}`}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(selectedPayment.status)}
                      <span>{selectedPayment.status}</span>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600">Monitor and manage all payment transactions</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-green-600">+23%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(analytics.totalRevenue)}</h3>
          <p className="text-gray-600 text-sm">Total Revenue</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-green-600">+18%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{analytics.completedPayments}</h3>
          <p className="text-gray-600 text-sm">Completed Payments</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-orange-600">+5%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{analytics.pendingPayments}</h3>
          <p className="text-gray-600 text-sm">Pending Payments</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-red-600">-2%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{analytics.failedPayments}</h3>
          <p className="text-gray-600 text-sm">Failed Payments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search payments by transaction ID, customer, or worker..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Transaction ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Worker</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Method</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <DollarSign className="w-12 h-12 text-gray-400 mb-3" />
                          <p className="text-gray-600 font-medium">No payments found</p>
                          <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search term</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment) => (
                      <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-mono text-sm text-gray-900">
                            #{payment.payment?.paymentId?.slice(-8) || payment._id.slice(-8)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{payment.customerId?.name}</p>
                              <p className="text-sm text-gray-500">{payment.customerId?.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{payment.workerId?.name}</p>
                              <p className="text-sm text-gray-500">{payment.workerId?.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-green-600">
                            {formatCurrency(payment.payment?.amount || payment.price)}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {payment.payment?.paymentType || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.payment?.status)}`}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(payment.payment?.status)}
                              <span>{payment.payment?.status}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {payment.payment?.transactionDate ?
                            formatDate(payment.payment.transactionDate) :
                            formatDate(payment.createdAt)
                          }
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowPaymentModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
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

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-700">
                Showing page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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