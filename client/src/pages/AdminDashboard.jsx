// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   BarChart3, Users, CheckCircle, Clock, AlertCircle,
//   Settings, IndianRupee , MapPin, Filter, Search,
//   Menu, X, ChevronDown, Bell, User, LogOut,
//   TrendingUp, Shield, FileText, Calendar
// } from 'lucide-react';
// import { Toaster } from 'react-hot-toast';
// import toast from 'react-hot-toast';
// import { useAuthStore } from '../store/auth.store';

// // Import admin components
// import AdminOverview from '../components/admin/AdminOverview';
// import AdminUserManagement from '../components/admin/AdminUserManagement';
// import AdminBookings from '../components/admin/AdminBookings';
// import AdminPayments from '../components/admin/AdminPayments';
// import AdminServiceAgents from '../components/admin/AdminServiceAgents';
// import AdminReports from '../components/admin/AdminReports';
// import AdminSettings from '../components/admin/AdminSettings';
// import AreaWiseWorkerManagement from '../components/admin/AreaWiseWorkerManagement';

// const AdminDashboard = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
//   const { getUser, logout } = useAuthStore();
//   const navigate = useNavigate();

//   // Handle responsive sidebar and mobile detection
//   useEffect(() => {
//     const handleResize = () => {
//       const mobile = window.innerWidth < 768;
//       setIsMobile(mobile);

//       if (window.innerWidth >= 1024) {
//         setSidebarOpen(true);
//       } else {
//         setSidebarOpen(false);
//       }
//     };

//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   // Authentication check
//   useEffect(() => {
//     const checkAuth = async () => {
//       const response = await getUser();
//       if (!response.success) {
//         navigate('/login');
//         toast.error('Please login to access admin dashboard');
//         return;
//       }

//       if (response.user.role !== 'ADMIN') {
//         toast.error('Access denied. Admin privileges required.');
//         // Redirect based on user role
//         if (response.user.role === 'WORKER') {
//           navigate('/worker');
//         } else if (response.user.role === 'CUSTOMER') {
//           navigate('/customer/dashboard');
//         } else if (response.user.role === 'SERVICE_AGENT') {
//           navigate('/serviceAgentDashboard');
//         } else {
//           navigate('/login');
//         }
//         return;
//       }

//       if (!response.user.isVerified) {
//         navigate('/otpVerification');
//         toast.error('Please verify your email to continue');
//       }
//     };
//     checkAuth();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Render active component based on selected tab
//   const renderActiveComponent = () => {
//     switch (activeTab) {
//       case 'overview':
//         return <AdminOverview />;
//       case 'users':
//         return <AdminUserManagement />;
//       case 'verification':
//         return <AdminVerification />;
//       case 'bookings':
//         return <AdminBookings />;
//       case 'payments':
//         return <AdminPayments />;
//       case 'agents':
//         return <AdminServiceAgents />;
//       case 'area-workers':
//         return <AreaWiseWorkerManagement />;
//       case 'reports':
//         return <AdminReports />;
//       case 'settings':
//         return <AdminSettings />;
//       default:
//         return <AdminOverview />;
//     }
//   };

//   // Navigation items
//   const navItems = [
//     { id: 'overview', label: 'Overview', icon: BarChart3 },
//     { id: 'users', label: 'User Management', icon: Users },
//     { id: 'bookings', label: 'Bookings', icon: Calendar },
//     { id: 'payments', label: 'Payments', icon: IndianRupee  },
//     { id: 'agents', label: 'Service Agents', icon: MapPin },
//     { id: 'area-workers', label: 'Area Workers', icon: Users },
//     { id: 'reports', label: 'Reports', icon: FileText },
//     { id: 'settings', label: 'Settings', icon: Settings }
//   ];

//   const handleTabChange = (tabId) => {
//     setActiveTab(tabId);
//     if (window.innerWidth < 1024) {
//       setSidebarOpen(false);
//     }
//   };

//   const handleLogout = async () => {
//     await logout();
//     navigate('/login');
//     toast.success('Logged out successfully');
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
//       <Toaster
//         position={isMobile ? "top-center" : "top-right"}
//         toastOptions={{
//           duration: 4000,
//           style: {
//             background: '#363636',
//             color: '#fff',
//             fontSize: isMobile ? '14px' : '16px',
//             margin: isMobile ? '8px' : '0',
//             maxWidth: isMobile ? '90vw' : '400px',
//           },
//           success: {
//             duration: 3000,
//             iconTheme: {
//               primary: '#4ade80',
//               secondary: '#fff',
//             },
//           },
//           error: {
//             duration: 5000,
//             iconTheme: {
//               primary: '#ef4444',
//               secondary: '#fff',
//             },
//           },
//         }}
//       />

