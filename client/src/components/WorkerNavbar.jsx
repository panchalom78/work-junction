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

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="ml-2 text-xl font-bold text-gray-900">WorkJunction</span>
        </div>
        
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="p-4 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Rajesh Kumar</p>
              <p className="text-xs text-gray-500 truncate">Plumbing Expert</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
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
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-lg font-bold text-gray-900">WorkJunction</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-all ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
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