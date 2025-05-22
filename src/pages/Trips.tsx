import React, { useState, useEffect, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Search, Filter, X, ChevronDown, MapIcon, ListIcon } from 'lucide-react';

// API URL - directly use localhost for development
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000'
  : 'https://your-production-api.com'; // Replace with your production API URL

// Trip Interface based on your backend model
interface Location {
  name: string;
  position: {
    lat: number;
    lng: number;
  };
}

interface Schedule {
  date: Date;
  time: string;
  isAvailable: boolean;
}

interface Trip {
  _id: string;
  title: string;
  guide: string;
  city: string;
  path: Location[];
  schedule: Schedule[];
  imageUrl?: string;
  price: number;
  description: string;
  type: string;
  createdAt: string;
}

// Filter Options
type FilterOptions = {
  city: string;
  type: string;
  minPrice: number;
  maxPrice: number;
  dateRange: 'all' | 'today' | 'this-week' | 'this-month' | 'next-month';
  sortBy: 'price' | 'newest' | 'oldest';
};

const INITIAL_FILTERS: FilterOptions = {
  city: '',
  type: '',
  minPrice: 0,
  maxPrice: 1000,
  dateRange: 'all',
  sortBy: 'newest'
};

// Trip Types for filtering
const TRIP_TYPES = ['Adventure', 'Cultural', 'Food', 'Historical', 'Nature', 'Relaxation'];

// Popular Cities
const POPULAR_CITIES = [
  'Amman',
  'Petra',
  'Aqaba',
  'Jerash',
  'Madaba',
  'Salt',
  'Irbid',
  'Zarqa',
  'Karak',
  "Ma'an",
  'Tafilah',
  'Ajloun'
];

