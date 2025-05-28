import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, 
  MapPin, 
  Star,   
  Clock, 
  DollarSign, 
  ArrowLeft, 
  Camera, 
  Bookmark
} from 'lucide-react';

const API_URL = 'http://localhost:3000';

interface Guide {
  _id: string;
  userId: {
    _id: string;
    name: string;
    profilePicture?: string;
    bio?: string;
  };
  city: string;
  languages: string[];
  behavioralCertificate?: string;
  averageRating: number;
}

interface Trip {
  _id: string;
  city: string;
  title: string;
  description: string;
  price: number;
  schedule: {
    date: string;
    time: string;
    isAvailable: boolean;
    _id?: string;
  }[];
  path: string[];
  imageUrl: string;
  type: string;
}


interface Review {
  _id: string;
  author: {
    name: string;
    profilePicture?: string;
  };
  rating: number;
  content: string;
  images: [];
  createdAt: string;
}
interface Post {
  _id: string;
  title: string;
  content: string;
  images: string[];
  createdAt: string;
  likes?: string[];
  comments?: string[];
}

interface ReviewFormData {
  rating: number;
  content: string;
  name: string;
  guideId?: string;
  images: File[]
}

const Guide = () => {
  const navigate = useNavigate();
  const { guideId } = useParams<{ guideId: string }>();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'about' | 'trips' | 'posts' | 'reviews'>('about');
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    rating: 0,
    content: '',
    name: '',
      images: []
  });
  const [formErrors, setFormErrors] = useState<{
    rating?: string;
    content?: string;
    name?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchData = async () => {
      try {
        const [guideRes, tripsRes, reviewsRes, postsRes] = await Promise.all([
          axios.get(`${API_URL}/guide/${guideId}`),
          axios.get(`${API_URL}/trip/${guideId}/trips`),
          axios.get(`${API_URL}/review/${guideId}`),
          axios.get(`${API_URL}/guide/${guideId}/posts`),
        ]);

        setGuide(guideRes.data);
        setTrips(tripsRes.data || []);
        setReviews(reviewsRes.data || []);
        setPosts(postsRes.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load guide profile');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [guideId]);

  const validateForm = () => {
    const errors: {
      rating?: string;
      content?: string;
      name?: string;
    } = {};
    let isValid = true;

    if (reviewForm.rating === 0) {
      errors.rating = 'Please select a rating';
      isValid = false;
    }

    if (!reviewForm.content.trim()) {
      errors.content = 'Please provide review content';
      isValid = false;
    }

    if (!reviewForm.name.trim()) {
      errors.name = 'Please provide your name';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleReviewChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleRatingChange = (rating: number) => {
    setReviewForm(prev => ({
      ...prev,
      rating,
    }));

    if (formErrors.rating) {
      setFormErrors(prev => ({
        ...prev,
        rating: undefined,
      }));
    }
  };

const handleSubmitReview = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) return;

  setSubmitting(true);
  setSubmitError('');
  setSubmitSuccess(false);

  try {
    const formData = new FormData();
    
    // Append all review data to formData
    formData.append('rating', reviewForm.rating.toString());
    formData.append('content', reviewForm.content);
    formData.append('name', reviewForm.name);
    if (guideId) formData.append('guideId', guideId);
    
    // Append each image file correctly
    reviewForm.images.forEach((file) => {
      formData.append('images', file);
    });

    const token = localStorage.getItem('authToken');
    
    const response = await axios.post(`${API_URL}/review`, formData, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data?.review) {
      setReviews(prev => [response.data.review, ...prev]);
    } else {
      const newReview: Review = {
        _id: `temp-${Date.now()}`,
        author: {
          name: reviewForm.name,
          profilePicture: undefined,
        },
        rating: reviewForm.rating,
        content: reviewForm.content,
        createdAt: new Date().toISOString(),
          images: [],
      };
      setReviews(prev => [newReview, ...prev]);
    }
    
    // Reset form
    setReviewForm({
      rating: 0,
      content: '',
      name: '',
      images: []
    });
    
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 5000);
  } catch (err) {
    console.error('Error submitting review:', err);
    setSubmitError('Failed to submit review. Please try again.');
  } finally {
    setSubmitting(false);
  }
};

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, index) => (
      <button
        key={index}
        type={interactive ? "button" : "button"}
        className={`focus:outline-none ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
        onClick={() => interactive && onChange?.(index + 1)}
        disabled={!interactive}
      >
        <Star
          className={`w-4 h-4 ${
            index < Math.floor(rating)
              ? 'text-amber-400 fill-current'
              : index < rating
              ? 'text-amber-400 fill-current opacity-50'
              : 'text-gray-300'
          }`}
        />
      </button>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-amber-700 font-medium">Loading guide profile...</p>
        </div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md mx-4">
          <div className="text-red-500 mb-4">
            <UserIcon className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Guide Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The guide profile you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => navigate('/guides')}
            className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-all duration-200 font-medium"
          >
            Browse Other Guides
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-amber-600 hover:text-amber-700 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Guide Profile</h1>
            <div className="w-20" /> {/* Spacer */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="relative h-48 bg-gradient-to-r from-amber-400 via-orange-400 to-red-400">
            <div className="absolute inset-0 bg-amber-950 bg-opacity-20" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-end space-x-6">
                <div className="relative">
                  <div className="w-32 h-32 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-white">
                    {guide.userId.profilePicture ? (
                      <img
                        src={guide.userId.profilePicture}
                        alt={guide.userId.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-16 h-16 text-amber-600" />
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-2 rounded-full shadow-lg">
                    <div className="flex items-center">
                      {renderStars(Math.round(guide.averageRating))}
                      <span className="ml-1 text-xs font-medium">{guide.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 pb-4">
                  <h1 className="text-3xl font-bold text-white mb-2">{guide.userId.name}</h1>
                  <div className="flex items-center space-x-4 text-white/90">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{guide.city}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(guide.averageRating)}
                      <span className="ml-2 font-medium">
                        ({reviews.length} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          


        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
          <nav className="flex border-b border-gray-200">
            {[
              { key: 'about' as const, label: 'About', icon: UserIcon },
              { key: 'trips' as const, label: 'Trips', icon: MapPin },
              { key: 'posts' as const, label: 'Posts', icon: Camera },
              { key: 'reviews' as const, label: 'Reviews', icon: Star }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-all duration-200 border-b-2 ${
                  activeTab === key
                    ? 'border-amber-500 text-amber-600 bg-amber-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {key === 'trips' && <span className="bg-amber-100 text-amber-600 text-xs px-2 py-1 rounded-full">{trips.length}</span>}
                {key === 'posts' && <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">{posts.length}</span>}
                {key === 'reviews' && <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full">{reviews.length}</span>}
              </button>
            ))}
          </nav>

          <div className="p-6">
            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">About {guide.userId.name}</h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {guide.userId.bio || 'This guide hasn\'t added a bio yet, but they\'re ready to show you around their beautiful city!'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Languages Spoken</h4>
                    <div className="flex flex-wrap gap-2">
                      {guide.languages.length > 0 ? (
                        guide.languages.map((language, index) => (
                          <span
                            key={index}
                            className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {language}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">No languages specified</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Certification</h4>
                    {guide.behavioralCertificate ? (
                      <a
                        href={guide.behavioralCertificate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-amber-600 hover:text-amber-700"
                      >
                        <Bookmark className="w-5 h-5" />
                        <span>View Behavioral Certificate</span>
                      </a>
                    ) : (
                      <p className="text-gray-500">No certificate provided</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Trips Tab */}
            {activeTab === 'trips' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Available Trips</h3>
                  <span className="text-sm text-gray-600">{trips.length} trips available</span>
                </div>

                {trips.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Trips Available</h4>
                    <p className="text-gray-600">This guide hasn't created any trips yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {trips?.map((trip: Trip) => (
                      <div 
                        key={trip._id} 
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-white to-amber-50 cursor-pointer"
                        onClick={() => navigate(`/trip/${trip._id}`)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="text-xl font-semibold text-gray-900 mb-2">{trip.title}</h4>
                            <p className="text-gray-700 mb-4 leading-relaxed">{trip.description}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="flex items-center space-x-2 text-gray-600">
                                <DollarSign className="w-4 h-4 text-green-500" />
                                <span className="font-semibold text-green-600">{trip.price} JD</span>
                              </div>
                              <div className="flex items-center space-x-2 text-gray-600">
                                <Clock className="w-4 h-4 text-blue-500" />
                              {trip.schedule.map((slot, index) => (
                                <div key={slot._id || index} className="text-sm text-gray-700">
                                  <p><strong>Date:</strong> {new Date(slot.date).toLocaleDateString()}</p>
                                  <p><strong>Time:</strong> {slot.time}</p>
                                  <p><strong>Available:</strong> {slot.isAvailable ? "Yes" : "No"}</p>
                                </div>
                              ))}
                              </div>
                              <div className="flex items-center space-x-2 text-gray-600">
                                <MapPin className="w-4 h-4 text-purple-500" />
                                <span>{trip.city}</span>
                              </div>
                          
                            </div>
                          </div>
                          {trip.imageUrl && (
                            <img 
                              src={trip.imageUrl} 
                              alt={trip.title}
                              className="w-34 h-34 object-cover rounded-lg ml-4"
                            />
                          )}
                        </div>
                        
                        <div className="flex justify-end">
                          <button
                           onClick={() => navigate(`/trip/${trip._id}`)}
                           className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-all duration-200 font-medium">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Posts Tab */}
            {activeTab === 'posts' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Recent Posts</h3>
                  <span className="text-sm text-gray-600">{posts.length} posts</span>
                </div>

                {posts.length === 0 ? (
                  <div className="text-center py-12">
                    <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Posts Yet</h4>
                    <p className="text-gray-600">This guide hasn't shared any posts yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {posts.map((post) => (
                      <div
                        key={post._id}
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200"
                      >
                        <h4 className="text-xl font-semibold text-gray-900 mb-3">{post.title}</h4>
                        <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>

                        {post.images?.length > 0 && (
                          <div
                            className={`grid gap-2 mb-4 ${
                              post.images.length === 1
                                ? 'grid-cols-1'
                                : 'grid-cols-2'
                            }`}
                          >
                            {post.images.slice(0, 4).map((image, index) => (
                              <div
                                key={index}
                                className={`relative rounded-md overflow-hidden ${
                                  post.images.length === 3 && index === 0
                                    ? 'row-span-2 h-60'
                                    : 'h-48'
                                }`}
                              >
                                <img
                                  src={image}
                                  alt={`Post ${index}`}
                                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                  loading="lazy"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}



            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Client Reviews</h3>
                  <div className="flex items-center space-x-2">
                    {renderStars(guide.averageRating)}
                    <span className="text-sm text-gray-600 ml-2">
                      {guide.averageRating.toFixed(1)} out of 5 ({reviews.length} reviews)
                    </span>
                  </div>
                </div>

                {/* Review Form */}
                <div className="bg-amber-50 rounded-xl p-6 mb-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">Share your experience</h3>
                  
                  {submitSuccess && (
                    <div className="mb-4 p-4 bg-green-100 border border-green-200 rounded-lg text-green-700">
                      Thank you for your review! It has been submitted successfully.
                    </div>
                  )}
                  
                  {submitError && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-200 rounded-lg text-red-700">
                      {submitError}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Rating
                      </label>
                      <div className="flex">
                        {renderStars(reviewForm.rating, true, handleRatingChange)}
                      </div>
                      {formErrors.rating && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.rating}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={reviewForm.name}
                        onChange={handleReviewChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-amber-500 focus:border-amber-500 ${
                          formErrors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your name"
                      />
                      {formErrors.name && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review
                      </label>
                      <textarea
                        id="content"
                        name="content"
                        rows={4}
                        value={reviewForm.content}
                        onChange={handleReviewChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-amber-500 focus:border-amber-500 ${
                          formErrors.content ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Share your experience with this guide..."
                      />
                      {formErrors.content && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.content}</p>
                      )}
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images (max 4)</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files) {
                          const fileArray = Array.from(files).slice(0, 4);
                          setReviewForm(prev => ({ ...prev, images: fileArray }));
                        }
                      }}
                      className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                    />
                    {reviewForm.images.length > 0 && (
                      <p className="text-sm text-gray-500 mt-1">{reviewForm.images.length} file(s) selected</p>
                    )}
                  </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 disabled:bg-amber-400 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </span>
                      ) : 'Submit Review'}
                    </button>
                  </form>
                </div>

              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h4>
                  <p className="text-gray-600">Be the first to leave a review!</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="border border-gray-200 rounded-xl p-6 bg-gradient-to-r from-white to-amber-50"
                    >
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
                            <span className="font-medium text-gray-900">{review.author.name}</span>
                            <div className="flex items-center space-x-1">{renderStars(review.rating)}</div>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{review.content}</p>

                          {/* Images array rendering */}
                          {review.images && review.images.length > 0 && (
                            <div className="mt-4 grid grid-cols-3 gap-2">
                              {review.images.map((imgUrl, index) => (
                                <img
                                  key={index}
                                  src={imgUrl}
                                  alt={`Review image ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-md"
                                />
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
          </div>
        </div>

      
      </div>
    </div>
  );
};

export default Guide;