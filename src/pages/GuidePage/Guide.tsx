import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User as UserIcon, 
  MapPin, 
  Star,
  Camera
} from 'lucide-react';

// Import services
import GuideService from '../../services/GuideService';
import ReviewService from '../../services/ReviewService';
import TripService from '../../services/TripService';
import AuthService from '../../services/AuthService';

// Import components
import StarRating from './shared/StarRating';
import { FullScreenSpinner } from './shared/LoadingSpinner';
import GuideAbout from './tabs/GuideAbout';
import GuideTrips from './tabs/GuideTrips';
import GuidePosts from './tabs/GuidePosts';
import GuideReviews from './tabs/GuideReviews';

// Import types
import type { 
  Guide, 
  PopulatedReview, 
  Post, 
  BaseUser,
  Trip
} from '../../types/Types';

// Interface for the actual API response (Guide with populated userId)
interface GuideWithPopulatedUser extends Omit<Guide, 'userId'> {
  userId: BaseUser;
}

interface LoadingStates {
  guide: boolean;
  trips: boolean;
  reviews: boolean;
  posts: boolean;
}

type TabKey = 'about' | 'trips' | 'posts' | 'reviews';

const Guide = () => {
  const navigate = useNavigate();
  const { guideId } = useParams<{ guideId: string }>();
  
  // State management
  const [guide, setGuide] = useState<GuideWithPopulatedUser | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [reviews, setReviews] = useState<PopulatedReview[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<BaseUser | null>(null);
  const [userReview, setUserReview] = useState<PopulatedReview | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState<LoadingStates>({
    guide: true,
    trips: true,
    reviews: true,
    posts: true,
  });
  
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('about');

  // Check authentication and get current user
  useEffect(() => {
    const checkAuth = async () => {
      if (AuthService.isAuthenticated()) {
        try {
          const user = await AuthService.getCurrentUser();
          setCurrentUser(user);
        } catch (error) {
          console.error('Error getting current user:', error);
          // Don't set error state, just no user
        }
      }
    };
    checkAuth();
  }, []);

  // Fetch data
  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchData = async () => {
      if (!guideId) {
        setError('Guide ID is required');
        return;
      }

      try {
        // Fetch guide data
        setLoading(prev => ({ ...prev, guide: true }));
        const guideData = await GuideService.getGuide(guideId);
        // Type assertion since API returns populated guide despite service type
        setGuide(guideData as unknown as GuideWithPopulatedUser);
        setLoading(prev => ({ ...prev, guide: false }));

        // Fetch trips
        setLoading(prev => ({ ...prev, trips: true }));
        try {
          const tripsData = await TripService.getTripsForGuide(guideId);
          setTrips(tripsData || []);
        } catch (error) {
          console.error('Error fetching trips:', error);
          setTrips([]);
        }
        setLoading(prev => ({ ...prev, trips: false }));

        // Fetch reviews
        setLoading(prev => ({ ...prev, reviews: true }));
        try {
          const reviewsData = await ReviewService.getGuideReviews(guideId);
          setReviews(reviewsData || []);
          
          // Check if current user has already reviewed this guide
          if (currentUser) {
            const existingReview = reviewsData?.find(review => 
              review.author._id === currentUser._id
            );
            if (existingReview) {
              setUserReview(existingReview);
            }
          }
        } catch (error) {
          console.error('Error fetching reviews:', error);
          setReviews([]);
        }
        setLoading(prev => ({ ...prev, reviews: false }));

        // Fetch posts
        setLoading(prev => ({ ...prev, posts: true }));
        try {
          const postsData = await GuideService.getGuidePosts(guideId);
          setPosts(postsData || []);
        } catch (error) {
          console.error('Error fetching posts:', error);
          setPosts([]);
        }
        setLoading(prev => ({ ...prev, posts: false }));

      } catch (err) {
        console.error('Error fetching guide data:', err);
        setError('Failed to load guide profile');
        setLoading({
          guide: false,
          trips: false,
          reviews: false,
          posts: false,
        });
      }
    };

    fetchData();
  }, [guideId, currentUser]);

  // Update user review when current user changes
  useEffect(() => {
    if (currentUser && reviews.length > 0) {
      const existingReview = reviews.find(review => 
        review.author._id === currentUser._id
      );
      setUserReview(existingReview || null);
    } else {
      setUserReview(null);
    }
  }, [currentUser, reviews]);

  // Handlers for updating data from child components
  const handleReviewsUpdate = (updatedReviews: PopulatedReview[]) => {
    setReviews(updatedReviews);
  };

  const handleUserReviewUpdate = (updatedUserReview: PopulatedReview | null) => {
    setUserReview(updatedUserReview);
  };

  // Tab configuration
  const tabs = [
    { key: 'about' as const, label: 'About', icon: UserIcon, count: null },
    { key: 'trips' as const, label: 'Trips', icon: MapPin, count: trips.length },
    { key: 'posts' as const, label: 'Posts', icon: Camera, count: posts.length },
    { key: 'reviews' as const, label: 'Reviews', icon: Star, count: reviews.length }
  ];

  // Show loading screen while guide is loading
  if (loading.guide) {
    return (
      <FullScreenSpinner 
        size="large" 
        text="Loading guide profile..." 
      />
    );
  }

  // Show error state
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
                    <StarRating 
                      rating={guide.averageRating} 
                      showValue 
                      starSize="w-3 h-3"
                      valueClassName="ml-1 text-xs font-medium"
                    />
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
                      <StarRating rating={guide.averageRating} />
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
            {tabs.map(({ key, label, icon: Icon, count }) => (
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
                {count !== null && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    key === 'trips' ? 'bg-amber-100 text-amber-600' :
                    key === 'posts' ? 'bg-blue-100 text-blue-600' :
                    key === 'reviews' ? 'bg-purple-100 text-purple-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-6">
            {/* Tab Content */}
            {activeTab === 'about' && (
              <GuideAbout 
                guide={guide} 
                reviewCount={reviews.length} 
              />
            )}

            {activeTab === 'trips' && (
              <GuideTrips 
                trips={trips} 
                loading={loading.trips} 
                guideCity={guide.city}
              />
            )}

            {activeTab === 'posts' && (
              <GuidePosts 
                posts={posts} 
                loading={loading.posts} 
                guideName={guide.userId.name}
              />
            )}

            {activeTab === 'reviews' && (
              <GuideReviews
                guideId={guideId!}
                guide={guide}
                reviews={reviews}
                currentUser={currentUser}
                userReview={userReview}
                loading={loading.reviews}
                onReviewsUpdate={handleReviewsUpdate}
                onUserReviewUpdate={handleUserReviewUpdate}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guide;