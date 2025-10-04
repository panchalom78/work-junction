import React, { useState } from 'react';
import { 
  Calendar, 
  DollarSign, 
  Star, 
  CheckCircle, 
  Settings, 
  User, 
  Briefcase,
  MapPin,
  Clock,
  Plus,
  TrendingUp,
  Bell,
  Search,
  Image,
  X,
  Upload,
  Edit3,
  Trash2,
  Globe,
  Check,
  XCircle
} from 'lucide-react';

const WorkerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState('available');
  const [language, setLanguage] = useState('en');
  const [editingService, setEditingService] = useState(null);

  // Mock data
  const workerData = {
    name: "Rajesh",
    earnings: "2,34,500",
    completedJobs: 127,
    rating: 4.9,
    status: "available",
    upcomingJobs: 3,
    location: "Mumbai, Maharashtra"
  };

  const [services, setServices] = useState([
    { id: 1, name: "Tap Repair", skill: "Plumbing", price: 300, duration: "1 hour", description: "Fix leaking taps and faucets" },
    { id: 2, name: "Pipe Installation", skill: "Plumbing", price: 800, duration: "2 hours", description: "New pipe installation and fitting" },
    { id: 3, name: "Furniture Assembly", skill: "Carpentry", price: 500, duration: "1.5 hours", description: "Assemble furniture and fixtures" }
  ]);

  const [bookings, setBookings] = useState([
    { id: 1, customer: "Anni Patel", service: "Tap Repair", date: "Today, 2:30 PM", address: "12th Main, Achihari West", status: "confirmed" },
    { id: 2, customer: "Rohit Sharma", service: "Furniture Assembly", date: "Tomorrow, 10:00 AM", address: "24th Cross, MG Road", status: "pending" },
    { id: 3, customer: "Priya Singh", service: "Pipe Installation", date: "Today, 4:15 PM", address: "5th Block, Koramangala", status: "confirmed" }
  ]);

  const [portfolio, setPortfolio] = useState({
    "Tap Repair": [
      { id: 1, url: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop", caption: "Before repair" },
      { id: 2, url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop", caption: "After repair" }
    ],
    "Furniture Assembly": [
      { id: 3, url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop", caption: "Completed wardrobe" }
    ]
  });

  const [newService, setNewService] = useState({
    name: '',
    skill: '',
    price: '',
    duration: '',
    description: ''
  });

  const earningsData = [
    { month: 'Apr', amount: 45000 },
    { month: 'May', amount: 52000 },
    { month: 'Jun', amount: 48000 },
    { month: 'Jul', amount: 61000 },
    { month: 'Aug', amount: 55000 },
    { month: 'Sep', amount: 58000 }
  ];

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'mr', name: 'Marathi', native: 'मराठी' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' }
  ];

  const skills = ["Plumbing", "Carpentry", "Electrical", "Painting", "Cleaning"];

  const maxEarning = Math.max(...earningsData.map(item => item.amount));

  // Handlers
  const handleAcceptBooking = (bookingId) => {
    setBookings(bookings.map(booking => 
      booking.id === bookingId ? { ...booking, status: 'confirmed' } : booking
    ));
  };

  const handleDeclineBooking = (bookingId) => {
    setBookings(bookings.map(booking => 
      booking.id === bookingId ? { ...booking, status: 'declined' } : booking
    ));
  };

  const handleAddService = () => {
    if (editingService) {
      setServices(services.map(service => 
        service.id === editingService.id ? { ...editingService, id: service.id } : service
      ));
    } else {
      const newServiceWithId = {
        ...newService,
        id: services.length + 1,
        price: parseInt(newService.price)
      };
      setServices([...services, newServiceWithId]);
    }
    setShowServiceModal(false);
    setEditingService(null);
    setNewService({ name: '', skill: '', price: '', duration: '', description: '' });
  };

  const handleDeleteService = (serviceId) => {
    setServices(services.filter(service => service.id !== serviceId));
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setNewService(service);
    setShowServiceModal(true);
  };

  const handleImageUpload = (serviceName, files) => {
    const newImages = Array.from(files).map((file, index) => ({
      id: Date.now() + index,
      url: URL.createObjectURL(file),
      caption: `New image ${index + 1}`
    }));

    setPortfolio({
      ...portfolio,
      [serviceName]: [...(portfolio[serviceName] || []), ...newImages]
    });
  };

  const handleDeleteImage = (serviceName, imageId) => {
    setPortfolio({
      ...portfolio,
      [serviceName]: portfolio[serviceName].filter(img => img.id !== imageId)
    });
  };

  // Components
  const StatsCard = ({ icon: Icon, label, value, color = "blue" }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const QuickAction = ({ icon: Icon, label, onClick, color = "blue" }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-3 p-4 bg-${color}-50 rounded-xl hover:bg-${color}-100 transition-colors border border-${color}-200 w-full text-left`}
    >
      <Icon className={`w-5 h-5 text-${color}-600`} />
      <span className="font-medium text-gray-700">{label}</span>
    </button>
  );

  const ServiceModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h3>
            <button onClick={() => setShowServiceModal(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
            <input
              type="text"
              value={newService.name}
              onChange={(e) => setNewService({ ...newService, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Tap Repair"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Skill Category</label>
            <select
              value={newService.skill}
              onChange={(e) => setNewService({ ...newService, skill: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a skill</option>
              {skills.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
            <input
              type="number"
              value={newService.price}
              onChange={(e) => setNewService({ ...newService, price: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
            <input
              type="text"
              value={newService.duration}
              onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 1 hour"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={newService.description}
              onChange={(e) => setNewService({ ...newService, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the service..."
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setShowServiceModal(false);
                setEditingService(null);
                setNewService({ name: '', skill: '', price: '', duration: '', description: '' });
              }}
              className="flex-1 bg-white text-gray-700 border-2 border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleAddService}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              {editingService ? 'Update Service' : 'Add Service'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const PortfolioModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Upload Portfolio Images</h3>
            <button onClick={() => setShowPortfolioModal(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {services.map(service => (
            <div key={service.id} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">{service.name}</h4>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(service.name, e.target.files)}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <div className="grid grid-cols-2 gap-2 mt-3">
                {portfolio[service.name]?.map(image => (
                  <div key={image.id} className="relative group">
                    <img src={image.url} alt={image.caption} className="w-full h-24 object-cover rounded-lg" />
                    <button 
                      onClick={() => handleDeleteImage(service.name, image.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={() => setShowPortfolioModal(false)}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  // Render different tabs
  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard 
          icon={DollarSign} 
          label="Total Earnings" 
          value={`₹${workerData.earnings}`}
          color="green"
        />
        <StatsCard 
          icon={CheckCircle} 
          label="Completed Jobs" 
          value={workerData.completedJobs}
          color="blue"
        />
        <StatsCard 
          icon={Star} 
          label="Average Rating" 
          value={workerData.rating}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Status Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${
                    availabilityStatus === 'available' ? 'bg-green-500' : 
                    availabilityStatus === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-lg font-semibold text-gray-900 capitalize">
                    {availabilityStatus.replace('-', ' ')} for work
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Upcoming Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{workerData.upcomingJobs}</p>
              </div>
            </div>
          </div>

          {/* Earnings Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Earnings Overview</h3>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            
            <div className="flex items-end justify-between h-48 mt-8">
              {earningsData.map((item, index) => {
                const height = (item.amount / maxEarning) * 100;
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className="text-center mb-2">
                      <span className="text-sm font-medium text-gray-600">₹{(item.amount / 1000).toFixed(0)}k</span>
                    </div>
                    <div
                      className="w-8 bg-blue-500 rounded-t-lg transition-all duration-300 hover:bg-blue-600"
                      style={{ height: `${height}%` }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <QuickAction 
                icon={Clock} 
                label="Create Emergency Slot" 
                onClick={() => setActiveTab('availability')}
                color="orange"
              />
              <QuickAction 
                icon={User} 
                label="Update Work Profile" 
                onClick={() => setActiveTab('services')}
                color="blue"
              />
              <QuickAction 
                icon={Plus} 
                label="Add New Service" 
                onClick={() => setShowServiceModal(true)}
                color="green"
              />
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
            <div className="space-y-4">
              {bookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">{booking.customer}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {booking.address}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {booking.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Service Management</h2>
        <button
          onClick={() => setShowServiceModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Service</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <div key={service.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full mt-1">
                  {service.skill}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditService(service)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteService(service.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-gray-600 mb-4">{service.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold text-gray-900">₹{service.price}</span>
              <span className="text-sm text-gray-500">{service.duration}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Booking Requests</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Pending */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 text-yellow-500 mr-2" />
              Pending ({bookings.filter(b => b.status === 'pending').length})
            </h3>
            <div className="space-y-4">
              {bookings.filter(b => b.status === 'pending').map(booking => (
                <div key={booking.id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{booking.customer}</h4>
                      <p className="text-sm text-gray-600">{booking.service}</p>
                    </div>
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded">Pending</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">📅 {booking.date}</p>
                    <p className="text-gray-600 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {booking.address}
                    </p>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => handleAcceptBooking(booking.id)}
                      className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => handleDeclineBooking(booking.id)}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Confirmed */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
            </h3>
            <div className="space-y-4">
              {bookings.filter(b => b.status === 'confirmed').map(booking => (
                <div key={booking.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{booking.customer}</h4>
                      <p className="text-sm text-gray-600">{booking.service}</p>
                    </div>
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">Confirmed</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">📅 {booking.date}</p>
                    <p className="text-gray-600 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {booking.address}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Declined */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
              Declined ({bookings.filter(b => b.status === 'declined').length})
            </h3>
            <div className="space-y-4">
              {bookings.filter(b => b.status === 'declined').map(booking => (
                <div key={booking.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{booking.customer}</h4>
                      <p className="text-sm text-gray-600">{booking.service}</p>
                    </div>
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">Declined</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-600">📅 {booking.date}</p>
                    <p className="text-gray-600 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {booking.address}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPortfolio = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Service Portfolio</h2>
        <button
          onClick={() => setShowPortfolioModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Upload className="w-5 h-5" />
          <span>Upload Images</span>
        </button>
      </div>

      {services.map(service => (
        <div key={service.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {portfolio[service.name]?.length || 0} images
            </span>
          </div>
          
          {portfolio[service.name] && portfolio[service.name].length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolio[service.name].map(image => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.url}
                    alt={image.caption}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <button className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteImage(service.name, image.id)}
                        className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{image.caption}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No images uploaded for this service</p>
              <p className="text-sm text-gray-400 mt-1">Upload images to showcase your work</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderAvailability = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Availability Management</h2>
      
      {/* Current Status */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h3>
        <div className="flex flex-wrap gap-4">
          {[
            { value: 'available', label: '✅ Available', color: 'green' },
            { value: 'busy', label: '🔄 Busy', color: 'yellow' },
            { value: 'off-duty', label: '⛔ Off Duty', color: 'red' }
          ].map((status) => (
            <button
              key={status.value}
              onClick={() => setAvailabilityStatus(status.value)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                availabilityStatus === status.value
                  ? `bg-${status.color}-500 text-white shadow-lg` 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center">
              <div className="font-semibold text-gray-900 mb-2">{day}</div>
              <div className="space-y-2">
                <div className="bg-green-100 text-green-800 text-sm py-1 px-2 rounded">9 AM - 6 PM</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      
      {/* Language Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Globe className="w-5 h-5 mr-2" />
          Language Preferences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                language === lang.code
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold text-gray-900">{lang.name}</div>
              <div className="text-sm text-gray-600">{lang.native}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const navigation = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'services', name: 'Services', icon: Briefcase },
    { id: 'bookings', name: 'Bookings', icon: Calendar },
    { id: 'portfolio', name: 'Portfolio', icon: Image },
    { id: 'availability', name: 'Availability', icon: Clock },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">WorkJunction</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  className={`px-3 py-2 text-sm font-medium ${
                    activeTab === item.id 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  {item.name}
                </button>
              ))}
            </nav>

            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{workerData.name}</p>
                  <p className="text-xs text-gray-500">{workerData.location}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        {activeTab === 'overview' && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {workerData.name}</h1>
            <p className="text-gray-600 mt-1">Here's your work overview for today.</p>
          </div>
        )}

        {/* Main Content */}
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'services' && renderServices()}
          {activeTab === 'bookings' && renderBookings()}
          {activeTab === 'portfolio' && renderPortfolio()}
          {activeTab === 'availability' && renderAvailability()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
        <div className="flex justify-around items-center h-16">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={`flex flex-col items-center p-2 ${
                activeTab === item.id ? 'text-blue-600' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showServiceModal && <ServiceModal />}
      {showPortfolioModal && <PortfolioModal />}
    </div>
  );
};

export default WorkerDashboard;