import axios from 'axios';
import { 
  Booking, 
  PopulatedBooking, 
  CreateBookingRequest, 
  TripSchedule 
} from '../types/Types';

const API_BASE_URL = 'http://localhost:3000'; // Adjust this to match your backend URL

// Set up axios instance with default headers
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include credentials for authentication
});

// Intercept requests to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on any 401 response
      localStorage.removeItem('token');
      // Dispatch custom event for App.tsx to listen to
      window.dispatchEvent(new Event('auth-error'));
    }
    return Promise.reject(error);
  }
);

const BookingService = {
  /**
   * Create a new booking for a specific trip
   * @param tripId - The ID of the trip to book
   * @param bookingData - The booking information
   * @returns Promise containing booking confirmation
   */
  bookSlot: async (tripId: string, bookingData: Omit<CreateBookingRequest, 'trip'>): Promise<{ message: string; booking: Booking }> => {
    try {
      const response = await api.post(`/booking/${tripId}`, bookingData);
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error(error.response.data.message || error.response.data.error || 'Failed to create booking');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Get all bookings for the current user (tourist)
   * @returns Promise containing array of user's bookings
   */
  getMyBookings: async (): Promise<PopulatedBooking[]> => {
    try {
      const response = await api.get('/booking/myBookings');
      return response.data;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error(error.response.data.message || error.response.data.error || 'Failed to fetch bookings');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Delete a booking
   * @param bookingId - The ID of the booking to delete
   * @returns Promise containing success message
   */
  deleteBooking: async (bookingId: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/booking/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting booking:', error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error(error.response.data.error || error.response.data.message || 'Failed to delete booking');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Get all bookings for a guide
   * @returns Promise containing array of guide's confirmed bookings
   */
  getGuideBookings: async (): Promise<PopulatedBooking[]> => {
    try {
      const response = await api.get('/booking/guide-bookings');
      return response.data;
    } catch (error) {
      console.error('Error fetching guide bookings:', error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error(error.response.data.message || error.response.data.error || 'Failed to fetch guide bookings');
      }
      throw new Error('Network error occurred');
    }
  },

  /**
   * Get available time slots for a specific trip and date
   * @param tripId - The ID of the trip
   * @param date - The date to check availability for
   * @returns Promise containing available time slots
   */
  getAvailableTimeSlots: async (tripId: string, date: string): Promise<TripSchedule[]> => {
    try {
      const response = await api.get(`/booking/available-slots/${tripId}/${date}`);
      return response.data.availableSlots;
    } catch (error) {
      console.error('Error fetching available time slots:', error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error(error.response.data.message || error.response.data.error || 'Failed to fetch available time slots');
      }
      throw new Error('Network error occurred');
    }
  },
};

export default BookingService;