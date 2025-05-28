// CreateTrip.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

// Import step components
import TripDetails from './steps/TripDetails';
import TripSchedule from './steps/TripSchedule';
import TripPath from './steps/TripPath';
import TripConfirmation from './steps/TripConfirmation';

// Types
export type TripType = 'Adventure' | 'Cultural' | 'Food' | 'Historical' | 'Nature' | 'Relaxation' | 'Group';

export interface Schedule {
  date: Date;
  time: string;
  isAvailable: boolean;
}

export interface Location {
  name: string;
  position: { lat: number; lng: number };
}

export interface TripData {
  title: string;
  city: string;
  price: number;
  description: string;
  type: TripType;
  schedule: Schedule[];
  path: Location[];
  image?: File | null;
}

// Success Modal Component
const SuccessModal: React.FC<{
  isOpen: boolean;
  tripTitle: string;
  onClose: () => void;
  onViewProfile: () => void;
  onCreateAnother: () => void;
}> = ({ isOpen, tripTitle, onClose, onViewProfile, onCreateAnother }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 mx-4 max-w-md w-full transform animate-in zoom-in-95 duration-300">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-in zoom-in duration-500 delay-200">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            🎉 Trip Created Successfully!
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Your trip <span className="font-semibold text-orange-600">"{tripTitle}"</span> has been created and is now available for bookings.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onViewProfile}
            className="w-full py-4 bg-gradient-to-r from-orange-400 to-amber-400 text-white rounded-xl font-semibold hover:from-orange-500 hover:to-amber-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            View My Trips
          </button>
          
          <button
            onClick={onCreateAnother}
            className="w-full py-4 bg-white text-gray-700 rounded-xl font-semibold border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            Create Another Trip
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-3 text-gray-500 hover:text-gray-700 transition-colors duration-200 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Loading Overlay Component
const LoadingOverlay: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-8 mx-4 max-w-sm w-full text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Creating Your Trip</h3>
        <p className="text-gray-600">Please wait while we set up your amazing journey...</p>
      </div>
    </div>
  );
};

