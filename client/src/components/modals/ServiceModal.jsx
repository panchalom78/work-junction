import React from 'react';
import { X } from 'lucide-react';

const ServiceModal = ({ 
  editingService, 
  newService, 
  setNewService, 
  skills, 
  onAddService, 
  onClose 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
            <input
              type="text"
              value={newService.name}
              onChange={(e) => setNewService({ ...newService, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Tap Repair"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Skill Category</label>
            <select
              value={newService.skill}
              onChange={(e) => setNewService({ ...newService, skill: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a skill</option>
              {skills.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
            <input
              type="number"
              value={newService.price}
              onChange={(e) => setNewService({ ...newService, price: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
            <input
              type="text"
              value={newService.duration}
              onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 1 hour"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={newService.description}
              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the service..."
            />
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
              onClick={onAddService}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              {editingService ? 'Update Service' : 'Add Service'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;