import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, Users, CheckCircle, Clock, AlertCircle,
  Settings, DollarSign, MapPin, Filter, Search,
  Menu, X, ChevronDown, Bell, User, LogOut,
  TrendingUp, Shield, FileText, Calendar
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/auth.store';

// Import admin components
import AdminOverview from '../components/admin/AdminOverview';
import AdminUserManagement from '../components/admin/AdminUserManagement';
import AdminVerification from '../components/admin/AdminVerification';
import AdminBookings from '../components/admin/AdminBookings';
import AdminPayments from '../components/admin/AdminPayments';
import AdminServiceAgents from '../components/admin/AdminServiceAgents';
import AdminReports from '../components/admin/AdminReports';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { getUser, logout } = useAuthStore();
  const navigate = useNavigate();

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      const response = await getUser();
      if (!response.success) {
        navigate('/login');
        toast.error('Please login to access admin dashboard');
        return;
      }

      if (response.user.role !== 'ADMIN') {
        toast.error('Access denied. Admin privileges required.');
        // Redirect based on user role
        if (response.user.role === 'WORKER') {
          navigate('/worker');
        } else if (response.user.role === 'CUSTOMER') {
          navigate('/customer/dashboard');
        } else if (response.user.role === 'SERVICE_AGENT') {
          navigate('/serviceAgentDashboard');
        } else {
          navigate('/login');
        }
        return;
      }

      if (!response.user.isVerified) {
        navigate('/otpVerification');
        toast.error('Please verify your email to continue');
      }
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render active component based on selected tab
  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview />;
      case 'users':
        return <AdminUserManagement />;
      case 'verification':
        return <AdminVerification />;
      case 'bookings':
        return <AdminBookings />;
      case 'payments':
        return <AdminPayments />;
      case 'agents':
        return <AdminServiceAgents />;
      case 'reports':
        return <AdminReports />;
      case 'settings':
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Settings component will be implemented here</p>
            </div>
          </div>
        );
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
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
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">Admin</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <button
                      onClick={async () => {
                        await logout();
                        navigate('/login');
                        toast.success('Logged out successfully');
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-50 transition-colors text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
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
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${activeTab === item.id
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
          <div className="p-6">
            {renderActiveComponent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;