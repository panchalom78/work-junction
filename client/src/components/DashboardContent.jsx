import React, { useEffect, useState } from 'react';
import StatsGrid from './StatsGrid';
import VerificationTab from './tabs/VerificationTab';
import WorkerRequests from './WorkerRequests';
import ProgressStats from './ProgressStats';
import axiosInstance from '../utils/axiosInstance';
import VerificationQueue from './VerificationQueue';

const DashboardContent = ({ sidebarOpen, activeTab, setSelectedWorker }) => {
  const [areaStats, setAreaStats] = useState([]);
  const [queue, setQueue] = useState([]);
  const [workerRequests, setWorkerRequests] = useState([]);
  const [progressStats, setProgressStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch Area Stats
        const areaStatsRes = await axiosInstance.get('/api/service-agent/area-stats');
        console.log(areaStatsRes);
        if (areaStatsRes.data && areaStatsRes.data.success) {
          setAreaStats(areaStatsRes.data.data);
        }

        // Fetch Progress Stats
        const progressRes = await axiosInstance.get('/api/service-agent/stats');
        if (progressRes.data && progressRes.data.success) {
          setProgressStats(progressRes.data.data.verificationsCompleted);
        }

        // TODO: Replace with API for verification queue & worker requests
        // These APIs are not defined in the backend context given, so maintain the mocks for now
        setQueue([
          { 
            id: 1, 
            name: 'Sanjay Verma', 
            service: 'Plumber', 
            submitted: '2 hours ago', 
            priority: 'high',
            documents: { aadhaar: true, selfie: true, police: true },
            location: 'Andheri East'
          },
          { 
            id: 2, 
            name: 'Meena Iyer', 
            service: 'Electrician', 
            submitted: '4 hours ago', 
            priority: 'medium',
            documents: { aadhaar: true, selfie: false, police: true },
            location: 'Bandra West'
          }
        ]);
        setWorkerRequests([
          { name: 'Amit Sharma', type: 'Profile Update', time: '30 min ago', status: 'pending' },
          { name: 'Priya Patel', type: 'Document Re-upload', time: '1 hour ago', status: 'pending' }
        ]);
      } catch (e) {
        // handle error (for real, would show toast or set error state)
        setAreaStats([]);
        setQueue([]);
        setWorkerRequests([]);
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  // Render content based on activeTab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <StatsGrid stats={areaStats} loading={loading} />
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <VerificationQueue 
                queue={queue} 
                setSelectedWorker={setSelectedWorker}
              />
              
              <div className="space-y-6">
                <WorkerRequests requests={workerRequests} />
                <ProgressStats progressData={progressStats} loading={loading}/>
              </div>
            </div>
          </>
        );
      
      case 'verification':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Verification Dashboard</h2>
              <VerificationTab
                queue={queue} 
                setSelectedWorker={setSelectedWorker}
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Verification Progress</h3>
                <ProgressStats progressData={progressStats} loading={loading}/>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Pending Requests</h3>
                <WorkerRequests requests={workerRequests} />
              </div>
            </div>
          </div>
        );
      
      case 'workers':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Workers Management</h2>
            <p className="text-gray-600">Workers management content will be displayed here.</p>
            {/* You can add Workers component here */}
          </div>
        );
      
      case 'analytics':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Analytics</h2>
            <p className="text-gray-600">Analytics content will be displayed here.</p>
            {/* You can add Analytics component here */}
          </div>
        );
      
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Settings</h2>
            <p className="text-gray-600">Settings content will be displayed here.</p>
            {/* You can add Settings component here */}
          </div>
        );
      
      default:
        return (
          <>
            <StatsGrid stats={areaStats} loading={loading} />
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <VerificationQueue 
                queue={queue} 
                setSelectedWorker={setSelectedWorker}
              />
              
              <div className="space-y-6">
                <WorkerRequests requests={workerRequests} />
                <ProgressStats progressData={progressStats} loading={loading}/>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-0 lg:ml-64' : 'ml-0'}`}>
      <div className="p-4 sm:p-6 space-y-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default DashboardContent;