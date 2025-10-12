import React from 'react';

const ProgressStats = () => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-4 sm:p-6">
      <h3 className="font-semibold text-purple-900 mb-4 text-sm sm:text-base">This Week's Progress</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm text-purple-700">Verifications Completed</span>
          <span className="font-bold text-purple-900 text-sm sm:text-base">24/30</span>
        </div>
        <div className="w-full bg-purple-200 rounded-full h-2">
          <div className="bg-purple-600 h-2 rounded-full" style={{ width: '80%' }}></div>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs sm:text-sm text-purple-700">Avg. Processing Time</span>
          <span className="font-bold text-purple-900 text-sm sm:text-base">2.1h</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressStats;