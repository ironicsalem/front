import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Calendar, Clock, Users, Phone, Mail, FileText, CreditCard } from 'lucide-react';

// API URL configuration
const API_URL = (
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000'
    : 'https://your-production-api.com'
);

// Define interfaces for booking data
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

interface BookingFormData {
  tripId: string;
  scheduledDate: Date | string;
  scheduledTime: string;
  numberOfPeople: number;
  specialRequests: string;
  contactPhone: string;
  contactEmail: string;
}

const Booking: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [currentUser] = useState<{ email: string; phone?: string } | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [bookingData, setBookingData] = useState<BookingFormData>({
    tripId: tripId || '',
    scheduledDate: '',
    scheduledTime: '',
    numberOfPeople: 1,
    specialRequests: '',
    contactPhone: '',
    contactEmail: '',
  });

  // Get state from navigation (if available)
  useEffect(() => {
    if (location.state) {
      const { trip: tripFromState, selectedDate: scheduleFromState } = location.state as { 
        trip?: Trip; 
        selectedDate?: Schedule 
      };
      
      if (tripFromState) {
        setTrip(tripFromState);
        setBookingData(prev => ({
          ...prev,
          tripId: tripFromState._id
        }));
      }
      
      if (scheduleFromState) {
        setSelectedSchedule(scheduleFromState);
        setBookingData(prev => ({
          ...prev,
          scheduledDate: scheduleFromState.date,
          scheduledTime: scheduleFromState.time
        }));
      }
    }
  }, [location.state]);

  // Fetch trip data if not provided in navigation state
  useEffect(() => {
    const fetchTripDetails = async () => {
      if (trip) {
        setLoading(false);
        return;
      }
      
      try {
        const token = localStorage.getItem('authToken');
        const url = `${API_URL}/trip/${tripId}`;
        
        const config = {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        };
        
        const response = await axios.get(url, config);
        setTrip(response.data.trip);
        setBookingData(prev => ({
          ...prev,
          tripId: response.data.trip._id
        }));
        setError(null);
      } catch (error) {
        console.error('Failed to fetch trip details:', error);
        
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            setError(`Trip not found. This trip may have been removed.`);
          } else {
            setError(`Error: ${error.message}`);
          }
        } else {
          setError('Failed to load trip details. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [tripId, trip]);


  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookingData({
      ...bookingData,
      [name]: name === 'numberOfPeople' ? parseInt(value) : value
    });
  };

  // Handle schedule selection
  const handleScheduleSelection = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setBookingData({
      ...bookingData,
      scheduledDate: schedule.date,
      scheduledTime: schedule.time
    });
  };

  // Submit booking
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const requiredFields = [
        { field: 'tripId', message: 'Trip information is missing' },
        { field: 'scheduledDate', message: 'Please select a date and time' },
        { field: 'scheduledTime', message: 'Please select a date and time' },
        { field: 'numberOfPeople', message: 'Please specify number of people' },
        { field: 'contactPhone', message: 'Contact phone is required' },
        { field: 'contactEmail', message: 'Contact email is required' }
      ];

      // Validate required fields
      for (const { field, message } of requiredFields) {
        if (!bookingData[field as keyof BookingFormData]) {
          setError(message);
          setSubmitting(false);
          return;
        }
      }

      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('You must be logged in to make a booking');
        setSubmitting(false);
        return;
      }

      const formattedData = {
        ...bookingData,
        scheduledDate: new Date(bookingData.scheduledDate).toISOString()
      };
      console.log(formattedData)
       await axios.post(
        `${API_URL}/booking/${trip?._id}`,
        formattedData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      setSuccess('Booking created successfully! Redirecting to your bookings...');
      
      // Reset form
      setBookingData({
        tripId: tripId || '',
        scheduledDate: '',
        scheduledTime: '',
        numberOfPeople: 1,
        specialRequests: '',
        contactPhone: currentUser?.phone || '',
        contactEmail: currentUser?.email || '',
      });
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      console.error('Error creating booking:', error);
      
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || error.message || 'Failed to create booking');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (date: Date | string) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!trip) return 0;
    return trip.price * bookingData.numberOfPeople;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-solid border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-gray-600">Loading booking details...</p>
      </div>
    );
  }

  if (error && !trip) {
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
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => navigate(`/trip/${trip._id}`)}
            className="inline-flex items-center text-gray-600 hover:text-amber-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Trip Details
          </button>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">Book Your Trip</h1>
          <p className="text-gray-600">Complete your booking for {trip.title}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  <p>{error}</p>
                </div>
              )}
              
              {success && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  <p>{success}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                {/* Date and Time Selection */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Date & Time</h3>
                  
                  {/* Combined Date and Time Selection */}
                  <div className="space-y-3">
                    {trip.schedule && trip.schedule
                      .filter(s => s.isAvailable)
                      .map((scheduleItem, index) => {
                        const isSelected = selectedSchedule && 
                          new Date(selectedSchedule.date).toISOString() === new Date(scheduleItem.date).toISOString() &&
                          selectedSchedule.time === scheduleItem.time;
                        
                        return (
                          <div 
                            key={index}
                            onClick={() => handleScheduleSelection(scheduleItem)}
                            className={`cursor-pointer p-4 rounded-lg border ${
                              isSelected 
                                ? 'border-amber-500 bg-amber-50' 
                                : 'border-gray-200 hover:border-amber-300'
                            }`}
                          >
                            <div className="font-medium">{formatDate(scheduleItem.date)}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              <Clock className="h-4 w-4 inline mr-1" />
                              {scheduleItem.time}
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
                
                {/* Guest Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Guest Information</h3>
                  
                  {/* Number of People */}
                  <div className="mb-4">
                    <label htmlFor="numberOfPeople" className="block text-gray-700 text-sm font-medium mb-2">
                      <Users className="h-4 w-4 inline mr-2" />
                      Number of People
                    </label>
                    <select
                      id="numberOfPeople"
                      name="numberOfPeople"
                      value={bookingData.numberOfPeople}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contactPhone" className="block text-gray-700 text-sm font-medium mb-2">
                        <Phone className="h-4 w-4 inline mr-2" />
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        id="contactPhone"
                        name="contactPhone"
                        value={bookingData.contactPhone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="contactEmail" className="block text-gray-700 text-sm font-medium mb-2">
                        <Mail className="h-4 w-4 inline mr-2" />
                        Contact Email
                      </label>
                      <input
                        type="email"
                        id="contactEmail"
                        name="contactEmail"
                        value={bookingData.contactEmail}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Special Requests */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
                  
                  <div>
                    <label htmlFor="specialRequests" className="block text-gray-700 text-sm font-medium mb-2">
                      <FileText className="h-4 w-4 inline mr-2" />
                      Special Requests or Requirements
                    </label>
                    <textarea
                      id="specialRequests"
                      name="specialRequests"
                      value={bookingData.specialRequests}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Any dietary requirements, accessibility needs, or other special requests?"
                    />
                  </div>
                </div>
                
                {/* Payment Method */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    <CreditCard className="h-5 w-5 inline mr-2" />
                    Payment Method
                  </h3>
                  <p className="text-gray-600 mb-4">Secure payment will be processed after booking confirmation.</p>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-700">You will receive instructions for payment after your booking is confirmed.</p>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={submitting || !selectedSchedule}
                  className={`w-full py-3 text-white font-medium rounded-lg transition-colors shadow-sm ${
                    submitting 
                      ? 'bg-amber-400 cursor-not-allowed' 
                      : !selectedSchedule 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-amber-500 hover:bg-amber-600'
                  }`}
                >
                  {submitting ? 'Processing...' : 'Complete Booking'}
                </button>
              </form>
            </div>
          </div>
          
          {/* Booking Summary */}
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Booking Summary</h3>
              
              {/* Trip Info */}
              <div className="mb-6">
                <div className="aspect-video rounded-lg overflow-hidden mb-4">
                  <img
                    src={trip.imageUrl || '/trip-placeholder.jpg'}
                    alt={trip.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-semibold text-lg">{trip.title}</h4>
                <p className="text-gray-600">{trip.city}</p>
              </div>
              
              {/* Selected Details */}
              <div className="space-y-3 mb-6">
                {/* Date and Time */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">Date & Time</span>
                  </div>
                  <div className="text-right">
                    {selectedSchedule ? (
                      <>
                        <div className="font-medium">{formatDate(selectedSchedule.date)}</div>
                        <div className="text-sm text-gray-500">
                          <Clock className="h-4 w-4 inline mr-1" />
                          {selectedSchedule.time}
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-500">Not selected</span>
                    )}
                  </div>
                </div>
                
                {/* Guests */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-gray-700">Guests</span>
                  </div>
                  <span className="font-medium">
                    {bookingData.numberOfPeople} {bookingData.numberOfPeople === 1 ? 'person' : 'people'}
                  </span>
                </div>
                
                {/* Divider */}
                <div className="border-t border-gray-200 my-4"></div>
              </div>
              
              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Price per person</span>
                  <span className="font-medium">${trip.price}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Number of people</span>
                  <span className="font-medium">× {bookingData.numberOfPeople}</span>
                </div>
                
                {/* Total */}
                <div className="flex justify-between items-center border-t border-gray-200 pt-4 mt-4">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-bold">${calculateTotalPrice()}</span>
                </div>
              </div>
              
              {/* Cancellation Policy */}
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <p className="font-medium mb-1">Cancellation Policy:</p>
                <p>Free cancellation up to 48 hours before the trip. After that, a 50% cancellation fee may apply.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;