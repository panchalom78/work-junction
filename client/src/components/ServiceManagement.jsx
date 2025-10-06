import React from 'react';
import { Plus, Edit3, Trash2, Briefcase } from 'lucide-react';

const ServiceManagement = ({ 
  services, 
  onShowServiceModal, 
  onEditService, 
  onDeleteService 
}) => {
  return (
    <div className="space-y-6" style={{ backgroundColor: 'var(--bg-light)', color: 'var(--text-color)' }}>
      <div className="flex justify-between items-center" style={{ padding: '1rem' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-color)', margin: '0 0 0.25rem 0' }}>Service Management</h2>
          <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-muted)', margin: '0' }}>Manage your services, skills, and pricing</p>
        </div>
        <button
          onClick={onShowServiceModal}
          style={{ background: 'var(--primary-gradient)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all var(--transition-normal)' }}
          onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(135deg, #6D28D9 0%, #A855F7 100%)'}
          onMouseOut={e => e.currentTarget.style.background = 'var(--primary-gradient)'}
        >
          <Plus className="w-5 h-5" />
          <span>Add New Service</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <div key={service.id} style={{ backgroundColor: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', transition: 'box-shadow var(--transition-normal)' }} className="hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-color)' }}>{service.name}</h3>
                <span style={{ backgroundColor: 'var(--info-light)', color: 'var(--info-color)', fontSize: 'var(--font-size-sm)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-full)', marginTop: '0.25rem', display: 'inline-block' }}>
                  {service.skill}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEditService(service)}
                  style={{ color: 'var(--info-color)', transition: 'color var(--transition-normal)' }}
                  onMouseOver={e => e.currentTarget.style.color = 'var(--info-hover)'}
                  onMouseOut={e => e.currentTarget.style.color = 'var(--info-color)'}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteService(service.id)}
                  style={{ color: 'var(--danger-color)', transition: 'color var(--transition-normal)' }}
                  onMouseOver={e => e.currentTarget.style.color = 'var(--danger-hover)'}
                  onMouseOut={e => e.currentTarget.style.color = 'var(--danger-color)'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-muted)', marginBottom: '1rem' }}>{service.description}</p>
            <div className="flex justify-between items-center">
              <span style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-color)' }}>₹{service.price}</span>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-light)' }}>{service.duration}</span>
            </div>
          </div>
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-xl" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--surface-secondary)' }}>
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-muted)' }}>No services added yet</p>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-light)', marginTop: '0.25rem' }}>Add your first service to get started</p>
          <button
            onClick={onShowServiceModal}
            style={{ background: 'var(--primary-gradient)', color: 'white', padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-weight-medium)', marginTop: '1rem', transition: 'all var(--transition-normal)' }}
            onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(135deg, #6D28D9 0%, #A855F7 100%)'}
            onMouseOut={e => e.currentTarget.style.background = 'var(--primary-gradient)'}
          >
            Add Service
          </button>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;