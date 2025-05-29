import { Trip, PopulatedGuide } from '../types/Types';

// City interface - assuming structure based on your cities.json
interface City {
  name: string;
  [key: string]: unknown; // Additional city properties from your cities.json
}

const API_BASE_URL = 'http://localhost:3000'; // Adjust this to match your backend URL

const CityService = {
  /**
   * Get city information by name
   * @param cityName - The name of the city
   * @returns Promise containing city data
   */
  getCityByName: async (cityName: string): Promise<City> => {
    try {
      const response = await fetch(`${API_BASE_URL}/city/${encodeURIComponent(cityName)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include credentials for CORS
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('City not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const city: City = await response.json();
      return city;
    } catch (error) {
      console.error('Error fetching city:', error);
      throw error;
    }
  },

  /**
   * Get all trips for a specific city
   * @param cityName - The name of the city
   * @returns Promise containing array of trips
   */
  getTripsByCity: async (cityName: string): Promise<Trip[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/city/${encodeURIComponent(cityName)}/trips`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const trips: Trip[] = await response.json();
      return trips;
    } catch (error) {
      console.error('Error fetching trips by city:', error);
      throw error;
    }
  },

  /**
   * Get all guides for a specific city
   * @param cityName - The name of the city
   * @returns Promise containing array of guides with populated user data
   */
  getGuidesByCity: async (cityName: string): Promise<PopulatedGuide[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/city/${encodeURIComponent(cityName)}/guides`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const guides: PopulatedGuide[] = await response.json();
      return guides;
    } catch (error) {
      console.error('Error fetching guides by city:', error);
      throw error;
    }
  },
};

export default CityService;
export type { City };