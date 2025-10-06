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
    <div className="flex-1 min-w-0" style={{ backgroundColor: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
      <div className={`flex items-center justify-between p-4 border-b-4 rounded-t-lg`} style={{ borderBottomColor: `var(--${color}-color)`, backgroundColor: `var(--${color}-light)` }}>
        <div className="flex items-center space-x-2">
          <Icon className={`w-5 h-5 text-${color}-600`} style={{ color: `var(--${color}-color)` }} />
          <h3 className="font-semibold text-gray-900" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-color)' }}>{title}</h3>
        </div>
        <span className={`bg-${color}-100 text-${color}-800 text-sm px-3 py-1 rounded-full font-medium`} style={{ backgroundColor: `var(--${color}-light)`, color: `var(--${color}-color)`, fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
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
          <div className="text-center py-8 text-gray-500" style={{ color: 'var(--text-muted)' }}>
            <p>No {title.toLowerCase()} bookings</p>
          </div>
        )}
      </div>
    </div>
  );

  const BookingCard = ({ booking, onAcceptBooking, onDeclineBooking, color }) => (
    <div className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow`} style={{ backgroundColor: 'var(--surface-primary)', border: `1px solid var(--${color}-200)`, borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', transition: 'box-shadow var(--transition-normal)' }}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-lg" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-color)' }}>{booking.customer}</h4>
          <p className="text-sm text-gray-600 mt-1" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{booking.service}</p>
        </div>
        {booking.status === 'pending' && (
          <div className="flex space-x-1">
            <button
              onClick={() => onAcceptBooking(booking.id)}
              className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
              style={{ backgroundColor: 'var(--success-color)', color: 'white', padding: '0.5rem', borderRadius: 'var(--radius-md)', transition: 'background-color var(--transition-normal)' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--success-hover)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--success-color)'}
              title="Accept Booking"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeclineBooking(booking.id)}
              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
              style={{ backgroundColor: 'var(--danger-color)', color: 'white', padding: '0.5rem', borderRadius: 'var(--radius-md)', transition: 'background-color var(--transition-normal)' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--danger-hover)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--danger-color)'}
              title="Decline Booking"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-600" style={{ color: 'var(--text-muted)' }}>
          <Calendar className="w-4 h-4 mr-2" />
          <span style={{ fontSize: 'var(--font-size-sm)' }}>{booking.date}</span>
        </div>
        <div className="flex items-center text-gray-600" style={{ color: 'var(--text-muted)' }}>
          <MapPin className="w-4 h-4 mr-2" />
          <span className="flex-1" style={{ fontSize: 'var(--font-size-sm)' }}>{booking.address}</span>
        </div>
      </div>

      {booking.status !== 'pending' && (
        <div className={`mt-3 text-xs px-2 py-1 rounded-full bg-${color}-100 text-${color}-800 inline-block`} style={{ marginTop: '0.75rem', fontSize: 'var(--font-size-xs)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-full)', backgroundColor: `var(--${color}-light)`, color: `var(--${color}-color)` }}>
          {booking.status === 'confirmed' ? 'Confirmed' : 'Declined'}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6" style={{ backgroundColor: 'var(--bg-light)', color: 'var(--text-color)' }}>
      <div style={{ padding: '1rem' }}>
        <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-color)', margin: '0 0 0.25rem 0' }}>Booking Management</h2>
        <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-muted)', margin: '0' }}>Manage your incoming booking requests</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginBottom: '1.5rem' }}>
        <div className="bg-white rounded-lg p-4 border border-yellow-200" style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--warning-200)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-muted)' }}>Pending</p>
              <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-color)' }}>{statusCounts.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" style={{ color: 'var(--warning-color)' }} />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-green-200" style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--success-200)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-muted)' }}>Confirmed</p>
              <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-color)' }}>{statusCounts.confirmed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" style={{ color: 'var(--success-color)' }} />
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-red-200" style={{ backgroundColor: 'var(--surface-primary)', border: '1px solid var(--danger-200)', borderRadius: 'var(--radius-lg)', padding: '1rem' }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-muted)' }}>Declined</p>
              <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-color)' }}>{statusCounts.declined}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" style={{ color: 'var(--danger-color)' }} />
          </div>
        </div>
      </div>

      {/* Booking Columns */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" style={{ backgroundColor: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          <StatusColumn
            title="Pending"
            icon={Clock}
            count={statusCounts.pending}
            bookings={bookings}
            status="pending"
            color="warning"
          />
          <StatusColumn
            title="Confirmed"
            icon={CheckCircle}
            count={statusCounts.confirmed}
            bookings={bookings}
            status="confirmed"
            color="success"
          />
          <StatusColumn
            title="Declined"
            icon={XCircle}
            count={statusCounts.declined}
            bookings={bookings}
            status="declined"
            color="danger"
          />
        </div>
      </div>
    </div>
  );
};

export default BookingManagement;