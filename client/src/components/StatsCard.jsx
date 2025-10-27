import React from "react";

const StatsCard = ({ icon: Icon, label, value, color }) => {
    const colorClasses = {
        green: {
            bg: "bg-green-50",
            border: "border-green-200",
            icon: "text-green-600",
            value: "text-green-900",
            label: "text-green-700",
        },
        blue: {
            bg: "bg-blue-50",
            border: "border-blue-200",
            icon: "text-blue-600",
            value: "text-blue-900",
            label: "text-blue-700",
        },
        yellow: {
            bg: "bg-yellow-50",
            border: "border-yellow-200",
            icon: "text-yellow-600",
            value: "text-yellow-900",
            label: "text-yellow-700",
        },
        purple: {
            bg: "bg-purple-50",
            border: "border-purple-200",
            icon: "text-purple-600",
            value: "text-purple-900",
            label: "text-purple-700",
        },
    };

    const colors = colorClasses[color] || colorClasses.blue;

    return (
        <div
            className={`p-6 rounded-2xl border-2 ${colors.bg} ${colors.border} transition-all duration-300 hover:shadow-lg`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className={`text-sm font-medium ${colors.label} mb-1`}>
                        {label}
                    </p>
                    <p className={`text-3xl font-bold ${colors.value}`}>
                        {value}
                    </p>
                </div>
                <div className={`p-3 rounded-xl ${colors.bg}`}>
                    <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
