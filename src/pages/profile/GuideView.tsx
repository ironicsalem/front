import React, { useState, useEffect, useCallback } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { User, Post } from '../../types/User';
import UserService from '../../services/UserService';
import GuideService, { Trip } from '../../services/GuideService';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Edit3, 
  Save, 
  X, 
  Plus,
  MapPin,
  Star,
  Calendar,
  Settings,
  Trash2,
  Image as ImageIcon,
  Users,
  Clock,
  DollarSign,
  Send,
  Camera
} from 'lucide-react';

interface GuideViewProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingPhoto: boolean;
  onSignOut: () => void;
  navigate: NavigateFunction;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}

const GuideView: React.FC<GuideViewProps> = ({ 
  user, 
  setUser, 
  navigate, 
  posts, 
  setPosts 
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'posts' | 'trips' | 'settings'>('profile');
  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    bio: user.bio || ''
  });
  
  // Password change states
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Post creation states
  const [showPostForm, setShowPostForm] = useState(false);
  const [postData, setPostData] = useState({
    title: '',
    content: ''
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [creatingPost, setCreatingPost] = useState(false);

  // Trip editing states
  const [editingTrip, setEditingTrip] = useState<string | null>(null);
  const [tripEditData, setTripEditData] = useState<{ [key: string]: number }>({});

  const loadTrips = useCallback(async () => {
    setLoadingTrips(true);
    try {
      const userTrips = await GuideService.getTripsForGuide(user._id);
      setTrips(userTrips);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoadingTrips(false);
    }
  }, [user._id]);

  // Load trips when trips tab is active
  useEffect(() => {
    if (activeTab === 'trips' && user._id) {
      loadTrips();
    }
  }, [activeTab, user._id, loadTrips]);

  const handleSaveProfile = async () => {
    try {
      const updatedUser = await UserService.updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      });
      setUser(updatedUser);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    try {
      await UserService.updatePassword(user._id, {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      alert('Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Failed to update password');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await GuideService.deletePost(postId);
        setPosts(prev => prev.filter(post => post._id !== postId));
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post');
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages(prev => [...prev, ...files].slice(0, 5)); // Max 5 images
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postData.title.trim() || !postData.content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setCreatingPost(true);
    try {
      const newPostResponse = await GuideService.createPost({
        title: postData.title,
        content: postData.content,
        images: selectedImages
      });
      
      // Convert PostResponse to Post format
      const newPost: Post = {
        _id: newPostResponse._id,
        title: newPostResponse.title,
        content: newPostResponse.content,
        createdAt: newPostResponse.createdAt,
        updatedAt: newPostResponse.createdAt, // Use createdAt as fallback
        author: user._id, // Use current user ID
        likes: [], // Initialize as empty array
        comments: [] // Initialize as empty array
      };
      
      setPosts(prev => [newPost, ...prev]);
      setPostData({ title: '', content: '' });
      setSelectedImages([]);
      setShowPostForm(false);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    } finally {
      setCreatingPost(false);
    }
  };

  const handleEditTripSpots = (tripId: string, currentSpots: number) => {
    setEditingTrip(tripId);
    setTripEditData({ [tripId]: currentSpots });
  };

  const handleSaveTripSpots = async (tripId: string) => {
    try {
      // This would need to be implemented in GuideService
      // await GuideService.updateTripSpots(tripId, tripEditData[tripId]);
      console.log('Updating trip spots:', tripId, tripEditData[tripId]);
      setEditingTrip(null);
      // Refresh trips
      loadTrips();
    } catch (error) {
      console.error('Error updating trip spots:', error);
      alert('Failed to update trip spots');
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        // This would need to be implemented in GuideService
        // await GuideService.deleteTrip(tripId);
        console.log('Deleting trip:', tripId);
        setTrips(prev => prev.filter(trip => trip._id !== tripId));
      } catch (error) {
        console.error('Error deleting trip:', error);
        alert('Failed to delete trip');
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
      <div className="border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
              activeTab === 'profile'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <UserIcon className="w-4 h-4" />
              <span>Profile</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
              activeTab === 'posts'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-4 h-4" />
              <span>My Posts</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('trips')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
              activeTab === 'trips'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>My Trips</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
              activeTab === 'settings'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </div>
          </button>
        </nav>
      </div>

      <div className="p-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
              <button
                onClick={() => setEditing(!editing)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  editing 
                    ? 'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100'
                    : 'text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100'
                }`}
              >
                {editing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                <span>{editing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <UserIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{user.name}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                {editing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                  />
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{user.email}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{user.phone || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</span>
                </div>
              </div>
            </div>

            {editing && (
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setEditing(false)}
                  className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center space-x-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all duration-200 font-medium"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">My Posts</h2>
              <button
                onClick={() => setShowPostForm(!showPostForm)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  showPostForm
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-amber-600 text-white hover:bg-amber-700'
                }`}
              >
                {showPostForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{showPostForm ? 'Cancel' : 'Create Post'}</span>
              </button>
            </div>

            {/* Post Creation Form */}
            {showPostForm && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Post Title</label>
                    <input
                      type="text"
                      value={postData.title}
                      onChange={(e) => setPostData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Give your post a catchy title..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    <textarea
                      value={postData.content}
                      onChange={(e) => setPostData(prev => ({ ...prev, content: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                      placeholder="Share your travel experiences, tips, or stories..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Images (Optional)</label>
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-all duration-200"
                      >
                        <div className="text-center">
                          <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <span className="text-sm text-gray-600">Click to add images (max 5)</span>
                        </div>
                      </label>
                      
                      {selectedImages.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedImages.map((file, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowPostForm(false)}
                      className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creatingPost}
                      className="flex items-center space-x-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creatingPost ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>{creatingPost ? 'Publishing...' : 'Publish Post'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Posts List */}
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <ImageIcon className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-6">Share your experiences and attract more tourists!</p>
                <button
                  onClick={() => setShowPostForm(true)}
                  className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-all duration-200 font-medium"
                >
                  Create Your First Post
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {posts.map((post) => (
                  <div key={post._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">{post.title}</h3>
                        <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-amber-400 fill-current" />
                            <span className="font-medium">{post.likes.length} likes</span>
                          </span>
                          <span className="flex items-center space-x-2">
                            <span className="font-medium">{post.comments.length} comments</span>
                          </span>
                          <span className="text-gray-400">•</span>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Trips Tab */}
        {activeTab === 'trips' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">My Trips</h2>
              <button
                onClick={() => navigate('/addtrip')}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Trip</span>
              </button>
            </div>

            {loadingTrips ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading your trips...</p>
              </div>
            ) : trips.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <MapPin className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No trips yet</h3>
                <p className="text-gray-600 mb-6">Start creating amazing travel experiences for your customers!</p>
                <button
                  onClick={() => navigate('/addtrip')}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all duration-200 font-medium"
                >
                  Create Your First Trip
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {trips.map((trip) => (
                  <div key={trip._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{trip.title}</h3>
                        <p className="text-gray-700 mb-4">{trip.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <span className="font-medium">${trip.price}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Clock className="w-4 h-4 text-blue-500" />
                            <span>{trip.duration} days</span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Users className="w-4 h-4 text-purple-500" />
                            {editingTrip === trip._id ? (
                              <input
                                type="number"
                                value={tripEditData[trip._id] || trip.maxParticipants}
                                onChange={(e) => setTripEditData(prev => ({
                                  ...prev,
                                  [trip._id]: parseInt(e.target.value)
                                }))}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                min="1"
                              />
                            ) : (
                              <span>{trip.maxParticipants} spots</span>
                            )}
                          </div>
                          <div className="text-gray-500 text-sm">
                            {new Date(trip.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {editingTrip === trip._id ? (
                          <>
                            <button
                              onClick={() => handleSaveTripSpots(trip._id)}
                              className="text-green-600 hover:text-green-700 p-2 rounded-lg hover:bg-green-50"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingTrip(null)}
                              className="text-gray-600 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-50"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditTripSpots(trip._id, trip.maxParticipants)}
                              className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50"
                              title="Edit available spots"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTrip(trip._id)}
                              className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
                              title="Delete trip"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Guide Settings</h2>
            
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                  <p className="text-sm text-gray-600">Update your account password for security</p>
                </div>
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                    showPasswordForm
                      ? 'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100'
                      : 'text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100'
                  }`}
                >
                  {showPasswordForm ? 'Cancel' : 'Change Password'}
                </button>
              </div>
              
              {showPasswordForm && (
                <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.oldPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowPasswordForm(false)}
                      className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all duration-200"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="border border-green-200 rounded-xl p-6 bg-gradient-to-r from-green-50 to-emerald-50">
              <h3 className="text-lg font-medium text-green-900 mb-2">Guide Features</h3>
              <p className="text-sm text-green-700 mb-6">
                Manage your guide-specific settings and preferences.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => navigate('/guide-dashboard')}
                  className="bg-white border border-green-300 px-6 py-4 rounded-lg hover:bg-green-100 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-green-900 group-hover:text-green-800">Guide Dashboard</div>
                      <p className="text-sm text-green-600 mt-1">View bookings and manage your tours</p>
                    </div>
                    <Settings className="w-5 h-5 text-green-600 group-hover:text-green-700" />
                  </div>
                </button>
                <button 
                  onClick={() => navigate('/availability')}
                  className="bg-white border border-green-300 px-6 py-4 rounded-lg hover:bg-green-100 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-green-900 group-hover:text-green-800">Manage Availability</div>
                      <p className="text-sm text-green-600 mt-1">Set your available dates and times</p>
                    </div>
                    <Calendar className="w-5 h-5 text-green-600 group-hover:text-green-700" />
                  </div>
                </button>
              </div>
            </div>

            <div className="border border-red-200 rounded-xl p-6 bg-gradient-to-r from-red-50 to-pink-50">
              <h3 className="text-lg font-medium text-red-900 mb-2">Danger Zone</h3>
              <p className="text-sm text-red-700 mb-6">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all duration-200 font-medium">
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideView;