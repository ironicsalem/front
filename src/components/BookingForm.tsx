import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
  Navigation
} from 'lucide-react';
import TripService, { TripWithGuide } from '../services/TripService';
import BookingService from '../services/BookingService';
import AuthService from '../services/AuthService';
import { TripSchedule, BaseUser, CreateBookingRequest } from '../types/Types';

interface BookingFormData {
  contactPhone: string;
  contactEmail: string;
}

const BookingForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract pre-selected date and time from URL params
  const searchParams = new URLSearchParams(location.search);
  const preSelectedDate = searchParams.get('date');
  const preSelectedTime = searchParams.get('time');

  // State management
  const [trip, setTrip] = useState<TripWithGuide | null>(null);
  const [currentUser, setCurrentUser] = useState<BaseUser | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TripSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<TripSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form data
  const [formData, setFormData] = useState<BookingFormData>({
    contactPhone: '',
    contactEmail: ''
  });

  // Validation errors
  const [fieldErrors, setFieldErrors] = useState<Partial<BookingFormData>>({});

  useEffect(() => {
    const initializeForm = async () => {
      if (!id) {
        setError('Trip ID is required');
        setLoading(false);
        return;
      }

      if (!AuthService.isAuthenticated()) {
        setError('You must be logged in to book a trip');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const [tripData, userData] = await Promise.all([
          TripService.getTripById(id),
          AuthService.getCurrentUser()
        ]);

        setTrip(tripData);
        setCurrentUser(userData);

        // Pre-fill contact information
        setFormData({
          contactEmail: userData.email || '',
          contactPhone: userData.phone || ''
        });

        // Get available time slots
        if (tripData.schedule) {
          const available = tripData.schedule.filter(slot => slot.isAvailable);
          setAvailableSlots(available);
          
          // Pre-select schedule if date and time were provided
          if (preSelectedDate && preSelectedTime) {
            const preSelected = available.find(slot => {
              const slotDate = new Date(slot.date).toISOString().split('T')[0];
              const normalizedDate = preSelectedDate.includes('T') 
                ? new Date(preSelectedDate).toISOString().split('T')[0]
                : preSelectedDate;
              
              return slotDate === normalizedDate && slot.time === preSelectedTime;
            });
            
            if (preSelected) {
              setSelectedSchedule(preSelected);
            }
          }
        }

        setError(null);
      } catch (err) {
        console.error('Failed to initialize booking form:', err);
        if (err instanceof Error && err.message.includes('Unauthorized')) {
          setError('Your session has expired. Please log in again.');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to load booking information');
        }
      } finally {
        setLoading(false);
      }
    };

    initializeForm();
  }, [id, navigate, preSelectedDate, preSelectedTime]);

  const validateForm = (): boolean => {
    const errors: Partial<BookingFormData> = {};

    if (!selectedSchedule) {
      setError('Please select a date and time for your trip');
      return false;
    }

    if (!formData.contactPhone.trim()) {
      errors.contactPhone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-()]{8,}$/.test(formData.contactPhone.trim())) {
      errors.contactPhone = 'Please enter a valid phone number';
    }

    if (!formData.contactEmail.trim()) {
      errors.contactEmail = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail.trim())) {
      errors.contactEmail = 'Please enter a valid email address';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleScheduleSelect = (schedule: TripSchedule) => {
    setSelectedSchedule(schedule);
    setError(null);
  };

  const handleInputChange = (field: keyof BookingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !trip || !currentUser || !selectedSchedule) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const bookingData: Omit<CreateBookingRequest, 'trip'> = {
        tourist: currentUser._id,
        guide: trip.guide._id,
        scheduledDate: new Date(selectedSchedule.date),
        scheduledTime: selectedSchedule.time,
        contactPhone: formData.contactPhone.trim(),
        contactEmail: formData.contactEmail.trim()
      };

      const result = await BookingService.bookSlot(trip._id, bookingData);
      
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/profile', { 
          state: { 
            bookingConfirmed: true, 
            bookingId: result.booking._id 
          } 
        });
      }, 2000);

    } catch (err) {
      console.error('Booking failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-500" />
          <p className="mt-4 text-gray-600">Loading booking form...</p>
        </div>
      </div>
    );
  }

  if (error || !trip || !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Unavailable</h2>
          <p className="text-gray-600 mb-6">{error || 'Unable to load booking information.'}</p>
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

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6">
            Your trip has been successfully booked. You'll receive a confirmation email shortly.
          </p>
          <p className="text-sm text-gray-500">Redirecting to your profile...</p>
        </motion.div>
      </div>
    );
  }

  const formattedTrip = TripService.formatTripForDisplay(trip);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Booking</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
                {/* Available Schedules */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    <Calendar className="inline h-4 w-4 mr-2" />
                    Select Date & Time
                  </label>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {availableSlots.map((schedule, index) => (
                      <div
                        key={index}
                        onClick={() => handleScheduleSelect(schedule)}
                        className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
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
                          <span className={`font-medium ${
                            selectedSchedule === schedule ? 'text-amber-900' : 'text-gray-900'
                          }`}>
                            {formatDate(schedule.date.toString())}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className={`h-4 w-4 ${
                            selectedSchedule === schedule ? 'text-amber-600' : 'text-gray-500'
                          }`} />
                          <span className={`font-medium ${
                            selectedSchedule === schedule ? 'text-amber-700' : 'text-gray-600'
                          }`}>
                            {schedule.time}
                          </span>
                        </div>
                      </div>
                    ))}
                    {availableSlots.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No available time slots for this trip</p>
                      </div>
                    )}
                  </div>
                  
                  {selectedSchedule && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <span className="font-medium">Selected:</span> {formatDate(selectedSchedule.date.toString())} at {selectedSchedule.time}
                      </p>
                    </div>
                  )}
                </div>

                {/* Contact Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="inline h-4 w-4 mr-2" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        placeholder="Your phone number"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${
                          fieldErrors.contactPhone ? 'border-red-300' : 'border-gray-300'
                        }`}
                        required
                      />
                      {fieldErrors.contactPhone && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.contactPhone}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="inline h-4 w-4 mr-2" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        placeholder="Your email address"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors ${
                          fieldErrors.contactEmail ? 'border-red-300' : 'border-gray-300'
                        }`}
                        required
                      />
                      {fieldErrors.contactEmail && (
                        <p className="mt-1 text-sm text-red-600">{fieldErrors.contactEmail}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <p className="text-red-800">{error}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Processing Booking...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      <span>Confirm Booking</span>
                    </div>
                  )}
                </button>
              </form>
            </div>

            {/* Trip Summary Sidebar */}
            <div className="space-y-6">
              {/* Trip Details */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Trip Summary</h3>
                
                <img
                  src={trip.imageUrl || '/trip-placeholder.jpg'}
                  alt={trip.title}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/trip-placeholder.jpg';
                  }}
                />

                <h4 className="font-semibold text-gray-900 mb-3">{trip.title}</h4>
                
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{trip.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4" />
                    <span>{trip.path?.length || 0} stops</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Guide: {trip.guideUser?.name}</span>
                  </div>
                </div>

                {/* Selected Date & Time */}
                {selectedSchedule && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm font-medium text-amber-900 mb-1">Selected Date & Time:</p>
                    <p className="text-amber-800">
                      {formatDate(selectedSchedule.date.toString())} at {selectedSchedule.time}
                    </p>
                  </div>
                )}

                {/* Price */}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Price:</span>
                    <span className="text-2xl font-bold text-amber-600">{formattedTrip.formattedPrice}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">per person</p>
                </div>
              </div>

              {/* Guide Information */}
              {trip.guideUser && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Guide</h3>
                  <div className="flex items-center gap-3">
                    <img
                      src={trip.guideUser.profilePicture || '/NoPic.jpg'}
                      alt={trip.guideUser.name}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/NoPic.jpg';
                      }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{trip.guideUser.name}</p>
                      {trip.guide.averageRating > 0 && (
                        <p className="text-sm text-gray-600">
                          ⭐ {trip.guide.averageRating.toFixed(1)} ({trip.guide.ratings.length} reviews)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 mb-3">Important Information</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• You'll receive a confirmation email after booking</li>
                  <li>• Your guide will contact you before the trip</li>
                  <li>• Please arrive at the meeting point 10 minutes early</li>
                  <li>• Cancellation is possible up to 24 hours before the trip</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingForm;