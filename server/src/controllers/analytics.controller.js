// controllers/analytics.controller.js
import mongoose from 'mongoose';
import User from '../models/user.model.js';
import { Booking } from '../models/booking.model.js';
import { WorkerEarnings } from '../models/workerEarnings.model.js';
import { WorkerPayment } from '../models/workerPayment.model.js';
import { WorkerService } from '../models/workerService.model.js';

// Real-time analytics cache
const analyticsCache = new Map();
const CACHE_DURATION = 30000; // 30 seconds

export const getAdminAnalytics = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        
        // Check cache first
        const cacheKey = `analytics_${period}`;
        const cachedData = analyticsCache.get(cacheKey);
        
        if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
            return res.status(200).json({
                success: true,
                data: cachedData.data,
                cached: true
            });
        }
        
        const dateRange = getDateRange(period);
        
        const [
            userStats,
            bookingStats,
            financialStats,
            performanceStats,
            geographicalStats,
            engagementStats,
            workerAnalytics,
            revenueTrend,
            userGrowth,
            liveStats
        ] = await Promise.all([
            getUserAnalytics(dateRange),
            getBookingAnalytics(dateRange),
            getFinancialAnalytics(dateRange),
            getPerformanceAnalytics(dateRange),
            getGeographicalAnalytics(),
            getEngagementAnalytics(dateRange),
            getWorkerAnalytics(),
            getRevenueTrend(period),
            getUserGrowth(period),
            getLiveStats()
        ]);

        const analyticsData = {
            userStats,
            bookingStats,
            financialStats,
            performanceStats,
            geographicalStats,
            engagementStats,
            workerAnalytics,
            revenueTrend,
            userGrowth,
            liveStats,
            period,
            lastUpdated: new Date()
        };

        // Update cache
        analyticsCache.set(cacheKey, {
            data: analyticsData,
            timestamp: Date.now()
        });

        res.status(200).json({
            success: true,
            data: analyticsData
        });

    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics data',
            error: error.message
        });
    }
};

// Real-time stats
const getLiveStats = async () => {
    // Active users in last 15 minutes
    const activeUsers = await User.countDocuments({
        lastActive: { $gte: new Date(Date.now() - 15 * 60 * 1000) }
    });

    // Bookings created in last hour
    const recentBookings = await Booking.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
    });

    // Currently pending bookings
    const pendingBookings = await Booking.countDocuments({
        status: 'PENDING'
    });

    return {
        activeUsers,
        recentBookings,
        pendingBookings,
        lastUpdated: new Date()
    };
};

// WebSocket event handlers
export const setupAnalyticsWebSocket = (io) => {
    // Emit analytics updates periodically
    setInterval(async () => {
        try {
            const liveStats = await getLiveStats();
            io.emit('analyticsUpdate', { liveStats });
        } catch (error) {
            console.error('Error emitting analytics update:', error);
        }
    }, 30000); // Every 30 seconds

    // Listen for real-time events
    io.on('connection', (socket) => {
        console.log('Client connected to analytics:', socket.id);

        socket.on('subscribeToAnalytics', (period) => {
            socket.join(`analytics_${period}`);
        });

        socket.on('unsubscribeFromAnalytics', (period) => {
            socket.leave(`analytics_${period}`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected from analytics:', socket.id);
        });
    });
};

// Invalidate cache when data changes
export const invalidateAnalyticsCache = (period = null) => {
    if (period) {
        analyticsCache.delete(`analytics_${period}`);
    } else {
        analyticsCache.clear();
    }
};

// Enhanced booking creation with real-time updates
export const createBookingWithRealTime = async (bookingData, io) => {
    try {
        const booking = new Booking(bookingData);
        await booking.save();

        // Emit real-time event
        io.emit('newBooking', booking);

        // Invalidate cache
        invalidateAnalyticsCache();

        return booking;
    } catch (error) {
        throw error;
    }
};

// Enhanced user registration with real-time updates
export const createUserWithRealTime = async (userData, io) => {
    try {
        const user = new User(userData);
        await user.save();

        // Emit real-time event
        io.emit('userRegistered', user);

        // Invalidate cache
        invalidateAnalyticsCache();

        return user;
    } catch (error) {
        throw error;
    }
};

// Enhanced booking completion with real-time updates
export const completeBookingWithRealTime = async (bookingId, io) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            { 
                status: 'COMPLETED',
                completedAt: new Date()
            },
            { new: true }
        ).populate('customerId workerId');

        if (booking) {
            // Emit real-time event
            io.emit('bookingCompleted', booking);

            // Invalidate cache
            invalidateAnalyticsCache();
        }

        return booking;
    } catch (error) {
        throw error;
    }
};

const getDateRange = (period) => {
    const end = new Date();
    let start = new Date();
    if (period === 'weekly') {
        start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'quarterly') {
        start = new Date(end);
        start.setMonth(start.getMonth() - 3);
    } else if (period === 'yearly') {
        start = new Date(end);
        start.setFullYear(start.getFullYear() - 1);
    } else {
        start = new Date(end.getFullYear(), end.getMonth(), 1);
    }
    return { start, end };
};

const getUserAnalytics = async ({ start, end }) => {
    const total = await User.countDocuments({ createdAt: { $lte: end } });
    const customers = await User.countDocuments({ role: 'CUSTOMER' });
    const workers = await User.countDocuments({ role: 'WORKER' });
    const admins = await User.countDocuments({ role: 'ADMIN' });
    const active = await User.countDocuments({ lastActive: { $gte: new Date(Date.now() - 15 * 60 * 1000) } });
    return { total, customers, workers, admins, active, growth: 0 };
};

