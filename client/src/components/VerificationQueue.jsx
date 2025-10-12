import React from 'react';
import { Search, Filter, Shield, Eye, Clock } from 'lucide-react';

const VerificationQueue = ({ queue, setSelectedWorker }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-3 sm:space-y-0">
        <h2 className="text-lg font-semibold text-gray-900">Verification Queue</h2>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search workers..." 
              className="w-full sm:w-48 pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {queue.map((worker) => (
          <div key={worker.id} className="p-3 sm:p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 group">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  worker.priority === 'high' ? 'bg-red-500' :
                  worker.priority === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                }`}></div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">{worker.name}</p>
                  <p className="text-xs text-gray-600">{worker.service} • {worker.location}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">{worker.submitted}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${worker.documents.aadhaar ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-gray-600">Aadhaar</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${worker.documents.selfie ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-gray-600">Selfie</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${worker.documents.police ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-gray-600">Police</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setSelectedWorker(worker)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-1"
                >
                  <Shield className="w-3 h-3" />
                  <span>Review</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center space-x-2 text-sm">
        <Clock className="w-4 h-4" />
        <span>Load More Pending Verifications</span>
      </button>
    </div>
  );
};

export default VerificationQueue;