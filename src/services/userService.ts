import axios from 'axios';
import AuthService from './AuthService';
import { 
  BaseUser, 
  Post, 
  Comment, 
  Review, 
  UpdateUserRequest,
  ApiResponse
} from '../types/Types';

const API_URL = 'http://localhost:3000/user';

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
export interface PasswordUpdateData {
  oldPassword: string;
  newPassword: string;
}

export interface EmailUpdateData {
  newEmail: string;
}

export interface ContactUpdateData {
  phone: string;
}

export interface CommentData {
  content: string;
}

export interface ReviewData {
  content: string;
  rating: number;
}

export interface RatingData {
  rating: number;
}

const UserService = {
  // Get current user profile - matches GET /profile
  getUserProfile: async (): Promise<BaseUser> => {
    try {
      const response = await api.get('/profile');
      return response.data.user;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch user profile');
      }
      throw new Error('Network error occurred');
    }
  },

  // Update user profile - matches PUT /update-profile (requires auth)
  updateProfile: async (profileData: UpdateUserRequest): Promise<BaseUser> => {
    try {
      const response = await api.put('/update-profile', profileData);
      return response.data.user;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to update profile');
      }
      throw new Error('Network error occurred');
    }
  },

  // Update user password - matches PUT /:userId/password (requires auth)
  updatePassword: async (userId: string, passwordData: PasswordUpdateData): Promise<BaseUser> => {
    try {
      const response = await api.put(`/${userId}/password`, passwordData);
      return response.data.user;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to update password');
      }
      throw new Error('Network error occurred');
    }
  },

  // Update user email - matches PUT /:userId/email (requires auth)
  updateEmail: async (userId: string, emailData: EmailUpdateData): Promise<BaseUser> => {
    try {
      const response = await api.put(`/${userId}/email`, emailData);
      return response.data.user;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to update email');
      }
      throw new Error('Network error occurred');
    }
  },

  // Update contact information - matches PUT /:userId/contact-info (requires auth)
  updateContactInfo: async (userId: string, contactData: ContactUpdateData): Promise<BaseUser> => {
    try {
      const response = await api.put(`/${userId}/contact-info`, contactData);
      return response.data.user;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to update contact information');
      }
      throw new Error('Network error occurred');
    }
  },

  // Add like to post - matches POST /posts/:postId/likes (requires auth)
  addLike: async (postId: string): Promise<{ message: string, post: Post }> => {
    try {
      const response = await api.post(`/posts/${postId}/likes`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to like post');
      }
      throw new Error('Network error occurred');
    }
  },

  // Add a comment to a post - matches POST /:userId/posts/:postId/comments (requires auth)
  addComment: async (userId: string, postId: string, commentData: CommentData): Promise<{ message: string, comment: Comment }> => {
    try {
      const response = await api.post(`/${userId}/posts/${postId}/comments`, commentData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to add comment');
      }
      throw new Error('Network error occurred');
    }
  },

  // Add a review to a guide - matches POST /:userId/guides/:guideId/reviews (requires auth)
  addReview: async (userId: string, guideId: string, reviewData: ReviewData): Promise<{ message: string, review: Review }> => {
    try {
      const response = await api.post(`/${userId}/guides/${guideId}/reviews`, reviewData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to add review');
      }
      throw new Error('Network error occurred');
    }
  },

  // Rate a guide - matches POST /guides/:id/rate/:userId (requires auth)
  rateGuide: async (guideId: string, userId: string, ratingData: RatingData): Promise<{ message: string, average: number }> => {
    try {
      const response = await api.post(`/guides/${guideId}/rate/${userId}`, ratingData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to rate guide');
      }
      throw new Error('Network error occurred');
    }
  },

  // Delete a review - matches DELETE /reviews/:userId/:guideId/:reviewId (NO auth required in backend)
  deleteReview: async (userId: string, guideId: string, reviewId: string): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete(`/reviews/${userId}/${guideId}/${reviewId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to delete review');
      }
      throw new Error('Network error occurred');
    }
  },

  // Upload profile picture - matches POST /upload-profile-picture (requires auth)
  uploadProfilePicture: async (pictureData: FormData): Promise<{ profilePicture: string }> => {
    try {
      const response = await api.post('/upload-profile-picture', pictureData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to upload profile picture');
      }
      throw new Error('Network error occurred');
    }
  },
};

export default UserService;