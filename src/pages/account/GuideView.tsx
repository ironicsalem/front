import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  User as UserIcon,
  Mail,
  Phone,
  X,
  Plus,
  MapPin,
  Star,
  Calendar,
  Trash2,
  Image as ImageIcon,
  Clock,
  DollarSign,
  Send,
  Camera,
  Users,
  Check,
  XCircle
} from 'lucide-react';

const API_URL = 'http://localhost:3000';

interface Post {
  _id: string;
  title: string;
  content: string;
  images: string[];
  createdAt: string;
}

interface PostImage {
  file: File;
  preview: string;
}

interface NewPostState {
  title: string;
  content: string;
  images: PostImage[];
}

interface User {
  _id: string;
  name: string;
  profilePicture?: string;
  email?: string;
  phone?: string;
  createdAt?: string;
}

interface Trip {
  _id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  path: string[];
  imageUrl: string;
  maxParticipants?: number;
}

interface Review {
  _id: string;
  author: {
    name: string;
    profilePicture?: string;
  };
images: string[];  rating: number;
  content: string;
  createdAt: string;
}

interface Booking {
  _id: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  contactEmail: string;
  contactPhone: string;
  trip: {
    title: string;
    city: string;
    imageUrl?: string;
    price?: number;
    path?: { name: string }[];
  };
}
const GuideView = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'trips' | 'reviews' | 'profile' | 'bookings'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState<NewPostState>({ title: '', content: '', images: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${API_URL}/auth/verify`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUser(response.data.user);
        fetchTrips(response.data.user._id);
        fetchReviews();
        fetchBookings();
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    const fetchTrips = async (userId: string) => {
      setIsLoadingTrips(true);
      try {
        const tripsResponse = await axios.get(`${API_URL}/guide/${userId}/trips`);
        setTrips(tripsResponse.data || []);
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setIsLoadingTrips(false);
      }
    };

    const fetchReviews = async () => {
      setIsLoadingReviews(true);
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${API_URL}/review/reviewsNagham`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setReviews(response.data || []);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    const fetchBookings = async () => {
      setIsLoadingBookings(true);
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${API_URL}/booking/guide-bookings`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setBookings(Array.isArray(response.data)?response.data : []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setIsLoadingBookings(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_URL}/guide/posts`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        setPosts(response.data || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title) return;

    const formData = new FormData();
    formData.append('title', newPost.title);
    formData.append('content', newPost.content);
    newPost.images.forEach(image => {
      formData.append('images', image.file);
    });

    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/guide/addPost`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setPosts(prev => [response.data, ...prev]);
      setNewPost({ title: '', content: '', images: [] });
      setShowPostForm(false);
    } catch (error) {
      console.error('Error adding post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await axios.delete(`${API_URL}/guide/posts/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      setPosts(posts.filter(post => post._id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files).slice(0, 4 - newPost.images.length);

    const newImages: PostImage[] = fileArray.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setNewPost(prev => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  };

  const removeImage = (index: number) => {
    setNewPost(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const updateBookingStatus = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.patch(
        `${API_URL}/booking/${bookingId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setBookings(bookings?.map(booking => 
        booking._id === bookingId ? { ...booking, status } : booking
      ));
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
      <div className="border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <nav className="flex space-x-8 px-6">
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
            onClick={() => setActiveTab('bookings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
              activeTab === 'bookings'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Bookings</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
              activeTab === 'reviews'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4" />
              <span>Reviews</span>
            </div>
          </button>
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
        </nav>
      </div>

      <div className="p-6">
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
                <form onSubmit={handleAddPost} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Post Title</label>
                    <input
                      type="text"
                      value={newPost.title}
                      onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Give your post a catchy title..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    <textarea
                      value={newPost.content}
                      onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
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
                        onChange={handleAddImages}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-all duration-200"
                      >
                        <div className="text-center">
                          <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <span className="text-sm text-gray-600">Click to add images (max 4)</span>
                        </div>
                      </label>
                      
                      {newPost.images.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {newPost.images.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={image.preview}
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
                      disabled={isLoading}
                      className="flex items-center space-x-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>{isLoading ? 'Publishing...' : 'Publish Post'}</span>
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
                  <div
                    key={post._id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Author Info */}
                        <div className="flex items-center space-x-3 mb-3">
                          <img
                            src={user?.profilePicture || '/NoPic.jpg'}
                            alt="Author"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-sm">{user?.name || 'You'}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(post.createdAt).toLocaleDateString()} •{' '}
                              {new Date(post.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Title & Content */}
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">{post.title}</h3>
                        <p className="text-gray-700 mb-4 leading-relaxed whitespace-pre-line">{post.content}</p>

                        {/* Image Grid */}
                        {post.images?.length > 0 && (
                          <div
                            className={`grid gap-2 mt-3 ${
                              post.images.length === 1
                                ? 'grid-cols-1'
                                : post.images.length === 2
                                ? 'grid-cols-2'
                                : post.images.length === 3
                                ? 'grid-cols-3'
                                : 'grid-cols-2'
                            }`}
                          >
                            {post.images.slice(0, 4).map((image, index) => {
                              let className = 'aspect-[4/3]'; // default wide

                              if (post.images.length === 3) {
                                // Make first image span 2 cols
                                className = index === 0 ? 'col-span-2 aspect-video' : 'aspect-square';
                              } else if (post.images.length === 1) {
                                className = 'aspect-video';
                              } else {
                                className = 'aspect-square';
                              }

                              return (
                                <div key={index} className={`relative ${className}`}>
                                  <img
                                    src={image}
                                    alt={`Post ${index}`}
                                    className="w-full h-full object-cover rounded-md"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Delete Button */}
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
                className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Trip</span>
              </button>
            </div>

            {isLoadingTrips ? (
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
                  className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all duration-200 font-medium"
                >
                  Create Your First Trip
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trips.map((trip) => (
                  <div key={trip._id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200">
                    <img 
                      src={trip.imageUrl || '/group.jpg'} 
                      alt={trip.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{trip.title}</h3>
                      <p className="text-gray-700 mb-4 line-clamp-2">{trip.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span className="font-medium">${trip.price}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span>{trip.duration} days</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <MapPin className="w-4 h-4 text-red-500" />
                          <span>{trip.path?.length || 0} locations</span>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => navigate(`/edit-trip/${trip._id}`)}
                          className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-all duration-200 text-sm font-medium"
                        >
                          Edit Trip
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Trip Bookings</h2>

          {isLoadingBookings ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading your bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Users className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600">You haven't received any trip bookings yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    
                    {/* Trip Info */}
                    <div className="flex items-start space-x-4 flex-1">
                      <img
                        src={booking.trip.imageUrl || '/group.jpg'}
                        alt={booking.trip.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{booking.trip.title}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1.5" />
                            <span>{new Date(booking.scheduledDate).toLocaleDateString()} @ {booking.scheduledTime}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1.5" />
                            <span>{booking.trip.city}</span>
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1.5" />
                            <span>${booking.trip.price ?? 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="flex items-center space-x-3">
                      <div className="bg-amber-100 rounded-full p-2">
                        <UserIcon className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{booking.contactEmail}</p>
                        <p className="text-sm text-gray-500">{booking.contactPhone}</p>
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col items-end space-y-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>

                      {booking.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 text-sm"
                          >
                            <Check className="w-4 h-4" />
                            <span>Confirm</span>
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 text-sm"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Your Reviews</h2>
            
            {isLoadingReviews ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading your reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Star className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-600">You haven't received any reviews yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review._id} className="border border-gray-200 rounded-xl p-6 bg-gradient-to-r from-white to-amber-50">
                    <div className="flex items-start space-x-4">
                      <div className="bg-amber-100 rounded-full p-3">
                        {review.author.profilePicture ? (
                          <img 
                            src={review.author.profilePicture} 
                            alt={review.author.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <UserIcon className="w-6 h-6 text-amber-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="font-medium text-gray-900">
                            {review.author.name}
                          </span>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < review.rating ? 'text-amber-400' : 'text-gray-300'}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-4">
                          {review.content}
                        </p>
                        
                        {/* Review Images */}
                        {review.images?.length > 0 && (
                          <div className={`grid gap-2 mt-3 ${
                            review.images.length === 1 ? 'grid-cols-1' :
                            review.images.length === 2 ? 'grid-cols-2' :
                            review.images.length === 3 ? 'grid-cols-2' : 'grid-cols-2'
                          }`}>
                            {review.images.slice(0, 4).map((image, index) => (
                              <div
                                key={index}
                                className={`relative aspect-square ${
                                  review.images.length === 3 && index === 0 ? 'row-span-2' : ''
                                }`}
                              >
                                <img
                                  src={image}
                                  alt={`Review ${index}`}
                                  className="w-full h-full object-cover rounded-md hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <span className="text-sm text-gray-500 mt-2 block">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && user && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{user.name}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{user.email || 'Not provided'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{user.phone || 'Not provided'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Profile Picture</h3>
                  <p className="text-sm text-gray-600">Update your profile photo</p>
                </div>
                <button
                  className="px-4 py-2 text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-all duration-200"
                >
                  Change Photo
                </button>
              </div>
              <div className="mt-4 flex items-center space-x-4">
                <img
                  src={user.profilePicture || '/NoPic.jpg'}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover border-2 border-amber-200"
                />
                <span className="text-sm text-gray-500">Max size 2MB</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuideView;