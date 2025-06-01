import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Calendar,
  Filter,
  Search,
  ChevronRight,
  Tag
} from 'lucide-react';
import { CenteredSpinner } from '../shared/LoadingSpinner';
import type { Trip } from '../../../types/Types';

interface GuideTripsProps {
  trips: Trip[];
  loading: boolean;
  guideCity: string;
}

interface FilterState {
  search: string;
  type: string | 'all';
  priceRange: 'all' | 'low' | 'medium' | 'high';
  availability: 'all' | 'available' | 'unavailable';
}

const GuideTrips: React.FC<GuideTripsProps> = ({
  trips,
  loading,
  guideCity
}) => {
  const navigate = useNavigate();
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'all',
    priceRange: 'all',
    availability: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Trip types for filtering
  const tripTypes: (string | 'all')[] = [
    'all', 'Adventure', 'Cultural', 'Food', 'Historical', 'Nature', 'Relaxation', 'Group'
  ];

  // Filter trips based on current filters
  const filteredTrips = trips.filter(trip => {
    // Search filter
    if (filters.search && !trip.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !trip.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Type filter
    if (filters.type !== 'all' && trip.type !== filters.type) {
      return false;
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      const price = trip.price;
      switch (filters.priceRange) {
        case 'low':
          if (price > 50) return false;
          break;
        case 'medium':
          if (price <= 50 || price > 150) return false;
          break;
        case 'high':
          if (price <= 150) return false;
          break;
      }
    }

    // Availability filter
    if (filters.availability !== 'all') {
      const hasAvailable = trip.schedule.some(slot => slot.isAvailable);
      if (filters.availability === 'available' && !hasAvailable) return false;
      if (filters.availability === 'unavailable' && hasAvailable) return false;
    }

    return true;
  });

  // Get available slots count for a trip
  const getAvailableSlots = (trip: Trip): number => {
    return trip.schedule.filter(slot => slot.isAvailable).length;
  };

  // Get price range color
  const getPriceColor = (price: number): string => {
    if (price <= 50) return 'text-green-600 bg-green-100 border-green-200';
    if (price <= 150) return 'text-blue-600 bg-blue-100 border-blue-200';
    return 'text-purple-600 bg-purple-100 border-purple-200';
  };

  // Get trip type color
  const getTypeColor = (type: string): string => {
    const colors = {
      Adventure: 'bg-red-100 text-red-800 border-red-200',
      Cultural: 'bg-purple-100 text-purple-800 border-purple-200',
      Food: 'bg-orange-100 text-orange-800 border-orange-200',
      Historical: 'bg-amber-100 text-amber-800 border-amber-200',
      Nature: 'bg-green-100 text-green-800 border-green-200',
      Relaxation: 'bg-blue-100 text-blue-800 border-blue-200',
      Group: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    } as Record<string, string>;
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      priceRange: 'all',
      availability: 'all'
    });
  };

  // Check if any filters are active
  const hasActiveFilters = filters.search || filters.type !== 'all' || 
                          filters.priceRange !== 'all' || filters.availability !== 'all';

  return (
    <div className="space-y-6">
      {/* Header with Search and Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Available Trips</h3>
          <p className="text-sm text-gray-600 mt-1">
            {filteredTrips.length} of {trips.length} trips in {guideCity}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search trips..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 w-64"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
              hasActiveFilters 
                ? 'bg-amber-100 border-amber-300 text-amber-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                {[filters.type !== 'all', filters.priceRange !== 'all', filters.availability !== 'all'].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Trip Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trip Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
              >
                {tripTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value as FilterState['priceRange'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="all">All Prices</option>
                <option value="low">Under 50 JD</option>
                <option value="medium">50 - 150 JD</option>
                <option value="high">Over 150 JD</option>
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
              <select
                value={filters.availability}
                onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value as FilterState['availability'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="all">All Trips</option>
                <option value="available">Available Now</option>
                <option value="unavailable">Fully Booked</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-300">
              <button
                onClick={resetFilters}
                className="text-amber-600 hover:text-amber-700 text-sm font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Trip Results */}
      {loading ? (
        <CenteredSpinner text="Loading trips..." />
      ) : filteredTrips.length === 0 ? (
        <div className="text-center py-12">
          {trips.length === 0 ? (
            <>
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Trips Available</h4>
              <p className="text-gray-600">This guide hasn't created any trips yet.</p>
            </>
          ) : (
            <>
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Trips Found</h4>
              <p className="text-gray-600 mb-4">No trips match your current filters.</p>
              <button
                onClick={resetFilters}
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                Clear filters to see all trips
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredTrips.map((trip) => {
            const availableSlots = getAvailableSlots(trip);
            
            return (
              <div 
                key={trip._id} 
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-white to-amber-50 cursor-pointer group"
                onClick={() => navigate(`/trip/${trip._id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {/* Trip Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors">
                          {trip.title}
                        </h4>
                        <div className="flex items-center space-x-2 mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(trip.type)}`}>
                            <Tag className="w-3 h-3 inline mr-1" />
                            {trip.type}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            availableSlots > 0 ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
                          }`}>
                            {availableSlots > 0 ? `${availableSlots} slots available` : 'Fully booked'}
                          </span>
                        </div>
                      </div>
                      {trip.imageUrl && (
                        <img 
                          src={trip.imageUrl} 
                          alt={trip.title}
                          className="w-32 h-32 object-cover rounded-lg ml-4 group-hover:scale-105 transition-transform"
                        />
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-4 leading-relaxed line-clamp-2">
                      {trip.description}
                    </p>
                    
                    {/* Trip Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <DollarSign className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className={`font-semibold px-2 py-1 rounded border ${getPriceColor(trip.price)}`}>
                          {trip.price} JD
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="text-sm">
                          {trip.schedule.length} time slots
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <span className="text-sm">{trip.city}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        <span className="text-sm">
                          {trip.path.length} stops
                        </span>
                      </div>
                    </div>

                    {/* Next Available Date */}
                    {availableSlots > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center text-green-700">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium">
                            Next available: {trip.schedule.find(slot => slot.isAvailable) && 
                              new Date(trip.schedule.find(slot => slot.isAvailable)!.date).toLocaleDateString()
                            }
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Button */}
                <div className="flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/trip/${trip._id}`);
                    }}
                    className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-all duration-200 font-medium flex items-center space-x-2 group"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GuideTrips;