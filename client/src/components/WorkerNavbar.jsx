import React from 'react';
import { 
  User, 
  Briefcase, 
  Calendar, 
  Image, 
  Clock, 
  Settings,
  Menu,
  X
} from 'lucide-react';

const WorkerNavbar = ({ activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen }) => {
  const navigation = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'services', name: 'Services', icon: Briefcase },
    { id: 'bookings', name: 'Bookings', icon: Calendar },
    { id: 'portfolio', name: 'Portfolio', icon: Image },
    { id: 'availability', name: 'Availability', icon: Clock },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  const primaryGradient = "linear-gradient(to right, #2563EB, #7C3AED)";

  return (
    <>
      {/* ---------- Desktop Navigation ---------- */}
      <nav className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 
                      bg-white border-r border-gray-200 shadow-md">
        {/* Logo Section */}
        <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200"
             style={{ background: primaryGradient }}
        >
          <div className="w-9 h-9 rounded-lg flex items-center justify-center border-4 border-white shadow-sm">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="ml-2 text-xl font-extrabold tracking-wide bg-clip-text text-transparent"
                style={{ background: primaryGradient }}>
            WorkJunction
          </span>
        </div>
        
        {/* Navigation Links */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-4 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl 
                  transition-all duration-200 ease-in-out relative group
                  ${activeTab === item.id ? 'font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                style={activeTab === item.id 
                  ? { background: "rgba(37, 99, 235, 0.1)", borderLeft: "4px solid #2563EB" } 
                  : {}
                }
              >
                <item.icon 
                  className="w-5 h-5"
                  style={activeTab === item.id 
                    ? { color: "#2563EB" } 
                    : { color: "#6B7280" } // gray-500
                  }
                />
                <span className="text-sm font-medium bg-clip-text text-transparent"
                      style={activeTab === item.id ? { background: primaryGradient } : {}}>
                  {item.name}
                </span>

                {/* Active Tab Indicator */}
                {activeTab === item.id && (
                  <span className="absolute left-0 top-0 h-full w-1 rounded-r-md" 
                        style={{ background: "#2563EB" }}></span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-3 rounded-xl hover:shadow-md transition"
               style={{ background: "rgba(37, 99, 235, 0.1)" }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center"
                 style={{ background: primaryGradient }}>
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">Rajesh Kumar</p>
              <p className="text-xs text-gray-500 truncate">Plumbing Expert</p>
            </div>
          </div>
        </div>
      </nav>

      {/* ---------- Mobile Header ---------- */}
      <header className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center ml-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                   style={{ background: primaryGradient }}>
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-lg font-bold bg-clip-text text-transparent"
                    style={{ background: primaryGradient }}>
                WorkJunction
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                 style={{ background: "rgba(37, 99, 235, 0.1)" }}>
              <User className="w-4 h-4" style={{ color: "#2563EB" }} />
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 transition-all duration-300 ease-in-out">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg 
                              text-base font-medium transition-all duration-200`}
                  style={activeTab === item.id 
                    ? { background: "rgba(37, 99, 235, 0.1)", borderLeft: "4px solid #2563EB" } 
                    : {}
                  }
                >
                  <item.icon className="w-5 h-5" style={{ color: activeTab === item.id ? "#2563EB" : "#6B7280" }} />
                  <span className="bg-clip-text text-transparent"
                        style={activeTab === item.id ? { background: primaryGradient } : {}}>
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

export default WorkerNavbar;
