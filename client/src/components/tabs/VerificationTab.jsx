import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Shield, Eye, Clock, CheckCircle, 
  XCircle, Download, Calendar, MapPin, User, 
  FileText, Phone, Mail, ArrowUpDown
} from 'lucide-react';

// Mock data for verification queue
const mockVerificationQueue = [
  {
    id: 'VW001',
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    email: 'rajesh.k@example.com',
    service: 'Plumbing',
    location: 'Mumbai, Maharashtra',
    submitted: '2 hours ago',
    priority: 'high',
    documents: {
      aadhaar: { verified: true, url: '/docs/aadhaar1.pdf' },
      selfie: { verified: true, url: '/docs/selfie1.jpg' },
      police: { verified: false, url: '/docs/police1.pdf' },
      experience: { verified: true, url: '/docs/exp1.pdf' }
    },
    submissionDate: '2024-01-15T10:30:00Z',
    status: 'pending'
  },
  {
    id: 'VW002',
    name: 'Priya Sharma',
    phone: '+91 87654 32109',
    email: 'priya.s@example.com',
    service: 'Cleaning',
    location: 'Delhi, NCR',
    submitted: '5 hours ago',
    priority: 'medium',
    documents: {
      aadhaar: { verified: true, url: '/docs/aadhaar2.pdf' },
      selfie: { verified: true, url: '/docs/selfie2.jpg' },
      police: { verified: true, url: '/docs/police2.pdf' },
      experience: { verified: true, url: '/docs/exp2.pdf' }
    },
    submissionDate: '2024-01-15T07:15:00Z',
    status: 'pending'
  },
  {
    id: 'VW003',
    name: 'Amit Patel',
    phone: '+91 76543 21098',
    email: 'amit.p@example.com',
    service: 'Electrical',
    location: 'Bangalore, Karnataka',
    submitted: '1 day ago',
    priority: 'low',
    documents: {
      aadhaar: { verified: false, url: '/docs/aadhaar3.pdf' },
      selfie: { verified: true, url: '/docs/selfie3.jpg' },
      police: { verified: false, url: '/docs/police3.pdf' },
      experience: { verified: true, url: '/docs/exp3.pdf' }
    },
    submissionDate: '2024-01-14T14:20:00Z',
    status: 'pending'
  },
  {
    id: 'VW004',
    name: 'Sneha Verma',
    phone: '+91 65432 10987',
    email: 'sneha.v@example.com',
    service: 'Gardening',
    location: 'Chennai, Tamil Nadu',
    submitted: '1 day ago',
    priority: 'high',
    documents: {
      aadhaar: { verified: true, url: '/docs/aadhaar4.pdf' },
      selfie: { verified: true, url: '/docs/selfie4.jpg' },
      police: { verified: true, url: '/docs/police4.pdf' },
      experience: { verified: false, url: '/docs/exp4.pdf' }
    },
    submissionDate: '2024-01-14T09:45:00Z',
    status: 'pending'
  },
  {
    id: 'VW005',
    name: 'Vikram Singh',
    phone: '+91 94321 09876',
    email: 'vikram.s@example.com',
    service: 'AC Repair',
    location: 'Hyderabad, Telangana',
    submitted: '2 days ago',
    priority: 'medium',
    documents: {
      aadhaar: { verified: true, url: '/docs/aadhaar5.pdf' },
      selfie: { verified: false, url: '/docs/selfie5.jpg' },
      police: { verified: true, url: '/docs/police5.pdf' },
      experience: { verified: true, url: '/docs/exp5.pdf' }
    },
    submissionDate: '2024-01-13T16:30:00Z',
    status: 'pending'
  }
];

