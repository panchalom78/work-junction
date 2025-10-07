import React, { useState } from 'react';
import { 
  BarChart3, Users, CheckCircle, Clock, AlertCircle, 
  Settings, DollarSign, MapPin, Filter, Search,
  Menu, X, ChevronDown, Bell, User, LogOut,
  TrendingUp, Shield, FileText, Calendar
} from 'lucide-react';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with actual API calls
  const dashboardStats = [
    { 
      title: 'Total Users', 
      value: '12,847', 
      change: '+12%', 
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    { 
      title: 'Pending Verifications', 
      value: '234', 
      change: '+5%', 
      icon: Clock,
      color: 'from-orange-500 to-orange-600'
    },
    { 
      title: 'Active Bookings', 
      value: '1,234', 
      change: '+18%', 
      icon: CheckCircle,
      color: 'from-green-500 to-green-600'
    },
    { 
      title: 'Revenue', 
      value: '₹2,84,729', 
      change: '+23%', 
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const recentActivities = [
    { user: 'Raj Sharma', action: 'Worker verification submitted', time: '2 min ago', type: 'verification' },
    { user: 'Priya Patel', action: 'New booking created', time: '5 min ago', type: 'booking' },
    { user: 'Amit Kumar', action: 'Payment completed', time: '10 min ago', type: 'payment' },
    { user: 'Service Agent - Mumbai', action: 'Approved 5 workers', time: '15 min ago', type: 'agent' }
  ];

  const verificationQueue = [
    { name: 'Sanjay Verma', service: 'Plumber', submitted: '2 hours ago', priority: 'high' },
    { name: 'Meena Iyer', service: 'Electrician', submitted: '4 hours ago', priority: 'medium' },
    { name: 'Rohit Desai', service: 'Carpenter', submitted: '6 hours ago', priority: 'low' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Top Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
              </div>
              
              <div className="relative">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium">Admin</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
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
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'users', label: 'User Management', icon: Users },
                  { id: 'verification', label: 'Verification', icon: Shield },
                  { id: 'bookings', label: 'Bookings', icon: Calendar },
                  { id: 'payments', label: 'Payments', icon: DollarSign },
                  { id: 'agents', label: 'Service Agents', icon: MapPin },
                  { id: 'reports', label: 'Reports', icon: FileText },
                  { id: 'settings', label: 'Settings', icon: Settings }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                      activeTab === item.id 
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-100' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Verified Today</span>
                    <span className="font-semibold text-green-600">24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending Actions</span>
                    <span className="font-semibold text-orange-600">8</span>
                  </div>
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
              {dashboardStats.map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`text-sm font-medium ${
                      stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activities */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        activity.type === 'verification' ? 'bg-orange-100 text-orange-600' :
                        activity.type === 'booking' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'payment' ? 'bg-green-100 text-green-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {activity.type === 'verification' && <Shield className="w-5 h-5" />}
                        {activity.type === 'booking' && <Calendar className="w-5 h-5" />}
                        {activity.type === 'payment' && <DollarSign className="w-5 h-5" />}
                        {activity.type === 'agent' && <Users className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.user}</p>
                        <p className="text-sm text-gray-600">{activity.action}</p>
                      </div>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verification Queue */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Verification Queue</h2>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search..." 
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {verificationQueue.map((worker, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          worker.priority === 'high' ? 'bg-red-500' :
                          worker.priority === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-900">{worker.name}</p>
                          <p className="text-sm text-gray-600">{worker.service}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{worker.submitted}</span>
                        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                          Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors">
                  + Load More
                </button>
              </div>
            </div>

            {/* Charts Section */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Platform Analytics</h2>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Weekly
                  </button>
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Monthly
                  </button>
                </div>
              </div>
              <div className="h-64 bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Analytics charts will be displayed here</p>
                  <p className="text-sm text-gray-500">Integration with charting library required</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;