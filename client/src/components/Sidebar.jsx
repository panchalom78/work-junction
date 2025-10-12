import React from 'react';
import { 
  MapPin, Shield, Users, MessageCircle, 
  FileText, Send, Download, Upload 
} from 'lucide-react';

const Sidebar = ({ sidebarOpen, activeTab, setActiveTab }) => {
  if (!sidebarOpen) return null;

  const menuItems = [
    { id: 'overview', label: 'Area Overview', icon: MapPin },
    { id: 'verification', label: 'Verification', icon: Shield },
    { id: 'workers', label: 'Worker Management', icon: Users },
    { id: 'requests', label: 'Worker Requests', icon: MessageCircle },
    { id: 'reports', label: 'Area Reports', icon: FileText },
    { id: 'messages', label: 'Messages', icon: Send }
  ];

  return (
    <div className="w-64 bg-white/80 backdrop-blur-lg border-r border-gray-200 min-h-screen fixed h-full overflow-y-auto">
      <div className="p-4 sm:p-6 space-y-8">
        {/* Navigation Menu */}
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-100 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-sm sm:text-base">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
          <h3 className="font-semibold text-blue-900 mb-3 text-sm sm:text-base">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center space-x-2 p-2 text-xs sm:text-sm bg-white rounded-xl hover:shadow-md transition-all">
              <Download className="w-4 h-4 text-blue-600" />
              <span>Export Reports</span>
            </button>
            <button className="w-full flex items-center space-x-2 p-2 text-xs sm:text-sm bg-white rounded-xl hover:shadow-md transition-all">
              <Upload className="w-4 h-4 text-green-600" />
              <span>Upload Bulk Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;