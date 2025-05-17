import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

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
  city: string,
  title: string;
  description: string;
  price: number;
  schedule: string;
  path: string[];
  imageUrl: string;
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

interface Post {
  _id: string;
  title: string;
  content: string;
  images: string[];
  createdAt: string;
}

interface ReviewFormData {
  rating: number;
  content: string;
  name: string;
  guideId?: string;
}

const GuideProfileView = () => {
  const navigate = useNavigate();
  const { guideId } = useParams<{ guideId: string }>();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({
    rating: 0,
    content: '',
    name: '',
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
      const reviewData = {
        ...reviewForm,
        guideId,
      };
      
      const token = localStorage.getItem('authToken');
      
      const response = await axios.post(`${API_URL}/review`, reviewData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
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
        };
        setReviews(prev => [newReview, ...prev]);
      }
      
      setReviewForm({
        rating: 0,
        content: '',
        name: '',
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

  const StarRating = ({ rating, interactive = false, onRatingChange }: 
    { rating: number, interactive?: boolean, onRatingChange?: (rating: number) => void }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : "button"}
            className={`focus:outline-none text-xl ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
            onClick={() => interactive && onRatingChange?.(star)}
            disabled={!interactive}
          >
            <span className={star <= rating ? 'text-amber-500' : 'text-gray-300'}>
              {star <= rating ? '★' : '☆'}
            </span>
          </button>
        ))}
      </div>
    );
  };

  const ReviewCard = ({ review }: { review: Review }) => {
    const reviewDate = new Date(review.createdAt);
    const formattedDate = reviewDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <img
              src={review.author.profilePicture || '/NoPic.jpg'}
              alt={review.author.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-amber-800"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-gray-900">{review.author.name}</h4>
                <time className="text-sm text-gray-500">{formattedDate}</time>
              </div>
              <div className="flex items-center">
                <StarRating rating={review.rating} />
              </div>
            </div>
            <p className="mt-3 text-gray-700 whitespace-pre-line">{review.content}</p>
          </div>
        </div>
      </div>
    );
  };

  const PostCard = ({ post }: { post: Post }) => {
    const postDate = new Date(post.createdAt);
    const formattedDate = postDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 mb-4">
        <div className="flex flex-col">
          <div>
            9<time className="text-sm text-gray-500">{formattedDate}</time>
          
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
              <p className="text-gray-600 mb-3 whitespace-pre-line">{post.content}</p>

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
                        className="w-full h-full object-cover rounded-md hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TripCard = ({ trip }: { trip: Trip }) => {
    return (
      <div 
        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
        onClick={() => navigate(`/trip/${trip._id}`)}
      >
        <div className="relative h-48 overflow-hidden">
          <img 
            src={trip.imageUrl || '/group.jpg'} 
            alt={trip.title} 
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-4">
            <h3 className="text-xl font-bold text-white">{trip.title}</h3>
            <p className="text-amber-300 font-medium">{trip.price} JD</p>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-600 line-clamp-2 mb-4">{trip.description}</p>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
              {trip.city}
            </span>
            <button className="text-amber-600 hover:text-amber-700 font-medium">
              View Details →
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
    </div>
  );

  if (!guide) return (
    <div className="p-6 text-center text-red-500">
      <h2 className="text-2xl font-semibold">Guide not found</h2>
      <p className="mt-2">The guide you're looking for doesn't exist or may have been removed.</p>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="relative bg-gradient-to-r from-amber-500 to-amber-950 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <img
                src={guide.userId.profilePicture || '/placeholder-user.svg'}
                alt={guide.userId.name}
                className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-4 border-white shadow-xl"
              />
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                <div className="bg-amber-500 text-white rounded-full px-3 py-1 flex items-center">
                  <StarRating rating={Math.round(guide.averageRating)} />
                  <span className="ml-1 font-medium">{guide.averageRating.toFixed(1)}</span>
                </div>
              </div>
            </div>
            
            <div className="text-white flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{guide.userId.name}</h1>
              <div className="flex items-center mb-4">
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="text-lg">{guide.city}</span>
              </div>
              
              <p className="text-lg mb-6 max-w-2xl">
                {guide.userId.bio || 'No bio provided'}
              </p>
              
              <div className="flex flex-wrap gap-3">
                {guide.languages?.map(language => (
                  <span key={language} className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white text-amber-600">
                    {language}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Posts */}
          <div className="lg:col-span-1 space-y-8">
            {/* About Guide Section */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6 relative inline-block">
                <span className="relative z-10 px-4 bg-white">
                  About Guide
                </span>
                <span className="absolute bottom-0 left-0 right-0 mx-auto w-3/4 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent z-0"></span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Experience</h3>
                  <p className="text-gray-600">Certified local guide with extensive knowledge of {guide.city} and surrounding areas.</p>
                </div>
                
                {guide.behavioralCertificate && (
                  <div>
                    <h3 className="font-medium text-gray-900">Certification</h3>
                    <a
                      href={guide.behavioralCertificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:text-amber-700 inline-flex items-center"
                    >
                      View Behavioral Certificate
                      <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </section>

            {/* Guide Posts Section */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6 relative inline-block">
                <span className="relative z-10 px-4 bg-white">
                  Guide Posts
                </span>
                <span className="absolute bottom-0 left-0 right-0 mx-auto w-3/4 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent z-0"></span>
              </h2>
              
              {posts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No posts available from this guide yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {posts.map(post => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column - Trips and Reviews */}
          <div className="lg:col-span-2 space-y-8">
            {/* Offered Trips Section */}
            <section className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold mb-8 relative inline-block">
                <span className="relative z-10 px-4 bg-white">
                  Offered Trips
                </span>
                <span className="absolute bottom-0 left-0 right-0 mx-auto w-3/4 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent z-0"></span>
              </h2>
              
              {trips.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No trips available from this guide yet.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {trips.map(trip => (
                    <TripCard key={trip._id} trip={trip} />
                  ))}
                </div>
              )}
            </section>

            {/* Reviews Section */}
            <section className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <h2 className="text-2xl font-bold relative inline-block">
                  <span className="relative z-10 px-4 bg-white">
                    Traveler Reviews
                  </span>
                  <span className="absolute bottom-0 left-0 right-0 mx-auto w-3/4 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent z-0"></span>
                </h2>
                <span className="text-gray-600 mt-2 md:mt-0">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
              </div>

              {/* Review Form */}
              <div className="bg-amber-50 rounded-xl p-6 mb-8">
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
                    <StarRating 
                      rating={reviewForm.rating} 
                      interactive={true} 
                      onRatingChange={handleRatingChange} 
                    />
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
                  
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:bg-amber-400 disabled:cursor-not-allowed"
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

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No reviews yet. Be the first to review this guide!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map(review => (
                    <ReviewCard key={review._id} review={review} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideProfileView;