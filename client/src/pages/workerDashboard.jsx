import React, { useState } from 'react';
import WorkerNavbar from '../components/WorkerNavbar';
import Overview from '../components/Overview';
import ServiceManagement from '../components/ServiceManagement';
import BookingManagement from '../components/BookingManagement';
import PortfolioManagement from '../components/PortfolioManagement';
import AvailabilityManagement from '../components/AvailabilityManagement';
import Settings from '../components/Settings';
import ServiceModal from '../components/modals/ServiceModal';
import PortfolioModal from '../components/modals/PortfolioModal';

const WorkerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Mock Data
  const workerData = {
    name: "Rajesh",
    earnings: "2,34,500",
    completedJobs: 127,
    rating: 4.9,
    status: "available",
    upcomingJobs: 3,
    location: "Mumbai, Maharashtra"
  };

  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [newService, setNewService] = useState([]);
  const [availabilityStatus, setAvailabilityStatus] = useState('available');
  const [language, setLanguage] = useState('English');

  const earningsData = [];
  const languages = [];
  const skills = [];

  // Handlers
  const handleAcceptBooking = (bookingId) => {};
  const handleDeclineBooking = (bookingId) => {};
  const handleAddService = () => {};
  const handleDeleteService = (serviceId) => {};
  const handleEditService = (service) => {};
  const handleImageUpload = (serviceName, files) => {};
  const handleDeleteImage = (serviceName, imageId) => {};

  return (
    <div className="min-h-screen bg-gray-50 lg:pl-64">
      {/* 🔹 Navigation */}
      <WorkerNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* 🔹 Main Content */}
      <main className="lg:ml-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {activeTab === 'overview' && (
            <Overview
              workerData={workerData}
              earningsData={earningsData}
              bookings={bookings}
              onShowServiceModal={() => setShowServiceModal(true)}
              onSetActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'services' && (
            <ServiceManagement
              services={services}
              onShowServiceModal={() => setShowServiceModal(true)}
              onEditService={handleEditService}
              onDeleteService={handleDeleteService}
            />
          )}

          {activeTab === 'bookings' && (
            <BookingManagement
              bookings={bookings}
              onAcceptBooking={handleAcceptBooking}
              onDeclineBooking={handleDeclineBooking}
            />
          )}

          {activeTab === 'portfolio' && (
            <PortfolioManagement
              services={services}
              portfolio={portfolio}
              onShowPortfolioModal={() => setShowPortfolioModal(true)}
              onDeleteImage={handleDeleteImage}
            />
          )}

          {activeTab === 'availability' && (
            <AvailabilityManagement
              availabilityStatus={availabilityStatus}
              onSetAvailabilityStatus={setAvailabilityStatus}
            />
          )}

          {activeTab === 'settings' && (
            <Settings
              language={language}
              onSetLanguage={setLanguage}
              languages={languages}
            />
          )}
        </div>
      </main>

      {/* 🔹 Modals */}
      {showServiceModal && (
        <ServiceModal
          editingService={editingService}
          newService={newService}
          setNewService={setNewService}
          skills={skills}
          onAddService={handleAddService}
          onClose={() => {
            setShowServiceModal(false);
            setEditingService(null);
            setNewService({ name: '', skill: '', price: '', duration: '', description: '' });
          }}
        />
      )}

      {showPortfolioModal && (
        <PortfolioModal
          services={services}
          portfolio={portfolio}
          onImageUpload={handleImageUpload}
          onDeleteImage={handleDeleteImage}
          onClose={() => setShowPortfolioModal(false)}
        />
      )}
    </div>
  );
};

export default WorkerDashboard;
