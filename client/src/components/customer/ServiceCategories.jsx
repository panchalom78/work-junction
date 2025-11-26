import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkerSearchStore } from "../../store/workerSearch.store";
import { Loader2, Calculator, PieChart, Code, Settings } from "lucide-react";

const ServiceCategories = () => {
    const navigate = useNavigate();
    const { availableFilters, loadAvailableFilters, loading } =
        useWorkerSearchStore();
    const [categories, setCategories] = useState([]);

    // Map skill names to technical icons and colors
    const getCategoryDetails = (skillName) => {
        const categoryMap = {
            Plumbing: {
                icon: "🔧",
                color: "from-blue-500 to-blue-600",
                technicalIcon: Settings,
            },
            Electrical: {
                icon: "⚡",
                color: "from-yellow-500 to-orange-500",
                technicalIcon: Code,
            },
            Cleaning: {
                icon: "✨",
                color: "from-green-500 to-emerald-600",
                technicalIcon: Settings,
            },
            Carpentry: {
                icon: "🪵",
                color: "from-orange-500 to-amber-600",
                technicalIcon: Settings,
            },
            Painting: {
                icon: "🎨",
                color: "from-purple-500 to-indigo-600",
                technicalIcon: Settings,
            },
            "AC Repair": {
                icon: "❄️",
                color: "from-cyan-500 to-blue-500",
                technicalIcon: Settings,
            },
            Gardening: {
                icon: "🌿",
                color: "from-emerald-500 to-green-600",
                technicalIcon: Settings,
            },
            "Pest Control": {
                icon: "🐛",
                color: "from-red-500 to-rose-600",
                technicalIcon: Settings,
            },
            "Appliance Repair": {
                icon: "🔌",
                color: "from-indigo-500 to-purple-600",
                technicalIcon: Settings,
            },
            Masonry: {
                icon: "🧱",
                color: "from-stone-500 to-gray-600",
                technicalIcon: Settings,
            },
            Roofing: {
                icon: "🏠",
                color: "from-amber-500 to-yellow-600",
                technicalIcon: Settings,
            },
            Flooring: {
                icon: "🔲",
                color: "from-teal-500 to-cyan-600",
                technicalIcon: Settings,
            },
        };

        return (
            categoryMap[skillName] || {
                icon: "🛠️",
                color: "from-gray-500 to-slate-600",
                technicalIcon: Settings,
            }
        );
    };

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                await loadAvailableFilters();
            } catch (error) {
                console.error("Failed to load skills:", error);
            }
        };

        fetchSkills();
    }, []);

    useEffect(() => {
        if (availableFilters.skills && availableFilters.skills.length > 0) {
            const transformedCategories = availableFilters.skills.map(
                (skill) => ({
                    name: skill.name,
                    ...getCategoryDetails(skill.name),
                    _id: skill._id,
                })
            );
            setCategories(transformedCategories);
        }
    }, [availableFilters.skills]);

    const handleCategoryClick = (category) => {
        navigate(`/customer/search?skill=${encodeURIComponent(category.name)}`);
    };

    if (loading) {
        return (
            <div className="text-center py-12 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                <div className="text-gray-600 font-mono text-sm">
                    Loading categories...
                </div>
            </div>
        );
    }

    if (!loading && categories.length === 0) {
        return (
            <div className="text-center py-12 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg">
                <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="text-gray-500 mb-4 font-mono">
                    No service categories available
                </div>
                <button
                    onClick={() => loadAvailableFilters()}
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-2xl hover:shadow-lg transition-all duration-300 font-mono"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 font-mono tracking-tight">
                Service Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {categories.map((category) => {
                    const TechnicalIcon = category.technicalIcon;
                    return (
                        <div
                            key={category._id}
                            onClick={() => handleCategoryClick(category)}
                            className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-gray-200/60 hover:shadow-2xl transition-all duration-300 cursor-pointer group text-center hover:scale-105"
                        >
                            <div
                                className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 text-2xl text-white shadow-lg`}
                            >
                                {category.icon}
                            </div>
                            <div className="font-semibold text-gray-900 font-mono text-sm">
                                {category.name}
                            </div>
                            {category.services &&
                                category.services.length > 0 && (
                                    <div className="text-xs text-gray-500 mt-1 font-mono">
                                        {category.services.length} services
                                    </div>
                                )}
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default ServiceCategories;
