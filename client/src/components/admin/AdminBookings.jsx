import React, { useState, useEffect } from 'react';
import {
  Calendar, Search, Filter, Eye, CheckCircle, XCircle,
  Clock, AlertCircle, DollarSign, User, Phone, Mail,
  ChevronLeft, ChevronRight, Download, MapPin,
  MoreVertical, ArrowUpDown
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const statuses = [
    { value: 'ALL', label: 'All Bookings' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'DECLINED', label: 'Declined' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  useEffect(() => {
    fetchBookings();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await axiosInstance.get(`/api/admin/bookings?${params}`);

      if (response.data.success) {
        setBookings(response.data.data.bookings);
        setTotalPages(response.data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
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

  const formatTime = (timeString) => {
    return timeString;
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
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DECLINED': return 'bg-red-100 text-red-800 border-red-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-3 h-3" />;
      case 'ACCEPTED': return <CheckCircle className="w-3 h-3" />;
      case 'DECLINED': return <XCircle className="w-3 h-3" />;
      case 'COMPLETED': return <CheckCircle className="w-3 h-3" />;
      case 'CANCELLED': return <XCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  // Mobile Booking Card Component
  const MobileBookingCard = ({ booking }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs text-gray-900 font-medium">#{booking._id.slice(-8)}</p>
          <p className="text-xs text-gray-500">{formatDate(booking.createdAt)}</p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
          <div className="flex items-center space-x-1">
            {getStatusIcon(booking.status)}
            <span>{booking.status}</span>
          </div>
        </div>
      </div>

      {/* Customer & Worker */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-gray-600 mb-1">Customer</p>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-3 h-3 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 text-xs truncate">{booking.customerId?.name}</p>
              <p className="text-xs text-gray-500 truncate">{booking.customerId?.phone}</p>
            </div>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Worker</p>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-3 h-3 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 text-xs truncate">{booking.workerId?.name}</p>
              <p className="text-xs text-gray-500 truncate">{booking.workerId?.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Details */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-gray-600">Date & Time</p>
          <p className="font-medium text-gray-900 text-xs">{formatDate(booking.bookingDate)}</p>
          <p className="text-xs text-gray-500">{formatTime(booking.bookingTime)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Amount</p>
          <p className="font-medium text-green-600 text-xs">{formatCurrency(booking.price)}</p>
          <p className="text-xs text-gray-500">
            {booking.payment?.status === 'COMPLETED' ? 'Paid' : 'Pending'}
          </p>
        </div>
      </div>

      {/* Action */}
      <div className="flex justify-end pt-2 border-t border-gray-100">
        <button
          onClick={() => {
            setSelectedBooking(booking);
            setShowBookingModal(true);
          }}
          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Eye className="w-3 h-3" />
          <span>View Details</span>
        </button>
      </div>
    </div>
  );

  const BookingModal = () => {
    if (!selectedBooking) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 max-w-4xl w-full max-h-[95vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-base sm:text-xl font-semibold text-gray-900">Booking Details</h2>
            <button
              onClick={() => setShowBookingModal(false)}
              className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="space-y-3 sm:space-y-6">
            {/* Booking Status */}
            <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm sm:text-lg font-semibold text-gray-900">Booking #{selectedBooking._id.slice(-8)}</h3>
                  <p className="text-xs text-gray-600">
                    Created on {formatDate(selectedBooking.createdAt)}
                  </p>
                </div>
                <div className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedBooking.status)}`}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(selectedBooking.status)}
                    <span>{selectedBooking.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer & Worker Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
              {/* Customer */}
              <div className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Customer</h4>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate text-sm sm:text-base">{selectedBooking.customerId?.name}</p>
                    <div className="flex flex-col space-y-1 mt-1">
                      <div className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className="text-xs sm:text-sm text-gray-600 truncate">{selectedBooking.customerId?.phone}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-xs sm:text-sm text-gray-600 truncate">{selectedBooking.customerId?.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Worker */}
              <div className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Worker</h4>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate text-sm sm:text-base">{selectedBooking.workerId?.name}</p>
                    <div className="flex flex-col space-y-1 mt-1">
                      <div className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className="text-xs sm:text-sm text-gray-600 truncate">{selectedBooking.workerId?.phone}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-xs sm:text-sm text-gray-600 truncate">{selectedBooking.workerId?.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Service Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs text-gray-600">Service Date</p>
                  <p className="font-medium text-sm sm:text-base">{formatDate(selectedBooking.bookingDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Service Time</p>
                  <p className="font-medium text-sm sm:text-base">{formatTime(selectedBooking.bookingTime)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Service Price</p>
                  <p className="font-medium text-sm sm:text-base text-green-600">{formatCurrency(selectedBooking.price)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Service Type</p>
                  <p className="font-medium text-sm sm:text-base">{selectedBooking.serviceType}</p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {selectedBooking.payment && (
              <div className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Payment Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Payment Status</p>
                    <div className="flex items-center space-x-2">
                      {selectedBooking.payment.status === 'COMPLETED' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-orange-500" />
                      )}
                      <span className={`font-medium text-sm sm:text-base ${selectedBooking.payment.status === 'COMPLETED' ? 'text-green-600' : 'text-orange-600'}`}>
                        {selectedBooking.payment.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Payment Method</p>
                    <p className="font-medium text-sm sm:text-base">{selectedBooking.payment.paymentType || 'N/A'}</p>
                  </div>
                  {selectedBooking.payment.transactionId && (
                    <div className="sm:col-span-2">
                      <p className="text-xs text-gray-600">Transaction ID</p>
                      <p className="font-medium font-mono text-xs break-all">{selectedBooking.payment.transactionId}</p>
                    </div>
                  )}
                  {selectedBooking.payment.transactionDate && (
                    <div>
                      <p className="text-xs text-gray-600">Transaction Date</p>
                      <p className="font-medium text-sm sm:text-base">{formatDate(selectedBooking.payment.transactionDate)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Review */}
            {selectedBooking.review && (
              <div className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Customer Review</h4>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${i < selectedBooking.review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </div>
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600">{selectedBooking.review.rating}/5</span>
                </div>
                {selectedBooking.review.comment && (
                  <p className="text-gray-700 text-sm sm:text-base">{selectedBooking.review.comment}</p>
                )}
              </div>
            )}

            {/* Cancellation/Decline Reason */}
            {(selectedBooking.cancellationReason || selectedBooking.declineReason) && (
              <div className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Reason</h4>
                <p className="text-gray-700 text-sm sm:text-base">
                  {selectedBooking.cancellationReason || selectedBooking.declineReason}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Monitor and manage all platform bookings</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="hidden sm:flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="sm:hidden">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters</span>
          </div>
          <ArrowUpDown className={`w-4 h-4 text-gray-400 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filters */}
      <div className={`bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 ${showMobileFilters ? 'block' : 'hidden sm:block'}`}>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings, customers, workers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400 hidden sm:block" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Content */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32 sm:h-64">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Mobile View */}
            <div className="sm:hidden">
              <div className="p-3 space-y-3">
                {bookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 font-medium">No bookings found</p>
                    <p className="text-xs text-gray-500 mt-1 text-center">Try adjusting your filters or search term</p>
                  </div>
                ) : (
                  bookings.map((booking) => (
                    <MobileBookingCard key={booking._id} booking={booking} />
                  ))
                )}
              </div>
            </div>

            {/* Desktop View */}
            <div className="hidden sm:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Booking</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Worker</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Date & Time</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <Calendar className="w-12 h-12 text-gray-400 mb-3" />
                            <p className="text-sm text-gray-600 font-medium">No bookings found</p>
                            <p className="text-xs text-gray-500 mt-1">Try adjusting your filters or search term</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      bookings.map((booking) => (
                        <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-mono text-sm text-gray-900 font-medium">#{booking._id.slice(-8)}</p>
                            <p className="text-xs text-gray-500">{formatDate(booking.createdAt)}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-white" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 text-sm truncate">{booking.customerId?.name}</p>
                                <p className="text-xs text-gray-500 truncate">{booking.customerId?.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-white" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 text-sm truncate">{booking.workerId?.name}</p>
                                <p className="text-xs text-gray-500 truncate">{booking.workerId?.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm">
                              <p className="text-gray-900 font-medium">{formatDate(booking.bookingDate)}</p>
                              <p className="text-gray-500 text-xs">{formatTime(booking.bookingTime)}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-green-600 text-sm">{formatCurrency(booking.price)}</p>
                            <p className="text-xs text-gray-500">
                              {booking.payment?.status === 'COMPLETED' ? 'Paid' : 'Pending'}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(booking.status)}
                                <span>{booking.status}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowBookingModal(true);
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
            </div>

            {/* Pagination */}
            {(bookings.length > 0) && (
              <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-4 py-3 bg-gray-50 border-t border-gray-200 gap-3">
                <p className="text-xs sm:text-sm text-gray-700">
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
                  <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showBookingModal && <BookingModal />}
    </div>
  );
};

export default AdminBookings;