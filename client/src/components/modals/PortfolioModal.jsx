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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Manage Portfolio</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {services.map(service => (
            <div key={service.id} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 text-lg mb-3">{service.name}</h4>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => onImageUpload(service.name, e.target.files)}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
              />
              
              {portfolio[service.name] && portfolio[service.name].length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
                  {portfolio[service.name].map(image => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt={image.caption}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button 
                        onClick={() => onDeleteImage(service.name, image.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <p className="text-xs text-gray-600 mt-1 truncate">{image.caption}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioModal;