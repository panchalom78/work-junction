import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Shield, Eye, Clock, CheckCircle, 
  XCircle, Download, Calendar, MapPin, User, 
  FileText, Phone, Mail, ArrowUpDown
} from 'lucide-react';
import axiosInstance  from '../../utils/axiosInstance';

const VerificationTab = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    service: 'all',
    dateRange: 'all',
    documentStatus: 'all'
  });
  const [sortBy, setSortBy] = useState('submissionDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  const services = ['Plumbing', 'Cleaning', 'Electrical', 'Gardening', 'AC Repair', 'Painting', 'Carpentry'];

  // Fetch workers from API
  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/api/service-agent/workers-for-verification');
      setWorkers(res.data.workers || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch workers');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  // Handle actions
  const handleReview = (worker) => {
    setSelectedWorker(worker);
    setShowReviewModal(true);
  };

  const handleApprove = async (workerId) => {
    try {
  
      alert('Worker approved successfully');
      fetchWorkers();
      setShowReviewModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to approve worker');
    }
  };

  const handleReject = async (workerId) => {
    try {
    
      alert('Worker rejected successfully');
      fetchWorkers();
      setShowReviewModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to reject worker');
    }
  };

  const handleRequestDocuments = async (workerId) => {
    try {
    
      alert('Document request sent successfully');
      setShowReviewModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to request documents');
    }
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      service: 'all',
      dateRange: 'all',
      documentStatus: 'all'
    });
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Priority badge component
  const PriorityBadge = ({ priority }) => {
    const config = {
      high: { color: 'bg-red-100 text-red-800 border-red-200', label: 'High' },
      medium: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Medium' },
      low: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Low' }
    }[priority] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Medium' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>{config.label}</span>;
  };

  // Document status indicator
  const DocumentStatus = ({ documents }) => {
    const totalDocs = Object.keys(documents).length;
    const verifiedDocs = Object.values(documents).filter(doc => doc.verified).length;
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {Object.entries(documents).map(([key, doc]) => (
            <div key={key} className={`w-2 h-2 rounded-full ${doc.verified ? 'bg-green-500' : 'bg-red-500'}`} title={`${key}: ${doc.verified ? 'Verified' : 'Pending'}`} />
          ))}
        </div>
        <span className="text-xs text-gray-600">{verifiedDocs}/{totalDocs} verified</span>
      </div>
    );
  };

  // Filter & sort workers
  const filteredWorkers = workers
    .filter(worker => {
      const profile = worker.workerProfile || {};
      const verification = profile.verification || {};
      const matchesSearch =
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.address?.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.phone.includes(searchTerm);

      const matchesPriority = filters.priority === 'all' || verification.priority === filters.priority;
      const matchesService = filters.service === 'all' || profile.service === filters.service;
      const matchesStatus = filters.status === 'all' || verification.status === filters.status;

      let matchesDocument = true;
      const documents = verification.documents || {};
      if (filters.documentStatus === 'complete') matchesDocument = Object.values(documents).every(doc => doc.verified);
      if (filters.documentStatus === 'incomplete') matchesDocument = Object.values(documents).some(doc => !doc.verified);

      const workerDate = new Date(verification.submittedAt || worker.createdAt);
      const now = new Date();
      let matchesDate = true;
      switch (filters.dateRange) {
        case 'today':
          matchesDate = workerDate.toDateString() === now.toDateString();
          break;
        case 'week':
          matchesDate = workerDate >= new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          matchesDate = workerDate >= new Date(now.setMonth(now.getMonth() - 1));
          break;
      }

      return matchesSearch && matchesPriority && matchesService && matchesStatus && matchesDocument && matchesDate;
    })
    .sort((a, b) => {
      let aValue, bValue;
      const profileA = a.workerProfile || {}, profileB = b.workerProfile || {};
      const verificationA = profileA.verification || {}, verificationB = profileB.verification || {};

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'service':
          aValue = profileA.service?.toLowerCase() || '';
          bValue = profileB.service?.toLowerCase() || '';
          break;
        case 'priority':
          const order = { high: 3, medium: 2, low: 1 };
          aValue = order[verificationA.priority] || 2;
          bValue = order[verificationB.priority] || 2;
          break;
        default:
          aValue = new Date(verificationA.submittedAt || a.createdAt).getTime();
          bValue = new Date(verificationB.submittedAt || b.createdAt).getTime();
      }
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

  return (
    <div className="min-h-screen bg-gray-50/30 p-4 sm:p-6">
      {/* Header & Search/Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Worker Verification</h1>
            <p className="text-gray-600 mt-1">Review and verify worker documents</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-3">
            <span className="text-sm text-gray-500">{filteredWorkers.length} workers in queue</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, service, location, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" /> Filters
                {Object.values(filters).some(f => f !== 'all') && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
              </button>
              <button onClick={clearFilters} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">Clear</button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Status, Priority, Service, Date, Document filters */}
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="border p-2 rounded-xl">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })} className="border p-2 rounded-xl">
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select value={filters.service} onChange={(e) => setFilters({ ...filters, service: e.target.value })} className="border p-2 rounded-xl">
                <option value="all">All Services</option>
                {services.map(service => <option key={service} value={service}>{service}</option>)}
              </select>

              <select value={filters.dateRange} onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })} className="border p-2 rounded-xl">
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>

              <select value={filters.documentStatus} onChange={(e) => setFilters({ ...filters, documentStatus: e.target.value })} className="border p-2 rounded-xl">
                <option value="all">All Documents</option>
                <option value="complete">Complete</option>
                <option value="incomplete">Incomplete</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Worker Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left cursor-pointer" onClick={() => toggleSort('name')}>Name <ArrowUpDown className="inline w-4 h-4" /></th>
              <th className="px-4 py-2 text-left cursor-pointer" onClick={() => toggleSort('service')}>Service <ArrowUpDown className="inline w-4 h-4" /></th>
              <th className="px-4 py-2 text-left cursor-pointer" onClick={() => toggleSort('priority')}>Priority <ArrowUpDown className="inline w-4 h-4" /></th>
              <th className="px-4 py-2 text-left">Documents</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredWorkers.map(worker => (
              <tr key={worker._id} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-4 py-2">{worker.name}</td>
                <td className="px-4 py-2">{worker.workerProfile?.service || '-'}</td>
                <td className="px-4 py-2"><PriorityBadge priority={worker.workerProfile?.verification?.priority} /></td>
                <td className="px-4 py-2"><DocumentStatus documents={worker.workerProfile?.verification?.documents || {}} /></td>
                <td className="px-4 py-2">
                  <button onClick={() => handleReview(worker)} className="px-3 py-1 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredWorkers.length === 0 && <div className="text-center py-8 text-gray-500">No workers found</div>}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowReviewModal(false)}>X</button>
            <h2 className="text-xl font-bold mb-4">{selectedWorker.name}</h2>
            <p className="mb-2">Service: {selectedWorker.workerProfile?.service || '-'}</p>
            <p className="mb-2">Priority: <PriorityBadge priority={selectedWorker.workerProfile?.verification?.priority} /></p>
            <p className="mb-4">Documents:</p>
            <ul className="mb-4 space-y-1">
              {Object.entries(selectedWorker.workerProfile?.verification?.documents || {}).map(([key, doc]) => (
                <li key={key}>
                  {key}: <span className={doc.verified ? 'text-green-600' : 'text-red-600'}>{doc.verified ? 'Verified' : 'Pending'}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between gap-2">
              <button onClick={() => handleApprove(selectedWorker._id)} className="flex-1 px-3 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700">Approve</button>
              <button onClick={() => handleReject(selectedWorker._id)} className="flex-1 px-3 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700">Reject</button>
              <button onClick={() => handleRequestDocuments(selectedWorker._id)} className="flex-1 px-3 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600">Request Docs</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationTab;