const Trips: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>(INITIAL_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  
  const headerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch trips data from API
  const fetchTrips = async (currentPage: number) => {
    setLoading(true);
    try {
      // Using the endpoint from your backend that gets all trips
      // Based on your tripRoutes.js, the endpoint should be /trip/ or /trip/all
      const response = await axios.get(`${API_URL}/trip`);
      console.log('API Response:', response.data); // Debug: Check what's coming back
      
      // Check if response has the expected structure
      const tripsData = response.data.trips || response.data || [];
      
      if (currentPage === 1) {
        setTrips(tripsData);
        setFilteredTrips(tripsData);
      } else {
        setTrips(prev => [...prev, ...tripsData]);
        setFilteredTrips(prev => [...prev, ...tripsData]);
      }
      
      // If pagination info is provided in the response
      setHasNextPage(response.data.hasNextPage || false);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch trips', error);
      
      // Handle Axios errors with proper typing
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.response) {
          // The request was made and the server responded with a status code
          console.error('Error response:', axiosError.response.data);
          console.error('Error status:', axiosError.response.status);
          
          const responseData = axiosError.response.data as Record<string, unknown>;
          const errorMessage = typeof responseData.message === 'string' 
            ? responseData.message 
            : 'Failed to load trips';
            
          setError(`Error ${axiosError.response.status}: ${errorMessage}`);
        } else if (axiosError.request) {
          // The request was made but no response was received
          console.error('Error request:', axiosError.request);
          setError('No response from server. Check your API connection.');
        } else {
          // Something happened in setting up the request
          setError(`Error: ${axiosError.message || 'An unknown error occurred'}`);
        }
      } else {
        // Handle non-Axios errors
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and search
  useEffect(() => {
    // If there are no trips yet, don't try to filter
    if (trips.length === 0) return;

    let result = [...trips];

    // Apply search query
    if (searchQuery) {
      result = result.filter(trip => 
        trip.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        trip.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply city filter
    if (filters.city) {
      result = result.filter(trip => trip.city.toLowerCase() === filters.city.toLowerCase());
    }

    // Apply trip type filter
    if (filters.type) {
      result = result.filter(trip => trip.type.toLowerCase() === filters.type.toLowerCase());
    }

    // Apply price range filter
    result = result.filter(trip => 
      trip.price >= filters.minPrice && trip.price <= filters.maxPrice
    );

    // Apply date range filter
    if (filters.dateRange !== 'all' && result.length > 0) {
      const today = new Date();
      const currentDay = today.getDate();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      // Start of today
      const startOfToday = new Date(currentYear, currentMonth, currentDay);
      
      // End of today
      const endOfToday = new Date(currentYear, currentMonth, currentDay, 23, 59, 59);
      
      // Start of this week (Sunday)
      const startOfThisWeek = new Date(today);
      startOfThisWeek.setDate(currentDay - today.getDay());
      startOfThisWeek.setHours(0, 0, 0, 0);
      
      // End of this week (Saturday)
      const endOfThisWeek = new Date(startOfThisWeek);
      endOfThisWeek.setDate(startOfThisWeek.getDate() + 6);
      endOfThisWeek.setHours(23, 59, 59, 999);
      
      // Start of this month
      const startOfThisMonth = new Date(currentYear, currentMonth, 1);
      
      // End of this month
      const endOfThisMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
      
      // Start of next month
      const startOfNextMonth = new Date(currentYear, currentMonth + 1, 1);
      
      // End of next month
      const endOfNextMonth = new Date(currentYear, currentMonth + 2, 0, 23, 59, 59);
      
      result = result.filter(trip => {
        // Find the first available schedule
        const availableSchedules = trip.schedule.filter(s => s.isAvailable);
        if (availableSchedules.length === 0) return false;
        
        // Sort schedules by date
        const sortedSchedules = [...availableSchedules].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        const nextScheduleDate = new Date(sortedSchedules[0].date);
        
        switch (filters.dateRange) {
          case 'today':
            return nextScheduleDate >= startOfToday && nextScheduleDate <= endOfToday;
          case 'this-week':
            return nextScheduleDate >= startOfThisWeek && nextScheduleDate <= endOfThisWeek;
          case 'this-month':
            return nextScheduleDate >= startOfThisMonth && nextScheduleDate <= endOfThisMonth;
          case 'next-month':
            return nextScheduleDate >= startOfNextMonth && nextScheduleDate <= endOfNextMonth;
          default:
            return true;
        }
      });
    }

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
      default:
        break;
    }

    setFilteredTrips(result);
    
    // Check if any filter is applied
    setIsFilterApplied(
      filters.city !== '' || 
      filters.type !== '' ||
      filters.minPrice !== INITIAL_FILTERS.minPrice || 
      filters.maxPrice !== INITIAL_FILTERS.maxPrice || 
      filters.dateRange !== 'all' ||
      searchQuery !== ''
    );
  }, [trips, searchQuery, filters]);

  // Initial data load
  useEffect(() => {
    // Get the trips on component mount
    fetchTrips(1);
    
    // For testing only: Add some dummy data if the API fails
    // This will prevent the "No trips found" message during development
    // and let you see how the UI components will look with data
    const fallbackToTestData = () => {
      // Only use dummy data if the API failed and we're in development
      setTimeout(() => {
        if (trips.length === 0 && error) {
          console.log('Using test data for development');
          const testTrips: Trip[] = [
            {
              _id: '1',
              title: 'Historical Tour of Istanbul',
              guide: 'guide1',
              city: 'Istanbul',
              path: [
                { name: 'Hagia Sophia', position: { lat: 41.008587, lng: 28.980175 } },
                { name: 'Blue Mosque', position: { lat: 41.005270, lng: 28.976960 } }
              ],
              schedule: [
                { date: new Date('2025-06-15'), time: '09:00', isAvailable: true },
                { date: new Date('2025-06-20'), time: '10:00', isAvailable: true }
              ],
              imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200',
              price: 120,
              description: 'Explore the rich history of Istanbul with a local guide.',
              type: 'Historical',
              createdAt: '2025-05-01T10:30:00Z'
            },
            {
              _id: '2',
              title: 'Food Experience in Tokyo',
              guide: 'guide2',
              city: 'Tokyo',
              path: [
                { name: 'Tsukiji Fish Market', position: { lat: 35.665, lng: 139.770 } },
                { name: 'Asakusa District', position: { lat: 35.7147, lng: 139.7967 } }
              ],
              schedule: [
                { date: new Date('2025-06-10'), time: '18:00', isAvailable: true },
                { date: new Date('2025-06-25'), time: '19:00', isAvailable: true }
              ],
              imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26',
              price: 85,
              description: 'Taste the authentic flavors of Tokyo in this culinary adventure.',
              type: 'Food',
              createdAt: '2025-05-03T14:20:00Z'
            },
            {
              _id: '3',
              title: 'Adventure Trek in Patagonia',
              guide: 'guide3',
              city: 'El Calafate',
              path: [
                { name: 'Perito Moreno Glacier', position: { lat: -50.4967, lng: -73.1376 } },
                { name: 'Fitz Roy', position: { lat: -49.2726, lng: -73.0428 } }
              ],
              schedule: [
                { date: new Date('2025-07-05'), time: '08:00', isAvailable: true },
                { date: new Date('2025-07-15'), time: '08:00', isAvailable: true }
              ],
              imageUrl: 'https://images.unsplash.com/photo-1540810370-5b5f51d1142a',
              price: 240,
              description: 'Experience the breathtaking landscapes of Patagonia on this guided trek.',
              type: 'Adventure',
              createdAt: '2025-05-05T09:45:00Z'
            }
          ];
          setTrips(testTrips);
          setFilteredTrips(testTrips);
          setError(null);
        }
      }, 1000);
    };
    
    // Check if we're in development (running on localhost)
    const isDevelopment = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';
    
    if (isDevelopment) {
      fallbackToTestData();
    }
  }, [error, trips.length]);

  // Load more trips
  const loadMoreTrips = () => {
    if (hasNextPage && !loading) {
      setPage(prevPage => prevPage + 1);
      fetchTrips(page + 1);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSearchQuery('');
    setShowFilters(false);
  };

  // Apply filters and close filter panel
  const applyFilters = () => {
    setShowFilters(false);
  };

  // Handle trip card click
  const handleTripClick = (trip: Trip) => {
    navigate(`/trip/${trip._id}`);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Get upcoming trip date
  const getUpcomingDate = (schedules: Schedule[]) => {
    const availableSchedules = schedules.filter(s => s.isAvailable);
    if (availableSchedules.length === 0) return 'No dates available';
    
    const sortedDates = [...availableSchedules].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const nextDate = sortedDates[0];
    return `${formatDate(nextDate.date.toString())} at ${nextDate.time}`;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Header */}
      <div 
        ref={headerRef}
        className="bg-gradient-to-r from-amber-600 to-amber-400 py-20 px-4 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="container mx-auto relative z-10">
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            Discover Unforgettable Journeys
          </h1>
          <p className="text-white text-xl max-w-2xl opacity-90 mb-8">
            Explore unique trips curated by local guides, immerse yourself in new cultures, and create memories that last a lifetime.
          </p>
          
          {/* Search Bar */}
          <div className="bg-white rounded-full p-2 flex items-center shadow-lg max-w-2xl">
            <div className="pl-4 pr-2">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search for trips, cities, or experiences..."
              className="flex-grow py-2 px-2 border-none focus:outline-none text-gray-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${showFilters ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'} ml-2`}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="container mx-auto py-6 px-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Refine Your Search</h3>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* City Filter */}
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">City</label>
                  <div className="relative">
                    <select
                      value={filters.city}
                      onChange={(e) => setFilters({...filters, city: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                    >
                      <option value="">All Cities</option>
                      {POPULAR_CITIES.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
                
                {/* Trip Type Filter */}
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Trip Type</label>
                  <div className="relative">
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters({...filters, type: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                    >
                      <option value="">All Types</option>
                      {TRIP_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
                
                {/* Date Range Filter */}
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Date Range</label>
                  <div className="relative">
                    <select
                      value={filters.dateRange}
                      onChange={(e) => setFilters({...filters, dateRange: e.target.value as FilterOptions['dateRange']})}
                      className="w-full p-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                    >
                      <option value="all">Any Date</option>
                      <option value="today">Today</option>
                      <option value="this-week">This Week</option>
                      <option value="this-month">This Month</option>
                      <option value="next-month">Next Month</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
                
                {/* Price Range Filter */}
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Price Range</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max={filters.maxPrice}
                      value={filters.minPrice}
                      onChange={(e) => setFilters({...filters, minPrice: parseInt(e.target.value) || 0})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Min"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      min={filters.minPrice}
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({...filters, maxPrice: parseInt(e.target.value) || 0})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Max"
                    />
                  </div>
                </div>
                
                {/* Sort By Filter (moved to 5th position in larger screens) */}
                <div className="lg:col-span-4">
                  <label className="block text-gray-700 mb-2 font-medium">Sort By</label>
                  <div className="relative max-w-xs">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters({...filters, sortBy: e.target.value as 'price' | 'newest' | 'oldest'})}
                      className="w-full p-3 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="price">Price (Low to High)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Reset Filters
                </button>
                <button
                  onClick={applyFilters}
                  className="px-5 py-2.5 bg-amber-500 rounded-lg text-white hover:bg-amber-600 transition-colors shadow-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Container */}
      <div className="container mx-auto px-4 py-12">
        {/* Results Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isFilterApplied 
                ? `${filteredTrips.length} trips found`
                : 'All Available Trips'
              }
            </h2>
            {isFilterApplied && (
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm">Filtered results</span>
                <button
                  onClick={resetFilters}
                  className="text-amber-600 text-sm font-medium hover:text-amber-700 flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Clear all filters
                </button>
              </div>
            )}
          </div>
          
          {/* View Mode Toggle */}
          <div className="mt-4 md:mt-0 bg-gray-100 rounded-lg p-1 flex items-center">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-700'}`}
            >
              <ListIcon className="h-4 w-4" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${viewMode === 'map' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-700'}`}
            >
              <MapIcon className="h-4 w-4" />
              <span>Map</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredTrips.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
            <img
              src="/no-results.svg"
              alt="No results found"
              className="w-32 h-32 mx-auto mb-4 opacity-70"
            />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No trips found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              We couldn't find any trips matching your search criteria. Try adjusting your filters or search query.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filteredTrips.map((trip, index) => (
                <motion.div
                  key={trip._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col"
                  onClick={() => handleTripClick(trip)}
                >
                  {/* Card Image */}
                  <div className="relative h-56 overflow-hidden group">
                    <img
                      src={trip.imageUrl || '/trip-placeholder.jpg'}
                      alt={trip.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-300 opacity-70 group-hover:opacity-80" />
                    
                    {/* Price Tag */}
                    <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-full shadow-md">
                      <span className="font-bold text-amber-600">${trip.price}</span>
                    </div>
                    
                    {/* Location */}
                    <div className="absolute bottom-4 left-4 text-white flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">{trip.city}</span>
                    </div>
                    
                    {/* Trip Type Badge */}
                    <div className="absolute bottom-4 right-4">
                      <span className="px-3 py-1 bg-amber-500 text-white text-xs rounded-full shadow-sm">
                        {trip.type}
                      </span>
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{trip.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2 flex-grow">{trip.description}</p>
                    
                    {trip.schedule?.length > 0 && (
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                        <Calendar className="h-4 w-4" />
                        <span>{getUpcomingDate(trip.schedule)}</span>
                      </div>
                    )}
                    
                    {/* Locations Count */}
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                      <MapPin className="h-4 w-4" />
                      <span>{trip.path?.length || 0} locations to explore</span>
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent card click event
                        handleTripClick(trip);
                      }}
                      className="w-full mt-2 py-2.5 bg-amber-100 text-amber-600 font-medium rounded-lg hover:bg-amber-200 transition-colors text-center"
                    >
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Map View (Placeholder) */}
        {viewMode === 'map' && (
          <div className="bg-gray-100 rounded-xl h-96 flex items-center justify-center border border-gray-200">
            <div className="text-center">
              <MapIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Map view will display all trips by location</p>
              <p className="text-gray-500 text-sm mt-1">This feature is coming soon</p>
            </div>
          </div>
        )}

        {/* Load More Button */}
        {hasNextPage && filteredTrips.length > 0 && (
          <div className="mt-12 text-center">
            <button
              onClick={loadMoreTrips}
              disabled={loading}
              className="bg-white border-2 border-amber-500 text-amber-600 hover:bg-amber-50 px-8 py-3 rounded-xl font-medium transition-all shadow-sm disabled:opacity-70"
            >
              {loading ? 'Loading...' : 'Load More Trips'}
            </button>
          </div>
        )}

        {/* End of Results Message */}
        {!hasNextPage && filteredTrips.length > 0 && (
          <div className="mt-10 text-center">
            <p className="text-gray-500">You've reached the end of our trips</p>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && page === 1 && (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-solid border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-gray-600">Loading trips...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Trips;