//       {/* Top Navigation */}
//       <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200">
//         <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
//           <div className="flex items-center justify-between">
//             {/* Left Section */}
//             <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
//               <button
//                 onClick={() => setSidebarOpen(!sidebarOpen)}
//                 className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
//                 aria-label="Toggle sidebar"
//               >
//                 {sidebarOpen ? (
//                   <X className="w-4 h-4 sm:w-5 sm:h-5" />
//                 ) : (
//                   <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
//                 )}
//               </button>
//               <div className="flex items-center space-x-2 sm:space-x-3">
//                 <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
//                   <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
//                 </div>
//                 <span className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                   {isMobile ? 'Admin' : 'Admin Dashboard'}
//                 </span>
//               </div>
//             </div>

//             {/* Right Section */}
//             <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
//               {/* Notifications */}
//               <div className="relative">
//                 <button
//                   className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
//                   aria-label="Notifications"
//                 >
//                   <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
//                   <span className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
//                 </button>
//               </div>

//               {/* User Menu */}
//               <div className="relative">
//                 <div className="relative group">
//                   <button
//                     className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
//                     aria-label="User menu"
//                   >
//                     <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
//                       <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
//                     </div>
//                     {!isMobile && (
//                       <>
//                         <span className="font-medium text-sm sm:text-base">Admin</span>
//                         <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
//                       </>
//                     )}
//                   </button>
//                   {/* Dropdown Menu */}
//                   <div className="absolute right-0 mt-2 w-36 sm:w-44 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
//                     <button
//                       onClick={handleLogout}
//                       className="w-full flex items-center space-x-2 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors text-red-600 text-sm"
//                     >
//                       <LogOut className="w-4 h-4" />
//                       <span>Logout</span>
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Main Layout */}
//       <div className="flex pt-12 sm:pt-14 lg:pt-16">
//         {/* Sidebar */}
//         {sidebarOpen && (
//           <div className={`fixed lg:relative inset-y-0 left-0 z-40 lg:z-auto 
//             ${isMobile ? 'w-full' : 'w-64'} 
//             bg-white/95 lg:bg-white/80 backdrop-blur-lg lg:backdrop-blur-lg 
//             border-r border-gray-200 min-h-screen`}
//           >
//             <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8">
//               {/* Close button for mobile */}
//               {isMobile && (
//                 <div className="flex justify-end lg:hidden">
//                   <button
//                     onClick={() => setSidebarOpen(false)}
//                     className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
//                     aria-label="Close sidebar"
//                   >
//                     <X className="w-5 h-5" />
//                   </button>
//                 </div>
//               )}

//               {/* Navigation Menu */}
//               <div className="space-y-1 sm:space-y-2">
//                 {navItems.map((item) => (
//                   <button
//                     key={item.id}
//                     onClick={() => handleTabChange(item.id)}
//                     className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-sm sm:text-base ${activeTab === item.id
//                         ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-100 shadow-sm'
//                         : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
//                       }`}
//                   >
//                     <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
//                     <span className="font-medium text-left">{item.label}</span>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Main Content */}
//         <div
//           className={` transition-all duration-300 min-h-screen ${sidebarOpen ? '' : 'ml-0'
//             }`}
//         >
//           <div className="p-3 sm:p-4 lg:p-6">
//             {/* Mobile Header for Current Section */}
//             {isMobile && (
//               <div className="mb-4 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
//                 <h1 className="text-lg font-semibold text-gray-800">
//                   {navItems.find(item => item.id === activeTab)?.label || 'Overview'}
//                 </h1>
//               </div>
//             )}

//             {/* Active Component */}
//             <div className={isMobile ? 'space-y-4' : 'space-y-6'}>
//               {renderActiveComponent()}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Mobile overlay */}
//       {sidebarOpen && isMobile && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Mobile Bottom Navigation */}
//       {isMobile && (
//         <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 lg:hidden">
//           <div className="flex overflow-x-auto py-2 px-1">
//             {navItems.slice(0, 4).map((item) => (
//               <button
//                 key={item.id}
//                 onClick={() => handleTabChange(item.id)}
//                 className={`flex flex-col items-center p-2 min-w-16 rounded-lg transition-colors flex-1 mx-1 ${activeTab === item.id
//                     ? 'text-blue-600 bg-blue-50'
//                     : 'text-gray-600 hover:text-gray-900'
//                   }`}
//               >
//                 <item.icon className="w-4 h-4 mb-1" />
//                 <span className="text-xs font-medium truncate max-w-full">
//                   {item.label.split(' ')[0]}
//                 </span>
//               </button>
//             ))}
//             <button
//               onClick={() => setSidebarOpen(true)}
//               className="flex flex-col items-center p-2 min-w-16 rounded-lg transition-colors flex-1 mx-1 text-gray-600 hover:text-gray-900"
//             >
//               <Menu className="w-4 h-4 mb-1" />
//               <span className="text-xs font-medium">More</span>
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Add padding for mobile bottom nav */}
//       {isMobile && <div className="h-16"></div>}
//     </div>
//   );
// };

