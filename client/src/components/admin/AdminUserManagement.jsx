import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users, Search, Filter, MoreVertical, Eye, Edit,
  Ban, CheckCircle, XCircle, Phone, Mail, MapPin,
  ChevronLeft, ChevronRight, Loader, Shield, UserCheck,
  Briefcase, UserCog, User2Icon, Calendar
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

// Enhanced role configuration with cards
const ROLES = [
  {
    value: 'ALL',
    label: 'All Users',
    icon: Users,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'Manage all platform users',
    count: 0
  },
  {
    value: 'CUSTOMER',
    label: 'Customers',
    icon: Users,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Service consumers and clients',
    count: 0
  },
  {
    value: 'WORKER',
    label: 'Workers',
    icon: Briefcase,
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Service providers and professionals',
    count: 0
  },
  {
    value: 'SERVICE_AGENT',
    label: 'Service Agents',
    icon: UserCog,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Service coordination and management',
    count: 0
  },
  {
    value: 'ADMIN',
    label: 'Admins',
    icon: Shield,
    color: 'bg-red-100 text-red-800 border-red-200',
    description: 'Platform administrators',
    count: 0
  }
];

const PAGE_SIZE = 10;

// Mobile User Card Component
const MobileUserCard = ({ user, onView, onStatusToggle, actionLoading, getRoleConfig }) => {
  const roleConfig = getRoleConfig(user.role);
  const RoleIcon = roleConfig.icon;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
            <RoleIcon className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate mt-1">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => onStatusToggle(user._id)}
          disabled={actionLoading}
          className={`p-2 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0 ml-2 ${user.isActive
              ? 'text-red-600 hover:bg-red-100'
              : 'text-green-600 hover:bg-green-100'
            }`}
          title={user.isActive ? 'Deactivate' : 'Activate'}
        >
          {actionLoading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : user.isActive ? (
            <Ban className="w-4 h-4" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center space-x-1">
          <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-600 truncate">{user.phone || 'N/A'}</span>
        </div>
        <div className="flex items-center space-x-1">
          <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-600 truncate">{user.address?.city || 'N/A'}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${roleConfig.color}`}>
            {roleConfig.label}
          </span>
          <div className="flex items-center space-x-1">
            {user.isActive ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
              <XCircle className="w-3 h-3 text-red-500" />
            )}
            <span className={`text-xs font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <button
          onClick={() => onView(user)}
          className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex-shrink-0 ml-2"
        >
          <Eye className="w-3 h-3" />
          <span>View</span>
        </button>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-100">
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <Calendar className="w-3 h-3" />
          <span>Joined: {new Date(user.createdAt).toLocaleDateString('en-IN')}</span>
        </div>
      </div>
    </div>
  );
};

// User Modal Component
const UserModal = ({ user, onClose, onStatusToggle, actionLoading, getRoleConfig }) => {
  if (!user) return null;

  const roleConfig = getRoleConfig(user.role);
  const RoleIcon = roleConfig.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-md sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <RoleIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XCircle className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Role</label>
              <div className="mt-1">
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${roleConfig.color}`}>
                  {roleConfig.label}
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
              <div className="mt-1 flex items-center space-x-2">
                {user.isActive ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={`font-medium text-sm ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Phone</p>
                  <p className="text-sm text-gray-600">{user.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Location</p>
                  <p className="text-sm text-gray-600">{user.address?.city || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Additional Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Member Since</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Updated</label>
                <p className="mt-1 text-sm text-gray-900">
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
        <div className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl sm:rounded-b-2xl">
          <button
            onClick={() => onStatusToggle(user._id)}
            disabled={actionLoading}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${user.isActive
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
              } disabled:opacity-50`}
          >
            {actionLoading ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : user.isActive ? (
              <>
                <Ban className="w-4 h-4" />
                <span>Deactivate User</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Activate User</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
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

  // Fetch role statistics separately
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
      } else {
        // Fallback: calculate from users list if stats endpoint doesn't exist
        console.warn('Stats endpoint not available, calculating from users list');
      }
    } catch (error) {
      console.error('Error fetching role stats:', error);
      // If stats endpoint fails, we'll calculate from users later
    }
  }, []);

  // Fetch initial role statistics
  useEffect(() => {
    fetchRoleStats();
  }, [fetchRoleStats]);

  // Debounced search implementation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage === 1) {
      fetchUsers();
    } else {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: PAGE_SIZE,
        ...(roleFilter !== 'ALL' && { role: roleFilter }),
        ...(debouncedSearchTerm && { search: debouncedSearchTerm.trim() })
      });

      const response = await axiosInstance.get(`/api/admin/users?${params}`);
      console.log('Users response:', response);

      if (response.data?.success) {
        const usersData = response.data.data.users || [];
        const paginationData = response.data.data.pagination || {};

        setUsers(usersData);
        setTotalPages(paginationData.pages || 1);

        // Update role statistics if available in response
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
    }
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
          await fetchUsers(); // Refresh the list
          await fetchRoleStats(); // Refresh stats
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
      'ADMIN': {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: Shield,
        label: 'Admin'
      },
      'SERVICE_AGENT': {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: UserCog,
        label: 'Service Agent'
      },
      'WORKER': {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: Briefcase,
        label: 'Worker'
      },
      'CUSTOMER': {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Users,
        label: 'Customer'
      }
    };
    return configs[role] || configs.CUSTOMER;
  }, []);

  // Role Cards Component with proper counts
  const RoleCards = () => {
    return (
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 mb-6">
        {ROLES.map((role) => {
          const RoleIcon = role.icon;
          const count = roleStats[role.value] || 0;
          const isActive = roleFilter === role.value;

          return (
            <div
              key={role.value}
              onClick={() => handleRoleFilter(role.value)}
              className={`bg-white rounded-lg sm:rounded-xl border-2 p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 ${isActive
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className={`p-1.5 sm:p-2 rounded-lg ${role.color.split(' ')[0]}`}>
                  <RoleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-current" />
                </div>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-xs text-gray-500">users</div>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1">{role.label}</h3>
              <p className="text-xs text-gray-600 line-clamp-2 leading-tight">{role.description}</p>

              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
                <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
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
    <div className="text-center py-12 sm:py-16">
      <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3" />
      <p className="text-sm sm:text-base text-gray-600 font-medium">No users found</p>
      <p className="text-xs sm:text-sm text-gray-500 mt-1">Try adjusting your filters or search term</p>
    </div>
  ), []);

  // Memoized loading state
  const loadingState = useMemo(() => (
    <div className="flex items-center justify-center h-32 sm:h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ), []);

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage all platform users</p>
        </div>
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
          <Users className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Total: {roleStats['ALL'] || 0} users</span>
        </div>
      </div>

      {/* Role Cards - Show when no specific role is selected or when showing all */}
      {showRoleCards && roleFilter === 'ALL' && <RoleCards />}

      {/* Filters Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Area */}
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
                value={searchTerm}
                onChange={handleSearch}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                aria-label="Search users"
              />
            </div>
            <button
              onClick={handleSearchSubmit}
              disabled={searchLoading}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium flex items-center justify-center min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searchLoading ? (
                <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="hidden xs:inline">Search</span>
                  <span className="xs:hidden">Go</span>
                </>
              )}
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Role Filter */}
            <div className="flex items-center space-x-2 flex-1">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <select
                value={roleFilter}
                onChange={(e) => {
                  const value = e.target.value;
                  setRoleFilter(value);
                  setShowRoleCards(value === 'ALL');
                }}
                className="flex-1 px-3 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base w-full"
                aria-label="Filter by role"
              >
                {ROLES.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label} ({roleStats[role.value] || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Show All Roles Button */}
            {roleFilter !== 'ALL' && (
              <button
                onClick={handleShowAllRoles}
                className="px-4 py-2.5 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base font-medium whitespace-nowrap"
              >
                Show All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Users List/Table */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? loadingState : users.length === 0 ? emptyState : (
          <>
            {/* Mobile View */}
            <div className="sm:hidden space-y-3 p-4">
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

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">User</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Role</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Contact</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Status</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Joined</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => {
                    const roleConfig = getRoleConfig(user.role);
                    const RoleIcon = roleConfig.icon;

                    return (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <RoleIcon className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">{user.name}</p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${roleConfig.color}`}>
                            {roleConfig.label}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="text-sm">
                            <p className="text-gray-900">{user.phone || 'N/A'}</p>
                            <p className="text-gray-500 truncate max-w-[150px]">{user.address?.city || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {user.isActive ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                            <span className={`font-medium text-sm ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserModal(true);
                              }}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                              aria-label={`View ${user.name}'s details`}
                            >
                              <Eye className="w-4 h-4" />
                              <span className="hidden md:inline">View</span>
                            </button>
                            <button
                              onClick={() => handleUserAction(user._id, 'toggleStatus')}
                              disabled={actionLoading}
                              className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${user.isActive
                                  ? 'text-red-600 hover:bg-red-100'
                                  : 'text-green-600 hover:bg-green-100'
                                }`}
                              title={user.isActive ? 'Deactivate' : 'Activate'}
                              aria-label={user.isActive ? 'Deactivate user' : 'Activate user'}
                            >
                              {actionLoading ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : user.isActive ? (
                                <Ban className="w-4 h-4" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
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

        {/* Pagination */}
        {users.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-200 gap-3">
            <p className="text-xs sm:text-sm text-gray-700">
              Showing page {currentPage} of {totalPages} • {users.length} users
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && (
                  <span className="px-2 text-gray-500">...</span>
                )}
              </div>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        )}
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