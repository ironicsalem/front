import React from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  const navigate = useNavigate();
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

  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero section with Petra background */}
      <Hero 
        backgroundImage="/petra.jpg"
        title="Guidak"
        subtitle="Let us guide your journey through Jordan"
      />

      
      
      {/* Main content area */}
      <div className="container mx-auto px-4 py-12">
        {/* Featured destinations */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Destinations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cities.map((city, index) => (
              <div 
                key={index} 
                onClick={() => handleCityClick(city.name)}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer group relative"
              >
                <div className="h-48 bg-gray-300 relative overflow-hidden">
                  <img 
                     src={`/cities/${city.name}/${city.name}.png`}       
                     alt={city.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder-city.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white text-lg font-bold">Explore {city.name} →</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-amber-600 transition-colors">
                    {city.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* About Jordan brief section */}
        <section className="mb-16">
          <div className="bg-blue-50 rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-4 text-center">Visit Jordan</h2>
            <p className="text-lg mb-4">
              Jordan is a land of mesmerizing beauty and contrasts, from the red sands of Wadi Rum to the 
              healing waters of the Dead Sea. Discover ancient wonders, experience Bedouin hospitality, 
              and explore a country where history comes alive.
            </p>
            <div className="flex justify-center mt-6">
              <button className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-md transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </section>
        
        {/* Testimonials section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">What Travelers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="italic mb-4">"My trip to Jordan was life-changing. The people are incredibly welcoming, and the sights are breathtaking."</p>
              <p className="font-semibold">- Sarah Johnson</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="italic mb-4">"Petra at sunset is something everyone should experience at least once in their lifetime."</p>
              <p className="font-semibold">- Mark Taylor</p>
            </div>
          </div>
        </section>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Home