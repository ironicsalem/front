import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  ArrowLeft, 
  Navigation,
  CheckCircle,
  XCircle,
  MessageCircle,
  Star
} from 'lucide-react';
import TripService, { TripWithGuide } from '../services/TripService';
import { TripSchedule } from '../types/Types';

const TripPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [trip, setTrip] = useState<TripWithGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<TripSchedule | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Trip ID is required');
      setLoading(false);
      return;
    }

    const fetchTripDetails = async () => {
      try {
        setLoading(true);
        const tripData = await TripService.getTripById(id);
        setTrip(tripData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch trip details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load trip details');
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [id]);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleBookTrip = () => {
    if (trip && selectedSchedule) {
      // Pass selected date and time as URL parameters
      const searchParams = new URLSearchParams({
        date: selectedSchedule.date.toString(),
        time: selectedSchedule.time
      });
      navigate(`/booking/${trip._id}?${searchParams.toString()}`);
    } else if (trip) {
      // If no date selected, go to booking page without pre-selection
      navigate(`/booking/${trip._id}`);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleContactGuide = () => {
    if (trip?.guideUser?.phone) {
      window.open(`tel:${trip.guideUser.phone}`, '_self');
    }
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getAvailableSchedules = (): TripSchedule[] => {
    if (!trip?.schedule) return [];
    return trip.schedule.filter(slot => slot.isAvailable);
  };

  // Safe authentication check
  const isAuthenticated = (() => {
    try {
      return TripService.isAuthenticated();
    } catch (error) {
      console.warn('Authentication check failed:', error);
      return false;
    }
  })();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-solid border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <XCircle className="h-12 w-12 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Trip Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The trip you are looking for does not exist.'}</p>
          <button
            onClick={handleBackClick}
            className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const availableSchedules = getAvailableSchedules();
  
  // Safe trip availability check
  const isTripAvailable = (() => {
    try {
      return TripService.isTripAvailable(trip);
    } catch (error) {
      console.warn('Trip availability check failed:', error);
      return trip?.isAvailable && availableSchedules.length > 0;
    }
  })();
  
  const isBookable = isTripAvailable && isAuthenticated;
  const formattedTrip = TripService.formatTripForDisplay(trip);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Trips</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Hero Image */}
          <div className="relative h-96 md:h-[500px]">
            <img
              src={imageError ? '/trip-placeholder.jpg' : trip.imageUrl || '/trip-placeholder.jpg'}
              alt={trip.title}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            {/* Trip Badge */}
            <div className="absolute top-6 left-6">
              <span className="px-4 py-2 bg-amber-500/90 backdrop-blur-sm text-white font-semibold rounded-full">
                {trip.type}
              </span>
            </div>

            {/* Price */}
            <div className="absolute top-6 right-6">
              <div className="bg-white/95 backdrop-blur-sm px-6 py-3 rounded-2xl">
                <span className="text-3xl font-bold text-amber-600">{formattedTrip.formattedPrice}</span>
                <span className="text-gray-600 ml-1">per person</span>
              </div>
            </div>

            {/* Title Overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{trip.title}</h1>
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span className="text-lg">{trip.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  <span className="text-lg">{trip.path?.length || 0} stops</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Availability Status */}
            <div className="mb-8">
              {isBookable ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Available for booking</span>
                </div>
              ) : !isAuthenticated ? (
                <div className="flex items-center gap-2 text-orange-600">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">Please log in to book this trip</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <span className="font-medium">Currently unavailable</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Trip</h2>
                  <p className="text-gray-700 text-lg leading-relaxed">{trip.description}</p>
                </section>

                {/* Itinerary */}
                {trip.path && trip.path.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Trip Itinerary</h2>
                    <div className="space-y-4">
                      {trip.path.map((location, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{location.name}</h3>
                            {location.position.lat && location.position.lng && (
                              <p className="text-sm text-gray-600">
                                Coordinates: {location.position.lat.toFixed(6)}, {location.position.lng.toFixed(6)}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Starting Location */}
                {trip.startLocation && (
                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Meeting Point</h2>
                    <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-6 w-6 text-amber-600 mt-1" />
                        <div>
                          <h3 className="font-semibold text-amber-900 mb-2">Start Location</h3>
                          {trip.startLocation.coordinates && trip.startLocation.coordinates.length === 2 && (
                            <p className="text-amber-700 mb-2">
                              Coordinates: {TripService.formatCoordinates(trip.startLocation)}
                            </p>
                          )}
                          {trip.startLocation.description && (
                            <p className="text-amber-700">{trip.startLocation.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Guide Information */}
                {trip.guideUser && (
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Your Guide</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={trip.guideUser.profilePicture || '/NoPic.jpg'}
                        alt={trip.guideUser.name}
                        className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/NoPic.jpg';
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{trip.guideUser.name}</h4>
                        {trip.guideUser.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span className="text-sm">{trip.guideUser.phone}</span>
                          </div>
                        )}
                        {/* Guide Rating */}
                        {trip.guide.averageRating > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="font-medium text-gray-900">{trip.guide.averageRating.toFixed(1)}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                              ({trip.guide.ratings.length} review{trip.guide.ratings.length !== 1 ? 's' : ''})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Guide Languages */}
                    {trip.guide.languages && trip.guide.languages.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Languages:</p>
                        <div className="flex flex-wrap gap-2">
                          {trip.guide.languages.map((language, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-white text-gray-700 text-xs rounded-full border"
                            >
                              {language}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={() => navigate(`/guide/${trip.guide._id}`)}
                      className="w-full py-2 px-4 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors flex items-center justify-center gap-2 mb-3"
                    >
                      <User className="h-4 w-4" />
                      View Guide Profile
                    </button>
                  </div>
                )}

                {/* Available Schedules */}
                {availableSchedules.length > 0 && (
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Available Dates</h3>
                    <div className="space-y-3">
                      {availableSchedules.slice(0, 5).map((schedule, index) => (
                        <div
                          key={index}
                          onClick={() => setSelectedSchedule(schedule)}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                            selectedSchedule === schedule
                              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200'
                              : 'bg-white border-gray-200 hover:border-amber-200 hover:bg-amber-25'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                              selectedSchedule === schedule
                                ? 'bg-amber-500 border-amber-500'
                                : 'border-gray-300'
                            }`}>
                              {selectedSchedule === schedule && (
                                <div className="w-full h-full rounded-full bg-white scale-50"></div>
                              )}
                            </div>
                            <Calendar className={`h-4 w-4 ${
                              selectedSchedule === schedule ? 'text-amber-600' : 'text-gray-500'
                            }`} />
                            <span className={`text-sm font-medium ${
                              selectedSchedule === schedule ? 'text-amber-900' : 'text-gray-900'
                            }`}>
                              {formatDate(schedule.date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className={`h-4 w-4 ${
                              selectedSchedule === schedule ? 'text-amber-600' : 'text-gray-500'
                            }`} />
                            <span className={`text-sm ${
                              selectedSchedule === schedule ? 'text-amber-700' : 'text-gray-600'
                            }`}>
                              {schedule.time}
                            </span>
                          </div>
                        </div>
                      ))}
                      {availableSchedules.length > 5 && (
                        <p className="text-sm text-gray-600 text-center">
                          +{availableSchedules.length - 5} more dates available
                        </p>
                      )}
                    </div>
                    
                    {selectedSchedule && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800">
                          <span className="font-medium">Selected:</span> {formatDate(selectedSchedule.date)} at {selectedSchedule.time}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Booking Button */}
                <div className="sticky top-24">
                  {!isAuthenticated ? (
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl"
                    >
                      Login to Book
                    </button>
                  ) : (
                    <button
                      onClick={handleBookTrip}
                      disabled={!TripService.isTripAvailable(trip)}
                      className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${
                        TripService.isTripAvailable(trip)
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {TripService.isTripAvailable(trip) ? 'Book This Trip' : 'Currently Unavailable'}
                    </button>
                  )}
                  
                  {isAuthenticated && TripService.isTripAvailable(trip) && (
                    <p className="text-center text-sm text-gray-600 mt-3">
                      You'll choose your preferred date on the next page
                    </p>
                  )}
                </div>

                {/* Contact Info */}
                {trip.guideUser?.phone && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <h3 className="font-semibold text-amber-900 mb-3">Have Questions?</h3>
                    <p className="text-amber-700 text-sm mb-4">
                      Contact your guide directly for any questions about this trip.
                    </p>
                    <button 
                      onClick={handleContactGuide}
                      className="w-full py-2 px-4 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Contact Guide
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TripPage;