import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Star, MapPin, Clock, Calendar, User, Home, FileText,
  CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import { useBookingStore } from '../store/serviceBooking.store';

const CreateBookingPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    worker,
    loading,
    error,
    bookingData,
    bookingSuccess,
    bookingError,
    availableSlots,
    fetchWorkerDetails,
    fetchAvailableTimeSlots,
    updateBookingData,
    submitBooking,
    resetBookingForm,
    clearError,
  } = useBookingStore();

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch worker details
  useEffect(() => {
    if (id) fetchWorkerDetails(id);
  }, [id]);

  // Fetch available slots when date changes
  useEffect(() => {
    if (bookingData.selectedDate && worker) {
      const serviceId = worker.service?.id;
      fetchAvailableTimeSlots(id, bookingData.selectedDate, serviceId);
    }
  }, [bookingData.selectedDate, worker, id]);

  useEffect(() => {
    if (bookingSuccess) setShowSuccessModal(true);
  }, [bookingSuccess]);

  const today = new Date().toISOString().split('T')[0];

  const handleDateChange = (date) => {
    updateBookingData('selectedDate', date);
    updateBookingData('selectedTime', '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!worker?.service?.id) return;
    setIsSubmitting(true);
    await submitBooking(id, worker.service.id);
    setIsSubmitting(false);
  };

  const handleBack = () => navigate(-1);
  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    resetBookingForm();
    navigate(-1);
  };

  if (loading && !worker) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-12 w-12 text-purple-600" />
      </div>
    );
  }

  if ((error && !worker) || !worker) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg max-w-md text-center">
          <p className="font-medium mb-2">{error ? 'Error Loading Worker Details' : 'Worker not found'}</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const service = worker.service || {};
  const estimatedTotal = Math.round((service.price || 0) * 1.18);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Create Booking</h1>
            <p className="text-sm text-gray-600">Book {worker.name} for your service</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Worker Details */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 sticky top-24">
          <div className="text-center mb-4">
            <img
              src={worker.image || 'https://i.pravatar.cc/150'}
              alt={worker.name}
              className="w-24 h-24 rounded-full object-cover mx-auto mb-4 border-4 border-purple-100"
            />
            <h2 className="text-xl font-bold text-gray-900">{worker.name}</h2>
            <p className="text-purple-600 font-medium">{service.serviceName}</p>
            {worker.isVerified && (
              <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                ✓ Verified Professional
              </span>
            )}
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2">
              <Star size={18} className="fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{worker.rating?.average || 'N/A'}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600 text-sm">{worker.rating?.total || 0} reviews</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={18} />
              <span className="text-sm">{worker.address?.city || 'City'}, {worker.address?.state || 'State'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={18} />
              <span className="text-sm">{worker.completedBookings || 0} completed jobs</span>
            </div>
          </div>

          <div className="border-t pt-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Service Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium text-gray-900">{service.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-bold text-purple-600">₹{service.price || 0}/hr</span>
              </div>
            </div>
          </div>

          {worker.description && (
            <div className="mt-4 border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-sm text-gray-600">{worker.description}</p>
            </div>
          )}
        </div>

        {/* Right Column - Booking Form */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Details</h2>

          {bookingError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Error</p>
                <p className="text-sm">{bookingError}</p>
              </div>
              <button onClick={clearError} className="ml-auto text-red-700 hover:text-red-900 text-xl leading-none">×</button>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Date & Time */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-purple-600" /> Select Date & Time
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Booking Date *</label>
                  <input
                    type="date"
                    min={today}
                    value={bookingData.selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time *</label>
                  <select
                    value={bookingData.selectedTime}
                    onChange={(e) => updateBookingData('selectedTime', e.target.value)}
                    disabled={!bookingData.selectedDate}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">{bookingData.selectedDate ? 'Select time' : 'Select date first'}</option>
                    {availableSlots.length > 0
                      ? availableSlots.map(time => <option key={time} value={time}>{time}</option>)
                      : bookingData.selectedDate ? <option disabled>No slots available</option> : null}
                  </select>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User size={20} className="text-purple-600" /> Your Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input type="text" value={bookingData.customerName} onChange={(e) => updateBookingData('customerName', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input type="tel" value={bookingData.customerPhone} onChange={(e) => updateBookingData('customerPhone', e.target.value)} maxLength={10} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                  <input type="email" value={bookingData.customerEmail} onChange={(e) => updateBookingData('customerEmail', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Home size={20} className="text-purple-600" /> Service Location
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Complete Address *</label>
                  <textarea rows={3} value={bookingData.address} onChange={(e) => updateBookingData('address', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                  <input type="text" value={bookingData.pincode} onChange={(e) => updateBookingData('pincode', e.target.value)} maxLength={6} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-purple-600" /> Additional Information
              </h3>
              <textarea rows={4} value={bookingData.additionalNotes} onChange={(e) => updateBookingData('additionalNotes', e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>

            {/* Pricing Summary */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h3 className="font-semibold text-gray-900 mb-3">Pricing Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Rate:</span>
                  <span className="font-medium">₹{service.price || 0}/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Tax (18%):</span>
                  <span className="font-medium">₹{Math.round((service.price || 0) * 0.18)}</span>
                </div>
                <div className="border-t border-purple-300 pt-2 mt-2 flex justify-between">
                  <span className="font-semibold text-gray-900">Estimated Total:</span>
                  <span className="font-bold text-purple-600 text-lg">₹{estimatedTotal}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  * Final amount may vary based on actual service duration
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={handleBack} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg">Cancel</button>
              <button type="submit" disabled={isSubmitting || loading} className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg flex items-center justify-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600 mb-6">
                Your booking with {worker.name} has been successfully confirmed.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{bookingData.selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{bookingData.selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Professional:</span>
                    <span className="font-medium">{worker.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">₹{estimatedTotal}</span>
                  </div>
                </div>
              </div>
              <button onClick={closeSuccessModal} className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg">Back to Dashboard</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CreateBookingPage;
