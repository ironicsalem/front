import axios from 'axios';
import {
  Location,
  StartLocation,
  TripSchedule,
  Trip,
  CreateTripRequest,
  TripType,
  ApiResponse
} from '../types/Types';

// Additional interfaces specific to TripService
export interface GuideUser {
  name: string;
  phone: string;
  profilePicture?: string;
}

export interface TripWithGuide extends Trip {
  guideUser?: GuideUser;
}

export interface UpdateTripData {
  title?: string;
  city?: string;
  price?: number;
  description?: string;
  type?: TripType;
  schedule?: TripSchedule[];
  path?: Location[];
  startLocation?: StartLocation;
  isAvailable?: boolean;
  image?: File;
}

export interface CreateTripData extends Omit<CreateTripRequest, 'guide'> {
  image?: File;
}

export interface TripsResponse {
  trips: Trip[];
  hasNextPage: boolean;
}

const API_URL = 'http://localhost:3000/trip';

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

// Utility function to create FormData for file uploads
const createFormData = (data: CreateTripData | UpdateTripData): FormData => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'image' && value instanceof File) {
      formData.append('image', value);
    } else if (key === 'schedule' || key === 'path' || key === 'startLocation') {
      formData.append(key, JSON.stringify(value));
    } else if (value !== undefined && value !== null) {
      formData.append(key, value.toString());
    }
  });
  
  return formData;
};

const TripService = {
  // Create a new trip - matches POST /create
  createTrip: async (tripData: CreateTripData): Promise<Trip> => {
    try {
      const formData = createFormData(tripData);
      const response = await api.post('/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to create trip');
      }
      throw new Error('Network error occurred');
    }
  },

  // Get all trips with pagination - matches GET /trips
  getTrips: async (page: number = 1): Promise<TripsResponse> => {
    try {
      const response = await api.get(`/trips?page=${page}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch trips');
      }
      throw new Error('Network error occurred');
    }
  },

  // Get trip by ID - matches GET /:id
  getTripById: async (id: string): Promise<TripWithGuide> => {
    try {
      const response = await api.get(`/${id}`);
      return {
        ...response.data.trip,
        guideUser: response.data.guideUser,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          throw new Error('Trip not found');
        }
        throw new Error(error.response.data.message || 'Failed to fetch trip');
      }
      throw new Error('Network error occurred');
    }
  },

  // Get trips for a specific guide - matches GET /:guideId/trips
  getTripsForGuide: async (guideId: string): Promise<Trip[]> => {
    try {
      const response = await api.get(`/${guideId}/trips`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch trips for guide');
      }
      throw new Error('Network error occurred');
    }
  },

  // Update trip - matches PUT /:id
  updateTrip: async (id: string, tripData: UpdateTripData): Promise<Trip> => {
    try {
      const formData = createFormData(tripData);
      const response = await api.put(`/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          throw new Error('Trip not found');
        }
        throw new Error(error.response.data.message || 'Failed to update trip');
      }
      throw new Error('Network error occurred');
    }
  },

  // Delete trip - matches DELETE /:id
  deleteTrip: async (id: string): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          throw new Error('Trip not found');
        }
        throw new Error(error.response.data.message || 'Failed to delete trip');
      }
      throw new Error('Network error occurred');
    }
  },

  // Validate trip data before submission
  validateTripData: (data: CreateTripData | UpdateTripData): string[] => {
    const errors: string[] = [];

    if ('title' in data && (!data.title || data.title.trim().length === 0)) {
      errors.push('Title is required');
    }

    if ('city' in data && (!data.city || data.city.trim().length === 0)) {
      errors.push('City is required');
    }

    if ('price' in data && (data.price === undefined || data.price <= 0)) {
      errors.push('Price must be greater than 0');
    }

    if ('description' in data && (!data.description || data.description.trim().length === 0)) {
      errors.push('Description is required');
    }

    if ('type' in data && (!data.type || data.type.trim().length === 0)) {
      errors.push('Type is required');
    }

    if ('schedule' in data && (!data.schedule || data.schedule.length === 0)) {
      errors.push('At least one schedule item is required');
    }

    if ('path' in data && (!data.path || data.path.length === 0)) {
      errors.push('At least one location in path is required');
    }

    if ('startLocation' in data && data.startLocation) {
      if (!data.startLocation.coordinates || data.startLocation.coordinates.length !== 2) {
        errors.push('Start location must have valid coordinates [longitude, latitude]');
      }
    }

    return errors;
  },

  // Format trip data for display
  formatTripForDisplay: (trip: Trip): Trip & { 
    formattedPrice: string;
    formattedSchedule: string[];
  } => {
    return {
      ...trip,
      formattedPrice: `$${trip.price.toFixed(2)}`,
      formattedSchedule: trip.schedule.map(item => 
        `${new Date(item.date).toLocaleDateString()} at ${item.time}`
      ),
    };
  },

  // Check if trip is available for booking
  isTripAvailable: (trip: Trip): boolean => {
    return trip.isAvailable && trip.schedule.some(slot => slot.isAvailable);
  },

  // Get available schedule slots for a trip
  getAvailableSchedules: (trip: Trip): TripSchedule[] => {
    return trip.schedule.filter(slot => slot.isAvailable);
  },

  // Format coordinates for display
  formatCoordinates: (startLocation: StartLocation): string => {
    const [lng, lat] = startLocation.coordinates;
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  },

  // Search trips by city or title
  searchTrips: async (query: string, page: number = 1): Promise<TripsResponse> => {
    try {
      const allTrips = await TripService.getTrips(page);
      const filteredTrips = allTrips.trips.filter(trip => 
        trip.title.toLowerCase().includes(query.toLowerCase()) ||
        trip.city.toLowerCase().includes(query.toLowerCase()) ||
        trip.description.toLowerCase().includes(query.toLowerCase())
      );

      return {
        trips: filteredTrips,
        hasNextPage: allTrips.hasNextPage
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to search trips');
      }
      throw new Error('Network error occurred');
    }
  },

  // Filter trips by type
  filterTripsByType: async (type: TripType, page: number = 1): Promise<TripsResponse> => {
    try {
      const allTrips = await TripService.getTrips(page);
      const filteredTrips = allTrips.trips.filter(trip => 
        trip.type === type
      );

      return {
        trips: filteredTrips,
        hasNextPage: allTrips.hasNextPage
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to filter trips by type');
      }
      throw new Error('Network error occurred');
    }
  },

  // Filter trips by price range
  filterTripsByPriceRange: async (
    minPrice: number, 
    maxPrice: number, 
    page: number = 1
  ): Promise<TripsResponse> => {
    try {
      const allTrips = await TripService.getTrips(page);
      const filteredTrips = allTrips.trips.filter(trip => 
        trip.price >= minPrice && trip.price <= maxPrice
      );

      return {
        trips: filteredTrips,
        hasNextPage: allTrips.hasNextPage
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to filter trips by price');
      }
      throw new Error('Network error occurred');
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

export default TripService;