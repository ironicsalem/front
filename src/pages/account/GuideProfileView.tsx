import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

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

  // Star Rating Component
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
            <span className={star <= rating ? 'text-yellow-500' : 'text-gray-300'}>
              {star <= rating ? '★' : '☆'}
            </span>
          </button>
        ))}
      </div>
    );
  };

  // Review Card Component
  const ReviewCard = ({ review }: { review: Review }) => {
    const reviewDate = new Date(review.createdAt);
    const formattedDate = reviewDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <img
              src={review.author.profilePicture || '/placeholder-user.svg'}
              alt={review.author.name}
              className="w-12 h-12 rounded-full object-cover"
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
                <span className="ml-1 text-sm text-gray-500">{review.rating.toFixed(1)}</span>
              </div>
            </div>
            <p className="mt-3 text-gray-700 whitespace-pre-line">{review.content}</p>
          </div>
        </div>
      </div>
    );
  };

  // Post Card Component
  const PostCard = ({ post }: { post: Post }) => {
    const postDate = new Date(post.createdAt);
    const formattedDate = postDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow mb-4">
        <div className="flex flex-col">
          <div>
            <time className="text-sm text-gray-500">{formattedDate}</time>
          
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
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!guide) return (
    <div className="p-6 text-center text-red-500">
      <h2 className="text-2xl font-semibold">Guide not found</h2>
      <p className="mt-2">The guide you're looking for doesn't exist or may have been removed.</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Posts */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-8">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Guide Posts</h2>
              {posts.length === 0 ? (
                <p className="text-gray-500">No posts available from this guide yet.</p>
              ) : (
                <div className="space-y-4">
                  {posts.map(post => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Profile, Trips, and Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="md:flex">
              <div className="md:flex-shrink-0 p-6">
                <img
                  src={guide.userId.profilePicture || '/placeholder-user.svg'}
                  alt={guide.userId.name}
                  className="h-32 w-32 md:h-48 md:w-48 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
                />
              </div>
              <div className="p-8 flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{guide.userId.name}</h1>
                    <div className="mt-1 flex items-center">
                      <StarRating rating={Math.round(guide.averageRating)} />
                      <span className="ml-2 text-gray-600">
                        {guide.averageRating.toFixed(1)} ({reviews.length} reviews)
                      </span>
                    </div>
                    <p className="mt-2 text-gray-600">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {guide.city}
                      </span>
                    </p>
                  </div>
                  {guide.behavioralCertificate && (
                    <a
                      href={guide.behavioralCertificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View Certificate
                    </a>
                  )}
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-900">About</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {guide.userId.bio || 'No bio provided'}
                  </p>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-900">Languages</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {guide.languages?.map(language => (
                      <span key={language} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trips Section */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Offered Trips</h2>
            {trips.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500">No trips available from this guide yet.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {trips.map(trip => (
                  <div key={trip._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <img 
                      src={trip.image || '/group.jpg'} 
                      alt={trip.title} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900">{trip.title}</h3>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{trip.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">
                          <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {trip.locations?.join(', ')}
                        </span>
                        <span className="text-sm font-semibold text-amber-600">
                          {trip.price} JD
                        </span>
                      </div>
                      <div className="mt-3 text-sm text-gray-500">
                        <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {trip.duration}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Reviews Section */}
          <section className="mt-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
              <span className="text-gray-600">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
            </div>

            {/* Review Form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Share your experience</h3>
              {submitSuccess && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                  Thank you for your review! It has been submitted successfully.
                </div>
              )}
              {submitError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {submitError}
                </div>
              )}
              <form onSubmit={handleSubmitReview}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={reviewForm.name}
                      onChange={handleReviewChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your name"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Review
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      rows={4}
                      value={reviewForm.content}
                      onChange={handleReviewChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
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
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                </div>
              </form>
            </div>

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
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
  );
};

export default GuideProfileView;