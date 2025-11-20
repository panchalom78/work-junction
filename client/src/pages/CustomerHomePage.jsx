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
            className="min-h-screen bg-gradient-to-b from-white to-gray-50"
        >
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div
                            className="flex items-center space-x-3 cursor-pointer"
                            onClick={() => navigate("/")}
                        >
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                WorkJunction
                            </span>
                        </div>

                        {/* Navigation */}
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
                        <div className="flex items-center space-x-4">
                            {/* Language Toggle */}
                            {/* <RobustGujaratTranslator /> */}

                            {/* Chat */}
                            <button
                                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                                onClick={() => {
                                    navigate("/customer/chat");
                                }}
                            >
                                <MessageCircle className="w-6 h-6" />
                            </button>
                            <div className="relative group">
                                <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-blue-600 transition-colors group">
                                    <User className="w-6 h-6" />
                                    <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
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
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Search Section */}
                <section className="mb-12">
                    <SearchBar onSearch={handleSearch} />
                </section>

                {/* Service Categories */}
                <section id="services" className="mb-12">
                    <ServiceCategories />
                </section>

                {/* Ongoing Bookings */}
                <section id="bookings" className="mb-12">
                    <OngoingBookings />
                </section>

                {/* Featured Workers */}
                <section className="mb-12">
                    <FeaturedWorkers />
                </section>

                {/* Trust & Safety */}
                <section className="mb-12">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white">
                        <h2 className="text-2xl font-bold mb-6 text-center">
                            Why Trust WorkJunction?
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Shield className="w-8 h-8" />
                                </div>
                                <h3 className="font-semibold mb-2">
                                    Verified Professionals
                                </h3>
                                <p className="text-white/80 text-sm">
                                    Aadhaar, Live Selfie, and Police
                                    Verification for complete trust
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <CreditCard className="w-8 h-8" />
                                </div>
                                <h3 className="font-semibold mb-2">
                                    Secure Payments
                                </h3>
                                <p className="text-white/80 text-sm">
                                    Razorpay integration with multiple payment
                                    options
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Star className="w-8 h-8" />
                                </div>
                                <h3 className="font-semibold mb-2">
                                    Customer Reviews
                                </h3>
                                <p className="text-white/80 text-sm">
                                    Real ratings and reviews from verified
                                    customers
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 px-6">
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

                        <div>
                            <h3 className="font-bold text-lg mb-6">Support</h3>
                            <ul className="space-y-4">
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"
                                    >
                                        <HelpCircle className="w-4 h-4" />
                                        <span>Customer Support</span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"
                                    >
                                        <HelpCircle className="w-4 h-4" />
                                        <span>FAQ</span>
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-6">Legal</h3>
                            <ul className="space-y-4">
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"
                                    >
                                        <FileText className="w-4 h-4" />
                                        <span>Terms of Service</span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"
                                    >
                                        <FileText className="w-4 h-4" />
                                        <span>Privacy Policy</span>
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-6">Contact</h3>
                            <ul className="space-y-4">
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"
                                    >
                                        <Phone className="w-4 h-4" />
                                        <span>+91 9876543210</span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"
                                    >
                                        <Mail className="w-4 h-4" />
                                        <span>support@workjunction.com</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
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

export default CustomerHomePage;
