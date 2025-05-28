// Types
export interface Location {
  name: string;
  position: {
    lat?: number;
    lng?: number;
  };
}

export interface Schedule {
  date: Date;
  time: string;
  isAvailable: boolean;
}

export interface StartLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  description?: string;
}

export interface GuideUser {
  name: string;
  phone: string;
  profilePicture?: string;
}

export interface Trip {
  _id: string;
  title: string;
  guide: string;
  city: string;
  path: Location[];
  schedule: Schedule[];
  startLocation: StartLocation;
  isAvailable: boolean;
  imageUrl?: string;
  price: number;
  description: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface TripWithGuide extends Trip {
  guideUser?: GuideUser;
}

export interface CreateTripData {
  title: string;
  city: string;
  price: number;
  description: string;
  type: string;
  schedule: Schedule[];
  path: Location[];
  startLocation: StartLocation;
  image?: File;
}

export interface UpdateTripData {
  title?: string;
  city?: string;
  price?: number;
  description?: string;
  type?: string;
  schedule?: Schedule[];
  path?: Location[];
  image?: File;
}

export interface TripsResponse {
  trips: Trip[];
  hasNextPage: boolean;
}

// API Configuration
const API_BASE_URL = 'http://localhost:3000';
const TRIP_ENDPOINTS = {
  CREATE: '/trip/create',
  GET_ALL: '/trip/trips',
  GET_BY_ID: (id: string) => `/trip/${id}`,
  GET_FOR_GUIDE: (guideId: string) => `/trip/${guideId}/trips`,
  UPDATE: (id: string) => `/trip/${id}`,
  DELETE: (id: string) => `/trip/${id}`,
};

// Utility function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

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

// Trip Service Class
class TripService {
  private baseUrl = API_BASE_URL;

  // Create a new trip
  async createTrip(tripData: CreateTripData): Promise<Trip> {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const formData = createFormData(tripData);

      const response = await fetch(`${this.baseUrl}${TRIP_ENDPOINTS.CREATE}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create trip');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating trip:', error);
      throw error instanceof Error ? error : new Error('Failed to create trip');
    }
  }

  // Get all trips with pagination
  async getTrips(page: number = 1): Promise<TripsResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}${TRIP_ENDPOINTS.GET_ALL}?page=${page}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch trips');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching trips:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch trips');
    }
  }

  // Get trip by ID
  async getTripById(id: string): Promise<TripWithGuide> {
    try {
      const response = await fetch(`${this.baseUrl}${TRIP_ENDPOINTS.GET_BY_ID(id)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch trip');
      }

      const data = await response.json();
      return {
        ...data.trip,
        guideUser: data.guideUser,
      };
    } catch (error) {
      console.error('Error fetching trip by ID:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch trip');
    }
  }

  // Get trips for a specific guide
  async getTripsForGuide(guideId: string): Promise<Trip[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}${TRIP_ENDPOINTS.GET_FOR_GUIDE(guideId)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch trips for guide');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching trips for guide:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch trips for guide');
    }
  }

  // Update trip
  async updateTrip(id: string, tripData: UpdateTripData): Promise<Trip> {
    try {
      const formData = createFormData(tripData);

      const response = await fetch(`${this.baseUrl}${TRIP_ENDPOINTS.UPDATE(id)}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update trip');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating trip:', error);
      throw error instanceof Error ? error : new Error('Failed to update trip');
    }
  }

  // Delete trip
  async deleteTrip(id: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${TRIP_ENDPOINTS.DELETE(id)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete trip');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting trip:', error);
      throw error instanceof Error ? error : new Error('Failed to delete trip');
    }
  }

  // Utility method to validate trip data before submission
  validateTripData(data: CreateTripData | UpdateTripData): string[] {
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
  }

  // Helper method to format trip data for display
  formatTripForDisplay(trip: Trip): Trip & { 
    formattedPrice: string;
    formattedSchedule: string[];
  } {
    return {
      ...trip,
      formattedPrice: `$${trip.price.toFixed(2)}`,
      formattedSchedule: trip.schedule.map(item => 
        `${new Date(item.date).toLocaleDateString()} at ${item.time}`
      ),
    };
  }
}

// Export singleton instance
export const tripService = new TripService();
export default tripService;