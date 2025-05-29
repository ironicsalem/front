import axios from 'axios';
import { PopulatedReview, ApiResponse } from '../types/Types';

const API_URL = 'http://localhost:3000/review';

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

// Handle token expiration
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

// Interfaces for review operations
export interface CreateReviewData {
  content: string;
  rating: number;
  guideId: string;
  images?: FileList | File[];
}

export interface UpdateReviewData {
  content?: string;
  rating?: number;
}

const ReviewService = {
  // Create a new review - matches POST / (requires auth)
  createReview: async (reviewData: CreateReviewData): Promise<PopulatedReview> => {
    try {
      const formData = new FormData();
      formData.append('content', reviewData.content);
      formData.append('rating', reviewData.rating.toString());
      formData.append('guideId', reviewData.guideId);

      // Add images if provided
      if (reviewData.images) {
        const files = Array.from(reviewData.images);
        files.forEach((file) => {
          formData.append('images', file);
        });
      }

      // Use the base axios instance instead of api instance for multipart/form-data
      const response = await axios.post(`${API_URL}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          localStorage.removeItem('token');
          window.dispatchEvent(new Event('auth-error'));
        }
        throw new Error(error.response.data.message || 'Failed to create review');
      }
      throw new Error('Network error occurred');
    }
  },

  // Get all reviews for a specific guide - matches GET /:guideId
  getGuideReviews: async (guideId: string): Promise<PopulatedReview[]> => {
    try {
      const response = await api.get(`/${guideId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to get guide reviews');
      }
      throw new Error('Network error occurred');
    }
  },

  // Get reviews for the current user's guide - matches GET /my-reviews (requires auth)
  getMyReviews: async (): Promise<PopulatedReview[]> => {
    try {
      const response = await api.get('/my-reviews');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          throw new Error(error.response.data.message || 'Unauthorized');
        }
        throw new Error(error.response.data.message || 'Failed to get reviews');
      }
      throw new Error('Network error occurred');
    }
  },

  // Update a review - matches PUT /:reviewId (requires auth)
  updateReview: async (reviewId: string, updateData: UpdateReviewData): Promise<PopulatedReview> => {
    try {
      console.log('ReviewService: Updating review with ID:', reviewId);
      console.log('ReviewService: Update data:', updateData);
      
      // Ensure we have valid data
      const cleanData: UpdateReviewData = {};
      if (updateData.content !== undefined && updateData.content !== null) {
        cleanData.content = updateData.content.toString();
      }
      if (updateData.rating !== undefined && updateData.rating !== null) {
        cleanData.rating = Number(updateData.rating);
      }
      
      console.log('ReviewService: Clean data being sent:', cleanData);
      
      const response = await api.put(`/${reviewId}`, cleanData);
      return response.data;
    } catch (error) {
      console.error('ReviewService: Error in updateReview:', error);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          throw new Error(error.response.data.message || 'Unauthorized');
        }
        if (error.response.status === 403) {
          throw new Error(error.response.data.message || 'Not authorized to update this review');
        }
        throw new Error(error.response.data.message || 'Failed to update review');
      }
      throw new Error('Network error occurred');
    }
  },

  // Delete a review - matches DELETE /:reviewId (requires auth)
  deleteReview: async (reviewId: string): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete(`/${reviewId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          throw new Error(error.response.data.message || 'Unauthorized');
        }
        if (error.response.status === 403) {
          throw new Error(error.response.data.message || 'Not authorized to delete this review');
        }
        throw new Error(error.response.data.message || 'Failed to delete review');
      }
      throw new Error('Network error occurred');
    }
  },
};

export default ReviewService;