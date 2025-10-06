import React, { useState } from 'react';
import { Calendar, Clock, Plus, Edit3 } from 'lucide-react';
import AvailabilityModal from './modals/AvailabilityModal';

const AvailabilityManagement = ({ 
  availabilityStatus, 
  onSetAvailabilityStatus 
}) => {
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [availability, setAvailability] = useState({
    weeklySlots: [
      { id: 1, day: 'monday', startTime: '09:00', endTime: '17:00' },
      { id: 2, day: 'tuesday', startTime: '09:00', endTime: '17:00' },
      { id: 3, day: 'wednesday', startTime: '09:00', endTime: '17:00' },
      { id: 4, day: 'thursday', startTime: '09:00', endTime: '17:00' },
      { id: 5, day: 'friday', startTime: '09:00', endTime: '17:00' }
    ],
    customSlots: [
      { id: 1, date: '2024-01-25', startTime: '10:00', endTime: '14:00' }
    ]
  });

  const statusOptions = [
    { value: 'available', label: '✅ Available', color: 'success', description: 'Accepting new bookings' },
    { value: 'busy', label: '🔄 Busy', color: 'warning', description: 'Limited availability' },
    { value: 'off-duty', label: '⛔ Off Duty', color: 'danger', description: 'Not accepting bookings' }
  ];

  const handleUpdateAvailability = (newAvailability) => {
    setAvailability(newAvailability);
  };

  return (
    <div className="space-y-6" style={{ backgroundColor: 'var(--bg-light)', color: 'var(--text-color)' }}>
      <div className="flex justify-between items-center" style={{ padding: '1rem' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-color)', margin: '0 0 0.25rem 0' }}>Availability Management</h2>
          <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-muted)', margin: '0' }}>Set your working hours and availability status</p>
        </div>
        <button
          onClick={() => setShowAvailabilityModal(true)}
          style={{ background: 'var(--primary-gradient)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-weight-medium)', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all var(--transition-normal)' }}
          onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(135deg, #6D28D9 0%, #A855F7 100%)'}
          onMouseOut={e => e.currentTarget.style.background = 'var(--primary-gradient)'}
        >
          <Edit3 className="w-5 h-5" />
          <span>Manage Schedule</span>
        </button>
      </div>

      {/* Current Status */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100" style={{ backgroundColor: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-color)', marginBottom: '1rem' }}>Current Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statusOptions.map((status) => (
            <button
              key={status.value}
              onClick={() => onSetAvailabilityStatus(status.value)}
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '2px solid',
                borderColor: availabilityStatus === status.value ? `var(--${status.color}-color)` : 'var(--border-color)',
                backgroundColor: availabilityStatus === status.value ? `var(--${status.color}-light)` : 'var(--surface-primary)',
                textAlign: 'left',
                transition: 'all var(--transition-normal)',
                boxShadow: availabilityStatus === status.value ? 'var(--shadow-sm)' : 'none'
              }}
              onMouseOver={e => { if (availabilityStatus !== status.value) e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'; }}
              onMouseOut={e => { if (availabilityStatus !== status.value) e.currentTarget.style.backgroundColor = 'var(--surface-primary)'; }}
            >
              <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-color)', marginBottom: '0.25rem' }}>{status.label}</div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>{status.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Schedule */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100" style={{ backgroundColor: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 flex items-center" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-color)' }}>
              <Calendar className="w-5 h-5 mr-2 text-blue-600" style={{ color: 'var(--info-color)' }} />
              Weekly Schedule
            </h4>
            <span style={{ backgroundColor: 'var(--info-light)', color: 'var(--info-color)', fontSize: 'var(--font-size-sm)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-full)', display: 'inline-block' }}>
              {availability.weeklySlots.length} days
            </span>
          </div>
          <div className="space-y-2">
            {availability.weeklySlots.slice(0, 3).map(slot => (
              <div key={slot.id} className="flex justify-between items-center py-2" style={{ padding: '0.5rem 0' }}>
                <span style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-color)', textTransform: 'capitalize' }}>{slot.day}</span>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>{slot.startTime} - {slot.endTime}</span>
              </div>
            ))}
            {availability.weeklySlots.length > 3 && (
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', textAlign: 'center' }}>
                +{availability.weeklySlots.length - 3} more days
              </p>
            )}
          </div>
        </div>

        {/* Special Dates */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100" style={{ backgroundColor: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 flex items-center" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-color)' }}>
              <Clock className="w-5 h-5 mr-2 text-green-600" style={{ color: 'var(--success-color)' }} />
              Special Dates
            </h4>
            <span style={{ backgroundColor: 'var(--success-light)', color: 'var(--success-color)', fontSize: 'var(--font-size-sm)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-full)', display: 'inline-block' }}>
              {availability.customSlots.length} dates
            </span>
          </div>
          <div className="space-y-2">
            {availability.customSlots.slice(0, 3).map(slot => (
              <div key={slot.id} className="py-2" style={{ padding: '0.5rem 0' }}>
                <div style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-color)' }}>
                  {new Date(slot.date).toLocaleDateString('en-IN', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>{slot.startTime} - {slot.endTime}</div>
              </div>
            ))}
            {availability.customSlots.length > 3 && (
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', textAlign: 'center' }}>
                +{availability.customSlots.length - 3} more dates
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Slot */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6" style={{ backgroundColor: 'var(--warning-light)', border: '1px solid var(--warning-200)', borderRadius: 'var(--radius-xl)', padding: '1.5rem' }}>
        <div className="flex items-center justify-between">
          <div>
            <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--warning-color)', marginBottom: '0.5rem' }}>Emergency Slot</h4>
            <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--warning-color)' }}>
              Create an immediate availability slot for urgent bookings. This will be highlighted to customers.
            </p>
          </div>
          <button style={{ background: 'var(--warning-color)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-weight-medium)', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all var(--transition-normal)' }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--warning-hover)'}
            onMouseOut={e => e.currentTarget.style.background = 'var(--warning-color)'}
            className="flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Emergency Slot</span>
          </button>
        </div>
      </div>

      {/* Availability Modal */}
      {showAvailabilityModal && (
        <AvailabilityModal
          availability={availability}
          onUpdateAvailability={handleUpdateAvailability}
          onClose={() => setShowAvailabilityModal(false)}
        />
      )}
    </div>
  );
};

export default AvailabilityManagement;