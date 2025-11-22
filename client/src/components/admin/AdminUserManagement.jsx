import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users, Search, Filter, MoreVertical, Eye, Edit,
  Ban, CheckCircle, XCircle, Phone, Mail, MapPin,
  ChevronLeft, ChevronRight, Loader, Shield, UserCheck
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

// Constants for better maintainability
const ROLES = [
  { value: 'ALL', label: 'All Users' },
  { value: 'CUSTOMER', label: 'Customers' },
  { value: 'WORKER', label: 'Workers' },
  { value: 'SERVICE_AGENT', label: 'Service Agents' },
  { value: 'ADMIN', label: 'Admins' }
];

const PAGE_SIZE = 10;

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

      if (response.data?.success) {
        setUsers(response.data.data.users || []);
        setTotalPages(response.data.data.pagination?.pages || 1);
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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilter = (role) => {
    setRoleFilter(role);
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
        icon: UserCheck,
        label: 'Service Agent'
      },
      'WORKER': {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: Users,
        label: 'Worker'
      },
      'CUSTOMER': {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: Users,
        label: 'Customer'
      }
    };
    return configs[role] || configs.CUSTOMER;
  }, []);

  const UserModal = () => {
    if (!selectedUser) return null;

    const roleConfig = getRoleConfig(selectedUser.role);
    const RoleIcon = roleConfig.icon;

    const handleClose = () => {
      if (!actionLoading) {
        setShowUserModal(false);
        setSelectedUser(null);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 max-w-2xl w-full max-h-[95vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">User Details</h2>
            <button
              onClick={handleClose}
              className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              disabled={actionLoading}
              aria-label="Close modal"
            >
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* User Header */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <RoleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                  {selectedUser.name || 'Unknown User'}
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-1 sm:mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${roleConfig.color}`}>
                    {roleConfig.label}
                  </span>
                  <div className="flex items-center space-x-2">
                    {selectedUser.isVerified && (
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    )}
                    <span className="text-xs text-gray-500">
                      {selectedUser.isVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">Email</p>
                  <p className="font-medium text-sm sm:text-base truncate">{selectedUser.email || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-3">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-sm sm:text-base">{selectedUser.phone || 'N/A'}</p>
                </div>
              </div>

              {selectedUser.address && (
                <div className="flex items-start space-x-2 sm:space-x-3 md:col-span-2">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600">Address</p>
                    <p className="font-medium text-sm sm:text-base break-words">
                      {[
                        selectedUser.address.houseNo,
                        selectedUser.address.street,
                        selectedUser.address.area,
                        selectedUser.address.city,
                        selectedUser.address.state,
                        selectedUser.address.pincode
                      ].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Status Section */}
            <div className="border-t pt-3 sm:pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Account Status</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {selectedUser.isActive ? (
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                    )}
                    <span className={`font-medium text-sm sm:text-base ${selectedUser.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleUserAction(selectedUser._id, 'toggleStatus')}
                  disabled={actionLoading}
                  className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors text-sm flex items-center justify-center min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed ${selectedUser.isActive
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                >
                  {actionLoading ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : selectedUser.isActive ? (
                    'Deactivate'
                  ) : (
                    'Activate'
                  )}
                </button>
              </div>
            </div>

            {/* Account Information */}
            <div className="border-t pt-3 sm:pt-4">
              <p className="text-xs sm:text-sm text-gray-600 mb-2">Account Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-500">Joined:</span>
                  <span className="ml-2 font-medium">{formatDate(selectedUser.createdAt)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>
                  <span className="ml-2 font-medium">{formatDate(selectedUser.updatedAt)}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-500">User ID:</span>
                  <span className="ml-2 font-medium font-mono text-xs break-all">{selectedUser._id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Mobile User Card Component
  const MobileUserCard = ({ user }) => {
    const roleConfig = getRoleConfig(user.role);
    const RoleIcon = roleConfig.icon;

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <RoleIcon className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 text-sm truncate">{user.name}</h3>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${roleConfig.color}`}>
            {roleConfig.label}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Phone:</span>
            <p className="font-medium text-gray-900 truncate">{user.phone || 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-500">Location:</span>
            <p className="font-medium text-gray-900 truncate">{user.address?.city || 'N/A'}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            {user.isActive ? (
              <CheckCircle className="w-3 h-3 text-green-500" />
            ) : (
              <XCircle className="w-3 h-3 text-red-500" />
            )}
            <span className={`text-xs font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                setSelectedUser(user);
                setShowUserModal(true);
              }}
              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleUserAction(user._id, 'toggleStatus')}
              disabled={actionLoading}
              className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${user.isActive
                  ? 'text-red-600 hover:bg-red-100'
                  : 'text-green-600 hover:bg-green-100'
                }`}
              title={user.isActive ? 'Deactivate' : 'Activate'}
            >
              {actionLoading ? (
                <Loader className="w-3 h-3 animate-spin" />
              ) : user.isActive ? (
                <Ban className="w-3 h-3" />
              ) : (
                <CheckCircle className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>
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
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-600 mt-1">Manage all platform users</p>
        </div>
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>Total: {users.length} users</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                aria-label="Search users"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => handleRoleFilter(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full sm:w-48"
              aria-label="Filter by role"
            >
              {ROLES.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
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
                <MobileUserCard key={user._id} user={user} />
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => {
                    const roleConfig = getRoleConfig(user.role);
                    const RoleIcon = roleConfig.icon;

                    return (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
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
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${roleConfig.color}`}>
                            {roleConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <p className="text-gray-900">{user.phone || 'N/A'}</p>
                            <p className="text-gray-500 truncate">{user.address?.city || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
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
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4">
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
                              <span>View</span>
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
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200 gap-3">
            <p className="text-xs text-gray-700">
              Showing page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-700 px-2 min-w-[20px] text-center">
                {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showUserModal && <UserModal />}
    </div>
  );
};

export default AdminUserManagement;