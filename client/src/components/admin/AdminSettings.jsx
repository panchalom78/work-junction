import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { useAuthStore } from '../../store/auth.store';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Save,
    Menu
} from 'lucide-react';

// --- MOBILE NAVIGATION ---
const MobileNav = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="lg:hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg bg-white border border-gray-200 shadow-sm"
            >
                <Menu className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="absolute top-16 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg z-40">
                    <div className="p-4 space-y-2">
                        <button className="w-full text-left p-3 rounded-lg bg-blue-50 text-blue-700 font-medium">
                            Profile Settings
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- PROFILE SETTINGS COMPONENT ---
const ProfileSettings = ({ user, profileForm, setProfileForm, profileLoading, handleProfileSubmit, handleProfileChange }) => {
    const profileCompletion = useMemo(() => {
        const fields = [
            profileForm.name,
            profileForm.phone,
            profileForm.address.houseNo,
            profileForm.address.city,
            profileForm.address.pincode,
        ];
        const filled = fields.filter(Boolean).length;
        return Math.round((filled / fields.length) * 100);
    }, [profileForm]);

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900">Profile Information</h2>
                    <p className="text-xs sm:text-sm text-gray-500">Update your personal details here.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                        {profileCompletion}% complete
                    </div>
                    <button
                        onClick={handleProfileSubmit}
                        disabled={profileLoading}
                        className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm font-medium transition-all shadow-sm hover:shadow active:scale-95"
                    >
                        {profileLoading ? (
                            <>
                                <span className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>Save profile</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="p-4 sm:p-6">
                <form onSubmit={handleProfileSubmit} className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                            <label className="text-xs sm:text-sm font-medium text-gray-700">Full Name</label>
                            <div className="relative">
                                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                <input
                                    type="text"
                                    name="name"
                                    value={profileForm.name}
                                    onChange={handleProfileChange}
                                    required
                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs sm:text-sm font-medium text-gray-700">Phone Number</label>
                            <div className="relative">
                                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={profileForm.phone}
                                    onChange={handleProfileChange}
                                    maxLength={10}
                                    required
                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                    placeholder="1234567890"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs sm:text-sm font-medium text-gray-700">Email Address</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                <input
                                    type="email"
                                    value={profileForm.email}
                                    disabled
                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs sm:text-sm font-medium text-gray-700">City</label>
                            <div className="relative">
                                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                                <input
                                    type="text"
                                    name="address.city"
                                    value={profileForm.address.city}
                                    onChange={handleProfileChange}
                                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-2">
                        <div className="space-y-2">
                            <label className="text-xs sm:text-sm font-medium text-gray-700">House / Door No.</label>
                            <input
                                type="text"
                                name="address.houseNo"
                                value={profileForm.address.houseNo}
                                onChange={handleProfileChange}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs sm:text-sm font-medium text-gray-700">Street / Area</label>
                            <input
                                type="text"
                                name="address.street"
                                value={profileForm.address.street}
                                onChange={handleProfileChange}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs sm:text-sm font-medium text-gray-700">Pincode</label>
                            <input
                                type="text"
                                name="address.pincode"
                                value={profileForm.address.pincode}
                                onChange={handleProfileChange}
                                maxLength={6}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const AdminSettingsContent = () => {
    const { user, getUser } = useAuthStore();

    const [profileForm, setProfileForm] = useState({
        name: '',
        email: '',
        phone: '',
        address: {
            houseNo: '',
            street: '',
            area: '',
            city: '',
            state: '',
            pincode: '',
        },
    });
    const [profileLoading, setProfileLoading] = useState(false);

    const hydrateForm = (sourceUser) => {
        if (!sourceUser) return;
        setProfileForm({
            name: sourceUser.name || '',
            email: sourceUser.email || '',
            phone: sourceUser.phone || '',
            address: {
                houseNo: sourceUser.address?.houseNo || '',
                street: sourceUser.address?.street || '',
                area: sourceUser.address?.area || '',
                city: sourceUser.address?.city || '',
                state: sourceUser.address?.state || '',
                pincode: sourceUser.address?.pincode || '',
            },
        });
    };

    useEffect(() => {
        if (user) {
            hydrateForm(user);
            return;
        }

        const fetchUser = async () => {
            const response = await getUser();
            if (response?.user) {
                hydrateForm(response.user);
            }
        };
        fetchUser();
    }, [user]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const key = name.split('.')[1];
            setProfileForm((prev) => ({
                ...prev,
                address: {
                    ...prev.address,
                    [key]: value,
                },
            }));
            return;
        }

        setProfileForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        try {
            await axiosInstance.put('/api/admin/profile', {
                name: profileForm.name,
                phone: profileForm.phone,
                address: profileForm.address,
            });
            await getUser();
            toast.success('Profile updated successfully');
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update profile';
            toast.error(message);
        } finally {
            setProfileLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3">
                        <MobileNav />
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Admin Settings</h1>
                            <p className="mt-1 text-xs sm:text-sm text-gray-600">
                                Manage your profile information
                            </p>
                        </div>
                    </div>
                </div>

                {/* KPI / Overview Cards - Only Profile Health remains */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {/* Profile Health */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                {useMemo(() => {
                                    const fields = [
                                        profileForm.name,
                                        profileForm.phone,
                                        profileForm.address.houseNo,
                                        profileForm.address.city,
                                        profileForm.address.pincode,
                                    ];
                                    const filled = fields.filter(Boolean).length;
                                    return Math.round((filled / fields.length) * 100);
                                }, [profileForm])}%
                            </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-semibold mt-3 sm:mt-4 text-gray-900">Profile health</h3>
                        <p className="text-xs text-gray-500 mt-1">Completion rate for better auditing</p>
                        <div className="mt-3 sm:mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                style={{ width: `${useMemo(() => {
                                    const fields = [
                                        profileForm.name,
                                        profileForm.phone,
                                        profileForm.address.houseNo,
                                        profileForm.address.city,
                                        profileForm.address.pincode,
                                    ];
                                    const filled = fields.filter(Boolean).length;
                                    return Math.round((filled / fields.length) * 100);
                                }, [profileForm])}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
                    {/* Profile Section */}
                    <div className="xl:col-span-3">
                        <ProfileSettings
                            user={user}
                            profileForm={profileForm}
                            setProfileForm={setProfileForm}
                            profileLoading={profileLoading}
                            handleProfileSubmit={handleProfileSubmit}
                            handleProfileChange={handleProfileChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettingsContent;