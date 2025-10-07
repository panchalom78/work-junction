import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

const WorkerServiceModal = ({ 
  editingService, 
  newService, 
  setNewService, 
  onAddService, 
  onClose 
}) => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await axiosInstance.get('/api/skill/getSkills');
        setSkills(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch skills');
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  const handleSubmit = async () => {
    try {
      if (!newService.skillId || !newService.serviceId || !newService.price || !newService.pricingType) {
        setError('Please fill all required fields');
        return;
      }

      const serviceData = {
        skillId: newService.skillId,
        serviceId: newService.serviceId,
        details: newService.description || '',
        price: Number(newService.price),
        pricingType: newService.pricingType
      };

      await axiosInstance.post('/api/worker/addWorkerServices', serviceData);

      onAddService();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save service');
    }
  };

  if (loading) return <div>Loading skills...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="p-6 border-b border-gray-200 flex items-center justify-between" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-color)' }}>
            {editingService ? 'Edit Service' : 'Add Service to Worker'}
          </h3>
          <button 
            onClick={onClose} 
            style={{ color: 'var(--text-muted)', transition: 'color var(--transition-normal)' }} 
            onMouseOver={e => e.currentTarget.style.color = 'var(--text-color)'} 
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Skill Selection */}
          <div>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)', marginBottom: '0.5rem', display: 'block' }}>Skill Category</label>
            <select
              value={newService.skillId || ''}
              onChange={(e) => {
                const skill = skills.find(s => s._id === e.target.value);
                setNewService({ 
                  ...newService, 
                  skillId: skill._id, 
                  skillName: skill.name,
                  serviceId: '' 
                });
              }}
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none', transition: 'border-color var(--transition-normal)' }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <option value="">Select a skill</option>
              {skills.map(skill => (
                <option key={skill._id} value={skill._id}>{skill.name}</option>
              ))}
            </select>
          </div>

          {/* Service Selection */}
          <div>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)', marginBottom: '0.5rem', display: 'block' }}>Service</label>
            <select
              value={newService.serviceId || ''}
              onChange={(e) => setNewService({ ...newService, serviceId: e.target.value })}
              disabled={!newService.skillId}
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none', transition: 'border-color var(--transition-normal)' }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <option value="">Select a service</option>
              {newService.skillId && skills.find(s => s._id === newService.skillId).services.map(service => (
                <option key={service.serviceId || service._id} value={service.serviceId || service._id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          {/* Details */}
          <div>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)', marginBottom: '0.5rem', display: 'block' }}>Description / Details</label>
            <textarea
              value={newService.description || ''}
              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              rows="3"
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none', transition: 'border-color var(--transition-normal)' }}
              placeholder="Enter details about this service"
              onFocus={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            />
          </div>

          {/* Pricing Type */}
          <div>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)', marginBottom: '0.5rem', display: 'block' }}>Pricing Type</label>
            <select
              value={newService.pricingType || ''}
              onChange={(e) => setNewService({ ...newService, pricingType: e.target.value })}
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none', transition: 'border-color var(--transition-normal)' }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <option value="">Select pricing type</option>
              <option value="FIXED">Fixed</option>
              <option value="HOURLY">Hourly</option>
            </select>
          </div>

          {/* Price */}
          <div>
            <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-color)', marginBottom: '0.5rem', display: 'block' }}>Price (₹)</label>
            <input
              type="number"
              value={newService.price || ''}
              onChange={(e) => setNewService({ ...newService, price: e.target.value })}
              placeholder="Enter price"
              style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none', transition: 'border-color var(--transition-normal)' }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            />
          </div>

          {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex space-x-4" style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--surface-secondary)', borderBottomLeftRadius: 'var(--radius-xl)', borderBottomRightRadius: 'var(--radius-xl)' }}>
          <button
            onClick={onClose}
            style={{ flex: '1', backgroundColor: 'var(--surface-primary)', color: 'var(--text-color)', border: '2px solid var(--border-color)', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-weight-semibold)', transition: 'all var(--transition-normal)' }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--surface-primary)'}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{ flex: '1', background: 'var(--primary-gradient)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-weight-semibold)', transition: 'all var(--transition-normal)' }}
            onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(135deg, #6D28D9 0%, #A855F7 100%)'}
            onMouseOut={e => e.currentTarget.style.background = 'var(--primary-gradient)'}
          >
            {editingService ? 'Update Service' : 'Add Service'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkerServiceModal;
