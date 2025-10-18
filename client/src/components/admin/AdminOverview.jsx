import React, { useState, useEffect } from 'react';
import {
  Users, Clock, CheckCircle, DollarSign, TrendingUp,
  Shield, Calendar, MapPin, FileText, AlertCircle
} from 'lucide-react';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingVerifications: 0,
    activeBookings: 0,
    totalRevenue: 0
  });
  const [activities, setActivities] = useState([]);
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  // Generate dummy stats data
  const generateStats = () => {
    return {
      totalUsers: 1247,
      pendingVerifications: 23,
      activeBookings: 89,
      totalRevenue: 284500
    };
  };

  // Generate dummy activities data
  const generateActivities = () => {
    const activityTypes = [
      { type: 'verification', actions: ['submitted verification documents', 'completed profile verification'] },
      { type: 'booking', actions: ['created a new booking', 'completed a service booking'] },
      { type: 'payment', actions: ['processed payment for booking', 'received payment for service'] },
      { type: 'agent', actions: ['registered as service agent', 'updated agent profile'] }
    ];

    const users = ['John Smith', 'Emma Wilson', 'Mike Johnson', 'Sarah Brown', 'David Lee', 'Lisa Anderson', 'Robert Taylor', 'Maria Garcia'];

    return Array.from({ length: 8 }, (_, i) => {
      const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const action = activityType.actions[Math.floor(Math.random() * activityType.actions.length)];

      return {
        type: activityType.type,
        user: users[i],
        action: action,
        time: new Date(Date.now() - Math.floor(Math.random() * 24) * 60 * 60 * 1000).toISOString()
      };
    });
  };

  // Generate dummy verification queue data
  const generateVerificationQueue = () => {
    const services = ['Plumbing', 'Electrical', 'AC Repair', 'Carpentry', 'Cleaning', 'Painting', 'Appliance Repair'];
    const names = ['Raj Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Gupta', 'Vikram Singh', 'Anjali Mehta', 'Rahul Verma', 'Pooja Joshi'];
    const priorities = ['HIGH', 'MEDIUM', 'LOW'];

    return Array.from({ length: 6 }, (_, i) => ({
      name: names[i],
      service: services[Math.floor(Math.random() * services.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      submitted: new Date(Date.now() - Math.floor(Math.random() * 72) * 60 * 60 * 1000).toISOString()
    }));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Set dummy data
      setStats(generateStats());
      setActivities(generateActivities());
      setVerificationQueue(generateVerificationQueue());

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'verification': return <Shield className="w-5 h-5" />;
      case 'booking': return <Calendar className="w-5 h-5" />;
      case 'payment': return <DollarSign className="w-5 h-5" />;
      case 'agent': return <Users className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'verification': return 'bg-orange-100 text-orange-600';
      case 'booking': return 'bg-blue-100 text-blue-600';
      case 'payment': return 'bg-green-100 text-green-600';
      case 'agent': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-green-600">+12%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalUsers.toLocaleString()}</h3>
          <p className="text-gray-600 text-sm">Total Users</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-orange-600">+5%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.pendingVerifications}</h3>
          <p className="text-gray-600 text-sm">Pending Verifications</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-green-600">+18%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.activeBookings}</h3>
          <p className="text-gray-600 text-sm">Active Bookings</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-green-600">+23%</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(stats.totalRevenue)}</h3>
          <p className="text-gray-600 text-sm">Revenue</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.user}</p>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                </div>
                <span className="text-xs text-gray-500">{formatTimeAgo(activity.time)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Queue */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Verification Queue</h2>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {verificationQueue.map((worker, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${worker.priority === 'HIGH' ? 'bg-red-500' :
                      worker.priority === 'MEDIUM' ? 'bg-orange-500' : 'bg-green-500'
                    }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">{worker.name}</p>
                    <p className="text-sm text-gray-600">{worker.service}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">{formatTimeAgo(worker.submitted)}</span>
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors">
            + Load More
          </button>
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Platform Analytics</h2>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Weekly
            </button>
            <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Monthly
            </button>
          </div>
        </div>
        <div className="h-64 bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Analytics charts will be displayed here</p>
            <p className="text-sm text-gray-500">Integration with charting library required</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;