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
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Clock className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">
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
          <p className="text-sm text-gray-600">
            {slot.startTime} - {slot.endTime}
          </p>
        </div>
      </div>
      <button
        onClick={() => onRemove(slot.id)}
        className="text-red-600 hover:text-red-800 transition-colors p-2"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Manage Availability</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-600 mt-1">Set your regular working hours and special availability</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Weekly Availability */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Weekly Schedule
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
                <select
                  value={newWeeklySlot.day}
                  onChange={(e) => setNewWeeklySlot({ ...newWeeklySlot, day: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {daysOfWeek.map(day => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <select
                  value={newWeeklySlot.startTime}
                  onChange={(e) => setNewWeeklySlot({ ...newWeeklySlot, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {timeOptions.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <select
                  value={newWeeklySlot.endTime}
                  onChange={(e) => setNewWeeklySlot({ ...newWeeklySlot, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {timeOptions.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={addWeeklySlot}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
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
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No weekly slots added</p>
                  <p className="text-sm text-gray-400 mt-1">Add your regular working hours</p>
                </div>
              )}
            </div>
          </div>

          {/* Custom Availability */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-green-600" />
              Special Dates
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={newCustomSlot.date}
                  onChange={(e) => setNewCustomSlot({ ...newCustomSlot, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <select
                  value={newCustomSlot.startTime}
                  onChange={(e) => setNewCustomSlot({ ...newCustomSlot, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {timeOptions.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={addCustomSlot}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
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
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No special dates added</p>
                  <p className="text-sm text-gray-400 mt-1">Add availability for specific dates</p>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Slot */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-orange-900 mb-2 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-orange-600" />
              Emergency Slot
            </h4>
            <p className="text-orange-700 text-sm mb-4">
              Create an emergency slot for urgent bookings. This will be visible to customers as available immediately.
            </p>
            <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create Emergency Slot</span>
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 bg-white text-gray-700 border-2 border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
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