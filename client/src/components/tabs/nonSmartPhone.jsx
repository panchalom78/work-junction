// components/NonSmartphoneWorkers.js
import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';
import CreateWorkerProfile from '../CreateWorkerForm';

const NonSmartphoneWorkers = () => {
  const [activeView, setActiveView] = useState('workers');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingAvailability, setUpdatingAvailability] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // FETCH ALL NON-SMARTPHONE WORKERS
  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/api/service-agent/non-smartphone-workers');
      if (data.success) setWorkers(data.data || []);
    } catch {
      toast.error('Failed to load workers');
    } finally {
      setLoading(false);
    }
  };

  // FETCH BOOKINGS FOR A PARTICULAR WORKER
  const fetchBookings = async (workerId) => {
    if (!workerId) return;
    try {
      const { data } = await axiosInstance.get(`/api/service-agent/bookings/${workerId}`);
      if (data.success) {
        setBookings(data.bookings || []);
        setFilteredBookings(data.bookings || []);
      }
      console.log(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load bookings');
      setBookings([]);
      setFilteredBookings([]);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  // SEARCH FILTER
  const filteredWorkers = useMemo(() => {
    if (!searchQuery.trim()) return workers;
    const q = searchQuery.toLowerCase();
    return workers.filter(w =>
      w.name?.toLowerCase().includes(q) ||
      w.phone?.includes(q) ||
      w.address?.area?.toLowerCase().includes(q) ||
      w.address?.city?.toLowerCase().includes(q)
    );
  }, [workers, searchQuery]);

  // UPDATE AVAILABILITY
  const updateStatusDirectly = async (workerId, newStatus) => {
    try {
      setUpdatingAvailability(workerId);
      await axiosInstance.patch(`/api/service-agent/worker/${workerId}/availability`, { availabilityStatus: newStatus });
      toast.success(`Status updated to ${newStatus.replace('-', ' ')}`);
      fetchWorkers();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingAvailability(null);
    }
  };

  // BADGE - Optimized for mobile
  const getStatusBadge = (status) => {
    const s = (status || '').toString().toLowerCase();
    const map = {
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      accepted: 'bg-blue-100 text-blue-800 border border-blue-200',
      'in-progress': 'bg-purple-100 text-purple-800 border border-purple-200',
      completed: 'bg-green-100 text-green-800 border border-green-200',
      cancelled: 'bg-red-100 text-red-800 border border-red-200',
      declined: 'bg-red-100 text-red-800 border border-red-200',
      available: 'bg-green-100 text-green-800 border border-green-200',
      busy: 'bg-orange-100 text-orange-800 border border-orange-200',
      'off-duty': 'bg-gray-100 text-gray-700 border border-gray-200'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[s] || 'bg-gray-100 text-gray-800 border border-gray-200'}`}>
      {s.replace('-', ' ')}
    </span>;
  };

  // WORKER CARD – Optimized for mobile
  const WorkerCard = ({ worker }) => {
    const location = [
      worker.address?.houseNo,
      worker.address?.street,
      worker.address?.area,
      worker.address?.city,
      worker.address?.state,
    ].filter(Boolean).join(', ') || '—';

    const serviceInfo = worker.workerProfile?.services?.[0] || {};
    const serviceName = serviceInfo.skillId?.name || '—';
    const servicePrice = serviceInfo.price ? `₹${serviceInfo.price}` : '—';
    const serviceDetails = serviceInfo.details || '—';

    const assignedCount = bookings.filter(b => b.worker?._id === worker._id).length;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
        {/* HEADER - Mobile optimized */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {worker.name?.[0]?.toUpperCase() || 'W'}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold text-gray-900 truncate">{worker.name}</h4>
                <p className="text-xs text-gray-600 truncate">{worker.phone}</p>
              </div>
            </div>
            
            {/* LOCATION & SERVICE INFO */}
            <div className="space-y-1 text-xs">
              <div className="flex items-start space-x-1">
                <i className="far fa-map-marker-alt text-gray-400 mt-0.5 flex-shrink-0 text-xs"></i>
                <p className="text-gray-600 line-clamp-2 text-xs">{location}</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <i className="far fa-tools text-gray-400 text-xs"></i>
                  <span className="text-gray-700 font-medium text-xs">{serviceName}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <i className="far fa-rupee-sign text-gray-400 text-xs"></i>
                  <span className="text-gray-700 font-medium text-xs">{servicePrice}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* STATUS & COUNT */}
          <div className="text-right flex-shrink-0 ml-2">
            {getStatusBadge(worker.workerProfile?.availabilityStatus)}
            <div className="flex items-center justify-end space-x-1 mt-1">
              <i className="far fa-briefcase text-gray-400 text-xs"></i>
              <p className="text-xs text-gray-500">{assignedCount}</p>
            </div>
          </div>
        </div>

        {/* SERVICE DETAILS */}
        {serviceDetails && serviceDetails !== '—' && (
          <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start space-x-1">
              <i className="far fa-info-circle text-blue-500 mt-0.5 flex-shrink-0 text-xs"></i>
              <p className="text-xs text-blue-800 leading-relaxed line-clamp-2">{serviceDetails}</p>
            </div>
          </div>
        )}

        {/* SKILLS */}
        {worker.workerProfile?.skills?.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center space-x-1 mb-1">
              <i className="far fa-star text-gray-400 text-xs"></i>
              <h4 className="text-xs font-medium text-gray-700">Skills</h4>
            </div>
            <div className="flex flex-wrap gap-1">
              {worker.workerProfile.skills.slice(0, 3).map((s, i) => (
                <span key={i} className="px-2 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-xs font-medium rounded border border-blue-200">
                  {s.skillId?.name || '—'}
                </span>
              ))}
              {worker.workerProfile.skills.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200">
                  +{worker.workerProfile.skills.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* AVAILABILITY BUTTONS - Mobile optimized */}
        <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-1">
              <i className="far fa-clock text-gray-500 text-xs"></i>
              <span className="text-xs font-medium text-gray-700">Status</span>
            </div>
            <div className="flex space-x-1">
              {['available', 'busy', 'off-duty'].map(status => (
                <button
                  key={status}
                  onClick={() => updateStatusDirectly(worker._id, status)}
                  disabled={updatingAvailability === worker._id}
                  className={`flex-1 px-2 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 ${
                    worker.workerProfile?.availabilityStatus === status
                      ? status === 'available'
                        ? 'bg-green-500 text-white shadow-sm'
                        : status === 'busy'
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'bg-red-500 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-300 hover:border-gray-400'
                  } ${updatingAvailability === worker._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {updatingAvailability === worker._id ? (
                    <i className="far fa-spinner-third animate-spin"></i>
                  ) : status === 'off-duty' ? (
                    'Off'
                  ) : (
                    status.charAt(0).toUpperCase() + status.slice(1)
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS - Mobile optimized */}
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedWorker(worker);
              setShowCallModal(true);
            }}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg text-xs font-semibold hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-1"
          >
            <i className="far fa-phone text-xs"></i>
            <span>Call</span>
          </button>
          <button
            onClick={() => {
              setSelectedWorker(worker);
              setActiveView('work-list');
              fetchBookings(worker._id);
            }}
            className="flex-1  bg-gradient-to-br from-blue-500 to-purple-600 text-white py-2 rounded-lg text-xs font-semibold hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-1"
          >
            <i className="far fa-list-check text-xs"></i>
            <span>Work List</span>
          </button>
        </div>
      </div>
    );
  };

  // WORK HISTORY VIEW - Mobile optimized
  const WorkListView = () => {
    const active = filteredBookings.filter(b =>
      ['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(b.status?.toUpperCase())
    );
    const done = filteredBookings.filter(b =>
      ['COMPLETED', 'CANCELLED', 'DECLINED'].includes(b.status?.toUpperCase())
    );

    const formatDate = (isoDate) => {
      try {
        const d = new Date(isoDate);
        return d.toLocaleDateString('en-IN', { 
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      } catch {
        return '—';
      }
    };

    const BookingCard = ({ booking, type }) => (
      <div className={`bg-white p-3 rounded-lg border shadow-sm transition-all duration-200 ${
        type === 'active' ? 'border-blue-200' : 'border-gray-200'
      }`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-1 truncate">{booking.serviceName || 'Service'}</h4>
            <p className="text-xs text-purple-600 font-semibold mb-1">{booking.skillName || '—'}</p>
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            {getStatusBadge(booking.status)}
            <p className="text-xs text-gray-500 mt-1">{formatDate(booking.date)}</p>
          </div>
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-gray-700">
              <i className="far fa-user text-gray-400 text-xs"></i>
              <span className="font-medium truncate">{booking.customer?.name || '—'}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <i className="far fa-phone text-gray-400 text-xs"></i>
              <span className="text-gray-600">{booking.customer?.phone || '—'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <i className="far fa-rupee-sign text-gray-400 text-xs"></i>
              <span className="font-semibold text-green-600">₹{booking.payment?.amount || 0}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>{booking.time}</span>
            <span>•</span>
            <span>{booking.payment?.paymentType || '—'}</span>
            <span>{booking.payment?.status}</span>
          </div>
        </div>

        {type === 'active' && (
          <div className="mt-3 pt-2 border-t border-gray-200">
            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-500 text-white py-1.5 rounded text-xs font-medium hover:bg-blue-600 transition-colors">
                Update
              </button>
              <button 
                onClick={() => window.open(`tel:${booking.customer?.phone}`)}
                className="flex-1 bg-green-500 text-white py-1.5 rounded text-xs font-medium hover:bg-green-600 transition-colors"
              >
                Contact
              </button>
            </div>
          </div>
        )}
      </div>
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-3">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* HEADER - Mobile optimized */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setActiveView('workers')}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors p-2 hover:bg-blue-50 rounded-lg"
              >
                <i className="far fa-arrow-left"></i>
                <span className="text-sm">Back</span>
              </button>
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-bold text-gray-900 truncate">{selectedWorker.name}'s Work</h4>
                <p className="text-xs text-gray-600 flex items-center space-x-1 mt-1">
                  <i className="far fa-phone text-gray-400"></i>
                  <span>{selectedWorker.phone}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-700">Total</p>
                <p className="text-lg font-bold text-blue-600">{bookings.length}</p>
              </div>
            </div>
          </div>

          {/* ACTIVE BOOKINGS */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Active ({active.length})</span>
              </h4>
            </div>
            
            {active.length > 0 ? (
              <div className="space-y-3">
                {active.map(booking => (
                  <BookingCard key={booking._id} booking={booking} type="active" />
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <i className="far fa-clipboard-list text-3xl text-gray-300 mb-2"></i>
                <p className="text-sm text-gray-500">No active bookings</p>
              </div>
            )}
          </div>

          {/* COMPLETED BOOKINGS */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                <i className="far fa-check-circle text-blue-500"></i>
                <span>Completed ({done.length})</span>
              </h4>
            </div>
            
            {done.length > 0 ? (
              <div className="space-y-3">
                {done.map(booking => (
                  <BookingCard key={booking._id} booking={booking} type="completed" />
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <i className="far fa-history text-3xl text-gray-300 mb-2"></i>
                <p className="text-sm text-gray-500">No completed bookings</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // LOADING STATE - Mobile optimized
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-3">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            {/* Header Skeleton */}
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-48"></div>
                  <div className="h-3 bg-gray-200 rounded w-64"></div>
                </div>
                <div className="w-24 h-8 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
            
            {/* Search Bar Skeleton */}
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="h-10 bg-gray-200 rounded-lg"></div>
            </div>
            
            {/* Worker Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white p-4 rounded-xl shadow-sm space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="space-y-1 flex-1">
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 bg-gray-200 rounded"></div>
                    <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CREATE WORKER VIEW
  if (activeView === 'create') return <CreateWorkerProfile />;

  // WORK LIST VIEW
  if (activeView === 'work-list' && selectedWorker) {
    return <WorkListView />;
  }

  // MAIN WORKERS VIEW
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-3">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* HEADER - Mobile optimized */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Non-Smartphone Workers
              </h1>
              
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-700">Total</p>
                <p className="text-lg sm:text-xl font-bold text-blue-600">{workers.length}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow">
                <i className="far fa-users text-sm"></i>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH & ACTIONS - Mobile optimized */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="flex-1">
              <div className="relative">
                <i className="far fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                <input
                  type="text"
                  placeholder="Search workers..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                />
              </div>
            </div>
            <button 
              onClick={() => setActiveView('create')}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2 text-sm w-full sm:w-auto"
            >
              <i className="far fa-user-plus"></i>
              <span>Add Worker</span>
            </button>
          </div>
        </div>

        {/* WORKERS GRID - Mobile optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.map(w => <WorkerCard key={w._id} worker={w} />)}
        </div>

        {/* EMPTY STATE - Mobile optimized */}
        {filteredWorkers.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <i className="far fa-users text-4xl text-gray-300 mb-3"></i>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Workers Found</h3>
            <p className="text-sm text-gray-500 mb-4">
              {searchQuery ? 'Try adjusting your search terms' : 'Get started by adding your first worker'}
            </p>
            <button 
              onClick={() => setActiveView('create')}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:shadow-md transition-all duration-200 inline-flex items-center space-x-2 text-sm"
            >
              <i className="far fa-user-plus"></i>
              <span>Add First Worker</span>
            </button>
          </div>
        )}

        {/* CALL MODAL - Improved design without black background */}
        {showCallModal && selectedWorker && (
          <div className="fixed inset-0 flex items-end justify-center p-4 z-50 sm:items-center sm:p-6">
            {/* Backdrop with blur effect */}
            <div 
              className="fixed inset-0 bg-white/80 backdrop-blur-sm"
              onClick={() => setShowCallModal(false)}
            ></div>
            
            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm transform transition-all duration-300 scale-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-xl mx-auto mb-4 shadow-lg">
                  <i className="far fa-phone"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Call Worker</h3>
                <p className="text-sm text-gray-600 mb-3">Ready to connect with {selectedWorker.name}?</p>
                <p className="text-xl font-mono font-bold text-gray-900 mb-4 bg-gray-100 py-2 rounded-lg">
                  {selectedWorker.phone}
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      window.open(`tel:${selectedWorker.phone}`);
                      setShowCallModal(false);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm"
                  >
                    <i className="far fa-phone"></i>
                    <span>Call Now</span>
                  </button>
                  <button 
                    onClick={() => setShowCallModal(false)}
                    className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NonSmartphoneWorkers;