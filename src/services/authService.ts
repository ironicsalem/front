import axios from 'axios';
import { BaseUser, LoginRequest, LoginResponse, RegisterResponse, CreateUserRequest, ApiResponse } from '../types/Types';

const API_URL = 'http://localhost:3000/auth';

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

// Additional interfaces for auth operations not covered in Types.ts
export interface VerifyEmailData {
  email: string;
  code: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface VerifyResetCodeData {
  email: string;
  code: string;
}

export interface SetNewPasswordData {
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user?: BaseUser;
  valid?: boolean;
}

const AuthService = {
  // Sign up a new user - matches POST /signup
  signUp: async (userData: CreateUserRequest): Promise<RegisterResponse> => {
    try {
      const response = await api.post('/signup', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Handle rate limiting specifically
        if (error.response.status === 429) {
          throw new Error('Too many requests. Please try again later.');
        }
        throw new Error(error.response.data.error || 'Failed to sign up');
      }
      throw new Error('Network error occurred');
    }
  },

  // Sign in an existing user - matches POST /signin
  signIn: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await api.post('/signin', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Handle rate limiting specifically
        if (error.response.status === 429) {
          throw new Error('Too many requests. Please try again later.');
        }
        throw new Error(error.response.data.error || 'Failed to sign in');
      }
      throw new Error('Network error occurred');
    }
  },

  // Sign out the current user - matches POST /signout
  signOut: async (): Promise<ApiResponse<null>> => {
    try {
      const response = await api.post('/signout');
      localStorage.removeItem('token');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Failed to sign out');
      }
      throw new Error('Network error occurred');
    }
  },

  // Request password reset - matches POST /forgot-password (rate limited)
  forgotPassword: async (data: ResetPasswordData): Promise<ApiResponse<null>> => {
    try {
      const response = await api.post('/forgot-password', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Handle rate limiting specifically for this endpoint
        if (error.response.status === 429) {
          throw new Error('Too many requests. Please try again later.');
        }
        throw new Error(error.response.data.error || 'Failed to request password reset');
      }
      throw new Error('Network error occurred');
    }
  },

  // Verify reset code - matches POST /verify-reset-code (rate limited)
  verifyResetCode: async (data: VerifyResetCodeData): Promise<ApiResponse<{ token?: string }>> => {
    try {
      const response = await api.post('/verify-reset-code', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Handle rate limiting specifically for this endpoint
        if (error.response.status === 429) {
          throw new Error('Too many requests. Please try again later.');
        }
        throw new Error(error.response.data.error || 'Invalid or expired reset code');
      }
      throw new Error('Network error occurred');
    }
  },

  // Set new password after reset - matches POST /set-new-password (rate limited)
  setNewPassword: async (data: SetNewPasswordData): Promise<ApiResponse<null>> => {
    try {
      const response = await api.post('/set-new-password', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Handle rate limiting specifically for this endpoint
        if (error.response.status === 429) {
          throw new Error('Too many requests. Please try again later.');
        }
        throw new Error(error.response.data.error || 'Failed to set new password');
      }
      throw new Error('Network error occurred');
    }
  },

  // Verify email with verification code - matches POST /verify-email
  verifyEmail: async (verifyData: VerifyEmailData): Promise<ApiResponse<null>> => {
    try {
      const response = await api.post('/verify-email', verifyData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Failed to verify email');
      }
      throw new Error('Network error occurred');
    }
  },

  // Verify the current user's token - matches GET /verify (requires token)
  verifyToken: async (): Promise<ApiResponse<{ user?: BaseUser }>> => {
    try {
      const response = await api.get('/verify');
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      if (axios.isAxiosError(error) && error.response) {
        // Handle specific middleware responses
        if (error.response.status === 401) {
          throw new Error(error.response.data.message || 'Unauthorized');
        }
        throw new Error(error.response.data.message || 'Invalid token');
      }
      throw new Error('Network error occurred');
    }
  },

  // Resend verification email - matches POST /resend-verification-email
  resendVerificationEmail: async (email: string): Promise<ApiResponse<null>> => {
    try {
      const response = await api.post('/resend-verification-email', { email });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Failed to resend verification email');
      }
      throw new Error('Network error occurred');
    }
  },

  // Get current user data - matches GET /current-user (requires token)
  getCurrentUser: async (): Promise<BaseUser> => {
    try {
      const response = await api.get('/current-user');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Handle specific middleware responses
        if (error.response.status === 401) {
          localStorage.removeItem('token'); // Remove invalid token
          throw new Error(error.response.data.message || 'Unauthorized');
        }
        throw new Error(error.response.data.message || 'Failed to get current user');
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

export default AuthService;