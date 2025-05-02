// src/services/userService.ts

import axios from 'axios';

// Define your API base URL - change this to your Express.js backend URL
const API_URL = 'http://localhost:5000/api';

// Get the authentication header
const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

/**
 * Update user profile
 * @param {Object} profileData - User profile data to update
 * @returns {Promise<Object>} - Updated user data
 */
export const updateProfile = async (profileData: {
  name?: string;
  email?: string;
  phone_number?: string;
}) => {
  const response = await axios.put(
    `${API_URL}/users/profile`,
    profileData,
    getAuthHeader()
  );
  return response.data;
};

/**
 * Update user password
 * @param {Object} passwordData - Password data with current and new password
 * @returns {Promise<Object>} - Response data
 */
export const updatePassword = async (passwordData: {
  currentPassword: string;
  newPassword: string;
}) => {
  const response = await axios.put(
    `${API_URL}/users/password`,
    passwordData,
    getAuthHeader()
  );
  return response.data;
};

/**
 * Delete user account
 * @returns {Promise<Object>} - Response data
 */
export const deleteAccount = async () => {
  const response = await axios.delete(
    `${API_URL}/users/account`,
    getAuthHeader()
  );
  return response.data;
};

/**
 * Get user profile data
 * @returns {Promise<Object>} - User profile data
 */
export const getUserProfile = async () => {
  const response = await axios.get(
    `${API_URL}/users/profile`,
    getAuthHeader()
  );
  return response.data;
};

/**
 * Upload user profile image
 * @param {FormData} formData - Form data with image file
 * @returns {Promise<Object>} - Response with image URL
 */
export const uploadProfileImage = async (formData: FormData) => {
  const response = await axios.post(
    `${API_URL}/users/profile/image`,
    formData,
    {
      ...getAuthHeader(),
      headers: {
        ...getAuthHeader().headers,
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return response.data;
};