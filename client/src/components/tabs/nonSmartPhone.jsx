import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const NonSmartphoneWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newWorker, setNewWorker] = useState({
    name: '',
    phone: '',
    service: '',
    location: '',
    address: '',
    emergencyContact: '',
    skills: '',
    experience: '',
    idProof: '',
    idNumber: ''
  });

  // Mock data
  const mockNonSmartphoneWorkers = [
    {
      id: 1,
      name: 'Ramesh Patel',
      phone: '+91 98765 43210',
      service: 'Plumber',
      location: 'Andheri East',
      address: 'Shop No. 5, Juhu Lane, Andheri East',
      status: 'active',
      registrationDate: '2023-01-15',
      totalJobs: 23,
      completedJobs: 21,
      rating: 4.3,
      emergencyContact: '+91 87654 32109',
      idProof: 'Aadhaar',
      idNumber: 'XXXX-XXXX-1234'
    },
    {
      id: 2,
      name: 'Suresh Kumar',
      phone: '+91 87654 32109',
      service: 'Electrician',
      location: 'Bandra West',
      address: 'Near Bandra Station, Bandra West',
      status: 'active',
      registrationDate: '2023-02-20',
      totalJobs: 15,
      completedJobs: 14,
      rating: 4.1,
      emergencyContact: '+91 76543 21098',
      idProof: 'Aadhaar',
      idNumber: 'XXXX-XXXX-5678'
    },
    {
      id: 3,
      name: 'Laxmi Devi',
      phone: '+91 76543 21098',
      service: 'Cleaner',
      location: 'Ghatkopar',
      address: 'Ghatkopar East, Near Railway Station',
      status: 'pending',
      registrationDate: '2023-05-10',
      totalJobs: 0,
      completedJobs: 0,
      rating: 0,
      emergencyContact: '+91 65432 10987',
      idProof: 'Aadhaar',
      idNumber: 'XXXX-XXXX-9012'
    }
  ];

  const mockPendingRequests = [
    {
      id: 1,
      customerName: 'Mrs. Sharma',
      customerPhone: '+91 91234 56789',
      service: 'Plumber',
      location: 'Juhu, Andheri West',
      description: 'Kitchen sink blockage',
      budget: '₹500-800',
      timing: 'ASAP',
      assignedWorker: 1,
      status: 'pending_call',
      createdAt: '2023-10-15 10:30'
    },
    {
      id: 2,
      customerName: 'Mr. Verma',
      customerPhone: '+91 92345 67890',
      service: 'Electrician',
      location: 'Khar Road',
      description: 'Switch board repair',
      budget: '₹300-500',
      timing: 'Evening',
      assignedWorker: 2,
      status: 'worker_contacted',
      createdAt: '2023-10-15 09:15'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API calls
        setTimeout(() => {
          setWorkers(mockNonSmartphoneWorkers);
          setPendingRequests(mockPendingRequests);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddWorker = async (e) => {
    e.preventDefault();
    try {
      // TODO: Replace with actual API call
      const workerData = {
        ...newWorker,
        id: workers.length + 1,
        status: 'pending',
        registrationDate: new Date().toISOString().split('T')[0],
        totalJobs: 0,
        completedJobs: 0,
        rating: 0
      };

      setWorkers([...workers, workerData]);
      setShowAddWorkerModal(false);
      setNewWorker({
        name: '',
        phone: '',
        service: '',
        location: '',
        address: '',
        emergencyContact: '',
        skills: '',
        experience: '',
        idProof: '',
        idNumber: ''
      });
      
      alert('Worker profile created successfully!');
    } catch (error) {
      console.error('Error adding worker:', error);
      alert('Error creating worker profile');
    }
  };

  const handleCallWorker = (worker) => {
    setSelectedWorker(worker);
    setShowCallModal(true);
  };

  const handleCallCustomer = (request) => {
    setSelectedRequest(request);
    setShowCallModal(true);
  };

  const updateRequestStatus = (requestId, status) => {
    setPendingRequests(pendingRequests.map(req => 
      req.id === requestId ? { ...req, status } : req
    ));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      pending_call: 'bg-blue-100 text-blue-800',
      worker_contacted: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status]}`}>
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </span>
    );
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Non-Smartphone Workers</h1>
            <p className="text-gray-600">Manage workers without smartphones via phone communication</p>
          </div>
          <div className="flex space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{workers.length}</div>
              <div className="text-gray-600">Total Workers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{pendingRequests.length}</div>
              <div className="text-gray-600">Pending Requests</div>
            </div>
            <button
              onClick={() => setShowAddWorkerModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <span>+ Add Worker</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Workers List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Registered Workers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Worker</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{worker.name}</div>
                        <div className="text-sm text-gray-500">{worker.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{worker.service}</div>
                      <div className="text-sm text-gray-500">{worker.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(worker.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleCallWorker(worker)}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Call
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Pending Service Requests</h2>
          </div>
          <div className="overflow-y-auto max-h-96">
            {pendingRequests.map((request) => (
              <div key={request.id} className="p-4 border-b border-gray-200 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{request.customerName}</h3>
                    <p className="text-sm text-gray-600">{request.service} • {request.location}</p>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
                <p className="text-sm text-gray-700 mb-2">{request.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Budget: {request.budget}</span>
                  <span>Timing: {request.timing}</span>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-gray-500">
                    {new Date(request.createdAt).toLocaleString()}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleCallCustomer(request)}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      Call Customer
                    </button>
                    <button
                      onClick={() => handleCallWorker(
                        workers.find(w => w.id === request.assignedWorker)
                      )}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Call Worker
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Worker Modal */}
      {showAddWorkerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800">Add Non-Smartphone Worker</h3>
                <button
                  onClick={() => setShowAddWorkerModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddWorker} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={newWorker.name}
                      onChange={(e) => setNewWorker({...newWorker, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={newWorker.phone}
                      onChange={(e) => setNewWorker({...newWorker, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Service Type *</label>
                    <select
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={newWorker.service}
                      onChange={(e) => setNewWorker({...newWorker, service: e.target.value})}
                    >
                      <option value="">Select Service</option>
                      <option value="Plumber">Plumber</option>
                      <option value="Electrician">Electrician</option>
                      <option value="Carpenter">Carpenter</option>
                      <option value="Cleaner">Cleaner</option>
                      <option value="Painter">Painter</option>
                      <option value="Mechanic">Mechanic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location *</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={newWorker.location}
                      onChange={(e) => setNewWorker({...newWorker, location: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      rows="2"
                      value={newWorker.address}
                      onChange={(e) => setNewWorker({...newWorker, address: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                    <input
                      type="tel"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={newWorker.emergencyContact}
                      onChange={(e) => setNewWorker({...newWorker, emergencyContact: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID Proof Type</label>
                    <select
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={newWorker.idProof}
                      onChange={(e) => setNewWorker({...newWorker, idProof: e.target.value})}
                    >
                      <option value="">Select ID Proof</option>
                      <option value="Aadhaar">Aadhaar</option>
                      <option value="PAN">PAN</option>
                      <option value="Voter ID">Voter ID</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID Number</label>
                    <input
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={newWorker.idNumber}
                      onChange={(e) => setNewWorker({...newWorker, idNumber: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Skills</label>
                    <input
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={newWorker.skills}
                      onChange={(e) => setNewWorker({...newWorker, skills: e.target.value})}
                      placeholder="e.g., Pipe fitting, Motor repair"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Experience (Years)</label>
                    <input
                      type="number"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      value={newWorker.experience}
                      onChange={(e) => setNewWorker({...newWorker, experience: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddWorkerModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
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
                  ? `Call worker to discuss service request or updates`
                  : `Call customer to confirm service details`
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

              {selectedRequest && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    After calling, update request status:
                  </p>
                  <div className="flex justify-center space-x-2 mt-2">
                    <button
                      onClick={() => {
                        updateRequestStatus(selectedRequest.id, 'worker_contacted');
                        setShowCallModal(false);
                        setSelectedRequest(null);
                      }}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Worker Contacted
                    </button>
                    <button
                      onClick={() => {
                        updateRequestStatus(selectedRequest.id, 'scheduled');
                        setShowCallModal(false);
                        setSelectedRequest(null);
                      }}
                      className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Job Scheduled
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NonSmartphoneWorkers;