import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const API_URL = 'http://localhost:5000';

interface Application {
  _id: string;
  status: 'pending' | 'approved' | 'rejected';
  languages: string[];
  specialties: string[];
  createdAt: string;
  feedback?: string;
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
     startLocation: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
    description: string;
  }
  };
}


const TouristView = () => {
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const [ bookingRes] = await Promise.all([
          
          axios.get(`${API_URL}/booking/myBookings`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        setBookings(bookingRes.data);
      } catch (err: any) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            setError('Session expired. Please log in again.');
          } else {
            setError('Failed to load data.');
          }
        } else {
          setError('Connection error.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`${API_URL}/booking/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(prev => prev.filter(b => b._id !== bookingId));
    } catch (error) {
      console.log(error);
      alert('Failed to delete booking.');
    }
  };

  const renderStatusCard = () => {
    if (!application) return null;

    const statusConfig = {
      approved: {
        color: 'from-emerald-100 to-emerald-50',
        icon: '✨',
        title: 'Congratulations!',
        message: 'Your guide application has been approved.'
      },
      rejected: {
        color: 'from-rose-100 to-rose-50',
        icon: '⚠️',
        title: 'Application Not Approved',
        message: application.feedback || 'We appreciate your interest.'
      },
      pending: {
        color: 'from-amber-100 to-amber-50',
        icon: '⏳',
        title: 'Application Pending',
        message: 'We\'re reviewing your submission.'
      }
    };

    const config = statusConfig[application.status];

    return (
      <div className={`bg-gradient-to-br ${config.color} rounded-2xl p-6 shadow-sm mb-8`}>
        <div className="flex items-start gap-4">
          <span className="text-3xl">{config.icon}</span>
          <div>
            <h3 className="text-xl font-bold mb-1">{config.title}</h3>
            <p className="text-gray-700">{config.message}</p>
          </div>
        </div>
      </div>
    );
  };

const renderBookings = () => (
  <div className="max-w-4xl mx-auto mt-10 px-4">
    <h2 className="text-3xl font-bold text-gray-800 mb-8">Your Bookings</h2>

    {bookings.length === 0 ? (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-500 text-lg mb-4">You don't have any bookings yet.</p>
        <a
          href="/trips"
          className="inline-block px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          Browse Trips
        </a>
      </div>
    ) : (
      <div className="space-y-4">
        {bookings.map((booking) => {
          const date = new Date(booking.scheduledDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
          const time = booking.scheduledTime;
          
          return (
            <div
              key={booking._id}
              className="flex bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
            >
              {/* Image */}
              <div className="w-32 h-32 flex-shrink-0 relative">
                <img
                  src={booking.trip.imageUrl || "/group.jpg"}
                  alt={booking.trip.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Circular Path Overlay */}
                {booking.trip.path && booking.trip.path.length > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-24 h-24">
                      {/* Circle */}
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="rgba(251, 191, 36, 0.5)"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                        />
                      </svg>
                      
                      
                    </div>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 p-5 flex flex-col">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{booking.trip.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">{booking.trip.city}</p>
                  
                  <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="font-medium">Date:</span> {date} at {time}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> <span className="capitalize">{booking.status}</span>
                    </div>
                    <div>
                      <span className="font-medium">Price:</span> ${booking.trip.price}
                    </div>
                    <div>
                    </div>
                  </div>
                  
                  {/* Path Preview */}
                  {booking.trip.path && booking.trip.path.length > 0 && (
                    <div className="mt-3 flex items-center flex-wrap gap-2">
                      {booking.trip.path.slice(0, 7).map((location, index) => (
                        <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          {location.name}
                        </span>
                      ))}
                      {booking.trip?.path.length > 7 && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          +{booking.trip.path.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
                              {booking.trip.startLocation && booking.trip.startLocation.coordinates && (
                <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                  
                  <a
                    href={`https://www.google.com/maps?q=${booking.trip.startLocation.coordinates[1]},${booking.trip.startLocation.coordinates[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-amber-500 text-sm text-white font-medium rounded-md shadow-sm hover:bg-amber-600 transition-colors"
                  >
                    View the starting point on Map
                  </a>
                </div>
              )}
  
                {/* Delete Button */}
                <div className="mt-4 self-end">
                  <button
                    onClick={() => handleDeleteBooking(booking._id)}
                    className="flex items-center gap-1 text-amber-900 hover:text-red-600 text-sm font-medium transition-colors"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your application status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">❌</span>
          </div>
          <h3 className="text-2xl font-bold mb-3">Oops!</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-medium hover:shadow-md transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
    

        {renderBookings()}

        {!application && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="flex flex-col items-center text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Become a Guide</h3>
                <p className="text-gray-600 mb-4">Share your unique perspective and earn money showing travelers around</p>
                <button
                  onClick={() => navigate('/apply')}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-md transition-all"
                >
                  Apply to Guide
                </button>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="flex flex-col items-center text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Explore Trips</h3>
                <p className="text-gray-600 mb-4">Discover authentic experiences with our local guides</p>
                <button
                  onClick={() => navigate('/trips')}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-md transition-all"
                >
                  Browse Trips
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TouristView;
