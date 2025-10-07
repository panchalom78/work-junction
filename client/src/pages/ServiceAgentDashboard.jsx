import React, { useState } from 'react';
import { 
  Users, CheckCircle, Clock, AlertCircle, 
  MapPin, Filter, Search, Menu, X, 
  ChevronDown, Bell, User, LogOut,
  FileText, Shield, MessageCircle, TrendingUp,
  Download, Upload, Eye, Edit, Send
} from 'lucide-react';

const ServiceAgentDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedWorker, setSelectedWorker] = useState(null);

  // Mock data - replace with actual API calls
  const areaStats = [
    { 
      title: 'Assigned Workers', 
      value: '247', 
      change: '+8%', 
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    { 
      title: 'Pending Verifications', 
      value: '23', 
      change: '+3%', 
      icon: Clock,
      color: 'from-orange-500 to-orange-600'
    },
    { 
      title: 'Verified This Week', 
      value: '42', 
      change: '+15%', 
      icon: CheckCircle,
      color: 'from-green-500 to-green-600'
    },
    { 
      title: 'Avg. Response Time', 
      value: '2.4h', 
      change: '-12%', 
      icon: TrendingUp,
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
    },
    { 
      id: 3, 
      name: 'Rohit Desai', 
      service: 'Carpenter', 
      submitted: '6 hours ago', 
      priority: 'low',
      documents: { aadhaar: true, selfie: true, police: false },
      location: 'Powai'
    }
  ];

  const workerRequests = [
    { name: 'Amit Sharma', type: 'Profile Update', time: '30 min ago', status: 'pending' },
    { name: 'Priya Patel', type: 'Document Re-upload', time: '1 hour ago', status: 'pending' },
    { name: 'Raj Malhotra', type: 'Availability Change', time: '2 hours ago', status: 'completed' }
  ];

  const DocumentViewer = ({ worker, onClose }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Verify Documents - {worker.name}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Document Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Aadhaar Card</h3>
              <p className="text-sm text-gray-600 mb-3">Identity Verification</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm">
                View Document
              </button>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Live Selfie</h3>
              <p className="text-sm text-gray-600 mb-3">Face Match Check</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm">
                View Selfie
              </button>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Police Verification</h3>
              <p className="text-sm text-gray-600 mb-3">Background Check</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm">
                View Certificate
              </button>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-4 pt-6 border-t border-gray-200">
            <button className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold flex items-center justify-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Approve Verification</span>
            </button>
            <button className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold flex items-center justify-center space-x-2">
              <X className="w-5 h-5" />
              <span>Reject with Reason</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Top Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Service Agent
                  </span>
                  <p className="text-xs text-gray-600">Mumbai Central Region</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
              </div>
              
              <div className="flex items-center space-x-3 bg-gray-100 rounded-xl px-3 py-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">Rahul Mehta</p>
                  <p className="text-xs text-gray-600">Service Agent</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-64 bg-white/80 backdrop-blur-lg border-r border-gray-200 min-h-screen fixed h-full">
            <div className="p-6 space-y-8">
              {/* Navigation Menu */}
              <div className="space-y-2">
                {[
                  { id: 'overview', label: 'Area Overview', icon: MapPin },
                  { id: 'verification', label: 'Verification', icon: Shield },
                  { id: 'workers', label: 'Worker Management', icon: Users },
                  { id: 'requests', label: 'Worker Requests', icon: MessageCircle },
                  { id: 'reports', label: 'Area Reports', icon: FileText },
                  { id: 'messages', label: 'Messages', icon: Send }
                ].map((item) => (
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
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
                <h3 className="font-semibold text-blue-900 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center space-x-2 p-2 text-sm bg-white rounded-xl hover:shadow-md transition-all">
                    <Download className="w-4 h-4 text-blue-600" />
                    <span>Export Reports</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 p-2 text-sm bg-white rounded-xl hover:shadow-md transition-all">
                    <Upload className="w-4 h-4 text-green-600" />
                    <span>Upload Bulk Data</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300`}>
          <div className="p-6 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {areaStats.map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      stat.change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Verification Queue */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Verification Queue</h2>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search workers..." 
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {verificationQueue.map((worker) => (
                    <div key={worker.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 group">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            worker.priority === 'high' ? 'bg-red-500' :
                            worker.priority === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                          }`}></div>
                          <div>
                            <p className="font-semibold text-gray-900">{worker.name}</p>
                            <p className="text-sm text-gray-600">{worker.service} • {worker.location}</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{worker.submitted}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
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
                <button className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Load More Pending Verifications</span>
                </button>
              </div>

              {/* Worker Requests & Quick Actions */}
              <div className="space-y-6">
                {/* Worker Requests */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Worker Requests</h2>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">3 New</span>
                  </div>
                  <div className="space-y-4">
                    {workerRequests.map((request, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            request.status === 'pending' ? 'bg-orange-500' : 'bg-green-500'
                          }`}></div>
                          <div>
                            <p className="font-medium text-gray-900">{request.name}</p>
                            <p className="text-sm text-gray-600">{request.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-500">{request.time}</span>
                          <button className="p-2 text-gray-400 hover:text-blue-600 rounded-xl transition-colors opacity-0 group-hover:opacity-100">
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Verification Stats */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-6">
                  <h3 className="font-semibold text-purple-900 mb-4">This Week's Progress</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-700">Verifications Completed</span>
                      <span className="font-bold text-purple-900">24/30</span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm text-purple-700">Avg. Processing Time</span>
                      <span className="font-bold text-purple-900">2.1h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
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