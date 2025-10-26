import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const WorkerManagement = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Mock data - replace with actual API call
  const mockWorkers = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      service: 'Plumber',
      phone: '+91 98765 43210',
      email: 'rajesh.kumar@email.com',
      location: 'Andheri East, Mumbai',
      status: 'active',
      rating: 4.5,
      completedJobs: 47,
      joinDate: '2023-01-15',
      documents: {
        aadhaar: true,
        police: true,
        experience: true
      },
      earnings: 125000
    },
    {
      id: 2,
      name: 'Priya Sharma',
      service: 'Electrician',
      phone: '+91 87654 32109',
      email: 'priya.sharma@email.com',
      location: 'Bandra West, Mumbai',
      status: 'active',
      rating: 4.2,
      completedJobs: 32,
      joinDate: '2023-03-20',
      documents: {
        aadhaar: true,
        police: true,
        experience: false
      },
      earnings: 89000
    },
    {
      id: 3,
      name: 'Amit Patel',
      service: 'Carpenter',
      phone: '+91 76543 21098',
      email: 'amit.patel@email.com',
      location: 'Powai, Mumbai',
      status: 'suspended',
      rating: 4.0,
      completedJobs: 28,
      joinDate: '2023-02-10',
      documents: {
        aadhaar: true,
        police: false,
        experience: true
      },
      earnings: 67000,
      suspensionReason: 'Customer complaints'
    },
    {
      id: 4,
      name: 'Sunita Singh',
      service: 'Cleaner',
      phone: '+91 65432 10987',
      email: 'sunita.singh@email.com',
      location: 'Ghatkopar, Mumbai',
      status: 'pending',
      rating: 0,
      completedJobs: 0,
      joinDate: '2023-05-01',
      documents: {
        aadhaar: true,
        police: false,
        experience: false
      },
      earnings: 0
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchWorkers = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API endpoint
        // const response = await axiosInstance.get('/api/service-agent/workers');
        // setWorkers(response.data.data);
        
        // Using mock data for now
        setTimeout(() => {
          setWorkers(mockWorkers);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching workers:', error);
        setLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  const handleSuspendWorker = async (workerId) => {
    if (window.confirm('Are you sure you want to suspend this worker?')) {
      try {
        // TODO: Replace with actual API endpoint
        // await axiosInstance.put(`/api/service-agent/workers/${workerId}/suspend`);
        
        // Update local state
        setWorkers(workers.map(worker => 
          worker.id === workerId 
            ? { ...worker, status: 'suspended', suspensionReason: 'Admin action' }
            : worker
        ));
        
        alert('Worker suspended successfully');
      } catch (error) {
        console.error('Error suspending worker:', error);
        alert('Error suspending worker');
      }
    }
  };

  const handleActivateWorker = async (workerId) => {
    try {
      // TODO: Replace with actual API endpoint
      // await axiosInstance.put(`/api/service-agent/workers/${workerId}/activate`);
      
      // Update local state
      setWorkers(workers.map(worker => 
        worker.id === workerId 
          ? { ...worker, status: 'active', suspensionReason: null }
          : worker
      ));
      
      alert('Worker activated successfully');
    } catch (error) {
      console.error('Error activating worker:', error);
      alert('Error activating worker');
    }
  };

  const handleViewDetails = (worker) => {
    setSelectedWorker(worker);
    setShowDetailsModal(true);
  };

  // Filter workers based on search and status
  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || worker.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Worker Management</h1>
            <p className="text-gray-600">Manage all service workers and their status</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{workers.length}</div>
            <div className="text-gray-600">Total Workers</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, service, or location..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="sm:w-48">
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Workers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Worker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service & Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jobs Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWorkers.map((worker) => (
                <tr key={worker.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {worker.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{worker.name}</div>
                        <div className="text-sm text-gray-500">{worker.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{worker.service}</div>
                    <div className="text-sm text-gray-500">{worker.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(worker.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900">{worker.rating}/5</span>
                      {worker.rating > 0 && (
                        <span className="ml-1 text-yellow-400">★</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {worker.completedJobs}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(worker)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      {worker.status === 'active' ? (
                        <button
                          onClick={() => handleSuspendWorker(worker.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Suspend
                        </button>
                      ) : worker.status === 'suspended' ? (
                        <button
                          onClick={() => handleActivateWorker(worker.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Activate
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredWorkers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No workers found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Worker Details Modal */}
      {showDetailsModal && selectedWorker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800">Worker Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorker.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Service</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorker.service}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorker.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorker.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorker.location}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedWorker.status)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rating</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorker.rating}/5</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Jobs Completed</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorker.completedJobs}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Join Date</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedWorker.joinDate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Earnings</label>
                    <p className="mt-1 text-sm text-gray-900">₹{selectedWorker.earnings?.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Documents</label>
                  <div className="flex space-x-4">
                    <div className={`px-3 py-2 rounded ${selectedWorker.documents.aadhaar ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      Aadhaar: {selectedWorker.documents.aadhaar ? '✓' : '✗'}
                    </div>
                    <div className={`px-3 py-2 rounded ${selectedWorker.documents.police ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      Police: {selectedWorker.documents.police ? '✓' : '✗'}
                    </div>
                    <div className={`px-3 py-2 rounded ${selectedWorker.documents.experience ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      Experience: {selectedWorker.documents.experience ? '✓' : '✗'}
                    </div>
                  </div>
                </div>

                {selectedWorker.suspensionReason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Suspension Reason</label>
                    <p className="mt-1 text-sm text-red-600">{selectedWorker.suspensionReason}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  {selectedWorker.status === 'active' ? (
                    <button
                      onClick={() => {
                        handleSuspendWorker(selectedWorker.id);
                        setShowDetailsModal(false);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Suspend Worker
                    </button>
                  ) : selectedWorker.status === 'suspended' ? (
                    <button
                      onClick={() => {
                        handleActivateWorker(selectedWorker.id);
                        setShowDetailsModal(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Activate Worker
                    </button>
                  ) : null}
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerManagement;