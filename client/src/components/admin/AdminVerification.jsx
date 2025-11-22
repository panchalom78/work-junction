import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Shield, Search, Filter, Eye, CheckCircle, XCircle,
  Clock, AlertCircle, FileText, User, Phone, Mail,
  ChevronLeft, ChevronRight, Download, Loader
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

// Constants for better maintainability
const PRIORITIES = [
  { value: 'ALL', label: 'All Priorities' },
  { value: 'HIGH', label: 'High Priority' },
  { value: 'MEDIUM', label: 'Medium Priority' },
  { value: 'LOW', label: 'Low Priority' }
];

const PAGE_SIZE = 10;

const AdminVerification = () => {
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Memoized priority configuration
  const getPriorityConfig = useCallback((priority) => {
    const configs = {
      HIGH: { 
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: AlertCircle,
        label: 'High'
      },
      MEDIUM: { 
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: Clock,
        label: 'Medium'
      },
      LOW: { 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        label: 'Low'
      }
    };
    return configs[priority] || configs.MEDIUM;
  }, []);

  // Debounced search implementation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchVerificationQueue();
      } else {
        setCurrentPage(1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, priorityFilter]);

  useEffect(() => {
    fetchVerificationQueue();
  }, [currentPage]);

  const fetchVerificationQueue = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: PAGE_SIZE,
        ...(priorityFilter !== 'ALL' && { priority: priorityFilter }),
        ...(searchTerm && { search: searchTerm.trim() })
      });

      const response = await axiosInstance.get(`/api/admin/verification/queue?${params}`);

      if (response.data?.success) {
        setVerificationQueue(response.data.data.workers || []);
        setTotalPages(response.data.data.pagination?.pages || 1);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching verification queue:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load verification queue';
      toast.error(errorMessage);
      setVerificationQueue([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExportLoading(true);

      const params = new URLSearchParams({
        ...(priorityFilter !== 'ALL' && { priority: priorityFilter }),
        ...(searchTerm && { search: searchTerm.trim() })
      });

      const response = await axiosInstance.get(`/api/admin/verification/export?${params}`, {
        responseType: 'blob'
      });

      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;

      // Extract filename from content-disposition header
      const disposition = response.headers?.['content-disposition'];
      let filename = `worker-verifications-${new Date().toISOString().split('T')[0]}.csv`;
      
      if (disposition) {
        const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch?.[1]) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success('Verification data exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleVerificationAction = async (workerId, action, rejectionReason = '') => {
    if (!workerId) {
      toast.error('Invalid worker ID');
      return;
    }

    try {
      setActionLoading(true);
      
      const payload = {
        status: action,
        ...(action === 'REJECTED' && rejectionReason && { rejectionReason: rejectionReason.trim() })
      };

      const response = await axiosInstance.put(`/api/admin/verification/${workerId}`, payload);

      if (response.data?.success) {
        toast.success(`Worker ${action.toLowerCase()} successfully`);
        await fetchVerificationQueue(); // Refresh the list
        setShowWorkerModal(false);
        setSelectedWorker(null);
      } else {
        throw new Error('Failed to update verification');
      }
    } catch (error) {
      console.error('Error updating verification:', error);
      const errorMessage = error.response?.data?.message || 'Failed to process verification';
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now - date;
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

      const diffInMonths = Math.floor(diffInDays / 30);
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    } catch (error) {
      return 'Invalid date';
    }
  };

  const WorkerVerificationModal = () => {
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
      if (selectedWorker?.rejectionReason) {
        setRejectionReason(selectedWorker.rejectionReason);
      }
    }, [selectedWorker]);

    if (!selectedWorker) return null;

    const priorityConfig = getPriorityConfig(selectedWorker.priority);
    const PriorityIcon = priorityConfig.icon;

    const handleClose = () => {
      if (!actionLoading) {
        setShowWorkerModal(false);
        setSelectedWorker(null);
        setRejectionReason('');
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 max-w-4xl w-full max-h-[95vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Worker Verification Review</h2>
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
            {/* Worker Info */}
            <div className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                    {selectedWorker.name || 'Unknown Worker'}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 mt-1 sm:mt-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-600">{selectedWorker.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-600 break-words">{selectedWorker.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium border ${priorityConfig.color}`}>
                  <div className="flex items-center space-x-1">
                    <PriorityIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{priorityConfig.label}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Documents */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Verification Documents</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {['selfie', 'aadhar', 'police'].map((docType) => {
                  const docConfig = {
                    selfie: {
                      label: 'Selfie',
                      url: selectedWorker.verification?.selfieUrl,
                      verified: selectedWorker.verification?.isSelfieVerified,
                      key: 'selfie'
                    },
                    aadhar: {
                      label: 'Aadhar Document',
                      url: selectedWorker.verification?.addharDocUrl,
                      verified: selectedWorker.verification?.isAddharDocVerified,
                      key: 'aadhar'
                    },
                    police: {
                      label: 'Police Verification',
                      url: selectedWorker.verification?.policeVerificationDocUrl,
                      verified: selectedWorker.verification?.isPoliceVerificationDocVerified,
                      key: 'police'
                    }
                  }[docType];

                  return (
                    <div key={docConfig.key} className="border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <h5 className="font-medium text-gray-900 text-sm sm:text-base">{docConfig.label}</h5>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          docConfig.verified ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {docConfig.verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                      {docConfig.url ? (
                        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          <img
                            src={docConfig.url}
                            alt={docConfig.label}
                            className="w-full h-full object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer"
                            onClick={() => window.open(docConfig.url, '_blank')}
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rejection Reason */}
            <div>
              <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason (if rejecting)
              </label>
              <textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                rows={3}
                disabled={actionLoading}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4 border-t">
              <button
                onClick={handleClose}
                className="px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerificationAction(selectedWorker._id, 'REJECTED', rejectionReason)}
                disabled={actionLoading || (rejectionReason.trim() === '' && selectedWorker.status !== 'REJECTED')}
                className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center min-w-[80px]"
              >
                {actionLoading ? <Loader className="w-4 h-4 animate-spin" /> : 'Reject'}
              </button>
              <button
                onClick={() => handleVerificationAction(selectedWorker._id, 'APPROVED')}
                disabled={actionLoading}
                className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center justify-center min-w-[80px]"
              >
                {actionLoading ? <Loader className="w-4 h-4 animate-spin" /> : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Mobile card view for smaller screens
  const MobileWorkerCard = ({ worker }) => {
    const priorityConfig = getPriorityConfig(worker.priority);
    const PriorityIcon = priorityConfig.icon;

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 text-sm truncate">{worker.name}</h3>
              <p className="text-xs text-gray-500 truncate">{worker.phone}</p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityConfig.color}`}>
            <div className="flex items-center space-x-1">
              <PriorityIcon className="w-3 h-3" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Service:</span>
            <p className="font-medium text-gray-900 truncate">{worker.service || 'General Worker'}</p>
          </div>
          <div>
            <span className="text-gray-500">Submitted:</span>
            <p className="font-medium text-gray-900">{formatTimeAgo(worker.submitted)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {['isSelfieVerified', 'isAddharDocVerified', 'isPoliceVerificationDocVerified'].map((field, index) => (
                <div
                  key={field}
                  className={`w-2 h-2 rounded-full ${
                    worker.verification?.[field] ? 'bg-green-500' : 'bg-orange-500'
                  }`}
                  title={field.replace('is', '').replace('Verified', '')}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">Documents</span>
          </div>
          <button
            onClick={() => {
              setSelectedWorker(worker);
              setShowWorkerModal(true);
            }}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
            aria-label={`Review ${worker.name}'s verification`}
          >
            <Eye className="w-3 h-3" />
            <span>Review</span>
          </button>
        </div>
      </div>
    );
  };

  // Memoized empty state
  const emptyState = useMemo(() => (
    <div className="text-center py-12 sm:py-16">
      <Shield className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3" />
      <p className="text-sm sm:text-base text-gray-600 font-medium">No pending verifications</p>
      <p className="text-xs sm:text-sm text-gray-500 mt-1">All worker verifications have been processed</p>
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Worker Verification</h1>
          <p className="text-sm text-gray-600 mt-1">Review and approve worker verification requests</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={exportLoading || verificationQueue.length === 0}
          className="flex items-center justify-center px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium w-full sm:w-auto"
        >
          {exportLoading ? (
            <Loader className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          {exportLoading ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search workers by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                aria-label="Search workers"
              />
            </div>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full sm:w-48"
              aria-label="Filter by priority"
            >
              {PRIORITIES.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Verification Queue */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? loadingState : verificationQueue.length === 0 ? emptyState : (
          <>
            {/* Mobile View */}
            <div className="sm:hidden space-y-3 p-4">
              {verificationQueue.map((worker) => (
                <MobileWorkerCard key={worker._id} worker={worker} />
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Worker</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Documents</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {verificationQueue.map((worker) => {
                    const priorityConfig = getPriorityConfig(worker.priority);
                    const PriorityIcon = priorityConfig.icon;

                    return (
                      <tr key={worker._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">{worker.name}</p>
                              <p className="text-xs text-gray-500 truncate">{worker.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${priorityConfig.color}`}>
                            <div className="flex items-center space-x-1">
                              <PriorityIcon className="w-3 h-3" />
                              <span>{priorityConfig.label}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {worker.service || 'General Worker'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatTimeAgo(worker.submitted)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1" title="Selfie, Aadhar, Police Verification">
                            {['isSelfieVerified', 'isAddharDocVerified', 'isPoliceVerificationDocVerified'].map((field) => (
                              <div
                                key={field}
                                className={`w-2 h-2 rounded-full ${
                                  worker.verification?.[field] ? 'bg-green-500' : 'bg-orange-500'
                                }`}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedWorker(worker);
                              setShowWorkerModal(true);
                            }}
                            className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            aria-label={`Review ${worker.name}'s verification`}
                          >
                            <Eye className="w-4 h-4" />
                            <span>Review</span>
                          </button>
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
        {verificationQueue.length > 0 && (
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

      {showWorkerModal && <WorkerVerificationModal />}
    </div>
  );
};

export default AdminVerification;