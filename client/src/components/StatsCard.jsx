import React from "react";

const StatsCard = ({ icon: Icon, label, value, color, theme }) => {
    const defaultTheme = {
        primary: {
            dark: "#17182A",
            gradient: "linear-gradient(135deg, #17182A 0%, #2D1B69 100%)",
            lightGradient:
                "linear-gradient(135deg, rgba(23, 24, 42, 0.08) 0%, rgba(45, 27, 105, 0.08) 100%)",
        },
        accents: {
            green: "#10B981",
            blue: "#3B82F6",
            yellow: "#F59E0B",
            purple: "#8B5CF6",
            teal: "#0D9488",
        },
        text: {
            primary: "#17182A",
            secondary: "#4B5563",
            light: "#9CA3AF",
        },
    };

    const currentTheme = theme || defaultTheme;

    const colorConfig = {
        green: {
            accent: currentTheme.accents.green,
            light: "rgba(16, 185, 129, 0.1)",
            medium: "rgba(16, 185, 129, 0.2)",
        },
        blue: {
            accent: currentTheme.accents.blue,
            light: "rgba(59, 130, 246, 0.1)",
            medium: "rgba(59, 130, 246, 0.2)",
        },
        yellow: {
            accent: currentTheme.accents.yellow,
            light: "rgba(245, 158, 11, 0.1)",
            medium: "rgba(245, 158, 11, 0.2)",
        },
        purple: {
            accent: currentTheme.accents.purple,
            light: "rgba(139, 92, 246, 0.1)",
            medium: "rgba(139, 92, 246, 0.2)",
        },
    };

    const config = colorConfig[color] || colorConfig.blue;

    return (
        <div
            className="p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg group relative overflow-hidden backdrop-blur-sm"
            style={{
                background: currentTheme.primary.lightGradient,
                borderColor: `rgba(23, 24, 42, 0.1)`,
            }}
        >
            {/* Mathematical decoration */}
            <div className="absolute top-2 right-2 opacity-5">
                <div className="text-lg font-mono">π</div>
            </div>

            {/* Color accent bar */}
            <div
                className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
                style={{ background: config.accent }}
            ></div>

            <div className="flex items-center justify-between relative z-10">
                <div className="flex-1 pl-2">
                    <p
                        className="text-sm font-medium mb-2"
                        style={{ color: currentTheme.text.secondary }}
                    >
                        {label}
                    </p>
                    <p
                        className="text-3xl font-bold"
                        style={{ color: currentTheme.text.primary }}
                    >
                        {value}
                    </p>
                </div>
                <div
                    className="p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 backdrop-blur-sm"
                    style={{
                        background: config.medium,
                    }}
                >
                    <Icon
                        className="w-6 h-6"
                        style={{ color: config.accent }}
                    />
                </div>
            </div>

            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
        </div>
    );
};

export default StatsCard;
