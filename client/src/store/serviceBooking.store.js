import { create } from 'zustand';
import axiosInstance from '../utils/axiosInstance'; // adjust path according to your project

export const useBookingStore = create((set, get) => ({
  worker: null,
  loading: false,
  error: null,
  availableSlots: [],
  bookedSlots: [],
  bookingData: {
    selectedDate: '',
    selectedTime: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    address: '',
    pincode: '',
    additionalNotes: '',
  },
  bookingSuccess: false,
  bookingError: null,
  createdBooking: null,

  fetchWorkerDetails: async (workerId, workerServiceId) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axiosInstance.get(
        `/api/bookings/worker/${workerId}/service/${workerServiceId}`
      );
      set({ worker: data.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
    }
  },

  setWorker: (worker) => set({ worker }),

  fetchAvailableTimeSlots: async (workerId, date) => {
    try {
      const { data } = await axiosInstance.get(
        `/api/bookings/worker/${workerId}/available-slots`,
        { params: { date } }
      );
      set({ availableSlots: data.data.availableSlots, bookedSlots: data.data.bookedSlots });
    } catch (error) {
      console.error('Error fetching time slots:', error.response?.data?.message || error.message);
    }
  },

  checkAvailability: async (workerId, bookingDate, bookingTime) => {
    try {
      const { data } = await axiosInstance.post(
        `/api/bookings/worker/${workerId}/check-availability`,
        { bookingDate, bookingTime }
      );
      return data;
    } catch (error) {
      console.error('Error checking availability:', error.response?.data?.message || error.message);
      return { success: false, available: false, reason: error.message };
    }
  },

  updateBookingData: (field, value) =>
    set((state) => ({ bookingData: { ...state.bookingData, [field]: value } })),

  resetBookingForm: () =>
    set({
      bookingData: {
        selectedDate: '',
        selectedTime: '',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        address: '',
        pincode: '',
        additionalNotes: '',
      },
      bookingSuccess: false,
      bookingError: null,
      createdBooking: null,
    }),

  submitBooking: async (workerId, workerServiceId, serviceId) => {
    const { bookingData } = get();

    if (!bookingData.selectedDate || !bookingData.selectedTime) {
      set({ bookingError: 'Please select date and time' });
      return false;
    }
    if (!bookingData.customerName || !bookingData.customerPhone) {
      set({ bookingError: 'Please fill in your contact details' });
      return false;
    }
    if (!bookingData.address || !bookingData.pincode) {
      set({ bookingError: 'Please provide your address' });
      return false;
    }

    set({ loading: true, bookingError: null });

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login to create a booking');

      const { data } = await axiosInstance.post(
        `/api/bookings`,
        {
          workerId,
          workerServiceId,
          serviceId,
          bookingDate: bookingData.selectedDate,
          bookingTime: bookingData.selectedTime,
          customerName: bookingData.customerName,
          customerEmail: bookingData.customerEmail,
          customerPhone: bookingData.customerPhone,
          address: bookingData.address,
          pincode: bookingData.pincode,
          additionalNotes: bookingData.additionalNotes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      set({ bookingSuccess: true, loading: false, createdBooking: data.data });
      return true;
    } catch (error) {
      set({ bookingError: error.response?.data?.message || error.message, loading: false });
      return false;
    }
  },

  getMyBookings: async (status = null, page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login to view bookings');

      const { data } = await axiosInstance.get(`/api/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status, page, limit },
      });

      set({ loading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      return null;
    }
  },

  getBookingDetails: async (bookingId) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login to view booking details');

      const { data } = await axiosInstance.get(`/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({ loading: false });
      return data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      return null;
    }
  },

  cancelBooking: async (bookingId, cancellationReason) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please login to cancel booking');

      const { data } = await axiosInstance.patch(
        `/api/bookings/${bookingId}/cancel`,
        { cancellationReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      set({ loading: false });
      return data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      return null;
    }
  },

  clearError: () => set({ bookingError: null, error: null }),
}));
