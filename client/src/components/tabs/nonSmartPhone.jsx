// components/NonSmartphoneWorkerDashboard.js
import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import {
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Wrench,
  Trophy,
  IndianRupee,
  User,
  MapPin,
  AlertCircle,
  FileText,
  Briefcase,
  ArrowRight,
  Bell,
  Activity,
  Users,
  Plus,
  ArrowLeft,
  X,
  Mail,
  CreditCard,
  RefreshCw,
  ToolCase,
  Award,
  PhoneCall,
  Clock4
} from "lucide-react";

// Import the CreateWorker component
import CreateWorker from "../../components/CreateWorkerForm";

const NonSmartphoneWorkerDashboard = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const [agent, setAgent] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workerDetails, setWorkerDetails] = useState(null);
  const [workerServices, setWorkerServices] = useState([]);
  const [workerBookings, setWorkerBookings] = useState([]);
  const [loadingWorkerDetails, setLoadingWorkerDetails] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    completed: 0,
    today: 0,
    workers: 0
  });

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

  // FETCH AGENT PROFILE AND WORKER DATA
  const fetchAgentData = async () => {
    try {
      setLoading(true);

      // Get agent profile
      const agentResponse = await axiosInstance.get("/api/service-agent/profile");
      if (agentResponse.data.success) {
        setAgent(agentResponse.data.data);
      }

      // Get agent's non-smartphone workers
      const workersResponse = await axiosInstance.get("/api/service-agent/non-smartphone-workers");
      if (workersResponse.data.success) {
        const workersData = workersResponse.data.data || [];
        setWorkers(workersData);

        // Get bookings for all agent's workers
        await fetchAgentBookings(workersData);
      }
    } catch (error) {
      console.error("Fetch agent data error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // FETCH WORKER DETAILS
  const fetchWorkerDetails = async (workerId) => {
    try {
      setLoadingWorkerDetails(true);
      setWorkerDetails(null);
      setWorkerServices([]);
      setWorkerBookings([]);

      // Fetch worker details
      const workerResponse = await axiosInstance.get(`/api/service-agent/worker-details/${workerId}`);
      if (workerResponse.data.success) {
        const data = workerResponse.data.data;
        
        // Handle different response structures
        if (data.worker) {
          setWorkerDetails(data.worker);
          setWorkerServices(data.worker.workerProfile?.services || data.services || []);
          setWorkerBookings(data.bookings || []);
        } else {
          // If response is the worker object directly
          setWorkerDetails(data);
          setWorkerServices(data.workerProfile?.services || []);
          setWorkerBookings(data.bookings || []);
        }
      }
    } catch (error) {
      console.error("Fetch worker details error:", error);
      toast.error("Failed to load worker details");
    } finally {
      setLoadingWorkerDetails(false);
    }
  };

  // HANDLE WORKER CARD CLICK
  const handleWorkerCardClick = async (worker) => {
    setSelectedWorker(worker);
    await fetchWorkerDetails(worker._id);
  };

  // CLOSE WORKER DETAILS MODAL
  const handleCloseWorkerDetails = () => {
    setSelectedWorker(null);
    setWorkerDetails(null);
    setWorkerServices([]);
    setWorkerBookings([]);
  };

  // FETCH BOOKINGS FOR AGENT'S WORKERS
  const fetchAgentBookings = async (workersData) => {
    try {
      let allBookingsData = [];

      // Fetch bookings for each worker
      for (const worker of workersData) {
        try {
          const bookingsResponse = await axiosInstance.get(`/api/service-agent/bookings/${worker._id}`);
          if (bookingsResponse.data.success) {
            const workerBookings = bookingsResponse.data.data?.bookings || [];
            // Add worker info to each booking
            const bookingsWithWorker = workerBookings.map(booking => ({
              ...booking,
              worker: {
                _id: worker._id,
                name: worker.name,
                phone: worker.phone
              }
            }));
            allBookingsData = [...allBookingsData, ...bookingsWithWorker];
          }
        } catch (error) {
          console.error(`Error fetching bookings for worker ${worker._id}:`, error);
        }
      }

      // Sort by creation date
      const sortedBookings = allBookingsData
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setAllBookings(sortedBookings);
      
      // For dashboard, show only recent 10 bookings
      const recentBookings = sortedBookings.slice(0, 10);
      setBookings(recentBookings);

      // Calculate stats with worker job counts
      const today = new Date().toDateString();
      const todayBookings = sortedBookings.filter(booking =>
        new Date(booking.bookingInfo?.date).toDateString() === today
      );

      // Calculate worker stats
      const workersWithStats = workersData.map(worker => {
        const workerBookings = sortedBookings.filter(booking => booking.worker?._id === worker._id);
        return {
          ...worker,
          stats: {
            total: workerBookings.length,
            completed: workerBookings.filter(b => b.status === 'COMPLETED').length,
            pending: workerBookings.filter(b => b.status === 'PENDING').length,
            active: workerBookings.filter(b => b.status === 'ACCEPTED' || b.status === 'PAYMENT_PENDING').length
          }
        };
      });

      setWorkers(workersWithStats);

      setStats({
        total: sortedBookings.length,
        pending: sortedBookings.filter(b => b.status === 'PENDING').length,
        active: sortedBookings.filter(b => b.status === 'ACCEPTED' || b.status === 'PAYMENT_PENDING').length,
        completed: sortedBookings.filter(b => b.status === 'COMPLETED').length,
        today: todayBookings.length,
        workers: workersData.length
      });

      // Generate recent activity
      generateRecentActivity(sortedBookings);
    } catch (error) {
      console.error("Fetch agent bookings error:", error);
    }
  };

  // GENERATE RECENT ACTIVITY
  const generateRecentActivity = (bookingsData) => {
    const activity = [];

    bookingsData.forEach(booking => {
      // Booking created activity
      activity.push({
        id: `${booking._id}_created`,
        type: 'booking_created',
        title: 'New Booking Created',
        description: `Booking for ${booking.serviceDetails?.serviceName || 'Service'}`,
        timestamp: booking.timeline?.createdAt,
        bookingId: booking._id,
        status: booking.status,
        workerName: booking.worker?.name || 'Worker'
      });

      // Status change activities
      if (booking.timeline?.serviceInitiatedAt) {
        activity.push({
          id: `${booking._id}_accepted`,
          type: 'booking_accepted',
          title: 'Booking Accepted',
          description: `Accepted by ${booking.worker?.name || 'Worker'}`,
          timestamp: booking.timeline.serviceInitiatedAt,
          bookingId: booking._id,
          status: 'ACCEPTED',
          workerName: booking.worker?.name || 'Worker'
        });
      }

      if (booking.timeline?.serviceStartedAt) {
        activity.push({
          id: `${booking._id}_started`,
          type: 'work_started',
          title: 'Work Started',
          description: `Work started by ${booking.worker?.name || 'Worker'}`,
          timestamp: booking.timeline.serviceStartedAt,
          bookingId: booking._id,
          status: 'IN_PROGRESS',
          workerName: booking.worker?.name || 'Worker'
        });
      }

      if (booking.timeline?.serviceCompletedAt) {
        activity.push({
          id: `${booking._id}_completed`,
          type: 'work_completed',
          title: 'Work Completed',
          description: `Completed by ${booking.worker?.name || 'Worker'}`,
          timestamp: booking.timeline.serviceCompletedAt,
          bookingId: booking._id,
          status: 'COMPLETED',
          workerName: booking.worker?.name || 'Worker'
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
          remarks = "Job accepted by agent";
          break;
        case "DECLINED":
          remarks = "Job declined by agent";
          break;
        case "PAYMENT_PENDING":
          remarks = "Work started";
          break;
        case "COMPLETED":
          remarks = "Work completed successfully";
          break;
      }

      const { data } = await axiosInstance.patch(
        `/api/service-agent/bookings/${booking._id}/status`,
        { status, remarks, updatedBy: "agent" }
      );

      if (data.success) {
        toast.success(`Job ${action.toLowerCase().replace('_', ' ')}`);
        await fetchAgentData();
      }
    } catch (error) {
      toast.error("Action failed");
    }
  };

  // HANDLE WORKER CREATION SUCCESS
  const handleWorkerCreated = () => {
    setActiveView("dashboard");
    fetchAgentData(); // Refresh data
    toast.success("Worker created successfully!");
  };

  // HANDLE CANCEL WORKER CREATION
  const handleCancelCreateWorker = () => {
    setActiveView("dashboard");
  };

  // VIEW ALL WORKERS
  const handleViewAllWorkers = () => {
    setActiveView("allWorkers");
  };

  // VIEW ALL BOOKINGS
  const handleViewAllBookings = () => {
    setActiveView("allBookings");
  };

  // BACK TO DASHBOARD
  const handleBackToDashboard = () => {
    setActiveView("dashboard");
  };

  useEffect(() => {
    if (activeView === "dashboard") {
      fetchAgentData();
    }
  }, [activeView]);

  // WORKER DETAILS MODAL COMPONENT
  const WorkerDetailsModal = () => {
    if (!selectedWorker) return null;

    const worker = workerDetails || selectedWorker;
    const services = workerServices || [];
    const bookings = workerBookings || [];

    const getVerificationStatus = () => {
      if (!worker.workerProfile?.verification) return "Not Submitted";

      const verification = worker.workerProfile.verification;
      switch (verification.status) {
        case "APPROVED": return { text: "Verified", color: "text-green-600", bg: "bg-green-100" };
        case "PENDING": return { text: "Under Review", color: "text-yellow-600", bg: "bg-yellow-100" };
        case "REJECTED": return { text: "Rejected", color: "text-red-600", bg: "bg-red-100" };
        default: return { text: "Not Submitted", color: "text-gray-600", bg: "bg-gray-100" };
      }
    };

    const getAvailabilityStatus = () => {
      const status = worker.workerProfile?.availabilityStatus || "available";
      switch (status) {
        case "available": return { text: "Available", color: "text-green-600", bg: "bg-green-100" };
        case "busy": return { text: "Busy", color: "text-yellow-600", bg: "bg-yellow-100" };
        case "off-duty": return { text: "Off Duty", color: "text-gray-600", bg: "bg-gray-100" };
        default: return { text: "Available", color: "text-green-600", bg: "bg-green-100" };
      }
    };

    const verificationStatus = getVerificationStatus();
    const availabilityStatus = getAvailabilityStatus();

    // Get worker stats from different possible locations
    const workerStats = worker.stats || worker.workerProfile?.stats || {
      total: 0,
      completed: 0,
      pending: 0,
      active: 0
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {worker.name?.[0]?.toUpperCase() || "W"}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{worker.name}</h2>
                <p className="text-gray-600">Non-Smartphone Worker</p>
              </div>
            </div>
            <button
              onClick={handleCloseWorkerDetails}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loadingWorkerDetails ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{workerStats.total || 0}</p>
                    <p className="text-blue-600 text-sm">Total Jobs</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{workerStats.completed || 0}</p>
                    <p className="text-green-600 text-sm">Completed</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{workerStats.pending || 0}</p>
                    <p className="text-yellow-600 text-sm">Pending</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">{workerStats.active || 0}</p>
                    <p className="text-purple-600 text-sm">Active</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Left Column - Personal Info */}
                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        Personal Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-600 font-medium">Full Name</span>
                          <span className="text-gray-900 font-semibold">{worker.name}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-600 font-medium">Phone</span>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900 font-semibold">{worker.phone}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-600 font-medium">Email</span>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900 font-semibold">{worker.email || "—"}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <span className="text-gray-600 font-medium">Status</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${availabilityStatus.bg} ${availabilityStatus.color}`}>
                            {availabilityStatus.text}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600 font-medium">Verification</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${verificationStatus.bg} ${verificationStatus.color}`}>
                            {verificationStatus.text}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    {worker.address && (
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-green-600" />
                          Address
                        </h3>
                        <div className="space-y-2">
                          <p className="text-gray-900">
                            {worker.address.houseNo && `${worker.address.houseNo}, `}
                            {worker.address.street && `${worker.address.street}, `}
                            {worker.address.area && `${worker.address.area}, `}
                            {worker.address.city && `${worker.address.city}, `}
                            {worker.address.state && `${worker.address.state} - `}
                            {worker.address.pincode || ""}
                          </p>
                          {worker.address.coordinates && (
                            <p className="text-gray-600 text-sm">
                              Coordinates: {worker.address.coordinates.latitude}, {worker.address.coordinates.longitude}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Services & Skills */}
                  <div className="space-y-6">
                    {/* Services Offered */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <ToolCase className="w-5 h-5 text-purple-600" />
                        Services Offered
                        <span className="bg-purple-100 text-purple-800 text-sm px-2 py-1 rounded-full">
                          {services.length}
                        </span>
                      </h3>
                      <div className="space-y-3">
                        {services.length > 0 ? (
                          services.map((service, index) => {
                            // Handle different service data structures
                            const serviceName = service.serviceName || service.service?.name || service.name || "Service";
                            const skillName = service.skill?.name || service.skillId?.name || "Skill";
                            const pricingType = service.pricingType || "FIXED";
                            const price = service.price || 0;
                            const estimatedDuration = service.estimatedDuration;
                            const isActive = service.isActive !== false;
                            const details = service.details;

                            return (
                              <div key={service._id || index} className="bg-white rounded-lg p-4 border border-gray-200 z-50">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">{serviceName}</h4>
                                    <p className="text-gray-600 text-sm mb-1">
                                      {skillName} • {pricingType === 'HOURLY' ? 'Hourly' : 'Fixed'} Rate
                                    </p>
                                    {details && (
                                      <p className="text-gray-500 text-xs mb-2">{details}</p>
                                    )}
                                  </div>
                                  <div className="text-right ml-4">
                                    <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full font-semibold">
                                      ₹{price}
                                      {pricingType === 'HOURLY' && '/hr'}
                                    </span>
                                    {estimatedDuration && (
                                      <p className="text-gray-500 text-xs mt-1">
                                        {estimatedDuration} {pricingType === 'HOURLY' ? 'hours' : 'days'} estimated
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                  <span className={`px-2 py-1 rounded-full ${
                                    isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {isActive ? 'Active' : 'Inactive'}
                                  </span>
                                  {service.portfolioImages && service.portfolioImages.length > 0 && (
                                    <span className="flex items-center gap-1">
                                      {service.portfolioImages.length} portfolio images
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            <ToolCase className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p>No services added</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Skills */}
                    {worker.workerProfile?.skills && worker.workerProfile.skills.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <Award className="w-5 h-5 text-orange-600" />
                          Skills & Expertise
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {worker.workerProfile.skills.map((skill, index) => (
                            <span
                              key={skill._id || skill.skillId?._id || index}
                              className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium"
                            >
                              {skill.name || skill.skillId?.name || `Skill ${index + 1}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Bookings */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Recent Bookings
                    <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                      {bookings.length}
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {bookings.length > 0 ? (
                      bookings.slice(0, 5).map((booking) => (
                        <div key={booking._id} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {booking.serviceDetails?.serviceName || booking.service?.name || "Service"}
                              </h4>
                              <p className="text-gray-600 text-sm">{booking.customer?.name || "Customer"}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              booking.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {booking.status?.replace('_', ' ') || "Unknown"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm text-gray-600">
                            <span>{safeFormat(booking.bookingInfo?.date || booking.createdAt)}</span>
                            <span className="font-semibold text-green-600">
                              ₹{booking.serviceDetails?.price || booking.price || 0}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>No bookings yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bank Details */}
                {worker.workerProfile?.bankDetails && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-green-600" />
                      Bank Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-600 text-sm">Account Holder</label>
                        <p className="text-gray-900 font-semibold">{worker.workerProfile.bankDetails.accountHolderName}</p>
                      </div>
                      <div>
                        <label className="text-gray-600 text-sm">Account Number</label>
                        <p className="text-gray-900 font-semibold">{worker.workerProfile.bankDetails.accountNumber}</p>
                      </div>
                      <div>
                        <label className="text-gray-600 text-sm">IFSC Code</label>
                        <p className="text-gray-900 font-semibold">{worker.workerProfile.bankDetails.IFSCCode}</p>
                      </div>
                      <div>
                        <label className="text-gray-600 text-sm">Bank Name</label>
                        <p className="text-gray-900 font-semibold">{worker.workerProfile.bankDetails.bankName}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock4 className="w-4 h-4" />
                <span className="text-sm">Created {safeDateTimeFormat(worker.createdAt)}</span>
              </div>
              <div className="flex gap-2">
                <a
                  href={`tel:${worker.phone}`}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  Call
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // STATS CARDS COMPONENT
  const StatsCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
      {/* Total Workers */}
      <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.workers}</p>
            <p className="text-gray-600 text-xs md:text-sm">Total Workers</p>
          </div>
          <div className="p-1 md:p-2 bg-blue-100 rounded-lg">
            <Users className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Total Bookings */}
      <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-gray-600 text-xs md:text-sm">Total Jobs</p>
          </div>
          <div className="p-1 md:p-2 bg-purple-100 rounded-lg">
            <FileText className="w-4 h-4 md:w-6 md:h-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Pending Bookings */}
      <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg md:text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-gray-600 text-xs md:text-sm">Pending</p>
          </div>
          <div className="p-1 md:p-2 bg-yellow-100 rounded-lg">
            <Clock className="w-4 h-4 md:w-6 md:h-6 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Active Bookings */}
      <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg md:text-2xl font-bold text-blue-600">{stats.active}</p>
            <p className="text-gray-600 text-xs md:text-sm">Active</p>
          </div>
          <div className="p-1 md:p-2 bg-blue-100 rounded-lg">
            <Briefcase className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Completed Bookings */}
      <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg md:text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-gray-600 text-xs md:text-sm">Completed</p>
          </div>
          <div className="p-1 md:p-2 bg-green-100 rounded-lg">
            <Trophy className="w-4 h-4 md:w-6 md:h-6 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );

  // QUICK ACTIONS COMPONENT
  const QuickActions = () => (
    <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 mb-6">
      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <button
          onClick={() => setActiveView("createWorker")}
          className="p-3 md:p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors text-center"
        >
          <Plus className="w-6 h-6 md:w-8 md:h-8 text-green-600 mx-auto mb-1 md:mb-2" />
          <p className="font-medium text-green-700 text-sm md:text-base">Add Worker</p>
          <p className="text-green-600 text-xs md:text-sm">New worker</p>
        </button>

        <button
          onClick={handleViewAllWorkers}
          className="p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors text-center"
        >
          <Users className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mx-auto mb-1 md:mb-2" />
          <p className="font-medium text-blue-700 text-sm md:text-base">All Workers</p>
          <p className="text-blue-600 text-xs md:text-sm">{stats.workers} workers</p>
        </button>

        <button
          onClick={handleViewAllBookings}
          className="p-3 md:p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors text-center"
        >
          <FileText className="w-6 h-6 md:w-8 md:h-8 text-purple-600 mx-auto mb-1 md:mb-2" />
          <p className="font-medium text-purple-700 text-sm md:text-base">All Bookings</p>
          <p className="text-purple-600 text-xs md:text-sm">{stats.total} jobs</p>
        </button>

        <button
          onClick={() => {
            const element = document.getElementById('bookings-section');
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="p-3 md:p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors text-center"
        >
          <Clock className="w-6 h-6 md:w-8 md:h-8 text-orange-600 mx-auto mb-1 md:mb-2" />
          <p className="font-medium text-orange-700 text-sm md:text-base">Pending Jobs</p>
          <p className="text-orange-600 text-xs md:text-sm">{stats.pending} jobs</p>
        </button>
      </div>
    </div>
  );

  // WORKER CARD COMPONENT
  const WorkerCard = ({ worker, compact = false }) => {
    const completedJobs = worker.stats?.completed || 0;
    const totalJobs = worker.stats?.total || 0;

    if (compact) {
      return (
        <div
          onClick={() => handleWorkerCardClick(worker)}
          className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {worker.name?.[0]?.toUpperCase() || "W"}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-900 text-sm truncate">{worker.name}</h4>
              <p className="text-gray-600 text-xs flex items-center gap-1 truncate">
                <Phone className="w-3 h-3 flex-shrink-0" />
                {worker.phone || "—"}
              </p>
              <div className="flex gap-1 mt-1 flex-wrap">
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {totalJobs} total jobs
                </span>
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  {completedJobs} completed
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        onClick={() => handleWorkerCardClick(worker)}
        className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {worker.name?.[0]?.toUpperCase() || "W"}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 text-sm md:text-base truncate">{worker.name}</h4>
            <p className="text-gray-600 text-xs md:text-sm flex items-center gap-1 truncate">
              <Phone className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              {worker.phone || "—"}
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {totalJobs} total jobs
              </span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                {completedJobs} completed
              </span>
              {worker.stats?.pending > 0 && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                  {worker.stats.pending} pending
                </span>
              )}
              {worker.stats?.active > 0 && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  {worker.stats.active} active
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // BOOKING CARD COMPONENT
  const BookingCard = ({ booking, compact = false }) => {
    const customer = booking.customer || {};
    const service = booking.serviceDetails || {};

    const getStatusIcon = (status) => {
      switch (status) {
        case 'PENDING': return <Clock className="w-3 h-3 md:w-4 md:h-4 text-yellow-600" />;
        case 'ACCEPTED': return <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />;
        case 'PAYMENT_PENDING': return <Wrench className="w-3 h-3 md:w-4 md:h-4 text-purple-600" />;
        case 'COMPLETED': return <Trophy className="w-3 h-3 md:w-4 md:h-4 text-green-600" />;
        default: return <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />;
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
              icon: <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />
            },
            {
              label: "Decline",
              color: "bg-red-600 hover:bg-red-700",
              action: "DECLINED",
              icon: <XCircle className="w-3 h-3 md:w-4 md:h-4" />
            }
          );
          break;

        case "ACCEPTED":
          actions.push({
            label: "Start Work",
            color: "bg-blue-600 hover:bg-blue-700",
            action: "PAYMENT_PENDING",
            icon: <Wrench className="w-3 h-3 md:w-4 md:h-4" />
          });
          break;

        case "PAYMENT_PENDING":
          actions.push({
            label: "Complete",
            color: "bg-purple-600 hover:bg-purple-700",
            action: "COMPLETED",
            icon: <Trophy className="w-3 h-3 md:w-4 md:h-4" />
          });
          break;
      }

      return actions;
    };

    const actions = getActionButtons();

    if (compact) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {customer.name?.[0]?.toUpperCase() || "C"}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-gray-900 text-sm truncate">{customer.name || "—"}</h4>
                <p className="text-gray-600 text-xs flex items-center gap-1 truncate">
                  <Phone className="w-3 h-3 flex-shrink-0" />
                  {customer.phone || "—"}
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <div className="flex items-center gap-1 mb-1 justify-end">
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
            </div>
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex justify-between items-center">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 text-sm truncate">{service.serviceName || "—"}</p>
                <p className="text-gray-600 text-xs truncate">{service.skillName || "General Service"}</p>
              </div>
              <p className="font-bold text-green-600 text-base flex items-center gap-1 flex-shrink-0 ml-2">
                <IndianRupee className="w-3 h-3" />
                {service.price || booking.price || 0}
              </p>
            </div>

            <div className="flex items-start gap-1">
              <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700 text-xs line-clamp-2">
                {customer.address?.area || "—"}, {customer.address?.city || "—"}
              </p>
            </div>
          </div>

          <div className="flex gap-1 flex-wrap">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(booking, action.action)}
                className={`flex-1 min-w-[80px] py-1.5 text-white text-xs font-bold rounded transition-all flex items-center justify-center gap-1 ${action.color}`}
              >
                {action.icon}
                <span className="hidden xs:inline">{action.label}</span>
              </button>
            ))}
            <a
              href={`tel:${customer.phone}`}
              className="px-2 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              <span className="hidden xs:inline">Call</span>
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {customer.name?.[0]?.toUpperCase() || "C"}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-gray-900 truncate">{customer.name || "—"}</h4>
              <p className="text-gray-600 text-sm flex items-center gap-1 truncate">
                <Phone className="w-3 h-3 flex-shrink-0" />
                {customer.phone || "—"}
              </p>
              <p className="text-gray-500 text-xs">Assigned to: {booking.worker?.name || "—"}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            <div className="flex items-center gap-1 mb-1 justify-end">
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
            <p className="text-gray-500 text-xs flex items-center gap-1 justify-end">
              <Calendar className="w-3 h-3" />
              {safeFormat(booking.bookingInfo?.date)} • {safeTimeFormat(booking.bookingInfo?.time)}
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          {/* Service Details */}
          <div className="flex justify-between items-center">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 truncate">{service.serviceName || "—"}</p>
              <p className="text-gray-600 text-sm truncate">{service.skillName || "General Service"}</p>
            </div>
            <p className="font-bold text-green-600 text-lg flex items-center gap-1 flex-shrink-0 ml-2">
              <IndianRupee className="w-4 h-4" />
              {service.price || booking.price || 0}
            </p>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-gray-700 text-sm">
                {customer.address?.area || "—"}, {customer.address?.city || "—"}
              </p>
              <p className="text-gray-600 text-xs">
                {customer.address?.pincode || "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickAction(booking, action.action)}
              className={`flex-1 min-w-[100px] py-2 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${action.color}`}
            >
              {action.icon} {action.label}
            </button>
          ))}
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

  // RECENT BOOKINGS COMPONENT
  const RecentBookings = () => (
    <div id="bookings-section" className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-3 md:mb-4">
        <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
          Recent Bookings
          <span className="bg-blue-100 text-blue-800 text-xs md:text-sm px-2 py-1 rounded-full">
            {bookings.length}
          </span>
        </h3>
        <button
          onClick={handleViewAllBookings}
          className="flex items-center gap-1 md:gap-2 text-blue-600 hover:text-blue-700 font-medium text-xs md:text-sm"
        >
          View All
          <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
        </button>
      </div>

      <div className="space-y-3 md:space-y-4">
        {bookings.length > 0 ? (
          <>
            {bookings.map(booking => (
              <BookingCard key={booking._id} booking={booking} compact={window.innerWidth < 768} />
            ))}
          </>
        ) : (
          <div className="text-center py-6 md:py-8 text-gray-500">
            <FileText className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm md:text-base">No bookings found</p>
            <p className="text-xs md:text-sm mt-1">Bookings from your workers will appear here</p>
          </div>
        )}
      </div>
    </div>
  );

  // WORKERS LIST COMPONENT
  const WorkersList = () => (
    <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-3 md:mb-4">
        <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
          Your Workers
          <span className="bg-green-100 text-green-800 text-xs md:text-sm px-2 py-1 rounded-full">
            {workers.length}
          </span>
        </h3>
        <button
          onClick={handleViewAllWorkers}
          className="flex items-center gap-1 md:gap-2 text-green-600 hover:text-green-700 font-medium text-xs md:text-sm"
        >
          View All
          <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {workers.length > 0 ? (
          <>
            {workers.map(worker => (
              <WorkerCard key={worker._id} worker={worker} compact={window.innerWidth < 768} />
            ))}
          </>
        ) : (
          <div className="text-center py-6 md:py-8 text-gray-500">
            <Users className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm md:text-base">No workers found</p>
            <p className="text-xs md:text-sm mt-1">Add your first non-smartphone worker</p>
            <button
              onClick={() => setActiveView("createWorker")}
              className="mt-3 px-3 py-2 md:px-4 md:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
            >
              Add Worker
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // RECENT ACTIVITY COMPONENT
  const RecentActivity = () => (
    <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-3 md:mb-4">
        <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
          <Bell className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
          Recent Activity
        </h3>
      </div>
      <div className="space-y-3 md:space-y-4">
        {recentActivity.map((activity, index) => (
          <div key={activity.id} className="flex items-start gap-2 md:gap-3 p-2 md:p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className={`p-1.5 md:p-2 rounded-full ${activity.type === 'booking_created' ? 'bg-blue-100' :
              activity.type === 'booking_accepted' ? 'bg-green-100' :
                activity.type === 'work_started' ? 'bg-purple-100' :
                  'bg-orange-100'
              } flex-shrink-0`}>
              {activity.type === 'booking_created' && <FileText className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />}
              {activity.type === 'booking_accepted' && <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600" />}
              {activity.type === 'work_started' && <Wrench className="w-3 h-3 md:w-4 md:h-4 text-purple-600" />}
              {activity.type === 'work_completed' && <Trophy className="w-3 h-3 md:w-4 md:h-4 text-orange-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">{activity.title}</p>
              <p className="text-gray-600 text-xs truncate">{activity.description}</p>
              <p className="text-gray-500 text-xs mt-1">
                {safeDateTimeFormat(activity.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {recentActivity.length === 0 && (
          <div className="text-center py-6 md:py-8 text-gray-500">
            <Activity className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm md:text-base">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );

  // ALL WORKERS VIEW
  const AllWorkersView = () => (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </button>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900">All Workers ({workers.length})</h1>
            <div className="w-5 h-5"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {workers.map(worker => (
            <WorkerCard key={worker._id} worker={worker} />
          ))}
        </div>

        {workers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workers found</h3>
            <p className="text-gray-500 mb-6">Add your first non-smartphone worker to get started</p>
            <button
              onClick={() => setActiveView("createWorker")}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Add Worker
            </button>
          </div>
        )}
      </main>
    </div>
  );

  // ALL BOOKINGS VIEW
  const AllBookingsView = () => (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </button>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900">All Bookings ({allBookings.length})</h1>
            <div className="w-5 h-5"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-4 md:space-y-6">
          {allBookings.map(booking => (
            <BookingCard key={booking._id} booking={booking} />
          ))}
        </div>

        {allBookings.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500">Bookings from your workers will appear here</p>
          </div>
        )}
      </main>
    </div>
  );

  // LOADING SKELETON
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 shadow-sm border border-gray-200 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-5 md:h-6 bg-gray-200 rounded w-6 md:w-8 mb-1 md:mb-2"></div>
                <div className="h-3 md:h-4 bg-gray-200 rounded w-12 md:w-16"></div>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 animate-pulse">
        <div className="h-5 md:h-6 bg-gray-200 rounded w-32 md:w-48 mb-3 md:mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-3 md:p-4 bg-gray-100 rounded-lg">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-200 rounded-lg mx-auto mb-1 md:mb-2"></div>
              <div className="h-3 md:h-4 bg-gray-200 rounded w-16 md:w-20 mx-auto mb-1"></div>
              <div className="h-2 md:h-3 bg-gray-200 rounded w-10 md:w-12 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 animate-pulse">
          <div className="h-5 md:h-6 bg-gray-200 rounded w-24 md:w-32 mb-3 md:mb-4"></div>
          <div className="space-y-3 md:space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-2 md:gap-3 p-2 md:p-3">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 md:h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-2 md:h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 animate-pulse">
          <div className="h-5 md:h-6 bg-gray-200 rounded w-24 md:w-32 mb-3 md:mb-4"></div>
          <div className="space-y-2 md:space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-3 md:h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-2 md:h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // CREATE WORKER VIEW
  if (activeView === "createWorker") {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCancelCreateWorker}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-700"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                </button>
              </div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900">Add New Worker</h1>
              <button
                onClick={handleCancelCreateWorker}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <CreateWorker
            onSuccess={handleWorkerCreated}
            onCancel={handleCancelCreateWorker}
          />
        </main>
      </div>
    );
  }

  // ALL WORKERS VIEW
  if (activeView === "allWorkers") {
    return <AllWorkersView />;
  }

  // ALL BOOKINGS VIEW
  if (activeView === "allBookings") {
    return <AllBookingsView />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 md:p-4">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center py-3 md:py-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base">
                {agent?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div>
                <h1 className="text-base md:text-xl font-bold text-gray-900">Service Agent Dashboard</h1>
                <p className="text-gray-600 text-xs md:text-sm">Welcome back, {agent?.name || "Agent"}!</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={fetchAgentData}
                className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-xs md:text-sm"
              >
                <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => setActiveView("createWorker")}
                className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-xs md:text-sm"
              >
                <Plus className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Add Worker</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 md:py-6">
        <div className="space-y-4 md:space-y-6">
          <StatsCards />
          <QuickActions />
          <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
            <RecentBookings />
            <WorkersList />
          </div>
          <div className="grid lg:grid-cols-1 gap-4 md:gap-6">
            <RecentActivity />
          </div>
        </div>
      </main>

      {/* Worker Details Modal */}
      <WorkerDetailsModal />
    </div>
  );
};

export default NonSmartphoneWorkerDashboard;