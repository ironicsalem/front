import axios from 'axios';
import AuthService from './AuthService';
import { 
  Guide,
  Post, 
  Review, 
  Trip,
  ApiResponse
} from '../types/Types';

const API_URL = 'http://localhost:3000/guide';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = AuthService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Additional interfaces for specific operations
export interface PostCreateData {
  title: string;
  content?: string;
  images?: File[];
}

export interface PostResponse {
  _id: string;
  title: string;
  content?: string;
  images: string[];
  author: string;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const GuideService = {
  // Get guide profile by ID
  getGuide: async (guideId: string): Promise<Guide> => {
    try {
      const response = await api.get(`/${guideId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch guide profile');
      }
      throw new Error('Network error occurred');
    }
  },

  // Get trips for a specific guide
  getTripsForGuide: async (guideId: string): Promise<Trip[]> => {
    try {
      const response = await api.get(`/${guideId}/trips`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch guide trips');
      }
      throw new Error('Network error occurred');
    }
  },

  // Get reviews for a specific guide
  getGuideReviews: async (guideId: string): Promise<Review[]> => {
    try {
      const response = await api.get(`/${guideId}/reviews`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch guide reviews');
      }
      throw new Error('Network error occurred');
    }
  },

  // Get posts for current logged-in guide (requires authentication)
  getMyPosts: async (): Promise<Post[]> => {
    try {
      const response = await api.get('/posts');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch your posts');
      }
      throw new Error('Network error occurred');
    }
  },

  // Get posts for a specific guide by ID
  getGuidePosts: async (guideId: string): Promise<Post[]> => {
    try {
      const response = await api.get(`/${guideId}/posts`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch guide posts');
      }
      throw new Error('Network error occurred');
    }
  },

  // Create a new post (requires authentication)
  createPost: async (postData: PostCreateData): Promise<PostResponse> => {
    try {
      const formData = new FormData();
      formData.append('title', postData.title);
      
      if (postData.content) {
        formData.append('content', postData.content);
      }
      
      // Add images if provided (backend supports up to 4 images)
      if (postData.images && postData.images.length > 0) {
        postData.images.forEach((image) => {
          formData.append('images', image);
        });
      }

      const response = await api.post('/addPost', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to create post');
      }
      throw new Error('Network error occurred');
    }
  },

  // Delete a post (requires authentication)
  deletePost: async (postId: string): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to delete post');
      }
      throw new Error('Network error occurred');
    }
  }
};

export default GuideService;