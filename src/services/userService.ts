import axios from 'axios';
import AuthService from './AuthService';
import { User, Post, Comment, Review } from '../types/User';

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

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  phone?: string;
}

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

export interface ProfilePictureData {
  file: File;
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
  // Get current user profile
  getUserProfile: async (): Promise<User> => {
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

  // Update user profile
  updateProfile: async (profileData: ProfileUpdateData): Promise<User> => {
    try {
      const response = await api.put('/profile', profileData);
      return response.data.user;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to update profile');
      }
      throw new Error('Network error occurred');
    }
  },

  // Update user password
  updatePassword: async (userId: string, passwordData: PasswordUpdateData): Promise<{ message: string }> => {
    try {
      const response = await api.put(`/${userId}/password`, passwordData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to update password');
      }
      throw new Error('Network error occurred');
    }
  },

  // Update user email
  updateEmail: async (userId: string, emailData: EmailUpdateData): Promise<User> => {
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

  // Update contact information
  updateContactInfo: async (userId: string, contactData: ContactUpdateData): Promise<User> => {
    try {
      const response = await api.put(`/${userId}/contact`, contactData);
      return response.data.user;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to update contact information');
      }
      throw new Error('Network error occurred');
    }
  },

  // Upload profile picture
  uploadProfilePicture: async (pictureData: FormData): Promise<{ profilePicture: string }> => {
    try {
      const response = await api.post('/profile-picture', pictureData, {
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

  // Like/unlike a post
  toggleLike: async (userId: string, postId: string): Promise<{ message: string, post: Post }> => {
    try {
      const response = await api.post(`/${userId}/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to like/unlike post');
      }
      throw new Error('Network error occurred');
    }
  },

  // Add a comment to a post
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

  // Delete a comment
  deleteComment: async (userId: string, postId: string, commentId: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/${userId}/posts/${postId}/comments/${commentId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to delete comment');
      }
      throw new Error('Network error occurred');
    }
  },

  // Add a review to a guide
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

  // Delete a review
  deleteReview: async (userId: string, guideId: string, reviewId: string): Promise<{ message: string }> => {
    try {
      const response = await api.delete(`/${userId}/guides/${guideId}/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to delete review');
      }
      throw new Error('Network error occurred');
    }
  },

  // Rate a guide
  rateGuide: async (userId: string, guideId: string, ratingData: RatingData): Promise<{ message: string, average: number }> => {
    try {
      const response = await api.post(`/guides/${guideId}/rate/${userId}`, ratingData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to rate guide');
      }
      throw new Error('Network error occurred');
    }
  }
};

export default UserService;
