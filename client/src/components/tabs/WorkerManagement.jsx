import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-hot-toast';

const WorkerManagement = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTab, setEditTab] = useState('personal');
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalWorkers: 0,
    limit: 10,
  });

  // EDIT FORM DATA
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: { houseNo: '', street: '', area: '', city: '', state: '', pincode: '' },
    bankDetails: { accountNumber: '', accountHolderName: '', IFSCCode: '', bankName: '' },
    workType: '',
    services: [], // [{ serviceId, skillId, name, details, pricingType, price }]
  });

  // SAVE LOADING STATES (per tab)
  const [saveLoading, setSaveLoading] = useState({
    personal: false,
    address: false,
    bank: false,
    skills: false,
  });

  // MASTER SKILLS & SELECTED SKILL IDS
  const [masterSkills, setMasterSkills] = useState([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);

  // DEBOUNCE
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // FETCH WORKERS
  const fetchWorkers = useCallback(
    async (page = 1, search = searchTerm, status = filterStatus) => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          ...(search && { search }),
          ...(status !== 'all' && { status }),
        });
        const { data } = await axiosInstance.get(`/api/service-agent/all-workers?${params}`);

        if (data.success) {
          const list = Array.isArray(data.data) ? data.data : data.data?.workers || [];
          setWorkers(list);
          setPagination({
            currentPage: page,
            totalPages: data.pagination?.totalPages || 1,
            totalWorkers: data.pagination?.totalWorkers || list.length,
            limit: data.pagination?.limit || 10,
          });
        } else throw new Error(data.message);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load workers');
        setWorkers([]);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, filterStatus]
  );

  const debouncedSearch = useCallback(debounce((s) => fetchWorkers(1, s, filterStatus), 500), [
    fetchWorkers,
    filterStatus,
  ]);

  useEffect(() => {
    fetchWorkers(1);
  }, [fetchWorkers]);

  useEffect(() => {
    if (searchTerm) debouncedSearch(searchTerm);
    else fetchWorkers(1, '', filterStatus);
  }, [searchTerm, filterStatus, debouncedSearch, fetchWorkers]);

  // ACTIONS
  const handleSuspendWorker = async (id, name) => {
    const reason = prompt(`Reason for suspending ${name}:`);
    if (!reason?.trim()) return toast.error('Reason required');
    if (!window.confirm(`Suspend ${name}?`)) return;

    try {
      setActionLoading(id);
      await axiosInstance.patch(`/api/service-agent/suspend-worker/${id}`, { reason: reason.trim() });
      toast.success('Suspended');
      fetchWorkers(pagination.currentPage);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivateWorker = async (id, name) => {
    if (!window.confirm(`Activate ${name}?`)) return;
    try {
      setActionLoading(id);
      await axiosInstance.patch(`/api/service-agent/activate-worker/${id}`);
      toast.success('Activated');
      fetchWorkers(pagination.currentPage);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    } finally {
      setActionLoading(null);
    }
  };

  // VIEW DETAILS
  const handleViewDetails = async (worker) => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/api/service-agent/worker-details/${worker._id}`);
      if (data.success) {
        setSelectedWorker(data.data);
        setShowDetailsModal(true);
      } else throw new Error(data.message);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  // OPEN EDIT MODAL – LOAD MASTER SKILLS + WORKER DATA
  // OPEN EDIT MODAL – LOAD MASTER SKILLS + WORKER DATA
const openEditModal = async (worker) => {
  try {
    // 1. Fetch worker details (already populated)
    // 2. Fetch master skills from correct endpoint
    const [workerRes, skillsRes] = await Promise.all([
      axiosInstance.get(`/api/service-agent/worker-details/${worker._id}`),
      axiosInstance.get(`/api/service-agent/skills/`), // CORRECTED
    ]);

    if (!workerRes.data.success || !skillsRes.data.success) {
      throw new Error("Failed to load data");
    }

    const w = workerRes.data.data;
    const allSkills = skillsRes.data.data; // [{ _id, name, services: [{ serviceId, name }] }]

    // Set master skills
    setMasterSkills(allSkills);

    // Extract selected skill IDs
    const currentSkillIds = (w.workerProfile?.skills || []).map(s => s._id);
    setSelectedSkillIds(currentSkillIds);

    // Build edit form data
    setEditFormData({
      name: w.name || '',
      phone: w.phone || '',
      email: w.email || '',
      address: w.address || { houseNo: '', street: '', area: '', city: '', state: '', pincode: '' },
      bankDetails: w.workerProfile?.bankDetails || { accountNumber: '', accountHolderName: '', IFSCCode: '', bankName: '' },
      workType: w.workerProfile?.workType || '',
      services: (w.workerProfile?.services || []).map(s => ({
        serviceId: s.serviceId._id,
        skillId: s.skillId._id,
        name: s.serviceId.name,
        details: s.details || '',
        pricingType: s.pricingType || 'FIXED',
        price: s.price?.toString() || '',
      })),
    });

    setSelectedWorker(w);
    setShowEditModal(true);
    setEditTab('personal');
  } catch (e) {
    console.error("Edit modal load error:", e);
    toast.error('Failed to load edit data. Please try again.');
  }
};
  // INPUT HANDLER
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setEditFormData((p) => ({
        ...p,
        address: { ...p.address, [field]: value },
      }));
    } else if (name.startsWith('bankDetails.')) {
      const field = name.split('.')[1];
      setEditFormData((p) => ({
        ...p,
        bankDetails: { ...p.bankDetails, [field]: value },
      }));
    } else {
      setEditFormData((p) => ({ ...p, [name]: value }));
    }
  };

  // SAVE HANDLERS
  const savePersonal = async () => {
    setSaveLoading(prev => ({ ...prev, personal: true }));
    try {
      await axiosInstance.put(`/api/service-agent/worker/${selectedWorker._id}/personal`, {
        name: editFormData.name,
        phone: editFormData.phone,
        email: editFormData.email,
        workType: editFormData.workType,
      });
      toast.success("Personal details updated");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    } finally {
      setSaveLoading(prev => ({ ...prev, personal: false }));
    }
  };

  const saveAddress = async () => {
    setSaveLoading(prev => ({ ...prev, address: true }));
    try {
      await axiosInstance.put(`/api/service-agent/worker/${selectedWorker._id}/address`, editFormData.address);
      toast.success("Address updated");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    } finally {
      setSaveLoading(prev => ({ ...prev, address: false }));
    }
  };

  const saveBank = async () => {
    setSaveLoading(prev => ({ ...prev, bank: true }));
    try {
      await axiosInstance.put(`/api/service-agent/worker/${selectedWorker._id}/bank`, editFormData.bankDetails);
      toast.success("Bank details updated");
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    } finally {
      setSaveLoading(prev => ({ ...prev, bank: false }));
    }
  };

  const saveSkillsAndServices = async () => {
    setSaveLoading(prev => ({ ...prev, skills: true }));
    try {
      const payload = {
        skills: selectedSkillIds,
        services: editFormData.services.map(s => ({
          skillId: s.skillId,
          serviceId: s.serviceId,
          details: s.details,
          pricingType: s.pricingType,
          price: parseFloat(s.price) || 0,
        })),
      };

      await axiosInstance.put(`/api/service-agent/worker/${selectedWorker._id}/skills-services`, payload);
      toast.success("Skills & Services updated");
      fetchWorkers(pagination.currentPage);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed");
    } finally {
      setSaveLoading(prev => ({ ...prev, skills: false }));
    }
  };

  // PAGE CHANGE
  const handlePageChange = (p) => {
    if (p >= 1 && p <= pagination.totalPages) fetchWorkers(p);
  };

  // UI HELPERS
  const getStatusBadge = (s) => {
    const map = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    const cfg = map[s?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg}`}>{s || 'Unknown'}</span>;
  };

  const getInitials = (n) => (n ? n.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) : '??');

  const renderRating = (r) => {
    const full = Math.floor(r || 0);
    const half = (r || 0) % 1 >= 0.5;
    return (
      <div className="flex items-center">
        {[...Array(full)].map((_, i) => (
          <span key={i} className="text-yellow-400">★</span>
        ))}
        {half && <span className="text-yellow-400">★</span>}
        {[...Array(5 - full - (half ? 1 : 0))].map((_, i) => (
          <span key={`e${i}`} className="text-gray-300">★</span>
        ))}
        <span className="ml-1 text-sm text-gray-600">({r || 0})</span>
      </div>
    );
  };

  const getLocation = (a) => {
    if (!a) return '—';
    const { area, city } = a;
    return area && city ? `${area}, ${city}` : area || city || '—';
  };

  // SKELETON
  const Skeleton = () => (
    <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center space-x-4 py-3">
          <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading && !workers.length) return <Skeleton />;

  return (
    <div className="space-y-6 p-4">
      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Worker Management</h1>
            <p className="text-gray-600 mt-1">Manage all service workers and their status</p>
          </div>
          <div className="text-center sm:text-right">
            <div className="text-3xl font-bold text-blue-600">{pagination.totalWorkers}</div>
            <div className="text-gray-600 text-sm">Total Workers</div>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center">
          <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* FILTERS */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, phone, service..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="sm:w-48 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
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

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Service & Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Jobs</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workers.length ? (
                workers.map((w) => (
                  <tr key={w._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {getInitials(w.name)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-semibold text-gray-900">{w.name}</div>
                          <div className="text-sm text-gray-500">{w.phone}</div>
                          <div className="sm:hidden text-xs text-gray-400 mt-1">
                            {w.services?.[0]?.name || '—'} • {getLocation(w.address)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <div className="text-sm font-medium text-gray-900">{w.services?.[0]?.name || '—'}</div>
                      <div className="text-sm text-gray-500">{getLocation(w.address)}</div>
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(w.status)}</td>
                    <td className="px-4 py-4 hidden md:table-cell">{renderRating(w.rating)}</td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <div className="text-sm font-medium text-gray-900">{w.completedJobs || 0}</div>
                      <div className="text-xs text-gray-500">completed</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col sm:flex-row gap-1">
                        <button onClick={() => handleViewDetails(w)} className="text-blue-600 hover:text-blue-800 text-sm flex items-center" disabled={actionLoading}>
                          View
                        </button>
                        <button onClick={() => openEditModal(w)} className="text-green-600 hover:text-green-800 text-sm flex items-center" disabled={actionLoading}>
                          Edit
                        </button>
                        {w.status === 'active' ? (
                          <button
                            onClick={() => handleSuspendWorker(w._id, w.name)}
                            className="text-red-600 hover:text-red-800 text-sm flex items-center"
                            disabled={actionLoading === w._id}
                          >
                            {actionLoading === w._id ? '…' : 'Suspend'}
                          </button>
                        ) : w.status === 'suspended' ? (
                          <button
                            onClick={() => handleActivateWorker(w._id, w.name)}
                            className="text-green-600 hover:text-green-800 text-sm flex items-center"
                            disabled={actionLoading === w._id}
                          >
                            {actionLoading === w._id ? '…' : 'Activate'}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm Repair 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <p className="mt-2 text-gray-500">No workers found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-700">
              Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.limit, pagination.totalWorkers)} of{' '}
              {pagination.totalWorkers}
            </p>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50"
              >
                Prev
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.currentPage) <= 1)
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && p - arr[idx - 1] > 1 && <span className="px-2">...</span>}
                    <button
                      onClick={() => handlePageChange(p)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        p === pagination.currentPage ? 'bg-blue-600 text-white' : 'border'
                      }`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================== DETAILS MODAL ==================== */}
      {showDetailsModal && selectedWorker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Worker Details</h3>
                <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">X</button>
              </div>

              {/* PERSONAL */}
              <section className="bg-gray-50 rounded-xl p-6 mb-6">
                <h4 className="font-semibold mb-4">Personal</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Name:</span> {selectedWorker.name}</div>
                  <div><span className="font-medium">Phone:</span> {selectedWorker.phone}</div>
                  <div><span className="font-medium">Email:</span> {selectedWorker.email || '—'}</div>
                  <div><span className="font-medium">Joined:</span> {new Date(selectedWorker.createdAt).toLocaleDateString()}</div>
                  <div><span className="font-medium">Status:</span> {getStatusBadge(selectedWorker.status)}</div>
                  <div><span className="font-medium">Rating:</span> {renderRating(selectedWorker.rating)}</div>
                </div>
              </section>

              {/* ADDRESS */}
              {selectedWorker.address && (
                <section className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h4 className="font-semibold mb-4">Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {Object.entries(selectedWorker.address).map(([k, v]) => (
                      <div key={k}>
                        <span className="font-medium capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span> {v || '—'}
                      </div>
                    ))}
                  </div>
                </section>
              )}

           {/* ==================== PROFESSIONAL ==================== */}
<section className="bg-gray-50 rounded-xl p-6 mb-6">
  <h4 className="font-semibold mb-4">Professional</h4>
  <div className="grid md:grid-cols-2 gap-6">

    {/* SKILLS */}
    <div>
      <p className="font-medium mb-2">Skills</p>
      <div className="flex flex-wrap gap-2">
        {selectedWorker.workerProfile?.skills?.length > 0 ? (
          selectedWorker.workerProfile.skills.map((skill) => (
            <span
              key={skill._id}
              className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium"
            >
              {skill.name}
            </span>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No skills assigned</p>
        )}
      </div>
    </div>

    {/* SERVICES */}
    <div>
      <p className="font-medium mb-2">Services</p>
      {selectedWorker.workerProfile?.services?.length > 0 ? (
        <div className="space-y-3">
          {selectedWorker.workerProfile.services.map((srv) => (
            <div
              key={srv._id}
              className="bg-blue-50 p-3 rounded-lg border border-blue-100"
            >
              <p className="font-medium text-blue-900 text-sm">
                {srv.serviceId.name}
              </p>
              {srv.details && (
                <p className="text-xs text-blue-700 mt-1">{srv.details}</p>
              )}
              <p className="text-xs font-semibold text-green-700 mt-1">
                ₹{srv.price} ({srv.pricingType.toLowerCase()})
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No services added</p>
      )}
    </div>

  </div>
</section>

              {/* STATS */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border text-center">
                  <div className="text-2xl font-bold">{selectedWorker.completedJobs || 0}</div>
                  <div className="text-sm text-gray-600">Jobs Done</div>
                </div>
                <div className="bg-white p-4 rounded-lg border text-center">
                  <div className="text-2xl font-bold text-green-600">₹{(selectedWorker.earnings || 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Earnings</div>
                </div>
                <div className="bg-white p-4 rounded-lg border text-center">
                  <div className="text-2xl font-bold text-yellow-600">{selectedWorker.rating || 0}/5</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
              </section>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button onClick={() => openEditModal(selectedWorker)} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Edit Worker
                </button>
                {selectedWorker.status === 'active' ? (
                  <button
                    onClick={() => handleSuspendWorker(selectedWorker._id, selectedWorker.name)}
                    className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    disabled={actionLoading}
                  >
                    {actionLoading ? '...' : 'Suspend'}
                  </button>
                ) : selectedWorker.status === 'suspended' ? (
                  <button
                    onClick={() => handleActivateWorker(selectedWorker._id, selectedWorker.name)}
                    className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    disabled={actionLoading}
                  >
                    {actionLoading ? '...' : 'Activate'}
                  </button>
                ) : null}
                <button onClick={() => setShowDetailsModal(false)} className="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== EDIT MODAL (Tabbed) ==================== */}
      {showEditModal && selectedWorker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Edit Worker</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">X</button>
              </div>

              {/* TABS */}
              <div className="flex border-b mb-6 overflow-x-auto">
                {['personal', 'address', 'bank', 'skills'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setEditTab(t)}
                    className={`px-4 py-2 capitalize text-sm font-medium border-b-2 transition-colors ${
                      editTab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600'
                    }`}
                  >
                    {t === 'skills' ? 'Skills & Services' : t}
                  </button>
                ))}
              </div>

              {/* ==== PERSONAL ==== */}
              {editTab === 'personal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input name="name" value={editFormData.name} onChange={handleEditChange} className="w-full px-3 py-2 border rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input name="phone" value={editFormData.phone} onChange={handleEditChange} className="w-full px-3 py-2 border rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email (optional)</label>
                    <input name="email" type="email" value={editFormData.email} onChange={handleEditChange} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Work Type</label>
                    <select name="workType" value={editFormData.workType} onChange={handleEditChange} className="w-full px-3 py-2 border rounded-lg">
                      <option value="">Select</option>
                      <option value="Full Time">Full Time</option>
                      <option value="Part Time">Part Time</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ==== ADDRESS ==== */}
              {editTab === 'address' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['houseNo', 'street', 'area', 'city', 'state', 'pincode'].map((f) => (
                    <div key={f}>
                      <label className="block text-sm font-medium mb-1 capitalize">{f.replace(/([A-Z])/g, ' $1')}</label>
                      <input
                        name={`address.${f}`}
                        value={editFormData.address[f]}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* ==== BANK ==== */}
              {editTab === 'bank' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['accountNumber', 'accountHolderName', 'IFSCCode', 'bankName'].map((f) => (
                    <div key={f}>
                      <label className="block text-sm font-medium mb-1 capitalize">{f.replace(/([A-Z])/g, ' $1')}</label>
                      <input
                        name={`bankDetails.${f}`}
                        value={editFormData.bankDetails[f]}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border rounded-lg"
                        required={f !== 'IFSCCode'}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* ==== SKILLS & SERVICES ==== */}
              {editTab === 'skills' && (
                <div className="space-y-6">
                  {/* SELECT SKILLS */}
                  <div>
                    <p className="font-medium mb-3">Select Skills</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {masterSkills.map((skill) => (
                        <label key={skill._id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedSkillIds.includes(skill._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSkillIds(prev => [...prev, skill._id]);
                              } else {
                                setSelectedSkillIds(prev => prev.filter(id => id !== skill._id));
                                setEditFormData(p => ({
                                  ...p,
                                  services: p.services.filter(s => s.skillId !== skill._id)
                                }));
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{skill.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* SERVICES PER SKILL */}
                  {selectedSkillIds.map(skillId => {
                    const skill = masterSkills.find(s => s._id === skillId);
                    const currentServices = editFormData.services.filter(s => s.skillId === skillId);

                    return (
                      <div key={skillId} className="p-4 border rounded-lg bg-gray-50">
                        <h5 className="font-semibold mb-3">{skill.name}</h5>
                        <div className="space-y-4">
                          {skill.services.map(svc => {
                            const existing = currentServices.find(cs => cs.serviceId === svc.serviceId);
                            return (
                              <div key={svc.serviceId} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                                <div>
                                  <label className="text-xs font-medium">Service</label>
                                  <p className="text-sm font-medium">{svc.name}</p>
                                </div>
                                <div>
                                  <label className="text-xs font-medium">Details</label>
                                  <textarea
                                    rows={2}
                                    value={existing?.details || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setEditFormData(p => ({
                                        ...p,
                                        services: existing
                                          ? p.services.map(s => s.serviceId === svc.serviceId ? { ...s, details: val } : s)
                                          : [...p.services, {
                                              serviceId: svc.serviceId,
                                              skillId: skillId,
                                              name: svc.name,
                                              details: val,
                                              pricingType: 'FIXED',
                                              price: ''
                                            }]
                                      }));
                                    }}
                                    className="w-full px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <div className="flex-1">
                                    <label className="text-xs font-medium">Pricing</label>
                                    <select
                                      value={existing?.pricingType || 'FIXED'}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setEditFormData(p => ({
                                          ...p,
                                          services: existing
                                            ? p.services.map(s => s.serviceId === svc.serviceId ? { ...s, pricingType: val } : s)
                                            : [...p.services, {
                                                serviceId: svc.serviceId,
                                                skillId: skillId,
                                                name: svc.name,
                                                details: '',
                                                pricingType: val,
                                                price: ''
                                              }]
                                        }));
                                      }}
                                      className="w-full px-2 py-1 border rounded text-sm"
                                    >
                                      <option value="FIXED">Fixed</option>
                                      <option value="HOURLY">Hourly</option>
                                     
                                    </select>
                                  </div>
                                  <div className="flex-1">
                                    <label className="text-xs font-medium">Price (₹)</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={existing?.price || ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setEditFormData(p => ({
                                          ...p,
                                          services: existing
                                            ? p.services.map(s => s.serviceId === svc.serviceId ? { ...s, price: val } : s)
                                            : [...p.services, {
                                                serviceId: svc.serviceId,
                                                skillId: skillId,
                                                name: svc.name,
                                                details: '',
                                                pricingType: 'FIXED',
                                                price: val
                                              }]
                                        }));
                                      }}
                                      className="w-full px-2 py-1 border rounded text-sm"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ==== SAVE BUTTONS (per tab) ==== */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>

                {editTab === 'personal' && (
                  <button
                    type="button"
                    onClick={savePersonal}
                    disabled={saveLoading.personal}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saveLoading.personal ? 'Saving...' : 'Save Personal'}
                  </button>
                )}
                {editTab === 'address' && (
                  <button
                    type="button"
                    onClick={saveAddress}
                    disabled={saveLoading.address}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saveLoading.address ? 'Saving...' : 'Save Address'}
                  </button>
                )}
                {editTab === 'bank' && (
                  <button
                    type="button"
                    onClick={saveBank}
                    disabled={saveLoading.bank}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saveLoading.bank ? 'Saving...' : 'Save Bank'}
                  </button>
                )}
                {editTab === 'skills' && (
                  <button
                    type="button"
                    onClick={saveSkillsAndServices}
                    disabled={saveLoading.skills}
                    className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {saveLoading.skills ? 'Saving...' : 'Save Skills & Services'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerManagement;