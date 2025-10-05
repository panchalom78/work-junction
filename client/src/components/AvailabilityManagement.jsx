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
    { value: 'available', label: '✅ Available', color: 'green', description: 'Accepting new bookings' },
    { value: 'busy', label: '🔄 Busy', color: 'yellow', description: 'Limited availability' },
    { value: 'off-duty', label: '⛔ Off Duty', color: 'red', description: 'Not accepting bookings' }
  ];

  const handleUpdateAvailability = (newAvailability) => {
    setAvailability(newAvailability);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Availability Management</h2>
          <p className="text-gray-600 mt-1">Set your working hours and availability status</p>
        </div>
        <button
          onClick={() => setShowAvailabilityModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Edit3 className="w-5 h-5" />
          <span>Manage Schedule</span>
        </button>
      </div>

      {/* Current Status */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statusOptions.map((status) => (
            <button
              key={status.value}
              onClick={() => onSetAvailabilityStatus(status.value)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                availabilityStatus === status.value
                  ? `border-${status.color}-500 bg-${status.color}-50 shadow-sm`
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-semibold text-gray-900 mb-1">{status.label}</div>
              <div className="text-sm text-gray-600">{status.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Schedule */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Weekly Schedule
            </h4>
            <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
              {availability.weeklySlots.length} days
            </span>
          </div>
          <div className="space-y-2">
            {availability.weeklySlots.slice(0, 3).map(slot => (
              <div key={slot.id} className="flex justify-between items-center py-2">
                <span className="text-gray-700 capitalize">{slot.day}</span>
                <span className="text-sm text-gray-500">{slot.startTime} - {slot.endTime}</span>
              </div>
            ))}
            {availability.weeklySlots.length > 3 && (
              <p className="text-sm text-gray-500 text-center">
                +{availability.weeklySlots.length - 3} more days
              </p>
            )}
          </div>
        </div>

        {/* Special Dates */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-green-600" />
              Special Dates
            </h4>
            <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
              {availability.customSlots.length} dates
            </span>
          </div>
          <div className="space-y-2">
            {availability.customSlots.slice(0, 3).map(slot => (
              <div key={slot.id} className="py-2">
                <div className="text-gray-700">
                  {new Date(slot.date).toLocaleDateString('en-IN', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="text-sm text-gray-500">{slot.startTime} - {slot.endTime}</div>
              </div>
            ))}
            {availability.customSlots.length > 3 && (
              <p className="text-sm text-gray-500 text-center">
                +{availability.customSlots.length - 3} more dates
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Slot */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-orange-900 mb-2">Emergency Slot</h4>
            <p className="text-orange-700">
              Create an immediate availability slot for urgent bookings. This will be highlighted to customers.
            </p>
          </div>
          <button className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2">
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