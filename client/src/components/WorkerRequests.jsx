import React from 'react';
import { MessageCircle } from 'lucide-react';

const WorkerRequests = ({ requests }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Worker Requests</h2>
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
          {requests.filter(r => r.status === 'pending').length} New
        </span>
      </div>
      
      <div className="space-y-4">
        {requests.map((request, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
            <div className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${
                request.status === 'pending' ? 'bg-orange-500' : 'bg-green-500'
              }`}></div>
              <div>
                <p className="font-medium text-gray-900 text-sm sm:text-base">{request.name}</p>
                <p className="text-xs text-gray-600">{request.type}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-500">{request.time}</span>
              <button className="p-2 text-gray-400 hover:text-blue-600 rounded-xl transition-colors opacity-0 group-hover:opacity-100">
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkerRequests;