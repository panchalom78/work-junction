import React, { useState } from 'react';
import { X, Plus, Trash2, Clock, Calendar } from 'lucide-react';

const AvailabilityModal = ({ 
  availability, 
  onUpdateAvailability, 
  onClose 
}) => {
  const [weeklySlots, setWeeklySlots] = useState(availability.weeklySlots || []);
  const [customSlots, setCustomSlots] = useState(availability.customSlots || []);
  const [newWeeklySlot, setNewWeeklySlot] = useState({
    day: 'monday',
    startTime: '09:00',
    endTime: '17:00'
  });
  const [newCustomSlot, setNewCustomSlot] = useState({
    date: '',
    startTime: '09:00',
    endTime: '17:00'
  });

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  const timeOptions = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const addWeeklySlot = () => {
    if (newWeeklySlot.startTime < newWeeklySlot.endTime) {
      setWeeklySlots([...weeklySlots, { ...newWeeklySlot, id: Date.now() }]);
      setNewWeeklySlot({
        day: 'monday',
        startTime: '09:00',
        endTime: '17:00'
      });
    }
  };

  const removeWeeklySlot = (id) => {
    setWeeklySlots(weeklySlots.filter(slot => slot.id !== id));
  };

  const addCustomSlot = () => {
    if (newCustomSlot.date && newCustomSlot.startTime < newCustomSlot.endTime) {
      setCustomSlots([...customSlots, { ...newCustomSlot, id: Date.now() }]);
      setNewCustomSlot({
        date: '',
        startTime: '09:00',
        endTime: '17:00'
      });
    }
  };

  const removeCustomSlot = (id) => {
    setCustomSlots(customSlots.filter(slot => slot.id !== id));
  };

  const handleSave = () => {
    onUpdateAvailability({
      weeklySlots,
      customSlots
    });
    onClose();
  };

  const TimeSlotCard = ({ slot, onRemove, type = 'weekly' }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200" style={{ backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '0.75rem' }}>
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)' }}>
          <Clock className="w-4 h-4 text-blue-600" style={{ color: 'var(--primary-color)' }} />
        </div>
        <div>
          <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)' }}>
            {type === 'weekly' 
              ? daysOfWeek.find(d => d.value === slot.day)?.label
              : new Date(slot.date).toLocaleDateString('en-IN', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })
            }
          </p>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
            {slot.startTime} - {slot.endTime}
          </p>
        </div>
      </div>
      <button
        onClick={() => onRemove(slot.id)}
        style={{ color: 'var(--danger-color)', transition: 'color var(--transition-normal)' }}
        onMouseOver={e => e.currentTarget.style.color = 'var(--danger-hover)'}
        onMouseOut={e => e.currentTarget.style.color = 'var(--danger-color)'}
        className="p-2"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="p-6 border-b border-gray-200" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-color)' }}>Manage Availability</h3>
            <button onClick={onClose} style={{ color: 'var(--text-muted)', transition: 'color var(--transition-normal)' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-color)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Set your regular working hours and special availability</p>
        </div>

        <div className="p-6 space-y-6" style={{ padding: '1.5rem' }}>
          {/* Weekly Availability */}
          <div>
            <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-color)', marginBottom: '1rem' }} className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" style={{ color: 'var(--primary-color)' }} />
              Weekly Schedule
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)', marginBottom: '0.5rem', display: 'block' }}>Day</label>
                <select
                  value={newWeeklySlot.day}
                  onChange={(e) => setNewWeeklySlot({ ...newWeeklySlot, day: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none', transition: 'border-color var(--transition-normal)' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  {daysOfWeek.map(day => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)', marginBottom: '0.5rem', display: 'block' }}>Start Time</label>
                <select
                  value={newWeeklySlot.startTime}
                  onChange={(e) => setNewWeeklySlot({ ...newWeeklySlot, startTime: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none', transition: 'border-color var(--transition-normal)' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  {timeOptions.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)', marginBottom: '0.5rem', display: 'block' }}>End Time</label>
                <select
                  value={newWeeklySlot.endTime}
                  onChange={(e) => setNewWeeklySlot({ ...newWeeklySlot, endTime: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none', transition: 'border-color var(--transition-normal)' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  {timeOptions.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={addWeeklySlot}
                  style={{ width: '100%', background: 'var(--primary-gradient)', color: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-weight-medium)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all var(--transition-normal)' }}
                  onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(135deg, #6D28D9 0%, #A855F7 100%)'}
                  onMouseOut={e => e.currentTarget.style.background = 'var(--primary-gradient)'}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {weeklySlots.map(slot => (
                <TimeSlotCard 
                  key={slot.id} 
                  slot={slot} 
                  onRemove={removeWeeklySlot}
                  type="weekly"
                />
              ))}
              {weeklySlots.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--surface-secondary)' }}>
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                  <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-muted)' }}>No weekly slots added</p>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-light)', marginTop: '0.25rem' }}>Add your regular working hours</p>
                </div>
              )}
            </div>
          </div>

          {/* Custom Availability */}
          <div>
            <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-color)', marginBottom: '1rem' }} className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-green-600" style={{ color: 'var(--success-color)' }} />
              Special Dates
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="md:col-span-2">
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)', marginBottom: '0.5rem', display: 'block' }}>Date</label>
                <input
                  type="date"
                  value={newCustomSlot.date}
                  onChange={(e) => setNewCustomSlot({ ...newCustomSlot, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none', transition: 'border-color var(--transition-normal)' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--success-color)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                />
              </div>
              <div>
                <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)', marginBottom: '0.5rem', display: 'block' }}>Start Time</label>
                <select
                  value={newCustomSlot.startTime}
                  onChange={(e) => setNewCustomSlot({ ...newCustomSlot, startTime: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none', transition: 'border-color var(--transition-normal)' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--success-color)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  {timeOptions.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={addCustomSlot}
                  style={{ width: '100%', background: 'var(--success-gradient)', color: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-weight-medium)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all var(--transition-normal)' }}
                  onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(135deg, #10B981 0%, #34D399 100%)'}
                  onMouseOut={e => e.currentTarget.style.background = 'var(--success-gradient)'}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {customSlots.map(slot => (
                <TimeSlotCard 
                  key={slot.id} 
                  slot={slot} 
                  onRemove={removeCustomSlot}
                  type="custom"
                />
              ))}
              {customSlots.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--surface-secondary)' }}>
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
                  <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-muted)' }}>No special dates added</p>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-light)', marginTop: '0.25rem' }}>Add availability for specific dates</p>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Slot */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4" style={{ backgroundColor: 'var(--warning-light)', border: '1px solid var(--warning-200)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--warning-color)', marginBottom: '0.5rem' }} className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-orange-600" style={{ color: 'var(--warning-color)' }} />
              Emergency Slot
            </h4>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--warning-color)', marginBottom: '1rem' }}>
              Create an emergency slot for urgent bookings. This will be visible to customers as available immediately.
            </p>
            <button style={{ background: 'var(--warning-color)', color: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-weight-medium)', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all var(--transition-normal)' }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--warning-hover)'}
              onMouseOut={e => e.currentTarget.style.background = 'var(--warning-color)'}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Emergency Slot</span>
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl" style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--surface-secondary)', borderBottomLeftRadius: 'var(--radius-xl)', borderBottomRightRadius: 'var(--radius-xl)' }}>
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              style={{ flex: '1', backgroundColor: 'var(--surface-primary)', color: 'var(--text-color)', border: '2px solid var(--border-color)', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-weight-semibold)', transition: 'all var(--transition-normal)' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--surface-primary)'}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{ flex: '1', background: 'var(--primary-gradient)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-weight-semibold)', transition: 'all var(--transition-normal)' }}
              onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(135deg, #6D28D9 0%, #A855F7 100%)'}
              onMouseOut={e => e.currentTarget.style.background = 'var(--primary-gradient)'}
            >
              Save Availability
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityModal;