import React, { useState } from 'react';
import { TripData, Location } from '../CreateTrip';
import TripService from '../../../services/TripService';

interface TripPathProps {
  tripData: TripData;
  updateTripData: (data: Partial<TripData>) => void;
}

const TripPath: React.FC<TripPathProps> = ({ tripData, updateTripData }) => {
  const [newStation, setNewStation] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [isAddingStation, setIsAddingStation] = useState<boolean>(false);
  
  // Ensure path is always an array (defensive programming)
  const path = tripData.path || [];
  
  // Validate path using TripService
  const validatePath = (pathData: Location[]): string | null => {
    if (pathData.length === 0) {
      return 'At least one location in path is required';
    }
    
    // Create a minimal trip data object for validation
    const validationData = {
      title: 'temp',
      city: tripData.city || 'temp',
      price: tripData.price || 1,
      description: tripData.description || 'temp description',
      type: tripData.type || 'Cultural',
      schedule: tripData.schedule || [],
      path: pathData,
      startLocation: {
        type: 'Point' as const,
        coordinates: pathData.length > 0 && pathData[0].position.lng && pathData[0].position.lat
          ? [pathData[0].position.lng, pathData[0].position.lat]
          : [35.8900, 32.2800] as [number, number]
      }
    };

    const validationErrors = TripService.validateTripData(validationData);
    const pathError = validationErrors.find(error => 
      error.toLowerCase().includes('path') || 
      error.toLowerCase().includes('location')
    );
    
    return pathError || null;
  };

  // Update path with validation
  const updatePathWithValidation = (newPath: Location[]) => {
    const error = validatePath(newPath);
    setValidationError(error || '');
    updateTripData({ path: newPath });
  };

  // Generate random coordinates around Jordan (Amman area)
  const generateJordanCoordinates = (): { lat: number; lng: number } => {
    // Amman coordinates with small random offset for variety
    const baseLatitude = 31.9539; // Amman latitude
    const baseLongitude = 35.9106; // Amman longitude
    
    // Add random offset within reasonable bounds (roughly within Jordan)
    const latOffset = (Math.random() - 0.5) * 0.5; // ±0.25 degrees
    const lngOffset = (Math.random() - 0.5) * 0.5; // ±0.25 degrees
    
    return {
      lat: baseLatitude + latOffset,
      lng: baseLongitude + lngOffset
    };
  };
  
  // Validate station name
  const validateStationName = (name: string): string | null => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      return 'Station name cannot be empty';
    }
    
    if (trimmedName.length < 2) {
      return 'Station name must be at least 2 characters long';
    }
    
    if (trimmedName.length > 100) {
      return 'Station name must be less than 100 characters';
    }
    
    // Check for duplicate names
    const isDuplicate = path.some(location => 
      location.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (isDuplicate) {
      return 'A station with this name already exists';
    }
    
    return null;
  };
  
  // Add a new station to the path
  const addStation = async (): Promise<void> => {
    const stationNameError = validateStationName(newStation);
    
    if (stationNameError) {
      setValidationError(stationNameError);
      return;
    }
    
    setIsAddingStation(true);
    
    try {
      const coordinates = generateJordanCoordinates();
      
      const newLocation: Location = {
        name: newStation.trim(),
        position: coordinates
      };
      
      const updatedPath = [...path, newLocation];
      updatePathWithValidation(updatedPath);
      
      setNewStation('');
      setValidationError('');
      
    } catch (error) {
      console.error('Error adding station:', error);
      setValidationError('Failed to add station. Please try again.');
    } finally {
      setIsAddingStation(false);
    }
  };
  
  // Remove a station from the path
  const removeStation = (index: number): void => {
    if (index < 0 || index >= path.length) {
      setValidationError('Invalid station index');
      return;
    }
    
    const updatedPath = [...path];
    updatedPath.splice(index, 1);
    updatePathWithValidation(updatedPath);
  };
  
  // Move a station up in the order
  const moveStationUp = (index: number): void => {
    if (index <= 0 || index >= path.length) return;
    
    const updatedPath = [...path];
    [updatedPath[index], updatedPath[index - 1]] = [updatedPath[index - 1], updatedPath[index]];
    updatePathWithValidation(updatedPath);
  };
  
  // Move a station down in the order
  const moveStationDown = (index: number): void => {
    if (index < 0 || index >= path.length - 1) return;
    
    const updatedPath = [...path];
    [updatedPath[index], updatedPath[index + 1]] = [updatedPath[index + 1], updatedPath[index]];
    updatePathWithValidation(updatedPath);
  };

  // Handle enter key press in input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addStation();
    }
  };

  // Clear validation error when user starts typing
  const handleStationNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setNewStation(value);
    
    // Clear validation error when user starts typing
    if (validationError && value.trim()) {
      setValidationError('');
    }
  };

  // Get trip path summary for display
  const getPathSummary = (): string => {
    if (path.length === 0) return 'No stations added';
    if (path.length === 1) return `1 station: ${path[0].name}`;
    return `${path.length} stations: ${path.map(p => p.name).join(' → ')}`;
  };

  return (
    <div>
      <h2 className="text-2xl font-medium mb-6">Trip Path</h2>
      
      <div className="mb-4">
        <p className="text-gray-600">
          Add stations to your trip path in the order you plan to visit them.
        </p>
        {validationError && (
          <p className="text-red-500 mt-2 font-medium">{validationError}</p>
        )}
        {path.length === 0 && !validationError && (
          <p className="text-red-500 mt-2">At least one station is required.</p>
        )}
        
        {/* Path Summary */}
        {path.length > 0 && (
          <div className="mt-2 p-3 bg-orange-50 rounded-md">
            <p className="text-sm text-orange-800">
              <strong>Current path:</strong> {getPathSummary()}
            </p>
          </div>
        )}
      </div>
      
      {/* Add New Station Form */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add New Station
        </label>
        <div className="flex gap-2">
          <div className="flex-1">
            <input 
              type="text"
              value={newStation}
              onChange={handleStationNameChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter station name (e.g., Amman Citadel, Dead Sea)"
              className={`w-full border ${validationError ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300`}
              disabled={isAddingStation}
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              {newStation.length}/100 characters
            </p>
          </div>
          <button
            onClick={addStation}
            disabled={!newStation.trim() || isAddingStation}
            className="bg-orange-400 text-white px-6 py-2 rounded-md hover:bg-orange-500 transition-colors disabled:bg-orange-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isAddingStation ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Adding...
              </>
            ) : (
              'Add Station'
            )}
          </button>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Path Visual Representation */}
        <div className="lg:w-1/2 order-2 lg:order-1">
          {path.length > 0 ? (
            <div className="p-4 bg-orange-50 rounded-lg h-full">
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Path Visualization
              </h3>
              <div className="relative">
                <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-orange-300"></div>
                <div className="space-y-6 relative">
                  {path.map((station, index) => (
                    <div key={index} className="flex items-center ml-10 relative">
                      <div className="absolute -left-12 w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center z-10 shadow-md">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1 py-3 px-4 bg-white border border-orange-200 rounded-md shadow-sm">
                        <div className="font-medium text-gray-800">{station.name}</div>
                        {station.position.lat && station.position.lng && (
                          <div className="text-xs text-gray-500 mt-1">
                            {station.position.lat.toFixed(4)}, {station.position.lng.toFixed(4)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* End marker */}
                  <div className="flex items-center ml-10 relative">
                    <div className="absolute -left-12 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center z-10 shadow-md">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="py-2 px-4 bg-green-50 border border-green-200 rounded-md">
                      <span className="text-green-700 font-medium">Trip Complete!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-orange-50 rounded-lg h-full flex flex-col items-center justify-center text-center">
              <svg className="w-16 h-16 text-orange-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-orange-600 font-medium mb-2">No Path Created Yet</p>
              <p className="text-orange-500 text-sm">Add stations to see the path visualization</p>
            </div>
          )}
        </div>
        
        {/* Path Station List */}
        <div className="lg:w-1/2 order-1 lg:order-2">
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Trip Stations ({path.length})
          </h3>
          
          {path.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {path.map((station, index) => (
                <div 
                  key={index} 
                  className="border border-gray-200 rounded-md p-3 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-gray-800 font-medium block truncate">{station.name}</span>
                      {station.position.lat && station.position.lng && (
                        <span className="text-xs text-gray-500">
                          {station.position.lat.toFixed(4)}, {station.position.lng.toFixed(4)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={() => moveStationUp(index)}
                      disabled={index === 0}
                      className={`p-1 rounded transition-colors ${
                        index === 0 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                      }`}
                      title="Move up"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => moveStationDown(index)}
                      disabled={index === path.length - 1}
                      className={`p-1 rounded transition-colors ${
                        index === path.length - 1 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                      }`}
                      title="Move down"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => removeStation(index)}
                      className="p-1 text-red-500 hover:bg-red-50 hover:text-red-700 rounded transition-colors"
                      title="Remove station"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 border border-dashed border-gray-300 rounded-md text-center text-gray-500 bg-gray-50">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <p className="font-medium mb-1">No stations added yet</p>
              <p className="text-sm">Add your first station using the form above</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 bg-blue-50 text-blue-800 rounded-md mt-6">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium mb-1">Path Planning Tips:</p>
            <ul className="text-sm space-y-1">
              <li>• Add stations in the order you plan to visit them</li>
              <li>• Use the up/down arrows to rearrange the order</li>
              <li>• Coordinates are automatically generated for each location</li>
              <li>• Station names should be descriptive and unique</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPath;