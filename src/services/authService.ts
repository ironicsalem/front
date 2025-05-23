import axios from 'axios';
import { User } from '../types/User';

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

export interface SignUpData {
  username: string;
  email: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
}

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
  user?: User;
  valid?: boolean;
}

const AuthService = {
  // Sign up a new user
  signUp: async (userData: SignUpData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/signup', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Failed to sign up');
      }
      throw new Error('Network error occurred');
    }
  },

  // Sign in an existing user
  signIn: async (credentials: SignInData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/signin', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Failed to sign in');
      }
      throw new Error('Network error occurred');
    }
  },

  // Sign out the current user
  signOut: async (): Promise<AuthResponse> => {
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

  // Verify email with verification code
  verifyEmail: async (verifyData: VerifyEmailData): Promise<AuthResponse> => {
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

  // Resend verification email
  resendVerificationEmail: async (email: string): Promise<AuthResponse> => {
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

  // Request password reset
  forgotPassword: async (data: ResetPasswordData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/forgot-password', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Failed to request password reset');
      }
      throw new Error('Network error occurred');
    }
  },

  // Verify reset code
  verifyResetCode: async (data: VerifyResetCodeData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/verify-reset-code', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Invalid or expired reset code');
      }
      throw new Error('Network error occurred');
    }
  },

  // Set new password after reset
  setNewPassword: async (data: SetNewPasswordData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/set-new-password', data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Failed to set new password');
      }
      throw new Error('Network error occurred');
    }
  },

  // Verify the current user's token
  verifyToken: async (): Promise<AuthResponse> => {
    try {
      const response = await api.get('/verify');
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Invalid token');
      }
      throw new Error('Network error occurred');
    }
  },

  // Get current user data
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get('/current-user');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
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