// export default AdminDashboard;


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
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280
};

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= BREAKPOINTS.TABLET);
  const [activeTab, setActiveTab] = useState('overview');
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  const { getUser, logout } = useAuthStore();
  const navigate = useNavigate();

  // Memoized responsive calculations
  const isMobile = windowDimensions.width < BREAKPOINTS.MOBILE;
  const isTablet = windowDimensions.width >= BREAKPOINTS.MOBILE && windowDimensions.width < BREAKPOINTS.TABLET;
  const isDesktop = windowDimensions.width >= BREAKPOINTS.TABLET;

  // Handle window resize with debouncing
  const handleResize = useCallback(() => {
    setWindowDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    });

    // Auto-manage sidebar based on screen size
    if (window.innerWidth >= BREAKPOINTS.TABLET) {
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
    if (!isDesktop) {
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
            fontSize: isMobile ? '14px' : '16px',
            margin: isMobile ? '8px' : '0',
            maxWidth: isMobile ? '90vw' : '400px',
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
        <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? (
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <span className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {isMobile ? 'Admin' : 'Admin Dashboard'}
                </span>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 relative group"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                  <div className="absolute -right-2 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-4">
                    <p className="text-sm text-gray-600 text-center">No new notifications</p>
                  </div>
                </button>
              </div>

              {/* User Menu */}
              <div className="relative">
                <div className="relative group">
                  <button
                    className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    aria-label="User menu"
                  >
                    <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
                      <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                    </div>
                    {!isMobile && (
                      <>
                        <span className="font-medium text-sm sm:text-base">Admin</span>
                        <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 group-hover:rotate-180" />
                      </>
                    )}
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-36 sm:w-44 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors text-red-600 text-sm"
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

      {/* Main Layout */}
      <div className="flex pt-12 sm:pt-14 lg:pt-16">
        {/* Sidebar */}
        {sidebarOpen && (
          <div 
            className={`
              fixed lg:relative inset-y-0 left-0 z-40 lg:z-auto 
              bg-white/95 lg:bg-white/80 backdrop-blur-lg lg:backdrop-blur-sm 
              border-r border-gray-200 min-h-screen
              transition-transform duration-300 ease-in-out
              ${isMobile ? 'w-full' : isTablet ? 'w-64' : 'w-72'}
            `}
          >
            <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8 h-full overflow-y-auto">
              {/* Close button for mobile */}
              {isMobile && (
                <div className="flex justify-between items-center lg:hidden pb-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Navigation</h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    aria-label="Close sidebar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Navigation Menu */}
              <div className="space-y-1 sm:space-y-2">
                {NAV_ITEMS.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`
                        w-full flex items-center space-x-3 p-3 rounded-xl 
                        transition-all duration-200 text-sm sm:text-base
                        ${activeTab === item.id
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-100 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="font-medium text-left whitespace-nowrap">
                        {item.label}
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
            ${sidebarOpen && isDesktop ? 'lg:ml-0' : ''}
          `}
        >
          <div className="p-3 sm:p-4 lg:p-6">
            {/* Mobile Header for Current Section */}
            {isMobile && (
              <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <h1 className="text-lg font-semibold text-gray-800">
                  {NAV_ITEMS.find(item => item.id === activeTab)?.label || 'Overview'}
                </h1>
              </div>
            )}

            {/* Active Component */}
            <div className={isMobile ? 'space-y-4' : 'space-y-6'}>
              {renderActiveComponent()}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 lg:hidden shadow-lg">
          <div className="flex overflow-x-auto py-2 px-1 hide-scrollbar">
            {mobileNavItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`
                    flex flex-col items-center p-2 min-w-16 rounded-lg 
                    transition-colors duration-200 flex-1 mx-1
                    ${activeTab === item.id
                      ? 'text-blue-600 bg-blue-50 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  <IconComponent className="w-4 h-4 mb-1" />
                  <span className="text-xs font-medium truncate max-w-full px-1">
                    {item.label.split(' ')[0]}
                  </span>
                </button>
              );
            })}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex flex-col items-center p-2 min-w-16 rounded-lg transition-colors duration-200 flex-1 mx-1 text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-4 h-4 mb-1" />
              <span className="text-xs font-medium">More</span>
            </button>
          </div>
        </div>
      )}

      {/* Add padding for mobile bottom nav */}
      {isMobile && <div className="h-16"></div>}

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
