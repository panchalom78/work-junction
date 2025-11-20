import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import {
    Play,
    Pause,
    ArrowRight,
    Check,
    Star,
    MapPin,
    Users,
    Shield,
    Clock,
    Award,
    TrendingUp,
    Phone,
    Mail,
    MessageCircle,
    Heart,
    Sparkles,
    Zap,
    Target,
    Globe,
} from "lucide-react";

// Mock Lottie data - replace with actual animation data
import workerConnectAnim from "../assets/Plumbers.json";
import featuresAnim from "../assets/worker.json";
import axiosInstance from "../utils/axiosInstance";
import SkillShowcase from "../components/SkillShowcase";

// API service function
const landingAPI = {
    getStats: async () => {
        const response = await axiosInstance.get("/api/landing/stats");
        // const data = await response.json();
        console.log(response.data);

        return response.data;
    },
};

const FeatureCard = ({ icon: Icon, title, description, color = "blue" }) => {
    const colors = {
        blue: "from-blue-500 to-blue-600",
        purple: "from-purple-500 to-purple-600",
        green: "from-green-500 to-green-600",
        orange: "from-orange-500 to-orange-600",
    };

    return (
        <div className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-transparent">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
                <div
                    className={`w-16 h-16 bg-gradient-to-r ${colors[color]} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                    <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                    {description}
                </p>
            </div>
        </div>
    );
};

const StatCounter = ({ end, suffix, label, duration = 2000 }) => {
    return (
        <div className="text-center">
            <div className="text-5xl text-white font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text  mb-2">
                {end}
                {suffix}
            </div>
            <div className="text-black font-semibold text-lg">{label}</div>
        </div>
    );
};

const TestimonialCard = ({ name, role, content, rating, avatarColor }) => (
    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center mb-6">
            <div
                className={`w-12 h-12 ${avatarColor} rounded-2xl flex items-center justify-center mr-4`}
            >
                <Users className="w-6 h-6 text-white" />
            </div>
            <div>
                <div className="font-bold text-gray-900 text-lg">{name}</div>
                <div className="text-gray-600">{role}</div>
            </div>
        </div>
        <div className="flex mb-4">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`w-5 h-5 ${
                        i < rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                    } mr-1`}
                />
            ))}
        </div>
        <p className="text-gray-700 text-lg leading-relaxed">"{content}"</p>
    </div>
);

const ServiceShowcase = ({ services }) => {
    const serviceIcons = {
        Plumbing: Zap,
        Electrical: Zap,
        Cleaning: Sparkles,
        Carpentry: Target,
        Painting: Award,
        "AC Repair": Zap,
        // Add more mappings as needed
    };

    const serviceColors = {
        Plumbing: "bg-blue-500",
        Electrical: "bg-yellow-500",
        Cleaning: "bg-green-500",
        Carpentry: "bg-orange-500",
        Painting: "bg-purple-500",
        "AC Repair": "bg-cyan-500",
        // Default color
        default: "bg-blue-500",
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {services.map((service, index) => {
                const IconComponent = serviceIcons[service.name] || Zap;
                const colorClass =
                    serviceColors[service.name] || serviceColors.default;

                return (
                    <div
                        key={service._id || index}
                        className="text-center group"
                    >
                        <div
                            className={`w-20 h-20 ${colorClass} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                        >
                            <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <div className="font-semibold text-gray-900">
                            {service.name}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const WorkJunctionLanding = () => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [activeFeature, setActiveFeature] = useState(0);
    const [landingData, setLandingData] = useState({
        stats: {
            totalCustomers: 50000,
            totalVerifiedWorkers: 10000,
            totalCompletedBookings: 0,
            totalServices: 50,
        },
        services: [],
        reviews: [],
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchLandingData();
    }, []);

    const fetchLandingData = async () => {
        try {
            setLoading(true);
            const response = await landingAPI.getStats();
            if (response.success) {
                setLandingData(response.data);
            }
        } catch (error) {
            console.error("Error fetching landing page data:", error);
            // Keep default data if API fails
        } finally {
            setLoading(false);
        }
    };

    const features = [
        {
            icon: Shield,
            title: "Verified Professionals",
            description:
                "Every service provider undergoes rigorous verification including Aadhaar, live selfie, and police verification for your complete peace of mind.",
            color: "blue",
        },
        {
            icon: Clock,
            title: "Instant Booking",
            description:
                "Book trusted professionals in under 60 seconds with our streamlined, intuitive booking system that works around your schedule.",
            color: "purple",
        },
        {
            icon: TrendingUp,
            title: "Smart Matching",
            description:
                "Our AI-powered system matches you with the perfect professional based on location, ratings, skills, and availability.",
            color: "green",
        },
        {
            icon: Globe,
            title: "Multi-Language Support",
            description:
                "Access our platform in multiple Indian languages including Hindi, Marathi, Tamil, and more for seamless user experience.",
            color: "orange",
        },
    ];

    // Update the stats array to use totalSkills
    const stats = [
        {
            end: landingData.stats.totalCustomers,
            suffix: "+",
            label: "Happy Customers",
        },
        {
            end: landingData.stats.totalVerifiedWorkers,
            suffix: "+",
            label: "Verified Professionals",
        },
        {
            end: landingData.stats.totalSkills,
            suffix: "+",
            label: "Service Categories",
        },
    ];

    // Use actual reviews from API or fallback to mock data
    const testimonials =
        landingData.reviews.length > 0
            ? landingData.reviews.slice(0, 3).map((review, index) => ({
                  name: review.customerName || `Customer ${index + 1}`,
                  role: review.customerRole || "Homeowner",
                  content: review.comment || "Great service!",
                  rating: review.rating || 5,
                  avatarColor:
                      review.avatarColor ||
                      ["bg-blue-500", "bg-green-500", "bg-purple-500"][index],
              }))
            : [
                  {
                      name: "Priya Sharma",
                      role: "Homeowner, Mumbai",
                      content:
                          "Found the perfect plumber within minutes! The verification process gave me confidence, and the service was exceptional.",
                      rating: 5,
                      avatarColor: "bg-blue-500",
                  },
                  {
                      name: "Rajesh Kumar",
                      role: "Electrician Partner",
                      content:
                          "WorkJunction has transformed my business. I get quality leads and payments are always prompt and secure.",
                      rating: 5,
                      avatarColor: "bg-green-500",
                  },
                  {
                      name: "Anita Desai",
                      role: "Regular Customer",
                      content:
                          "The multi-language feature is amazing! My parents can now book services independently in their preferred language.",
                      rating: 4,
                      avatarColor: "bg-purple-500",
                  },
              ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            {/* Navigation - Same as before */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                WorkJunction
                            </span>
                        </div>

                        <div className="hidden lg:flex items-center space-x-8">
                            <a
                                href="#features"
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                            >
                                Features
                            </a>
                            <a
                                href="#skills"
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                            >
                                Services
                            </a>
                            <a
                                href="#testimonials"
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                            >
                                Testimonials
                            </a>
                        </div>

                        <div className="flex items-center space-x-4">
                            <button
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                                onClick={() => navigate("/login")}
                            >
                                Sign In
                            </button>
                            <button
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl hover:shadow-lg transition-all duration-300 font-medium"
                                onClick={() => navigate("/signup")}
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            {/* Hero Section - Same as before */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="text-center lg:text-left">
                            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-600 font-medium mb-6">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Trusted by{" "}
                                {landingData.stats.totalCustomers.toLocaleString()}
                                + Customers
                            </div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
                                Professional
                                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Services
                                </span>
                                Made Simple
                            </h1>

                            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
                                Connect with{" "}
                                {landingData.stats.totalVerifiedWorkers.toLocaleString()}
                                + verified professionals for all your service
                                needs. From home repairs to specialized tasks,
                                we bring quality and reliability to your
                                doorstep.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <button
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl hover:shadow-xl transition-all duration-300 font-semibold flex items-center justify-center space-x-3 group"
                                    onClick={() => navigate("/login")}
                                >
                                    <span>Book a Service</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>

                        <div className="relative p-10">
                            <Lottie
                                animationData={workerConnectAnim}
                                loop
                                autoplay
                                className="w-full h-auto md:max-w-[400px] mx-auto"
                                style={{ maxHeight: "500px" }}
                            />
                        </div>
                    </div>
                </div>
            </section>
            {/* Stats Bar */}
            <section className="py-12 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                        {stats.map((stat, index) => (
                            <StatCounter key={index} {...stat} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Skills Showcase Section */}
            <section id="skills" className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Popular
                            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Service Categories
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Discover skilled professionals across various
                            service categories. From home repairs to specialized
                            tasks, we've got you covered.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <SkillShowcase skills={landingData.skills} />
                    )}
                </div>
            </section>
            {/* Features Section - Same as before */}
            <section id="features" className="py-20 bg-gray-50 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                                Why Choose
                                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    WorkJunction?
                                </span>
                            </h2>
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                We've built a platform that puts trust, quality,
                                and convenience at the forefront of every
                                service experience.
                            </p>

                            <div className="space-y-6">
                                {[
                                    "Rigorous professional verification",
                                    "Instant booking & confirmation",
                                    "Transparent pricing & payments",
                                    "Multi-language platform support",
                                ].map((feature, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center space-x-4"
                                    >
                                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-gray-700 text-lg">
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <Lottie
                                animationData={featuresAnim}
                                loop
                                autoplay
                                className="w-full h-[650px] md:h-[400px] rounded-3xl"
                                style={{ maxHeight: "650px" }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {features.map((feature, index) => (
                            <FeatureCard key={index} {...feature} />
                        ))}
                    </div>
                </div>
            </section>
            {/* How It Works - Same as before */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            How It
                            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Works
                            </span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "01",
                                title: "Search & Select",
                                description:
                                    "Browse verified professionals based on your service needs, location, and budget",
                                icon: Target,
                            },
                            {
                                step: "02",
                                title: "Book & Confirm",
                                description:
                                    "Choose your preferred time slot and confirm with secure payment options",
                                icon: Clock,
                            },
                            {
                                step: "03",
                                title: "Relax & Enjoy",
                                description:
                                    "Professional service delivered with quality guarantee and complete satisfaction",
                                icon: Award,
                            },
                        ].map((step, index) => (
                            <div key={index} className="text-center group">
                                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <step.icon className="w-8 h-8 text-white" />
                                </div>
                                <div className="text-sm font-semibold text-blue-600 mb-2">
                                    STEP {step.step}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                    {step.title}
                                </h3>
                                <p className="text-gray-600 text-lg">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            {/* Testimonials */}
            <section
                id="testimonials"
                className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 px-6"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Trusted by
                            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Thousands
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Hear from our growing community of customers and
                            service professionals who are transforming the
                            service industry.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {testimonials.map((testimonial, index) => (
                                <TestimonialCard key={index} {...testimonial} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
            {/* CTA Section - Same as before */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Ready to Get
                            <span className="block">Started?</span>
                        </h2>
                        <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                            Join{" "}
                            {landingData.stats.totalCustomers.toLocaleString()}+
                            satisfied customers and{" "}
                            {landingData.stats.totalVerifiedWorkers.toLocaleString()}
                            + service professionals. Experience the future of
                            service booking today.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                className="bg-white text-blue-600 px-8 py-4 rounded-2xl hover:shadow-xl transition-all duration-300 font-semibold flex items-center justify-center space-x-3"
                                onClick={() => navigate("/login")}
                            >
                                <span>Book Your First Service</span>
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <button
                                className="border-2 border-white text-white px-8 py-4 rounded-2xl hover:bg-white hover:text-blue-600 transition-all duration-300 font-semibold"
                                onClick={() => navigate("/login")}
                            >
                                Become a Partner
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            {/* Footer - Same as before */}
            <footer className="bg-gray-900 text-white py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-2xl font-bold">
                                    WorkJunction
                                </span>
                            </div>
                            <p className="text-gray-400 mb-6">
                                Making professional services accessible,
                                reliable, and trustworthy for everyone.
                            </p>
                        </div>

                        {[
                            {
                                title: "Services",
                                links: [
                                    "Plumbing",
                                    "Electrical",
                                    "Cleaning",
                                    "Carpentry",
                                    "Painting",
                                    "View All",
                                ],
                            },
                            {
                                title: "Company",
                                links: [
                                    "About Us",
                                    "Careers",
                                    "Press",
                                    "Partners",
                                    "Contact",
                                ],
                            },
                            {
                                title: "Support",
                                links: [
                                    "Help Center",
                                    "Safety",
                                    "Community",
                                    "Terms",
                                    "Privacy",
                                ],
                            },
                        ].map((column, index) => (
                            <div key={index}>
                                <h3 className="font-bold text-lg mb-6">
                                    {column.title}
                                </h3>
                                <ul className="space-y-4">
                                    {column.links.map((link, linkIndex) => (
                                        <li key={linkIndex}>
                                            <a
                                                href="#"
                                                className="text-gray-400 hover:text-white transition-colors"
                                            >
                                                {link}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
                        <p>
                            © {new Date().getFullYear()} WorkJunction. All
                            rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default WorkJunctionLanding;
