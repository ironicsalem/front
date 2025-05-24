import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import GuideView from './GuideView';
import AdminView from './AdminView';
import TouristView from './TouristView';

interface User {
  _id: string;
  email: string;
  name: string;
  phone: string;
  profilePicture: string;
  bio?: string;
}

interface UserFormData {
  email: string;
  name: string;
  phone: string;
  bio: string;
}

interface Notification {
  message: string;
  type: 'success' | 'error';
}

const API_URL = 'http://localhost:5000';

const Account = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({ 
    email: '', 
    name: '', 
    phone: '', 
    bio: '' 
  });
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('No authentication token found');

        const userResponse = await axios.get(`${API_URL}/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setRole(userResponse.data.user.role);
        setUser(userResponse.data.user);
        setFormData({
          email: userResponse.data.user.email,
          name: userResponse.data.user.name,
          phone: userResponse.data.user.phone,
          bio: userResponse.data.user.bio || '',
        });

      } catch (error) {
        setNotification({ message: 'Failed to load data', type: 'error' });
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');

      const response = await axios.put(
        `${API_URL}/user/update-profile`,
        { ...formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setUser(response.data);
      setNotification({ message: 'Profile updated successfully', type: 'success' });
      setIsEditing(false);
    } catch {
      setNotification({ message: 'Failed to update profile', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    if (file.size > 2 * 1024 * 1024) {
      setNotification({ message: 'Image must be less than 2MB', type: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');
      
      const response = await axios.post(
        `${API_URL}/user/upload-profile-picture`, 
        formData, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      setUser(prev => prev ? { ...prev, profilePicture: response.data.profilePicture } : null);
      setNotification({ message: 'Profile picture updated', type: 'success' });
    } catch {
      setNotification({ message: 'Failed to upload picture', type: 'error' });
    }
  };

  const NotificationComponent = () => {
    if (!notification) return null;
    setTimeout(() => setNotification(null), 5000);
    return (
      <div className={`fixed top-4 right-4 px-4 py-2 rounded shadow-lg ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white z-50`}>
        {notification.message}
      </div>
    );
  };

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <NotificationComponent />

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Account</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-8 mb-10">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex flex-col items-center lg:items-start">
              <div className="relative w-32 h-32 mb-6">
                <img
                  src={user?.profilePicture || 'NoPic.jpg'}
                  alt="Profile"
                  className="rounded-full w-full h-full object-cover border-4 border-amber-400"
                />
                <button
                  className="absolute -bottom-3 -right-3 bg-amber-500 text-white text-sm p-2 rounded-full shadow-lg hover:bg-amber-600 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex-1 lg:pl-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Profile Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-base"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-6 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg text-base font-medium transition-colors"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              ) : (
                <div className="space-y-4 text-base">
                  <div>
                    <p className="text-gray-500 mb-1">Name</p>
                    <p className="font-medium text-lg">{formData.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Email</p>
                    <p className="font-medium text-lg">{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Phone</p>
                    <p className="font-medium text-lg">{formData.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Bio</p>
                    <p className="font-medium text-lg whitespace-pre-line">
                      {formData.bio || 'No bio yet'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {role === 'guide' && <GuideView />}
      {role === 'admin' && <AdminView />}
      {role === 'tourist' && <TouristView />}
    </div>
  );
};

export default Account;