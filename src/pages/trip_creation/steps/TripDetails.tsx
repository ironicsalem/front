// TripDetails.tsx
import React, { useState, useRef } from 'react';
import { TripData, TripType } from '../CreateTrip';

interface TripDetailsProps {
  tripData: TripData;
  updateTripData: (data: Partial<TripData>) => void;
}
const cities = [
  { name: "Amman" },
  { name: "Petra" },
  { name: "Aqaba" },
  { name: "Jerash" },
  { name: "Madaba" },
  { name: "Salt" },
  { name: "Irbid" },
  { name: "Zarqa" },
  { name: "Karak" },
  { name: "Ma'an" },
  { name: "Tafilah" },
  { name: "Ajloun" }
];

const TripDetails: React.FC<TripDetailsProps> = ({ tripData, updateTripData }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<{
    city?: string;
    price?: string;
    type?: string;
    description?: string;
  }>({});

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      updateTripData({ image: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const value = e.target.value;
  updateTripData({ city: value });

  if (value) {
    setErrors((prev) => ({ ...prev, city: undefined }));
  }
};


  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    updateTripData({ price: value ? parseInt(value) : 0 });
    
    // Clear error if value is valid
    if (value && parseInt(value) > 0) {
      setErrors({...errors, price: undefined});
    }
  };
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const value = e.target.value as TripType;
    updateTripData({ type: value });
    
    // Clear error if value is selected
    if (value) {
      setErrors({...errors, type: undefined});
    }
  };
  
 
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const value = e.target.value;
    updateTripData({ description: value });
    
    // Clear error if description is valid length
    if (value && value.length >= 10) {
      setErrors({...errors, description: undefined});
    }
  };

  const validateField = (field: 'city' | 'price' | 'type' | 'description', value: string | number): string | undefined => {
    switch (field) {
      case 'city':
        return !value ? 'City name is required' : undefined;
      case 'price':
        return (!value || Number(value) <= 0) ? 'Please enter a valid price' : undefined;
      case 'type':
        return !value ? 'Please select a trip type' : undefined;
      case 'description':
        return (!value || String(value).length < 10) ? 'Description must be at least 10 characters' : undefined;
      default:
        return undefined;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-medium mb-6">Trip details</h2>
    <div className="mb-6">
      <label className="block text-gray-600 mb-2">
        City <span className="text-red-500">*</span>
      </label>
      <select
        value={tripData.city}
        onChange={handleChange}
        onBlur={() =>
          setErrors({
            ...errors,
            city: validateField('city', tripData.city),
          })
        }
        className={`w-full border ${
          errors.city ? 'border-red-500' : 'border-gray-300'
        } rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300`}
        required
      >
        <option value="">Select a city</option>
        {cities.map((city, index) => (
          <option key={index} value={city.name}>
            {city.name}
          </option>
        ))}
      </select>
      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
    </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-600 mb-2">Price <span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type="text"
              value={tripData.price === 0 ? '' : tripData.price}
              onChange={handlePriceChange}
              onBlur={() => setErrors({...errors, price: validateField('price', tripData.price)})}
              className={`w-full border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-300`}
              placeholder="Price in JD"
              required
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
              <span>JD</span>
            </div>
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>
        </div>
        
        <div>
          <label className="block text-gray-600 mb-2">Type <span className="text-red-500">*</span></label>
          <div className="relative">
            <select
              value={tripData.type}
              onChange={handleTypeChange}
              onBlur={() => setErrors({...errors, type: validateField('type', tripData.type)})}
              className={`w-full border ${errors.type ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-orange-300`}
              required
            >
              <option value="">Select type</option>
              <option value="Individual">Individual</option>
              <option value="Group">Group</option>
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <label className="block text-gray-600 mb-2">Description <span className="text-red-500">*</span></label>
        <textarea
          value={tripData.description}
          onChange={handleDescriptionChange}
          onBlur={() => setErrors({...errors, description: validateField('description', tripData.description)})}
          className={`w-full border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-3 h-32 focus:outline-none focus:ring-2 focus:ring-orange-300`}
          placeholder="Describe your trip..."
          required
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>
      
      <div className="mt-6">
        <label className="block text-gray-600 mb-2">Image</label>
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:bg-gray-50"
        >
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="Trip Preview" className="max-h-48 mx-auto rounded-md" />
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setImagePreview(null);
                  updateTripData({ image: null });
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          ) : (
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-1">Click to upload an image</p>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
            accept="image/*"
          />
        </div>
      </div>
    </div>
  );
};

export default TripDetails;