import React, { useState } from 'react';
import { 
  BarChart3, Users, CheckCircle, Clock, AlertCircle, 
  Settings, IndianRupee , MapPin, Filter, Search,
  Menu, X, ChevronDown, Bell, User, LogOut,
  TrendingUp, Shield, FileText, Calendar
} from 'lucide-react';
import { Routes, Route, NavLink } from 'react-router-dom';
import UserManagement from '../components/UserManagement';

const AdminDashboard = () => {
  const [sidebarOpen] = useState(true);

  // Mock data - replace with actual API calls
  const dashboardStats = [
    // ... (keeping your existing dashboardStats data)
  ];


  const _verificationQueue = [
    // ... (keeping your existing verificationQueue data)
  ];

  // Sidebar menu items
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3, path: '/admin' },
    { id: 'users', label: 'User Management', icon: Users, path: '/admin/users' },
    { id: 'verification', label: 'Verification', icon: Shield, path: '/admin/verification' },
    { id: 'bookings', label: 'Bookings', icon: Calendar, path: '/admin/bookings' },
    { id: 'payments', label: 'Payments', icon: IndianRupee , path: '/admin/payments' },
    { id: 'agents', label: 'Service Agents', icon: MapPin, path: '/admin/agents' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/admin/reports' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Top Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        {/* ... (keeping your existing nav code) */}
      </nav>

      <div className="flex pt-16">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-64 bg-white/80 backdrop-blur-lg border-r border-gray-200 min-h-screen fixed h-full">
            <div className="p-6 space-y-8">
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) =>
                      `w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-100' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                ))}
              </div>
              {/* Quick Stats */}
              {/* ... (keeping your existing quick stats code) */}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300`}>
          <Routes>
            <Route path="/" element={
              <div className="p-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {dashboardStats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
                      {/* ... (keeping your existing stat card code) */}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Activities */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    {/* ... (keeping your existing recent activities code) */}
                  </div>

                  {/* Verification Queue */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    {/* ... (keeping your existing verification queue code) */}
                  </div>
                </div>

                {/* Charts Section */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  {/* ... (keeping your existing charts section code) */}
                </div>
              </div>
            } />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/verification" element={<div>Verification Component</div>} />
            <Route path="/bookings" element={<div>Bookings Component</div>} />
            <Route path="/payments" element={<div>Payments Component</div>} />
            <Route path="/agents" element={<div>Service Agents Component</div>} />
            <Route path="/reports" element={<div>Reports Component</div>} />
            <Route path="/settings" element={<div>Settings Component</div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;