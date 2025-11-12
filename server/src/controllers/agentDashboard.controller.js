// controllers/agentDashboardController.js
import User from '../models/user.model.js';
import{ Booking} from '../models/booking.model.js'
import ServiceAgent from '../models/serviceAgent.model.js';

export const getAgentDashboardStats = async (req, res) => {
  try {
    const agentId = req.user.id;

    // Get agent profile
    const agent = await User.findById(agentId).populate('serviceAgentProfile');
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Get service agent details
    const serviceAgent = await ServiceAgent.findOne({ userId: agentId });
    if (!serviceAgent) {
      return res.status(404).json({ error: 'Service agent profile not found' });
    }

    // Get workers created by this agent
    const workers = await User.find({
      'workerProfile.createdBy': agentId
    });

    const totalWorkers = workers.length;
    const activeWorkers = workers.filter(worker => 
      worker.workerProfile?.availabilityStatus === 'available'
    ).length;

    // Get non-smartphone workers (you might need additional field for this)
   const nonSmartphoneWorkers = workers.filter(
  (worker) => worker.workerProfile?.createdByAgent === true
).length;

    // Get bookings for workers managed by this agent
    const workerIds = workers.map(worker => worker._id);
    const bookings = await Booking.find({
      workerId: { $in: workerIds }
    });

    const totalRequests = bookings.length;
    const pendingRequests = bookings.filter(booking => 
      booking.status === 'PENDING'
    ).length;
    const completedRequests = bookings.filter(booking => 
      booking.status === 'COMPLETED'
    ).length;

    // Calculate monthly earnings (current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate.getMonth() === currentMonth && 
             bookingDate.getFullYear() === currentYear &&
             booking.status === 'COMPLETED';
    });

    const monthlyEarnings = monthlyBookings.reduce((total, booking) => {
      return total + (booking.payment?.amount || booking.price || 0);
    }, 0);

    // Calculate average rating
    const completedBookingsWithReview = bookings.filter(booking => 
      booking.status === 'COMPLETED' && booking.review
    );

    const customerRating = completedBookingsWithReview.length > 0
      ? completedBookingsWithReview.reduce((total, booking) => 
          total + booking.review.rating, 0) / completedBookingsWithReview.length
      : 0;

    const stats = {
      totalWorkers,
      activeWorkers,
      nonSmartphoneWorkers,
      totalRequests,
      pendingRequests,
      completedRequests,
      monthlyEarnings,
      customerRating: parseFloat(customerRating.toFixed(1))
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching agent dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAgentProfile = async (req, res) => {
  try {
    const agentId = req.user.id;

    const agent = await User.findById(agentId);
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const serviceAgent = await ServiceAgent.findOne({ userId: agentId });

    // Calculate performance metrics
    const workers = await User.find({ 'workerProfile.createdBy': agentId });
    const workerIds = workers.map(worker => worker._id);
    
    const bookings = await Booking.find({
      workerId: { $in: workerIds }
    });

    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
    const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

    // Calculate average response time (in minutes)
    // This would require tracking when requests were assigned and when agent responded
    const responseTime = 15; // Mock data - implement based on your business logic

    // Calculate customer satisfaction from reviews
    const reviews = bookings
      .filter(b => b.review)
      .map(b => b.review.rating);
    
    const customerSatisfaction = reviews.length > 0
      ? reviews.reduce((a, b) => a + b, 0) / reviews.length
      : 4.5; // Default value

    const agentProfile = {
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      profileImage: '', // Add profile image field to your user model if needed
      area: serviceAgent?.areasAssigned?.[0] || 'Not assigned',
      joinDate: agent.createdAt,
      performance: {
        completionRate: parseFloat(completionRate.toFixed(1)),
        responseTime: Math.round(responseTime),
        customerSatisfaction: parseFloat(customerSatisfaction.toFixed(1))
      }
    };

    res.json(agentProfile);
  } catch (error) {
    console.error('Error fetching agent profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    const agentId = req.user.id;

    // Get workers created by this agent
    const workers = await User.find({ 'workerProfile.createdBy': agentId });
    const workerIds = workers.map(worker => worker._id);

    // Get recent bookings for these workers
    const recentBookings = await Booking.find({
      workerId: { $in: workerIds }
    })
    .populate('customerId', 'name')
    .populate('workerId', 'name')
    .sort({ createdAt: -1 })
    .limit(10);

    const activities = recentBookings.map(booking => {
      let type, message, status;

      switch (booking.status) {
        case 'PENDING':
          type = 'new_request';
          message = `New ${getServiceType(booking)} request from ${booking.customerId?.name}`;
          status = 'pending';
          break;
        case 'ACCEPTED':
          type = 'assignment';
          message = `Assigned ${getServiceType(booking)} to ${booking.customerId?.name}`;
          status = 'completed';
          break;
        case 'COMPLETED':
          type = 'completion';
          message = `${getServiceType(booking)} completed for ${booking.customerId?.name}`;
          status = 'completed';
          break;
        case 'CANCELLED':
          type = 'cancellation';
          message = `${getServiceType(booking)} cancelled by ${booking.customerId?.name}`;
          status = 'completed';
          break;
        default:
          type = 'assignment';
          message = `Service update for ${booking.customerId?.name}`;
          status = 'pending';
      }

      return {
        id: booking._id,
        type,
        message,
        time: getTimeAgo(booking.createdAt),
        status
      };
    });

    res.json(activities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAgentProfile = async (req, res) => {
  try {
    const agentId = req.user.id;
    const { name, email, phone, area } = req.body;

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      agentId,
      { 
        name,
        email: email.toLowerCase(),
        phone
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Update service agent area if provided
    if (area) {
      await ServiceAgent.findOneAndUpdate(
        { userId: agentId },
        { 
          $set: { 
            areasAssigned: [area],
            contactEmail: email,
            contactPhone: phone
          }
        }
      );
    }

    res.json({
      message: 'Profile updated successfully',
      profile: {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        area
      }
    });
  } catch (error) {
    console.error('Error updating agent profile:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getWorkerDistribution = async (req, res) => {
  try {
    const agentId = req.user.id;

    const workers = await User.find({ 
      'workerProfile.createdBy': agentId 
    }).populate('workerProfile.skills.skillId');

    // Count workers by skill type
    const skillDistribution = {};
    workers.forEach(worker => {
      worker.workerProfile?.skills?.forEach(skill => {
        const skillName = skill.skillId?.name || 'Unknown';
        skillDistribution[skillName] = (skillDistribution[skillName] || 0) + 1;
      });
    });

    // Calculate smartphone vs non-smartphone distribution
    const smartphoneWorkers = workers.filter(worker => 
      worker.phone && worker.phone.length === 10
    ).length;
    
    const nonSmartphoneWorkers = workers.length - smartphoneWorkers;

    const distribution = {
      smartphoneUsers: {
        percentage: workers.length > 0 ? (smartphoneWorkers / workers.length) * 100 : 0,
        count: smartphoneWorkers
      },
      nonSmartphoneUsers: {
        percentage: workers.length > 0 ? (nonSmartphoneWorkers / workers.length) * 100 : 0,
        count: nonSmartphoneWorkers
      },
      bySkill: skillDistribution
    };

    res.json(distribution);
  } catch (error) {
    console.error('Error fetching worker distribution:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getEarningsOverview = async (req, res) => {
  try {
    const agentId = req.user.id;
    const { period = 'month' } = req.query;

    const workers = await User.find({ 'workerProfile.createdBy': agentId });
    const workerIds = workers.map(worker => worker._id);

    const bookings = await Booking.find({
      workerId: { $in: workerIds },
      status: 'COMPLETED'
    });

    let earningsData = [];

    if (period === 'month') {
      // Group by weeks of current month
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const weeks = [];
      let currentWeekStart = new Date(firstDay);
      
      while (currentWeekStart <= lastDay) {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        if (weekEnd > lastDay) weekEnd = lastDay;
        
        weeks.push({
          start: new Date(currentWeekStart),
          end: weekEnd
        });
        
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      }

      earningsData = weeks.map((week, index) => {
        const weekBookings = bookings.filter(booking => {
          const bookingDate = new Date(booking.bookingDate);
          return bookingDate >= week.start && bookingDate <= week.end;
        });

        const amount = weekBookings.reduce((total, booking) => {
          return total + (booking.payment?.amount || booking.price || 0);
        }, 0);

        return {
          week: `Week ${index + 1}`,
          amount
        };
      });
    }

    res.json(earningsData);
  } catch (error) {
    console.error('Error fetching earnings overview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper functions
function getTimeAgo(date) {
  const now = new Date();
  const diffInMs = now - new Date(date);
  const diffInHours = diffInMs / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hours ago`;
  } else {
    return `${Math.floor(diffInHours / 24)} days ago`;
  }
}

function getServiceType(booking) {
  // This should be implemented based on your service categorization
  return 'service'; // Placeholder
}