import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Calendar, ArrowLeft, Phone, User } from 'lucide-react';

// API URL configuration
const API_URL = (
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:5000'
    : 'https://your-production-api.com'
);

interface Location {
  name: string;
  position: {
    lat: number;
    lng: number;
  };
}

interface Schedule {
  date: Date;
  time: string;
  isAvailable: boolean;
}

interface Trip {
  _id: string;
  title: string;
  guide: string;
  city: string;
  path: Location[];
  schedule: Schedule[];
  imageUrl?: string;
  price: number;
  description: string;
  type: string;
  createdAt: string;
}

interface GuideUser {
  name: string;
  phone: string;
  profilePicture?: string;
}

interface TripResponse {
  trip: Trip;
  guideUser: GuideUser;
}

const TripDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [guideUser, setGuideUser] = useState<GuideUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTripDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const url = `${API_URL}/trip/${id}`;
        
        const config = {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        };
        
        const response = await axios.get<TripResponse>(url, config);
        console.log('Trip data received:', response.data);
        setTrip(response.data.trip);
        setGuideUser(response.data.guideUser);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch trip details', error);
        
        if (axios.isAxiosError(error)) {
          console.log('Error details:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            config: error.config
          });
          
          if (error.response?.status === 404) {
            setError(`Trip with ID ${id} not found.`);
          } else if (error.response?.status === 500) {
            setError(`Server error: ${error.response?.data?.error || error.message}`);
          } else if (error.response?.status === 401) {
            setError('Authentication required. Please log in to view this trip.');
          } else if (error.code === 'ERR_NETWORK') {
            setError('Network error. Please check your connection and try again.');
          } else {
            setError(`Error ${error.response?.status || ''}: ${error.message}`);
          }
          
          const isDevelopment = window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1';
          
          if (isDevelopment) {
            console.log('Using test trip data for development');
            setTimeout(() => {
              const testTrip: Trip = {
                _id: id || '1',
                title: 'Test Trip (Development Only)',
                guide: 'test-guide',
                city: 'Test City',
                path: [
                  { name: 'Test Location 1', position: { lat: 40.123, lng: -74.123 } },
                  { name: 'Test Location 2', position: { lat: 40.456, lng: -74.456 } }
                ],
                schedule: [
                  { date: new Date('2025-06-15'), time: '09:00', isAvailable: true },
                  { date: new Date('2025-06-20'), time: '10:00', isAvailable: true }
                ],
                imageUrl: 'https://images.unsplash.com/photo-1500835556837-99ac94a94552',
                price: 99,
                description: 'This is a test trip for development. In production, you would see real trip details here.',
                type: 'Test',
                createdAt: new Date().toISOString()
              };
              setTrip(testTrip);
              setGuideUser({
                name: 'Test Guide',
                phone: '1234567890',
                profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde'
              });
              setError(null);
            }, 1000);
          }
        } else {
          console.log('Non-Axios error:', error);
          setError('Failed to load trip details. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTripDetails();
    } else {
      setError('Invalid trip ID');
      setLoading(false);
    }
  }, [id]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    // Simple formatting - adjust as needed
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-solid border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-gray-600">Loading trip details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Error</h3>
          <p>{error}</p>
          <button
            onClick={() => navigate('/trips')}
            className="mt-4 inline-flex items-center text-red-700 hover:text-red-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Trips
          </button>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-6 py-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Trip Not Found</h3>
          <p>Sorry, we couldn't find the trip you're looking for.</p>
          <button
            onClick={() => navigate('/trips')}
            className="mt-4 inline-flex items-center text-amber-700 hover:text-amber-800"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Trips
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Image */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={trip.imageUrl || '/group.jpg'}
          alt={trip.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        <button
          onClick={() => navigate('/trips')}
          className="absolute top-6 left-6 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-800" />
        </button>
        
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <div className="flex items-center gap-2 text-white/90 mb-3">
              <MapPin className="h-5 w-5" />
              <span className="text-lg">{trip.city}</span>
              <span className="mx-2 text-white/70">•</span>
              <span className="px-3 py-1 bg-amber-500 text-white text-sm rounded-full shadow-sm">
                {trip.type}
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">{trip.title}</h1>
            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-5 w-5" />
                <span>{trip.schedule && trip.schedule.length > 0 ? `${trip.schedule.length} dates available` : 'No dates available'}</span>
              </div>
              <div className="text-2xl font-bold">${trip.price}</div>
            </div>
          </div>
        </div>
      </div>


      {/* Main Content */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column - Trip Details */}
          <div className="lg:col-span-2 space-y-10">
            {/* Trip Description Section */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">About This Trip</h2>
              <p className="text-gray-700 leading-relaxed">{trip.description}</p>
            </section>

            {/* Guide Information Section */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Guide</h2>
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <div className="flex-shrink-0">
                  <div className="h-24 w-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                    {guideUser?.profilePicture ? (
                      <img 
                        src={guideUser.profilePicture} 
                        alt={guideUser.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {guideUser?.name || 'Guide Name Not Available'}
                  </h3>
                  {guideUser?.phone && (
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <Phone className="h-5 w-5" />
                      <a href={`tel:${guideUser.phone}`} className="hover:text-amber-600 transition-colors">
                        {formatPhoneNumber(guideUser.phone)}
                      </a>
                    </div>
                  )}
                  <p className="text-gray-600">
                    Your expert guide for this trip. With local knowledge and experience, they'll ensure you have an unforgettable experience.
                  </p>
                </div>
              </div>
            </section>

            {/* Locations Section */}
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Trip Itinerary</h2>
              {trip.path && trip.path.length > 0 ? (
                <div className="relative">
                  {/* Connecting lines */}
                  <svg 
                    className="absolute left-0 top-0 h-full w-full pointer-events-none z-0"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {trip.path.slice(0, -1).map((_, index) => (
                      <path
                        key={index}
                        d={`M36,${48 + index * 80} C60,${48 + index * 80} 60,${48 + (index + 1) * 80} 84,${48 + (index + 1) * 80}`}
                        stroke="#fbbf24"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                      />
                    ))}
                  </svg>

                  {/* Location nodes */}
                  <div className="space-y-8 pl-12">
                    {trip.path.map((location, index) => (
                      <div key={index} className="relative flex items-center gap-4 min-h-[60px]">
                        <div className="absolute -left-3 flex items-center justify-center h-12 w-12 rounded-full bg-amber-500 text-white font-bold z-10 border-4 border-white shadow-md">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg flex-1 ml-8 border border-gray-200">
                          <h3 className="font-semibold text-gray-800">{location.name}</h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No locations specified for this trip.</p>
              )}
            </section>
          </div>

          {/* Right Column - Booking Section */}
          <div>
            <section className="bg-white rounded-xl shadow-md p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Book Your Experience</h2>
              
              {/* Available Dates */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-700 mb-4 text-lg">Available Time Slots</h3>
                {trip.schedule && trip.schedule.length > 0 ? (
                  <div className="space-y-4">
                    {trip.schedule
                      .filter(schedule => schedule.isAvailable)
                      .map((schedule, index) => (
                        <div 
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 hover:border-amber-300 transition-colors"
                        >
                          <div className="font-medium text-gray-800">
                            {formatDate(schedule.date.toString())}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Starts at {schedule.time}
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No available dates for booking.</p>
                )}
              </div>

              <button
                onClick={() => navigate(`/booking/${trip._id}`)}
                className="w-full py-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-lg transition-colors shadow-md"
              >
                Continue to Booking
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetail;