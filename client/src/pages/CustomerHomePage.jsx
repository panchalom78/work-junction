import React, { useState, useEffect, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import {
    MessageCircle,
    User,
    ChevronDown,
    Shield,
    CreditCard,
    Star,
    HelpCircle,
    FileText,
    Phone,
    Mail,
    LogOut,
    Menu,
    X,
    Search,
    Home,
    Settings,
    Bell,
} from "lucide-react";
import SearchBar from "../components/customer/SearchBar";
import ServiceCategories from "../components/customer/ServiceCategories";
import OngoingBookings from "../components/customer/OngoingBookings";
import FeaturedWorkers from "../components/customer/FeaturedWorkers";
import { useWorkerSearchStore } from "../store/workerSearch.store";
import { useAuthStore } from "../store/auth.store";
import { applyPreferredLanguageAsync } from "../components/GujaratTranslator";
import RobustGujaratTranslator from "../components/GujaratTranslator";

const CustomerHomePage = () => {
    const navigate = useNavigate();
    const [language, setLanguage] = useState("en");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { searchWorkers } = useWorkerSearchStore();
    const { user, logout, getUser } = useAuthStore();

    const handleSearch = (filters) => {
        console.log(filters);

        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) queryParams.append(key, value);
        });

        navigate(`/customer/search?${queryParams.toString()}`);
        searchWorkers(filters);
    };

    useEffect(() => {
        const navigateUser = async () => {
            const response = await getUser();
            if (response.success) {
                if (!response.user.isVerified) {
                    navigate("/otpVerification");
                } else {
                    if (response.user.role == "WORKER") {
                        if (
                            response.user?.workerProfile?.verification
                                ?.status == "APPROVED"
                        ) {
                            navigate("/worker");
                        } else {
                            navigate("/worker/verification");
                        }
                    } else if (response.user.role == "SERVICE_AGENT") {
                        navigate("/serviceAgentDashboard");
                    } else if (response.user.role == "ADMIN") {
                        navigate("/adminDashboard");
                    }
                }
            } else {
                navigate("/login");
            }
        };
        navigateUser();
    }, []);

    useEffect(() => {
        // Scroll effect for navbar
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        // attempt to apply saved language; await is optional
        applyPreferredLanguageAsync(5000).then((applied) => {
            console.log("preferred language applied:", applied);
        });
    }, []);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div
            id="home"
            className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-x-hidden w-full"
        >
            {/* Enhanced Header */}
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    scrolled
                        ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/60"
                        : "bg-white/80 backdrop-blur-md border-b border-gray-200/60"
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        {/* Logo Section */}
                        <div
                            className="flex items-center space-x-3 cursor-pointer group flex-shrink-0"
                            onClick={() => navigate("/")}
                        >
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                <img
                                    src="/logo_plane.png"
                                    alt="WorkJunction"
                                    className="w-6 h-6 lg:w-7 lg:h-7 filter brightness-0 invert"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent tracking-tight">
                                    WorkJunction
                                </span>
                                <span className="text-xs text-gray-500 font-medium hidden sm:block">
                                    Professional Services
                                </span>
                            </div>
                        </div>

                        {/* Desktop Navigation - Centered */}
                        <nav className="hidden lg:flex items-center space-x-1 absolute left-1/2 transform -translate-x-1/2">
                            {[
                                { id: "home", label: "Home", icon: Home },
                                {
                                    id: "services",
                                    label: "Services",
                                    icon: Search,
                                },
                                {
                                    id: "bookings",
                                    label: "Bookings",
                                    icon: FileText,
                                },
                            ].map((item) => (
                                <a
                                    key={item.id}
                                    href={`#${item.id}`}
                                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 hover:bg-blue-50/80 group"
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span className="text-sm">
                                        {item.label}
                                    </span>
                                </a>
                            ))}
                        </nav>

                        {/* Right Side Actions */}
                        <div className="flex items-center space-x-2 lg:space-x-4">
                            {/* Notification Bell */}

                            {/* Chat Button */}
                            <button
                                className="p-2 text-gray-600 hover:text-blue-600 transition-all duration-200 hover:scale-110"
                                onClick={() => navigate("/customer/chat")}
                            >
                                <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6" />
                            </button>

                            {/* Enhanced Profile Dropdown */}
                            <div className="relative">
                                <button
                                    className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 bg-white/50 hover:bg-white hover:shadow-md transition-all duration-200 group"
                                    onClick={() =>
                                        setProfileMenuOpen(!profileMenuOpen)
                                    }
                                >
                                    <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                                        <User className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                                    </div>
                                    <ChevronDown
                                        className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                                            profileMenuOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>

                                {/* Dropdown Menu */}
                                {profileMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/60 py-3 z-50 animate-in fade-in-0 zoom-in-95">
                                        {/* User Info */}
                                        <div className="px-4 py-3 border-b border-gray-200/60">
                                            <p className="font-semibold text-gray-900 text-sm">
                                                {user.name || "User"}
                                            </p>
                                            <p className="text-gray-500 text-xs mt-1">
                                                {user.email}
                                            </p>
                                        </div>

                                        {/* Menu Items */}
                                        {[
                                            {
                                                icon: User,
                                                label: "Profile Settings",
                                                path: "/customer/profile",
                                            },
                                            {
                                                icon: FileText,
                                                label: "My Bookings",
                                                path: "/customer/bookings",
                                            },
                                        ].map((item) => (
                                            <button
                                                key={item.label}
                                                onClick={() => {
                                                    navigate(item.path);
                                                    setProfileMenuOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 transition-all duration-200 flex items-center space-x-3 group/item"
                                            >
                                                <item.icon className="w-4 h-4 group-hover/item:scale-110 transition-transform text-gray-600" />
                                                <span className="text-sm">
                                                    {item.label}
                                                </span>
                                            </button>
                                        ))}

                                        <div className="border-t border-gray-200/60 my-2"></div>

                                        {/* Language Translator */}
                                        <div className="px-4 py-2">
                                            <RobustGujaratTranslator />
                                        </div>

                                        <div className="border-t border-gray-200/60 my-2"></div>

                                        {/* Logout */}
                                        <button
                                            onClick={async () => {
                                                await logout();
                                                navigate("/login");
                                                setProfileMenuOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-all duration-200 flex items-center space-x-3 group/item"
                                        >
                                            <LogOut className="w-4 h-4 group-hover/item:scale-110 transition-transform" />
                                            <span className="text-sm">
                                                Logout
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                className="lg:hidden p-2 text-gray-600 hover:text-blue-600 transition-all duration-200 hover:scale-110"
                                onClick={() =>
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-6 h-6" />
                                ) : (
                                    <Menu className="w-6 h-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Enhanced Mobile Menu */}
                <div
                    className={`lg:hidden fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out ${
                        mobileMenuOpen ? "translate-x-0" : "translate-x-full"
                    }`}
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    />

                    {/* Menu Panel - Fixed white background with blur */}
                    <div className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-white backdrop-blur-md shadow-2xl border-l border-gray-200/60">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200/60 bg-white">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                                    <img
                                        src="/logo_plane.png"
                                        alt="WorkJunction"
                                        className="w-7 h-7 filter brightness-0 invert"
                                    />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">
                                        WorkJunction
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Professional Services
                                    </p>
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="font-semibold text-gray-900 text-sm">
                                    {user.name || "User"}
                                </p>
                                <p className="text-gray-500 text-xs mt-1">
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex-1 overflow-y-auto py-4 bg-white">
                            <nav className="space-y-1 px-4">
                                {[
                                    { id: "home", label: "Home", icon: Home },
                                    {
                                        id: "services",
                                        label: "Services",
                                        icon: Search,
                                    },
                                    {
                                        id: "bookings",
                                        label: "Bookings",
                                        icon: FileText,
                                    },
                                ].map((item) => (
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50/80 transition-all duration-200 group"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        <span className="text-sm font-medium">
                                            {item.label}
                                        </span>
                                    </a>
                                ))}
                            </nav>

                            {/* Profile Actions */}
                            <div className="mt-6 px-4">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                    Account
                                </h3>
                                <div className="space-y-1">
                                    {[
                                        {
                                            icon: User,
                                            label: "Profile Settings",
                                            path: "/customer/profile",
                                        },
                                        {
                                            icon: FileText,
                                            label: "My Bookings",
                                            path: "/customer/bookings",
                                        },
                                        {
                                            icon: Settings,
                                            label: "Preferences",
                                            path: "/customer/settings",
                                        },
                                    ].map((item) => (
                                        <button
                                            key={item.label}
                                            onClick={() => {
                                                navigate(item.path);
                                                setMobileMenuOpen(false);
                                            }}
                                            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50/80 transition-all duration-200 group"
                                        >
                                            <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            <span className="text-sm">
                                                {item.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Language Translator */}
                            <div className="mt-6 px-4">
                                <RobustGujaratTranslator />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-200/60 bg-white">
                            <button
                                onClick={async () => {
                                    await logout();
                                    navigate("/login");
                                    setMobileMenuOpen(false);
                                }}
                                className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 text-sm font-medium"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content with padding for fixed header */}
            <main className="pt-20 lg:pt-24 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search Section */}
                <section className="mb-12 lg:mb-16 w-full">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
                            Find Trusted Professionals
                        </h1>
                        <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
                            Connect with verified service providers for all your
                            home and business needs
                        </p>
                    </div>
                    <SearchBar onSearch={handleSearch} />
                </section>

                {/* Service Categories */}
                <section id="services" className="mb-12 lg:mb-16 w-full">
                    <ServiceCategories />
                </section>

                {/* Ongoing Bookings */}
                <section id="bookings" className="mb-12 lg:mb-16 w-full">
                    <OngoingBookings />
                </section>

                {/* Featured Workers */}
                <section className="mb-12 lg:mb-16 w-full">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                            Featured Professionals
                        </h2>
                        <p className="text-gray-600 mt-2">
                            Top-rated service providers in your area
                        </p>
                    </div>
                    <FeaturedWorkers />
                </section>

                {/* Trust & Safety Section */}
                <section className="mb-12 lg:mb-16 w-full">
                    <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl lg:rounded-3xl p-6 lg:p-12 text-white w-full shadow-2xl">
                        <div className="text-center mb-8 lg:mb-12">
                            <h2 className="text-2xl lg:text-4xl font-bold mb-4 tracking-tight">
                                Why Choose WorkJunction?
                            </h2>
                            <p className="text-blue-100 text-lg lg:text-xl max-w-2xl mx-auto">
                                Your safety and satisfaction are our top
                                priorities
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                            {[
                                {
                                    icon: Shield,
                                    title: "Verified Professionals",
                                    description:
                                        "Aadhaar, Live Selfie, and Police Verification for complete trust",
                                },
                                {
                                    icon: CreditCard,
                                    title: "Secure Payments",
                                    description:
                                        "Razorpay integration with multiple payment options and protection",
                                },
                                {
                                    icon: Star,
                                    title: "Customer Reviews",
                                    description:
                                        "Real ratings and reviews from verified customers",
                                },
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className="text-center group p-6 rounded-xl hover:bg-white/10 transition-all duration-300"
                                >
                                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                                        <item.icon className="w-8 h-8 lg:w-10 lg:h-10" />
                                    </div>
                                    <h3 className="font-bold text-lg lg:text-xl mb-3">
                                        {item.title}
                                    </h3>
                                    <p className="text-blue-100 text-sm lg:text-base leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Enhanced Footer */}
            <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white py-12 lg:py-16 px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
                        {/* Company Info */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                    <img
                                        src="/logo_plane.png"
                                        alt="WorkJunction"
                                        className="w-6 h-6 filter brightness-0 invert"
                                    />
                                </div>
                                <span className="text-2xl font-bold">
                                    WorkJunction
                                </span>
                            </div>
                            <p className="text-gray-400 mb-6 text-lg leading-relaxed max-w-md">
                                Making professional services accessible,
                                reliable, and trustworthy for everyone.
                            </p>
                            <div className="flex space-x-4">
                                {/* Social icons would go here */}
                            </div>
                        </div>

                        {/* Support */}
                        <div>
                            <h3 className="font-bold text-lg mb-6">Support</h3>
                            <ul className="space-y-4">
                                {["Customer Support", "FAQ", "Help Center"].map(
                                    (item) => (
                                        <li key={item}>
                                            <a
                                                href="#"
                                                className="text-gray-400 hover:text-white transition-all duration-200 flex items-center space-x-2 group"
                                            >
                                                <HelpCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                <span className="group-hover:translate-x-1 transition-transform">
                                                    {item}
                                                </span>
                                            </a>
                                        </li>
                                    )
                                )}
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h3 className="font-bold text-lg mb-6">Legal</h3>
                            <ul className="space-y-4">
                                {[
                                    "Terms of Service",
                                    "Privacy Policy",
                                    "Cookie Policy",
                                ].map((item) => (
                                    <li key={item}>
                                        <a
                                            href="#"
                                            className="text-gray-400 hover:text-white transition-all duration-200 flex items-center space-x-2 group"
                                        >
                                            <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            <span className="group-hover:translate-x-1 transition-transform">
                                                {item}
                                            </span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h3 className="font-bold text-lg mb-6">Contact</h3>
                            <ul className="space-y-4">
                                <li>
                                    <a
                                        href="tel:+919876543210"
                                        className="text-gray-400 hover:text-white transition-all duration-200 flex items-center space-x-2 group"
                                    >
                                        <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        <span className="group-hover:translate-x-1 transition-transform">
                                            +91 9876543210
                                        </span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="mailto:support@workjunction.com"
                                        className="text-gray-400 hover:text-white transition-all duration-200 flex items-center space-x-2 group"
                                    >
                                        <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        <span className="group-hover:translate-x-1 transition-transform break-all">
                                            support@workjunction.com
                                        </span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-12 pt-8 text-center">
                        <p className="text-gray-400">
                            © {new Date().getFullYear()} WorkJunction. All
                            rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CustomerHomePage;
