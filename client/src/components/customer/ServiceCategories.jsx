import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkerSearchStore } from "../../store/workerSearch.store";
import { Loader2 } from "lucide-react";

const ServiceCategories = () => {
    const navigate = useNavigate();
    const { availableFilters, loadAvailableFilters, loading } =
        useWorkerSearchStore();
    const [categories, setCategories] = useState([]);

    // Map skill names to icons and colors
    const getCategoryDetails = (skillName) => {
        const categoryMap = {
            Plumbing: { icon: "🔧", color: "bg-blue-500" },
            Electrical: { icon: "⚡", color: "bg-yellow-500" },
            Cleaning: { icon: "✨", color: "bg-green-500" },
            Carpentry: { icon: "🪵", color: "bg-orange-500" },
            Painting: { icon: "🎨", color: "bg-purple-500" },
            "AC Repair": { icon: "❄️", color: "bg-cyan-500" },
            Gardening: { icon: "🌿", color: "bg-emerald-500" },
            "Pest Control": { icon: "🐛", color: "bg-red-500" },
            "Appliance Repair": { icon: "🔌", color: "bg-indigo-500" },
            Masonry: { icon: "🧱", color: "bg-stone-500" },
            Roofing: { icon: "🏠", color: "bg-amber-500" },
            Flooring: { icon: "🔲", color: "bg-teal-500" },
        };

        return categoryMap[skillName] || { icon: "🛠️", color: "bg-gray-500" };
    };

    // Load skills from API
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

    // Transform API skills into categories when availableFilters changes
    useEffect(() => {
        if (availableFilters.skills && availableFilters.skills.length > 0) {
            const transformedCategories = availableFilters.skills.map(
                (skill) => ({
                    name: skill.name,
                    ...getCategoryDetails(skill.name),
                    _id: skill._id, // Include the skill ID from API
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
            <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                <div className="text-gray-600">Loading categories...</div>
            </div>
        );
    }

    if (!loading && categories.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="text-gray-500 mb-4">
                    No service categories available
                </div>
                <button
                    onClick={() => loadAvailableFilters()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Service Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {categories.map((category) => (
                    <div
                        key={category._id}
                        onClick={() => handleCategoryClick(category)}
                        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group text-center"
                    >
                        <div
                            className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 text-2xl`}
                        >
                            {category.icon}
                        </div>
                        <div className="font-semibold text-gray-900">
                            {category.name}
                        </div>
                        {category.services && category.services.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                                {category.services.length} services
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
};

export default ServiceCategories;
