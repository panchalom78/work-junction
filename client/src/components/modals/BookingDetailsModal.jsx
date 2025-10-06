import React, { useState } from 'react';
import { 
  X, 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  MessageCircle,
  Check,
  XCircle,
  AlertCircle,
  Star
} from 'lucide-react';

const BookingDetailsModal = ({ 
  booking, 
  onAccept, 
  onDecline, 
  onClose,
  onSendMessage 
}) => {
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineForm, setShowDeclineForm] = useState(false);

  const customerInfo = {
    name: booking.customer,
    phone: '+91 98765 43210',
    email: 'customer@example.com',
    joinDate: 'January 2024',
    totalBookings: 5,
    rating: 4.8
  };

  const serviceDetails = {
    duration: '2 hours',
    materials: 'Not included',
    location: booking.address,
    specialRequirements: 'Need service before 12 PM'
  };

  const handleDeclineWithReason = () => {
    onDecline(booking.id, declineReason);
    onClose();
  };

  const handleQuickDecline = () => {
    setShowDeclineForm(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="p-6 border-b border-gray-200" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-color)' }}>Booking Details</h3>
              <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Review booking information and take action</p>
            </div>
            <button onClick={onClose} style={{ color: 'var(--text-muted)', transition: 'color var(--transition-normal)' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-color)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6" style={{ padding: '1.5rem' }}>
          {/* Booking Status Alert */}
          <div className={`p-4 rounded-lg border ${
            booking.status === 'pending' 
              ? 'bg-warning-light border-warning-200' 
              : booking.status === 'confirmed'
              ? 'bg-success-light border-success-200'
              : 'bg-danger-light border-danger-200'
          }`} style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid' }}>
            <div className="flex items-center">
              <AlertCircle className={`w-5 h-5 ${
                booking.status === 'pending' 
                  ? 'text-warning-color' 
                  : booking.status === 'confirmed'
                  ? 'text-success-color'
                  : 'text-danger-color'
              } mr-3`} />
              <div>
                <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', 
                  color: booking.status === 'pending' ? 'var(--warning-color)' : booking.status === 'confirmed' ? 'var(--success-color)' : 'var(--danger-color)' }}>
                  {booking.status === 'pending' 
                    ? 'Booking Request Pending' 
                    : booking.status === 'confirmed'
                    ? 'Booking Confirmed'
                    : 'Booking Declined'
                  }
                </p>
                <p style={{ fontSize: 'var(--font-size-sm)', 
                  color: booking.status === 'pending' ? 'var(--warning-color)' : booking.status === 'confirmed' ? 'var(--success-color)' : 'var(--danger-color)', 
                  marginTop: '0.25rem' }}>
                  {booking.status === 'pending' 
                    ? 'Please accept or decline this booking request' 
                    : booking.status === 'confirmed'
                    ? 'This booking has been confirmed'
                    : 'This booking has been declined'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div>
            <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-color)', marginBottom: '1rem' }} className="flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" style={{ color: 'var(--primary-color)' }} />
              Customer Information
            </h4>
            <div className="bg-gray-50 rounded-lg p-4" style={{ backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-full)' }}>
                  <User className="w-6 h-6 text-blue-600" style={{ color: 'var(--primary-color)' }} />
                </div>
                <div className="flex-1">
                  <h5 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-color)' }}>{customerInfo.name}</h5>
                  <div className="flex items-center space-x-2 mt-1">
                    <Star className="w-4 h-4 text-yellow-500" style={{ color: 'var(--warning-color)' }} />
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>{customerInfo.rating} rating</span>
                    <span style={{ color: 'var(--text-light)' }}>•</span>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>{customerInfo.totalBookings} bookings</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-color)' }}>{customerInfo.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-color)' }}>{customerInfo.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-400" style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-color)' }}>Member since {customerInfo.joinDate}</span>
                </div>
                <button 
                  onClick={onSendMessage}
                  style={{ color: 'var(--info-color)', transition: 'color var(--transition-normal)' }}
                  onMouseOver={e => e.currentTarget.style.color = 'var(--info-hover)'}
                  onMouseOut={e => e.currentTarget.style.color = 'var(--info-color)'}
                  className="flex items-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span style={{ fontSize: 'var(--font-size-sm)' }}>Send Message</span>
                </button>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div>
            <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-color)', marginBottom: '1rem' }}>Service Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)', marginBottom: '0.25rem' }}>Service</label>
                  <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)' }}>{booking.service}</p>
                </div>
                <div>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)', marginBottom: '0.25rem' }}>Scheduled Date & Time</label>
                  <div className="flex items-center space-x-2 text-gray-900">
                    <Calendar className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-color)' }}>{booking.date}</span>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)', marginBottom: '0.25rem' }}>Estimated Duration</label>
                  <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-color)' }}>{serviceDetails.duration}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)', marginBottom: '0.25rem' }}>Location</label>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-color)' }}>{serviceDetails.location}</p>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)', marginBottom: '0.25rem' }}>Materials Required</label>
                  <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-color)' }}>{serviceDetails.materials}</p>
                </div>
                <div>
                  <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)', marginBottom: '0.25rem' }}>Special Requirements</label>
                  <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-color)' }}>{serviceDetails.specialRequirements}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Decline Reason Form */}
          {showDeclineForm && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4" style={{ backgroundColor: 'var(--danger-light)', border: '1px solid var(--danger-200)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
              <h5 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--danger-color)', marginBottom: '0.75rem' }}>Reason for Declining</h5>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Please provide a reason for declining this booking. This will be shared with the customer."
                rows="3"
                style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid var(--danger-300)', borderRadius: 'var(--radius-md)', outline: 'none', transition: 'border-color var(--transition-normal)' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--danger-color)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--danger-300)'}
              />
              <div className="flex space-x-3 mt-3">
                <button
                  onClick={() => setShowDeclineForm(false)}
                  style={{ flex: '1', backgroundColor: 'var(--surface-primary)', color: 'var(--text-color)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-weight-semibold)', transition: 'all var(--transition-normal)' }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--surface-primary)'}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeclineWithReason}
                  disabled={!declineReason.trim()}
                  style={{ flex: '1', backgroundColor: 'var(--danger-color)', color: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-weight-semibold)', transition: 'all var(--transition-normal)', opacity: declineReason.trim() ? '1' : '0.6', cursor: declineReason.trim() ? 'pointer' : 'not-allowed' }}
                  onMouseOver={e => { if (declineReason.trim()) e.currentTarget.style.backgroundColor = 'var(--danger-hover)'; }}
                  onMouseOut={e => { if (declineReason.trim()) e.currentTarget.style.backgroundColor = 'var(--danger-color)'; }}
                >
                  Confirm Decline
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {booking.status === 'pending' && !showDeclineForm && (
          <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl" style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--surface-secondary)', borderBottomLeftRadius: 'var(--radius-xl)', borderBottomRightRadius: 'var(--radius-xl)' }}>
            <div className="flex space-x-4">
              <button
                onClick={handleQuickDecline}
                style={{ flex: '1', backgroundColor: 'var(--surface-primary)', color: 'var(--danger-color)', border: '2px solid var(--danger-color)', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-weight-semibold)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all var(--transition-normal)' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--danger-light)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--surface-primary)'}
              >
                <XCircle className="w-5 h-5" />
                <span>Decline</span>
              </button>
              <button
                onClick={() => onAccept(booking.id)}
                style={{ flex: '1', background: 'var(--success-gradient)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-weight-semibold)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all var(--transition-normal)' }}
                onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(135deg, #10B981 0%, #34D399 100%)'}
                onMouseOut={e => e.currentTarget.style.background = 'var(--success-gradient)'}
              >
                <Check className="w-5 h-5" />
                <span>Accept Booking</span>
              </button>
            </div>
          </div>
        )}

        {booking.status === 'confirmed' && (
          <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl" style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--surface-secondary)', borderBottomLeftRadius: 'var(--radius-xl)', borderBottomRightRadius: 'var(--radius-xl)' }}>
            <div className="flex space-x-4">
              <button
                onClick={onSendMessage}
                style={{ flex: '1', backgroundColor: 'var(--surface-primary)', color: 'var(--info-color)', border: '2px solid var(--info-color)', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-weight-semibold)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all var(--transition-normal)' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--info-light)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--surface-primary)'}
              >
                <MessageCircle className="w-5 h-5" />
                <span>Message Customer</span>
              </button>
              <button
                onClick={onClose}
                style={{ flex: '1', background: 'var(--primary-gradient)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-weight-semibold)', transition: 'all var(--transition-normal)' }}
                onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(135deg, #6D28D9 0%, #A855F7 100%)'}
                onMouseOut={e => e.currentTarget.style.background = 'var(--primary-gradient)'}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDetailsModal;