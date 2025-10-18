import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import SearchBar from "../components/customer/SearchBar";
import ServiceCategories from "../components/customer/ServiceCategories";
import OngoingBookings from "../components/customer/OngoingBookings";
import FeaturedWorkers from "../components/customer/FeaturedWorkers";
import { useWorkerSearchStore } from "../store/workerSearch.store";

const CustomerHomePage = () => {
    const navigate = useNavigate();
    const [activeBookings, setActiveBookings] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [language, setLanguage] = useState("en");
    const { searchWorkers } = useWorkerSearchStore();

    useEffect(() => {
        // Mock data - replace with actual API calls
        setActiveBookings([
            {
                id: "1",
                serviceName: "Plumbing - Pipe Repair",
                workerName: "Rajesh Kumar",
                workerPhone: "98******21",
                bookingDate: "2024-01-15T10:00:00",
                status: "Confirmed",
                paymentStatus: "Pending",
            },
            {
                id: "2",
                serviceName: "Electrical - Fan Installation",
                workerName: "Suresh Patel",
                workerPhone: "97******45",
                bookingDate: "2024-01-16T14:00:00",
                status: "In Progress",
                paymentStatus: "Paid",
            },
        ]);

        setNotifications([
            {
                id: "1",
                type: "booking_confirmation",
                message: "Your plumbing service has been confirmed",
                timestamp: "2024-01-14T09:30:00",
                read: false,
            },
            {
                id: "2",
                message: "Special offer: 20% off on cleaning services",
                type: "promotion",
                timestamp: "2024-01-14T08:15:00",
                read: true,
            },
        ]);
    }, []);

    const handleSearch = (filters) => {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) queryParams.append(key, value);
        });

        navigate(`/customer/search?${queryParams.toString()}`);
        searchWorkers(filters);
    };

    const unreadNotifications = notifications.filter((n) => !n.read).length;

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
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
                            <button className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                                Home
                            </button>
                            <button className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                                Services
                            </button>
                            <button className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                                Bookings
                            </button>
                        </div>

                        {/* Right Side Icons */}
                        <div className="flex items-center space-x-4">
                            {/* Language Toggle */}
                            <div className="relative">
                                <select
                                    value={language}
                                    onChange={(e) =>
                                        setLanguage(e.target.value)
                                    }
                                    className="appearance-none bg-transparent border border-gray-300 rounded-2xl px-4 py-2 pr-8 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="en">English</option>
                                    <option value="hi">हिन्दी</option>
                                    <option value="mr">मराठी</option>
                                    <option value="ta">தமிழ்</option>
                                </select>
                                <Globe className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
                            </div>

                            {/* Notifications */}
                            <div className="relative">
                                <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
                                    <Bell className="w-6 h-6" />
                                    {unreadNotifications > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {unreadNotifications}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Chat */}
                            <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                                <MessageCircle className="w-6 h-6" />
                            </button>

                            {/* Profile */}
                            <div className="relative">
                                <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-blue-600 transition-colors">
                                    <User className="w-6 h-6" />
                                    <ChevronDown className="w-4 h-4" />
                                </button>
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
                <section className="mb-12">
                    <ServiceCategories />
                </section>

                {/* Ongoing Bookings */}
                <section className="mb-12">
                    <OngoingBookings bookings={activeBookings} />
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
