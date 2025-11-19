import React, { useState, useEffect } from 'react';
import {
  User, Phone, Mail, MapPin, Shield, CheckCircle,
  XCircle, AlertCircle, Save, X, Trash2, Clock,
  Building, Navigation, Map
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

const EditAgentModal = ({ agent, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    isActive: true,
    address: {
      houseNo: '',
      street: '',
      area: '',
      city: '',
      state: '',
      pincode: ''
    },
    serviceAgentProfile: {
      assignedArea: '',
      isSuspended: false,
      suspendedUntil: '',
      suspensionReason: ''
    },
    serviceRadius: 10,
    status: 'PENDING'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name || '',
        email: agent.email || '',
        phone: agent.phone || '',
        isActive: agent.isActive !== false,
        address: {
          houseNo: agent.address?.houseNo || '',
          street: agent.address?.street || '',
          area: agent.address?.area || '',
          city: agent.address?.city || '',
          state: agent.address?.state || '',
          pincode: agent.address?.pincode || ''
        },
        serviceAgentProfile: {
          assignedArea: agent.serviceAgentProfile?.assignedArea || '',
          isSuspended: agent.serviceAgentProfile?.isSuspended || false,
          suspendedUntil: agent.serviceAgentProfile?.suspendedUntil || '',
          suspensionReason: agent.serviceAgentProfile?.suspensionReason || ''
        },
        serviceRadius: agent.serviceAgentData?.serviceRadius || 10,
        status: agent.serviceAgentData?.status || 'PENDING'
      });
    }
  }, [agent]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else if (name.startsWith('serviceAgentProfile.')) {
      const profileField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        serviceAgentProfile: {
          ...prev.serviceAgentProfile,
          [profileField]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

 // In your EditAgentModal component, update the handleSubmit function:

const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);

  try {
    // Prepare the data for API
    const updateData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      isActive: formData.isActive,
      address: formData.address,
      serviceAgentProfile: formData.serviceAgentProfile,
      serviceRadius: formData.serviceRadius,
      status: formData.status
    };

    const response = await axiosInstance.put(
      `/api/admin/service-agents/${agent._id}`,
      updateData
    );

    if (response.data.success) {
      toast.success('Agent updated successfully');
      onUpdate(response.data.data);
      onClose();
    }
  } catch (error) {
    console.error('Error updating agent:', error);
    const errorMessage = error.response?.data?.message || 'Failed to update agent';
    
    // Show validation errors if available
    if (error.response?.data?.errors) {
      error.response.data.errors.forEach(err => toast.error(err));
    } else {
      toast.error(errorMessage);
    }
  } finally {
    setSaving(false);
  }
};

// Update the delete function:
const handleDelete = async () => {
  try {
    const response = await axiosInstance.delete(
      `/api/admin/service-agents/${agent._id}`
    );

    if (response.data.success) {
      toast.success('Agent deleted successfully');
      onUpdate();
      onClose();
    }
  } catch (error) {
    console.error('Error deleting agent:', error);
    const errorMessage = error.response?.data?.message || 'Failed to delete agent';
    toast.error(errorMessage);
  } finally {
    setShowDeleteConfirm(false);
  }
};

  if (!agent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Service Agent</h2>
            <p className="text-sm text-gray-600 mt-1">Update agent details and settings</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Basic Information</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]{10}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Radius (km)
                </label>
                <input
                  type="number"
                  name="serviceRadius"
                  value={formData.serviceRadius}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Active Account</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="serviceAgentProfile.isSuspended"
                  checked={formData.serviceAgentProfile.isSuspended}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">Suspend Agent</span>
              </label>
            </div>
          </div>

          {/* Address Information */}
          <div className="border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Building className="w-5 h-5" />
              <span>Address Information</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  House No.
                </label>
                <input
                  type="text"
                  name="address.houseNo"
                  value={formData.address.houseNo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street
                </label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area
                </label>
                <input
                  type="text"
                  name="address.area"
                  value={formData.address.area}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Service Agent Settings */}
          <div className="border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Service Agent Settings</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Area
                </label>
                <input
                  type="text"
                  name="serviceAgentProfile.assignedArea"
                  value={formData.serviceAgentProfile.assignedArea}
                  onChange={handleInputChange}
                  placeholder="Enter area name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>

            {formData.serviceAgentProfile.isSuspended && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-red-700 mb-2">
                      Suspension End Date
                    </label>
                    <input
                      type="datetime-local"
                      name="serviceAgentProfile.suspendedUntil"
                      value={formData.serviceAgentProfile.suspendedUntil}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-red-700 mb-2">
                      Suspension Reason
                    </label>
                    <input
                      type="text"
                      name="serviceAgentProfile.suspensionReason"
                      value={formData.serviceAgentProfile.suspensionReason}
                      onChange={handleInputChange}
                      placeholder="Reason for suspension"
                      className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Agent</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Service Agent</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete {agent.name}? This will deactivate their account and remove all assigned areas.
              </p>
              
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Agent</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditAgentModal;