// controllers/adminController.js
import User from "../models/user.model.js"
import { Booking } from '../models/booking.model.js';
import { WorkerEarnings } from '../models/workerEarnings.model.js';
import ServiceAgent from '../models/serviceAgent.model.js';
import { WorkerPayment } from '../models/workerPayment.model.js';
import { Skill } from '../models/skill.model.js';

export const getDashboardStats = async (req, res) => {
    try {
        const { range = 'monthly' } = req.query;

        // Calculate date ranges
        const dateRange = calculateDateRange(range);

        // Get total users count by role
        const userCounts = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalUsers = userCounts.reduce((sum, role) => sum + role.count, 0);

        // Get booking statistics
        const bookingStats = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: dateRange.start }
                }
            },
            {
                $group: {
                    _id: null,
                    totalBookings: { $sum: 1 },
                    totalRevenue: { $sum: '$price' },
                    completedBookings: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        // Get pending verifications
        const pendingVerifications = await User.countDocuments({
            'workerProfile.verification.status': 'PENDING'
        });

        // Get active workers
        const activeWorkers = await User.countDocuments({
            role: 'WORKER',
            'workerProfile.availabilityStatus': 'available'
        });

        // Get previous period stats for comparison
        const prevDateRange = calculateDateRange(range, true);
        const prevBookingStats = await Booking.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: prevDateRange.start,
                        $lt: dateRange.start
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalBookings: { $sum: 1 },
                    totalRevenue: { $sum: '$price' }
                }
            }
        ]);

        const prevUserStats = await User.countDocuments({
            createdAt: {
                $gte: prevDateRange.start,
                $lt: dateRange.start
            }
        });

        const stats = {
            totalUsers,
            totalBookings: bookingStats[0]?.totalBookings || 0,
            totalRevenue: bookingStats[0]?.totalRevenue || 0,
            pendingVerifications,
            activeWorkers,
            userDistribution: userCounts.reduce((acc, role) => {
                acc[role._id] = role.count;
                return acc;
            }, {}),
            comparison: {
                users: calculatePercentageChange(prevUserStats, totalUsers),
                bookings: calculatePercentageChange(
                    prevBookingStats[0]?.totalBookings || 0,
                    bookingStats[0]?.totalBookings || 0
                ),
                revenue: calculatePercentageChange(
                    prevBookingStats[0]?.totalRevenue || 0,
                    bookingStats[0]?.totalRevenue || 0
                )
            }
        };

        res.json(stats);
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
};

export const getUserDistribution = async (req, res) => {
    try {
        const userDistribution = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    role: '$_id',
                    count: 1,
                    _id: 0
                }
            }
        ]);

        res.json(userDistribution);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user distribution' });
    }
};

