import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3, Users, CheckCircle, Clock, AlertCircle,
  Settings, IndianRupee, MapPin, Filter, Search,
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
import AdminSettings from '../components/admin/AdminSettings';
import AreaWiseWorkerManagement from '../components/admin/AreaWiseWorkerManagement';
import AdminSkillsServices from '../components/admin/AdminSkillsServices';

// Navigation items configuration
const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'payments', label: 'Payments', icon: IndianRupee },
  { id: 'agents', label: 'Service Agents', icon: MapPin },
  { id: 'area-workers', label: 'Area Workers', icon: Users },
  { id: 'skills-services', label: 'Skills & Services', icon: Settings },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings }
];

// Responsive breakpoints
const BREAKPOINTS = {
  MOBILE: 640,
  TABLET: 768,
  LAPTOP: 1024,
  DESKTOP: 1280,
  XL: 1536
};

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= BREAKPOINTS.LAPTOP);
  const [activeTab, setActiveTab] = useState('overview');
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  const { getUser, logout } = useAuthStore();
  const navigate = useNavigate();

  // Memoized responsive calculations
  const isMobile = windowDimensions.width < BREAKPOINTS.TABLET;
  const isTablet = windowDimensions.width >= BREAKPOINTS.TABLET && windowDimensions.width < BREAKPOINTS.LAPTOP;
  const isLaptop = windowDimensions.width >= BREAKPOINTS.LAPTOP && windowDimensions.width < BREAKPOINTS.DESKTOP;
  const isDesktop = windowDimensions.width >= BREAKPOINTS.DESKTOP;
  const isXL = windowDimensions.width >= BREAKPOINTS.XL;

  // Handle window resize with debouncing
  const handleResize = useCallback(() => {
    setWindowDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    });

    // Auto-manage sidebar based on screen size
    if (window.innerWidth >= BREAKPOINTS.LAPTOP) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    // Throttled resize handler
    let resizeTimeout;
    const resizeThrottler = () => {
      if (!resizeTimeout) {
        resizeTimeout = setTimeout(() => {
          resizeTimeout = null;
          handleResize();
        }, 100);
      }
    };

    window.addEventListener('resize', resizeThrottler);
    handleResize(); // Initial call

    return () => {
      window.removeEventListener('resize', resizeThrottler);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, [handleResize]);

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await getUser();
        if (!response.success) {
          navigate('/login');
          toast.error('Please login to access admin dashboard');
          return;
        }

        if (response.user.role !== 'ADMIN') {
          toast.error('Access denied. Admin privileges required.');
          // Redirect based on user role
          const roleRoutes = {
            'WORKER': '/worker',
            'CUSTOMER': '/customer/dashboard',
            'SERVICE_AGENT': '/serviceAgentDashboard'
          };
          
          navigate(roleRoutes[response.user.role] || '/login');
          return;
        }

        if (!response.user.isVerified) {
          navigate('/otpVerification');
          toast.error('Please verify your email to continue');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        toast.error('Authentication error occurred');
        navigate('/login');
      }
    };
    
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render active component based on selected tab
  const renderActiveComponent = () => {
    const componentMap = {
      'overview': <AdminOverview />,
      'users': <AdminUserManagement />,
      'verification': <AdminVerification />,
      'bookings': <AdminBookings />,
      'payments': <AdminPayments />,
      'agents': <AdminServiceAgents />,
      'area-workers': <AreaWiseWorkerManagement />,
      'skills-services': <AdminSkillsServices />,
      'reports': <AdminReports />,
      'settings': <AdminSettings />
    };

    return componentMap[activeTab] || <AdminOverview />;
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (isMobile || isTablet) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error during logout');
    }
  };

  // Mobile bottom navigation items (first 4 items + more button)
  const mobileNavItems = NAV_ITEMS.slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Toaster
        position={isMobile ? "top-center" : "top-right"}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: isMobile ? '12px' : '14px',
            margin: isMobile ? '4px' : '0',
            maxWidth: isMobile ? '95vw' : '400px',
            padding: isMobile ? '8px 12px' : '12px 16px',
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
      <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="px-2 xs:px-3 sm:px-4 md:px-5 lg:px-6 py-2 sm:py-3 lg:py-4">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center space-x-1 xs:space-x-2 sm:space-x-3 md:space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1 xs:p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? (
                  <X className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Menu className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                )}
              </button>
              <div className="flex items-center space-x-1 xs:space-x-2 sm:space-x-3">
                <div className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg xs:rounded-xl flex items-center justify-center shadow-sm">
                  <BarChart3 className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="text-sm xs:text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                  {isMobile ? 'Admin' : isTablet ? 'Admin Panel' : 'Admin Dashboard'}
                </span>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-0 xs:space-x-1 sm:space-x-2 md:space-x-3 lg:space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  className="p-1 xs:p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 relative group"
                  aria-label="Notifications"
                >
                  <Bell className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 xs:w-2 xs:h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                  <div className="absolute -right-2 top-full mt-2 w-48 xs:w-56 sm:w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-3 xs:p-4">
                    <p className="text-xs xs:text-sm text-gray-600 text-center">No new notifications</p>
                  </div>
                </button>
              </div>

              {/* User Menu */}
              <div className="relative">
                <div className="relative group">
                  <button
                    className="flex items-center space-x-1 xs:space-x-2 p-1 xs:p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    aria-label="User menu"
                  >
                    <div className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
                      <User className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 text-white" />
                    </div>
                    {!isMobile && (
                      <>
                        <span className="font-medium text-xs xs:text-sm sm:text-base whitespace-nowrap">Admin</span>
                        <ChevronDown className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 transition-transform duration-200 group-hover:rotate-180" />
                      </>
                    )}
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-32 xs:w-36 sm:w-40 md:w-44 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-2 xs:px-3 py-2 xs:py-2.5 text-left hover:bg-gray-50 transition-colors text-red-600 text-xs xs:text-sm"
                    >
                      <LogOut className="w-3 h-3 xs:w-4 xs:h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex pt-10 xs:pt-12 sm:pt-14 md:pt-16">
        {/* Sidebar */}
        {sidebarOpen && (
          <div 
            className={`
              fixed lg:relative inset-y-0 left-0 z-40 lg:z-auto 
              bg-white/95 lg:bg-white/80 backdrop-blur-lg lg:backdrop-blur-sm 
              border-r border-gray-200 min-h-screen
              transition-transform duration-300 ease-in-out
              ${isMobile ? 'w-full' : 
                isTablet ? 'w-56' : 
                isLaptop ? 'w-64' : 
                isDesktop ? 'w-72' : 
                'w-80'}
            `}
          >
            <div className={`p-3 xs:p-4 sm:p-5 md:p-6 space-y-3 xs:space-y-4 sm:space-y-5 md:space-y-6 h-full overflow-y-auto ${
              isMobile ? 'pt-16' : ''
            }`}>
              {/* Close button for mobile */}
              {isMobile && (
                <div className="flex justify-between items-center lg:hidden pb-3 xs:pb-4 border-b border-gray-200">
                  <h2 className="text-base xs:text-lg font-semibold text-gray-800">Navigation</h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1.5 xs:p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    aria-label="Close sidebar"
                  >
                    <X className="w-4 h-4 xs:w-5 xs:h-5" />
                  </button>
                </div>
              )}

              {/* Navigation Menu */}
              <div className="space-y-1 xs:space-y-2">
                {NAV_ITEMS.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`
                        w-full flex items-center space-x-2 xs:space-x-3 p-2 xs:p-3 rounded-lg xs:rounded-xl 
                        transition-all duration-200 text-xs xs:text-sm sm:text-base
                        ${activeTab === item.id
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-100 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <IconComponent className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="font-medium text-left whitespace-nowrap truncate">
                        {isMobile ? item.label.split(' ')[0] : item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div
          className={`
            flex-1 transition-all duration-300 min-h-screen
            ${sidebarOpen && (isLaptop || isDesktop || isXL) ? 'lg:ml-0' : ''}
          `}
        >
          <div className="p-2 xs:p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8">
            {/* Mobile Header for Current Section */}
            {isMobile && (
              <div className="mb-3 xs:mb-4 p-3 xs:p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <h1 className="text-base xs:text-lg font-semibold text-gray-800">
                  {NAV_ITEMS.find(item => item.id === activeTab)?.label || 'Overview'}
                </h1>
              </div>
            )}

            {/* Active Component */}
            <div className={isMobile ? 'space-y-3 xs:space-y-4' : 'space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8'}>
              {renderActiveComponent()}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (isMobile || isTablet) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Bottom Navigation */}
      {(isMobile || isTablet) && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 lg:hidden shadow-lg">
          <div className="flex overflow-x-auto py-1 xs:py-2 px-1 hide-scrollbar">
            {mobileNavItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`
                    flex flex-col items-center p-1 xs:p-2 min-w-14 xs:min-w-16 rounded-lg 
                    transition-colors duration-200 flex-1 mx-0.5 xs:mx-1
                    ${activeTab === item.id
                      ? 'text-blue-600 bg-blue-50 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  <IconComponent className="w-3.5 h-3.5 xs:w-4 xs:h-4 mb-0.5 xs:mb-1" />
                  <span className="text-[10px] xs:text-xs font-medium truncate max-w-full px-0.5 xs:px-1">
                    {item.label.split(' ')[0]}
                  </span>
                </button>
              );
            })}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex flex-col items-center p-1 xs:p-2 min-w-14 xs:min-w-16 rounded-lg transition-colors duration-200 flex-1 mx-0.5 xs:mx-1 text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-3.5 h-3.5 xs:w-4 xs:h-4 mb-0.5 xs:mb-1" />
              <span className="text-[10px] xs:text-xs font-medium">More</span>
            </button>
          </div>
        </div>
      )}

      {/* Add padding for mobile bottom nav */}
      {(isMobile || isTablet) && <div className="h-12 xs:h-14 sm:h-16"></div>}

      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;