const VerificationTab = () => {
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

  // Available services for filter
  const services = ['All', 'Plumbing', 'Cleaning', 'Electrical', 'Gardening', 'AC Repair', 'Painting', 'Carpentry'];

  // Filter and sort workers
  const filteredWorkers = mockVerificationQueue
    .filter(worker => {
      const matchesSearch = 
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.phone.includes(searchTerm);
      
      const matchesPriority = filters.priority === 'all' || worker.priority === filters.priority;
      const matchesService = filters.service === 'all' || worker.service === filters.service;
      const matchesStatus = filters.status === 'all' || worker.status === filters.status;
      
      // Document status filter
      const documentStatus = filters.documentStatus;
      let matchesDocument = true;
      if (documentStatus === 'complete') {
        matchesDocument = Object.values(worker.documents).every(doc => doc.verified);
      } else if (documentStatus === 'incomplete') {
        matchesDocument = Object.values(worker.documents).some(doc => !doc.verified);
      }
      
      // Date range filter
      const workerDate = new Date(worker.submissionDate);
      const now = new Date();
      let matchesDate = true;
      
      switch (filters.dateRange) {
        case 'today':
          matchesDate = workerDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.setDate(now.getDate() - 7));
          matchesDate = workerDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
          matchesDate = workerDate >= monthAgo;
          break;
        default:
          matchesDate = true;
      }
      
      return matchesSearch && matchesPriority && matchesService && matchesStatus && matchesDocument && matchesDate;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'service':
          aValue = a.service.toLowerCase();
          bValue = b.service.toLowerCase();
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority ];
          bValue = priorityOrder[b.priority ];
          break;
        case 'submissionDate':
        default:
          aValue = new Date(a.submissionDate).getTime();
          bValue = new Date(b.submissionDate).getTime();
          break;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Priority badge component
  const PriorityBadge = ({ priority }) => {
    const priorityConfig = {
      high: { color: 'bg-red-100 text-red-800 border-red-200', label: 'High' },
      medium: { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Medium' },
      low: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Low' }
    };
    
    const config = priorityConfig[priority] || priorityConfig.medium;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Document status indicator
  const DocumentStatus = ({ documents }) => {
    const totalDocs = Object.keys(documents).length;
    const verifiedDocs = Object.values(documents).filter((doc) => doc.verified).length;
    
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {Object.entries(documents).map(([key, doc]) => (
            <div
              key={key}
              className={`w-2 h-2 rounded-full ${
                doc.verified ? 'bg-green-500' : 'bg-red-500'
              }`}
              title={`${key.charAt(0).toUpperCase() + key.slice(1)}: ${
                doc.verified ? 'Verified' : 'Pending'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-600">
          {verifiedDocs}/{totalDocs} verified
        </span>
      </div>
    );
  };

  const handleReview = (worker) => {
    setSelectedWorker(worker);
    setShowReviewModal(true);
  };

  const handleApprove = (workerId) => {
    // API call to approve worker
    alert(`Worker ${workerId} approved successfully`);
    setShowReviewModal(false);
  };

  const handleReject = (workerId) => {
    // API call to reject worker
    alert(`Worker ${workerId} rejected`);
    setShowReviewModal(false);
  };

  const handleRequestDocuments = (workerId) => {
    // API call to request missing documents
    alert(`Document request sent to worker ${workerId}`);
    setShowReviewModal(false);
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

  return (
    <div className="min-h-screen bg-gray-50/30 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Worker Verification</h1>
            <p className="text-gray-600 mt-1">Review and verify worker documents</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {filteredWorkers.length} workers in queue
            </span>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, service, location, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
                {Object.values(filters).some(filter => filter !== 'all') && (
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </button>

              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters({...filters, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* Service Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                  <select
                    value={filters.service}
                    onChange={(e) => setFilters({...filters, service: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Services</option>
                    {services.filter(s => s !== 'All').map(service => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>

                {/* Document Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Document Status</label>
                  <select
                    value={filters.documentStatus}
                    onChange={(e) => setFilters({...filters, documentStatus: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="complete">Complete</option>
                    <option value="incomplete">Incomplete</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="submissionDate">Submission Date</option>
                      <option value="name">Name</option>
                      <option value="service">Service</option>
                      <option value="priority">Priority</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verification Queue */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
        {/* Queue Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-3 sm:space-y-0">
          <h2 className="text-lg font-semibold text-gray-900">Verification Queue</h2>
          <div className="text-sm text-gray-600">
            Showing {filteredWorkers.length} of {mockVerificationQueue.length} workers
          </div>
        </div>
        
        {/* Workers List */}
        <div className="space-y-3">
          {filteredWorkers.map((worker) => (
            <div key={worker.id} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 group">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 space-y-3 lg:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    worker.priority === 'high' ? 'bg-red-500' :
                    worker.priority === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                  }`}></div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{worker.name}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {worker.location}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={worker.priority} />
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {worker.service}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{worker.submitted}</span>
                </div>
              </div>
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 lg:space-y-0">
                {/* Document Status */}
                <div className="flex items-center space-x-6">
                  <DocumentStatus documents={worker.documents} />
                  
                  {/* Contact Info */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Phone className="w-3 h-3" />
                      <span>{worker.phone}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Mail className="w-3 h-3" />
                      <span className="truncate max-w-[120px]">{worker.email}</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleReview(worker)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Review</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Empty State */}
        {filteredWorkers.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No workers found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
        
        {/* Load More */}
        <button className="w-full mt-6 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center space-x-2 text-sm">
          <Clock className="w-4 h-4" />
          <span>Load More Pending Verifications</span>
        </button>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedWorker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Review Worker Verification</h2>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Worker Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedWorker.name}</h3>
                    <p className="text-gray-600">{selectedWorker.service} • {selectedWorker.location}</p>
                  </div>
                  <div className="ml-auto">
                    <PriorityBadge priority={selectedWorker.priority} />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{selectedWorker.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{selectedWorker.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Submitted: {new Date(selectedWorker.submissionDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{selectedWorker.submitted}</span>
                  </div>
                </div>
              </div>

              {/* Documents Review */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Verification</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedWorker.documents).map(([docType, doc]) => (
                    <div key={docType} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-900 capitalize">
                          {docType === 'aadhaar' ? 'Aadhaar Card' : 
                           docType === 'police' ? 'Police Verification' :
                           docType === 'selfie' ? 'Selfie Verification' :
                           'Experience Certificate'}
                        </span>
                        <div className={`flex items-center space-x-1 ${
                          doc.verified ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {doc.verified ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          <span className="text-sm font-medium">
                            {doc.verified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button className="flex items-center space-x-2 px-3 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-sm">
                          <Eye className="w-4 h-4" />
                          <span>View Document</span>
                        </button>
                        <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handleRequestDocuments(selectedWorker.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-orange-700 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Request Missing Documents
                </button>
                
                <button
                  onClick={() => handleReject(selectedWorker.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-red-700 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Application
                </button>
                
                <button
                  onClick={() => handleApprove(selectedWorker.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-green-700 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve Worker
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationTab;