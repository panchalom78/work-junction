import React, { useState } from 'react';
import TopNavigation from '../components/TopNavigation';
import Sidebar from '../components/Sidebar';
import DashboardContent from '../components/DashboardContent';
import DocumentViewer from '../components/DocumentViewer';

const ServiceAgentDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedWorker, setSelectedWorker] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <TopNavigation 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
      
      <div className="flex pt-16">
        <Sidebar 
          sidebarOpen={sidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        
        <DashboardContent 
          sidebarOpen={sidebarOpen}
          activeTab={activeTab}
          setSelectedWorker={setSelectedWorker}
        />
      </div>

      {selectedWorker && (
        <DocumentViewer 
          worker={selectedWorker} 
          onClose={() => setSelectedWorker(null)} 
        />
      )}
    </div>
  );
};

export default ServiceAgentDashboard;