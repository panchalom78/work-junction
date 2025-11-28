import React, { useState, useEffect, useCallback } from 'react';
import { Loader, User, Filter, X, RefreshCw, Search } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

// Import components
import StatsCards from '../../components/StatsCards';
import WorkerCard from '../../components/WorkerCard';
import WorkerDetailModal from '../../components/WorkerDetailModal';

const ProfessionalWorkerManagement = () => {
    // State management
    const [allWorkers, setAllWorkers] = useState([]); // All workers from API
    const [filteredWorkers, setFilteredWorkers] = useState([]); // Workers after filtering
    const [skills, setSkills] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);

    const [stats, setStats] = useState({
        totalWorkers: 0,
        activeWorkers: 0,
        availableWorkers: 0,
        verifiedWorkers: 0
    });

    // Search and filter states
    const [filters, setFilters] = useState({
        area: '',
        search: '',
        skill: '',
        service: ''
    });

    // UI states
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [showWorkerModal, setShowWorkerModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(true);

    // Debounce timer reference
    const [searchTimeout, setSearchTimeout] = useState(null);

    // Fetch skills and services
    const fetchSkillsAndServices = async () => {
        try {
            const response = await axiosInstance.get('/api/admin/skills-services');
            if (response.data?.success) {
                setSkills(response.data.data.skills || []);
                setServices(response.data.data.services || []);
            } else {
                throw new Error('Failed to fetch skills and services');
            }
        } catch (error) {
            console.error('Error fetching skills and services:', error);
            toast.error(error.response?.data?.message || 'Failed to load skills and services');
        }
    };

    // Fetch worker statistics
    const fetchWorkerStats = async () => {
        try {
            const response = await axiosInstance.get('/api/admin/workers/stats');
            if (response.data?.success) {
                setStats(response.data.data);
            } else {
                throw new Error('Failed to fetch stats');
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error('Failed to load statistics');
        }
    };

    // Fetch all workers (no filters applied in API call)
    const fetchAllWorkers = useCallback(async () => {
        try {
            setSearchLoading(true);
            
            console.log('Fetching all workers...');
            const response = await axiosInstance.get('/api/admin/workers');
            console.log('API Response:', response.data);

            if (response.data?.success) {
                const rawWorkers = response.data.data.workers || [];
                
                // Transform worker data for consistent structure
                const transformedWorkers = rawWorkers.map(worker => ({
                    ...worker,
                    rating: worker.rating ?? 0,
                    workerProfile: {
                        ...worker.workerProfile,
                        skills: Array.isArray(worker.workerProfile?.skills) 
                            ? worker.workerProfile.skills.map(skill => ({
                                ...skill,
                                name: skill.name || skill.skillId?.name || 'Unknown Skill',
                                skillId: skill.skillId?._id || skill.skillId
                            }))
                            : [],
                        services: Array.isArray(worker.workerProfile?.services)
                            ? worker.workerProfile.services.map(service => ({
                                ...service,
                                serviceName: service.serviceName || service.name || 'Unknown Service',
                                serviceId: service.serviceId?._id || service.serviceId
                            }))
                            : []
                    }
                }));

                setAllWorkers(transformedWorkers);
                setFilteredWorkers(transformedWorkers); // Initially show all workers
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error fetching workers:', error);
            toast.error(error.response?.data?.message || 'Failed to load workers');
            setAllWorkers([]);
            setFilteredWorkers([]);
        } finally {
            setSearchLoading(false);
            setLoading(false);
        }
    }, []);

    

    // Apply filters to workers (frontend only)
    const applyFilters = useCallback((workers, currentFilters) => {
        let filtered = [...workers];

        // Apply area filter
        if (currentFilters.area && currentFilters.area.trim() !== '') {
            const areaQuery = currentFilters.area.trim().toLowerCase();
            filtered = filtered.filter(worker => {
                const city = (worker.address?.city || '').toLowerCase();
                const area = (worker.address?.area || '').toLowerCase();
                return city.includes(areaQuery) || area.includes(areaQuery);
            });
        }

        if (currentFilters.search && currentFilters.search.trim() !== '') {
            const q = currentFilters.search.trim().toLowerCase();
            filtered = filtered.filter(worker => {
                const name = (worker.name || '').toLowerCase();
                const email = (worker.email || '').toLowerCase();
                const phone = (worker.phone || '').toLowerCase();
                const skillNames = (worker.workerProfile?.skills || []).map(s => (s.name || s.skillId?.name || '').toLowerCase());
                const serviceNames = (worker.workerProfile?.services || []).map(sv => (sv.serviceName || sv.name || '').toLowerCase());
                const fallbackServiceNames = (worker.services || []).map(sv => (sv.serviceName || sv.name || '').toLowerCase());
                return (
                    name.includes(q) ||
                    email.includes(q) ||
                    phone.includes(q) ||
                    skillNames.some(n => n.includes(q)) ||
                    serviceNames.some(n => n.includes(q)) ||
                    fallbackServiceNames.some(n => n.includes(q))
                );
            });
        }

        // Apply skill filter
        if (currentFilters.skill && currentFilters.skill !== '') {
            filtered = filtered.filter(worker => {
                const workerSkills = worker.workerProfile?.skills || [];
                return workerSkills.some(skill => {
                    const skillId = skill?._id || skill.skillId;
                    return String(skillId) === String(currentFilters.skill);
                });
            });
        }

        // Apply service filter
        if (currentFilters.service && currentFilters.service !== '') {
            filtered = filtered.filter(worker => {
                const workerServices = worker.workerProfile?.services || [];
                return workerServices.some(service => {
                    const serviceId = service?._id || service.serviceId;
                    return String(serviceId) === String(currentFilters.service);
                });
            });
        }

        return filtered;
    }, []);

    // Fetch workers from server using current filters (Search button)
    const fetchWorkersWithFilters = useCallback(async () => {
        try {
            setSearchLoading(true);
            const params = new URLSearchParams();
            if (filters.area && filters.area.trim()) params.append('area', filters.area.trim());
            if (filters.search && filters.search.trim()) params.append('search', filters.search.trim());
            if (filters.skill) params.append('skill', filters.skill);
            if (filters.service) params.append('service', filters.service);

            const response = await axiosInstance.get(`/api/admin/workers?${params.toString()}`);
            if (response.data?.success) {
                const rawWorkers = response.data.data.workers || [];
                const transformedWorkers = rawWorkers.map(worker => ({
                    ...worker,
                    rating: worker.rating ?? 0,
                    workerProfile: {
                        ...worker.workerProfile,
                        skills: Array.isArray(worker.workerProfile?.skills)
                            ? worker.workerProfile.skills.map(skill => ({
                                ...skill,
                                name: skill.name || skill.skillId?.name || 'Unknown Skill',
                                skillId: skill.skillId?._id || skill.skillId
                            }))
                            : [],
                        services: Array.isArray(worker.workerProfile?.services)
                            ? worker.workerProfile.services.map(service => ({
                                ...service,
                                serviceName: service.serviceName || service.name || 'Unknown Service',
                                serviceId: service.serviceId?._id || service.serviceId
                            }))
                            : []
                    }
                }));

                setAllWorkers(transformedWorkers);
                const filtered = applyFilters(transformedWorkers, filters);
                setFilteredWorkers(filtered);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error searching workers:', error);
            toast.error(error.response?.data?.message || 'Search failed');
            setFilteredWorkers([]);
        } finally {
            setSearchLoading(false);
            setLoading(false);
        }
    }, [filters, applyFilters]);

    // Update filters and apply them locally
    const updateFilter = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        // Clear existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Set new timeout for debounced filtering
        const newTimeout = setTimeout(() => {
            const filtered = applyFilters(allWorkers, newFilters);
            setFilteredWorkers(filtered);
        }, 300);

        setSearchTimeout(newTimeout);
    };

    // Handle service filter change (depends on skill)
    const handleServiceChange = (serviceId) => {
        updateFilter('service', serviceId);
    };

    // Initial data load
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchSkillsAndServices(),
                    fetchWorkerStats()
                ]);
                await fetchAllWorkers();
            } catch (error) {
                console.error('Error loading initial data:', error);
                toast.error('Failed to load initial data');
            }
        };
        loadData();
    }, []);

    // Get services for currently selected skill
    const getServicesForSelectedSkill = () => {
        if (!filters.skill) return [];
        
        const selectedSkill = skills.find(skill => skill._id === filters.skill);
        return selectedSkill?.services || [];
    };

    // Handle worker action
    const handleWorkerAction = async (workerId, action) => {
        try {
            setActionLoading(true);
            const response = await axiosInstance.put(`/api/admin/workers/${workerId}/status`, {
                action: action
            });

            if (response.data?.success) {
                toast.success(`Worker ${action === 'activate' ? 'activated' : 'deactivated'} successfully`);
                
                // Update the worker status in local state
                setAllWorkers(prevWorkers => 
                    prevWorkers.map(worker => 
                        worker._id === workerId 
                            ? { ...worker, isActive: action === 'activate' }
                            : worker
                    )
                );
                
                // Reapply filters to update the displayed workers
                const updatedFilteredWorkers = applyFilters(
                    allWorkers.map(worker => 
                        worker._id === workerId 
                            ? { ...worker, isActive: action === 'activate' }
                            : worker
                    ), 
                    filters
                );
                setFilteredWorkers(updatedFilteredWorkers);
                
                fetchWorkerStats();
            } else {
                throw new Error('Action failed');
            }
        } catch (error) {
            console.error('Error performing action:', error);
            toast.error('Failed to perform action');
        } finally {
            setActionLoading(false);
        }
    };

    // Refresh data (re-fetch from API)
    const handleRefresh = async () => {
        await fetchAllWorkers();
        await fetchWorkerStats();
    };

    // Search button handler (server-side search)
    const handleSearchClick = async () => {
        await fetchWorkersWithFilters();
    };

    // Clear all filters
    const clearAllFilters = () => {
        const emptyFilters = {
            area: '',
            search: '',
            skill: '',
            service: ''
        };
        
        setFilters(emptyFilters);
        setShowFilters(false);

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Reset to show all workers
        setFilteredWorkers(allWorkers);
    };

    // Check if any filter is active
    const hasActiveFilters = Object.values(filters).some(value => value && value !== '');

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20 p-3 sm:p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 sm:mb-8">
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                                Professional Worker Management
                            </h1>
                            <p className="text-gray-600 mt-2 text-base sm:text-lg max-w-3xl">
                                Search and manage workers by area, skills, and services with advanced filtering
                            </p>
                        </div>
                        
                        {/* Mobile Filter Toggle */}
                        <div className="lg:hidden">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                                    showFilters 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                                        : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:shadow-md'
                                }`}
                            >
                                <Filter className="w-4 h-4" />
                                {showFilters ? 'Hide Filters' : 'Show Filters'}
                                {hasActiveFilters && (
                                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                )}
                            </button>
                        </div>
                    </div>

                    <StatsCards 
                        stats={stats} 
                        skills={skills} 
                        services={services}
                    />
                </div>

                {/* Search and Filters Section */}
                <div className="mb-6 sm:mb-8">
                    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${
                        showFilters ? 'shadow-lg ring-1 ring-blue-100' : ''
                    }`}>
                        {/* Search Header */}
                        <div className="p-4 sm:p-6 border-b border-gray-100">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search workers by name, email, phone, skills, or services..."
                                            value={filters.search}
                                            onChange={(e) => updateFilter('search', e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleSearchClick(); }}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50/50"
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    {/* Desktop Filter Toggle */}
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={`hidden sm:flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                                            showFilters 
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                                        }`}
                                    >
                                        <Filter className="w-4 h-4" />
                                        Filters
                                        {hasActiveFilters && (
                                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                        )}
                                    </button>

                                    <button
                                        onClick={handleSearchClick}
                                        disabled={searchLoading}
                                        className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 font-medium"
                                    >
                                        <Search className="w-4 h-4" />
                                        <span>Search</span>
                                    </button>
                                    <button
                                        onClick={handleRefresh}
                                        disabled={searchLoading}
                                        className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${searchLoading ? 'animate-spin' : ''}`} />
                                        <span className="hidden sm:inline">Refresh</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Expandable Filters */}
                        <div className={`transition-all duration-300 overflow-hidden ${
                            showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                            <div className="p-4 sm:p-6 bg-gray-50/50 border-b border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Area Search */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Area/Location
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Enter area or location..."
                                            value={filters.area}
                                            onChange={(e) => updateFilter('area', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        />
                                    </div>

                                    {/* Skill Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Skill
                                        </label>
                                        <select
                                            value={filters.skill}
                                            onChange={(e) => updateFilter('skill', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                                        >
                                            <option value="">All Skills</option>
                                            {skills.length === 0 ? (
                                                <option disabled>Loading skills...</option>
                                            ) : (
                                                skills.map((skill) => (
                                                    <option key={skill._id} value={skill._id}>
                                                        {skill.name}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                    </div>

                                    {/* Service Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Service
                                        </label>
                                        <select
                                            value={filters.service}
                                            onChange={(e) => handleServiceChange(e.target.value)}
                                            disabled={!filters.skill}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        >
                                            <option value="">All Services</option>
                                            {!filters.skill ? (
                                                <option disabled>Select a skill first</option>
                                            ) : getServicesForSelectedSkill().length === 0 ? (
                                                <option disabled>No services available</option>
                                            ) : (
                                                getServicesForSelectedSkill().map((service) => (
                                                    <option key={service.serviceId || service._id} value={service.serviceId || service._id}>
                                                        {service.name || service.serviceName}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                    </div>

                                    {/* Clear Filters */}
                                    <div className="flex items-end">
                                        <button
                                            onClick={clearAllFilters}
                                            disabled={!hasActiveFilters}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <X className="w-4 h-4" />
                                            Clear All
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Results Header */}
                    <div className="p-4 sm:p-6 border-b border-gray-100 bg-white">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                                    Workers
                                </h2>
                                {searchLoading && (
                                    <Loader className="w-4 h-4 animate-spin text-blue-600" />
                                )}
                            </div>
                            
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                                    {filteredWorkers.length} of {allWorkers.length} {allWorkers.length === 1 ? 'worker' : 'workers'} shown
                                </span>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Workers Grid */}
                    <div className="p-4 sm:p-6">
                        {loading ? (
                            <div className="flex items-center justify-center h-48 sm:h-64">
                                <div className="text-center">
                                    <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                                    <p className="text-gray-600">Loading workers...</p>
                                </div>
                            </div>
                        ) : filteredWorkers.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                                {filteredWorkers.map(worker => (
                                    <WorkerCard
                                        key={worker._id}
                                        worker={worker}
                                        onViewDetails={() => {
                                            setSelectedWorker(worker);
                                            setShowWorkerModal(true);
                                        }}
                                        onWorkerAction={handleWorkerAction}
                                        actionLoading={actionLoading}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 sm:py-16">
                                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                                    {hasActiveFilters ? 'No workers found' : 'No workers available'}
                                </h3>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm sm:text-base">
                                    {hasActiveFilters
                                        ? 'Try adjusting your search criteria or filters to find matching workers.'
                                        : 'There are no workers in the system yet. Workers will appear here once they register.'
                                    }
                                </p>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearAllFilters}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-200"
                                    >
                                        Clear All Filters
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Worker Detail Modal */}
            {showWorkerModal && (
                <WorkerDetailModal
                    selectedWorker={selectedWorker}
                    onClose={() => {
                        setShowWorkerModal(false);
                        setSelectedWorker(null);
                    }}
                    onWorkerAction={handleWorkerAction}
                    actionLoading={actionLoading}
                />
            )}
        </div>
    );
};

export default ProfessionalWorkerManagement;
