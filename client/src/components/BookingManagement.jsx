import React from 'react';
import { Clock, CheckCircle, XCircle, MapPin, Calendar, Check, X } from 'lucide-react';

const BookingManagement = ({ bookings, onAcceptBooking, onDeclineBooking }) => {
  const getStatusCounts = () => {
    const pending = bookings.filter(b => b.status === 'pending').length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const declined = bookings.filter(b => b.status === 'declined').length;
    return { pending, confirmed, declined };
  };

  const statusCounts = getStatusCounts();

  const StatusColumn = ({ title, icon: Icon, count, bookings, status, color }) => (
    <div className="flex-1 min-w-0">
      <div className={`flex items-center justify-between p-4 border-b-4 border-${color}-500 bg-${color}-50 rounded-t-lg`}>
        <div className="flex items-center space-x-2">
          <Icon className={`w-5 h-5 text-${color}-600`} />
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <span className={`bg-${color}-100 text-${color}-800 text-sm px-3 py-1 rounded-full font-medium`}>
          {count}
        </span>
      </div>
      <div className="space-y-4 p-4">
        {bookings.filter(booking => booking.status === status).map(booking => (
          <BookingCard 
            key={booking.id} 
            booking={booking} 
            onAcceptBooking={onAcceptBooking}
            onDeclineBooking={onDeclineBooking}
            color={color}
          />
        ))}
        {bookings.filter(booking => booking.status === status).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No {title.toLowerCase()} bookings</p>
          </div>
        )}
      </div>
    </div>
  );

  const BookingCard = ({ booking, onAcceptBooking, onDeclineBooking, color }) => (
    <div className={`bg-white border border-${color}-200 rounded-lg p-4 hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-lg">{booking.customer}</h4>
          <p className="text-sm text-gray-600 mt-1">{booking.service}</p>
        </div>
        {booking.status === 'pending' && (
          <div className="flex space-x-1">
            <button
              onClick={() => onAcceptBooking(booking.id)}
              className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
              title="Accept Booking"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeclineBooking(booking.id)}
              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
              title="Decline Booking"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{booking.date}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="flex-1">{booking.address}</span>
        </div>
      </div>

      {booking.status !== 'pending' && (
        <div className={`mt-3 text-xs px-2 py-1 rounded-full bg-${color}-100 text-${color}-800 inline-block`}>
          {booking.status === 'confirmed' ? 'Confirmed' : 'Declined'}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
        <p className="text-gray-600 mt-1">Manage your incoming booking requests</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.confirmed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Declined</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.declined}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Booking Columns */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          <StatusColumn
            title="Pending"
            icon={Clock}
            count={statusCounts.pending}
            bookings={bookings}
            status="pending"
            color="yellow"
          />
          <StatusColumn
            title="Confirmed"
            icon={CheckCircle}
            count={statusCounts.confirmed}
            bookings={bookings}
            status="confirmed"
            color="green"
          />
          <StatusColumn
            title="Declined"
            icon={XCircle}
            count={statusCounts.declined}
            bookings={bookings}
            status="declined"
            color="red"
          />
        </div>
      </div>
    </div>
  );
};

export default BookingManagement;