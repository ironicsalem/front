import React, { useState, useEffect, useRef } from 'react';
import { TripData, Location } from '../CreateTrip';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';

// Fix Leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Add Leaflet Control Geocoder plugin
// You need to add leaflet-control-geocoder library in your project:
// npm install leaflet-control-geocoder
import 'leaflet-control-geocoder';

interface TripPathProps {
  tripData: TripData;
  updateTripData: (data: Partial<TripData>) => void;
}

// Component for searching on map restricted to Jordan
const MapSearchControl: React.FC<{ setStartLocation: (loc: TripData['startLocation']) => void }> = ({ setStartLocation }) => {
  const map = useMap();

  useEffect(() => {
    const geocoder = (L.Control as any).Geocoder.nominatim({
      geocodingQueryParams: {
        countrycodes: 'jo', // Restrict search to Jordan (ISO 3166-1 alpha2 country code)
      },
    });

    const control = (L.Control as any).geocoder({
      collapsed: false,
      placeholder: 'Search location in Jordan...',
      defaultMarkGeocode: false,
      geocoder,
    })
      .on('markgeocode', function (e: any) {
        const bbox = e.geocode.bbox;
        const latlng = e.geocode.center;

        // Set map view to the selected place
        map.fitBounds(bbox);

        // Set startLocation to selected point
        setStartLocation({
          type: 'Point',
          coordinates: [latlng.lng, latlng.lat],
          description: e.geocode.name,
        });
      })
      .addTo(map);

    // Cleanup on unmount
    return () => {
      control.remove();
    };
  }, [map, setStartLocation]);

  return null;
};

// Component to handle map clicks for meeting point selection
const MeetingPointSelector: React.FC<{
  startLocation?: TripData['startLocation'];
  setStartLocation: (loc: TripData['startLocation']) => void;
}> = ({ startLocation, setStartLocation }) => {
  useMapEvents({
    click(e) {
      setStartLocation({
        type: 'Point',
        coordinates: [e.latlng.lng, e.latlng.lat],
        description: 'Starting point selected on map',
      });
    },
  });

  return startLocation ? (
    <Marker position={[startLocation.coordinates[1], startLocation.coordinates[0]]}>
      <Popup>{startLocation.description}</Popup>
    </Marker>
  ) : null;
};

const TripPath: React.FC<TripPathProps> = ({ tripData, updateTripData }) => {
  const [newStation, setNewStation] = useState<string>('');
  const path = tripData.path || [];

  const addStation = (): void => {
    if (!newStation.trim()) return;

    const newLocation: Location = {
      name: newStation.trim(),
      position: {
        lat: 32.2800 + Math.random() * 0.01,
        lng: 35.8900 + Math.random() * 0.01,
      },
    };

    updateTripData({
      path: [...path, newLocation],
    });

    setNewStation('');
  };

  const removeStation = (index: number): void => {
    const updatedPath = [...path];
    updatedPath.splice(index, 1);
    updateTripData({ path: updatedPath });
  };

  const moveStationUp = (index: number): void => {
    if (index === 0) return;
    const updatedPath = [...path];
    [updatedPath[index], updatedPath[index - 1]] = [
      updatedPath[index - 1],
      updatedPath[index],
    ];
    updateTripData({ path: updatedPath });
  };

  const moveStationDown = (index: number): void => {
    if (index === path.length - 1) return;
    const updatedPath = [...path];
    [updatedPath[index], updatedPath[index + 1]] = [
      updatedPath[index + 1],
      updatedPath[index],
    ];
    updateTripData({ path: updatedPath });
  };

  // Map center default (somewhere in Jordan)
  const mapCenter: [number, number] = tripData.startLocation
    ? [tripData.startLocation.coordinates[1], tripData.startLocation.coordinates[0]]
    : [31.9539, 35.9106]; // Amman center approx

  // Update startLocation handler
  const setStartLocation = (loc: TripData['startLocation']) => {
    updateTripData({ startLocation: loc });
  };

  return (
    <div>
      <h2 className="text-2xl font-medium mb-6">Meeting Point (Select on Map or Search)</h2>

      <div className="mb-6" style={{ height: 350 }}>
        <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapSearchControl setStartLocation={setStartLocation} />
          <MeetingPointSelector
            startLocation={tripData.startLocation}
            setStartLocation={setStartLocation}
          />
        </MapContainer>
      </div>

      {/* Existing Trip Path UI */}
      <h2 className="text-2xl font-medium mb-6">Trip Path</h2>

      <p className="text-gray-600 mb-4">
        Add stations to your trip path in the order you plan to visit them.
        {path.length === 0 && (
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
        {/* Path Visual Representation */}
        <div className="md:w-1/2 order-2 md:order-1">
          {path.length > 0 ? (
            <div className="p-4 bg-orange-50 rounded-lg h-full">
              <h3 className="text-lg font-medium mb-3">Path Visualization</h3>
              <div className="relative">
                <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-orange-300"></div>
                <div className="space-y-10 relative">
                  {path.map((station, index) => (
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
              <p className="text-orange-500 italic">
                Add stations to see the path visualization
              </p>
            </div>
          )}
        </div>

        {/* Path Station List */}
        <div className="md:w-1/2 order-1 md:order-2">
          {path.length > 0 ? (
            <div>
              <h3 className="text-lg font-medium mb-3">Your Trip Path</h3>
              <div className="space-y-2">
                {path.map((station, index) => (
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
                      <button
                        onClick={() => moveStationUp(index)}
                        disabled={index === 0}
                        className={`p-1 rounded ${
                          index === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-100'
                        }`}
                        title="Move up"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 15l7-7 7 7"
                          ></path>
                        </svg>
                      </button>

                      <button
                        onClick={() => moveStationDown(index)}
                        disabled={index === path.length - 1}
                        className={`p-1 rounded ${
                          index === path.length - 1
                            ? 'text-gray-300'
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                        title="Move down"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </button>

                      <button
                        onClick={() => removeStation(index)}
                        className="p-1 rounded text-red-500 hover:bg-red-100"
                        title="Remove"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="italic text-gray-500">
              No stations added yet. Add stations above to build your trip path.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripPath;
