import React, { useState, useEffect, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bell,
    MessageCircle,
    User,
    Globe,
    ChevronDown,
    Sparkles,
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
} from "lucide-react";
import SearchBar from "../components/customer/SearchBar";
import ServiceCategories from "../components/customer/ServiceCategories";
import OngoingBookings from "../components/customer/OngoingBookings";
import FeaturedWorkers from "../components/customer/FeaturedWorkers";
import { useWorkerSearchStore } from "../store/workerSearch.store";
import { useAuthStore } from "../store/auth.store";
import { applyPreferredLanguageAsync } from "../components/GujaratTranslator";
import RobustGujaratTranslator from "../components/GujaratTranslator";
import RobustGujaratTranslatorDropdown from "../components/RobustGujaratTranslatorDropdown";

const CustomerHomePage = () => {
    const navigate = useNavigate();
    const [language, setLanguage] = useState("en");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
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
        // attempt to apply saved language; await is optional
        applyPreferredLanguageAsync(5000).then((applied) => {
            console.log("preferred language applied:", applied);
        });
    }, []);
    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div
            id="home"
            className="min-h-screen bg-gradient-to-b from-white to-gray-50 overflow-x-hidden w-full"
        >
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 w-full">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-between gap-2">
                        {/* Logo */}
                        <div
                            className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3 cursor-pointer flex-shrink-0"
                            onClick={() => navigate("/")}
                        >
                            <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-6 md:h-6 text-white" />
                            </div>
                            <span className="text-sm sm:text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                                WorkJunction
                            </span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center space-x-8">
                            <a
                                href="#home"
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                            >
                                Home
                            </a>
                            <a
                                href="#services"
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                            >
                                Services
                            </a>
                            <a
                                href="#bookings"
                                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                            >
                                Bookings
                            </a>
                        </div>

                        {/* Right Side Icons */}
                        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 flex-shrink-0">
                            {/* Language Toggle */}
                            {/* <RobustGujaratTranslator /> */}

                            {/* Chat */}
                            <button
                                className="p-1.5 sm:p-2 text-gray-600 hover:text-blue-600 transition-colors flex-shrink-0"
                                onClick={() => {
                                    navigate("/customer/chat");
                                }}
                            >
                                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                            </button>

                            {/* Desktop Profile Dropdown */}
                            <div className="hidden sm:block relative group">
                                <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-blue-600 transition-colors group">
                                    <User className="w-5 h-5 md:w-6 md:h-6" />
                                    <ChevronDown className="w-3 h-3 md:w-4 md:h-4 transition-transform duration-200 group-hover:rotate-180" />
                                </button>

                                {/* Dropdown Menu */}
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100">
                                    <button
                                        onClick={() =>
                                            navigate("/customer/profile")
                                        }
                                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                                    >
                                        <User className="w-4 h-4" />
                                        <span>Profile Settings</span>
                                    </button>
                                    <button
                                        onClick={() =>
                                            navigate("/customer/bookings")
                                        }
                                        className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                                    >
                                        <FileText className="w-4 h-4" />
                                        <span>My Bookings</span>
                                    </button>
                                    <div className="border-t border-gray-200 my-1"></div>
                                    <button
                                        onClick={async () => {
                                            await logout();
                                            navigate("/login");
                                        }}
                                        className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Logout</span>
                                    </button>
                                    <div className="px-2">
                                        <Suspense fallback={null}>
                                            <RobustGujaratTranslator />
                                        </Suspense>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                className="sm:hidden p-1.5 text-gray-600 hover:text-blue-600 transition-colors flex-shrink-0"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-5 h-5" />
                                ) : (
                                    <Menu className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div className="fixed inset-0 backdrop-blur-md bg-white/30 z-40 sm:hidden" onClick={() => setMobileMenuOpen(false)} />
                )}

                {/* Mobile Menu */}
                <div
                    className={`fixed top-[57px] right-0 h-[calc(100vh-57px)] w-72 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out sm:hidden ${
                        mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    <div className="flex flex-col h-full">
                        <div className="flex-1 overflow-y-auto py-4">
                            {/* Language Translator in Mobile Menu */}
                            <div className="px-4 pb-4 border-b border-gray-200">
                                <RobustGujaratTranslator />
                            </div>

                            {/* Navigation Links */}
                            <div className="py-4 px-4 border-b border-gray-200">
                                <a
                                    href="#home"
                                    className="block py-3 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Home
                                </a>
                                <a
                                    href="#services"
                                    className="block py-3 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Services
                                </a>
                                <a
                                    href="#bookings"
                                    className="block py-3 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Bookings
                                </a>
                            </div>

                            {/* Profile Menu Items */}
                            <div className="py-4">
                                <button
                                    onClick={() => {
                                        navigate("/customer/profile");
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-3"
                                >
                                    <User className="w-5 h-5 flex-shrink-0" />
                                    <span>Profile Settings</span>
                                </button>
                                <button
                                    onClick={() => {
                                        navigate("/customer/bookings");
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-3"
                                >
                                    <FileText className="w-5 h-5 flex-shrink-0" />
                                    <span>My Bookings</span>
                                </button>
                                <button
                                    onClick={async () => {
                                        await logout();
                                        navigate("/login");
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-3"
                                >
                                    <LogOut className="w-5 h-5 flex-shrink-0" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
                {/* Search Section */}
                <section className="mb-8 sm:mb-12 w-full">
                    <SearchBar onSearch={handleSearch} />
                </section>

                {/* Service Categories */}
                <section id="services" className="mb-8 sm:mb-12 w-full">
                    <ServiceCategories />
                </section>

                {/* Ongoing Bookings */}
                <section id="bookings" className="mb-8 sm:mb-12 w-full">
                    <OngoingBookings />
                </section>

                {/* Featured Workers */}
                <section className="mb-8 sm:mb-12 w-full">
                    <FeaturedWorkers />
                </section>

                {/* Trust & Safety */}
                <section className="mb-8 sm:mb-12 w-full">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 text-white w-full">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-6 text-center">
                            Why Trust WorkJunction?
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                            <div className="text-center">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                    <Shield className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                                </div>
                                <h3 className="font-semibold mb-2 text-sm sm:text-base md:text-lg">
                                    Verified Professionals
                                </h3>
                                <p className="text-white/80 text-xs sm:text-sm">
                                    Aadhaar, Live Selfie, and Police
                                    Verification for complete trust
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                    <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                                </div>
                                <h3 className="font-semibold mb-2 text-sm sm:text-base md:text-lg">
                                    Secure Payments
                                </h3>
                                <p className="text-white/80 text-xs sm:text-sm">
                                    Razorpay integration with multiple payment
                                    options
                                </p>
                            </div>
                            <div className="text-center sm:col-span-2 md:col-span-1">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                    <Star className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                                </div>
                                <h3 className="font-semibold mb-2 text-sm sm:text-base md:text-lg">
                                    Customer Reviews
                                </h3>
                                <p className="text-white/80 text-xs sm:text-sm">
                                    Real ratings and reviews from verified
                                    customers
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8 sm:py-12 px-3 sm:px-4 md:px-6 w-full">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        <div className="sm:col-span-2 lg:col-span-1">
                            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <span className="text-lg sm:text-xl md:text-2xl font-bold">
                                    WorkJunction
                                </span>
                            </div>
                            <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
                                Making professional services accessible,
                                reliable, and trustworthy for everyone.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-6">Support</h3>
                            <ul className="space-y-3 sm:space-y-4">
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 text-sm sm:text-base"
                                    >
                                        <HelpCircle className="w-4 h-4 flex-shrink-0" />
                                        <span className="break-words">Customer Support</span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 text-sm sm:text-base"
                                    >
                                        <HelpCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>FAQ</span>
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-6">Legal</h3>
                            <ul className="space-y-3 sm:space-y-4">
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 text-sm sm:text-base"
                                    >
                                        <FileText className="w-4 h-4 flex-shrink-0" />
                                        <span className="break-words">Terms of Service</span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 text-sm sm:text-base"
                                    >
                                        <FileText className="w-4 h-4 flex-shrink-0" />
                                        <span className="break-words">Privacy Policy</span>
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-base sm:text-lg mb-4 sm:mb-6">Contact</h3>
                            <ul className="space-y-3 sm:space-y-4">
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 text-sm sm:text-base"
                                    >
                                        <Phone className="w-4 h-4 flex-shrink-0" />
                                        <span>+91 9876543210</span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 text-sm sm:text-base"
                                    >
                                        <Mail className="w-4 h-4 flex-shrink-0" />
                                        <span className="break-all">support@workjunction.com</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-400 text-xs sm:text-sm md:text-base">
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

export default CustomerHomePage;