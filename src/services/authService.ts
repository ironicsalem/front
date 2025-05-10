// src/services/authService.ts

import axios from 'axios';

// Define your API base URL - change this to your Express.js backend URL
const API_URL = 'http://localhost:3000/api';

// Interface for login data
interface LoginData {
  email: string;
  password: string;
}

// Interface for registration data
interface RegisterData {
  username: string;
  email: string;
  password: string;
}

// Interface for user data
interface User {
  _id: string;
  username: string;
  email: string;
}

/**
 * Login user
 * @param {LoginData} loginData - User's login credentials
 * @returns {Promise<{token: string, user: User}>} - JWT token and user data
 */
export const loginUser = async (loginData: LoginData): Promise<{token: string, user: User}> => {
  const response = await axios.post(`${API_URL}/auth/login`, loginData);
  
  // Store JWT token in localStorage
  if (response.data.token) {
    localStorage.setItem('authToken', response.data.token);
  }
  
  return response.data;
};

/**
 * Register new user
 * @param {RegisterData} registerData - User's registration data
 * @returns {Promise<{token: string, user: User}>} - JWT token and user data
 */
export const registerUser = async (registerData: RegisterData): Promise<{token: string, user: User}> => {
  const response = await axios.post(`${API_URL}/auth/register`, registerData);
  
  // Store JWT token in localStorage
  if (response.data.token) {
    localStorage.setItem('authToken', response.data.token);
  }
  
  return response.data;
};

/**
 * Logout user
 * @returns {Promise<void>}
 */
export const logoutUser = async (): Promise<void> => {
  // This try/catch is necessary to ensure we always remove the token
  // even if the API call fails
  try {
    // Call the backend to invalidate the token (if you're tracking active tokens)
    const token = localStorage.getItem('authToken');
    if (token) {
      await axios.post(
        `${API_URL}/auth/logout`, 
        {}, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    }
  } catch (error) {
    console.error('Logout error:', error);
    // Continue execution to remove token
  } finally {
    // Always remove token from localStorage
    localStorage.removeItem('authToken');
  }
};

/**
 * Get current authenticated user
 * @returns {Promise<User>} - User data
 */
export const getCurrentUser = async (): Promise<User> => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  const response = await axios.get(
    `${API_URL}/auth/me`, 
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  
  return response.data;
};

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} - Authentication status
 */
export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      return false;
    }
    
    // Verify token with backend
    const response = await axios.get(
      `${API_URL}/auth/verify`, 
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data.valid === true;
  } catch (error) {
    console.error('Auth verification error:', error);
    return false;
  }
};