import axios from 'axios';

// Types
export interface Guide {
  _id: string;
  fullName: string;
}

export interface Trip {
  _id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  guide: Guide;
}

export interface Booking {
  _id: string;
  tourist: string;
  trip: Trip;
  guide: string;
  status: 'pending' | 'confirmed' | 'canceled';
  contactPhone: string;
  contactEmail: string;
  scheduledDate: string | Date;
  scheduledTime: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateBookingData {
  tripId: string;
  contactPhone: string;
  contactEmail: string;
  scheduledDate: string | Date;
  scheduledTime: string;
}

export interface UpdateBookingData {
  contactPhone?: string;
  contactEmail?: string;
  scheduledDate?: string | Date;
  scheduledTime?: string;
  status?: 'pending' | 'confirmed' | 'canceled';
}

export interface BookingStatusInfo {
  color: 'yellow' | 'green' | 'red' | 'gray';
  icon: string;
  title: string;
  description: string;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
}

const API_URL = 'http://localhost:3000/booking';

// Set up axios instance with default headers
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

const BookingService = {
  // Get user's bookings - matches GET /myBookings
  getMyBookings: async (): Promise<Booking[]> => {
    try {
      const response = await api.get('/myBookings');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Failed to fetch bookings');
      }
      throw new Error('Network error occurred');
    }
  },

  // Create a new booking - matches POST /create
  createBooking: async (bookingData: CreateBookingData): Promise<Booking> => {
    try {
      const response = await api.post('/create', bookingData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Failed to create booking');
      }
      throw new Error('Network error occurred');
    }
  },

  // Get booking by ID - matches GET /:id
  getBookingById: async (bookingId: string): Promise<Booking> => {
    try {
      const response = await api.get(`/${bookingId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          throw new Error('Booking not found');
        }
        throw new Error(error.response.data.error || 'Failed to fetch booking');
      }
      throw new Error('Network error occurred');
    }
  },

  // Update booking - matches PATCH /:id
  updateBooking: async (bookingId: string, updates: UpdateBookingData): Promise<Booking> => {
    try {
      const response = await api.patch(`/${bookingId}`, updates);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          throw new Error('Booking not found');
        }
        throw new Error(error.response.data.error || 'Failed to update booking');
      }
      throw new Error('Network error occurred');
    }
  },

  // Cancel booking - matches PATCH /:id/cancel
  cancelBooking: async (bookingId: string): Promise<ApiResponse<null>> => {
    try {
      const response = await api.patch(`/${bookingId}/cancel`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          throw new Error('Booking not found');
        }
        throw new Error(error.response.data.error || 'Failed to cancel booking');
      }
      throw new Error('Network error occurred');
    }
  },

  // Confirm booking - matches PATCH /:id/confirm
  confirmBooking: async (bookingId: string): Promise<ApiResponse<null>> => {
    try {
      const response = await api.patch(`/${bookingId}/confirm`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          throw new Error('Booking not found');
        }
        throw new Error(error.response.data.error || 'Failed to confirm booking');
      }
      throw new Error('Network error occurred');
    }
  },

  // Delete booking - matches DELETE /:id
  deleteBooking: async (bookingId: string): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete(`/${bookingId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          throw new Error('Booking not found');
        }
        throw new Error(error.response.data.error || 'Failed to delete booking');
      }
      throw new Error('Network error occurred');
    }
  },

  // Validate booking data before submission
  validateBookingData: (data: Partial<CreateBookingData>): string[] => {
    const errors: string[] = [];

    if (!data.tripId?.trim()) {
      errors.push('Trip ID is required');
    }

    if (!data.contactPhone?.trim()) {
      errors.push('Contact phone is required');
    } else if (data.contactPhone.trim().length < 10) {
      errors.push('Contact phone must be at least 10 digits');
    }

    if (!data.contactEmail?.trim()) {
      errors.push('Contact email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.contactEmail.trim())) {
        errors.push('Please enter a valid email address');
      }
    }

    if (!data.scheduledDate) {
      errors.push('Scheduled date is required');
    } else {
      const selectedDate = new Date(data.scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.push('Scheduled date cannot be in the past');
      }
    }

    if (!data.scheduledTime?.trim()) {
      errors.push('Scheduled time is required');
    }

    return errors;
  },

