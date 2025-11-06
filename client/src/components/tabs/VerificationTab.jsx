import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  User,
  IdCard,
  Shield
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";

const VerificationTab = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeTab, setActiveTab] = useState("documents");
  const [filters, setFilters] = useState({
    status: "all",
  });
  const [sortBy, setSortBy] = useState("submissionDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [imagePreview, setImagePreview] = useState({ open: false, url: "", title: "" });
  const [actionLoading, setActionLoading] = useState(false);

  // ✅ Fetch workers from backend
  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        "/api/service-agent/workers-for-verification"
      );
      if (res.data.success) {
        setWorkers(res.data.data || []);
      } else {
        setWorkers([]);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch workers");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  // ✅ Approve Worker
  const handleApprove = async (workerId) => {
    try {
      setActionLoading(true);
      await axiosInstance.patch(
        `/api/service-agent/verify-worker/${workerId}`
      );
      alert("✅ Worker approved successfully");
      fetchWorkers();
      setShowReviewModal(false);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to approve worker");
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Reject Worker with reason
  const handleReject = async (workerId) => {
    const reason = prompt("Please provide reason for rejection:");
    if (reason === null || reason.trim() === "") {
      alert("Rejection reason is required");
      return;
    }
    
    try {
      setActionLoading(true);
      await axiosInstance.patch(
        `/api/service-agent/reject-worker/${workerId}`,
        { rejectionReason: reason }
      );
      alert("❌ Worker rejected successfully");
      fetchWorkers();
      setShowReviewModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to reject worker");
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ View Document
  const handleViewDocument = (documentUrl, documentName) => {
    if (documentUrl) {
      setImagePreview({
        open: true,
        url: documentUrl,
        title: documentName
      });
    } else {
      alert("Document not available");
    }
  };

  // ✅ Download Document
  const handleDownloadDocument = async (documentUrl, documentName) => {
    if (documentUrl) {
      try {
        const response = await fetch(documentUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${documentName}_${selectedWorker.name}.${documentUrl.split('.').pop()}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed:', error);
        alert('Download failed. Please try again.');
      }
    } else {
      alert("Document not available");
    }
  };

  const handleReview = (worker) => {
    setSelectedWorker(worker);
    setShowReviewModal(true);
    setActiveTab("documents");
  };

  const clearFilters = () => {
    setFilters({
      status: "all",
    });
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // ✅ Document status indicator
  const DocumentStatus = ({ verification }) => {
    if (!verification) return null;
    
    const {
      isSelfieVerified,
      isAddharDocVerified,
      isPoliceVerificationDocVerified,
    } = verification;

    const docs = [
      { name: "Selfie", verified: isSelfieVerified, icon: User },
      { name: "Aadhaar", verified: isAddharDocVerified, icon: IdCard },
      { name: "Police", verified: isPoliceVerificationDocVerified, icon: Shield },
    ];

    const verifiedCount = docs.filter((d) => d.verified).length;
    const allVerified = verifiedCount === docs.length;

    return (
      <div className="flex items-center gap-3">
        {docs.map((doc, i) => {
          const IconComponent = doc.icon;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <IconComponent 
                className={`w-4 h-4 ${
                  doc.verified ? "text-green-500" : "text-red-500"
                }`} 
              />
              <div
                className={`w-2 h-2 rounded-full ${
                  doc.verified ? "bg-green-500" : "bg-red-500"
                }`}
                title={`${doc.name}: ${doc.verified ? "Verified" : "Pending"}`}
              />
            </div>
          );
        })}
        <span className={`text-xs font-medium ${
          allVerified ? "text-green-600" : "text-red-600"
        }`}>
          {verifiedCount}/{docs.length}
        </span>
      </div>
    );
  };

  // ✅ Verification Status Badge
  const VerificationStatusBadge = ({ status }) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Pending" },
      APPROVED: { color: "bg-green-100 text-green-800 border-green-200", label: "Approved" },
      REJECTED: { color: "bg-red-100 text-red-800 border-red-200", label: "Rejected" },
    };

    const config = statusConfig[status] || statusConfig.PENDING;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // ✅ Filtered and sorted workers
  const filteredWorkers = workers
    .filter((worker) => {
      const matchesSearch = worker.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           worker.address?.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           worker.address?.pincode?.includes(searchTerm);

      const matchesStatus = filters.status === "all" || 
                           worker.workerProfile?.verification?.status === filters.status;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  // ✅ Document Preview Modal
  const DocumentPreviewModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">{imagePreview.title}</h3>
          <button
            onClick={() => setImagePreview({ open: false, url: "", title: "" })}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="p-4 max-h-[70vh] overflow-auto">
          {imagePreview.url && (
            <img 
              src={imagePreview.url} 
              alt={imagePreview.title}
              className="max-w-full max-h-full object-contain mx-auto"
            />
          )}
        </div>
        <div className="flex justify-end gap-3 p-4 border-t">
          <button
            onClick={() => handleDownloadDocument(imagePreview.url, imagePreview.title)}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={() => setImagePreview({ open: false, url: "", title: "" })}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // ✅ Get document URL based on document type
  const getDocumentUrl = (worker, documentType) => {
    if (!worker.workerProfile?.verification) return null;
    
    switch (documentType) {
      case 'selfie':
        return worker.workerProfile.verification.selfieUrl;
      case 'aadhar':
        return worker.workerProfile.verification.addharDocUrl;
      case 'policeVerification':
        return worker.workerProfile.verification.policeVerificationDocUrl;
      default:
        return null;
    }
  };

  // ✅ Check if document exists
  const hasDocument = (worker, documentType) => {
    const url = getDocumentUrl(worker, documentType);
    return url && url.trim() !== '';
  };

  return (
    <div className="min-h-screen bg-gray-50/30 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Worker Verification
            </h1>
            <p className="text-gray-600 mt-1">
              Review and verify worker documents
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {filteredWorkers.length} workers in queue
            </span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, area, or pincode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" /> Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 p-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Worker Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Worker Details
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documents
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredWorkers.map((worker) => (
              <tr key={worker._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{worker.name}</div>
                    <div className="text-sm text-gray-500">{worker.phone}</div>
                    <div className="text-sm text-gray-500">{worker.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{worker.address?.area}</div>
                  <div className="text-sm text-gray-500">{worker.address?.city}, {worker.address?.pincode}</div>
                </td>
                <td className="px-6 py-4">
                  <DocumentStatus verification={worker.workerProfile?.verification} />
                </td>
                <td className="px-6 py-4">
                  <VerificationStatusBadge status={worker.workerProfile?.verification?.status} />
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleReview(worker)}
                    className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500">Loading workers...</p>
          </div>
        )}

        {!loading && filteredWorkers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-lg font-medium">No workers found</p>
            <p className="mt-1">No pending verifications match your search criteria</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-4">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedWorker.name}</h2>
                <p className="text-gray-600">
                  {selectedWorker.address?.area}, {selectedWorker.address?.city} - {selectedWorker.address?.pincode}
                </p>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowReviewModal(false)}
                disabled={actionLoading}
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: "documents", name: "Documents", icon: FileText },
                  { id: "profile", name: "Profile", icon: User },
                  { id: "verification", name: "Verification", icon: Shield }
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                      disabled={actionLoading}
                    >
                      <IconComponent className="w-4 h-4" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-auto">
              {activeTab === "documents" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Selfie */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <User className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold">Selfie</h3>
                      {hasDocument(selectedWorker, 'selfie') ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    {hasDocument(selectedWorker, 'selfie') ? (
                      <div className="space-y-3">
                        <img
                          src={getDocumentUrl(selectedWorker, 'selfie')}
                          alt="Selfie"
                          className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90"
                          onClick={() => handleViewDocument(
                            getDocumentUrl(selectedWorker, 'selfie'),
                            "Selfie"
                          )}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDocument(
                              getDocumentUrl(selectedWorker, 'selfie'),
                              "Selfie"
                            )}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                            disabled={actionLoading}
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => handleDownloadDocument(
                              getDocumentUrl(selectedWorker, 'selfie'),
                              "Selfie"
                            )}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            disabled={actionLoading}
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <AlertCircle className="mx-auto w-8 h-8 mb-2" />
                        Selfie not uploaded
                      </div>
                    )}
                  </div>

                  {/* Aadhaar */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <IdCard className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold">Aadhaar Card</h3>
                      {hasDocument(selectedWorker, 'aadhar') ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    {hasDocument(selectedWorker, 'aadhar') ? (
                      <div className="space-y-3">
                        <img
                          src={getDocumentUrl(selectedWorker, 'aadhar')}
                          alt="Aadhaar"
                          className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90"
                          onClick={() => handleViewDocument(
                            getDocumentUrl(selectedWorker, 'aadhar'),
                            "Aadhaar Card"
                          )}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDocument(
                              getDocumentUrl(selectedWorker, 'aadhar'),
                              "Aadhaar Card"
                            )}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                            disabled={actionLoading}
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => handleDownloadDocument(
                              getDocumentUrl(selectedWorker, 'aadhar'),
                              "Aadhaar Card"
                            )}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            disabled={actionLoading}
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <AlertCircle className="mx-auto w-8 h-8 mb-2" />
                        Aadhaar not uploaded
                      </div>
                    )}
                  </div>

                  {/* Police Verification */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold">Police Verification</h3>
                      {hasDocument(selectedWorker, 'policeVerification') ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    {hasDocument(selectedWorker, 'policeVerification') ? (
                      <div className="space-y-3">
                        <img
                          src={getDocumentUrl(selectedWorker, 'policeVerification')}
                          alt="Police Verification"
                          className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90"
                          onClick={() => handleViewDocument(
                            getDocumentUrl(selectedWorker, 'policeVerification'),
                            "Police Verification"
                          )}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDocument(
                              getDocumentUrl(selectedWorker, 'policeVerification'),
                              "Police Verification"
                            )}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                            disabled={actionLoading}
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => handleDownloadDocument(
                              getDocumentUrl(selectedWorker, 'policeVerification'),
                              "Police Verification"
                            )}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            disabled={actionLoading}
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <AlertCircle className="mx-auto w-8 h-8 mb-2" />
                        Police verification not uploaded
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "profile" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Full Name</label>
                        <p className="text-gray-900">{selectedWorker.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="text-gray-900">{selectedWorker.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-gray-900">{selectedWorker.email || "Not provided"}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Address</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Area</label>
                        <p className="text-gray-900">{selectedWorker.address?.area}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">City</label>
                        <p className="text-gray-900">{selectedWorker.address?.city}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Pincode</label>
                        <p className="text-gray-900">{selectedWorker.address?.pincode}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "verification" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Verification Status</h3>
                    <VerificationStatusBadge status={selectedWorker.workerProfile?.verification?.status} />
                    {selectedWorker.workerProfile?.verification?.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="text-sm font-medium text-red-800 mb-1">Rejection Reason</h4>
                        <p className="text-sm text-red-700">{selectedWorker.workerProfile.verification.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Document Verification</h3>
                    <DocumentStatus verification={selectedWorker.workerProfile?.verification} />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => handleReject(selectedWorker._id)}
                disabled={actionLoading}
                className="flex items-center gap-2 px-6 py-3 text-red-700 bg-red-100 border border-red-300 rounded-xl hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700"></div>
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                Reject
              </button>
              <button
                onClick={() => handleApprove(selectedWorker._id)}
                disabled={actionLoading}
                className="flex items-center gap-2 px-6 py-3 text-green-700 bg-green-100 border border-green-300 rounded-xl hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700"></div>
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {imagePreview.open && <DocumentPreviewModal />}
    </div>
  );
};

export default VerificationTab;