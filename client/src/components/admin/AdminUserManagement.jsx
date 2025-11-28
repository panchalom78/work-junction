import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users, Search, Filter, MoreVertical, Eye, Edit,
  Ban, CheckCircle, XCircle, Phone, Mail, MapPin,
  ChevronLeft, ChevronRight, Loader, Shield, UserCheck,
  Briefcase, UserCog, Calendar, Download, Upload,
  BarChart3, RefreshCw, UserPlus, Settings
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

// Enhanced responsive breakpoints
const BREAKPOINTS = {
  xs: 480,   // Extra small devices (phones)
  sm: 640,   // Small devices (large phones)
  md: 768,   // Medium devices (tablets)
  lg: 1024,  // Large devices (laptops)
  xl: 1280,  // Extra large devices (desktops)
  '2xl': 1536 // 2X large devices (large desktops)
};

// Enhanced role configuration with cards
const ROLES = [
  {
    value: 'ALL',
    label: 'All Users',
    icon: Users,
    color: 'bg-gradient-to-r from-gray-500 to-gray-700',
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-200',
    description: 'Manage all platform users',
    count: 0
  },
  {
    value: 'CUSTOMER',
    label: 'Customers',
    icon: Users,
    color: 'bg-gradient-to-r from-purple-500 to-purple-700',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-200',
    description: 'Service consumers and clients',
    count: 0
  },
  {
    value: 'WORKER',
    label: 'Workers',
    icon: Briefcase,
    color: 'bg-gradient-to-r from-green-500 to-green-700',
    bgColor: 'bg-green-50',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
    description: 'Service providers and professionals',
    count: 0
  },
  {
    value: 'SERVICE_AGENT',
    label: 'Service Agents',
    icon: UserCog,
    color: 'bg-gradient-to-r from-blue-500 to-blue-700',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
    description: 'Service coordination and management',
    count: 0
  },
  {
    value: 'ADMIN',
    label: 'Admins',
    icon: Shield,
    color: 'bg-gradient-to-r from-red-500 to-red-700',
    bgColor: 'bg-red-50',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
    description: 'Platform administrators',
    count: 0
  }
];

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'All Status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' }
];

