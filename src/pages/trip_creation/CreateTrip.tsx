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
export type TripType = '' | 'Individual' | 'Group';

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

const CreateTrip: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tripData, setTripData] = useState<TripData>({
    title: '',
    city: '',
    price: 0,
    description: '',
    type: '',
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
      window.scrollTo(0, 0);
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
    window.scrollTo(0, 0);
  };

  // Handle back button
  const handleBack = (): void => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Handle next button
  const handleNext = (): void => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
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
      const response = await axios.post('http://localhost:3000/trip', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // Include authorization if your auth token is stored in localStorage/sessionStorage
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Trip created:', response.data);
      toast.success('Trip created successfully!');
      navigate('/trips');
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

  return (
    <div className="max-w-3xl mx-auto p-4 my-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Create a New Trip</h1>
      
      {/* Progress Steps - Make them clickable */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {[1, 2, 3, 4].map((step) => (
            <button 
              key={step}
              onClick={() => goToStep(step)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
                ${currentStep >= step ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-500'}
                ${step <= currentStep ? 'cursor-pointer hover:opacity-90' : 'cursor-not-allowed'}
              `}
              disabled={step > currentStep && !validateStep(currentStep)}
              title={
                step === 1 ? "Trip Details" :
                step === 2 ? "Trip Schedule" :
                step === 3 ? "Trip Path" : "Review & Confirm"
              }
            >
              {step}
            </button>
          ))}
        </div>
        <div className="relative h-1 mt-3">
          <div className="absolute left-0 top-0 h-1 bg-gray-200 w-full"></div>
          <div 
            className="absolute left-0 top-0 h-1 bg-orange-400 transition-all duration-300"
            style={{ width: `${(currentStep - 1) * 33.33}%` }}
          ></div>
        </div>
        
        {/* Step Labels */}
        <div className="flex justify-between text-xs mt-2">
          <div className={`${currentStep >= 1 ? 'text-orange-500 font-medium' : 'text-gray-500'}`}>Trip Details</div>
          <div className={`${currentStep >= 2 ? 'text-orange-500 font-medium' : 'text-gray-500'}`}>Schedule</div>
          <div className={`${currentStep >= 3 ? 'text-orange-500 font-medium' : 'text-gray-500'}`}>Path</div>
          <div className={`${currentStep >= 4 ? 'text-orange-500 font-medium' : 'text-gray-500'}`}>Confirm</div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        {renderStep()}
      </div>

      {/* Navigation Buttons - Only show these on steps 1-3, step 4 has its own submit button */}
      {currentStep < 4 && (
        <div className="flex justify-between">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition ml-auto"
          >
            Continue →
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateTrip;