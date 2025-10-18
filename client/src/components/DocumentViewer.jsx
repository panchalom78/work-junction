import React from 'react';
import { X, FileText, User, Shield, CheckCircle } from 'lucide-react';

const DocumentViewer = ({ worker, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Verify Documents - {worker.name}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-4 sm:p-6 space-y-6">
          {/* Document Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 sm:p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Aadhaar Card</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3">Identity Verification</p>
              <button className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-xs sm:text-sm">
                View Document
              </button>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 sm:p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <User className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Live Selfie</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3">Face Match Check</p>
              <button className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-xs sm:text-sm">
                View Selfie
              </button>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 sm:p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <Shield className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Police Verification</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3">Background Check</p>
              <button className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-xs sm:text-sm">
                View Certificate
              </button>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
            <button className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold flex items-center justify-center space-x-2 text-sm sm:text-base">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Approve Verification</span>
            </button>
            <button className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold flex items-center justify-center space-x-2 text-sm sm:text-base">
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Reject with Reason</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;