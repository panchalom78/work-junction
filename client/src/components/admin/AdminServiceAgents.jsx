import React, { useState, useEffect } from 'react';
import {
  MapPin, Search, Filter, Eye, CheckCircle, XCircle,
  Clock, AlertCircle, User, Phone, Mail, Shield,
  ChevronLeft, ChevronRight, Download, Plus, Map,
  Navigation, Target, Check, X, Users, Building,
  Edit, Trash2, Save, MoreVertical
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

const AdminServiceAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showAreaAssignment, setShowAreaAssignment] = useState(false);
  const [availableAreas, setAvailableAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(null);

  useEffect(() => {
    fetchServiceAgents();
  }, [currentPage, searchTerm]);

  const fetchServiceAgents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm })
      });

      const response = await axiosInstance.get(`/api/admin/service-agents?${params}`);

      if (response.data.success) {
        setAgents(response.data.data.agents);
        setTotalPages(response.data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching service agents:', error);
      toast.error('Failed to fetch service agents');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignArea = async (agent) => {
    try {
      setSelectedAgent(agent);
      setMobileMenuOpen(null);

      const response = await axiosInstance.get('/api/admin/service-agents/areas/available', {
        params: {
          agentId: agent._id,
          pincode: agent.address?.pincode,
          limit: 15
        }
      });

      if (response.data.success) {
        setAvailableAreas(response.data.data);
        setShowAreaAssignment(true);
      }
    } catch (error) {
      console.error('Error fetching available areas:', error);
      toast.error('Failed to fetch available areas');
    }
  };

  const handleAreaAssignment = async () => {
    if (!selectedArea) {
      toast.error('Please select an area');
      return;
    }

    try {
      setAssignmentLoading(true);
      const selectedAreaData = availableAreas.find(area => area.id === selectedArea);

      const response = await axiosInstance.patch(
        `/api/admin/service-agents/${selectedAgent._id}/assign-area`,
        {
          areaId: selectedAreaData.id,
          areaName: selectedAreaData.name,
          pincode: selectedAreaData.pincode
        }
      );

      if (response.data.success) {
        toast.success(`Area "${selectedAreaData.name}" assigned successfully!`);
        await fetchServiceAgents();
        setShowAreaAssignment(false);
        setSelectedAgent(null);
        setSelectedArea('');
      }
    } catch (error) {
      console.error('Error assigning area:', error);
      const errorMessage = error.response?.data?.message || 'Failed to assign area';
      toast.error(errorMessage);
    } finally {
      setAssignmentLoading(false);
    }
  };

  const handleEditAgent = (agent) => {
    setEditingAgent(agent);
    setShowEditModal(true);
    setMobileMenuOpen(null);
  };

  const handleAgentUpdate = (updatedData) => {
    fetchServiceAgents();
    toast.success('Agent updated successfully');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (agent) => {
    if (!agent.serviceAgentProfile?.assignedArea) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full border border-yellow-200">
          Unassigned
        </span>
      );
    }
    if (agent.serviceAgentProfile?.isSuspended) {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full border border-red-200">
          Suspended
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full border border-green-200">
        Active
      </span>
    );
  };

  // Mobile Actions Menu Component
  const MobileActionsMenu = ({ agent, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 p-4 sm:hidden">
        <div className="bg-white rounded-t-2xl w-full max-w-md mx-auto animate-slide-up">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Actions</h3>
              <button onClick={onClose} className="p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="p-2">
            <button
              onClick={() => {
                setSelectedAgent(agent);
                setShowAgentModal(true);
                onClose();
              }}
              className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Eye className="w-5 h-5 text-blue-600" />
              <span>View Details</span>
            </button>
            <button
              onClick={() => handleEditAgent(agent)}
              className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Edit className="w-5 h-5 text-green-600" />
              <span>Edit Agent</span>
            </button>
            {!agent.serviceAgentProfile?.assignedArea && (
              <button
                onClick={() => handleAssignArea(agent)}
                className="w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <MapPin className="w-5 h-5 text-purple-600" />
                <span>Assign Area</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Edit Agent Modal Component
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

    const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);

      try {
        const response = await axiosInstance.put(
          `/api/admin/service-agents/${agent._id}`,
          formData
        );

        if (response.data.success) {
          onUpdate(response.data.data);
          onClose();
        }
      } catch (error) {
        console.error('Error updating agent:', error);
        const errorMessage = error.response?.data?.message || 'Failed to update agent';
        toast.error(errorMessage);
      } finally {
        setSaving(false);
      }
    };

    const handleDelete = async () => {
      try {
        const response = await axiosInstance.delete(
          `/api/admin/service-agents/${agent._id}`
        );

        if (response.data.success) {
          onUpdate();
          onClose();
          toast.success('Agent deleted successfully');
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 max-w-4xl w-full max-h-[95vh] overflow-y-auto mx-2">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Edit Service Agent</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Update agent details and settings</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Basic Information */}
            <div className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Basic Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-3 sm:mt-4">
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
            <div className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
                <Building className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Address Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    House No.
                  </label>
                  <input
                    type="text"
                    name="address.houseNo"
                    value={formData.address.houseNo}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Service Agent Settings */}
            <div className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Service Agent Settings</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>

              {formData.serviceAgentProfile.isSuspended && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-red-700 mb-2">
                        Suspension End Date
                      </label>
                      <input
                        type="datetime-local"
                        name="serviceAgentProfile.suspendedUntil"
                        value={formData.serviceAgentProfile.suspendedUntil}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
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
                        className="w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 sm:pt-6 border-t gap-3">
              <div>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-2 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Agent</span>
                </button>
              </div>

              <div className="flex items-center space-x-3 sm:space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 text-sm"
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
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-md w-full mx-4">
                <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Delete Service Agent</h3>
                    <p className="text-xs sm:text-sm text-gray-600">This action cannot be undone</p>
                  </div>
                </div>

                <p className="text-gray-700 text-sm mb-4 sm:mb-6">
                  Are you sure you want to delete {agent.name}? This will deactivate their account and remove all assigned areas.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 text-sm w-full sm:w-auto"
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

  const AreaAssignmentModal = () => {
    if (!selectedAgent) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 max-w-2xl w-full max-h-[95vh] overflow-y-auto mx-2">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Assign Service Area</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Select an area for {selectedAgent.name}</p>
            </div>
            <button
              onClick={() => {
                setShowAreaAssignment(false);
                setSelectedArea('');
              }}
              className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{selectedAgent.name}</h3>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-2">
                  <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-600">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="truncate">{selectedAgent.phone}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-600">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="truncate">{selectedAgent.email}</span>
                  </div>
                  {selectedAgent.address && (
                    <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-600">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="truncate">{selectedAgent.address.city}, {selectedAgent.address.pincode}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {selectedAgent.address && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex items-start space-x-2 sm:space-x-3">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-800 text-sm sm:text-base">Location-based Suggestion</h4>
                  <p className="text-xs sm:text-sm text-yellow-700 mt-1">
                    Based on agent's address in {selectedAgent.address.city}, we recommend areas near pincode {selectedAgent.address.pincode}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Available Service Areas</h3>

            {availableAreas.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <Map className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                <p className="text-gray-600 font-medium text-sm sm:text-base">No areas available</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">All service areas are currently assigned</p>
              </div>
            ) : (
              <div className="grid gap-2 sm:gap-3 max-h-64 sm:max-h-96 overflow-y-auto">
                {availableAreas.map((area) => (
                  <div
                    key={area.id}
                    className={`border rounded-lg sm:rounded-xl p-3 sm:p-4 cursor-pointer transition-all ${selectedArea === area.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    onClick={() => setSelectedArea(area.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          {selectedArea === area.id ? (
                            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-gray-300 rounded-full flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{area.name}</h4>
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 sm:space-x-4 mt-1">
                              <span className="text-xs sm:text-sm text-gray-600">Pincode: {area.pincode}</span>
                              <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-600">
                                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>{area.agentCount} agents</span>
                              </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${area.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                {area.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t mt-4 sm:mt-6">
            <button
              onClick={() => {
                setShowAreaAssignment(false);
                setSelectedArea('');
              }}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              onClick={handleAreaAssignment}
              disabled={!selectedArea || assignmentLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 text-sm w-full sm:w-auto"
            >
              {assignmentLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Assign Area</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const AgentModal = () => {
    if (!selectedAgent) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 max-w-2xl w-full max-h-[95vh] overflow-y-auto mx-2">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Service Agent Details</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Complete profile information</p>
            </div>
            <button
              onClick={() => setShowAgentModal(false)}
              className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{selectedAgent.name}</h3>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-2">
                    <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-600">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="truncate">{selectedAgent.phone}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-600">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="truncate">{selectedAgent.email}</span>
                    </div>
                  </div>
                </div>
                <div className="px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>SERVICE_AGENT</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-3 gap-2">
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Service Area</h4>
                {!selectedAgent.serviceAgentProfile?.assignedArea && (
                  <button
                    onClick={() => {
                      setShowAgentModal(false);
                      handleAssignArea(selectedAgent);
                    }}
                    className="px-2 py-1 sm:px-3 sm:py-1 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                  >
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Assign Area</span>
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                    {selectedAgent.serviceAgentProfile?.assignedArea || 'Not Assigned'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">Geographic Coverage Area</p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-2 sm:mb-3">Account Status</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Account Status</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {selectedAgent.isActive ? (
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                    )}
                    <span className={`font-medium text-sm sm:text-base ${selectedAgent.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedAgent.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Suspension Status</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {selectedAgent.serviceAgentProfile?.isSuspended ? (
                      <>
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                        <span className="font-medium text-sm sm:text-base text-red-600">Suspended</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                        <span className="font-medium text-sm sm:text-base text-green-600">Active</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {selectedAgent.address && (
              <div className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-2 sm:mb-3">Registered Address</h4>
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Building className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-1" />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm sm:text-base">
                      {selectedAgent.address.houseNo} {selectedAgent.address.street}, {selectedAgent.address.area}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {selectedAgent.address.city}, {selectedAgent.address.state} - {selectedAgent.address.pincode}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-2 sm:mb-3">Account Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Joined Date</p>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">{formatDate(selectedAgent.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Email Verified</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {selectedAgent.isVerified ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`font-medium text-sm sm:text-base ${selectedAgent.isVerified ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedAgent.isVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-3 sm:pt-4 border-t">
              <button
                onClick={() => setShowAgentModal(false)}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm w-full sm:w-auto"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowAgentModal(false);
                  handleEditAgent(selectedAgent);
                }}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm w-full sm:w-auto"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Agent</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Service Agents</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage service agents and their assigned areas</p>
        </div>
      </div>

      {/* Stats - Improved mobile layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-white rounded-lg sm:rounded-2xl border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{agents.length}</p>
              <p className="text-xs sm:text-sm text-gray-600">Total Agents</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg sm:rounded-2xl border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {agents.filter(a => a.serviceAgentProfile?.assignedArea).length}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">Assigned</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg sm:rounded-2xl border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <MapPin className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {agents.filter(a => !a.serviceAgentProfile?.assignedArea).length}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">Unassigned</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg sm:rounded-2xl border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-red-100 rounded-lg sm:rounded-xl flex items-center justify-center">
              <AlertCircle className="w-4 h-4 sm:w-6 sm:h-6 text-red-600" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {agents.filter(a => a.serviceAgentProfile?.isSuspended).length}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">Suspended</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg sm:rounded-2xl border border-gray-200 p-3 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search service agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-white rounded-lg sm:rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32 sm:h-64">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Agent</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Assigned Area</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Joined</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {agents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <User className="w-12 h-12 text-gray-400 mb-3" />
                          <p className="text-base text-gray-600 font-medium">No service agents found</p>
                          <p className="text-sm text-gray-500 mt-1">Try adjusting your search term</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    agents.map((agent) => (
                      <tr key={agent._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">{agent.name}</p>
                              <p className="text-sm text-gray-500 truncate">{agent.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="text-gray-900">{agent.phone}</p>
                            <p className="text-gray-500 truncate">{agent.address?.city || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900 truncate">
                              {agent.serviceAgentProfile?.assignedArea || 'Not Assigned'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(agent)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatDate(agent.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedAgent(agent);
                                setShowAgentModal(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditAgent(agent)}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="Edit Agent"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {!agent.serviceAgentProfile?.assignedArea && (
                              <button
                                onClick={() => handleAssignArea(agent)}
                                className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                                title="Assign Area"
                              >
                                <MapPin className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-3 p-3">
              {agents.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-base text-gray-600 font-medium">No service agents found</p>
                  <p className="text-sm text-gray-500 mt-1">Try adjusting your search term</p>
                </div>
              ) : (
                agents.map((agent) => (
                  <div key={agent._id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{agent.name}</p>
                          <p className="text-sm text-gray-500">{agent.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setMobileMenuOpen(agent._id)}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">{agent.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">City</p>
                        <p className="font-medium text-gray-900">{agent.address?.city || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Area</p>
                        <p className="font-medium text-gray-900 truncate">
                          {agent.serviceAgentProfile?.assignedArea || 'Not Assigned'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status</p>
                        {getStatusBadge(agent)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        Joined {formatDate(agent.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-3 py-3 sm:px-6 sm:py-4 bg-gray-50 border-t border-gray-200 gap-3">
              <p className="text-xs sm:text-sm text-gray-700">
                Showing page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-1 sm:p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 sm:p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showAgentModal && <AgentModal />}
      {showAreaAssignment && <AreaAssignmentModal />}
      {showEditModal && (
        <EditAgentModal
          agent={editingAgent}
          onClose={() => {
            setShowEditModal(false);
            setEditingAgent(null);
          }}
          onUpdate={handleAgentUpdate}
        />
      )}
      {mobileMenuOpen && (
        <MobileActionsMenu
          agent={agents.find(a => a._id === mobileMenuOpen)}
          onClose={() => setMobileMenuOpen(null)}
        />
      )}
    </div>
  );
};

export default AdminServiceAgents;