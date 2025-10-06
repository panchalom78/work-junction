import React from 'react';
import { Image, Upload, Edit3, Trash2, Plus } from 'lucide-react';

const PortfolioManagement = ({ 
  services, 
  portfolio, 
  onShowPortfolioModal, 
  onDeleteImage 
}) => {
  const PortfolioSection = ({ service }) => {
    const serviceImages = portfolio[service.name] || [];

    return (
      <div key={service.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100" style={{ backgroundColor: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-color)', margin: '0 0 0.25rem 0' }}>{service.name}</h3>
            <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-muted)', margin: '0' }}>{service.description}</p>
          </div>
          <div className="flex items-center space-x-4">
            <span style={{ backgroundColor: 'var(--info-light)', color: 'var(--info-color)', fontSize: 'var(--font-size-sm)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', display: 'inline-block' }}>
              {serviceImages.length} images
            </span>
            <button
              onClick={onShowPortfolioModal}
              style={{ background: 'var(--primary-gradient)', color: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-weight-medium)', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all var(--transition-normal)' }}
              onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(135deg, #6D28D9 0%, #A855F7 100%)'}
              onMouseOut={e => e.currentTarget.style.background = 'var(--primary-gradient)'}
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
          </div>
        </div>
        
        {serviceImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {serviceImages.map(image => (
              <div key={image.id} className="relative group">
                <div className="aspect-square overflow-hidden rounded-lg bg-gray-100" style={{ backgroundColor: 'var(--surface-tertiary)' }}>
                  <img
                    src={image.url}
                    alt={image.caption}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    style={{ transition: 'transform var(--transition-normal)' }}
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100" style={{ transition: 'all var(--transition-normal)' }}>
                  <div className="flex space-x-2">
                    <button className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors" style={{ transition: 'background-color var(--transition-normal)' }}>
                      <Edit3 className="w-4 h-4" style={{ color: 'var(--info-color)' }} />
                    </button>
                    <button 
                      onClick={() => onDeleteImage(service.name, image.id)}
                      className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors" 
                      style={{ transition: 'background-color var(--transition-normal)' }}
                    >
                      <Trash2 className="w-4 h-4" style={{ color: 'var(--danger-color)' }} />
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: '0.5rem', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{image.caption}</p>
              </div>
            ))}
            
            {/* Add More Card */}
            <button
              onClick={onShowPortfolioModal}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
              style={{ borderColor: 'var(--border-color)', transition: 'all var(--transition-normal)' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-color)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <Plus className="w-8 h-8 mb-2" />
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>Add More</span>
            </button>
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--surface-secondary)' }}>
            <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
            <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-muted)' }}>No images uploaded</p>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-light)', marginTop: '0.25rem' }}>Showcase your work with high-quality images</p>
            <button
              onClick={onShowPortfolioModal}
              style={{ background: 'var(--primary-gradient)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-weight-medium)', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all var(--transition-normal)' }}
              onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(135deg, #6D28D9 0%, #A855F7 100%)'}
              onMouseOut={e => e.currentTarget.style.background = 'var(--primary-gradient)'}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Images</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  const totalImages = Object.values(portfolio).reduce((total, images) => total + images.length, 0);

  return (
    <div className="space-y-6" style={{ backgroundColor: 'var(--bg-light)', color: 'var(--text-color)' }}>
      <div className="flex justify-between items-center" style={{ padding: '1rem' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-color)', margin: '0 0 0.25rem 0' }}>Service Portfolio</h2>
          <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--text-muted)', margin: '0' }}>Showcase your work with images and build trust with customers</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>Total Images</p>
            <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-color)' }}>{totalImages}</p>
          </div>
          <button
            onClick={onShowPortfolioModal}
            style={{ background: 'var(--primary-gradient)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 'var(--font-weight-medium)', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all var(--transition-normal)' }}
            onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(135deg, #6D28D9 0%, #A855F7 100%)'}
            onMouseOut={e => e.currentTarget.style.background = 'var(--primary-gradient)'}
          >
            <Upload className="w-5 h-5" />
            <span>Upload Images</span>
          </button>
        </div>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100" style={{ backgroundColor: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-muted)' }}>Services with Portfolio</p>
              <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-color)' }}>
                {services.filter(service => portfolio[service.name]?.length > 0).length}
              </p>
            </div>
            <Image className="w-8 h-8 text-blue-500" style={{ color: 'var(--info-color)' }} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100" style={{ backgroundColor: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-muted)' }}>Total Services</p>
              <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-color)' }}>{services.length}</p>
            </div>
            <Plus className="w-8 h-8 text-green-500" style={{ color: 'var(--success-color)' }} />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100" style={{ backgroundColor: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-muted)' }}>Coverage</p>
              <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-color)' }}>
                {Math.round((services.filter(service => portfolio[service.name]?.length > 0).length / services.length) * 100)}%
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--info-light)' }}>
              <span style={{ color: 'var(--info-color)', fontWeight: 'var(--font-weight-bold)' }}>%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Service Portfolios */}
      <div className="space-y-6">
        {services.map(service => (
          <PortfolioSection key={service.id} service={service} />
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--surface-secondary)' }}>
          <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--text-muted)' }}>No services available</p>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-light)', marginTop: '0.25rem' }}>Add services first to create a portfolio</p>
        </div>
      )}
    </div>
  );
};

export default PortfolioManagement;