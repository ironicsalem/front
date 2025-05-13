// TripPath.tsx
import React, { useState } from 'react';
import { TripData, Location } from '../CreateTrip';

interface TripPathProps {
  tripData: TripData;
  updateTripData: (data: Partial<TripData>) => void;
}

const TripPath: React.FC<TripPathProps> = ({ tripData, updateTripData }) => {
  const [newStation, setNewStation] = useState<string>('');
  
  // Add a new station to the path
  const addStation = (): void => {
    if (!newStation.trim()) {
      return; // Don't add empty stations
    }
    
    // Create a new location object
    // Note: Since we're using custom input, we'll use placeholder coordinates
    // In a real app, you'd use geocoding to get actual coordinates
    const newLocation: Location = {
      name: newStation.trim(),
      position: { 
        lat: 32.2800 + Math.random() * 0.01, // Random placeholder coordinates 
        lng: 35.8900 + Math.random() * 0.01  // for visualization purposes
      }
    };
    
    // Add to trip data
    updateTripData({
      path: [...tripData.path, newLocation]
    });
    
    // Clear input
    setNewStation('');
  };
  
  // Remove a station from the path
  const removeStation = (index: number): void => {
    const updatedPath = [...tripData.path];
    updatedPath.splice(index, 1);
    updateTripData({ path: updatedPath });
  };
  
  // Move a station up in the order
  const moveStationUp = (index: number): void => {
    if (index === 0) return;
    
    const updatedPath = [...tripData.path];
    const temp = updatedPath[index];
    updatedPath[index] = updatedPath[index - 1];
    updatedPath[index - 1] = temp;
    
    updateTripData({ path: updatedPath });
  };
  
  // Move a station down in the order
  const moveStationDown = (index: number): void => {
    if (index === tripData.path.length - 1) return;
    
    const updatedPath = [...tripData.path];
    const temp = updatedPath[index];
    updatedPath[index] = updatedPath[index + 1];
    updatedPath[index + 1] = temp;
    
    updateTripData({ path: updatedPath });
  };

  return (
    <div>
      <h2 className="text-2xl font-medium mb-6">Trip Path</h2>
      
      <p className="text-gray-600 mb-4">
        Add stations to your trip path in the order you plan to visit them.
        {tripData.path.length === 0 && (
          <span className="text-red-500 ml-1">At least one station is required.</span>
        )}
      </p>
      
      {/* Add New Station Form */}
      <div className="flex mb-6">
        <input 
          type="text"
          value={newStation}
          onChange={(e) => setNewStation(e.target.value)}
          placeholder="Enter station name"
          className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addStation();
            }
          }}
        />
        <button
          onClick={addStation}
          className="bg-orange-400 text-white px-4 py-2 rounded-r-md hover:bg-orange-500 transition"
        >
          Add
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Path Visual Representation - Always shown */}
        <div className="md:w-1/2 order-2 md:order-1">
          {tripData.path.length > 0 ? (
            <div className="p-4 bg-orange-50 rounded-lg h-full">
              <h3 className="text-lg font-medium mb-3">Path Visualization</h3>
              <div className="relative">
                {/* Lines connecting stations */}
                <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-orange-300"></div>
                
                {/* Station markers */}
                <div className="space-y-10 relative">
                  {tripData.path.map((station, index) => (
                    <div key={index} className="flex items-center ml-10 relative">
                      <div className="absolute -left-12 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center z-10">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <div className="h-12 py-3 px-4 bg-white border border-orange-200 rounded-md shadow-sm">
                        {station.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-orange-50 rounded-lg h-full flex items-center justify-center">
              <p className="text-orange-500 italic">Add stations to see the path visualization</p>
            </div>
          )}
        </div>
        
        {/* Path Station List */}
        <div className="md:w-1/2 order-1 md:order-2">
          {tripData.path.length > 0 ? (
            <div>
              <h3 className="text-lg font-medium mb-3">Your Trip Path</h3>
              <div className="space-y-2">
                {tripData.path.map((station, index) => (
                  <div 
                    key={index} 
                    className="border border-gray-200 rounded-md p-3 flex items-center justify-between bg-white"
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <span>{station.name}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      {/* Move Up Button */}
                      <button
                        onClick={() => moveStationUp(index)}
                        disabled={index === 0}
                        className={`p-1 rounded ${index === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                        title="Move up"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                        </svg>
                      </button>
                      
                      {/* Move Down Button */}
                      <button
                        onClick={() => moveStationDown(index)}
                        disabled={index === tripData.path.length - 1}
                        className={`p-1 rounded ${index === tripData.path.length - 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'}`}
                        title="Move down"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </button>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => removeStation(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                        title="Remove"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 border border-dashed border-gray-300 rounded-md text-center text-gray-500">
              No stations added yet. Add your first station above.
            </div>
          )}
        </div>
      </div>
      
      {/* Additional Information */}
      <div className="p-4 bg-blue-50 text-blue-800 rounded-md mt-6">
        <p>
          <strong>Tip:</strong> Add stations in the order you plan to visit them. You can rearrange them using the up and down arrows.
        </p>
      </div>
    </div>
  );
};

export default TripPath;