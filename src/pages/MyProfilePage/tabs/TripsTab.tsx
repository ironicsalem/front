import React, { useState, useEffect, useCallback } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { BaseUser as User, Trip } from '../../../types/Types';
import GuideService from '../../../services/GuideService';
import { 
  Plus,
  MapPin,
  DollarSign,
  Users,
  Edit3,
  Save,
  X,
  Trash2,
  Star,
  Eye,
  TrendingUp,
  Package
} from 'lucide-react';

interface TripsTabProps {
  user: User;
  navigate: NavigateFunction;
}

const TripsTab: React.FC<TripsTabProps> = ({ user, navigate }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [editingTrip, setEditingTrip] = useState<string | null>(null);
  const [tripEditData, setTripEditData] = useState<{ [key: string]: string }>({});

  const loadTrips = useCallback(async () => {
    setLoadingTrips(true);
    try {
      const userTrips = await GuideService.getTripsForGuide(user._id);
      setTrips(userTrips);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoadingTrips(false);
    }
  }, [user._id]);

  useEffect(() => {
    if (user._id) {
      loadTrips();
    }
  }, [user._id, loadTrips]);

  const handleEditTripCity = (tripId: string, currentCity: string) => {
    setEditingTrip(tripId);
    setTripEditData({ [tripId]: currentCity });
  };

  const handleSaveTripCity = async (tripId: string) => {
    try {
      // This would need to be implemented in GuideService
      // await GuideService.updateTripCity(tripId, tripEditData[tripId]);
      console.log('Updating trip city:', tripId, tripEditData[tripId]);
      setEditingTrip(null);
      // Refresh trips
      loadTrips();
    } catch (error) {
      console.error('Error updating trip city:', error);
      alert('Failed to update trip city');
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      try {
        // This would need to be implemented in GuideService
        // await GuideService.deleteTrip(tripId);
        console.log('Deleting trip:', tripId);
        setTrips(prev => prev.filter(trip => trip._id !== tripId));
      } catch (error) {
        console.error('Error deleting trip:', error);
        alert('Failed to delete trip');
      }
    }
  };

  const getTotalRevenue = () => {
    return trips.reduce((total, trip) => total + (trip.price || 0), 0);
  };

  const getAveragePrice = () => {
    if (trips.length === 0) return 0;
    return Math.round(getTotalRevenue() / trips.length);
  };

  const getTotalLocations = () => {
    return trips.reduce((total, trip) => total + (trip.path?.length || 0), 0);
  };

  const getStatusColor = (trip: Trip) => {
    // This would be based on actual trip status in real implementation
    const now = new Date();
    const created = new Date(trip.createdAt);
    const daysSinceCreated = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceCreated < 7) return 'bg-green-100 text-green-800 border-green-200';
    if (daysSinceCreated < 30) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (trip: Trip) => {
    const now = new Date();
    const created = new Date(trip.createdAt);
    const daysSinceCreated = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceCreated < 7) return 'New';
    if (daysSinceCreated < 30) return 'Active';
    return 'Established';
  };

  if (loadingTrips) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Trips</h2>
          <p className="text-gray-600 mt-1">Manage your tour offerings and track their performance</p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-4">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 rounded-xl border border-amber-200">
            <div className="text-center">
              <div className="text-xl font-bold text-amber-600">{trips.length}</div>
              <div className="text-xs text-amber-700">Active Trips</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 rounded-xl border border-green-200">
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">${getAveragePrice()}</div>
              <div className="text-xs text-green-700">Avg Price</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-3 rounded-xl border border-blue-200">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{getTotalLocations()}</div>
              <div className="text-xs text-blue-700">Total Locations</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Trip CTA */}
      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl p-6 border border-amber-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Create New Experience</h3>
              <p className="text-sm text-gray-600">Share your local knowledge and create memorable tours</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/addtrip')}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Trip</span>
          </button>
        </div>
      </div>

      {/* Trips List */}
      {trips.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
          <div className="text-gray-400 mb-6">
            <Package className="w-20 h-20 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No trips yet</h3>
          <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
            Start creating amazing travel experiences for your customers and build your guide business!
          </p>
          <div className="flex items-center justify-center space-x-2 text-amber-600 mb-6">
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">Create your first trip to get started</span>
          </div>
          <button
            onClick={() => navigate('/addtrip')}
            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Create Your First Trip
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Your Trips ({trips.length})</h3>
            <div className="text-sm text-gray-500">
              Sorted by most recent
            </div>
          </div>
          
          <div className="grid gap-6">
            {trips.map((trip) => (
              <div key={trip._id} className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:border-amber-200">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                            {trip.title}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(trip)}`}>
                            {getStatusText(trip)}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-4 leading-relaxed">{trip.description}</p>
                      </div>
                    </div>
                    
                    {/* Trip Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-100">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-bold text-green-700">${trip.price}</div>
                          <div className="text-xs text-green-600">Price</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <div className="flex items-center space-x-2">
                          {editingTrip === trip._id ? (
                            <input
                              type="text"
                              value={tripEditData[trip._id] || trip.city}
                              onChange={(e) => setTripEditData(prev => ({
                                ...prev,
                                [trip._id]: e.target.value
                              }))}
                              className="w-20 px-2 py-1 border border-blue-300 rounded text-sm font-bold bg-white"
                            />
                          ) : (
                            <div className="font-bold text-blue-700">{trip.city}</div>
                          )}
                          <div className="text-xs text-blue-600">City</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <Users className="w-5 h-5 text-purple-600" />
                        <div>
                          <div className="font-bold text-purple-700">{trip.path?.length || 0}</div>
                          <div className="text-xs text-purple-600">Locations</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <Package className="w-5 h-5 text-amber-600" />
                        <div>
                          <div className="font-bold text-amber-700">{trip.type}</div>
                          <div className="text-xs text-amber-600">Type</div>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="flex flex-wrap items-center gap-6 text-sm bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <div className="flex items-center space-x-2 text-amber-600">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-semibold">4.8</span>
                        <span className="text-gray-500">rating</span>
                      </div>
                      <div className="flex items-center space-x-2 text-blue-600">
                        <Eye className="w-4 h-4" />
                        <span className="font-semibold">247</span>
                        <span className="text-gray-500">views</span>
                      </div>
                      <div className="flex items-center space-x-2 text-green-600">
                        <Users className="w-4 h-4" />
                        <span className="font-semibold">12</span>
                        <span className="text-gray-500">bookings</span>
                      </div>
                      <div className="text-gray-400 ml-auto">
                        Revenue: <span className="font-semibold text-gray-700">${(trip.price * 8).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 lg:flex-col lg:space-x-0 lg:space-y-2">
                    {editingTrip === trip._id ? (
                      <>
                        <button
                          onClick={() => handleSaveTripCity(trip._id)}
                          className="flex items-center justify-center w-10 h-10 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200"
                          title="Save changes"
                        >
                          <Save className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setEditingTrip(null)}
                          className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
                          title="Cancel editing"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditTripCity(trip._id, trip.city)}
                          className="flex items-center justify-center w-10 h-10 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Edit city"
                        >
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => navigate(`/trip/${trip._id}`)}
                          className="flex items-center justify-center w-10 h-10 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all duration-200"
                          title="View trip details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteTrip(trip._id)}
                          className="flex items-center justify-center w-10 h-10 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                          title="Delete trip"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TripsTab;