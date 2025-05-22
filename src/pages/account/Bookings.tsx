// src/pages/account/Bookings.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthService from '../../services/AuthService';
import { Calendar, Clock, MapPin, Users, CreditCard, Tag } from 'lucide-react';

// Define the API URL (should match other components)
const API_URL = (
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000'
    : 'https://your-production-api.com'
);

interface Location {
  name: string;
  position: {
    lat: number;
    lng: number;
  };
}

interface Trip {
  _id: string;
  title: string;
  guide: string;
  city: string;
  path: Location[];
  imageUrl?: string;
  price: number;
  description: string;
  type: string;
}

interface Booking {
  _id: string;
  tourist: string;
  trip: Trip;
  guide: string;
  scheduledDate: string;
  scheduledTime: string;
  numberOfPeople: number;
  totalPrice: number;
  specialRequests: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  bookingStatus: 'pending' | 'confirmed' | 'completed' | 'canceled' | 'no-show';
  contactPhone: string;
  contactEmail: string;
  createdAt: string;
  updatedAt: string;
}

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = AuthService.getToken();
        if (!token) {
          setError('You must be logged in to view bookings');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/booking/my-bookings`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setBookings(response.data.bookings);
        } else {
          setError('Failed to load bookings');
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('An error occurred while fetching your bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.scheduledDate);
    const today = new Date();
    
    if (activeTab === 'upcoming') {
      return bookingDate >= today && booking.bookingStatus !== 'canceled';
    } else if (activeTab === 'past') {
      return bookingDate < today || booking.bookingStatus === 'completed' || booking.bookingStatus === 'canceled';
    }
    return true; // 'all' tab
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Get status badge styling
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-solid border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Bookings</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'upcoming'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'past'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Past
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Bookings
          </button>
        </nav>
      </div>

      {/* Booking Cards */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {activeTab === 'upcoming'
              ? "You don't have any upcoming bookings."
              : activeTab === 'past'
              ? "You don't have any past bookings."
              : "You don't have any bookings yet."}
          </p>
          <Link
            to="/trips"
            className="mt-4 inline-block px-6 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors"
          >
            Explore Trips
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="md:flex">
                {/* Trip Image */}
                <div className="md:w-48 h-48 md:h-auto bg-gray-200 flex-shrink-0">
                  <img
                    src={booking.trip.imageUrl || '/trip-placeholder.jpg'}
                    alt={booking.trip.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Booking Details */}
                <div className="p-6 flex-1">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(booking.bookingStatus)}`}>
                          {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          Booked on {new Date(booking.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-gray-800 mb-2">{booking.trip.title}</h2>
                      
                      <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-4">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{formatDate(booking.scheduledDate)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{booking.scheduledTime}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{booking.trip.city}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          <span>{booking.numberOfPeople} {booking.numberOfPeople > 1 ? 'people' : 'person'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:text-right mt-4 md:mt-0">
                      <div className="mb-2 flex items-center md:justify-end">
                        <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-500">
                          Payment: {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                        </span>
                      </div>
                      <div className="text-xl font-bold text-gray-800">${booking.totalPrice}</div>
                      <div className="flex items-center md:justify-end mt-1">
                        <Tag className="h-4 w-4 mr-2 text-amber-500" />
                        <span className="text-sm text-gray-600">${booking.trip.price} per person</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link 
                      to={`/trip/${booking.trip._id}`}
                      className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      View Trip
                    </Link>
                    
                    {booking.bookingStatus === 'pending' && new Date(booking.scheduledDate) > new Date() && (
                      <>
                        <button className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                          Confirm Payment
                        </button>
                        <button className="px-4 py-2 text-sm bg-white border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors">
                          Cancel Booking
                        </button>
                      </>
                    )}
                    
                    {booking.bookingStatus === 'confirmed' && new Date(booking.scheduledDate) > new Date() && (
                      <button className="px-4 py-2 text-sm bg-white border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors">
                        Cancel Booking
                      </button>
                    )}
                    
                    {booking.bookingStatus === 'completed' && (
                      <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        Write a Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;