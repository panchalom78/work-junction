import React from 'react';
import { MapPin, Search, User, Briefcase, Sparkles, X, Filter } from 'lucide-react';

const SearchSection = ({
    areaSearch,
    workerSearch,
    selectedSkill,
    selectedService,
    showFilters,
    hasActiveFilters,
    skills,
    services,
    onSearchChange,
    onClearFilters,
    onToggleFilters
}) => {
    return (
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Search & Filter Workers</h2>
                <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                        <button
                            onClick={onClearFilters}
                            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                        >
                            <X className="w-4 h-4" />
                            <span className="hidden sm:inline">Clear All</span>
                        </button>
                    )}
                    <button
                        onClick={onToggleFilters}
                        className="sm:hidden flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"
                    >
                        <Filter className="w-4 h-4" />
                        <span>Filters</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-4">
                {/* Area Search */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Search by Area
                    </label>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Enter area or city..."
                            value={areaSearch}
                            onChange={(e) => onSearchChange('area', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                        />
                    </div>
                </div>

                {/* Worker Search */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        Search Workers
                    </label>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Name, phone, email..."
                            value={workerSearch}
                            onChange={(e) => onSearchChange('worker', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                        />
                    </div>
                </div>
            </div>

            <div className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-3 sm:gap-4">
                    {/* Skill Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Briefcase className="w-4 h-4 inline mr-1" />
                            Filter by Skill
                        </label>
                        <select
                            value={selectedSkill}
                            onChange={(e) => onSearchChange('skill', e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        >
                            <option value="">All Skills</option>
                            {skills.map(skill => (
                                <option key={skill._id} value={skill.name}>
                                    {skill.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Service Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Sparkles className="w-4 h-4 inline mr-1" />
                            Filter by Service
                        </label>
                        <select
                            value={selectedService}
                            onChange={(e) => onSearchChange('service', e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        >
                            <option value="">All Services</option>
                            {services.map(service => (
                                <option key={service._id} value={service.name}>
                                    {service.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {hasActiveFilters && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {areaSearch && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            Area: {areaSearch}
                            <button
                                onClick={() => onSearchChange('area', '')}
                                className="ml-1 hover:text-blue-900"
                            >
                                ×
                            </button>
                        </span>
                    )}
                    {workerSearch && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            Search: {workerSearch}
                            <button
                                onClick={() => onSearchChange('worker', '')}
                                className="ml-1 hover:text-green-900"
                            >
                                ×
                            </button>
                        </span>
                    )}
                    {selectedSkill && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs flex items-center">
                            <Briefcase className="w-3 h-3 mr-1" />
                            Skill: {selectedSkill}
                            <button
                                onClick={() => onSearchChange('skill', '')}
                                className="ml-1 hover:text-purple-900"
                            >
                                ×
                            </button>
                        </span>
                    )}
                    {selectedService && (
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs flex items-center">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Service: {selectedService}
                            <button
                                onClick={() => onSearchChange('service', '')}
                                className="ml-1 hover:text-orange-900"
                            >
                                ×
                            </button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchSection;