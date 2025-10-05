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
      <div key={service.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
            <p className="text-gray-600 mt-1">{service.description}</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {serviceImages.length} images
            </span>
            <button
              onClick={onShowPortfolioModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
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
                <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={image.url}
                    alt={image.caption}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <button className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDeleteImage(service.name, image.id)}
                      className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 truncate">{image.caption}</p>
              </div>
            ))}
            
            {/* Add More Card */}
            <button
              onClick={onShowPortfolioModal}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
            >
              <Plus className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">Add More</span>
            </button>
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No images uploaded</p>
            <p className="text-gray-400 mt-1">Showcase your work with high-quality images</p>
            <button
              onClick={onShowPortfolioModal}
              className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Service Portfolio</h2>
          <p className="text-gray-600 mt-1">Showcase your work with images and build trust with customers</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Images</p>
            <p className="text-2xl font-bold text-gray-900">{totalImages}</p>
          </div>
          <button
            onClick={onShowPortfolioModal}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Images</span>
          </button>
        </div>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Services with Portfolio</p>
              <p className="text-2xl font-bold text-gray-900">
                {services.filter(service => portfolio[service.name]?.length > 0).length}
              </p>
            </div>
            <Image className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Services</p>
              <p className="text-2xl font-bold text-gray-900">{services.length}</p>
            </div>
            <Plus className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Coverage</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round((services.filter(service => portfolio[service.name]?.length > 0).length / services.length) * 100)}%
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">%</span>
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
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
          <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No services available</p>
          <p className="text-gray-400 mt-1">Add services first to create a portfolio</p>
        </div>
      )}
    </div>
  );
};

export default PortfolioManagement;