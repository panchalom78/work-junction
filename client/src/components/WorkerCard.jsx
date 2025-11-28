import React from 'react';
import { MapPin, Eye, PhoneCall, MailIcon, Star, CheckCircle, XCircle, Loader, BadgeCheck } from 'lucide-react';

const WorkerCard = ({ worker, onWorkerAction, actionLoading }) => {
    const workerSkills = worker.workerProfile?.skills || [];
    const workerServices =
        (worker.workerProfile?.services && worker.workerProfile.services.length
            ? worker.workerProfile.services
            : worker.services) || [];
    const verification = worker.workerProfile?.verification;
    const rating = worker.rating ?? 0;
    const experience = worker.workerProfile?.experience || 'Not specified';
    
    return (
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300 group">
            <div className="flex flex-col items-start justify-between mb-3 sm:mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform line-clamp-1 turncate">
                        <span className="text-white font-bold text-sm sm:text-base overflow-hidden line-clamp-1 turncate">
                            {worker.name?.charAt(0)?.toUpperCase() || 'W'}
                        </span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">{worker.name}</h3>
                            {verification?.status === 'APPROVED' && (
                                <BadgeCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                            )}
                        </div>
                        <p className="text-gray-600 flex items-center mt-1 text-sm">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{worker.address?.city || 'Unknown Area'}</span>
                        </p>
                    </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${worker.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {worker.isActive ? 'Active' : 'Inactive'}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="flex items-center text-sm text-gray-600">
                    <PhoneCall className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                    <span className="truncate text-xs sm:text-sm">{worker.phone}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                    <MailIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                    <span className="truncate text-xs sm:text-sm">{worker.email}</span>
                </div>
            </div>

            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">{rating}</span>
                    <span className="text-gray-500 text-xs sm:text-sm">rating</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                    {experience} exp
                </div>
            </div>

            <div className="space-y-2 mb-3 sm:mb-4">
                {workerSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-gray-500 font-medium">Skills:</span>
                        {workerSkills.slice(0, 2).map((skill, index) => (
                            <span
                                key={index}
                                className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium"
                            >
                                {skill.name || skill.skillId?.name}
                            </span>
                        ))}
                        {workerSkills.length > 2 && (
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs">
                                +{workerSkills.length - 2} more
                            </span>
                        )}
                    </div>
                )}
                {workerServices.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-gray-500 font-medium">Services:</span>
                        {workerServices.slice(0, 2).map((service, index) => (
                            <span
                                key={index}
                                className="bg-green-50 text-green-700 px-2 py-1 rounded-lg text-xs font-medium"
                            >
                                {service.serviceName || service.name || service.serviceId?.name}
                            </span>
                        ))}
                        {workerServices.length > 2 && (
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg text-xs">
                                +{workerServices.length - 2} more
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
            
                <button
                    onClick={() => onWorkerAction(worker._id, worker.isActive ? 'deactivate' : 'activate')}
                    disabled={actionLoading}
                    className={`p-2 rounded-lg transition-colors ${worker.isActive
                        ? 'text-red-600 hover:bg-red-100'
                        : 'text-green-600 hover:bg-green-100'
                        }`}
                    title={worker.isActive ? 'Deactivate' : 'Activate'}
                >
                    {actionLoading ? (
                        <Loader className="w-4 h-4 animate-spin" />
                    ) : worker.isActive ? (
                        <XCircle className="w-4 h-4" />
                    ) : (
                        <CheckCircle className="w-4 h-4" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default WorkerCard;
