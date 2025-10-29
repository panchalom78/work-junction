// components/WorkerRequests.js
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';

const CustomerRequests = ({ worker, onBack }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  // FETCH PENDING REQUESTS (not assigned or new)
  const fetchRequests = async () => {
    // try {
    //   setLoading(true);
    //   const { data } = await axiosInstance.get(`/api/service-agent/worker/${worker._id}/requests`);
    //   if (data.success) setRequests(data.data);
    // } catch (error) {
    //   toast.error('Failed to load requests');
    // } finally {
    //   setLoading(false);
    // }
  };

//   useEffect(() => {
//     fetchRequests();
//   }, [worker._id]);

  // CALL CUSTOMER
  const callCustomer = (phone) => {
    window.open(`tel:${phone}`, '_self');
  };

  // CALL WORKER
  const callWorker = () => {
    window.open(`tel:${worker.phone}`, '_self');
  };

  // ACCEPT REQUEST → Assign to worker
  const acceptRequest = async (requestId) => {
    try {
      setUpdating(requestId);
      await axiosInstance.post(`/api/service-agent/assign-job`, {
        requestId,
        workerId: worker._id,
      });
      toast.success('Job assigned to worker');
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign');
    } finally {
      setUpdating(null);
    }
  };

  // REJECT REQUEST
  const rejectRequest = async (requestId) => {
    try {
      setUpdating(requestId);
      await axiosInstance.post(`/api/service-agent/reject-job`, { requestId });
      toast.success('Request rejected');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to reject');
    } finally {
      setUpdating(null);
    }
  };

  const getPriorityBadge = (p) => {
    const map = { high: 'bg-red-100 text-red-800', medium: 'bg-yellow-100 text-yellow-800', low: 'bg-green-100 text-green-800' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[p]}`}>{p.toUpperCase()}</span>;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 rounded"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="text-blue-600 hover:text-blue-800 font-medium">
              ← Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Requests for {worker.name}
              </h1>
              <p className="text-gray-600">{worker.phone}</p>
            </div>
          </div>
          <button
            onClick={callWorker}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            Call Worker
          </button>
        </div>
      </div>

      {/* REQUESTS LIST */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">No Requests</div>
            <p className="text-gray-500">No pending customer requests for this worker.</p>
          </div>
        ) : (
          requests.map((req) => (
            <div key={req._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  {getPriorityBadge(req.priority)}
                  <div>
                    <h4 className="font-semibold text-gray-900">{req.customerName}</h4>
                    <p className="text-sm text-gray-600">{req.service.name} • {req.location}</p>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  {new Date(req.createdAt).toLocaleString()}
                </div>
              </div>

              <p className="text-gray-700 mb-3">{req.description}</p>

              <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                <span>Budget: {req.budget}</span>
                <span>Timing: {req.timing}</span>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => callCustomer(req.customerPhone)}
                  className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700"
                >
                  Call Customer
                </button>
                <button
                  onClick={() => acceptRequest(req._id)}
                  disabled={updating === req._id}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {updating === req._id ? 'Assigning...' : 'Accept & Assign'}
                </button>
                <button
                  onClick={() => rejectRequest(req._id)}
                  disabled={updating === req._id}
                  className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CustomerRequests;