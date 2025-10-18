import React from "react";
import { useNavigate } from "react-router-dom";

const ServiceCategories = () => {
    const navigate = useNavigate();

    const serviceCategories = [
        { name: "Plumbing", icon: "🔧", color: "bg-blue-500" },
        { name: "Electrical", icon: "⚡", color: "bg-yellow-500" },
        { name: "Cleaning", icon: "✨", color: "bg-green-500" },
        { name: "Carpentry", icon: "🪵", color: "bg-orange-500" },
        { name: "Painting", icon: "🎨", color: "bg-purple-500" },
        { name: "AC Repair", icon: "❄️", color: "bg-cyan-500" },
    ];

    const handleCategoryClick = (category) => {
        navigate(`/customer/search?skill=${encodeURIComponent(category.name)}`);
    };

    return (
        <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Service Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {serviceCategories.map((category, index) => (
                    <div
                        key={index}
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
                    </div>
                ))}
            </div>
        </>
    );
};

export default ServiceCategories;
