import React, { useState, useEffect } from 'react';
import { NavigateFunction } from 'react-router-dom';
import TripService from '../../../services/TripService';
import { Trip } from '../../../types/Types';
import { 
  Trash2, 
  MapPin, 
  DollarSign, 
  Calendar,
  Eye,
  AlertTriangle,
  RefreshCw,
  Search
} from 'lucide-react';

interface ManageTripsProps {
  navigate: NavigateFunction;
}

const ManageTrips: React.FC<ManageTripsProps> = ({ navigate }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Fetch trips from the backend
  const fetchTrips = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await TripService.getTrips(page);
      setTrips(response.trips);
      setHasNextPage(response.hasNextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };

  // Handle trip deletion
  const handleDeleteTrip = async (tripId: string, tripTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${tripTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingTripId(tripId);
      await TripService.deleteTrip(tripId);
      
      // Remove the deleted trip from the local state
      setTrips(prevTrips => prevTrips.filter(trip => trip._id !== tripId));
      
      // Show success message (you could replace this with a toast notification)
      alert('Trip deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete trip';
      alert(`Error: ${errorMessage}`);
    } finally {
      setDeletingTripId(null);
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchTrips(1);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await TripService.searchTrips(searchQuery, 1);
      setTrips(response.trips);
      setHasNextPage(response.hasNextPage);
      setCurrentPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search trips');
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination
  const handleNextPage = () => {
    if (hasNextPage) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      if (searchQuery.trim()) {
        TripService.searchTrips(searchQuery, nextPage).then(response => {
          setTrips(response.trips);
          setHasNextPage(response.hasNextPage);
        });
      } else {
        fetchTrips(nextPage);
      }
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      if (searchQuery.trim()) {
        TripService.searchTrips(searchQuery, prevPage).then(response => {
          setTrips(response.trips);
          setHasNextPage(response.hasNextPage);
        });
      } else {
        fetchTrips(prevPage);
      }
    }
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get available schedule count
  const getAvailableScheduleCount = (trip: Trip): number => {
    return trip.schedule.filter(slot => slot.isAvailable).length;
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  if (loading && trips.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-red-500 mr-2" />
        <span className="text-gray-600">Loading trips...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Manage Trips</h2>
          <p className="text-gray-600 mt-1">View and manage all trips in the system</p>
        </div>
        <button
          onClick={() => fetchTrips(currentPage)}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by title, city, or description..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Search
        </button>
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              fetchTrips(1);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-red-800 font-medium">Error Loading Trips</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <button
              onClick={() => fetchTrips(currentPage)}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Trips List */}
      <div className="space-y-4">
        {trips.length === 0 && !loading ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No trips found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search criteria.' : 'There are no trips in the system yet.'}
            </p>
          </div>
        ) : (
          trips.map((trip) => (
            <div
              key={trip._id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Trip Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {trip.title}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {trip.city}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          ${trip.price.toFixed(2)}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {trip.type}
                        </span>
                      </div>
                    </div>
                    {trip.imageUrl && (
                      <img
                        src={trip.imageUrl}
                        alt={trip.title}
                        className="w-16 h-16 object-cover rounded-lg ml-4 flex-shrink-0"
                      />
                    )}
                  </div>

                  {/* Trip Description */}
                  <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                    {trip.description}
                  </p>

                  {/* Trip Details */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {getAvailableScheduleCount(trip)} available slots
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        trip.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {trip.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                      <span className="text-gray-500">
                        Created {formatDate(trip.createdAt)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/trip/${trip._id}`)}
                        className="flex items-center space-x-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">View</span>
                      </button>
                      <button
                        onClick={() => handleDeleteTrip(trip._id, trip.title)}
                        disabled={deletingTripId === trip._id}
                        className="flex items-center space-x-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingTripId === trip._id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        <span className="text-sm">
                          {deletingTripId === trip._id ? 'Deleting...' : 'Delete'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {(currentPage > 1 || hasNextPage) && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || loading}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span>← Previous</span>
          </button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage}
          </span>
          
          <button
            onClick={handleNextPage}
            disabled={!hasNextPage || loading}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span>Next →</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageTrips;