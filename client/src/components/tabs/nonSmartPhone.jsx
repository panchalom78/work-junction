// components/NonSmartphoneWorkers.js
import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import CreateWorkerProfile from '../CreateWorkerForm';

const NonSmartphoneWorkers = () => {
  const [activeView, setActiveView] = useState('workers'); // workers, work-list, create
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWorkers: 0,
    activeWorkers: 0,
    pendingRequests: 0,
    completedJobs: 0
  });

  // Mock data for workers
  const mockWorkers = [
    {
      id: 1,
      name: 'Ramesh Patel',
      phone: '+91 98765 43210',
      service: 'Plumber',
      location: 'Andheri East',
      status: 'available',
      rating: 4.3,
      completedJobs: 21,
      totalEarnings: 125000,
      joinDate: '2023-01-15',
      skills: ['Pipe Fitting', 'Drain Cleaning', 'Tap Repair'],
      documents: {
        aadhaar: true,
        police: true,
        experience: true
      }
    },
    {
      id: 2,
      name: 'Suresh Kumar',
      phone: '+91 87654 32109',
      service: 'Electrician',
      location: 'Bandra West',
      status: 'busy',
      rating: 4.1,
      completedJobs: 14,
      totalEarnings: 89000,
      joinDate: '2023-02-20',
      skills: ['Wiring', 'Switch Repair', 'Socket Installation'],
      documents: {
        aadhaar: true,
        police: true,
        experience: false
      }
    },
    {
      id: 3,
      name: 'Laxmi Devi',
      phone: '+91 76543 21098',
      service: 'Cleaner',
      location: 'Ghatkopar',
      status: 'available',
      rating: 4.5,
      completedJobs: 32,
      totalEarnings: 156000,
      joinDate: '2023-03-10',
      skills: ['Deep Cleaning', 'Office Cleaning', 'Post-Construction'],
      documents: {
        aadhaar: true,
        police: false,
        experience: true
      }
    },
    {
      id: 4,
      name: 'Amit Singh',
      phone: '+91 65432 10987',
      service: 'Carpenter',
      location: 'Powai',
      status: 'available',
      rating: 4.2,
      completedJobs: 18,
      totalEarnings: 108000,
      joinDate: '2023-04-05',
      skills: ['Furniture Repair', 'Door Installation', 'Wood Polishing'],
      documents: {
        aadhaar: true,
        police: true,
        experience: true
      }
    }
  ];

  // Mock data for service requests
  const mockServiceRequests = [
    {
      id: 1,
      customerName: 'Mrs. Sharma',
      customerPhone: '+91 91234 56789',
      service: 'Plumber',
      location: 'Juhu, Andheri West',
      description: 'Kitchen sink blockage and water leakage',
      budget: '₹500-800',
      timing: 'ASAP',
      status: 'assigned',
      priority: 'high',
      assignedWorker: 1,
      createdAt: '2023-10-15 10:30',
      workerStatus: 'on_the_way',
      customerUpdates: [
        {
          type: 'status_update',
          message: 'Worker Ramesh Patel is on the way',
          timestamp: '2023-10-15 11:00'
        }
      ]
    },
    {
      id: 2,
      customerName: 'Mr. Verma',
      customerPhone: '+91 92345 67890',
      service: 'Electrician',
      location: 'Khar Road',
      description: 'Switch board repair and socket installation',
      budget: '₹300-500',
      timing: 'Evening',
      status: 'in_progress',
      priority: 'medium',
      assignedWorker: 2,
      createdAt: '2023-10-15 09:15',
      workerStatus: 'work_started',
      customerUpdates: [
        {
          type: 'status_update',
          message: 'Worker Suresh Kumar has started the work',
          timestamp: '2023-10-15 14:30'
        }
      ]
    },
    {
      id: 3,
      customerName: 'Ms. Patel',
      customerPhone: '+91 93456 78901',
      service: 'Cleaner',
      location: 'Bandra West',
      description: 'Full house deep cleaning',
      budget: '₹1200-1500',
      timing: 'Tomorrow Morning',
      status: 'completed',
      priority: 'low',
      assignedWorker: 3,
      createdAt: '2023-10-14 08:45',
      workerStatus: 'work_completed',
      customerUpdates: [
        {
          type: 'status_update',
          message: 'Work completed successfully',
          timestamp: '2023-10-14 16:00'
        },
        {
          type: 'payment',
          message: 'Payment received - ₹1400',
          timestamp: '2023-10-14 16:15'
        }
      ]
    },
    {
      id: 4,
      customerName: 'Mr. Joshi',
      customerPhone: '+91 94567 89012',
      service: 'Carpenter',
      location: 'Powai',
      description: 'Door repair and polishing',
      budget: '₹600-900',
      timing: 'Today',
      status: 'new',
      priority: 'medium',
      assignedWorker: null,
      createdAt: '2023-10-15 12:00',
      workerStatus: null
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API calls
        setTimeout(() => {
          setWorkers(mockWorkers);
          setServiceRequests(mockServiceRequests);
          setStats({
            totalWorkers: mockWorkers.length,
            activeWorkers: mockWorkers.filter(w => w.status === 'available').length,
            pendingRequests: mockServiceRequests.filter(req => req.status === 'new' || req.status === 'assigned').length,
            completedJobs: mockWorkers.reduce((sum, worker) => sum + worker.completedJobs, 0)
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter requests when a worker is selected
  useEffect(() => {
    if (selectedWorker && activeView === 'work-list') {
      const workerRequests = serviceRequests.filter(
        req => req.assignedWorker === selectedWorker.id
      );
      setFilteredRequests(workerRequests);
    }
  }, [selectedWorker, serviceRequests, activeView]);

  const handleCallWorker = (worker) => {
    setSelectedWorker(worker);
    setShowCallModal(true);
  };

  const handleCallCustomer = (request) => {
    setSelectedRequest(request);
    setShowCallModal(true);
  };

  const handleUpdateStatus = (request) => {
    setSelectedRequest(request);
    setShowStatusModal(true);
  };

  const handleViewWorkList = (worker) => {
    setSelectedWorker(worker);
    setActiveView('work-list');
  };

  const updateRequestStatus = (requestId, status, workerStatus = null, message = '') => {
    const updatedRequests = serviceRequests.map(req => {
      if (req.id === requestId) {
        const update = {
          ...req,
          status,
          ...(workerStatus && { workerStatus })
        };

        if (message) {
          update.customerUpdates = [
            ...(req.customerUpdates || []),
            {
              type: 'status_update',
              message,
              timestamp: new Date().toISOString()
            }
          ];
        }

        return update;
      }
      return req;
    });

    setServiceRequests(updatedRequests);
    
    // If we're in work-list view, update filtered requests too
    if (activeView === 'work-list' && selectedWorker) {
      const workerRequests = updatedRequests.filter(
        req => req.assignedWorker === selectedWorker.id
      );
      setFilteredRequests(workerRequests);
    }
  };

  const assignWorkerToRequest = (requestId, workerId) => {
    const worker = workers.find(w => w.id === workerId);
    const updatedRequests = serviceRequests.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          assignedWorker: workerId,
          status: 'assigned',
          workerStatus: 'contacted',
          customerUpdates: [
            ...(req.customerUpdates || []),
            {
              type: 'status_update',
              message: `Worker ${worker.name} has been assigned and will contact shortly`,
              timestamp: new Date().toISOString()
            }
          ]
        };
      }
      return req;
    });

    setServiceRequests(updatedRequests);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: 'bg-green-100 text-green-800',
      busy: 'bg-red-100 text-red-800',
      new: 'bg-blue-100 text-blue-800',
      assigned: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-gray-100 text-gray-800',
      on_the_way: 'bg-orange-100 text-orange-800',
      work_started: 'bg-indigo-100 text-indigo-800',
      work_completed: 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status]}`}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </span>
    );
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      high: '🔴',
      medium: '🟡',
      low: '🟢'
    };
    return icons[priority] || '⚪';
  };

  const WorkerCard = ({ worker }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{worker.name}</h3>
          <p className="text-sm text-gray-600">{worker.service} • {worker.location}</p>
        </div>
        <div className="text-right">
          {getStatusBadge(worker.status)}
          <p className="text-xs text-gray-500 mt-1">{worker.phone}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-600">Rating:</span>
          <span className="ml-2 font-medium">{worker.rating}/5 ⭐</span>
        </div>
        <div>
          <span className="text-gray-600">Jobs:</span>
          <span className="ml-2 font-medium">{worker.completedJobs}</span>
        </div>
        <div>
          <span className="text-gray-600">Earnings:</span>
          <span className="ml-2 font-medium">₹{worker.totalEarnings?.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-gray-600">Since:</span>
          <span className="ml-2 font-medium">{new Date(worker.joinDate).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Skills:</h4>
        <div className="flex flex-wrap gap-1">
          {worker.skills.map((skill, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => handleCallWorker(worker)}
          className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700"
        >
          📞 Call
        </button>
        <button
          onClick={() => handleViewWorkList(worker)}
          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700"
        >
          📋 Work List
        </button>
        <button className="flex-1 bg-gray-600 text-white py-2 px-3 rounded text-sm hover:bg-gray-700">
          👁️ View
        </button>
      </div>
    </div>
  );

  const RequestCard = ({ request }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-lg">{getPriorityIcon(request.priority)}</span>
          <div>
            <h4 className="font-semibold text-gray-900">{request.customerName}</h4>
            <p className="text-sm text-gray-600">{request.service} • {request.location}</p>
          </div>
        </div>
        <div className="text-right">
          {getStatusBadge(request.status)}
          {request.workerStatus && (
            <div className="mt-1">
              {getStatusBadge(request.workerStatus)}
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-3">{request.description}</p>

      <div className="flex justify-between items-center mb-3 text-sm text-gray-600">
        <span>Budget: {request.budget}</span>
        <span>Timing: {request.timing}</span>
        <span>{new Date(request.createdAt).toLocaleString()}</span>
      </div>

      {request.customerUpdates && request.customerUpdates.length > 0 && (
        <div className="mb-3 p-3 bg-gray-50 rounded">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Updates:</h5>
          <div className="space-y-1">
            {request.customerUpdates.slice(-2).map((update, index) => (
              <div key={index} className="text-xs text-gray-600">
                <span className="font-medium">{update.timestamp.split('T')[1].substring(0, 5)}:</span> {update.message}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex space-x-2">
        <button
          onClick={() => handleCallCustomer(request)}
          className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700"
        >
          📞 Customer
        </button>
        
        {request.assignedWorker && (
          <button
            onClick={() => handleCallWorker(workers.find(w => w.id === request.assignedWorker))}
            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700"
          >
            📞 Worker
          </button>
        )}
        
        <button
          onClick={() => handleUpdateStatus(request)}
          className="flex-1 bg-purple-600 text-white py-2 px-3 rounded text-sm hover:bg-purple-700"
        >
          📝 Update Status
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render Create Worker View
  if (activeView === 'create') {
    return <CreateWorkerProfile />;
  }

  // Render Work List View
  if (activeView === 'work-list' && selectedWorker) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveView('workers')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Workers
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{selectedWorker.name}'s Work List</h1>
                <p className="text-gray-600">{selectedWorker.service} • {selectedWorker.location}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Phone: {selectedWorker.phone}</div>
              <div className="text-sm text-gray-600">Status: {getStatusBadge(selectedWorker.status)}</div>
            </div>
          </div>
        </div>

        {/* Work List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Assigned Jobs ({filteredRequests.length})
            </h3>
            <button
              onClick={() => handleCallWorker(selectedWorker)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              📞 Call {selectedWorker.name}
            </button>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Jobs Assigned</h3>
              <p className="text-gray-500">This worker doesn't have any assigned jobs at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main Workers View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Non-Smartphone Workers</h1>
            <p className="text-gray-600">Manage your workers and their service requests</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalWorkers}</div>
              <div className="text-sm text-gray-600">Total Workers</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.activeWorkers}</div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</div>
              <div className="text-sm text-gray-600">Pending Jobs</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{stats.completedJobs}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveView('workers')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeView === 'workers'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              👷 My Workers
            </button>
            <button
              onClick={() => setActiveView('create')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center"
            >
              <span>+ Add New Worker</span>
            </button>
          </div>
          
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search workers..."
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Services</option>
              <option value="Plumber">Plumber</option>
              <option value="Electrician">Electrician</option>
              <option value="Cleaner">Cleaner</option>
              <option value="Carpenter">Carpenter</option>
            </select>
          </div>
        </div>
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workers.map((worker) => (
          <WorkerCard key={worker.id} worker={worker} />
        ))}
      </div>

      {workers.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">👷</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Workers Found</h3>
          <p className="text-gray-500 mb-6">You haven't registered any non-smartphone workers yet.</p>
          <button
            onClick={() => setActiveView('create')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + Create Your First Worker Profile
          </button>
        </div>
      )}

      {/* Call Modal */}
      {showCallModal && (selectedWorker || selectedRequest) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📞</span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {selectedWorker ? `Call ${selectedWorker.name}` : `Call ${selectedRequest?.customerName}`}
              </h3>
              
              <p className="text-gray-600 mb-4">
                {selectedWorker 
                  ? `Discuss work assignment or updates`
                  : `Update customer about service status`
                }
              </p>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <p className="text-2xl font-bold text-gray-800">
                  {selectedWorker ? selectedWorker.phone : selectedRequest?.customerPhone}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedWorker ? selectedWorker.service : selectedRequest?.service}
                </p>
              </div>

              <div className="flex justify-center space-x-4">
                <a
                  href={`tel:${selectedWorker ? selectedWorker.phone : selectedRequest?.customerPhone}`}
                  className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 flex items-center"
                >
                  <span className="mr-2">Call Now</span>
                  📞
                </a>
                <button
                  onClick={() => {
                    setShowCallModal(false);
                    setSelectedWorker(null);
                    setSelectedRequest(null);
                  }}
                  className="bg-gray-300 text-gray-700 px-6 py-3 rounded-full hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800">Update Job Status</h3>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800">{selectedRequest.customerName}</h4>
                <p className="text-sm text-gray-600">{selectedRequest.service} - {selectedRequest.description}</p>
                <p className="text-sm text-gray-600">Current Status: {getStatusBadge(selectedRequest.status)}</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-700">Update Status To:</h4>
                
                {selectedRequest.status === 'new' && (
                  <button
                    onClick={() => {
                      updateRequestStatus(selectedRequest.id, 'assigned', 'contacted', 'Worker has been contacted and will reach soon');
                      setShowStatusModal(false);
                    }}
                    className="w-full text-left p-3 border border-yellow-200 bg-yellow-50 rounded-lg hover:bg-yellow-100"
                  >
                    <div className="font-medium">Assigned</div>
                    <div className="text-sm text-gray-600">Worker has been contacted</div>
                  </button>
                )}

                {selectedRequest.status === 'assigned' && (
                  <button
                    onClick={() => {
                      updateRequestStatus(selectedRequest.id, 'in_progress', 'on_the_way', 'Worker is on the way to location');
                      setShowStatusModal(false);
                    }}
                    className="w-full text-left p-3 border border-orange-200 bg-orange-50 rounded-lg hover:bg-orange-100"
                  >
                    <div className="font-medium">On The Way</div>
                    <div className="text-sm text-gray-600">Worker is traveling to location</div>
                  </button>
                )}

                {selectedRequest.status === 'in_progress' && (
                  <>
                    <button
                      onClick={() => {
                        updateRequestStatus(selectedRequest.id, 'in_progress', 'work_started', 'Work has started at location');
                        setShowStatusModal(false);
                      }}
                      className="w-full text-left p-3 border border-purple-200 bg-purple-50 rounded-lg hover:bg-purple-100"
                    >
                      <div className="font-medium">Work Started</div>
                      <div className="text-sm text-gray-600">Worker has started the job</div>
                    </button>

                    <button
                      onClick={() => {
                        updateRequestStatus(selectedRequest.id, 'completed', 'work_completed', 'Work has been completed successfully');
                        setShowStatusModal(false);
                      }}
                      className="w-full text-left p-3 border border-green-200 bg-green-50 rounded-lg hover:bg-green-100"
                    >
                      <div className="font-medium">Completed</div>
                      <div className="text-sm text-gray-600">Job has been finished</div>
                    </button>
                  </>
                )}

                {selectedRequest.status === 'completed' && (
                  <div className="text-center p-4 bg-gray-100 rounded-lg">
                    <p className="text-gray-600">This job is already completed.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NonSmartphoneWorkers;