import React, { useState, useEffect } from 'react';
import {
  Calendar, Search, Filter, Eye, CheckCircle, XCircle,
  Clock, AlertCircle, DollarSign, User, Phone, Mail,
  ChevronLeft, ChevronRight, Download, MapPin
} from 'lucide-react';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const statuses = [
    { value: 'ALL', label: 'All Bookings' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'DECLINED', label: 'Declined' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  // Generate dummy data
  const generateDummyData = () => {
    const dummyBookings = [];
    const names = ['John Doe', 'Alice Smith', 'Bob Johnson', 'Emma Wilson', 'Mike Brown', 'Sarah Davis', 'Tom Wilson', 'Lisa Anderson'];
    const services = ['AC Repair', 'Plumbing', 'Electrical', 'Carpentry', 'Cleaning', 'Painting', 'Appliance Repair'];

    for (let i = 1; i <= 25; i++) {
      const customerName = names[Math.floor(Math.random() * names.length)];
      const workerName = names[Math.floor(Math.random() * names.length)];
      const status = statuses[Math.floor(Math.random() * (statuses.length - 1)) + 1].value;

      dummyBookings.push({
        _id: `booking_${i}_${Date.now()}`,
        customerId: {
          name: customerName,
          phone: `+91 ${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          email: `${customerName.toLowerCase().replace(' ', '.')}@gmail.com`
        },
        workerId: {
          name: workerName,
          phone: `+91 ${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          email: `${workerName.toLowerCase().replace(' ', '.')}@gmail.com`
        },
        bookingDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        bookingTime: `${Math.floor(9 + Math.random() * 8)}:${Math.random() > 0.5 ? '30' : '00'} ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
        price: Math.floor(500 + Math.random() * 2000),
        status: status,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        payment: {
          status: Math.random() > 0.3 ? 'COMPLETED' : 'PENDING',
          paymentType: Math.random() > 0.5 ? 'ONLINE' : 'CASH',
          transactionId: Math.random() > 0.5 ? `txn_${Math.random().toString(36).substr(2, 9)}` : null,
          transactionDate: Math.random() > 0.5 ? new Date().toISOString() : null
        },
        serviceType: services[Math.floor(Math.random() * services.length)],
        cancellationReason: status === 'CANCELLED' ? 'Customer changed plans' : null,
        declineReason: status === 'DECLINED' ? 'Worker unavailable' : null,
        review: Math.random() > 0.7 ? {
          rating: Math.floor(1 + Math.random() * 5),
          comment: Math.random() > 0.5 ? 'Great service! Highly recommended.' : null
        } : null
      });
    }

    return dummyBookings;
  };

  useEffect(() => {
    fetchBookings();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      let allBookings = generateDummyData();

      // Apply filters
      if (statusFilter !== 'ALL') {
        allBookings = allBookings.filter(booking => booking.status === statusFilter);
      }

      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        allBookings = allBookings.filter(booking =>
          booking.customerId.name.toLowerCase().includes(term) ||
          booking.workerId.name.toLowerCase().includes(term) ||
          booking._id.toLowerCase().includes(term) ||
          booking.customerId.phone.includes(term) ||
          booking.workerId.phone.includes(term)
        );
      }

      // Simulate pagination
      const startIndex = (currentPage - 1) * 10;
      const endIndex = startIndex + 10;
      const paginatedBookings = allBookings.slice(startIndex, endIndex);

      setBookings(paginatedBookings);
      setTotalPages(Math.ceil(allBookings.length / 10));

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
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'ACCEPTED': return <CheckCircle className="w-4 h-4" />;
      case 'DECLINED': return <XCircle className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const BookingModal = () => {
    if (!selectedBooking) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Booking Details</h2>
            <button
              onClick={() => setShowBookingModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Booking Status */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Booking #{selectedBooking._id.slice(-8)}</h3>
                  <p className="text-sm text-gray-600">
                    Created on {formatDate(selectedBooking.createdAt)}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedBooking.status)}`}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(selectedBooking.status)}
                    <span>{selectedBooking.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer & Worker Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Customer</h4>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedBooking.customerId?.name}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-600">{selectedBooking.customerId?.phone}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-600">{selectedBooking.customerId?.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Worker */}
              <div className="border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Worker</h4>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedBooking.workerId?.name}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-600">{selectedBooking.workerId?.phone}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-600">{selectedBooking.workerId?.email}</span>
                      </div>
                    </div>
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
                  <p className="font-medium">{formatDate(selectedBooking.bookingDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Service Time</p>
                  <p className="font-medium">{formatTime(selectedBooking.bookingTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Service Price</p>
                  <p className="font-medium text-green-600">{formatCurrency(selectedBooking.price)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Service Type</p>
                  <p className="font-medium">{selectedBooking.serviceType}</p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {selectedBooking.payment && (
              <div className="border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Payment Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <div className="flex items-center space-x-2">
                      {selectedBooking.payment.status === 'COMPLETED' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-orange-500" />
                      )}
                      <span className={`font-medium ${selectedBooking.payment.status === 'COMPLETED' ? 'text-green-600' : 'text-orange-600'
                        }`}>
                        {selectedBooking.payment.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-medium">{selectedBooking.payment.paymentType || 'N/A'}</p>
                  </div>
                  {selectedBooking.payment.transactionId && (
                    <div>
                      <p className="text-sm text-gray-600">Transaction ID</p>
                      <p className="font-medium font-mono text-sm">{selectedBooking.payment.transactionId}</p>
                    </div>
                  )}
                  {selectedBooking.payment.transactionDate && (
                    <div>
                      <p className="text-sm text-gray-600">Transaction Date</p>
                      <p className="font-medium">{formatDate(selectedBooking.payment.transactionDate)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Review */}
            {selectedBooking.review && (
              <div className="border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Customer Review</h4>
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-4 h-4 ${i < selectedBooking.review.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                      >
                        ★
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{selectedBooking.review.rating}/5</span>
                </div>
                {selectedBooking.review.comment && (
                  <p className="text-gray-700">{selectedBooking.review.comment}</p>
                )}
              </div>
            )}

            {/* Cancellation/Decline Reason */}
            {(selectedBooking.cancellationReason || selectedBooking.declineReason) && (
              <div className="border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Reason</h4>
                <p className="text-gray-700">
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600">Monitor and manage all platform bookings</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
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
                placeholder="Search bookings by ID, customer, or worker..."
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

      {/* Bookings Table */}
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
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Booking ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Worker</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Service Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-mono text-sm text-gray-900">#{booking._id.slice(-8)}</p>
                        <p className="text-xs text-gray-500">{formatDate(booking.createdAt)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{booking.customerId?.name}</p>
                            <p className="text-sm text-gray-500">{booking.customerId?.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{booking.workerId?.name}</p>
                            <p className="text-sm text-gray-500">{booking.workerId?.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900">{formatDate(booking.bookingDate)}</p>
                          <p className="text-gray-500">{formatTime(booking.bookingTime)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-green-600">{formatCurrency(booking.price)}</p>
                        <p className="text-xs text-gray-500">
                          {booking.payment?.status === 'COMPLETED' ? 'Paid' : 'Pending'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(booking.status)}
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
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
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

      {showBookingModal && <BookingModal />}
    </div>
  );
};

export default AdminBookings;