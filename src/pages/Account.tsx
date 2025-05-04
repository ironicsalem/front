import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

interface Post {
  _id: string;
  title: string;
  content: string;
  image: string;
  createdAt: string;
}

const API_URL = 'http://localhost:5000';

const Account = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({ email: '', name: '', phone: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [postImage, setPostImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('No authentication token found');
        const response = await axios.get(`${API_URL}/auth/current-user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        setFormData({
          email: response.data.email,
          name: response.data.name,
          phone: response.data.phone,
        });
      } catch {
        setNotification({ message: 'Failed to load account information', type: 'error' });
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('No authentication token found');
        const response = await axios.get(`${API_URL}/posts/my-posts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(response.data);
      } catch {
        setNotification({ message: 'Failed to load posts', type: 'error' });
      }
    };

    fetchUserData();
    fetchPosts();
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser(response.data);
      setNotification({ message: 'Profile updated successfully', type: 'success' });
      setIsEditing(false);
    } catch {
      setNotification({ message: 'Failed to update profile. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const formData = new FormData();
    formData.append('profilePicture', e.target.files[0]);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');
      const response = await axios.post(`${API_URL}/user/upload-profile-picture`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setUser({ ...user!, profilePicture: response.data.profilePicture });
      setNotification({ message: 'Profile picture updated successfully', type: 'success' });
    } catch {
      setNotification({ message: 'Failed to upload profile picture', type: 'error' });
    }
  };

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found');
      const formData = new FormData();
      formData.append('title', newPost.title);
      formData.append('content', newPost.content);
      if (postImage) formData.append('image', postImage);
      const res = await axios.post(`${API_URL}/posts`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setPosts([res.data, ...posts]);
      setNewPost({ title: '', content: '' });
      setPostImage(null);
      setNotification({ message: 'Post added successfully', type: 'success' });
    } catch {
      setNotification({ message: 'Failed to add post', type: 'error' });
    }
  };

  const NotificationComponent = () => {
    if (!notification) return null;
    return (
      <div
        className={`fixed top-4 right-4 px-4 py-2 rounded shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}
      >
        {notification.message}
        <button className="ml-2 font-bold" onClick={() => setNotification(null)}>
          ×
        </button>
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <NotificationComponent />
      <div className="mb-8 border-b pb-4">
        <h1 className="text-4xl font-extrabold text-gray-800 inline-flex items-center justify-center space-x-2">
          <span>Your Account</span>
        </h1>
      </div>

      <div className="bg-white shadow-md rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="flex flex-col items-center">
          <div className="relative w-40 h-40 mb-4">
            <img
              src={user?.profilePicture || '/NoPic.jpg'}
              alt="Profile"
              className="rounded-full w-full h-full object-cover border-4 border-amber-500"
            />
            <button
              className="absolute bottom-0 right-0 bg-amber-500 text-white text-xs px-2 py-1 rounded-full shadow-md"
              onClick={() => fileInputRef.current?.click()}
            >
              Edit
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          {/* <p className="text-lg font-semibold">{user?.name || 'Your Name'}</p>
          <p className="text-gray-500">{user?.email}</p>
          <p className="text-gray-500">{user?.phone || 'Phone not provided'}</p> */}
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Profile Information</h2>
            {!isEditing && (
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>

          {!isEditing ? (
            <div className="space-y-3 text-gray-800">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{formData.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p>{formData.name || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p>{formData.phone || 'Not provided'}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {['email', 'name', 'phone'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 capitalize">{field}</label>
                  <input
                    type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                    name={field}
                    value={(formData as any)[field]}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 px-3 py-2"
                    required={field === 'email'}
                  />
                </div>
              ))}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Add a New Post</h2>
        <form onSubmit={handleAddPost} className="space-y-4 mb-8">
          <input
            type="text"
            name="title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            placeholder="Title"
            className="w-full px-4 py-2 border border-gray-300 rounded"
            required
          />
          <textarea
            name="content"
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            placeholder="Content"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files) setPostImage(e.target.files[0]);
            }}
            className="block"
          />
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded"
          >
            Post
          </button>
        </form>

          <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center text-gray-500 text-lg">No posts yet</div>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="bg-white shadow rounded-xl p-4">
                <h3 className="text-xl font-semibold">{post.title}</h3>
                <p className="text-gray-700 mb-2">{post.content}</p>
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full max-h-[400px] object-cover rounded"
                  />
                )}
                <p className="text-sm text-gray-400 mt-2">
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
    </div>
  </div>
  );
};

export default Account;
