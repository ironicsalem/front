import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, MapPin, Clock, Users } from 'lucide-react';
import Footer from '../components/Footer';
import Hero from '../components/Hero';
import CityService, { City } from '../services/CityService';
import { Trip, PopulatedGuide } from '../types/Types';

const CityPage: React.FC = () => {
  const { cityName } = useParams<{ cityName: string }>();
  const navigate = useNavigate();
  const guidesScrollRef = useRef<HTMLDivElement>(null);
  
  const [city, setCity] = useState<City | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [guides, setGuides] = useState<PopulatedGuide[]>([]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      if (!cityName) {
        setError('City name is required');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError('');

        const [cityData, tripsData, guidesData] = await Promise.all([
          CityService.getCityByName(cityName),
          CityService.getTripsByCity(cityName),
          CityService.getGuidesByCity(cityName)
        ]);

        setCity(cityData);
        setTrips(tripsData);
        setGuides(guidesData.filter((guide: PopulatedGuide) => guide.userId !== null && guide.userId !== undefined));
        
      } catch (err: unknown) {
        console.error('Error fetching city data:', err);
        
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load city data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cityName]);

  const handleGuideClick = (guideId: string): void => {
    navigate(`/guide/${guideId}`);
  };

  const handleTripClick = (tripId: string): void => {
    navigate(`/trip/${tripId}`);
  };

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>): void => {
    const target = event.target as HTMLImageElement;
    target.src = '/NoPic.jpg';
  };

  const scrollGuides = (direction: 'left' | 'right'): void => {
    if (guidesScrollRef.current) {
      const scrollAmount = 320; // Width of guide card + gap
      const currentScroll = guidesScrollRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      guidesScrollRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <div
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </div>
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading city information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!city) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">City not found</h2>
            <p className="text-gray-600 mb-6">The requested city could not be found.</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const cityActivities = Array.isArray(city.activities) ? city.activities : [];
  const cityOverview = typeof city.overview === 'string' ? city.overview : 'Discover the charm and beauty of this amazing destination.';

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Hero Section */}
      <Hero 
        backgroundImage={`/cities/${cityName}/${cityName}.png`}
        title={city.name}
        subtitle={cityOverview}
      />

      <div className="max-w-7xl mx-auto px-4 py-16 space-y-20">
        
        {/* Guides Section - Horizontal Scroll */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              Meet Our Local Guides
            </h2>
            {guides.length > 4 && (
              <div className="flex space-x-2">
                <button
                  onClick={() => scrollGuides('left')}
                  className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:bg-gray-50"
                  type="button"
                  aria-label="Scroll guides left"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => scrollGuides('right')}
                  className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:bg-gray-50"
                  type="button"
                  aria-label="Scroll guides right"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            )}
          </div>
          
          {guides.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No guides available at the moment.</p>
              <p className="text-gray-400 text-sm mt-2">Check back soon for local experts!</p>
            </div>
          ) : (
            <div className="relative">
              <div 
                ref={guidesScrollRef}
                className="flex space-x-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {guides.map((guide: PopulatedGuide) => (
                  <div 
                    key={guide._id} 
                    className="flex-none w-72 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-amber-200 cursor-pointer group"
                    onClick={() => handleGuideClick(guide._id)}
                  >
                    <div className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <img
                          src={guide.userId.profilePicture || '/NoPic.jpg'}
                          alt={guide.userId.name}
                          className="w-16 h-16 rounded-full object-cover border-3 border-amber-100 group-hover:border-amber-300 transition-colors"
                          onError={handleImageError}
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 group-hover:text-amber-600 transition-colors">
                            {guide.userId.name}
                          </h3>
                          {renderStars(guide.averageRating || 0)}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {guide.languages.slice(0, 3).map((lang: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-100">
                            {lang}
                          </span>
                        ))}
                        {guide.languages.length > 3 && (
                          <span className="px-3 py-1 bg-gray-50 text-gray-600 text-sm rounded-full border border-gray-200">
                            +{guide.languages.length - 3} more
                          </span>
                        )}
                      </div>

                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{guide.city}</span>
                      </div>
                      
                      <button 
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-2.5 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg transform group-hover:scale-105"
                        type="button"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Trips Section */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Available Tours & Experiences
          </h2>
          
          {trips.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No trips available at the moment.</p>
              <p className="text-gray-400 text-sm mt-2">New adventures coming soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trips.map((trip: Trip) => (
                <div 
                  key={trip._id} 
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-amber-200 group cursor-pointer"
                  onClick={() => handleTripClick(trip._id)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={trip.imageUrl || '/NoPic.jpg'}
                      alt={trip.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={handleImageError}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700 border border-white/20">
                        {trip.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3 text-gray-800 group-hover:text-amber-600 transition-colors line-clamp-2">
                      {trip.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
                      {trip.description}
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{trip.schedule?.length || 0} slots</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{trip.city}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-left">
                        <span className="text-2xl font-bold text-amber-600">
                          ${trip.price}
                        </span>
                        <span className="text-gray-500 text-sm ml-1">per person</span>
                      </div>
                      <button
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-2.5 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                        type="button"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Gallery Section */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Discover {city.name}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item: number) => (
              <div key={item} className="relative group overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <img
                  src={`/cities/${cityName}/gallery/${item}.jpg`}
                  alt={`${cityName} view ${item}`}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={handleImageError}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                  <span className="text-white text-lg font-medium text-center">
                    {city.name} View #{item}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Activities Section */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Things to Do in {city.name}
          </h2>
          
          {cityActivities.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Activities coming soon!</p>
              <p className="text-gray-400 text-sm mt-2">We're curating amazing experiences for you</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cityActivities.map((activity: string, index: number) => (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-amber-500 group hover:border-orange-500">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform">
                      {index + 1}
                    </div>
                    <p className="text-lg text-gray-700 leading-relaxed group-hover:text-gray-800 transition-colors">
                      {activity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      <Footer />
    </div>
  );
};

export default CityPage;