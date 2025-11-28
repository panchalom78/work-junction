
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Calendar, Search, Filter, Eye, CheckCircle, XCircle,
  Clock, AlertCircle, IndianRupee, User, Phone, Mail,
  ChevronLeft, ChevronRight, Download, MapPin,
  MoreVertical, ArrowUpDown, RefreshCw, BarChart3,
  FileText, TrendingUp, Shield, Package
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [servicesMap, setServicesMap] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    revenue: 0
  });
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  const statuses = [
    { value: 'ALL', label: 'All Bookings', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    { value: 'PENDING', label: 'Pending', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { value: 'ACCEPTED', label: 'Accepted', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'DECLINED', label: 'Declined', color: 'bg-red-100 text-red-800 border-red-200' },
    { value: 'COMPLETED', label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'bg-gray-100 text-gray-800 border-gray-200' }
  ];

  // Enhanced status configuration
  const statusConfig = {
    PENDING: {
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: Clock,
      bgGradient: 'from-orange-50 to-orange-100',
      textColor: 'text-orange-700'
    },
    ACCEPTED: {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: CheckCircle,
      bgGradient: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-700'
    },
    DECLINED: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: XCircle,
      bgGradient: 'from-red-50 to-red-100',
      textColor: 'text-red-700'
    },
    COMPLETED: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle,
      bgGradient: 'from-green-50 to-green-100',
      textColor: 'text-green-700'
    },
    CANCELLED: {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: XCircle,
      bgGradient: 'from-gray-50 to-gray-100',
      textColor: 'text-gray-700'
    }
  };

  // Fetch services and stats on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      await Promise.all([fetchServices(), fetchStats()]);
    };
    fetchInitialData();
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch when filters change; reset page to 1 to avoid empty pages
  useEffect(() => {
    if (currentPage === 1) {
      fetchBookings();
    } else {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm, statusFilter, sortConfig]);

  // Fetch on page change
  useEffect(() => {
    fetchBookings();
  }, [currentPage]);

  const fetchServices = async () => {
    try {
      const res = await axiosInstance.get('/api/admin/skills-services');
      const services = res.data?.data?.services || [];
      const map = services.reduce((acc, s) => {
        if (s._id && s.name) acc[s._id] = s.name;
        return acc;
      }, {});
      setServicesMap(map);
    } catch (e) {
      console.error('Error fetching services:', e);
      toast.error('Failed to load services');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/bookings/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setSearchLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
        ...(debouncedSearchTerm && { search: debouncedSearchTerm.trim() })
      });

      const response = await axiosInstance.get(`/api/admin/bookings?${params}`);
      
      if (response.data.success) {
        setBookings(response.data.data.bookings);
        setTotalPages(response.data.data.pagination.pages);
      } else {
        throw new Error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getStatusConfig = (status) => {
    return statusConfig[status] || statusConfig.PENDING;
  };

  // Enhanced Stats Cards Component
  const StatsCards = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[
        {
          label: 'Total Bookings',
          value: stats.total,
          icon: Calendar,
          color: 'from-blue-500 to-blue-600',
          change: '+12%'
        },
        {
          label: 'Pending',
          value: stats.pending,
          icon: Clock,
          color: 'from-orange-500 to-orange-600',
          change: '+5%'
        },
        {
          label: 'Completed',
          value: stats.completed,
          icon: CheckCircle,
          color: 'from-green-500 to-green-600',
          change: '+18%'
        },
        {
          label: 'Revenue',
          value: formatCurrency(stats.revenue),
          icon: IndianRupee,
          color: 'from-purple-500 to-purple-600',
          change: '+23%'
        }
      ].map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-600 text-sm">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );

  // Enhanced Mobile Booking Card Component
  const MobileBookingCard = ({ booking }) => {
    const statusConfig = getStatusConfig(booking.status);
    const StatusIcon = statusConfig.icon;

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4 hover:shadow-md transition-all duration-300 group">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-sm text-gray-900 font-semibold">#{booking._id.slice(-8)}</p>
            <p className="text-xs text-gray-500">{formatDate(booking.createdAt)}</p>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
            <div className="flex items-center space-x-2">
              <StatusIcon className="w-3 h-3" />
              <span>{booking.status}</span>
            </div>
          </div>
        </div>

        {/* Customer & Worker */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-600">Customer</p>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 text-sm truncate">{booking.customerId?.name}</p>
                <p className="text-xs text-gray-500 truncate">{booking.customerId?.phone}</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-600">Worker</p>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 text-sm truncate">{booking.workerId?.name}</p>
                <p className="text-xs text-gray-500 truncate">{booking.workerId?.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Service Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-600">Date & Time</p>
            <p className="font-semibold text-gray-900 text-sm">{formatDate(booking.bookingDate)}</p>
            <p className="text-xs text-gray-500">{formatTime(booking.bookingTime)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-600">Amount</p>
            <p className="font-semibold text-green-600 text-sm">{formatCurrency(booking.price)}</p>
            <div className={`text-xs px-2 py-1 rounded-full w-fit ${
              booking.payment?.status === 'COMPLETED' 
                ? 'bg-green-50 text-green-700' 
                : 'bg-orange-50 text-orange-700'
            }`}>
              {booking.payment?.status === 'COMPLETED' ? 'Paid' : 'Pending'}
            </div>
          </div>
        </div>

        {/* Service Type */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-600 mb-1">Service</p>
          <p className="font-medium text-gray-900 text-sm">{servicesMap[booking.serviceId] || 'N/A'}</p>
        </div>

        {/* Action */}
        <div className="flex justify-end pt-3 border-t border-gray-100">
          <button
            onClick={() => {
              setSelectedBooking(booking);
              setShowBookingModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:shadow-lg"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </button>
        </div>
      </div>
    );
  };

  // Enhanced Booking Modal Component
  const BookingModal = () => {
    if (!selectedBooking) return null;

    const statusConfig = getStatusConfig(selectedBooking.status);
    const StatusIcon = statusConfig.icon;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto transform animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
                <p className="text-sm text-gray-600">#{selectedBooking._id.slice(-8)}</p>
              </div>
            </div>
            <button
              onClick={() => setShowBookingModal(false)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
            >
              <XCircle className="w-6 h-6 text-gray-400 hover:text-gray-600" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Status Card */}
            <div className={`bg-gradient-to-r ${statusConfig.bgGradient} rounded-xl p-4 border ${statusConfig.color}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Booking Status</h3>
                  <p className="text-sm text-gray-600">
                    Created on {formatDate(selectedBooking.createdAt)}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-semibold border ${statusConfig.color}`}>
                  <div className="flex items-center space-x-2">
                    <StatusIcon className="w-4 h-4" />
                    <span>{selectedBooking.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer & Worker Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Card */}
              <div className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow duration-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Customer Information
                </h4>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-lg truncate">{selectedBooking.customerId?.name}</p>
                    <div className="space-y-1 mt-2">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 truncate">{selectedBooking.customerId?.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 truncate">{selectedBooking.customerId?.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Worker Card */}
              <div className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow duration-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-green-600" />
                  Worker Information
                </h4>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-lg truncate">{selectedBooking.workerId?.name}</p>
                    <div className="space-y-1 mt-2">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 truncate">{selectedBooking.workerId?.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600 truncate">{selectedBooking.workerId?.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow duration-200">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2 text-purple-600" />
                Service Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-600">Service Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(selectedBooking.bookingDate)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-600">Service Time</p>
                  <p className="font-semibold text-gray-900">{formatTime(selectedBooking.bookingTime)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-600">Service Price</p>
                  <p className="font-semibold text-green-600 text-lg">{formatCurrency(selectedBooking.price)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-600">Service Type</p>
                  <p className="font-semibold text-gray-900">{servicesMap[selectedBooking.serviceId] || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {selectedBooking.payment && (
              <div className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow duration-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                  <IndianRupee className="w-5 h-5 mr-2 text-green-600" />
                  Payment Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-600">Payment Status</p>
                    <div className="flex items-center space-x-2">
                      {selectedBooking.payment.status === 'COMPLETED' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Clock className="w-5 h-5 text-orange-500" />
                      )}
                      <span className={`font-semibold ${selectedBooking.payment.status === 'COMPLETED' ? 'text-green-600' : 'text-orange-600'}`}>
                        {selectedBooking.payment.status}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-600">Payment Method</p>
                    <p className="font-semibold text-gray-900">{selectedBooking.payment.paymentType || 'N/A'}</p>
                  </div>
                  {selectedBooking.payment.transactionId && (
                    <div className="sm:col-span-2 space-y-1">
                      <p className="text-sm font-semibold text-gray-600">Transaction ID</p>
                      <p className="font-mono text-sm break-all bg-gray-50 p-2 rounded-lg">{selectedBooking.payment.transactionId}</p>
                    </div>
                  )}
                  {selectedBooking.payment.transactionDate && (
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-gray-600">Transaction Date</p>
                      <p className="font-semibold text-gray-900">{formatDate(selectedBooking.payment.transactionDate)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Review */}
            {selectedBooking.review && (
              <div className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow duration-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-yellow-600" />
                  Customer Review
                </h4>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-5 h-5 ${i < selectedBooking.review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </div>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-600">{selectedBooking.review.rating}/5</span>
                </div>
                {selectedBooking.review.comment && (
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedBooking.review.comment}</p>
                )}
              </div>
            )}

            {/* Cancellation/Decline Reason */}
            {(selectedBooking.cancellationReason || selectedBooking.declineReason) && (
              <div className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow duration-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                  Reason
                </h4>
                <p className="text-gray-700 bg-red-50 p-3 rounded-lg">
                  {selectedBooking.cancellationReason || selectedBooking.declineReason}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Memoized empty state
  const emptyState = useMemo(() => (
    <div className="flex flex-col items-center justify-center py-12">
      <Calendar className="w-16 h-16 text-gray-400 mb-4" />
      <p className="text-lg font-semibold text-gray-600 mb-2">No bookings found</p>
      <p className="text-sm text-gray-500 text-center max-w-md">
        {searchTerm || statusFilter !== 'ALL' 
          ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
          : 'There are no bookings in the system yet.'}
      </p>
    </div>
  ), [searchTerm, statusFilter]);

  // Memoized loading state
  const loadingState = useMemo(() => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-600 text-sm">Loading bookings...</p>
    </div>
  ), []);

  return (
    <div className="min-h-screen bg-gray-50/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Booking Management
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Monitor and manage all platform bookings with real-time insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchBookings}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Mobile Filter Toggle */}
        <div className="sm:hidden">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">Filters & Search</span>
            </div>
            <ArrowUpDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showMobileFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Enhanced Filters */}
        <div className={`bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 transition-all duration-300 ${showMobileFilters ? 'block' : 'hidden sm:block'}`}>
          <div className="flex flex-col xl:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Search Bookings
              </label>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by booking ID, customer, worker, or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base transition-all duration-200"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Filter by Status
              </label>
              <div className="flex items-center space-x-3">
                <Filter className="w-5 h-5 text-gray-400 hidden sm:block" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white"
                >
                  {statuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bookings Content */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {loading ? loadingState : bookings.length === 0 ? emptyState : (
            <>
              {/* Mobile View */}
              <div className="sm:hidden">
                <div className="p-4 space-y-4">
                  {bookings.map((booking) => (
                    <MobileBookingCard key={booking._id} booking={booking} />
                  ))}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th 
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center space-x-2">
                          <span>Booking ID</span>
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Worker
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={() => handleSort('bookingDate')}
                      >
                        <div className="flex items-center space-x-2">
                          <span>Date & Time</span>
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={() => handleSort('price')}
                      >
                        <div className="flex items-center space-x-2">
                          <span>Amount</span>
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bookings.map((booking) => {
                      const statusConfig = getStatusConfig(booking.status);
                      const StatusIcon = statusConfig.icon;

                      return (
                        <tr key={booking._id} className="hover:bg-gray-50 transition-colors duration-200 group">
                          <td className="px-6 py-4">
                            <p className="font-mono text-sm text-gray-900 font-semibold">#{booking._id.slice(-8)}</p>
                            <p className="text-xs text-gray-500">{formatDate(booking.createdAt)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 text-sm truncate">{booking.customerId?.name}</p>
                                <p className="text-xs text-gray-500 truncate">{booking.customerId?.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 text-sm truncate">{booking.workerId?.name}</p>
                                <p className="text-xs text-gray-500 truncate">{booking.workerId?.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="text-gray-900 font-semibold">{formatDate(booking.bookingDate)}</p>
                              <p className="text-gray-500 text-xs">{formatTime(booking.bookingTime)}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-green-600 text-sm">{formatCurrency(booking.price)}</p>
                            <div className={`text-xs px-2 py-1 rounded-full w-fit mt-1 ${
                              booking.payment?.status === 'COMPLETED' 
                                ? 'bg-green-50 text-green-700' 
                                : 'bg-orange-50 text-orange-700'
                            }`}>
                              {booking.payment?.status === 'COMPLETED' ? 'Paid' : 'Pending'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`px-4 py-2 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
                              <div className="flex items-center space-x-2">
                                <StatusIcon className="w-3 h-3" />
                                <span>{booking.status}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowBookingModal(true);
                              }}
                              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:shadow-lg"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Enhanced Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200 gap-4">
                <p className="text-sm text-gray-700 font-medium">
                  Showing page {currentPage} of {totalPages} • {bookings.length} bookings
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-3 rounded-xl border border-gray-300 hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                              : 'text-gray-700 hover:bg-white hover:shadow-md'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    {totalPages > 5 && (
                      <span className="px-3 text-gray-500 font-medium">...</span>
                    )}
                  </div>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-3 rounded-xl border border-gray-300 hover:bg-white hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {showBookingModal && <BookingModal />}
      </div>
    </div>
  );
};

export default AdminBookings;
