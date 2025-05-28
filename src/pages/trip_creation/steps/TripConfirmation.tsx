import React, { useState, useEffect } from 'react';
import { TripData } from '../CreateTrip';
import { useNavigate } from 'react-router-dom';

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
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
    show: boolean;
  }>({ message: '', type: 'success', show: false });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();

  // Safely initialize with default values
  const safeTripData = {
    ...tripData,
    path: tripData.path || [],
    schedule: tripData.schedule || []
  };

  // Handle image preview and cleanup
  useEffect(() => {
    if (tripData.image) {
      const preview = URL.createObjectURL(tripData.image);
      setImagePreview(preview);
      
      return () => {
        URL.revokeObjectURL(preview);
      };
    } else {
      setImagePreview(null);
    }
  }, [tripData.image]);

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
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

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
      if (type === 'success') {
        navigate('/account');
      }
    }, 3000);
  };

  const handleCreateTrip = async () => {
    try {
      await handleSubmit();
      // Only show success if no error was thrown
      showNotification('Trip created successfully!', 'success');
    } catch (error: any) {
      // Check for axios error structure
      let errorMessage = 'Failed to create trip';
      
      if (error.response) {
        // Handle axios response errors
        errorMessage = error.response.data?.message || error.response.statusText;
      } else if (error.message) {
        // Handle other errors
        errorMessage = error.message;
      }
      
      showNotification(errorMessage, 'error');
    }
  };

  return (
    <div className="relative">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-md shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {notification.message}
        </div>
      )}

      <h2 className="text-2xl font-medium mb-6">Trip Confirmation</h2>
      
      <div className="space-y-6">
        {/* Title and City */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">
            {safeTripData.city} Trip
          </h3>
          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
            {safeTripData.type}
          </span>
        </div>
        
        {/* Image Preview */}
        {imagePreview && (
          <div className="rounded-lg overflow-hidden h-40">
            <img
              src={imagePreview}
              alt="Trip Preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Price */}
        <div className="flex items-center justify-between border-b pb-4">
          <span className="text-gray-600">Price per person</span>
          <span className="font-semibold">{safeTripData.price} JD</span>
        </div>
        
        {/* Description */}
        <div>
          <h4 className="text-lg font-medium mb-2">Description</h4>
          <p className="text-gray-600">
            {safeTripData.description}
          </p>
        </div>
        
        {/* Schedule */}
        <div>
          <h4 className="text-lg font-medium mb-2">Schedule</h4>
          {safeTripData.schedule.length > 0 ? (
            <div className="space-y-3">
              {Object.entries(scheduleByDate).map(([dateString, items]) => (
                <div key={dateString} className="border rounded-md p-3">
                  <div className="font-medium">{formatDate(new Date(dateString))}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {items.map((item, idx) => (
                      <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                        {item.time}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No schedule times added yet.</p>
          )}
        </div>
        
        {/* Path */}
        <div>
          <h4 className="text-lg font-medium mb-2">Path & Attractions</h4>
          {safeTripData.path.length > 0 ? (
            <div className="space-y-2">
              {safeTripData.path.map((location, idx) => (
                <div key={idx} className="flex items-center">
                  <div className="w-6 h-6 bg-red-800 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs font-bold">{idx + 1}</span>
                  </div>
                  <span>{location.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No attractions added yet.</p>
          )}
        </div>
        
        {/* Submit Button */}
        <button
          onClick={handleCreateTrip}
          disabled={loading}
          className="w-full mt-4 bg-orange-400 text-white rounded-lg py-3 hover:bg-orange-500 transition disabled:bg-orange-300"
        >
          {loading ? 'Creating Trip...' : 'Create Trip'}
        </button>
      </div>
    </div>
  );
};

export default TripConfirmation;