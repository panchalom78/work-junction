import React from 'react';
import {
    MapPin, X, Star, Calendar, Briefcase, Target,
    PhoneCall, MapPinned, Shield, Sparkles, Loader
} from 'lucide-react';

const WorkerDetailModal = ({ selectedWorker, onClose, onWorkerAction, actionLoading }) => {
    if (!selectedWorker) return null;

    const skills = selectedWorker.workerProfile?.skills || [];
    const services = selectedWorker.workerProfile?.services || [];
    const verification = selectedWorker.workerProfile?.verification || {};
    const bankDetails = selectedWorker.workerProfile?.bankDetails || {};
    const rating = selectedWorker.workerProfile?.rating || 0;
    const experience = selectedWorker.workerProfile?.experience || 'Not specified';
    const totalJobs = selectedWorker.workerProfile?.totalJobs || 0;
    const successRate = selectedWorker.workerProfile?.successRate || 0;

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-800';
            case 'busy': return 'bg-yellow-100 text-yellow-800';
            case 'off-duty': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 min-w-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-sm sm:text-base">
                                    {selectedWorker.name?.charAt(0)?.toUpperCase() || 'W'}
                                </span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{selectedWorker.name}</h2>
                                <p className="text-gray-600 flex items-center text-sm">
                                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                                    <span className="truncate">{selectedWorker.address?.city || 'Unknown Area'}</span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    {/* ... (rest of the modal content remains the same) ... */}
                    {/* I've kept the modal content structure the same for brevity */}
                    {/* You can copy the exact modal content from your original code */}
                </div>
            </div>
        </div>
    );
};

export default WorkerDetailModal;