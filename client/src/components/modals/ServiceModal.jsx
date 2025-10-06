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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="p-6 border-b border-gray-200" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-color)' }}>
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h3>
            <button onClick={onClose} style={{ color: 'var(--text-muted)', transition: 'color var(--transition-normal)' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-color)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4" style={{ padding: '1.5rem' }}>
          <div>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)', marginBottom: '0.5rem', display: 'block' }}>Service Name</label>
            <input
              type="text"
              value={newService.name}
              onChange={(e) => setNewService({ ...newService, name: e.target.value })}
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none', transition: 'border-color var(--transition-normal)' }}
              placeholder="e.g., Tap Repair"
              onFocus={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            />
          </div>

          <div>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)', marginBottom: '0.5rem', display: 'block' }}>Skill Category</label>
            <select
              value={newService.skill}
              onChange={(e) => setNewService({ ...newService, skill: e.target.value })}
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none', transition: 'border-color var(--transition-normal)' }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <option value="">Select a skill</option>
              {skills.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)', marginBottom: '0.5rem', display: 'block' }}>Price (₹)</label>
            <input
              type="number"
              value={newService.price}
              onChange={(e) => setNewService({ ...newService, price: e.target.value })}
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none', transition: 'border-color var(--transition-normal)' }}
              placeholder="300"
              onFocus={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            />
          </div>

          <div>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)', marginBottom: '0.5rem', display: 'block' }}>Duration</label>
            <input
              type="text"
              value={newService.duration}
              onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none', transition: 'border-color var(--transition-normal)' }}
              placeholder="e.g., 1 hour"
              onFocus={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            />
          </div>

          <div>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)', marginBottom: '0.5rem', display: 'block' }}>Description</label>
            <textarea
              value={newService.description}
              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              rows="3"
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none', transition: 'border-color var(--transition-normal)' }}
              placeholder="Describe the service..."
              onFocus={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            />
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
              onClick={onAddService}
              style={{ flex: '1', background: 'var(--primary-gradient)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-weight-semibold)', transition: 'all var(--transition-normal)' }}
              onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(135deg, #6D28D9 0%, #A855F7 100%)'}
              onMouseOut={e => e.currentTarget.style.background = 'var(--primary-gradient)'}
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