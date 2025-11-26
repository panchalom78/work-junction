import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Shield,
    Lock,
    Bell,
    Globe,
    Smartphone,
    Activity,
    Save,
    RefreshCw,
    CheckCircle,
    AlertTriangle,
    X,
    Check,
    Menu,
    Settings
} from 'lucide-react';

// --- MOCK TOAST SYSTEM (Replacing react-hot-toast for standalone preview) ---
const ToastContext = createContext(null);

const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 3000);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none max-w-sm w-full sm:max-w-md">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-center p-3 sm:p-4 rounded-lg shadow-lg text-white transform transition-all duration-300 ease-in-out translate-y-0 opacity-100 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                            }`}
                    >
                        {toast.type === 'success' ? (
                            <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                        ) : (
                            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                        )}
                        <span className="text-xs sm:text-sm font-medium flex-1 break-words">{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-2 sm:ml-4 opacity-80 hover:opacity-100 flex-shrink-0"
                        >
                            <X className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) return { success: console.log, error: console.error }; // Fallback
    return {
        success: (msg) => context.addToast(msg, 'success'),
        error: (msg) => context.addToast(msg, 'error'),
    };
};

// --- MOCK AUTH STORE & AXIOS (Simulating Backend) ---
const useAuthStore = () => {
    // Simulating a persistent user state for this demo
    const [user, setUser] = useState({
        name: 'Admin User',
        email: 'admin@system.com',
        phone: '5551234567',
        address: {
            houseNo: '42',
            street: 'Innovation Blvd',
            area: 'Tech District',
            city: 'San Francisco',
            state: 'CA',
            pincode: '94105',
        },
    });

    const updateProfile = async (newData) => {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
        setUser((prev) => ({ ...prev, ...newData }));
        return { data: { message: 'Success' } };
    };

    const getUser = async () => {
        return { user };
    };

    const logout = async () => {
        console.log('Logging out...');
    };

    return { user, updateProfile, getUser, logout };
};

const mockAxios = {
    put: async (url, data) => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        if (url.includes('change-password')) {
            return { data: { message: 'Password changed successfully' } };
        }
        throw new Error('Unknown endpoint');
    },
};

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
                        <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 text-gray-700">
                            Security
                        </button>
                        <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 text-gray-700">
                            Notifications
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- MAIN COMPONENT ---

const DEFAULT_NOTIFICATION_PREFS = {
    emailAlerts: true,
    smsAlerts: false,
    pushAlerts: true,
    weeklySummary: true,
    systemMaintenance: true,
};

const AdminSettingsContent = () => {
    const { user, updateProfile, getUser, logout } = useAuthStore();
    const toast = useToast();

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

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordLoading, setPasswordLoading] = useState(false);

    const [notifications, setNotifications] = useState(() => {
        try {
            const saved = localStorage.getItem('wj-admin-notifications');
            return saved
                ? { ...DEFAULT_NOTIFICATION_PREFS, ...JSON.parse(saved) }
                : DEFAULT_NOTIFICATION_PREFS;
        } catch {
            return DEFAULT_NOTIFICATION_PREFS;
        }
    });
    const [notificationSaving, setNotificationSaving] = useState(false);

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
    }, [user]); // Only run when user object changes

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
            await updateProfile({
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

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!passwordForm.currentPassword || !passwordForm.newPassword) {
            toast.error('Please fill in all password fields');
            return;
        }
        if (passwordForm.newPassword.length < 8) {
            toast.error('New password must be at least 8 characters');
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setPasswordLoading(true);
        try {
            // Using mockAxios here
            const response = await mockAxios.put('/api/auth/change-password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            toast.success(response.data?.message || 'Password changed.');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            // In a real app, you might force logout here
            // await logout();
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to change password';
            toast.error(message);
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleNotificationToggle = (key) => {
        setNotifications((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleNotificationSave = () => {
        setNotificationSaving(true);
        setTimeout(() => {
            localStorage.setItem('wj-admin-notifications', JSON.stringify(notifications));
            setNotificationSaving(false);
            toast.success('Notification preferences saved');
        }, 600);
    };

    const notificationOptions = [
        {
            key: 'emailAlerts',
            label: 'Critical email alerts',
            description: 'Security alerts, payout issues and policy changes',
            icon: Mail,
        },
        {
            key: 'smsAlerts',
            label: 'SMS notifications',
            description: 'Urgent booking escalations for offline scenarios',
            icon: Smartphone,
        },
        {
            key: 'pushAlerts',
            label: 'Browser push',
            description: 'Real-time dashboard notifications on desktop',
            icon: Bell,
        },
        {
            key: 'weeklySummary',
            label: 'Weekly report',
            description: 'Consolidated KPIs, disputes and health metrics',
            icon: Globe,
        },
        {
            key: 'systemMaintenance',
            label: 'Maintenance window alerts',
            description: 'Heads-up before planned downtime or releases',
            icon: Shield,
        },
    ];

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
                                Manage your profile, security and notification preferences
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => hydrateForm(user)}
                            className="px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors flex items-center text-xs sm:text-sm font-medium shadow-sm"
                        >
                            <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            Reset
                        </button>
                    </div>
                </div>

                {/* KPI / Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {/* Profile Health */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                {profileCompletion}%
                            </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-semibold mt-3 sm:mt-4 text-gray-900">Profile health</h3>
                        <p className="text-xs text-gray-500 mt-1">Completion rate for better auditing</p>
                        <div className="mt-3 sm:mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                style={{ width: `${profileCompletion}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Security Posture */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="p-2 rounded-lg bg-green-50 text-green-600">
                                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                        </div>
                        <h3 className="text-sm sm:text-base font-semibold mt-3 sm:mt-4 text-gray-900">Security posture</h3>
                        <p className="text-xs text-gray-500 mt-1">MFA enforced for admin accounts</p>
                    </div>

                    {/* Alert Coverage */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                        </div>
                        <h3 className="text-sm sm:text-base font-semibold mt-3 sm:mt-4 text-gray-900">Alert coverage</h3>
                        <p className="text-xs text-gray-500 mt-1">
                            {Object.values(notifications).filter(Boolean).length}/5 channels active
                        </p>
                    </div>

                    {/* Password Age */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                                <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                        </div>
                        <h3 className="text-sm sm:text-base font-semibold mt-3 sm:mt-4 text-gray-900">Password Age</h3>
                        <p className="text-xs text-gray-500 mt-1">Updated 12 days ago</p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
                    {/* Left Column: Profile (2 cols on XL) */}
                    <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-gray-900">Profile Information</h2>
                                <p className="text-xs sm:text-sm text-gray-500">Update your personal details here.</p>
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
                       
                    </div>
                </div>
            </div>
    );
};

// Wrap with ToastProvider for the demo
const AdminSettings = () => (
    <ToastProvider>
        <AdminSettingsContent />
    </ToastProvider>
);

export default AdminSettings;