import React from 'react';
import StatsGrid from './StatsGrid';
import VerificationQueue from './VerificationQueue';
import WorkerRequests from './WorkerRequests';
import ProgressStats from './ProgressStats';

const DashboardContent = ({ sidebarOpen, activeTab, setSelectedWorker }) => {
  // Mock data
  const areaStats = [
    { 
      title: 'Assigned Workers', 
      value: '247', 
      change: '+8%', 
      icon: 'Users',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      title: 'Pending Verifications', 
      value: '23', 
      change: '+3%', 
      icon: 'Clock',
      color: 'from-orange-500 to-orange-600'
    },
    { 
      title: 'Verified This Week', 
      value: '42', 
      change: '+15%', 
      icon: 'CheckCircle',
      color: 'from-green-500 to-green-600'
    },
    { 
      title: 'Avg. Response Time', 
      value: '2.4h', 
      change: '-12%', 
      icon: 'TrendingUp',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const verificationQueue = [
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
  ];

  const workerRequests = [
    { name: 'Amit Sharma', type: 'Profile Update', time: '30 min ago', status: 'pending' },
    { name: 'Priya Patel', type: 'Document Re-upload', time: '1 hour ago', status: 'pending' }
  ];

  return (
    <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-0 lg:ml-64' : 'ml-0'}`}>
      <div className="p-4 sm:p-6 space-y-6">
        <StatsGrid stats={areaStats} />
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <VerificationQueue 
            queue={verificationQueue} 
            setSelectedWorker={setSelectedWorker}
          />
          
          <div className="space-y-6">
            <WorkerRequests requests={workerRequests} />
            <ProgressStats />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;