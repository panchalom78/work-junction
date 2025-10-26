import React, { useState, useEffect } from 'react';
import { 
  Shield, Search, Filter, Eye, CheckCircle, XCircle, 
  Clock, AlertCircle, FileText, User, Phone, Mail,
  ChevronLeft, ChevronRight, Download
} from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';

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

  const priorities = [
    { value: 'ALL', label: 'All Priorities' },
    { value: 'HIGH', label: 'High Priority' },
    { value: 'MEDIUM', label: 'Medium Priority' },
    { value: 'LOW', label: 'Low Priority' }
  ];

  useEffect(() => {
    fetchVerificationQueue();
  }, [currentPage, searchTerm, priorityFilter]);

  const fetchVerificationQueue = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(priorityFilter !== 'ALL' && { priority: priorityFilter })
      });

      const response = await axiosInstance.get(`/api/admin/verification/queue?${params}`);
      
      if (response.data.success) {
        setVerificationQueue(response.data.data.workers);
        setTotalPages(response.data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching verification queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationAction = async (workerId, action, rejectionReason = '') => {
    try {
      setActionLoading(true);
      const response = await axiosInstance.put(`/api/admin/verification/${workerId}`, {
        status: action,
        ...(action === 'REJECTED' && rejectionReason && { rejectionReason })
      });
      
      if (response.data.success) {
        fetchVerificationQueue(); // Refresh the list
        setShowWorkerModal(false);
      }
    } catch (error) {
      console.error('Error updating verification:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH': return <AlertCircle className="w-4 h-4" />;
      case 'MEDIUM': return <Clock className="w-4 h-4" />;
      case 'LOW': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const WorkerVerificationModal = () => {
    if (!selectedWorker) return null;

    const [rejectionReason, setRejectionReason] = useState('');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Worker Verification Review</h2>
            <button 
              onClick={() => setShowWorkerModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Worker Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedWorker.name}</h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{selectedWorker.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{selectedWorker.email}</span>
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(selectedWorker.priority)}`}>
                  <div className="flex items-center space-x-1">
                    {getPriorityIcon(selectedWorker.priority)}
                    <span>{selectedWorker.priority}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Documents */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Verification Documents</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Selfie */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-900">Selfie</h5>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedWorker.verification?.isSelfieVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {selectedWorker.verification?.isSelfieVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  {selectedWorker.verification?.selfieUrl ? (
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <img 
                        src={selectedWorker.verification.selfieUrl} 
                        alt="Selfie" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Aadhar Document */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-900">Aadhar Document</h5>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedWorker.verification?.isAddharDocVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {selectedWorker.verification?.isAddharDocVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  {selectedWorker.verification?.addharDocUrl ? (
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <img 
                        src={selectedWorker.verification.addharDocUrl} 
                        alt="Aadhar Document" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Police Verification */}
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-900">Police Verification</h5>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedWorker.verification?.isPoliceVerificationDocVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {selectedWorker.verification?.isPoliceVerificationDocVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  {selectedWorker.verification?.policeVerificationDocUrl ? (
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <img 
                        src={selectedWorker.verification.policeVerificationDocUrl} 
                        alt="Police Verification" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rejection Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason (if rejecting)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-4 border-t">
              <button
                onClick={() => setShowWorkerModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerificationAction(selectedWorker._id, 'REJECTED', rejectionReason)}
                disabled={actionLoading || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading ? 'Processing...' : 'Reject'}
              </button>
              <button
                onClick={() => handleVerificationAction(selectedWorker._id, 'APPROVED')}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading ? 'Processing...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Worker Verification</h1>
          <p className="text-gray-600">Review and approve worker verification requests</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search workers by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {priorities.map(priority => (
                <option key={priority.value} value={priority.value}>{priority.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Verification Queue */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Worker</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Priority</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Service</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Submitted</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Documents</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {verificationQueue.map((worker) => (
                    <tr key={worker._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{worker.name}</p>
                            <p className="text-sm text-gray-500">{worker.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(worker.priority)}`}>
                          <div className="flex items-center space-x-1">
                            {getPriorityIcon(worker.priority)}
                            <span>{worker.priority}</span>
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
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${
                            worker.verification?.isSelfieVerified ? 'bg-green-500' : 'bg-orange-500'
                          }`}></div>
                          <div className={`w-2 h-2 rounded-full ${
                            worker.verification?.isAddharDocVerified ? 'bg-green-500' : 'bg-orange-500'
                          }`}></div>
                          <div className={`w-2 h-2 rounded-full ${
                            worker.verification?.isPoliceVerificationDocVerified ? 'bg-green-500' : 'bg-orange-500'
                          }`}></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedWorker(worker);
                              setShowWorkerModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Review Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-700">
                Showing page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showWorkerModal && <WorkerVerificationModal />}
    </div>
  );
};

export default AdminVerification;
