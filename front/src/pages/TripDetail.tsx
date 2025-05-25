import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Calendar, ArrowLeft } from 'lucide-react';

// API URL configuration - make sure this matches exactly what's in Trips.tsx
const API_URL = (
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000' // Make sure this port matches your backend port exactly
    : 'https://your-production-api.com'
);

// Trip Interface - same as in Trips.tsx
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

const TripDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScheduleIndex, setSelectedScheduleIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTripDetails = async () => {
      setLoading(true);
      try {
        // Get auth token from localStorage (or wherever you store it)
        const token = localStorage.getItem('authToken');
        
        // Log the exact URL being used for the API call
        const url = `${API_URL}/trip/${id}`;
        console.log(`Fetching trip details from: ${url}`);
        
        const config = {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        };
        
        // Log the request configuration
        console.log('Request config:', config);
        
        const response = await axios.get(url, config);
        console.log('Trip data received:', response.data);
        setTrip(response.data);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch trip details', error);
        
        // Properly type error for TypeScript
        if (axios.isAxiosError(error)) {
          // Log the full error object for debugging
          console.log('Error details:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            config: error.config
          });
          
          // More detailed error message based on error type
          if (error.response?.status === 404) {
            setError(`Trip with ID ${id} not found. This ID might be invalid or the trip may have been removed.`);
          } else if (error.response?.status === 500) {
            setError(`Server error: There was a problem processing this trip. The server reported: ${error.response?.data?.error || error.message}`);
            
            console.log('Server error details:', error.response?.data);
          } else if (error.response?.status === 401) {
            setError('Authentication required. Please log in to view this trip.');
          } else if (error.code === 'ERR_NETWORK') {
            setError('Network error. Please check your connection and try again.');
          } else {
            setError(`Error ${error.response?.status || ''}: ${error.message}`);
          }
          
          // For development only: Use test data if the API fails 
          const isDevelopment = window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1';
          
          if (isDevelopment) {
            console.log('Using test trip data for development');
            setTimeout(() => {
              // Create test trip with the ID from URL
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
              setError(null); // Clear the error since we're showing test data
            }, 1000);
          }
        } else {
          // Handle non-Axios errors
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

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Handle radio button selection for date
  const handleDateSelection = (index: number) => {
    setSelectedScheduleIndex(index);
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
          src={trip.imageUrl || '/trip-placeholder.jpg'}
          alt={trip.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/trips')}
          className="absolute top-6 left-6 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-800" />
        </button>
        
        {/* Trip Title Overlay */}
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

      {/* Trip Details */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Trip Description */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">About This Trip</h2>
            <p className="text-gray-700 leading-relaxed mb-8">{trip.description}</p>
            
            {/* Locations */}
            <h3 className="text-xl font-bold text-gray-800 mb-4">Locations You'll Visit</h3>
            {trip.path && trip.path.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {trip.path.map((location, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm flex items-start gap-3">
                    <div className="bg-amber-100 text-amber-600 rounded-full p-2 mt-1">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{location.name}</h4>
                      <p className="text-gray-500 text-sm">Location {index + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mb-8">No locations specified for this trip.</p>
            )}
          </div>
          
          {/* Booking Sidebar */}
          <div>
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Book This Trip</h3>
              
              {/* Available Dates */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3">Available Dates</h4>
                {trip.schedule && trip.schedule.length > 0 ? (
                  <div className="space-y-3">
                    {trip.schedule
                      .filter(s => s.isAvailable)
                      .slice(0, 3) // Show only first 3 available dates
                      .map((schedule, index) => (
                        <div key={index} className="flex justify-between items-center border border-gray-200 rounded-lg p-3 hover:border-amber-300 transition-colors">
                          <div>
                            <div className="font-medium">{formatDate(schedule.date.toString())}</div>
                            <div className="text-sm text-gray-500">{schedule.time}</div>
                          </div>
                          <input 
                            type="radio" 
                            name="dateSelection" 
                            data-index={index}
                            checked={selectedScheduleIndex === index}
                            onChange={() => handleDateSelection(index)}
                            className="h-4 w-4 text-amber-500 focus:ring-amber-400" 
                          />
                        </div>
                      ))
                    }
                    {trip.schedule.filter(s => s.isAvailable).length > 3 && (
                      <button className="text-amber-600 text-sm font-medium">
                        View all {trip.schedule.filter(s => s.isAvailable).length} available dates
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No dates currently available.</p>
                )}
              </div>
              
              {/* Price */}
              <div className="flex justify-between items-center border-t border-gray-200 py-4 mb-4">
                <span className="text-gray-800">Price per person</span>
                <span className="font-bold text-gray-900">${trip.price}</span>
              </div>
              
              {/* Book Now Button */}
              <button 
                onClick={() => {
                  // Check if the user has selected a date
                  if (selectedScheduleIndex === null && trip.schedule && trip.schedule.filter(s => s.isAvailable).length > 0) {
                    // Show error message if no date is selected
                    setError("Please select a date for your trip before booking");
                    return;
                  }
                  
                  // Get the available schedule items
                  const availableSchedules = trip.schedule.filter(s => s.isAvailable);
                  
                  // Get the selected schedule
                  const selectedSchedule = selectedScheduleIndex !== null 
                    ? availableSchedules[selectedScheduleIndex] 
                    : null;
                  
                  // Navigate to booking page with trip ID and selected date
                  navigate(`/booking/${trip._id}`, {
                    state: {
                      trip: trip,
                      selectedDate: selectedSchedule
                    }
                  });
                }}
                className="w-full py-3 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors shadow-sm"
              >
                Book Now
              </button>
              
              {/* Error message for date selection */}
              {error && error === "Please select a date for your trip before booking" && (
                <div className="mt-3 text-red-600 text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetail;