import React from "react";

const SkillShowcase = ({ skills }) => {
    // Map skill names to emoji icons and colors
    const getSkillDetails = (skillName) => {
        const skillMap = {
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
            "Car Wash": { icon: "🚗", color: "bg-blue-400" },
            Salon: { icon: "💇", color: "bg-pink-500" },
            Spa: { icon: "🧖", color: "bg-purple-400" },
            "TV Repair": { icon: "📺", color: "bg-blue-600" },
            "Computer Repair": { icon: "💻", color: "bg-gray-600" },
            "Mobile Repair": { icon: "📱", color: "bg-slate-600" },
            "Water Purifier": { icon: "💧", color: "bg-blue-300" },
            "Gas Stove": { icon: "🔥", color: "bg-orange-400" },
        };

        return skillMap[skillName] || { icon: "🛠️", color: "bg-gray-500" };
    };

    // Use provided skills or fallback to default skills
    const displaySkills =
        skills && skills.length > 0
            ? skills.map((skill) => ({
                  ...skill,
                  ...getSkillDetails(skill.name),
              }))
            : [
                  { name: "Plumbing", icon: "🔧", color: "bg-blue-500" },
                  { name: "Electrical", icon: "⚡", color: "bg-yellow-500" },
                  { name: "Cleaning", icon: "✨", color: "bg-green-500" },
                  { name: "Carpentry", icon: "🪵", color: "bg-orange-500" },
                  { name: "Painting", icon: "🎨", color: "bg-purple-500" },
                  { name: "AC Repair", icon: "❄️", color: "bg-cyan-500" },
              ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {displaySkills.map((skill, index) => (
                <div key={skill._id || index} className="text-center group">
                    <div
                        className={`w-20 h-20 ${skill.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 text-2xl`}
                    >
                        {skill.icon}
                    </div>
                    <div className="font-semibold text-gray-900">
                        {skill.name}
                    </div>
                    {skill.workerCount > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                            {skill.workerCount} professionals
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default SkillShowcase;
