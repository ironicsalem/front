import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import  {useNavigate}  from 'react-router-dom';
import GuideView from './GuideView';
import AdminView from './AdminView';

interface User {
  _id: string;
  email: string;
  name: string;
  phone: string;
  profilePicture: string;
}

interface UserFormData {
  email: string;
  name: string;
  phone: string;
}

interface Notification {
  message: string;
  type: 'success' | 'error';
}

const API_URL = 'http://localhost:5000';

const Account = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({ email: '', name: '', phone: '' });
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

        // Fetch user data
        const userResponse = await axios.get(`${API_URL}/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRole(userResponse.data.user.role);
        setUser(userResponse.data.user);
        setFormData({
          email: userResponse.data.user.email,
          name: userResponse.data.user.name,
          phone: userResponse.data.user.phone,
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <NotificationComponent />

      {/* Profile Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Account</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 mb-4">
                <img
                  src={user?.profilePicture || '/NoPic.jpg'}
                  alt="Profile"
                  className="rounded-full w-full h-full object-cover border-2 border-amber-400"
                />
                <button
                  className="absolute -bottom-2 -right-2 bg-amber-500 text-white text-xs p-1 rounded-full shadow-md hover:bg-amber-600"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Profile Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Edit
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded text-sm"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              ) : (
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium">{formData.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{formData.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium">{formData.phone || 'Not provided'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {role === 'guide' && <GuideView />}
      {role === 'admin' && <AdminView />}
    </div>
  );
};

export default Account;