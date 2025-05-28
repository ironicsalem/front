import React, { useState, useEffect, useCallback } from 'react';
import { NavigateFunction } from 'react-router-dom';
import BookingService, { Booking } from '../../../services/BookingService';
import { 
  Calendar,
  Clock,
  User as UserIcon,
  DollarSign,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  Filter,
  Package,
  TrendingUp
} from 'lucide-react';

interface BookingsTabProps {
  navigate: NavigateFunction;
}

const BookingsTab: React.FC<BookingsTabProps> = ({ navigate }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'canceled'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const userBookings = await BookingService.getMyBookings();
      setBookings(userBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
      // Handle the error gracefully - maybe show a toast or error message
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshBookings = async () => {
    setRefreshing(true);
    try {
      await loadBookings();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await BookingService.cancelBooking(bookingId);
        setBookings(prev => 
          prev.map(booking => 
            booking._id === bookingId 
              ? { ...booking, status: 'canceled' }
              : booking
          )
        );
      } catch (error) {
        console.error('Error canceling booking:', error);
        alert('Failed to cancel booking. Please try again.');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'canceled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'canceled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    // Assuming time is in HH:MM format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isUpcoming = (scheduledDate: string | Date) => {
    const date = typeof scheduledDate === 'string' ? new Date(scheduledDate) : scheduledDate;
    return date > new Date();
  };

  const filteredBookings = bookings.filter(booking => {
    if (filterStatus === 'all') return true;
    return booking.status === filterStatus;
  });

  const getBookingStats = () => {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const canceled = bookings.filter(b => b.status === 'canceled').length;
    const totalSpent = bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.trip?.price || 0), 0);
    
    return { total, confirmed, pending, canceled, totalSpent };
  };

  const stats = getBookingStats();

  if (loading) {
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
          <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
          <p className="text-gray-600 mt-1">Track and manage your tour bookings</p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-3 rounded-xl border border-blue-200">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-xs text-blue-700">Total Bookings</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 rounded-xl border border-green-200">
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">{stats.confirmed}</div>
              <div className="text-xs text-green-700">Confirmed</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 rounded-xl border border-amber-200">
            <div className="text-center">
              <div className="text-xl font-bold text-amber-600">${stats.totalSpent}</div>
              <div className="text-xs text-amber-700">Total Spent</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Refresh Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50 rounded-xl p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Filter by status:</label>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'confirmed' | 'canceled')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
          >
            <option value="all">All Bookings ({stats.total})</option>
            <option value="pending">Pending ({stats.pending})</option>
            <option value="confirmed">Confirmed ({stats.confirmed})</option>
            <option value="canceled">Canceled ({stats.canceled})</option>
          </select>
        </div>
        
        <button
          onClick={refreshBookings}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
          <div className="text-gray-400 mb-6">
            <Package className="w-20 h-20 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            {bookings.length === 0 ? 'No bookings yet' : `No ${filterStatus} bookings`}
          </h3>
          <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
            {bookings.length === 0 
              ? "Start exploring amazing tours and experiences to make your first booking!"
              : `You don't have any ${filterStatus} bookings at the moment.`
            }
          </p>
          {bookings.length === 0 && (
            <div className="flex items-center justify-center space-x-2 text-amber-600 mb-6">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Discover tours and start your adventure</span>
            </div>
          )}
          <button
            onClick={() => navigate('/trips')}
            className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Explore Tours
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              {filterStatus === 'all' ? 'All Bookings' : `${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Bookings`} 
              ({filteredBookings.length})
            </h3>
            <div className="text-sm text-gray-500">
              Sorted by date (newest first)
            </div>
          </div>
          
          <div className="grid gap-6">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:border-amber-200">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                            {booking.trip?.title || 'Trip Details Unavailable'}
                          </h3>
                          <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                          {isUpcoming(booking.scheduledDate) && booking.status === 'confirmed' && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full border border-blue-200">
                              Upcoming
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-4 leading-relaxed">
                          {booking.trip?.description || 'No description available'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Booking Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-bold text-blue-700 text-sm">{formatDate(booking.scheduledDate)}</div>
                          <div className="text-xs text-blue-600">Date</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <Clock className="w-5 h-5 text-purple-600" />
                        <div>
                          <div className="font-bold text-purple-700">{formatTime(booking.scheduledTime)}</div>
                          <div className="text-xs text-purple-600">Time</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-100">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-bold text-green-700">${booking.trip?.price || 0}</div>
                          <div className="text-xs text-green-600">Price</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <UserIcon className="w-5 h-5 text-amber-600" />
                        <div>
                          <div className="font-bold text-amber-700">{booking.trip?.guide?.fullName || 'Unknown Guide'}</div>
                          <div className="text-xs text-amber-600">Guide</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="font-bold text-gray-700">{booking.trip?.duration || 0} days</div>
                          <div className="text-xs text-gray-600">Duration</div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      {(booking.contactPhone || booking.contactEmail) && (
                        <div className="md:col-span-2 lg:col-span-1">
                          <div className="space-y-2">
                            {booking.contactPhone && booking.contactPhone.trim() && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700">{booking.contactPhone}</span>
                              </div>
                            )}
                            {booking.contactEmail && booking.contactEmail.trim() && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Mail className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-700">{booking.contactEmail}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Booking Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <span>Booking ID: {booking._id.slice(-8)}</span>
                      <span>•</span>
                      <span>Created: {formatDate(booking.createdAt)}</span>
                      {booking.updatedAt !== booking.createdAt && (
                        <>
                          <span>•</span>
                          <span>Updated: {formatDate(booking.updatedAt)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 lg:flex-col lg:space-x-0 lg:space-y-2">
                    <button
                      onClick={() => navigate(`/trip/${booking.trip?._id}`)}
                      className="flex items-center justify-center w-10 h-10 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all duration-200"
                      title="View trip details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="flex items-center justify-center w-10 h-10 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Cancel booking"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
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

export default BookingsTab;