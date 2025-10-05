import React from 'react';
import { Plus, Edit3, Trash2 , Briefcase  } from 'lucide-react';

const ServiceManagement = ({ 
  services, 
  onShowServiceModal, 
  onEditService, 
  onDeleteService 
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Service Management</h2>
          <p className="text-gray-600 mt-1">Manage your services, skills, and pricing</p>
        </div>
        <button
          onClick={onShowServiceModal}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Service</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <div key={service.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full mt-1">
                  {service.skill}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEditService(service)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteService(service.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-gray-600 mb-4">{service.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-gray-900">₹{service.price}</span>
              <span className="text-sm text-gray-500">{service.duration}</span>
            </div>
          </div>
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No services added yet</p>
          <p className="text-sm text-gray-400 mt-1">Add your first service to get started</p>
          <button
            onClick={onShowServiceModal}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Service
          </button>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;