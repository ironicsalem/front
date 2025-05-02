import React from 'react'
import Hero from '../components/Hero'
import Footer from '../components/Footer'

const Home: React.FC = () => {
  // Jordan cities data
  const cities = [
    {
      "name": "Amman",
      "overview": "The capital and largest city of Jordan, known for its modernity, Roman ruins, and vibrant culture."
    },
    {
      "name": "Petra",
      "overview": "A UNESCO World Heritage site and ancient Nabatean city carved into rose-red rock."
    },
    {
      "name": "Aqaba",
      "overview": "Jordan's only coastal city, famous for its beaches, diving spots, and views of the Red Sea."
    },
    {
      "name": "Jerash",
      "overview": "Home to one of the best-preserved Roman provincial towns in the world."
    },
    {
      "name": "Madaba",
      "overview": "Known as the 'City of Mosaics', rich with Byzantine and Umayyad-era artwork."
    },
    {
      "name": "Salt",
      "overview": "A historic city with Ottoman architecture and a peaceful hilltop atmosphere."
    },
    {
      "name": "Irbid",
      "overview": "A lively university town in the north of Jordan, blending tradition with youth culture."
    },
    {
      "name": "Zarqa",
      "overview": "An industrial city and Jordan's second-largest urban area."
    },
    {
      "name": "Karak",
      "overview": "Famous for its massive Crusader castle and views over the Jordan Valley."
    },
    {
      "name": "Ma'an",
      "overview": "A desert city and gateway to Petra, with historical and Bedouin heritage."
    },
    {
      "name": "Tafilah",
      "overview": "A town with ancient roots and natural beauty, surrounded by mountains and springs."
    },
    {
      "name": "Ajloun",
      "overview": "Known for its forested hills and the Ajloun Castle overlooking the surrounding valleys."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero section with Petra background */}
      <Hero 
        backgroundImage="/petra.jpg"
        title="Wonderful Jordan"
        subtitle="Explore the wonders of Jordan"
      />
      
      {/* Main content area - you can add more sections here */}
      <div className="container mx-auto px-4 py-12">
        {/* Featured destinations */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Destinations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cities.map((city, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-300 relative">
                  <img 
                    src={`/cities/${city.name}.png`} 
                    alt={city.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder-city.jpg";
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{city.name}</h3>
                  <p className="text-gray-600">{city.overview}</p>
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