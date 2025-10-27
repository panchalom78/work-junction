import React from "react";

const QuickAction = ({
    icon: Icon,
    label,
    description,
    onClick,
    color = "blue",
}) => {
    const colorClasses = {
        blue: {
            bg: "bg-blue-50",
            border: "border-blue-200",
            icon: "text-blue-600",
            text: "text-blue-900",
            hover: "hover:bg-blue-100",
        },
        green: {
            bg: "bg-green-50",
            border: "border-green-200",
            icon: "text-green-600",
            text: "text-green-900",
            hover: "hover:bg-green-100",
        },
        purple: {
            bg: "bg-purple-50",
            border: "border-purple-200",
            icon: "text-purple-600",
            text: "text-purple-900",
            hover: "hover:bg-purple-100",
        },
        orange: {
            bg: "bg-orange-50",
            border: "border-orange-200",
            icon: "text-orange-600",
            text: "text-orange-900",
            hover: "hover:bg-orange-100",
        },
    };

    const colors = colorClasses[color] || colorClasses.blue;

    return (
        <button
            onClick={onClick}
            className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 ${colors.bg} ${colors.border} ${colors.hover} hover:shadow-md`}
        >
            <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${colors.bg}`}>
                    <Icon className={`w-5 h-5 ${colors.icon}`} />
                </div>
                <div className="flex-1">
                    <h4 className={`font-semibold ${colors.text}`}>{label}</h4>
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                </div>
            </div>
        </button>
    );
};

export default QuickAction;
