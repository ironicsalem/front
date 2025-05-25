import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GuideService, { GuideWithUser, Trip } from '../services/GuideService';
import { Post, Review } from '../types/User';
import { 
  User as UserIcon, 
  MapPin, 
  Star, 
  Calendar, 
  Globe, 
  Users, 
  Clock, 
  DollarSign, 
  Heart, 
  MessageCircle, 
  ArrowLeft, 
  Camera, 
  TrendingUp, 
  BookOpen, 
  Shield 
} from 'lucide-react';

const Guide: React.FC = () => {
  const { guideId } = useParams<{ guideId: string }>();
  const navigate = useNavigate();
  
  const [guide, setGuide] = useState<GuideWithUser | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'about' | 'trips' | 'posts' | 'reviews'>('about');

  useEffect(() => {
    const fetchGuideData = async () => {
      if (!guideId) {
        setError('Guide ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [guideData, tripsData, postsData, reviewsData] = await Promise.all([
          GuideService.getGuide(guideId),
          GuideService.getTripsForGuide(guideId),
          GuideService.getGuidePosts(guideId),
          GuideService.getGuideReviews(guideId)
        ]);

        setGuide(guideData);
        setTrips(tripsData);
        setPosts(postsData);
        setReviews(reviewsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load guide profile');
      } finally {
        setLoading(false);
      }
    };

    fetchGuideData();
  }, [guideId]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? 'text-amber-400 fill-current'
            : index < rating
            ? 'text-amber-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
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
            <div className="absolute inset-0 bg-black bg-opacity-20" />
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
                    <Shield className="w-5 h-5" />
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
                        {guide.averageRating.toFixed(1)} ({guide.ratings.length} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="px-6 py-6 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-amber-100 rounded-full p-3 w-fit mx-auto mb-2">
                  <Users className="w-6 h-6 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{trips.length}</div>
                <div className="text-sm text-gray-600">Trips Offered</div>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-3 w-fit mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{guide.ratings.length}</div>
                <div className="text-sm text-gray-600">Happy Clients</div>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-3 w-fit mx-auto mb-2">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{posts.length}</div>
                <div className="text-sm text-gray-600">Posts Shared</div>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-3 w-fit mx-auto mb-2">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{guide.languages.length}</div>
                <div className="text-sm text-gray-600">Languages</div>
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
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Location</h4>
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-amber-600" />
                      <span className="text-gray-900 font-medium">{guide.city}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 rounded-full p-2">
                        <Shield className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-green-900">Verified Guide</div>
                        <div className="text-sm text-green-700">Identity and credentials verified</div>
                      </div>
                    </div>
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
                    {trips.map((trip) => (
                      <div key={trip._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-white to-amber-50">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="text-xl font-semibold text-gray-900 mb-2">{trip.title}</h4>
                            <p className="text-gray-700 mb-4 leading-relaxed">{trip.description}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="flex items-center space-x-2 text-gray-600">
                                <DollarSign className="w-4 h-4 text-green-500" />
                                <span className="font-semibold text-green-600">${trip.price}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-gray-600">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span>{trip.duration} days</span>
                              </div>
                              <div className="flex items-center space-x-2 text-gray-600">
                                <Users className="w-4 h-4 text-purple-500" />
                                <span>{trip.maxParticipants} max</span>
                              </div>
                              <div className="flex items-center space-x-2 text-gray-600">
                                <Calendar className="w-4 h-4 text-amber-500" />
                                <span>{new Date(trip.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <button className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-all duration-200 font-medium">
                            Book This Trip
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

                {!posts || posts.length === 0 ? (
                  <div className="text-center py-12">
                    <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Posts Yet</h4>
                    <p className="text-gray-600">This guide hasn't shared any posts yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {posts.map((post) => (
                      <div key={post._id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200">
                        <h4 className="text-xl font-semibold text-gray-900 mb-3">{post.title}</h4>
                        <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-6">
                            <span className="flex items-center space-x-2">
                              <Heart className="w-4 h-4 text-red-400" />
                              <span>{post.likes?.length || 0} likes</span>
                            </span>
                            <span className="flex items-center space-x-2">
                              <MessageCircle className="w-4 h-4 text-blue-400" />
                              <span>{post.comments?.length || 0} comments</span>
                            </span>
                          </div>
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
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
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Client Reviews</h3>
                  <div className="flex items-center space-x-2">
                    {renderStars(guide.averageRating)}
                    <span className="text-sm text-gray-600 ml-2">
                      {guide.averageRating.toFixed(1)} out of 5 ({guide.ratings.length} reviews)
                    </span>
                  </div>
                </div>

                {!reviews || reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h4>
                    <p className="text-gray-600">Be the first to book with this guide and leave a review!</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {reviews.map((review) => (
                      <div key={review._id} className="border border-gray-200 rounded-xl p-6 bg-gradient-to-r from-white to-amber-50">
                        <div className="flex items-start space-x-4">
                          <div className="bg-amber-100 rounded-full p-3">
                            <UserIcon className="w-6 h-6 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="font-medium text-gray-900">
                                {typeof review.author === 'object' && review.author?.name 
                                  ? review.author.name 
                                  : 'Anonymous Traveler'}
                              </span>
                              <div className="flex items-center space-x-1">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                              {review.content}
                            </p>
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

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl shadow-xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Explore with {guide.userId.name}?</h3>
          <p className="text-amber-100 mb-6 max-w-2xl mx-auto">
            Book an unforgettable experience with our verified local guide. Discover hidden gems and create lasting memories!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-amber-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200">
              Message Guide
            </button>
            <button className="bg-amber-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-400 transition-all duration-200">
              Book a Trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guide;