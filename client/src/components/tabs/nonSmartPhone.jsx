// components/NonSmartphoneWorkers.js
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import CreateWorkerProfile from '../CreateWorkerForm';

const NonSmartphoneWorkers = () => {
  const [activeView, setActiveView] = useState('workers');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingAvailability, setUpdatingAvailability] = useState(null);
  const [updatingRequest, setUpdatingRequest] = useState(null);

  // Fetch workers
  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/api/service-agent/non-smartphone-workers');
      if (data.success) {
        setWorkers(data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load workers');
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch service requests
  const fetchServiceRequests = async () => {
    try {
      const { data } = await axiosInstance.get('/api/service-agent/service-requests');
      if (data.success) {
        setServiceRequests(data.data);
      }
    } catch (error) {
      console.error('Error fetching service requests:', error);
      toast.error('Failed to load service requests');
    }
  };

  useEffect(() => {
    fetchWorkers();
    fetchServiceRequests();
  }, []);

  // Update worker availability status
  const updateStatusDirectly = async (workerId, newStatus) => {
    try {
      setUpdatingAvailability(workerId);
      const res = await axiosInstance.patch(`/api/service-agent/worker/${workerId}/availability`, {
        availabilityStatus: newStatus,
      });
      console.log(res.data);
      toast.success(`Status updated to ${newStatus.replace("-", " ")}`);
      fetchWorkers();
    } catch (error) {
      toast.error("Update failed");
      console.error(error);
    } finally {
      setUpdatingAvailability(null);
    }
  };

  // Update request status
  const updateRequestStatus = async (requestId, newStatus, notes = '') => {
    try {
      setUpdatingRequest(requestId);
      const { data } = await axiosInstance.patch(
        `/api/service-agent/service-requests/${requestId}/status`,
        {
          status: newStatus,
          agentNotes: notes,
          actionTakenAt: new Date().toISOString()
        }
      );

      if (data.success) {
        toast.success(`Request ${newStatus.toLowerCase()}`);
        fetchServiceRequests();
        setShowStatusModal(false);
        setSelectedRequest(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update request');
      console.error(error);
    } finally {
      setUpdatingRequest(null);
    }
  };

  // Assign worker to request
  const assignWorkerToRequest = async (requestId, workerId) => {
    try {
      setUpdatingRequest(requestId);
      const { data } = await axiosInstance.patch(
        `/api/service-agent/service-requests/${requestId}/assign`,
        { workerId }
      );

      if (data.success) {
        toast.success('Worker assigned successfully');
        fetchServiceRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign worker');
    } finally {
      setUpdatingRequest(null);
    }
  };

  const toggleAvailability = async (worker) => {
    const workerId = worker._id;
    const current = worker.workerProfile?.availabilityStatus || "available";
    const statusCycle = ["available", "busy", "off-duty"];
    const nextIndex = (statusCycle.indexOf(current) + 1) % statusCycle.length;
    const newStatus = statusCycle[nextIndex];

    try {
      setUpdatingAvailability(workerId);
      await axiosInstance.patch(`/api/service-agent/worker/${workerId}/availability`, {
        availabilityStatus: newStatus,
      });
      toast.success(`Status: ${newStatus.replace("-", " ")}`);
      fetchWorkers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update");
    } finally {
      setUpdatingAvailability(null);
    }
  };

  useEffect(() => {
    if (selectedWorker && activeView === 'work-list') {
      const workerRequests = serviceRequests.filter(req => 
        req.assignedWorker?._id === selectedWorker._id
      );
      setFilteredRequests(workerRequests);
    }
  }, [selectedWorker, serviceRequests, activeView]);

  const handleCallWorker = (worker) => {
    setSelectedWorker(worker);
    setShowCallModal(true);
  };

  const handleViewWorkList = (worker) => {
    setSelectedWorker(worker);
    setActiveView('work-list');
  };

  const handleUpdateRequestStatus = (request) => {
    setSelectedRequest(request);
    setShowStatusModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      assigned: { class: 'bg-blue-100 text-blue-800', text: 'Assigned' },
      confirmed: { class: 'bg-green-100 text-green-800', text: 'Confirmed' },
      in_progress: { class: 'bg-orange-100 text-orange-800', text: 'In Progress' },
      completed: { class: 'bg-green-100 text-green-800', text: 'Completed' },
      cancelled: { class: 'bg-red-100 text-red-800', text: 'Cancelled' },
      available: { class: 'bg-green-100 text-green-800', text: 'Available' },
      busy: { class: 'bg-orange-100 text-orange-800', text: 'Busy' },
      "off-duty": { class: 'bg-red-100 text-red-800', text: 'Off Duty' },
    };

    const config = statusConfig[status] || { class: 'bg-gray-100 text-gray-800', text: status };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[priority] || 'bg-gray-100 text-gray-800'}`}>
        {priority?.charAt(0).toUpperCase() + priority?.slice(1) || 'Normal'}
      </span>
    );
  };

  const WorkerCard = ({ worker }) => {
    const location = worker.address
      ? `${worker.address.area || ''}, ${worker.address.city || ''}`.trim() || '—'
      : '—';

    const service = worker.workerProfile?.services?.[0]?.serviceId?.name || 'General Service';

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {worker.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{worker.name}</h3>
                <p className="text-sm text-gray-600">{service}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {location}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {worker.phone}
              </span>
            </div>
          </div>
          <div className="text-right">
            {getStatusBadge(worker.workerProfile?.availabilityStatus || 'unavailable')}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Skills & Services:</h4>
          <div className="flex flex-wrap gap-1">
            {worker.workerProfile?.skills?.length > 0 ? (
              worker.workerProfile.skills.slice(0, 3).map((s, i) => (
                <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                  {s.skillId?.name}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-500">No skills assigned</span>
            )}
            {worker.workerProfile?.skills?.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{worker.workerProfile.skills.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* AVAILABILITY TOGGLE */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <label className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Availability Control</span>
            <div className="flex items-center space-x-1">
              {["available", "busy", "off-duty"].map((status) => (
                <button
                  key={status}
                  onClick={() => updateStatusDirectly(worker._id, status)}
                  disabled={updatingAvailability === worker._id}
                  className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${
                    worker.workerProfile?.availabilityStatus === status
                      ? status === 'available'
                        ? 'bg-green-600 text-white shadow-sm'
                        : status === 'busy'
                        ? 'bg-orange-600 text-white shadow-sm'
                        : 'bg-red-600 text-white shadow-sm'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  } ${updatingAvailability === worker._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {status === "off-duty" ? "Off Duty" : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </label>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => handleCallWorker(worker)}
            className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call
          </button>
          <button
            onClick={() => handleViewWorkList(worker)}
            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Work List
          </button>
        </div>
      </div>
    );
  };

  const RequestCard = ({ request }) => {
    const isAssignedToSelectedWorker = selectedWorker && request.assignedWorker?._id === selectedWorker._id;
    
    return (
      <div className={`bg-white rounded-xl shadow-sm border p-6 transition-all duration-200 ${
        isAssignedToSelectedWorker ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
      }`}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {request.customer?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'CU'}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{request.serviceType?.name || 'Service Request'}</h3>
                <p className="text-sm text-gray-600">{request.customer?.name || 'Customer'}</p>
              </div>
            </div>
          </div>
          <div className="text-right space-y-2">
            {getStatusBadge(request.status)}
            {getPriorityBadge(request.priority)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <p className="text-gray-600"><strong>Location:</strong> {request.location?.address || 'Not specified'}</p>
            <p className="text-gray-600"><strong>Schedule:</strong> {request.preferredSchedule ? new Date(request.preferredSchedule).toLocaleString() : 'Flexible'}</p>
          </div>
          <div>
            <p className="text-gray-600"><strong>Budget:</strong> ₹{request.budget || 'Not specified'}</p>
            <p className="text-gray-600"><strong>Created:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {request.description && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{request.description}</p>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {request.assignedWorker ? (
              <span>Assigned to: <strong>{request.assignedWorker.name}</strong></span>
            ) : (
              <span className="text-yellow-600">Not assigned</span>
            )}
          </div>
          
          <div className="flex space-x-2">
            {!request.assignedWorker && selectedWorker && (
              <button
                onClick={() => assignWorkerToRequest(request._id, selectedWorker._id)}
                disabled={updatingRequest === request._id}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {updatingRequest === request._id ? 'Assigning...' : 'Assign'}
              </button>
            )}
            <button
              onClick={() => handleUpdateRequestStatus(request)}
              className="px-3 py-1 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    );
  };

  const CustomerRequestsView = () => {
    const pendingRequests = serviceRequests.filter(req => 
      ['pending', 'assigned', 'confirmed'].includes(req.status)
    );
    const completedRequests = serviceRequests.filter(req => 
      ['completed', 'cancelled'].includes(req.status)
    );

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Customer Service Requests</h1>
              <p className="text-gray-600">Manage and assign customer requests to workers</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{pendingRequests.length}</div>
                <div className="text-sm text-gray-600">Active Requests</div>
              </div>
              <button
                onClick={() => setActiveView('workers')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
              >
                Back to Workers
              </button>
            </div>
          </div>
        </div>

        {/* Active Requests */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Active Requests ({pendingRequests.length})</h2>
          {pendingRequests.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingRequests.map(request => (
                <RequestCard key={request._id} request={request} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Active Requests</h3>
              <p className="text-gray-500">All customer requests are completed or there are no pending requests.</p>
            </div>
          )}
        </div>

        {/* Completed Requests */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Completed & Cancelled ({completedRequests.length})</h2>
          {completedRequests.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {completedRequests.map(request => (
                <RequestCard key={request._id} request={request} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <p className="text-gray-500">No completed or cancelled requests yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const WorkListView = () => {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <button
                  onClick={() => setActiveView('workers')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{selectedWorker.name}'s Work List</h1>
                  <p className="text-gray-600">Assigned service requests and work schedule</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {getStatusBadge(selectedWorker.workerProfile?.availabilityStatus || 'unavailable')}
              <button
                onClick={() => setActiveView('customer-requests')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                View All Requests
              </button>
            </div>
          </div>
        </div>

        {/* Worker's Assigned Requests */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Assigned Requests ({filteredRequests.length})</h2>
          {filteredRequests.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredRequests.map(request => (
                <RequestCard key={request._id} request={request} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Assigned Requests</h3>
              <p className="text-gray-500 mb-4">This worker doesn't have any assigned service requests yet.</p>
              <button
                onClick={() => setActiveView('customer-requests')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Assign from Requests
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeView === 'create') return <CreateWorkerProfile />;

  if (activeView === 'customer-requests') return <CustomerRequestsView />;

  if (activeView === 'work-list' && selectedWorker) return <WorkListView />;

  return (
    <div className="space-y-6 p-4">
      {/* HEADER */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Non-Smartphone Workers</h1>
            <p className="text-gray-600">Manage agent-created workers and service requests</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{workers.length}</div>
              <div className="text-sm text-gray-600">Total Workers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {workers.filter(w => w.workerProfile?.availabilityStatus === 'available').length}
              </div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveView('create')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Worker
            </button>
            <button
              onClick={() => setActiveView('customer-requests')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Customer Requests
            </button>
          </div>
          <div className="text-sm text-gray-600">
            {workers.filter(w => w.workerProfile?.availabilityStatus === 'available').length} workers available
          </div>
        </div>
      </div>

      {/* WORKERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workers.map((worker) => (
          <WorkerCard key={worker._id} worker={worker} />
        ))}
      </div>

      {workers.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">👷</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Workers Yet</h3>
          <p className="text-gray-500 mb-6">Create your first non-smartphone worker to get started.</p>
          <button
            onClick={() => setActiveView('create')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + Create First Worker
          </button>
        </div>
      )}

      {/* CALL MODAL */}
      {showCallModal && selectedWorker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              📞
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Call Worker</h3>
            <p className="text-gray-600 mb-4">Call {selectedWorker.name} directly</p>
            <div className="text-2xl font-bold text-gray-900 mb-6">{selectedWorker.phone}</div>
            <div className="flex justify-center space-x-4">
              <a
                href={`tel:${selectedWorker.phone}`}
                className="bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 font-medium flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call Now
              </a>
              <button
                onClick={() => setShowCallModal(false)}
                className="bg-gray-300 text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-400 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS UPDATE MODAL */}
      {showStatusModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Update Request Status</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                <strong>Service:</strong> {selectedRequest.serviceType?.name}
              </p>
              <p className="text-gray-600">
                <strong>Customer:</strong> {selectedRequest.customer?.name}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    if (newStatus) {
                      updateRequestStatus(selectedRequest._id, newStatus);
                    }
                  }}
                  disabled={updatingRequest === selectedRequest._id}
                >
                  <option value="">Select new status</option>
                  <option value="assigned">Assigned</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => updateRequestStatus(selectedRequest._id, 'completed', 'Service completed successfully')}
                  disabled={updatingRequest === selectedRequest._id}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  Mark Complete
                </button>
                <button
                  onClick={() => updateRequestStatus(selectedRequest._id, 'cancelled', 'Request cancelled by agent')}
                  disabled={updatingRequest === selectedRequest._id}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NonSmartphoneWorkers;



