import React from 'react';
import { Users, CheckCircle, Zap, Clock4, Shield, BadgeCheck, Sparkles, Target } from 'lucide-react';

const StatsCards = ({ stats, skills, services }) => {
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 text-xs sm:text-sm font-medium">Total Workers</p>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.totalWorkers}</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-blue-100 rounded-lg sm:rounded-xl">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
                    </div>
                </div>
                <div className="flex items-center mt-2 sm:mt-3 text-green-600 text-xs sm:text-sm">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span>{stats.activeWorkers} active</span>
                </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 text-xs sm:text-sm font-medium">Available Now</p>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.availableWorkers}</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-green-100 rounded-lg sm:rounded-xl">
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
                    </div>
                </div>
                <div className="flex items-center mt-2 sm:mt-3 text-gray-600 text-xs sm:text-sm">
                    <Clock4 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span>Ready for work</span>
                </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 text-xs sm:text-sm font-medium">Verified Workers</p>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.verifiedWorkers}</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-purple-100 rounded-lg sm:rounded-xl">
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" />
                    </div>
                </div>
                <div className="flex items-center mt-2 sm:mt-3 text-gray-600 text-xs sm:text-sm">
                    <BadgeCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span>Fully verified</span>
                </div>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-600 text-xs sm:text-sm font-medium">Skills & Services</p>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{(skills || []).length} skills</p>
                        <p className="text-xs sm:text-sm text-gray-600">{(services || []).length} services</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-orange-100 rounded-lg sm:rounded-xl">
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-orange-600" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsCards;