export const getBookingAnalytics = async (req, res) => {
    try {
        const { range = 'monthly' } = req.query;
        const dateRange = calculateDateRange(range);

        const bookingStatus = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: dateRange.start }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Monthly revenue trend
        const revenueTrend = await Booking.aggregate([
            {
                $match: {
                    status: 'COMPLETED',
                    createdAt: { $gte: dateRange.start }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$price' },
                    bookings: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        res.json({
            bookingStatus,
            revenueTrend
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch booking analytics' });
    }
};

export const getVerificationStats = async (req, res) => {
    try {
        const verificationStats = await User.aggregate([
            {
                $match: { role: 'WORKER' }
            },
            {
                $group: {
                    _id: '$workerProfile.verification.status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Recent verification activities
        const recentVerifications = await User.aggregate([
            {
                $match: {
                    role: 'WORKER',
                    'workerProfile.verification.status': { $exists: true }
                }
            },
            {
                $project: {
                    name: 1,
                    'workerProfile.verification.status': 1,
                    'workerProfile.verification.verifiedAt': 1,
                    updatedAt: 1
                }
            },
            {
                $sort: { updatedAt: -1 }
            },
            {
                $limit: 10
            }
        ]);

        res.json({
            verificationStats,
            recentVerifications
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch verification stats' });
    }
};

export const getAgentPerformance = async (req, res) => {
    try {
        const agentPerformance = await ServiceAgent.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: '$userDetails'
            },
            {
                $project: {
                    name: '$userDetails.name',
                    completedVerifications: 1,
                    pendingVerifications: 1,
                    totalWorkersHandled: 1,
                    performanceScore: 1,
                    status: 1
                }
            },
            {
                $sort: { performanceScore: -1 }
            },
            {
                $limit: 10
            }
        ]);

        res.json(agentPerformance);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch agent performance' });
    }
};

export const getRecentActivities = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        // Recent bookings
        const recentBookings = await Booking.find()
            .populate('customerId', 'name')
            .populate('workerId', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        // Recent user registrations
        const recentUsers = await User.find()
            .select('name role createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        // Recent payments
        const recentPayments = await WorkerPayment.find()
            .populate('workerId', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            recentBookings,
            recentUsers,
            recentPayments
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch recent activities' });
    }
};
export const generateExcelReport = async (req, res) => {

    try {
        const { timeRange, reportType } = req.query;

        // Generate Excel file using libraries like exceljs
        const workbook = await generateExcelReport(timeRange, reportType);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=dashboard-report.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate report' });
    }
}
export const generatePDFReport = async (req, res) => {
    try {
      const { timeRange = 'monthly' } = req.query;
      
      // Create a PDF document
      const doc = new PDFDocument({ margin: 50 });
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=dashboard-report-${timeRange}-${Date.now()}.pdf`);
      
      // Pipe the PDF to response
      doc.pipe(res);
  
      // Fetch data for the report
      const [
        userDistribution,
        bookingStats,
        revenueData,
        verificationStats,
        agentPerformance,
        recentBookings
      ] = await Promise.all([
        getUserDistribution(),
        getBookingStats(timeRange),
        getRevenueData(timeRange),
        getVerificationStats(),
        getAgentPerformance(),
        getRecentBookings(10)
      ]);
  
      // Add cover page
      addCoverPage(doc, timeRange);
      
      // Add table of contents
      addTableOfContents(doc);
      
      // Add executive summary
      addExecutiveSummary(doc, userDistribution, bookingStats, revenueData);
      
      // Add user analytics
      addUserAnalytics(doc, userDistribution);
      
      // Add booking analytics
      addBookingAnalytics(doc, bookingStats, recentBookings);
      
      // Add financial summary
      addFinancialSummary(doc, revenueData);
      
      // Add verification status
      addVerificationStatus(doc, verificationStats);
      
      // Add agent performance
      addAgentPerformance(doc, agentPerformance);
      
      // Finalize the PDF
      doc.end();
  
    } catch (error) {
      console.error('Error generating PDF report:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to generate PDF report' 
      });
    }
  };
  

  

// Helper functions
function calculateDateRange(range, previous = false) {
    const now = new Date();
    let start, end = now;

    switch (range) {
        case 'weekly':
            start = new Date(now);
            start.setDate(now.getDate() - (previous ? 14 : 7));
            if (previous) {
                end = new Date(now);
                end.setDate(now.getDate() - 7);
            }
            break;
        case 'monthly':
            start = new Date(now.getFullYear(), now.getMonth() - (previous ? 2 : 1), 1);
            if (previous) {
                end = new Date(now.getFullYear(), now.getMonth() - 1, 0);
            }
            break;
        case 'quarterly':
            start = new Date(now.getFullYear(), now.getMonth() - (previous ? 6 : 3), 1);
            if (previous) {
                end = new Date(now.getFullYear(), now.getMonth() - 3, 0);
            }
            break;
        case 'yearly':
            start = new Date(now.getFullYear() - (previous ? 2 : 1), 0, 1);
            if (previous) {
                end = new Date(now.getFullYear() - 1, 11, 31);
            }
            break;
        default:
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    }

    return { start, end };
}

function calculatePercentageChange(previous, current) {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
}