const CreateTrip: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [tripData, setTripData] = useState<TripData>({
    title: '',
    city: '',
    price: 0,
    description: '',
    type: 'Cultural',
    schedule: [],
    path: [],
    image: null
  });

  // Update trip data function with proper typing
  const updateTripData = (data: Partial<TripData>): void => {
    setTripData(prevData => ({ ...prevData, ...data }));
  };

  // Navigation functions
  // Validate current step data
  const validateStep = (stepNumber: number): boolean => {
    let isValid = true;
    
    switch (stepNumber) {
      case 1:
        if (!tripData.city || tripData.city.trim() === '') {
          toast.error('Please enter a city name');
          isValid = false;
        }
        if (!tripData.price || tripData.price <= 0) {
          toast.error('Please enter a valid price');
          isValid = false;
        }
        if (!tripData.type) {
          toast.error('Please select a trip type');
          isValid = false;
        }
        if (!tripData.description || tripData.description.length < 10) {
          toast.error('Please enter a description (minimum 10 characters)');
          isValid = false;
        }
        break;
      case 2:
        if (tripData.schedule.length === 0) {
          toast.error('Please add at least one schedule time');
          isValid = false;
        }
        break;
      case 3:
        if (tripData.path.length === 0) {
          toast.error('Please add at least one location to your trip path');
          isValid = false;
        }
        break;
      default:
        break;
    }
    
    return isValid;
  };
  
  // Try to go to a specific step (used for direct navigation)
  const goToStep = (step: number): void => {
    // Can't go beyond step 4
    if (step > 4) return;
    
    // Can always go back to previous steps
    if (step < currentStep) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // If trying to advance more than one step, validate all intermediate steps
    if (step > currentStep + 1) {
      for (let i = currentStep; i < step; i++) {
        if (!validateStep(i)) {
          return; // Stop if any validation fails
        }
      }
    } else {
      // If going to the next step, just validate the current one
      if (!validateStep(currentStep)) {
        return;
      }
    }
    
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle back button
  const handleBack = (): void => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Handle next button
  const handleNext = (): void => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Submit function
  const handleSubmit = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Set title if not provided
      if (!tripData.title) {
        tripData.title = `${tripData.city} Trip`;
      }
      
      // Create FormData object to handle file upload
      const formData = new FormData();
      
      // Append all trip data to FormData
      formData.append('title', tripData.title);
      formData.append('city', tripData.city);
      formData.append('price', tripData.price.toString());
      formData.append('description', tripData.description);
      formData.append('type', tripData.type);
      
      // Convert schedule array to JSON string
      formData.append('schedule', JSON.stringify(tripData.schedule));
      
      // Convert path array to JSON string
      formData.append('path', JSON.stringify(tripData.path));
      
      // Add image if available
      if (tripData.image) {
        formData.append('image', tripData.image);
      }
      
      // Make API call to create trip
      const response = await axios.post('http://localhost:3000/trip/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // Include authorization if your auth token is stored in localStorage/sessionStorage
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Trip created:', response.data);
      
      // Show success modal instead of toast
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Error creating trip:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Failed to create trip';
        toast.error(errorMessage);
      } else {
        toast.error('Failed to create trip. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Success modal handlers
  const handleViewProfile = () => {
    setShowSuccessModal(false);
    navigate('/profile');
  };

  const handleCreateAnother = () => {
    setShowSuccessModal(false);
    // Reset form data
    setTripData({
      title: '',
      city: '',
      price: 0,
      description: '',
      type: 'Cultural',
      schedule: [],
      path: [],
      image: null
    });
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
  };

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <TripDetails 
            tripData={tripData} 
            updateTripData={updateTripData} 
          />
        );
      case 2:
        return (
          <TripSchedule 
            tripData={tripData} 
            updateTripData={updateTripData} 
          />
        );
      case 3:
        return (
          <TripPath 
            tripData={tripData} 
            updateTripData={updateTripData} 
          />
        );
      case 4:
        return (
          <TripConfirmation 
            tripData={tripData} 
            handleSubmit={handleSubmit}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  const stepLabels = ['Trip Details', 'Schedule', 'Path', 'Confirm'];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-3">Create Your Trip</h1>
            <p className="text-gray-600 text-lg">Plan your perfect journey in just a few steps</p>
          </div>
          
          {/* Progress Steps */}
          <div className="mb-12">
            {/* Step indicators */}
            <div className="flex justify-between items-center relative mb-6">
              {/* Progress line background */}
              <div className="absolute left-0 top-1/2 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
              {/* Active progress line */}
              <div 
                className="absolute left-0 top-1/2 h-0.5 bg-gradient-to-r from-orange-400 to-amber-400 -translate-y-1/2 z-10 transition-all duration-500 ease-out"
                style={{ width: `${(currentStep - 1) * 33.33}%` }}
              ></div>
              
              {[1, 2, 3, 4].map((step) => (
                <button 
                  key={step}
                  onClick={() => goToStep(step)}
                  className={`relative z-20 w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-200
                    ${currentStep >= step 
                      ? 'bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-lg' 
                      : 'bg-white text-gray-400 border-2 border-gray-200 hover:border-gray-300'
                    }
                    ${step <= currentStep && 'cursor-pointer'}
                    ${step > currentStep && 'cursor-not-allowed opacity-60'}
                  `}
                  disabled={step > currentStep && !validateStep(currentStep)}
                  title={stepLabels[step - 1]}
                >
                  {currentStep > step ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    step
                  )}
                </button>
              ))}
            </div>
            
            {/* Step Labels */}
            <div className="flex justify-between">
              {stepLabels.map((label, index) => (
                <div 
                  key={index}
                  className={`text-sm font-medium transition-colors duration-300 ${
                    currentStep >= index + 1 ? 'text-orange-600' : 'text-gray-500'
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
            {renderStep()}
          </div>

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex justify-between items-center">
              {currentStep > 1 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center px-6 py-3 bg-white text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium shadow-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              ) : (
                <div></div>
              )}
              
              <button
                onClick={handleNext}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-orange-400 to-amber-400 text-white rounded-xl hover:from-orange-500 hover:to-amber-500 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Continue
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      <LoadingOverlay isVisible={loading} />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        tripTitle={tripData.title || `${tripData.city} Trip`}
        onClose={handleCloseSuccess}
        onViewProfile={handleViewProfile}
        onCreateAnother={handleCreateAnother}
      />
    </>
  );
};

export default CreateTrip;