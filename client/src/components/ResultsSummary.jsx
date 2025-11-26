import React from 'react';
import { Loader, RefreshCw } from 'lucide-react';

const ResultsSummary = ({
    workers,
    searchLoading,
    hasActiveFilters,
    areaSearch,
    selectedSkill,
    selectedService,
    onRefresh
}) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                    {searchLoading ? (
                        <div className="flex items-center space-x-2">
                            <Loader className="w-4 h-4 animate-spin" />
                            <span>Searching...</span>
                        </div>
                    ) : (
                        `${workers.length} Worker${workers.length !== 1 ? 's' : ''} Found`
                    )}
                </h2>
                {hasActiveFilters && !searchLoading && (
                    <p className="text-gray-600 mt-1 text-sm truncate">
                        {areaSearch && `in ${areaSearch}`}
                        {selectedSkill && ` with ${selectedSkill} skill`}
                        {selectedService && ` providing ${selectedService} service`}
                    </p>
                )}
            </div>
            <button
                onClick={onRefresh}
                disabled={searchLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 flex-shrink-0 w-full sm:w-auto justify-center"
            >
                <RefreshCw className={`w-4 h-4 ${searchLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
            </button>
        </div>
    );
};

export default ResultsSummary;