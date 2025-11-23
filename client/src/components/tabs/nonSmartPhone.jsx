// components/NonSmartphoneWorkerDashboard.js
import React, { useState, useEffect, useMemo } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { format, subDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  Search,
  RefreshCw,
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Wrench,
  Trophy,
  Eye,
  IndianRupee,
  User,
  MapPin,
  AlertCircle,
  TrendingUp,
  FileText,
  Briefcase,
  ChevronRight,
  Bell,
  Activity,
  BarChart3,
  Home,
  Users,
  Settings,
  LogOut,
  Filter,
  MoreHorizontal,
  Star,
  Shield,
  CreditCard,
  Navigation
} from "lucide-react";

const NonSmartphoneWorkerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [worker, setWorker] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    completed: 0,
    today: 0
  });
  const [activeFilter, setActiveFilter] = useState("create");

  // Safe Date Formatter
  const safeFormat = (dateStr, fallback = "—") => {
    if (!dateStr) return fallback;
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? fallback : format(d, "dd MMM, yyyy");
    } catch {
      return fallback;
    }
  };

  // Safe Time Formatter
  const safeTimeFormat = (timeStr, fallback = "—") => {
    if (!timeStr) return fallback;
    return timeStr;
  };

  // Safe DateTime Formatter
  const safeDateTimeFormat = (dateStr, fallback = "—") => {
    if (!dateStr) return fallback;
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? fallback : format(d, "dd MMM, yyyy 'at' hh:mm a");
    } catch {
      return fallback;
    }
  };

  // FETCH WORKER PROFILE AND BOOKINGS
  const fetchWorkerData = async () => {
    try {
      setLoading(true);

      // Get worker profile
      const workerResponse = await axiosInstance.get("/api/service-agent/profile");
      if (workerResponse.data.success) {
        setWorker(workerResponse.data.data);
      }

      // Get worker bookings
      const bookingsResponse = await axiosInstance.get("/api/service-agent/bookings");
      if (bookingsResponse.data.success) {
        const bookingsData = bookingsResponse.data.data?.bookings || bookingsResponse.data.data || [];
        setBookings(bookingsData);

        // Calculate stats
        const today = new Date().toDateString();
        const todayBookings = bookingsData.filter(booking =>
          new Date(booking.bookingInfo?.date).toDateString() === today
        );

        setStats({
          total: bookingsData.length,
          pending: bookingsData.filter(b => b.status === 'PENDING').length,
          active: bookingsData.filter(b => b.status === 'ACCEPTED' || b.status === 'PAYMENT_PENDING').length,
          completed: bookingsData.filter(b => b.status === 'COMPLETED').length,
          today: todayBookings.length
        });

        // Generate recent activity
        generateRecentActivity(bookingsData);
      }
    } catch (error) {
      console.error("Fetch worker data error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // GENERATE RECENT ACTIVITY
  const generateRecentActivity = (bookingsData) => {
    const activity = [];

    bookingsData.slice(0, 10).forEach(booking => {
      // Booking created activity
      activity.push({
        id: `${booking._id}_created`,
        type: 'booking_created',
        title: 'New Booking Created',
        description: `Booking #${booking._id?.slice(-6)} for ${booking.serviceDetails?.serviceName || 'Service'}`,
        timestamp: booking.createdAt,
        bookingId: booking._id,
        status: booking.status
      });

      // Status change activities
      if (booking.timeline?.serviceInitiatedAt) {
        activity.push({
          id: `${booking._id}_accepted`,
          type: 'booking_accepted',
          title: 'Booking Accepted',
          description: `Accepted booking #${booking._id?.slice(-6)}`,
          timestamp: booking.timeline.serviceInitiatedAt,
          bookingId: booking._id,
          status: 'ACCEPTED'
        });
      }

      if (booking.timeline?.serviceStartedAt) {
        activity.push({
          id: `${booking._id}_started`,
          type: 'work_started',
          title: 'Work Started',
          description: `Started work on booking #${booking._id?.slice(-6)}`,
          timestamp: booking.timeline.serviceStartedAt,
          bookingId: booking._id,
          status: 'IN_PROGRESS'
        });
      }

      if (booking.timeline?.serviceCompletedAt) {
        activity.push({
          id: `${booking._id}_completed`,
          type: 'work_completed',
          title: 'Work Completed',
          description: `Completed booking #${booking._id?.slice(-6)}`,
          timestamp: booking.timeline.serviceCompletedAt,
          bookingId: booking._id,
          status: 'COMPLETED'
        });
      }
    });

    // Sort by timestamp (newest first) and take latest 8
    const sortedActivity = activity
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 8);

    setRecentActivity(sortedActivity);
  };

  // QUICK ACTIONS
  const handleQuickAction = async (booking, action) => {
    try {
      let status = action;
      let remarks = "";

      switch (action) {
        case "ACCEPTED":
          remarks = "Job accepted by worker";
          break;
        case "DECLINED":
          remarks = "Job declined by worker";
          break;
        case "PAYMENT_PENDING":
          remarks = "Work started";
          break;
        case "COMPLETED":
          remarks = "Work completed successfully";
          break;
      }

      const { data } = await axiosInstance.patch(
        `/api/worker/bookings/${booking._id}/status`,
        { status, remarks }
      );

      if (data.success) {
        toast.success(`Job ${action.toLowerCase().replace('_', ' ')}`);
        await fetchWorkerData();
      }
    } catch (error) {
      toast.error("Action failed");
    }
  };

  // NAVIGATE TO BOOKING DETAILS
  const handleViewBooking = (booking) => {
    navigate(`/worker/booking/${booking._id}`);
  };

  useEffect(() => {
    fetchWorkerData();
  }, []);

  // FILTER BOOKINGS BY STATUS
  const getBookingsByStatus = (status) => {
    if (!bookings.length) return [];

    switch (status) {
      case 'pending':
        return bookings.filter(b => b.status === 'PENDING');
      case 'active':
        return bookings.filter(b => b.status === 'ACCEPTED' || b.status === 'PAYMENT_PENDING');
      case 'completed':
        return bookings.filter(b => b.status === 'COMPLETED');
      case 'today':
        const today = new Date().toDateString();
        return bookings.filter(booking =>
          new Date(booking.bookingInfo?.date).toDateString() === today
        );
      default:
        return bookings;
    }
  };

  // STATS CARDS COMPONENT
  const StatsCards = () => (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* Total Bookings */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-gray-600 text-sm">Total Jobs</p>
          </div>
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Pending Bookings */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-gray-600 text-sm">Pending</p>
          </div>
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Active Bookings */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
            <p className="text-gray-600 text-sm">Active</p>
          </div>
          <div className="p-2 bg-blue-100 rounded-lg">
            <Briefcase className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Completed Bookings */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-gray-600 text-sm">Completed</p>
          </div>
          <div className="p-2 bg-green-100 rounded-lg">
            <Trophy className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Today's Bookings */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-purple-600">{stats.today}</p>
            <p className="text-gray-600 text-sm">Today</p>
          </div>
          <div className="p-2 bg-purple-100 rounded-lg">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );

  // QUICK ACTIONS COMPONENT
  const QuickActions = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-600" />
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveTab('today')}
          className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors text-center"
        >
          <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <p className="font-medium text-blue-700">Today's Jobs</p>
          <p className="text-blue-600 text-sm">{stats.today} jobs</p>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors text-center"
        >
          <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
          <p className="font-medium text-yellow-700">Pending</p>
          <p className="text-yellow-600 text-sm">{stats.pending} jobs</p>
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors text-center"
        >
          <Briefcase className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="font-medium text-green-700">Active</p>
          <p className="text-green-600 text-sm">{stats.active} jobs</p>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors text-center"
        >
          <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <p className="font-medium text-purple-700">Completed</p>
          <p className="text-purple-600 text-sm">{stats.completed} jobs</p>
        </button>
      </div>
    </div>
  );

  // RECENT ACTIVITY COMPONENT
  const RecentActivity = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Bell className="w-5 h-5 text-orange-600" />
        Recent Activity
      </h3>
      <div className="space-y-4">
        {recentActivity.map((activity, index) => (
          <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className={`p-2 rounded-full ${activity.type === 'booking_created' ? 'bg-blue-100' :
                activity.type === 'booking_accepted' ? 'bg-green-100' :
                  activity.type === 'work_started' ? 'bg-purple-100' :
                    'bg-orange-100'
              }`}>
              {activity.type === 'booking_created' && <FileText className="w-4 h-4 text-blue-600" />}
              {activity.type === 'booking_accepted' && <CheckCircle className="w-4 h-4 text-green-600" />}
              {activity.type === 'work_started' && <Wrench className="w-4 h-4 text-purple-600" />}
              {activity.type === 'work_completed' && <Trophy className="w-4 h-4 text-orange-600" />}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
              <p className="text-gray-600 text-xs">{activity.description}</p>
              <p className="text-gray-500 text-xs mt-1">
                {safeDateTimeFormat(activity.timestamp)}
              </p>
            </div>
            <button
              onClick={() => {
                const booking = bookings.find(b => b._id === activity.bookingId);
                if (booking) handleViewBooking(booking);
              }}
              className="text-blue-600 hover:text-blue-700 p-1"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        ))}

        {recentActivity.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );

  // BOOKING CARD COMPONENT
  const BookingCard = ({ booking }) => {
    const customer = booking.customer || {};
    const service = booking.serviceDetails || {};

    const getStatusIcon = (status) => {
      switch (status) {
        case 'PENDING': return <Clock className="w-4 h-4 text-yellow-600" />;
        case 'ACCEPTED': return <CheckCircle className="w-4 h-4 text-blue-600" />;
        case 'PAYMENT_PENDING': return <Wrench className="w-4 h-4 text-purple-600" />;
        case 'COMPLETED': return <Trophy className="w-4 h-4 text-green-600" />;
        default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
      }
    };

    const getActionButtons = () => {
      const actions = [];

      switch (booking.status) {
        case "PENDING":
          actions.push(
            {
              label: "Accept",
              color: "bg-green-600 hover:bg-green-700",
              action: "ACCEPTED",
              icon: <CheckCircle className="w-4 h-4" />
            },
            {
              label: "Decline",
              color: "bg-red-600 hover:bg-red-700",
              action: "DECLINED",
              icon: <XCircle className="w-4 h-4" />
            }
          );
          break;

        case "ACCEPTED":
          actions.push({
            label: "Start Work",
            color: "bg-blue-600 hover:bg-blue-700",
            action: "PAYMENT_PENDING",
            icon: <Wrench className="w-4 h-4" />
          });
          break;

        case "PAYMENT_PENDING":
          actions.push({
            label: "Complete",
            color: "bg-purple-600 hover:bg-purple-700",
            action: "COMPLETED",
            icon: <Trophy className="w-4 h-4" />
          });
          break;
      }

      return actions;
    };

    const actions = getActionButtons();

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {customer.name?.[0]?.toUpperCase() || "C"}
            </div>
            <div>
              <h4 className="font-bold text-gray-900">{customer.name || "—"}</h4>
              <p className="text-gray-600 text-sm flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {customer.phone || "—"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 mb-1">
              {getStatusIcon(booking.status)}
              <span className={`text-xs font-bold ${booking.status === "PENDING" ? "text-yellow-600" :
                  booking.status === "ACCEPTED" ? "text-blue-600" :
                    booking.status === "PAYMENT_PENDING" ? "text-purple-600" :
                      booking.status === "COMPLETED" ? "text-green-600" :
                        "text-red-600"
                }`}>
                {booking.status?.replace("_", " ")}
              </span>
            </div>
            <p className="text-gray-500 text-xs flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {safeFormat(booking.bookingInfo?.date)} • {safeTimeFormat(booking.bookingInfo?.time)}
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          {/* Service Details */}
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-900">{service.serviceName || "—"}</p>
              <p className="text-gray-600 text-sm">{service.skillName || "General Service"}</p>
            </div>
            <p className="font-bold text-green-600 text-lg flex items-center gap-1">
              <IndianRupee className="w-4 h-4" />
              {service.price || booking.price || 0}
            </p>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
            <div>
              <p className="text-gray-700 text-sm">
                {customer.address?.area || "—"}, {customer.address?.city || "—"}
              </p>
              <p className="text-gray-600 text-xs">
                {customer.address?.pincode || "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(booking, action.action)}
              className={`flex-1 py-2 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${action.color}`}
            >
              {action.icon} {action.label}
            </button>
          ))}
          <button
            onClick={() => handleViewBooking(booking)}
            className="flex-1 py-2 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 font-medium flex items-center justify-center gap-1"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          <a
            href={`tel:${customer.phone}`}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium flex items-center gap-1"
          >
            <Phone className="w-4 h-4" />
            Call
          </a>
        </div>
      </div>
    );
  };

  // BOOKINGS LIST COMPONENT
  const BookingsList = ({ status }) => {
    const filteredBookings = getBookingsByStatus(status);
    const titleMap = {
      overview: "All Bookings",
      pending: "Pending Requests",
      active: "Active Jobs",
      completed: "Completed Jobs",
      today: "Today's Schedule"
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            {titleMap[status] || "Bookings"}
            <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
              {filteredBookings.length}
            </span>
          </h2>
          <button
            onClick={fetchWorkerData}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {filteredBookings.length > 0 ? (
          <div className="grid gap-4">
            {filteredBookings.map(booking => (
              <BookingCard key={booking._id} booking={booking} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-900 font-medium text-lg">No bookings found</p>
            <p className="text-gray-600 text-sm mt-1">
              {status === 'today' ? "No bookings scheduled for today" :
                status === 'pending' ? "No pending requests" :
                  status === 'active' ? "No active jobs" :
                    status === 'completed' ? "No completed jobs" :
                      "No bookings available"}
            </p>
          </div>
        )}
      </div>
    );
  };

  // LOADING SKELETON
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-6 bg-gray-200 rounded w-8 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-4 bg-gray-100 rounded-lg">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-20 mx-auto mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {worker?.name?.[0]?.toUpperCase() || "W"}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Worker Dashboard</h1>
                <p className="text-gray-600 text-sm">Welcome back, {worker?.name || "Worker"}!</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchWorkerData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                <RefreshCw className="w-4 h-4" />

              </button>
              <button onClick={() => setActiveView('create')} className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-2 text-sm w-full sm:w-auto"             >               <i className="far fa-user-plus"></i>               <span>Add Worker</span>             </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'today', label: "Today's Jobs", icon: <Calendar className="w-4 h-4" /> },
              { id: 'pending', label: 'Pending', icon: <Clock className="w-4 h-4" /> },
              { id: 'active', label: 'Active', icon: <Briefcase className="w-4 h-4" /> },
              { id: 'completed', label: 'Completed', icon: <Trophy className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id !== 'overview' && (
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.id
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                    }`}>
                    {getBookingsByStatus(tab.id).length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' ? (
          <div className="space-y-6">
            <StatsCards />
            <QuickActions />
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <BookingsList status="overview" />
              </div>
              <div>
                <RecentActivity />
              </div>
            </div>
          </div>
        ) : (
          <BookingsList status={activeTab} />
        )}
      </main>
    </div>
  );
};

export default NonSmartphoneWorkerDashboard;