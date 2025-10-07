import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Briefcase, Loader2, AlertCircle } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';

const WorkerServiceManagement = ({ onShowServiceModal }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch worker services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get('/api/worker/getservices');

        // Map backend data correctly
        const mappedServices = response.data.map(service => ({
          id: service._id, // WorkerService _id
          name: service.serviceId?.name || 'Unnamed Service',
          skill: service.skillId?.name || 'No Skill',
          description: service.details || service.serviceId?.description || 'No description',
          price: service.price || 0,
          pricingType: service.pricingType || 'FIXED',
        }));

        setServices(mappedServices);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch services. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Delete service
  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;

    try {
      setDeletingId(serviceId);
      await axiosInstance.delete(`/api/worker/deleteWorkerService/${serviceId}`);
      setServices(prev => prev.filter(service => service.id !== serviceId));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to delete service');
    } finally {
      setDeletingId(null);
    }
  };

  // Update service
  const handleUpdateService = async (serviceId, updates) => {
    try {
      const response = await axiosInstance.put(`/api/worker/updateWorkerService/${serviceId}`, updates);
      setServices(prev =>
        prev.map(service => (service.id === serviceId ? { ...service, ...response.data } : service))
      );
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to update service');
    }
  };

  if (loading) return (
    <div className="min-h-96 flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <p className="ml-2 text-gray-600">Loading your services...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Service Management</h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Manage your services, set pricing, and showcase your skills to potential clients
            </p>
          </div>
          <button
            onClick={onShowServiceModal}
            className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
          >
            <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Add New Service</span>
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {services.length === 0 && !error && (
            <div className="text-center py-16">
              <Briefcase className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Services Yet</h2>
              <p className="text-gray-600 mb-4">Start by adding your first service to showcase your skills.</p>
            </div>
          )}
          {services.map(service => (
            <div key={service.id} className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
                  <span className="inline-flex text-sm font-medium px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-700 mt-1">
                    {service.skill}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateService(service.id, { price: service.price + 100 })}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteService(service.id)}
                    disabled={deletingId === service.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    {deletingId === service.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-3">{service.description}</p>
              <div className="flex justify-between items-center border-t pt-3 border-gray-100">
                <span className="text-2xl font-bold text-gray-900">₹{service.price}</span>
                <span className="text-sm text-gray-500 capitalize">({service.pricingType.toLowerCase()})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkerServiceManagement;
