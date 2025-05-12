import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/autoplay';
import SwiperCore from 'swiper';
import { Autoplay } from 'swiper/modules';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Footer from '../components/Footer';
import Hero from '../components/Hero';

const CityPage: React.FC = () => {
  const { cityName } = useParams<{ cityName: string }>();
  const navigate = useNavigate();
  const [city, setCity] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [trips, setTrips] = useState<any[]>([]);
  const [guides, setGuides] = useState<any[]>([]);
  const [currentGuidesGroup, setCurrentGuidesGroup] = useState(0);
  const [currentTripsGroup, setCurrentTripsGroup] = useState(0);

  const handleNextGuidesGroup = () => {
    setCurrentGuidesGroup(prev => (prev === Math.ceil(guides.length / 3) - 1 ? 0 : prev + 1));
  };

  const handlePrevGuidesGroup = () => {
    setCurrentGuidesGroup(prev => (prev === 0 ? Math.ceil(guides.length / 3) - 1 : prev - 1));
  };

  const handleNextTripsGroup = () => {
    setCurrentTripsGroup(prev => (prev === Math.ceil(trips.length / 3) - 1 ? 0 : prev + 1));
  };

  const handlePrevTripsGroup = () => {
    setCurrentTripsGroup(prev => (prev === 0 ? Math.ceil(trips.length / 3) - 1 : prev - 1));
  };

  const visibleGuides = guides.slice(currentGuidesGroup * 3, currentGuidesGroup * 3 + 3);
  const visibleTrips = trips.slice(currentTripsGroup * 3, currentTripsGroup * 3 + 3);

  const API_URL = 'http://localhost:5000';

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchData = async () => {
      try {
        const cityResponse = await axios.get(`${API_URL}/city/${cityName}`);
        setCity({
          ...cityResponse.data,
          image: `/cities/${cityName?.toLowerCase()}.jpg`,
        });

        // const tripsResponse = await axios.get(`${API_URL}/city/${cityName}/trips`);
        // setTrips(tripsResponse.data);

        const guidesResponse = await axios.get(`${API_URL}/city/${cityName}/guides`);

        setGuides(guidesResponse.data);
        console.log(guidesResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [cityName]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center py-12 text-lg">{error}</div>;
  }

  SwiperCore.use([Autoplay]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <Hero 
        backgroundImage={`/cities/${city?.name}/${city?.name}.png`}
        title={`${city?.name}`}
        subtitle={
          <div className="max-w-4xl mx-auto">
            <p className="text-xl md:text-3xl text-white font-light leading-relaxed">
              {city?.overview || 'Discover the charm and beauty of this city.'}
            </p>
          </div>
        }
      />

      {/* Main content */}
      <div className="flex flex-col">
      {/* Guides Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center relative inline-block">
            <span className="relative z-10 px-4 bg-white">Meet Our Guides</span>
            <span className="absolute bottom-0 left-0 right-0 mx-auto w-3/4 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent z-0"></span>
          </h2>

          {/* Filter only valid guides with userId */}
          {guides.filter(g => g.userId).length === 0 ? (
            <div className="text-center text-lg text-gray-600 py-12 bg-white rounded-xl max-w-2xl mx-auto p-8 border border-amber-100 shadow-sm">
              No guides available for this city at the moment. Please check back later.
            </div>
          ) : (
            <div className="relative">
              {guides.filter(g => g.userId).length > 3 && (
                <>
                  <button 
                    className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 shadow-xl hover:scale-110"
                    onClick={handlePrevGuidesGroup}
                  >
                    &larr;
                  </button>
                  <button 
                    className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 shadow-xl hover:scale-110"
                    onClick={handleNextGuidesGroup}
                  >
                    &rarr;
                  </button>
                </>
              )}

              <div className="flex flex-wrap justify-center gap-12">
                {visibleGuides
                  .filter((guide) => guide.userId)
                  .map((guide) => (
                    <div key={guide._id} className="flex flex-col items-center w-48 group">
                      {/* Circular Profile */}
                      <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-lg border-4 border-white hover:border-amber-300 transition-all duration-300 group-hover:scale-105">
                        <img
                          src={guide.userId.profilePicture || '/NoPic.jpg'}
                          alt={guide.userId.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Guide Info */}
                      <div className="mt-6 text-center">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {guide.userId.name}
                        </h3>
                        <div className="flex justify-center mt-2 space-x-1">
                          {guide.languages.slice(0, 3).map((lang: String, i) => (
                            <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {lang}
                            </span>
                          ))}
                          {guide.languages.length > 3 && (
                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                              +{guide.languages.length - 3}
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={() => navigate(`/guide/${guide._id}`)}
                          className="mt-4 text-sm text-amber-600 hover:text-amber-700 font-medium"
                        >
                          View Profile →
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {guides.filter(g => g.userId).length > 3 && (
                <div className="flex justify-center mt-8 space-x-3">
                  {Array.from({ length: Math.ceil(guides.filter(g => g.userId).length / 3) }).map((_, i) => (
                    <button
                      key={i}
                      className={`w-4 h-4 rounded-full transition-all duration-300 ${currentGuidesGroup === i ? 'bg-amber-500 scale-125' : 'bg-gray-300'}`}
                      onClick={() => setCurrentGuidesGroup(i)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>


        {/* Trips Section - Modified for 3-by-3 */}
        <section className="py-20 bg-gradient-to-br from-amber-50 to-blue-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-12 text-center relative inline-block">
              <span className="relative z-10 px-4 bg-transparent">
                Available Trips
              </span>
              <span className="absolute bottom-0 left-0 right-0 mx-auto w-3/4 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent z-0"></span>
            </h2>
            
            {trips.length === 0 ? (
              <div className="text-center text-lg text-gray-600 py-12 bg-white rounded-xl max-w-2xl mx-auto p-8 border border-amber-100 shadow-sm">
                No trips available for this city at the moment. Please check back later.
              </div>
            ) : (
              <div className="relative">
                {trips.length > 3 && (
                  <>
                    <button 
                      className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 shadow-xl hover:scale-110"
                      onClick={handlePrevTripsGroup}
                    >
                      &larr;
                    </button>
                    <button 
                      className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 shadow-xl hover:scale-110"
                      onClick={handleNextTripsGroup}
                    >
                      &rarr;
                    </button>
                  </>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {visibleTrips.map((trip) => (
                    <div key={trip._id} className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow h-96 bg-white group">
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={`/cities/${cityName}/gallery/${trip.image}`}
                          alt={trip.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-gallery.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                          <span className="text-white text-xl font-medium">{trip.title}</span>
                        </div>
                      </div>
                      <div className="p-8">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{trip.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{trip.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-amber-600 font-medium text-lg">${trip.price}</span>
                          <button className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg text-sm transition-colors shadow-md hover:shadow-lg">
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {trips.length > 3 && (
                  <div className="flex justify-center mt-8 space-x-3">
                    {Array.from({ length: Math.ceil(trips.length / 3) }).map((_, i) => (
                      <button
                        key={i}
                        className={`w-4 h-4 rounded-full transition-all duration-300 ${currentTripsGroup === i ? 'bg-amber-500 scale-125' : 'bg-gray-300'}`}
                        onClick={() => setCurrentTripsGroup(i)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Activities Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-12 text-center relative inline-block">
              <span className="relative z-10 px-4 bg-white">
                Things to Do in {city?.name}
              </span>
              <span className="absolute bottom-0 left-0 right-0 mx-auto w-3/4 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent z-0"></span>
            </h2>

            {Array.isArray(city?.activities) && city.activities.length > 0 ? (
              <div className="relative max-w-5xl mx-auto">
                <Swiper
                  modules={[Autoplay]}
                  spaceBetween={40}
                  slidesPerView={1}
                  centeredSlides={true}
                  loop={true}
                  autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                  }}
                  className="rounded-3xl"
                >
                  {city.activities.map((activity: string, index: number) => (
                    <SwiperSlide key={`${activity}-${index}`}>
                      <div className="bg-white border border-amber-100 rounded-2xl p-12 shadow-lg hover:shadow-xl transition-shadow h-64 flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-50/50 to-amber-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <p className="text-gray-700 text-xl md:text-2xl text-center font-medium relative z-10">
                          {activity}
                        </p>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            ) : (
              <div className="text-center text-lg text-gray-600 py-12 bg-white rounded-xl max-w-2xl mx-auto p-8 border border-amber-100 shadow-sm">
                Activities for this city will be added soon. Stay tuned!
              </div>
            )}
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-amber-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-12 text-center relative inline-block">
              <span className="relative z-10 px-4 bg-transparent">
                {city?.name} Gallery
              </span>
              <span className="absolute bottom-0 left-0 right-0 mx-auto w-3/4 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent z-0"></span>
            </h2>

            <div className="relative">
              <Swiper
                spaceBetween={30}
                slidesPerView={2}
                breakpoints={{
                  640: {
                    slidesPerView: 1
                  },
                  768: {
                    slidesPerView: 2
                  },
                  1024: {
                    slidesPerView: 3
                  }
                }}
                loop
                autoplay={{ delay: 2500, disableOnInteraction: false }}
                className="rounded-3xl pb-12"
              >
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <SwiperSlide key={item}>
                    <div className="overflow-hidden rounded-2xl shadow-lg hover:shadow-xl group bg-white mx-2">
                      <div className="relative h-80 overflow-hidden">
                        <img
                          src={`/cities/${cityName}/gallery/${item}.jpg`}
                          alt={`${cityName} view ${item}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-gallery.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                          <span className="text-white text-xl font-medium">{city?.name} View #{item}</span>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between z-10 px-4">
                <button className="swiper-button-prev bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors border border-gray-200 transform hover:scale-110">
                  <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
                </button>
                <button className="swiper-button-next bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors border border-gray-200 transform hover:scale-110">
                  <ChevronRightIcon className="h-6 w-6 text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CityPage;