// Enhanced Mobile User Card Component
const MobileUserCard = ({ user, onView, onStatusToggle, actionLoading, getRoleConfig }) => {
  const roleConfig = getRoleConfig(user.role);
  const RoleIcon = roleConfig.icon;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 xs:p-4 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 xs:space-x-3 flex-1 min-w-0">
          <div className={`w-10 h-10 xs:w-12 xs:h-12 ${roleConfig.color} rounded-full flex items-center justify-center flex-shrink-0 shadow-md`}>
            <RoleIcon className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-gray-900 text-sm xs:text-base truncate">{user.name}</p>
            <p className="text-xs xs:text-sm text-gray-600 truncate mt-1">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => onStatusToggle(user._id, 'toggleStatus')}
          disabled={actionLoading}
          className={`p-1.5 xs:p-2 rounded-lg xs:rounded-xl transition-all duration-200 disabled:opacity-50 flex-shrink-0 ml-1 xs:ml-2 shadow-sm ${
            user.isActive
              ? 'bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-md'
              : 'bg-green-50 text-green-600 hover:bg-green-100 hover:shadow-md'
          }`}
          title={user.isActive ? 'Deactivate' : 'Activate'}
        >
          {actionLoading ? (
            <Loader className="w-3 h-3 xs:w-4 xs:h-4 animate-spin" />
          ) : user.isActive ? (
            <Ban className="w-3 h-3 xs:w-4 xs:h-4" />
          ) : (
            <CheckCircle className="w-3 h-3 xs:w-4 xs:h-4" />
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 xs:gap-3 mb-3">
        <div className="flex items-center space-x-1 xs:space-x-2 bg-gray-50 rounded-lg p-2">
          <Phone className="w-3 h-3 xs:w-4 xs:h-4 text-gray-500 flex-shrink-0" />
          <span className="text-xs xs:text-sm text-gray-700 truncate">{user.phone || 'N/A'}</span>
        </div>
        <div className="flex items-center space-x-1 xs:space-x-2 bg-gray-50 rounded-lg p-2">
          <MapPin className="w-3 h-3 xs:w-4 xs:h-4 text-gray-500 flex-shrink-0" />
          <span className="text-xs xs:text-sm text-gray-700 truncate">{user.address?.city || 'N/A'}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 xs:space-x-2">
          <span className={`px-2 xs:px-3 py-1 xs:py-1.5 rounded-full text-xs font-bold border-2 ${roleConfig.bgColor} ${roleConfig.textColor} ${roleConfig.borderColor}`}>
            {roleConfig.label}
          </span>
          <div className={`flex items-center space-x-1 px-1.5 xs:px-2 py-1 rounded-lg text-xs ${
            user.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {user.isActive ? (
              <CheckCircle className="w-2.5 h-2.5 xs:w-3 xs:h-3" />
            ) : (
              <XCircle className="w-2.5 h-2.5 xs:w-3 xs:h-3" />
            )}
            <span className="font-medium">
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <button
          onClick={() => onView(user)}
          className="flex items-center space-x-1 xs:space-x-2 px-3 xs:px-4 py-1.5 xs:py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg xs:rounded-xl text-xs xs:text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Eye className="w-3 h-3 xs:w-4 xs:h-4" />
          <span>View</span>
        </button>
      </div>

      <div className="mt-2 xs:mt-3 pt-2 xs:pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-1 xs:space-x-2 text-xs xs:text-sm text-gray-600">
          <Calendar className="w-3 h-3 xs:w-4 xs:h-4" />
          <span>Joined: {new Date(user.createdAt).toLocaleDateString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
};

// Enhanced User Modal Component
const UserModal = ({ user, onClose, onStatusToggle, actionLoading, getRoleConfig }) => {
  if (!user) return null;

  const roleConfig = getRoleConfig(user.role);
  const RoleIcon = roleConfig.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-2 xs:p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl xs:rounded-2xl w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[90vh] xs:max-h-[95vh] overflow-y-auto shadow-2xl transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 xs:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-t-xl xs:rounded-t-2xl">
          <div className="flex items-center space-x-2 xs:space-x-3 sm:space-x-4">
            <div className={`w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 ${roleConfig.color} rounded-full flex items-center justify-center shadow-lg`}>
              <RoleIcon className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 truncate">{user.name}</h2>
              <p className="text-xs xs:text-sm text-gray-600 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 xs:p-2 hover:bg-gray-100 rounded-lg xs:rounded-xl transition-colors duration-200 flex-shrink-0"
          >
            <XCircle className="w-5 h-5 xs:w-6 xs:h-6 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 xs:p-6 space-y-4 xs:space-y-6">
          {/* Status & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-6">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg xs:rounded-xl p-3 xs:p-4 border border-gray-200">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 xs:mb-3 block">Role</label>
              <div className="flex items-center space-x-2 xs:space-x-3">
                <span className={`px-3 xs:px-4 py-1.5 xs:py-2 rounded-full text-xs xs:text-sm font-bold border-2 ${roleConfig.bgColor} ${roleConfig.textColor} ${roleConfig.borderColor}`}>
                  {roleConfig.label}
                </span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg xs:rounded-xl p-3 xs:p-4 border border-gray-200">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 xs:mb-3 block">Status</label>
              <div className="flex items-center space-x-2 xs:space-x-3">
                {user.isActive ? (
                  <CheckCircle className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-red-500" />
                )}
                <span className={`font-bold text-base xs:text-lg ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg xs:rounded-xl p-4 xs:p-6 border border-blue-100">
            <h3 className="text-base xs:text-lg font-semibold text-gray-900 mb-3 xs:mb-4 flex items-center space-x-1 xs:space-x-2">
              <Phone className="w-4 h-4 xs:w-5 xs:h-5 text-blue-500" />
              <span>Contact Information</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
              <div className="flex items-center space-x-2 xs:space-x-3 xs:space-x-4 p-2 xs:p-3 bg-white rounded-lg border border-gray-200">
                <div className="w-8 h-8 xs:w-10 xs:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs xs:text-sm font-medium text-gray-900">Phone</p>
                  <p className="text-xs xs:text-sm text-gray-600 truncate">{user.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 xs:space-x-3 xs:space-x-4 p-2 xs:p-3 bg-white rounded-lg border border-gray-200">
                <div className="w-8 h-8 xs:w-10 xs:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs xs:text-sm font-medium text-gray-900">Location</p>
                  <p className="text-xs xs:text-sm text-gray-600 truncate">{user.address?.city || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg xs:rounded-xl p-4 xs:p-6 border border-gray-200">
            <h3 className="text-base xs:text-lg font-semibold text-gray-900 mb-3 xs:mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xs:gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 xs:mb-2 block">Member Since</label>
                <p className="text-xs xs:text-sm text-gray-900 font-medium">
                  {new Date(user.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 xs:mb-2 block">Last Updated</label>
                <p className="text-xs xs:text-sm text-gray-900 font-medium">
                  {new Date(user.updatedAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 p-4 xs:p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl xs:rounded-b-2xl">
          <button
            onClick={() => onStatusToggle(user._id, 'toggleStatus')}
            disabled={actionLoading}
            className={`flex-1 px-4 xs:px-6 py-3 xs:py-4 rounded-lg xs:rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 xs:space-x-3 ${
              user.isActive
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl'
                : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {actionLoading ? (
              <Loader className="w-4 h-4 xs:w-5 xs:h-5 animate-spin" />
            ) : user.isActive ? (
              <>
                <Ban className="w-4 h-4 xs:w-5 xs:h-5" />
                <span className="text-sm xs:text-base">Deactivate User</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 xs:w-5 xs:h-5" />
                <span className="text-sm xs:text-base">Activate User</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 xs:px-6 py-3 xs:py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg xs:rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-md hover:shadow-lg text-sm xs:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [roleStats, setRoleStats] = useState({
    ALL: 0,
    CUSTOMER: 0,
    WORKER: 0,
    SERVICE_AGENT: 0,
    ADMIN: 0
  });
  const [showRoleCards, setShowRoleCards] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Enhanced responsive screen detection
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate responsive values
  const isXs = screenSize.width < BREAKPOINTS.xs;
  const isSm = screenSize.width < BREAKPOINTS.sm;
  const isMd = screenSize.width < BREAKPOINTS.md;
  const isLg = screenSize.width < BREAKPOINTS.lg;
  const isXl = screenSize.width < BREAKPOINTS.xl;

  // Dynamic page size based on screen size
  const PAGE_SIZE = useMemo(() => {
    if (isXs) return 4;
    if (isSm) return 6;
    if (isMd) return 8;
    if (isLg) return 10;
    return 12;
  }, [isXs, isSm, isMd, isLg]);

  // Enhanced role statistics fetch
  const fetchRoleStats = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/admin/stats');
      console.log('Role stats response:', response);

      if (response.data?.success) {
        const stats = response.data.data;
        setRoleStats(prev => ({
          ...prev,
          ...stats,
          ALL: (stats.CUSTOMER || 0) + (stats.WORKER || 0) + (stats.SERVICE_AGENT || 0) + (stats.ADMIN || 0)
        }));
      }
    } catch (error) {
      console.error('Error fetching role stats:', error);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchRoleStats();
  }, [fetchRoleStats]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users when filters change
  useEffect(() => {
    if (currentPage === 1) {
      fetchUsers();
    } else {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, PAGE_SIZE]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: PAGE_SIZE,
        ...(roleFilter !== 'ALL' && { role: roleFilter }),
        ...(statusFilter !== 'ALL' && { status: statusFilter === 'ACTIVE' ? 'true' : 'false' }),
        ...(debouncedSearchTerm && { search: debouncedSearchTerm.trim() })
      });

      const response = await axiosInstance.get(`/api/admin/users?${params}`);
      console.log('Users response:', response);

      if (response.data?.success) {
        const usersData = response.data.data.users || [];
        const paginationData = response.data.data.pagination || {};

        setUsers(usersData);
        setTotalPages(paginationData.pages || 1);

        // Update role statistics if available
        if (response.data.data.roleStats) {
          const stats = response.data.data.roleStats;
          setRoleStats(prev => ({
            ...prev,
            ...stats,
            ALL: (stats.CUSTOMER || 0) + (stats.WORKER || 0) + (stats.SERVICE_AGENT || 0) + (stats.ADMIN || 0)
          }));
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load users';
      toast.error(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
      setSearchLoading(false);
      setRefreshLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshLoading(true);
    fetchUsers();
    fetchRoleStats();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = () => {
    setSearchLoading(true);
    setCurrentPage(1);
    fetchUsers();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      setActionLoading(true);

      if (action === 'toggleStatus') {
        const user = users.find(u => u._id === userId);
        if (!user) {
          toast.error('User not found');
          return;
        }

        const response = await axiosInstance.put(`/api/admin/users/${userId}/status`, {
          isActive: !user.isActive
        });

        if (response.data?.success) {
          toast.success(`User ${!user.isActive ? 'activated' : 'deactivated'} successfully`);
          await fetchUsers();
          await fetchRoleStats();
          if (selectedUser?._id === userId) {
            setSelectedUser(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
          }
        } else {
          throw new Error('Failed to update user status');
        }
      }
    } catch (error) {
      console.error('Error performing user action:', error);
      const errorMessage = error.response?.data?.message || 'Failed to perform action';
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleFilter = (role) => {
    setRoleFilter(role);
    setShowRoleCards(false);
    setCurrentPage(1);
  };

  const handleShowAllRoles = () => {
    setRoleFilter('ALL');
    setStatusFilter('ALL');
    setShowRoleCards(true);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getRoleConfig = useCallback((role) => {
    const configs = {
      'ADMIN': ROLES.find(r => r.value === 'ADMIN'),
      'SERVICE_AGENT': ROLES.find(r => r.value === 'SERVICE_AGENT'),
      'WORKER': ROLES.find(r => r.value === 'WORKER'),
      'CUSTOMER': ROLES.find(r => r.value === 'CUSTOMER')
    };
    return configs[role] || ROLES.find(r => r.value === 'CUSTOMER');
  }, []);

  // Enhanced Role Cards Component with responsive grid
  const RoleCards = () => {
    return (
      <div className={`grid grid-cols-1 ${
        isXs ? 'gap-3' : 'gap-4'
      } ${
        isXs ? 'xs:grid-cols-2' : 
        isSm ? 'sm:grid-cols-2' : 
        isLg ? 'lg:grid-cols-3' : 
        'xl:grid-cols-5'
      } mb-6 ${isMd ? 'md:mb-8' : 'mb-8'}`}>
        {ROLES.map((role) => {
          const RoleIcon = role.icon;
          const count = roleStats[role.value] || 0;
          const isActive = roleFilter === role.value;

          return (
            <div
              key={role.value}
              onClick={() => handleRoleFilter(role.value)}
              className={`bg-white rounded-xl ${isMd ? 'md:rounded-2xl' : 'rounded-2xl'} border-2 p-4 ${isMd ? 'md:p-6' : 'p-6'} cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                isActive
                  ? 'border-blue-500 ring-2 md:ring-4 ring-blue-100 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300 shadow-md'
              }`}
            >
              <div className={`flex items-center justify-between mb-3 ${isMd ? 'md:mb-4' : 'mb-4'}`}>
                <div className={`p-2 ${isMd ? 'md:p-3' : 'p-3'} rounded-lg ${isMd ? 'md:rounded-xl' : 'rounded-xl'} ${role.color} shadow-lg`}>
                  <RoleIcon className={`w-4 h-4 ${isMd ? 'md:w-5 md:h-5' : 'w-5 h-5'} ${isXl ? 'xl:w-6 xl:h-6' : ''} text-white`} />
                </div>
                <div className="text-right">
                  <div className={`font-bold text-gray-900 ${
                    isXs ? 'text-xl' : 
                    isSm ? 'text-2xl' : 
                    'text-3xl'
                  }`}>{count}</div>
                  <div className="text-xs md:text-sm text-gray-500 font-medium">users</div>
                </div>
              </div>

              <h3 className={`font-bold text-gray-900 ${
                isXs ? 'text-base' : 'text-lg'
              } mb-1 ${isMd ? 'md:mb-2' : 'mb-2'}`}>{role.label}</h3>
              <p className={`text-gray-600 leading-relaxed ${
                isXs ? 'text-xs mb-3' : 'text-sm mb-4'
              }`}>{role.description}</p>

              <div className={`pt-3 ${isMd ? 'md:pt-4' : 'pt-4'} border-t border-gray-100`}>
                <button className={`font-semibold transition-colors duration-200 ${
                  isXs ? 'text-xs' : 'text-sm'
                } ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  View Details →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Memoized empty state
  const emptyState = useMemo(() => (
    <div className={`text-center ${
      isXs ? 'py-12' : 'py-16'
    } bg-gradient-to-br from-gray-50 to-white rounded-xl ${
      isMd ? 'md:rounded-2xl' : 'rounded-2xl'
    } border-2 border-dashed border-gray-300`}>
      <Users className={`${
        isXs ? 'w-16 h-16' : 'w-20 h-20'
      } text-gray-400 mx-auto mb-3 ${isMd ? 'md:mb-4' : 'mb-4'}`} />
      <p className={`${
        isXs ? 'text-base' : 'text-lg'
      } font-semibold text-gray-600 mb-2`}>No users found</p>
      <p className={`${
        isXs ? 'text-sm mb-4' : 'text-gray-500 mb-6'
      }`}>Try adjusting your filters or search term</p>
      <button
        onClick={handleShowAllRoles}
        className="px-4 xs:px-6 py-2 xs:py-3 bg-blue-600 text-white rounded-lg xs:rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg text-sm xs:text-base"
      >
        Show All Users
      </button>
    </div>
  ), [isXs, isMd]);

  // Memoized loading state
  const loadingState = useMemo(() => (
    <div className="flex items-center justify-center h-48 xs:h-56 sm:h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 xs:h-12 xs:w-12 border-b-2 border-blue-600 mx-auto mb-3 xs:mb-4"></div>
        <p className="text-gray-600 font-medium text-sm xs:text-base">Loading users...</p>
      </div>
    </div>
  ), [isXs]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-3 xs:p-4 sm:p-6 lg:p-8">
      <div className="max-w-10xl mx-auto space-y-4 xs:space-y-6 md:space-y-8">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 xs:gap-6">
          <div className="flex-1">
            <h1 className={`font-bold text-gray-900 ${
              isXs ? 'text-2xl' : 
              isSm ? 'text-3xl' : 
              isMd ? 'text-4xl' : 
              'text-5xl'
            } mb-1 ${isMd ? 'md:mb-2' : 'mb-2'}`}>
              User Management
            </h1>
            <p className={`text-gray-600 ${
              isXs ? 'text-sm max-w-md' : 
              'text-lg max-w-2xl'
            }`}>
              Manage and monitor all platform users with advanced filtering and real-time statistics
            </p>
          </div>
          <div className="flex items-center space-x-3 xs:space-x-4">
            <div className={`bg-white rounded-xl ${isMd ? 'md:rounded-2xl' : 'rounded-2xl'} ${
              isXs ? 'px-4 py-3' : 'px-6 py-4'
            } shadow-lg border border-gray-200`}>
              <div className="flex items-center space-x-2 xs:space-x-3">
                <Users className={`${
                  isXs ? 'w-6 h-6' : 'w-8 h-8'
                } text-blue-600`} />
                <div>
                  <div className={`font-bold text-gray-900 ${
                    isXs ? 'text-xl' : 'text-2xl'
                  }`}>{roleStats['ALL'] || 0}</div>
                  <div className="text-xs xs:text-sm text-gray-500 font-medium">Total Users</div>
                </div>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshLoading}
              className={`p-3 ${isXs ? 'xs:p-4' : 'p-4'} bg-white rounded-xl ${
                isMd ? 'md:rounded-2xl' : 'rounded-2xl'
              } shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50`}
              title="Refresh data"
            >
              <RefreshCw className={`${
                isXs ? 'w-5 h-5' : 'w-6 h-6'
              } text-gray-600 ${refreshLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Role Cards */}
        {showRoleCards && roleFilter === 'ALL' && <RoleCards />}

        {/* Enhanced Filters Section */}
        <div className={`bg-white rounded-xl ${
          isMd ? 'md:rounded-2xl' : 'rounded-2xl'
        } shadow-xl border border-gray-200 p-4 xs:p-6`}>
          <div className="flex flex-col xl:flex-row gap-4 xs:gap-6">
            {/* Search Area */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row gap-3 xs:gap-4">
                <div className="flex-1 relative">
                  <Search className={`${
                    isXs ? 'w-4 h-4 left-3' : 'w-5 h-5 left-4'
                  } absolute top-1/2 transform -translate-y-1/2 text-gray-400`} />
                  <input
                    type="text"
                    placeholder="Search users by name, email, or phone..."
                    value={searchTerm}
                    onChange={handleSearch}
                    onKeyPress={handleKeyPress}
                    className={`w-full ${
                      isXs ? 'pl-10 pr-3 py-3 text-sm' : 'pl-12 pr-4 py-4 text-base'
                    } border-2 border-gray-300 rounded-lg ${
                      isMd ? 'md:rounded-xl' : 'rounded-xl'
                    } focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200`}
                    aria-label="Search users"
                  />
                </div>
                <button
                  onClick={handleSearchSubmit}
                  disabled={searchLoading}
                  className={`${
                    isXs ? 'px-4 py-3 text-sm' : 'px-8 py-4 text-base'
                  } bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg ${
                    isMd ? 'md:rounded-xl' : 'rounded-xl'
                  } hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold flex items-center justify-center ${
                    isXs ? 'min-w-[100px]' : 'min-w-[140px]'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {searchLoading ? (
                    <Loader className={`${
                      isXs ? 'w-4 h-4' : 'w-5 h-5'
                    } animate-spin`} />
                  ) : (
                    <>
                      <Search className={`${
                        isXs ? 'w-4 h-4 mr-2' : 'w-5 h-5 mr-3'
                      }`} />
                      <span>Search</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Enhanced Filters */}
            <div className="flex flex-col sm:flex-row gap-3 xs:gap-4">
              <div className="flex items-center space-x-2 xs:space-x-3 bg-gray-50 rounded-lg xs:rounded-xl p-2 xs:p-3 border border-gray-200">
                <Filter className={`${
                  isXs ? 'w-4 h-4' : 'w-5 h-5'
                } text-gray-500 flex-shrink-0`} />
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    const value = e.target.value;
                    setRoleFilter(value);
                    setShowRoleCards(value === 'ALL');
                  }}
                  className="bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700 font-medium text-sm xs:text-base"
                  aria-label="Filter by role"
                >
                  {ROLES.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label} ({roleStats[role.value] || 0})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2 xs:space-x-3 bg-gray-50 rounded-lg xs:rounded-xl p-2 xs:p-3 border border-gray-200">
                <UserCheck className={`${
                  isXs ? 'w-4 h-4' : 'w-5 h-5'
                } text-gray-500 flex-shrink-0`} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700 font-medium text-sm xs:text-base"
                  aria-label="Filter by status"
                >
                  {STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {(roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
                <button
                  onClick={handleShowAllRoles}
                  className={`${
                    isXs ? 'px-4 py-3 text-sm' : 'px-6 py-4 text-base'
                  } bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg ${
                    isMd ? 'md:rounded-xl' : 'rounded-xl'
                  } hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold whitespace-nowrap`}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Users Table/Cards */}
        <div className={`bg-white rounded-xl ${
          isMd ? 'md:rounded-2xl' : 'rounded-2xl'
        } shadow-xl border border-gray-200 overflow-hidden`}>
          {loading ? loadingState : users.length === 0 ? emptyState : (
            <>
              {/* Mobile Cards View */}
              <div className="lg:hidden">
                <div className={`grid grid-cols-1 ${
                  isXs ? 'gap-3 p-4' : 'gap-4 p-6'
                }`}>
                  {users.map((user) => (
                    <MobileUserCard
                      key={user._id}
                      user={user}
                      onView={(user) => {
                        setSelectedUser(user);
                        setShowUserModal(true);
                      }}
                      onStatusToggle={handleUserAction}
                      actionLoading={actionLoading}
                      getRoleConfig={getRoleConfig}
                    />
                  ))}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className={`${
                        isXl ? 'px-8 py-6' : 'px-6 py-4'
                      } text-left text-sm font-bold text-gray-900 uppercase tracking-wider`}>User</th>
                      <th className={`${
                        isXl ? 'px-8 py-6' : 'px-6 py-4'
                      } text-left text-sm font-bold text-gray-900 uppercase tracking-wider`}>Role</th>
                      <th className={`${
                        isXl ? 'px-8 py-6' : 'px-6 py-4'
                      } text-left text-sm font-bold text-gray-900 uppercase tracking-wider`}>Contact</th>
                      <th className={`${
                        isXl ? 'px-8 py-6' : 'px-6 py-4'
                      } text-left text-sm font-bold text-gray-900 uppercase tracking-wider`}>Status</th>
                      <th className={`${
                        isXl ? 'px-8 py-6' : 'px-6 py-4'
                      } text-left text-sm font-bold text-gray-900 uppercase tracking-wider`}>Joined</th>
                      <th className={`${
                        isXl ? 'px-8 py-6' : 'px-6 py-4'
                      } text-left text-sm font-bold text-gray-900 uppercase tracking-wider`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => {
                      const roleConfig = getRoleConfig(user.role);
                      const RoleIcon = roleConfig.icon;

                      return (
                        <tr key={user._id} className="hover:bg-blue-50 transition-colors duration-200 group">
                          <td className={`${
                            isXl ? 'px-8 py-6' : 'px-6 py-4'
                          }`}>
                            <div className="flex items-center space-x-3 xs:space-x-4">
                              <div className={`w-10 h-10 ${
                                isXl ? 'xl:w-12 xl:h-12' : 'w-12 h-12'
                              } ${roleConfig.color} rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-200`}>
                                <RoleIcon className={`${
                                  isXl ? 'xl:w-6 xl:h-6' : 'w-5 h-5'
                                } text-white`} />
                              </div>
                              <div className="min-w-0">
                                <p className={`font-bold text-gray-900 ${
                                  isXl ? 'xl:text-lg' : 'text-base'
                                } truncate`}>{user.name}</p>
                                <p className="text-gray-600 truncate text-sm">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className={`${
                            isXl ? 'px-8 py-6' : 'px-6 py-4'
                          }`}>
                            <span className={`px-3 xs:px-4 py-1.5 xs:py-2 rounded-full text-xs xs:text-sm font-bold border-2 ${roleConfig.bgColor} ${roleConfig.textColor} ${roleConfig.borderColor}`}>
                              {roleConfig.label}
                            </span>
                          </td>
                          <td className={`${
                            isXl ? 'px-8 py-6' : 'px-6 py-4'
                          }`}>
                            <div className="text-sm">
                              <p className="font-semibold text-gray-900">{user.phone || 'N/A'}</p>
                              <p className="text-gray-600 truncate max-w-[150px] xs:max-w-[200px]">{user.address?.city || 'N/A'}</p>
                            </div>
                          </td>
                          <td className={`${
                            isXl ? 'px-8 py-6' : 'px-6 py-4'
                          }`}>
                            <div className={`flex items-center space-x-2 xs:space-x-3 px-3 xs:px-4 py-1.5 xs:py-2 rounded-lg font-semibold text-sm ${
                              user.isActive 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {user.isActive ? (
                                <CheckCircle className="w-4 h-4 xs:w-5 xs:h-5" />
                              ) : (
                                <XCircle className="w-4 h-4 xs:w-5 xs:h-5" />
                              )}
                              <span>{user.isActive ? 'Active' : 'Inactive'}</span>
                            </div>
                          </td>
                          <td className={`${
                            isXl ? 'px-8 py-6' : 'px-6 py-4'
                          } text-sm font-semibold text-gray-900`}>
                            {formatDate(user.createdAt)}
                          </td>
                          <td className={`${
                            isXl ? 'px-8 py-6' : 'px-6 py-4'
                          }`}>
                            <div className="flex items-center space-x-2 xs:space-x-3">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowUserModal(true);
                                }}
                                className="flex items-center space-x-1 xs:space-x-2 px-3 xs:px-5 py-2 xs:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg xs:rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                                aria-label={`View ${user.name}'s details`}
                              >
                                <Eye className="w-3 h-3 xs:w-4 xs:h-4" />
                                <span>View</span>
                              </button>
                              <button
                                onClick={() => handleUserAction(user._id, 'toggleStatus')}
                                disabled={actionLoading}
                                className={`p-2 xs:p-3 rounded-lg xs:rounded-xl transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg ${
                                  user.isActive
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                    : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                                }`}
                                title={user.isActive ? 'Deactivate' : 'Activate'}
                                aria-label={user.isActive ? 'Deactivate user' : 'Activate user'}
                              >
                                {actionLoading ? (
                                  <Loader className="w-4 h-4 xs:w-5 xs:h-5 animate-spin" />
                                ) : user.isActive ? (
                                  <Ban className="w-4 h-4 xs:w-5 xs:h-5" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 xs:w-5 xs:h-5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Enhanced Pagination */}
          {users.length > 0 && (
            <div className={`flex flex-col sm:flex-row items-center justify-between ${
              isXs ? 'px-4 py-4' : 'px-6 py-4'
            } bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200 gap-3 xs:gap-4`}>
              <p className="text-xs xs:text-sm font-semibold text-gray-700">
                Showing page {currentPage} of {totalPages} • {users.length} users
              </p>
              <div className="flex items-center space-x-2 xs:space-x-3">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 xs:p-3 rounded-lg ${
                    isMd ? 'md:rounded-xl' : 'rounded-xl'
                  } border-2 border-gray-300 hover:bg-white hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg`}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4 xs:w-5 xs:h-5" />
                </button>
                <div className="flex items-center space-x-1 xs:space-x-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 xs:px-4 py-1.5 xs:py-2 rounded-lg font-semibold transition-all duration-200 text-sm ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-white hover:shadow-md border border-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && (
                    <span className="px-2 xs:px-3 text-gray-500 font-semibold text-sm">...</span>
                  )}
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`p-2 xs:p-3 rounded-lg ${
                    isMd ? 'md:rounded-xl' : 'rounded-xl'
                  } border-2 border-gray-300 hover:bg-white hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg`}
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4 xs:w-5 xs:h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <UserModal
          user={selectedUser}
          onClose={() => setShowUserModal(false)}
          onStatusToggle={handleUserAction}
          actionLoading={actionLoading}
          getRoleConfig={getRoleConfig}
        />
      )}
    </div>
  );
};

export default AdminUserManagement;