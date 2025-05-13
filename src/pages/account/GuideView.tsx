import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
}

interface Trip {
  _id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  locations: string[];
  image: string;
}

interface Review {
  _id: string;
  author: {
    name: string;
    profilePicture?: string;
  };
  rating: number;
  content: string;
  createdAt: string;
}

const GuideView = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState<NewPostState>({ title: '', content: '', images: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
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
        
        if (response.data.user?._id) {
          fetchTrips(response.data.user._id);
          fetchReviews(response.data.user._id);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    const fetchTrips = async (guideId: string) => {
      setIsLoadingTrips(true);
      try {
        const tripsResponse = await axios.get(`${API_URL}/guide/${guideId}/trips`);
        setTrips(tripsResponse.data || []);
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setIsLoadingTrips(false);
      }
    };

    const fetchReviews = async (guideId: string) => {
      setIsLoadingReviews(true);
      try {
        const response = await axios.get(`${API_URL}/guide/${guideId}/reviews`);
        setReviews(response.data.reviews || []);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setIsLoadingReviews(false);
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">
      {/* Left Column - Posts and Reviews */}
      <div className="flex-1">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Create New Post</h3>
          <form onSubmit={handleAddPost} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                placeholder="City"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                placeholder="Share your Trip moments"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Images (Max 4)
              </label>
              <div className="space-y-2">
                <label className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-sm cursor-pointer">
                  📸 Add Images
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAddImages}
                    className="hidden"
                    disabled={newPost.images.length >= 4}
                  />
                </label>

                {newPost.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {newPost.images.map((image, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={image.preview}
                          alt={`Preview ${index}`}
                          className="w-full h-full object-cover rounded-md border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-0.5 hover:bg-red-600"
                        >
                          ❌
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
            >
              {isLoading ? 'Publishing...' : 'Publish Post'}
            </button>
          </form>
        </div>

        {/* Posts List */}
        <h2 className="text-2xl font-bold mb-6">Posts</h2>
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500">You haven't created any posts yet</p>
            <p className="text-gray-400 text-sm mt-1">Start by creating your first post above</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post._id} className="bg-white rounded-lg shadow-md overflow-hidden relative">
                <button
                  onClick={() => handleDeletePost(post._id)}
                  className="absolute top-2 right-2 p-1 hover:bg-red-600"
                  disabled={isLoading}
                >
                  ❌
                </button>

                <div className="p-4 flex items-center space-x-3 border-b">
                  <img
                    src={user?.profilePicture || 'NoPic.jpg'}
                    alt="Author"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-sm">{user?.name || 'You'}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()} •{' '}
                      {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{post.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 whitespace-pre-line">{post.content}</p>

                  {post.images?.length > 0 && (
                    <div className={`grid gap-2 mt-3 ${
                      post.images.length === 1 ? 'grid-cols-1' :
                      post.images.length === 2 ? 'grid-cols-2' :
                      post.images.length === 3 ? 'grid-cols-2' : 'grid-cols-2'
                    }`}>
                      {post.images.slice(0, 4).map((image, index) => (
                        <div
                          key={index}
                          className={`relative aspect-square ${
                            post.images.length === 3 && index === 0 ? 'row-span-2' : ''
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Post ${index}`}
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Available Trips */}
      <div className="md:w-90 lg:w-96 space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Your Available Trips</h2>
          <button
            onClick={() => navigate('/addtrip')}
            className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-md text-sm"
          >
          + Add Trip
          </button>
          {isLoadingTrips ? (
            <div className="text-center py-4">
              <p>Loading trips...</p>
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">You haven't created any trips yet</p>
              <p className="text-gray-400 text-sm mt-1">Create trips to offer to travelers</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trips.map(trip => (
                <div key={trip._id} className="border rounded-lg overflow-hidden">
                  <img 
                    src={trip.image || '/default-trip.jpg'} 
                    alt={trip.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-3">
                    <h3 className="font-semibold">{trip.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{trip.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-amber-600 font-medium">${trip.price}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{trip.duration}</span>
                    </div>
                    <div className="mt-2">
                      <button className="w-full bg-amber-500 hover:bg-amber-600 text-white text-sm py-1 rounded">
                         Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Reviews Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Your Reviews</h2>
          
          {isLoadingReviews ? (
            <div className="text-center py-4">
              <p>Loading reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">You haven't received any reviews yet</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {reviews.map((review) => (
                <div key={review._id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <img
                      src={review.author.profilePicture || '/NoPic.jpg'}
                      alt={review.author.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-sm">{review.author.name}</p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? 'text-amber-400' : 'text-gray-300'}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">{review.content}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default GuideView;