  // Get booking status info for display
  getStatusInfo: (status: Booking['status']): BookingStatusInfo => {
    switch (status) {
      case 'pending':
        return {
          color: 'yellow',
          icon: 'clock',
          title: 'Pending Confirmation',
          description: 'Your booking is awaiting confirmation from the guide.'
        };
      case 'confirmed':
        return {
          color: 'green',
          icon: 'check-circle',
          title: 'Confirmed',
          description: 'Your booking has been confirmed. Get ready for your trip!'
        };
      case 'canceled':
        return {
          color: 'red',
          icon: 'x-circle',
          title: 'Canceled',
          description: 'This booking has been canceled.'
        };
      default:
        return {
          color: 'gray',
          icon: 'help-circle',
          title: 'Unknown Status',
          description: 'Please contact support for assistance.'
        };
    }
  },

  // Format booking for display
  formatBookingForDisplay: (booking: Booking): Booking & {
    formattedPrice: string;
    formattedDate: string;
    formattedDateTime: string;
    statusInfo: BookingStatusInfo;
    canCancel: boolean;
    canUpdate: boolean;
  } => {
    const scheduledDate = new Date(booking.scheduledDate);
    const now = new Date();
    const isUpcoming = scheduledDate > now;
    const isPending = booking.status === 'pending';
    const isConfirmed = booking.status === 'confirmed';

    return {
      ...booking,
      formattedPrice: `$${booking.trip.price.toFixed(2)}`,
      formattedDate: scheduledDate.toLocaleDateString(),
      formattedDateTime: `${scheduledDate.toLocaleDateString()} at ${booking.scheduledTime}`,
      statusInfo: BookingService.getStatusInfo(booking.status),
      canCancel: (isPending || isConfirmed) && isUpcoming,
      canUpdate: isPending && isUpcoming,
    };
  },

  // Check if booking can be modified
  canModifyBooking: (booking: Booking): { canModify: boolean; reason?: string } => {
    const scheduledDate = new Date(booking.scheduledDate);
    const now = new Date();
    const isUpcoming = scheduledDate > now;

    if (booking.status === 'canceled') {
      return { canModify: false, reason: 'Cannot modify canceled bookings' };
    }

    if (!isUpcoming) {
      return { canModify: false, reason: 'Cannot modify past bookings' };
    }

    if (booking.status === 'confirmed') {
      return { canModify: false, reason: 'Cannot modify confirmed bookings' };
    }

    return { canModify: true };
  },

  // Get bookings by status
  filterBookingsByStatus: (bookings: Booking[], status: Booking['status']): Booking[] => {
    return bookings.filter(booking => booking.status === status);
  },

  // Get upcoming bookings
  getUpcomingBookings: (bookings: Booking[]): Booking[] => {
    const now = new Date();
    return bookings.filter(booking => {
      const scheduledDate = new Date(booking.scheduledDate);
      return scheduledDate > now && booking.status !== 'canceled';
    });
  },

  // Get past bookings
  getPastBookings: (bookings: Booking[]): Booking[] => {
    const now = new Date();
    return bookings.filter(booking => {
      const scheduledDate = new Date(booking.scheduledDate);
      return scheduledDate <= now;
    });
  },

  // Sort bookings by date
  sortBookingsByDate: (bookings: Booking[], ascending: boolean = true): Booking[] => {
    return [...bookings].sort((a, b) => {
      const dateA = new Date(a.scheduledDate).getTime();
      const dateB = new Date(b.scheduledDate).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  },

  // Calculate time until booking
  getTimeUntilBooking: (booking: Booking): string => {
    const scheduledDate = new Date(booking.scheduledDate);
    const now = new Date();
    const diffMs = scheduledDate.getTime() - now.getTime();

    if (diffMs <= 0) {
      return 'Past';
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else {
      return 'Today';
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Get the auth token
  getToken: (): string | null => {
    return localStorage.getItem('token');
  }
};

export default BookingService;