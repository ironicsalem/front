import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Hero from '../components/Hero';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [currentGroup, setCurrentGroup] = useState(0);
  
  const cities = [
    { "name": "Amman" },
    { "name": "Petra" },
    { "name": "Aqaba" },
    { "name": "Jerash" },
    { "name": "Madaba" },
    { "name": "Salt" },
    { "name": "Irbid" },
    { "name": "Zarqa" },
    { "name": "Karak" },
    { "name": "Ma'an" },
    { "name": "Tafilah" },
    { "name": "Ajloun" }
  ];

  const handleCityClick = (cityName: string) => {
    navigate(`/city/${cityName}`);
  };

  const handleNextGroup = () => {
    setCurrentGroup(prev => (prev === Math.ceil(cities.length / 3) - 1 ? 0 : prev + 1));
  };

  const handlePrevGroup = () => {
    setCurrentGroup(prev => (prev === 0 ? Math.ceil(cities.length / 3) - 1 : prev - 1));
  };

  const visibleCities = cities.slice(currentGroup * 3, currentGroup * 3 + 3);

  return (
    <div className="flex flex-col min-h-screen">
      <Hero 
        backgroundImage="/petra.jpg"
        title="Guidak"
        subtitle="Let us guide your journey through Jordan"
      />

      <div className="container mx-auto px-4 py-16">

        {/* Featured Destinations */}
        <section className="mb-20 px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold mb-12 text-center relative inline-block">
          <span className="relative z-10 px-6">
            Featured Destinations
          </span>
          <span className="absolute bottom-0 left-0 right-0 mx-auto w-3/4 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent z-0"></span>
        </h2>

        <div className="relative">
          {cities.length > 3 && (
            <>
              <button 
                className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 shadow-xl hover:scale-110"
                onClick={handlePrevGroup}
              >
                &larr;
              </button>
              <button 
                className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-300 shadow-xl hover:scale-110"
                onClick={handleNextGroup}
              >
                &rarr;
              </button>
            </>
          )}

          <div className="overflow-x-auto md:overflow-x-visible pb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-max md:w-full">
              {visibleCities.map((city, index) => (
                <div 
                  key={index} 
                  onClick={() => handleCityClick(city.name)}
                  className="relative w-[90vw] md:w-full h-80 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transform hover:-translate-y-3 hover:scale-[1.02] transition-all duration-500 cursor-pointer group"
                >
                  <img 
                    src={`/cities/${city.name}/${city.name}.png`} 
                    alt={city.name}
                    className="w-full h-full object-cover absolute inset-0 group-hover:scale-110 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/petra.jpg";
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-amber-400/10 group-hover:bg-amber-400/20 transition-all duration-500 mix-blend-overlay"></div>
                  </div>

                  <div className="absolute inset-0 flex flex-col justify-end p-8">
                    <h3 className="text-white text-3xl font-bold mb-3 group-hover:text-amber-300 transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                      {city.name}
                    </h3>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                      <span className="text-amber-300 mr-2 font-medium text-lg">Explore</span>
                      <span className="text-amber-300 text-2xl">→</span>
                    </div>
                  </div>

                  <div className="absolute inset-0 border-4 border-transparent group-hover:border-amber-300/40 rounded-2xl transition-all duration-500 pointer-events-none"></div>

                  
                </div>
              ))}
            </div>
          </div>


          {cities.length > 3 && (
            <div className="flex justify-center mt-8 space-x-3">
              {Array.from({ length: Math.ceil(cities.length / 3) }).map((_, i) => (
                <button
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${currentGroup === i ? 'bg-amber-500 scale-125' : 'bg-gray-300'}`}
                  onClick={() => setCurrentGroup(i)}
                />
              ))}
            </div>
          )}
          {/* Button positioned below */}
          <div className="relative p-8 flex justify-center">
            <button 
              onClick={() => navigate('/trips')}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
            >
              See Our Trips
            </button>
          </div>
        </div>
      </section>
        {/* About Jordan Section */}
        <section className="mb-20 px-4 sm:px-6 lg:px-8">
          <div className="relative bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100">
            <div className="p-12 md:p-16">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-800 mb-6 relative inline-block">
                  <span className="relative z-10 px-6 bg-white">
                    The Soul of Jordan
                  </span>
                  <span className="absolute bottom-0 left-0 right-0 mx-auto w-3/4 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent z-0"></span>
                </h2>
              </div>

              <div className="max-w-5xl mx-auto">
                <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed text-center">
                  From the rose-red city of Petra to the Martian landscapes of Wadi Rum, Jordan offers unparalleled 
                  adventures. Float in the mineral-rich Dead Sea, explore ancient Roman ruins in Jerash, and experience 
                  legendary Bedouin hospitality under star-filled desert skies.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                  {[
                    {
                      title: "Ancient Heritage",
                      content: "Walk through 10,000 years of history in Petra, one of the world's most spectacular archaeological sites."
                    },
                    {
                      title: "Natural Wonders",
                      content: "From the lowest point on Earth to desert landscapes that inspired Mars expeditions."
                    },
                    {
                      title: "Warm Hospitality",
                      content: "Experience the legendary generosity of Jordanian culture and Bedouin traditions."
                    }
                  ].map((item, index) => (
                    <div key={index} className="p-8 hover:bg-amber-50/50 rounded-xl transition-all duration-300 hover:-translate-y-1">
                      <h3 className="text-2xl font-semibold text-amber-600 mb-4">{item.title}</h3>
                      <p className="text-lg text-gray-600">{item.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Become a Guide Section */}
        <section className="mb-20 rounded-2xl overflow-hidden shadow-2xl   ">
          <div className="flex flex-col md:flex-row bg-gradient-to-br from-amber-50 to-blue-50">
            <div className="w-full md:w-1/2 h-98 relative">
              <img 
                src="/group.jpg" 
                alt="Local guides with tourists"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/group.jpg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent md:bg-gradient-to-l" />
            </div>

            <div className="w-full md:w-1/2 p-12 md:p-16 flex flex-col justify-center">
              <div className="max-w-lg mx-auto">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">
                  Become a Local Guide
                </h2>
                <p className="text-xl mb-8 text-gray-700">
                  Are you passionate about Jordan's rich heritage? Join our network of local guides and share your knowledge with travelers from around the world.
                </p>
                <div className="flex flex-col sm:flex-row gap-5">
                  <button 
                    onClick={() => navigate('/apply')}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
                  >
                    Apply Now
                  </button>
                  <Link 
                    to="/about"
                    className="border-2 border-amber-600 text-amber-700 hover:bg-amber-50 px-8 py-4 rounded-xl font-medium transition-all duration-300 text-center text-lg"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="mb-24">
          <h2 className="text-4xl font-bold mb-16 text-center relative inline-block">
            <span className="relative z-10 px-6 bg-white">
              What Travelers Say
            </span>
            <span className="absolute bottom-0 left-0 right-0 mx-auto w-3/4 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent z-0"></span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
            {[
              {
                name: "Sarah Johnson",
                quote: "My trip to Jordan was life-changing. The people are incredibly welcoming, and the sights are breathtaking. Petra at night with all the candles was magical beyond words.",
                avatar: "/avatars/sarah.jpg"
              },
              {
                name: "Mark Taylor",
                quote: "Petra at sunset is something everyone should experience at least once in their lifetime. Our guide made the experience even more special with his deep knowledge of Nabatean history.",
                avatar: "/avatars/mark.jpg"
              }
            ].map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-br from-white to-amber-50/20 p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden hover:-translate-y-1"
              >
                <div className="absolute -top-8 -left-8 text-9xl text-amber-100 z-0 font-serif pointer-events-none">“</div>
                <div className="relative z-10">
                  <p className="italic mb-8 text-gray-700 leading-relaxed text-lg">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-5">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name} 
                      className="w-14 h-14 rounded-full object-cover border-2 border-amber-300 shadow-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/NoPic.jpg";
                      }}
                    />
                    <span className="font-bold text-amber-700 text-lg">{testimonial.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Home;