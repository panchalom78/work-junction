import React from 'react';
import { X, Trash2 } from 'lucide-react';

const PortfolioModal = ({ 
  services, 
  portfolio, 
  onImageUpload, 
  onDeleteImage, 
  onClose 
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="p-6 border-b border-gray-200" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-color)' }}>Manage Portfolio</h3>
            <button onClick={onClose} style={{ color: 'var(--text-muted)', transition: 'color var(--transition-normal)' }} onMouseOver={e => e.currentTarget.style.color = 'var(--text-color)'} onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6" style={{ padding: '1.5rem' }}>
          {services.map(service => (
            <div key={service.id} className="border border-gray-200 rounded-lg p-4" style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
              <h4 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-color)', marginBottom: '0.75rem' }}>{service.name}</h4>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => onImageUpload(service.name, e.target.files)}
                style={{ width: '100%', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '1rem' }}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary-color hover:file:bg-primary-hover"
              />
              
              {portfolio[service.name] && portfolio[service.name].length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                  {portfolio[service.name].map(image => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt={image.caption}
                        style={{ width: '100%', height: '6rem', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                        className="rounded-lg"
                      />
                      <button 
                        onClick={() => onDeleteImage(service.name, image.id)}
                        style={{
                          position: 'absolute',
                          top: '0.25rem',
                          right: '0.25rem',
                          backgroundColor: 'var(--danger-color)',
                          color: 'white',
                          padding: '0.25rem',
                          borderRadius: '9999px',
                          opacity: 0,
                          transition: 'opacity var(--transition-normal)'
                        }}
                        className="group-hover:opacity-100"
                        onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--danger-hover)'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--danger-color)'}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.25rem', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{image.caption}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl" style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--surface-secondary)', borderBottomLeftRadius: 'var(--radius-xl)', borderBottomRightRadius: 'var(--radius-xl)' }}>
          <button
            onClick={onClose}
            style={{ width: '100%', background: 'var(--primary-gradient)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-weight-semibold)', transition: 'all var(--transition-normal)' }}
            onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(135deg, #6D28D9 0%, #A855F7 100%)'}
            onMouseOut={e => e.currentTarget.style.background = 'var(--primary-gradient)'}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioModal;