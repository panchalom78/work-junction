import React, { useEffect, useState } from 'react';
import StatsGrid from './StatsGrid';
import VerificationQueue from './VerificationQueue';
import WorkerRequests from './WorkerRequests';
import ProgressStats from './ProgressStats';
import WorkerManagement from '../components/tabs/WorkerManagement';
import NonSmartphoneWorkers from '../components/tabs/nonSmartPhone'; // New import
import VerificationTab from '../components/tabs/VerificationTab';
import CustomerRequests from '../components/tabs/request';
import axiosInstance from '../utils/axiosInstance';

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
        if (areaStatsRes.data && areaStatsRes.data.success) {
          setAreaStats(areaStatsRes.data.data);
        }

        // Fetch Progress Stats
        const progressRes = await axiosInstance.get('/api/service-agent/stats');
        if (progressRes.data && progressRes.data.success) {
          setProgressStats(progressRes.data.data.verificationsCompleted);
        }

        // Mock data
        setQueue([
          {
            id: 1,
            name: 'Sanjay Verma',
            service: 'Plumber',
            submitted: '2 hours ago',
            priority: 'high',
            documents: { aadhaar: true, selfie: true, police: true },
            location: 'Andheri East'
          }
        ]);
        setWorkerRequests([
          { name: 'Amit Sharma', type: 'Profile Update', time: '30 min ago', status: 'pending' }
        ]);
      } catch (e) {
        setAreaStats([]);
        setQueue([]);
        setWorkerRequests([]);
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

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
                <ProgressStats progressData={progressStats} loading={loading} />
              </div>
            </div>
          </>
        );

      case 'verification':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Verification Dashboard</h2>
              <VerificationTab />
            </div>

          </div>
        );

      case 'workers':
        return <WorkerManagement />;

      case 'non-smartphone-workers':
        return <NonSmartphoneWorkers />;

      case 'requests':
        return <CustomerRequests />

      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Settings</h2>
            <p className="text-gray-600">Settings content will be displayed here.</p>
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
                <ProgressStats progressData={progressStats} loading={loading} />
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