const getBookingAnalytics = async ({ start, end }) => {
    const match = { createdAt: { $gte: start, $lte: end } };
    const total = await Booking.countDocuments(match);
    const completed = await Booking.countDocuments({ ...match, status: 'COMPLETED' });
    const pending = await Booking.countDocuments({ ...match, status: 'PENDING' });
    const cancelled = await Booking.countDocuments({ ...match, status: 'CANCELLED' });
    const revAgg = await Booking.aggregate([
        { $match: { ...match, status: 'COMPLETED' } },
        { $group: { _id: null, amt: { $sum: { $ifNull: ['$payment.amount', '$price'] } } } }
    ]);
    const revenue = revAgg[0]?.amt || 0;
    return { total, completed, pending, cancelled, revenue, growth: 0 };
};

const getFinancialAnalytics = async ({ start, end }) => {
    const revAgg = await Booking.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end }, status: 'COMPLETED' } },
        { $group: { _id: null, amt: { $sum: { $ifNull: ['$payment.amount', '$price'] } } } }
    ]);
    const totalRevenue = revAgg[0]?.amt || 0;
    const commission = Math.round(totalRevenue * 0.15);
    const pendingAgg = await Booking.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end }, status: 'PAYMENT_PENDING' } },
        { $group: { _id: null, amt: { $sum: { $ifNull: ['$payment.amount', '$price'] } } } }
    ]);
    const pendingPayouts = pendingAgg[0]?.amt || 0;
    return { totalRevenue, commission, pendingPayouts, growth: 0 };
};

const getPerformanceAnalytics = async ({ start, end }) => {
    const total = await Booking.countDocuments({ createdAt: { $gte: start, $lte: end } });
    const completed = await Booking.countDocuments({ createdAt: { $gte: start, $lte: end }, status: 'COMPLETED' });
    const completionRate = total ? Number(((completed / total) * 100).toFixed(1)) : 0;
    const avgRatingAgg = await Booking.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end }, rating: { $exists: true } } },
        { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);
    const avgRating = Number((avgRatingAgg[0]?.avg || 0).toFixed(1));
    const responseTime = 0;
    const satisfactionScore = avgRating ? Number(((avgRating / 5) * 100).toFixed(1)) : 0;
    return { completionRate, avgRating, responseTime, satisfactionScore };
};

const getGeographicalAnalytics = async () => {
    const byState = await User.aggregate([
        { $match: { role: 'CUSTOMER', 'address.state': { $exists: true } } },
        { $group: { _id: '$address.state', users: { $sum: 1 } } },
        { $sort: { users: -1 } },
        { $limit: 10 }
    ]);
    const states = byState.map(s => ({ state: s._id, users: s.users }));
    return { states, totalAmount: 0, easternAustralia: 0 };
};

const getEngagementAnalytics = async ({ start, end }) => {
    const openedRequests = await Booking.countDocuments({ createdAt: { $gte: start, $lte: end } });
    const engaged = await Booking.countDocuments({ createdAt: { $gte: start, $lte: end }, status: 'PENDING' });
    const eoiSent = 0;
    const converted = await Booking.countDocuments({ createdAt: { $gte: start, $lte: end }, status: 'COMPLETED' });
    return { openedRequests, engaged, eoiSent, converted };
};

const getWorkerAnalytics = async () => {
    const totalWorkers = await User.countDocuments({ role: 'WORKER' });
    const verifiedWorkers = await User.countDocuments({ role: 'WORKER', 'workerProfile.verification.status': 'APPROVED' });
    const activeWorkers = await User.countDocuments({ role: 'WORKER', isActive: true });
    const suspendedWorkers = await User.countDocuments({ role: 'WORKER', 'workerProfile.isSuspended': true });
    const workerServices = await WorkerService.countDocuments({});
    const verificationRate = totalWorkers ? Number(((verifiedWorkers / totalWorkers) * 100).toFixed(1)) : 0;
    return { totalWorkers, verifiedWorkers, activeWorkers, suspendedWorkers, workerServices, verificationRate };
};

const getRevenueTrend = async (period) => {
    const end = new Date();
    const points = 6;
    const labels = [];
    for (let i = points - 1; i >= 0; i--) {
        const d = new Date(end);
        d.setMonth(d.getMonth() - i);
        labels.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
    }
    const agg = await Booking.aggregate([
        {
            $match: { status: 'COMPLETED', completedAt: { $exists: true } }
        },
        {
            $group: {
                _id: { year: { $year: '$completedAt' }, month: { $month: '$completedAt' } },
                amount: { $sum: { $ifNull: ['$payment.amount', '$price'] } }
            }
        }
    ]);
    const map = new Map();
    agg.forEach(row => {
        map.set(`${row._id.year}-${row._id.month}`, row.amount);
    });
    const trend = labels.map(l => {
        const key = `${l.year}-${l.month}`;
        const amount = map.get(key) || 0;
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return { label: monthNames[l.month - 1], month: monthNames[l.month - 1], amount };
    });
    return trend;
};

const getUserGrowth = async (period) => {
    const end = new Date();
    const points = 6;
    const labels = [];
    for (let i = points - 1; i >= 0; i--) {
        const d = new Date(end);
        d.setMonth(d.getMonth() - i);
        labels.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
    }
    const agg = await User.aggregate([
        { $match: { createdAt: { $exists: true } } },
        { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, users: { $sum: 1 } } }
    ]);
    const map = new Map();
    agg.forEach(row => {
        map.set(`${row._id.year}-${row._id.month}`, row.users);
    });
    const growth = labels.map(l => {
        const key = `${l.year}-${l.month}`;
        const users = map.get(key) || 0;
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return { month: monthNames[l.month - 1], users };
    });
    return growth;
};
