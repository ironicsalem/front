import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Search, Filter, X, Clock } from 'lucide-react';
import TripService, { TripsResponse } from '../services/TripService';
import { Trip, TripType } from '../types/Types';

// Filter Options
type FilterOptions = {
  city: string;
  type: string;
  minPrice: number;
  maxPrice: number;
  sortBy: 'price' | 'newest' | 'oldest';
};

const INITIAL_FILTERS: FilterOptions = {
  city: '',
  type: '',
  minPrice: 0,
  maxPrice: 1000,
  sortBy: 'newest'
};

// Trip Types for filtering - using the TripType from Types.ts
const TRIP_TYPES: TripType[] = ['Adventure', 'Cultural', 'Food', 'Historical', 'Nature', 'Relaxation', 'Group'];

// Popular Cities
const POPULAR_CITIES = [
  'Amman', 'Petra', 'Aqaba', 'Jerash', 'Madaba', 'Salt',
  'Irbid', 'Zarqa', 'Karak', "Ma'an", 'Tafilah', 'Ajloun'
];

const Trips: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>(INITIAL_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const navigate = useNavigate();

  // Fetch trips using the new service
  const fetchTrips = useCallback(async (currentPage: number, append: boolean = false) => {
    try {
      if (currentPage === 1) setLoading(true);
      else setLoadingMore(true);

      const response: TripsResponse = await TripService.getTrips(currentPage);
      
      if (append) {
        setTrips(prev => [...prev, ...response.trips]);
      } else {
        setTrips(response.trips);
      }
      
      setHasNextPage(response.hasNextPage);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch trips:', err);
      setError(err instanceof Error ? err.message : 'Failed to load trips');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Search trips using the new service
  const searchTrips = useCallback(async (query: string) => {
    if (!query.trim()) {
      fetchTrips(1);
      return;
    }

    try {
      setLoading(true);
      const response: TripsResponse = await TripService.searchTrips(query);
      setTrips(response.trips);
      setHasNextPage(response.hasNextPage);
      setError(null);
    } catch (err) {
      console.error('Failed to search trips:', err);
      setError(err instanceof Error ? err.message : 'Failed to search trips');
    } finally {
      setLoading(false);
    }
  }, [fetchTrips]);

  // Apply local filters to trips
  const getFilteredTrips = () => {
    let result = [...trips];

    // Apply city filter
    if (filters.city) {
      result = result.filter(trip => 
        trip.city.toLowerCase() === filters.city.toLowerCase()
      );
    }

    // Apply type filter
    if (filters.type) {
      result = result.filter(trip => 
        trip.type.toLowerCase() === filters.type.toLowerCase()
      );
    }

    // Apply price range filter
    result = result.filter(trip => 
      trip.price >= filters.minPrice && trip.price <= filters.maxPrice
    );

    // Apply sorting
    switch (filters.sortBy) {
      case 'price':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
    }

    return result;
  };

  const filteredTrips = getFilteredTrips();
  const isFilterApplied = filters.city !== '' || filters.type !== '' || 
    filters.minPrice !== INITIAL_FILTERS.minPrice || 
    filters.maxPrice !== INITIAL_FILTERS.maxPrice || 
    searchQuery !== '';

  // Initial load
  useEffect(() => {
    fetchTrips(1);
  }, [fetchTrips]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== '') {
        searchTrips(searchQuery);
      } else {
        fetchTrips(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, searchTrips, fetchTrips]);

  // Load more trips
  const loadMoreTrips = () => {
    if (hasNextPage && !loadingMore && !searchQuery) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTrips(nextPage, true);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSearchQuery('');
    setShowFilters(false);
  };

  // Handle trip click
  const handleTripClick = (trip: Trip) => {
    navigate(`/trip/${trip._id}`);
  };

  // Format date
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get next available date - Updated to match TripSchedule interface
  const getNextAvailableDate = (schedules: Trip['schedule']) => {
    const availableSchedules = schedules?.filter(s => s.isAvailable) || [];
    if (availableSchedules.length === 0) return 'No dates available';
    
    const sortedDates = [...availableSchedules].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const nextDate = sortedDates[0];
    return `${formatDate(nextDate.date)} at ${nextDate.time}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simplified Hero Section */}
      <div className="bg-amber-500 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Discover Amazing Trips
            </h1>
            <p className="text-amber-50 text-lg max-w-2xl mx-auto">
              Explore unique experiences with local guides
            </p>
          </div>
          
          {/* Simplified Search */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white" />
              <input
                type="text"
                placeholder="Search trips, cities, or experiences..."
                className="w-full pl-12 pr-20 py-4 rounded-xl border-0 shadow-lg text-gray-800 placeholder-white focus:outline-none focus:ring-4 focus:ring-amber-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 rounded-lg transition-colors ${
                  showFilters ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Simplified Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b shadow-sm"
          >
            <div className="max-w-6xl mx-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* City Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <select
                    value={filters.city}
                    onChange={(e) => setFilters({...filters, city: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">All Cities</option>
                    {POPULAR_CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                
                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">All Types</option>
                    {TRIP_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                  <input
                    type="number"
                    min="0"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({...filters, minPrice: parseInt(e.target.value) || 0})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                  <input
                    type="number"
                    min={filters.minPrice}
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({...filters, maxPrice: parseInt(e.target.value) || 1000})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="1000"
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({...filters, sortBy: e.target.value as 'price' | 'newest' | 'oldest'})}
                    className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="price">Price (Low to High)</option>
                  </select>
                </div>
                
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-amber-600 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isFilterApplied 
                ? `${filteredTrips.length} trips found`
                : 'All Trips'
              }
            </h2>
            {isFilterApplied && (
              <button
                onClick={resetFilters}
                className="text-amber-600 text-sm font-medium hover:text-amber-700 mt-1"
              >
                Clear filters ×
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && trips.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-solid border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading trips...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredTrips.length === 0 && (
          <div className="text-center py-12">
            <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No trips found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Trips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredTrips.map((trip, index) => (
              <motion.div
                key={trip._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
                onClick={() => handleTripClick(trip)}
              >
                {/* Trip Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={trip.imageUrl || '/trip-placeholder.jpg'}
                    alt={trip.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  
                  {/* Price Badge */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="font-bold text-amber-600">${trip.price}</span>
                  </div>
                  
                  {/* Type Badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2 py-1 bg-amber-500/90 backdrop-blur-sm text-white text-xs rounded-full">
                      {trip.type}
                    </span>
                  </div>
                </div>
                
                {/* Trip Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{trip.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{trip.description}</p>
                  
                  {/* Trip Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <MapPin className="h-4 w-4" />
                      <span>{trip.city}</span>
                    </div>
                    
                    {trip.schedule?.length > 0 && (
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>{getNextAvailableDate(trip.schedule)}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{trip.path?.length || 0} stops</span>
                    </div>
                  </div>
                  
                  {/* CTA Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTripClick(trip);
                    }}
                    className="w-full py-2.5 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Load More Button */}
        {hasNextPage && !searchQuery && filteredTrips.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={loadMoreTrips}
              disabled={loadingMore}
              className="px-8 py-3 bg-white border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors disabled:opacity-50"
            >
              {loadingMore ? 'Loading...' : 'Load More Trips'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trips;