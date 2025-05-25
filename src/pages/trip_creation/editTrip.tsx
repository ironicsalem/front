import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  X,
  Save,
  Trash2,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  User,
  Navigation,
  Type
} from 'lucide-react';

const API_URL = 'http://localhost:5000';

interface Location {
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface ScheduleItem {
  date: string;
  time: string;
  isAvailable: boolean;
}

interface Trip {
  _id: string;
  title: string;
  guide: {
    _id: string;
    name: string;
  };
  city: string;
  path: Location[];
  schedule: ScheduleItem[];
  imageUrl: string;
  price: number;
  description: string;
  type: string;
}

const EditTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newLocation, setNewLocation] = useState<Omit<Location, 'coordinates'>>({ name: '' });
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [newSchedule, setNewSchedule] = useState<Omit<ScheduleItem, 'isAvailable'>>({ 
    date: '', 
    time: '' 
  });
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await axios.get(`${API_URL}/trip/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        setTrip(response.data.trip);
        setImagePreview(response.data.imageUrl);
      } catch (err) {
        setError('Failed to fetch trip details');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTrip(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTrip(prev => prev ? { ...prev, [name]: Number(value) } : null);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewLocation(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewSchedule(prev => ({ ...prev, [name]: value }));
  };

  const handleAddLocation = () => {
    if (newLocation.name.trim() && trip) {
      const locationWithCoordinates = {
        ...newLocation,
        coordinates: { lat: 0, lng: 0 } // You would typically get these from a map API
      };
      setTrip({
        ...trip,
        path: [...trip.path, locationWithCoordinates]
      });
      setNewLocation({ name: '' });
      setShowLocationForm(false);
    }
  };

  const handleAddSchedule = () => {
    if (newSchedule.date && newSchedule.time && trip) {
      const scheduleItem = {
        ...newSchedule,
        isAvailable: true
      };
      setTrip({
        ...trip,
        schedule: [...trip.schedule, scheduleItem]
      });
      setNewSchedule({ date: '', time: '' });
      setShowScheduleForm(false);
    }
  };

  const handleRemoveLocation = (index: number) => {
    if (trip) {
      setTrip({
        ...trip,
        path: trip.path.filter((_, i) => i !== index)
      });
    }
  };

  const handleRemoveSchedule = (index: number) => {
    if (trip) {
      setTrip({
        ...trip,
        schedule: trip.schedule.filter((_, i) => i !== index)
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip) return;

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('title', trip.title);
      formData.append('city', trip.city);
      formData.append('price', trip.price.toString());
      formData.append('description', trip.description);
      formData.append('type', trip.type);
      formData.append('path', JSON.stringify(trip.path));
      formData.append('schedule', JSON.stringify(trip.schedule));
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await axios.put(`${API_URL}/trip/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(trip);
      navigate('/account');
    } catch (err) {
      setError('Failed to update trip');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        setIsLoading(true);
        await axios.delete(`${API_URL}/trip/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        navigate('/guide/trips');
      } catch (err) {
        setError('Failed to delete trip');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading && !trip) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!trip) {
    return <div className="text-center py-12 text-red-500">{error || 'Trip not found'}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Trip</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Trip Image</label>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={imagePreview || '/group.jpg'}
                alt="Trip preview"
                className="w-32 h-32 object-cover rounded-lg"
              />
              <label className="absolute bottom-0 right-0 bg-amber-600 text-white p-1 rounded-full cursor-pointer">
                <ImageIcon className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <div className="text-sm text-gray-500">
              Click on the camera icon to change the image
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Trip Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={trip.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={trip.city}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Price ($)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="price"
                name="price"
                min="0"
                value={trip.price}
                onChange={handleNumberInputChange}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
          </div>

      
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={trip.description}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
            required
          />
        </div>

        {/* Locations */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Locations</label>
            <button
              type="button"
              onClick={() => setShowLocationForm(!showLocationForm)}
              className="text-amber-600 hover:text-amber-800 text-sm font-medium"
            >
              {showLocationForm ? (
                <span className="flex items-center">
                  <ChevronUp className="w-4 h-4 mr-1" /> Hide
                </span>
              ) : (
                <span className="flex items-center">
                  <ChevronDown className="w-4 h-4 mr-1" /> Add Location
                </span>
              )}
            </button>
          </div>

          {showLocationForm && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="locationName" className="block text-sm font-medium text-gray-700 mb-1">
                    Location Name
                  </label>
                  <input
                    type="text"
                    id="locationName"
                    name="name"
                    value={newLocation.name}
                    onChange={handleLocationChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Enter location name"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddLocation}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  Add Location
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {trip.path?.map((location, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-amber-500 mr-2" />
                  <span>{location.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveLocation(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Schedule</label>
            <button
              type="button"
              onClick={() => setShowScheduleForm(!showScheduleForm)}
              className="text-amber-600 hover:text-amber-800 text-sm font-medium"
            >
              {showScheduleForm ? (
                <span className="flex items-center">
                  <ChevronUp className="w-4 h-4 mr-1" /> Hide
                </span>
              ) : (
                <span className="flex items-center">
                  <ChevronDown className="w-4 h-4 mr-1" /> Add Schedule
                </span>
              )}
            </button>
          </div>

          {showScheduleForm && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="scheduleDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    id="scheduleDate"
                    name="date"
                    value={newSchedule.date}
                    onChange={handleScheduleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label htmlFor="scheduleTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    id="scheduleTime"
                    name="time"
                    value={newSchedule.time}
                    onChange={handleScheduleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddSchedule}
                    className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                  >
                    Add Schedule
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {trip.schedule?.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span>
                    {new Date(item.date).toLocaleDateString()} at {item.time}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.isAvailable ? 'Available' : 'Booked'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSchedule(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Delete Trip
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTrip;