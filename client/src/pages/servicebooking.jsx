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
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 sm:p-6 rounded-lg max-w-md text-center">
          <p className="font-medium mb-2 text-sm sm:text-base">{error ? 'Error Loading Worker Details' : 'Worker not found'}</p>
          <p className="text-xs sm:text-sm">{error}</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const service = worker.service || {};
  
  // Pricing logic
  const pricingType = service.pricingType || 'hourly'; // 'fixed' or 'hourly'
  const basePrice = service.price || 0;
  
  // Calculate estimated total based on pricing type
  const calculateEstimatedTotal = () => {
    if (pricingType === 'fixed') {
      // For fixed pricing, just add tax to the base price
      return Math.round(basePrice * 1.18);
    } else {
      // For hourly pricing, use estimated hours or minimum hours
      const estimatedHours = parseFloat(bookingData.estimatedHours) || service.minimumHours || 1;
      return Math.round(basePrice * estimatedHours * 1.18);
    }
  };
  
  const estimatedTotal = calculateEstimatedTotal();
  const estimatedHours = parseFloat(bookingData.estimatedHours) || service.minimumHours || 1;
  const subtotal = pricingType === 'hourly' ? basePrice * estimatedHours : basePrice;
  const taxAmount = Math.round(subtotal * 0.18);

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
          <button onClick={handleBack} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Create Booking</h1>
            <p className="text-xs sm:text-sm text-gray-600">Book {worker.name} for your service</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Worker Details */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:sticky lg:top-24 h-fit">
          <div className="text-center mb-4">
            <img
              src={worker.image || 'https://i.pravatar.cc/150'}
              alt={worker.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover mx-auto mb-3 sm:mb-4 border-4 border-purple-100"
            />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">{worker.name}</h2>
            <p className="text-sm sm:text-base text-purple-600 font-medium">{service.serviceName}</p>
            {worker.isVerified && (
              <span className="inline-block mt-2 px-2.5 sm:px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                ✓ Verified Professional
              </span>
            )}
          </div>

          <div className="space-y-2 sm:space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm sm:text-base">
              <Star size={16} className="sm:w-[18px] sm:h-[18px] fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{worker.rating?.average || 'N/A'}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600 text-xs sm:text-sm">{worker.rating?.total || 0} reviews</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <MapPin size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="text-xs sm:text-sm">{worker.address?.city || 'City'}, {worker.address?.state || 'State'}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <Clock size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="text-xs sm:text-sm">{worker.completedBookings || 0} completed jobs</span>
            </div>
          </div>

          <div className="border-t pt-3 sm:pt-4 mb-3 sm:mb-4">
            <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Service Details</h3>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium text-gray-900">{service.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pricing Type:</span>
                <span className="font-medium text-gray-900">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    pricingType === 'fixed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {pricingType === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}
                  </span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-bold text-purple-600">
                  ₹{basePrice}{pricingType === 'hourly' ? '/hr' : ''}
                </span>
              </div>
              {pricingType === 'hourly' && service.minimumHours && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Min. Hours:</span>
                  <span className="font-medium text-gray-900">{service.minimumHours}h</span>
                </div>
              )}
            </div>
          </div>

          {worker.description && (
            <div className="mt-3 sm:mt-4 border-t pt-3 sm:pt-4">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">About</h3>
              <p className="text-xs sm:text-sm text-gray-600">{worker.description}</p>
            </div>
          )}
        </div>

        {/* Right Column - Booking Form */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Booking Details</h2>

          {bookingError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg mb-4 sm:mb-6 flex items-start gap-2">
              <AlertCircle size={18} className="sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm sm:text-base">Error</p>
                <p className="text-xs sm:text-sm">{bookingError}</p>
              </div>
              <button onClick={clearError} className="ml-auto text-red-700 hover:text-red-900 text-xl leading-none">×</button>
            </div>
          )}

          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            {/* Date & Time */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <Calendar size={18} className="sm:w-5 sm:h-5 text-purple-600" /> Select Date & Time
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Booking Date *</label>
                  <input
                    type="date"
                    min={today}
                    value={bookingData.selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Preferred Time *</label>
                  <select
                    value={bookingData.selectedTime}
                    onChange={(e) => updateBookingData('selectedTime', e.target.value)}
                    disabled={!bookingData.selectedDate}
                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">{bookingData.selectedDate ? 'Select time' : 'Select date first'}</option>
                    {availableSlots.length > 0
                      ? availableSlots.map(time => <option key={time} value={time}>{time}</option>)
                      : bookingData.selectedDate ? <option disabled>No slots available</option> : null}
                  </select>
                </div>
              </div>
            </div>

            {/* Estimated Hours - Only for Hourly Pricing */}
            {pricingType === 'hourly' && (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <Clock size={18} className="sm:w-5 sm:h-5 text-purple-600" /> Estimated Duration
                </h3>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Estimated Hours * (Minimum: {service.minimumHours || 1}h)
                  </label>
                  <input
                    type="number"
                    min={service.minimumHours || 1}
                    step="0.5"
                    value={bookingData.estimatedHours || service.minimumHours || 1}
                    onChange={(e) => updateBookingData('estimatedHours', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Final charges will be based on actual hours worked
                  </p>
                </div>
              </div>
            )}

            {/* Customer Info */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <User size={18} className="sm:w-5 sm:h-5 text-purple-600" /> Your Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input 
                    type="text" 
                    value={bookingData.customerName} 
                    onChange={(e) => updateBookingData('customerName', e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" 
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input 
                    type="tel" 
                    value={bookingData.customerPhone} 
                    onChange={(e) => updateBookingData('customerPhone', e.target.value)} 
                    maxLength={10} 
                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" 
                    placeholder="10-digit mobile number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
                  <input 
                    type="email" 
                    value={bookingData.customerEmail} 
                    onChange={(e) => updateBookingData('customerEmail', e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" 
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <Home size={18} className="sm:w-5 sm:h-5 text-purple-600" /> Service Location
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Complete Address *</label>
                  <textarea 
                    rows={3} 
                    value={bookingData.address} 
                    onChange={(e) => updateBookingData('address', e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" 
                    placeholder="House/Flat No., Street, Locality"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                  <input 
                    type="text" 
                    value={bookingData.pincode} 
                    onChange={(e) => updateBookingData('pincode', e.target.value)} 
                    maxLength={6} 
                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" 
                    placeholder="6-digit pincode"
                  />
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                <FileText size={18} className="sm:w-5 sm:h-5 text-purple-600" /> Additional Information
              </h3>
              <textarea 
                rows={4} 
                value={bookingData.additionalNotes} 
                onChange={(e) => updateBookingData('additionalNotes', e.target.value)} 
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" 
                placeholder="Any specific requirements or instructions..."
              />
            </div>

            {/* Pricing Summary */}
            <div className="bg-purple-50 rounded-lg p-3 sm:p-4 border border-purple-200">
              <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Pricing Summary</h3>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    {pricingType === 'fixed' ? 'Fixed Price:' : 'Hourly Rate:'}
                  </span>
                  <span className="font-medium">
                    ₹{basePrice}{pricingType === 'hourly' ? '/hr' : ''}
                  </span>
                </div>
                
                {pricingType === 'hourly' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Hours:</span>
                      <span className="font-medium">{estimatedHours}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium">₹{subtotal}</span>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Tax (18%):</span>
                  <span className="font-medium">₹{taxAmount}</span>
                </div>
                
                <div className="border-t border-purple-300 pt-1.5 sm:pt-2 mt-1.5 sm:mt-2 flex justify-between">
                  <span className="font-semibold text-gray-900">Estimated Total:</span>
                  <span className="font-bold text-purple-600 text-base sm:text-lg">₹{estimatedTotal}</span>
                </div>
                
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1 sm:mt-2">
                  {pricingType === 'fixed' 
                    ? '* Fixed price for the complete service'
                    : '* Final amount may vary based on actual service duration'}
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 sm:gap-4 pt-3 sm:pt-4">
              <button 
                type="button" 
                onClick={handleBack} 
                className="flex-1 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting || loading} 
                className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg flex items-center justify-center gap-2 hover:from-purple-700 hover:to-purple-800 transition disabled:opacity-50 text-sm sm:text-base font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5" /> 
                    <span className="hidden sm:inline">Processing...</span>
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <CheckCircle size={28} className="sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Your booking with {worker.name} has been successfully confirmed.
              </p>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 text-left">
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
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
                  {pricingType === 'hourly' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{estimatedHours}h</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">₹{estimatedTotal}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={closeSuccessModal} 
                className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition text-sm sm:text-base font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CreateBookingPage;