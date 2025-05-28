import React, { useState, useEffect, useMemo } from 'react';
import { TripData } from '../CreateTrip';
import { useNavigate } from 'react-router-dom';
import TripService from '../../../services/TripService';

interface TripConfirmationProps {
  tripData: TripData;
  handleSubmit: () => Promise<void>;
  loading: boolean;
}

const TripConfirmation: React.FC<TripConfirmationProps> = ({
  tripData,
  handleSubmit,
  loading
}) => {
  const navigate = useNavigate();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  // Safely initialize with default values using useMemo to prevent unnecessary re-renders
  const safeTripData = useMemo(() => ({
    ...tripData,
    path: tripData.path || [], // Ensure path is always an array
    schedule: tripData.schedule || [] // Ensure schedule is always an array
  }), [tripData]);

  // Validate the entire trip data using TripService
  useEffect(() => {
    const validateTripData = () => {
      try {
        // Create the validation data structure
        const validationData = {
          title: safeTripData.title || `${safeTripData.city} Trip`,
          city: safeTripData.city,
          price: safeTripData.price,
          description: safeTripData.description,
          type: safeTripData.type,
          schedule: safeTripData.schedule,
          path: safeTripData.path,
          startLocation: {
            type: 'Point' as const,
            coordinates: safeTripData.path.length > 0 && 
                        safeTripData.path[0].position.lng && 
                        safeTripData.path[0].position.lat
              ? [safeTripData.path[0].position.lng, safeTripData.path[0].position.lat] as [number, number]
              : [35.8900, 32.2800] as [number, number]
          },
          image: safeTripData.image || undefined
        };

        const errors = TripService.validateTripData(validationData);
        setValidationErrors(errors);
        setIsFormValid(errors.length === 0);
      } catch (error) {
        console.error('Validation error:', error);
        setValidationErrors(['An error occurred while validating trip data']);
        setIsFormValid(false);
      }
    };

    validateTripData();
  }, [safeTripData]);

  // Generate image preview URL if image exists
  const imagePreview = safeTripData.image 
    ? URL.createObjectURL(safeTripData.image) 
    : null;
  
  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Group schedule items by date for better display
  const scheduleByDate = safeTripData.schedule.reduce((acc, item) => {
    const dateString = item.date.toDateString();
    if (!acc[dateString]) {
      acc[dateString] = [];
    }
    acc[dateString].push(item);
    return acc;
  }, {} as Record<string, typeof safeTripData.schedule>);

  // Get trip statistics
  const getTripStats = () => {
    const totalTimeSlots = safeTripData.schedule.length;
    const uniqueDates = Object.keys(scheduleByDate).length;
    const totalStations = safeTripData.path.length;
    
    return {
      totalTimeSlots,
      uniqueDates,
      totalStations
    };
  };

  const stats = getTripStats();

  // Handle form submission with validation
  const handleConfirmedSubmit = async () => {
    if (!isFormValid) {
      return;
    }
    
    if (!TripService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    await handleSubmit();
  };

  // Format trip data for display using TripService formatter if needed
  const formattedTripData = TripService.formatTripForDisplay({
    _id: 'temp',
    title: safeTripData.title || `${safeTripData.city} Trip`,
    guide: 'temp',
    city: safeTripData.city,
    price: safeTripData.price,
    description: safeTripData.description,
    type: safeTripData.type,
    schedule: safeTripData.schedule,
    path: safeTripData.path,
    startLocation: {
      type: 'Point',
      coordinates: safeTripData.path.length > 0 && 
                  safeTripData.path[0].position.lng && 
                  safeTripData.path[0].position.lat
        ? [safeTripData.path[0].position.lng, safeTripData.path[0].position.lat]
        : [35.8900, 32.2800]
    },
    isAvailable: true,
    imageUrl: imagePreview || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  return (
    <div>
      <h2 className="text-2xl font-medium mb-6">Trip Confirmation</h2>
      
      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-red-800 font-medium mb-2">Please fix the following issues:</h3>
              <ul className="text-red-700 text-sm space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Trip Summary */}
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-semibold text-gray-800">
              {safeTripData.title || `${safeTripData.city} Trip`}
            </h3>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              {safeTripData.type}
            </span>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-md p-3">
              <div className="text-lg font-bold text-orange-600">{stats.totalStations}</div>
              <div className="text-xs text-gray-600">Stations</div>
            </div>
            <div className="bg-white rounded-md p-3">
              <div className="text-lg font-bold text-orange-600">{stats.uniqueDates}</div>
              <div className="text-xs text-gray-600">Days Available</div>
            </div>
            <div className="bg-white rounded-md p-3">
              <div className="text-lg font-bold text-orange-600">{stats.totalTimeSlots}</div>
              <div className="text-xs text-gray-600">Time Slots</div>
            </div>
          </div>
        </div>
        
        {/* Image Preview */}
        {imagePreview && (
          <div className="rounded-lg overflow-hidden border border-gray-200">
            <img
              src={imagePreview}
              alt="Trip Preview"
              className="w-full h-48 object-cover"
            />
          </div>
        )}
        
        {/* Price */}
        <div className="flex items-center justify-between border-b pb-4">
          <span className="text-gray-600 font-medium">Price per person</span>
          <span className="text-2xl font-bold text-orange-600">{formattedTripData.formattedPrice}</span>
        </div>
        
        {/* Description */}
        <div>
          <h4 className="text-lg font-medium mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Description
          </h4>
          <div className="bg-gray-50 rounded-md p-4">
            <p className="text-gray-700 leading-relaxed">
              {safeTripData.description}
            </p>
          </div>
        </div>
        
        {/* Schedule */}
        <div>
          <h4 className="text-lg font-medium mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Schedule ({stats.totalTimeSlots} time slots)
          </h4>
          {safeTripData.schedule.length > 0 ? (
            <div className="space-y-3">
              {Object.entries(scheduleByDate).map(([dateString, items]) => (
                <div key={dateString} className="border border-gray-200 rounded-md p-4 bg-white">
                  <div className="font-medium text-gray-800 mb-2">{formatDate(new Date(dateString))}</div>
                  <div className="flex flex-wrap gap-2">
                    {items.map((item, idx) => (
                      <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                        {item.time}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-gray-500 italic text-center">No schedule times added yet.</p>
            </div>
          )}
        </div>
        
        {/* Path */}
        <div>
          <h4 className="text-lg font-medium mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Trip Path ({stats.totalStations} stations)
          </h4>
          {safeTripData.path.length > 0 ? (
            <div className="bg-white border border-gray-200 rounded-md p-4">
              <div className="space-y-3">
                {safeTripData.path.map((location, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{location.name}</div>
                      {location.position.lat && location.position.lng && (
                        <div className="text-xs text-gray-500">
                          {TripService.formatCoordinates({
                            type: 'Point',
                            coordinates: [location.position.lng, location.position.lat]
                          })}
                        </div>
                      )}
                    </div>
                    {idx < safeTripData.path.length - 1 && (
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-gray-500 italic text-center">No stations added yet.</p>
            </div>
          )}
        </div>

        {/* Start Location Info */}
        {safeTripData.path.length > 0 && safeTripData.path[0].position.lat && safeTripData.path[0].position.lng && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h5 className="font-medium text-blue-800 mb-2">Trip Start Location</h5>
            <p className="text-blue-700 text-sm">
              Your trip will start at <strong>{safeTripData.path[0].name}</strong>
            </p>
            <p className="text-blue-600 text-xs mt-1">
              Coordinates: {TripService.formatCoordinates({
                type: 'Point',
                coordinates: [safeTripData.path[0].position.lng, safeTripData.path[0].position.lat]
              })}
            </p>
          </div>
        )}
        
        {/* Submit Button */}
        <div className="pt-4">
          <button
            onClick={handleConfirmedSubmit}
            disabled={loading || !isFormValid}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg transform
              ${loading || !isFormValid
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-400 to-amber-400 text-white hover:from-orange-500 hover:to-amber-500 hover:shadow-xl hover:-translate-y-0.5'
              }
            `}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Your Trip...
              </div>
            ) : !isFormValid ? (
              'Please Fix Validation Errors'
            ) : (
              'Create Trip & Publish'
            )}
          </button>
          
          {!isFormValid && (
            <p className="text-red-500 text-sm text-center mt-2">
              Please go back and fix the highlighted issues before creating your trip.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripConfirmation;