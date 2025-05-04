import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
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
  const [city, setCity] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [trips, setTrips] = useState<any[]>([]);
  const [guides, setGuides] = useState<any[]>([]);

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

        const tripsResponse = await axios.get(`${API_URL}/city/${cityName}/trips`);
        setTrips(tripsResponse.data);

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-500 border-t-transparent"></div>
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
  <div className="container mx-auto px-4">
    <h2 className="text-4xl font-bold mb-12 text-center">
      <span className="relative inline-block">
        <span className="relative z-10 px-4 text-orange-600">Meet Our Guides</span>
        <span className="absolute bottom-0 left-0 right-0 h-3 bg-orange-100 -z-10 transform translate-y-2"></span>
      </span>
    </h2>

    {guides.length === 0 ? (
      <div className="text-center text-lg text-gray-600 py-12 bg-white rounded-xl max-w-2xl mx-auto p-8 border border-orange-100">
        No guides available for this city at the moment. Please check back later.
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {guides.map((guide) => (
          <div
            key={guide._id}
            className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group border border-gray-100"
          >
            <div className="h-60 relative overflow-hidden">
              <img
                src={guide.image || '/placeholder-guide.jpg'}
                alt={guide.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <span className="text-white text-xl font-bold">{guide.name}</span>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">{guide.name}</h3>
              <p className="text-gray-600 mb-4">{guide.bio}</p>
              <div className="flex justify-between items-center">
                <span className="text-orange-600 font-medium text-lg">${guide.price}/day</span>
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm transition-colors shadow-md hover:shadow-lg">
                  Contact
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Apply to become a guide button */}
    <div className="text-center mt-16">
      <button
        onClick={() => navigate('/apply-to-become-a-guide')}
        className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg text-xl transition-colors shadow-md hover:shadow-lg"
      >
        Apply to Become a Guide
      </button>
    </div>
  </div>
</section>


        {/* Trips Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-12 text-center">
              <span className="relative inline-block">
                <span className="relative z-10 px-4 text-orange-600">Available Trips</span>
                <span className="absolute bottom-0 left-0 right-0 h-3 bg-orange-100 -z-10 transform translate-y-2"></span>
              </span>
            </h2>
            
            {trips.length === 0 ? (
              <div className="text-center text-lg text-gray-600 py-12 bg-white rounded-xl max-w-2xl mx-auto p-8 border border-orange-100">
                No trips available for this city at the moment. Please check back later.
              </div>
            ) : (
              <div className="relative">
                <Swiper
                  modules={[Autoplay]}
                  spaceBetween={40}
                  slidesPerView={2}
                  loop
                  autoplay={{ delay: 2500, disableOnInteraction: false }}
                  className="rounded-3xl"
                >
                  {trips.map((trip) => (
                    <SwiperSlide key={trip._id}>
                      <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow h-96 bg-white group">
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
                          <p className="text-gray-600 mb-4">{trip.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-orange-600 font-medium text-lg">${trip.price}</span>
                            <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm transition-colors shadow-md hover:shadow-lg">
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between z-10 px-4">
                  <button className="swiper-button-prev bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors border border-gray-200">
                    <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
                  </button>
                  <button className="swiper-button-next bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors border border-gray-200">
                    <ChevronRightIcon className="h-6 w-6 text-gray-700" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Activities Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-12 text-center">
              <span className="relative inline-block">
                <span className="relative z-10 px-4 text-orange-600">Things to Do in {city?.name}</span>
                <span className="absolute bottom-0 left-0 right-0 h-3 bg-orange-100 -z-10 transform translate-y-2"></span>
              </span>
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
                      <div className="bg-white border border-orange-100 rounded-2xl p-12 shadow-lg hover:shadow-xl transition-shadow h-64 flex items-center justify-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-50/50 to-amber-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <p className="text-gray-700 text-xl md:text-2xl text-center font-medium relative z-10">
                          {activity}
                        </p>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between z-10 px-4">
                </div>
              </div>
            ) : (
              <div className="text-center text-lg text-gray-600 py-12 bg-white rounded-xl max-w-2xl mx-auto p-8 border border-orange-100">
                Activities for this city will be added soon. Stay tuned!
              </div>
            )}
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-12 text-center">
              <span className="relative inline-block">
                <span className="relative z-10 px-4 text-orange-600">{city?.name} Gallery</span>
                <span className="absolute bottom-0 left-0 right-0 h-3 bg-orange-100 -z-10 transform translate-y-2"></span>
              </span>
            </h2>

            <div className="relative">
              <Swiper
                spaceBetween={30}
                slidesPerView={2}
                loop
                autoplay={{ delay: 2500, disableOnInteraction: false }}
                className="rounded-3xl"
              >
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <SwiperSlide key={item}>
                    <div className="overflow-hidden rounded-2xl shadow-lg hover:shadow-xl group bg-white">
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                          <span className="text-white text-xl font-medium">{city?.name} View #{item}</span>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between z-10 px-4">
                
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