import React, { useState, useEffect, useCallback } from 'react';
import { Loader, User } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';

// Import components
import StatsCards from '../../components/StatsCards';
import SearchSection from '../../components/SearchSection';
import WorkerCard from '../../components/WorkerCard';
import ResultsSummary from '../../components/ResultsSummary';
import WorkerDetailModal from '../../components/WorkerDetailModal';

const ProfessionalWorkerManagement = () => {
    // State management
    const [workers, setWorkers] = useState([]);
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
    const [areaSearch, setAreaSearch] = useState('');
    const [workerSearch, setWorkerSearch] = useState('');
    const [selectedSkill, setSelectedSkill] = useState('');
    const [selectedService, setSelectedService] = useState('');

    // UI states
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [showWorkerModal, setShowWorkerModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Debounce timer reference
    const [searchTimeout, setSearchTimeout] = useState(null);

    // Fetch master data (skills and services)
    const fetchMasterData = async () => {
        try {
            const response = await axiosInstance.get('/api/admin/skills-services');
            if (response.data?.success) {
                setSkills(response.data.data.skills || []);
                setServices(response.data.data.services || []);
            } else {
                throw new Error('Failed to fetch master data');
            }
        } catch (error) {
            console.error('Error fetching master data:', error);
            toast.error('Failed to load skills and services');
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

    // Fetch workers with current filters
    const fetchWorkers = useCallback(async (searchParams = {}) => {
        try {
            setSearchLoading(true);
            const params = new URLSearchParams();

            const area = searchParams.area || areaSearch;
            const search = searchParams.search || workerSearch;
            const skill = searchParams.skill || selectedSkill;
            const service = searchParams.service || selectedService;

            if (area.trim()) params.append('area', area.trim());
            if (search.trim()) params.append('search', search.trim());
            if (skill) params.append('skill', skill);
            if (service) params.append('service', service);

            const response = await axiosInstance.get(`/api/admin/workers?${params}`);

            if (response.data?.success) {
                setWorkers(response.data.data.workers || []);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error fetching workers:', error);
            toast.error('Failed to load workers');
            setWorkers([]);
        } finally {
            setSearchLoading(false);
            setLoading(false);
        }
    }, [areaSearch, workerSearch, selectedSkill, selectedService]);

    // Initial data load
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchMasterData(),
                    fetchWorkerStats()
                ]);
                await fetchWorkers();
            } catch (error) {
                console.error('Error loading initial data:', error);
                toast.error('Failed to load initial data');
            }
        };
        loadData();
    }, []);

    // Handle search input with debouncing
    const handleSearchChange = (type, value) => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        if (type === 'area') setAreaSearch(value);
        if (type === 'worker') setWorkerSearch(value);
        if (type === 'skill') setSelectedSkill(value);
        if (type === 'service') setSelectedService(value);

        const newTimeout = setTimeout(() => {
            fetchWorkers();
        }, 500);

        setSearchTimeout(newTimeout);
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
                fetchWorkers();
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

    // Clear all filters
    const clearAllFilters = () => {
        setAreaSearch('');
        setWorkerSearch('');
        setSelectedSkill('');
        setSelectedService('');
        setShowFilters(false);

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        fetchWorkers({
            area: '',
            search: '',
            skill: '',
            service: ''
        });
    };

    // Check if any filter is active
    const hasActiveFilters = areaSearch || workerSearch || selectedSkill || selectedService;

    // Add cleanup for timeout
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    return (
        <div className="min-h-screen bg-gray-50/30 p-3 sm:p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col gap-4 mb-6 sm:mb-8">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                Professional Worker Management
                            </h1>
                            <p className="text-gray-600 mt-2 text-base sm:text-lg">
                                Search and manage workers by area, skills, and services
                            </p>
                        </div>
                    </div>

                    <StatsCards 
                        stats={stats} 
                        skills={skills} 
                    />
                </div>

                <SearchSection
                    areaSearch={areaSearch}
                    workerSearch={workerSearch}
                    selectedSkill={selectedSkill}
                    selectedService={selectedService}
                    showFilters={showFilters}
                    hasActiveFilters={hasActiveFilters}
                    skills={skills}
                    services={services}
                    onSearchChange={handleSearchChange}
                    onClearFilters={clearAllFilters}
                    onToggleFilters={() => setShowFilters(!showFilters)}
                />

                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                    <ResultsSummary
                        workers={workers}
                        searchLoading={searchLoading}
                        hasActiveFilters={hasActiveFilters}
                        areaSearch={areaSearch}
                        selectedSkill={selectedSkill}
                        selectedService={selectedService}
                        onRefresh={() => fetchWorkers()}
                    />

                    {loading ? (
                        <div className="flex items-center justify-center h-48 sm:h-64">
                            <div className="text-center">
                                <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                                <p className="text-gray-600">Loading workers...</p>
                            </div>
                        </div>
                    ) : workers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                            {workers.map(worker => (
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
                            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <User className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                                {hasActiveFilters ? 'No workers found' : 'No workers available'}
                            </h3>
                            <p className="text-gray-600 mb-6 text-sm sm:text-base">
                                {hasActiveFilters
                                    ? 'Try adjusting your search criteria or filters'
                                    : 'There are no workers in the system yet'
                                }
                            </p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearAllFilters}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

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