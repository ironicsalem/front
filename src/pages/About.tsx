import React from 'react'
import Footer from '../components/Footer'

const About: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Page header with background image */}
      <div className="relative h-64 bg-blue-700">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url(/images/jordan-landscape.jpg)',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <h1 className="text-4xl font-bold text-white">About Us</h1>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-12">
        {/* Our Story Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg mb-4">
              Wonderful Jordan was founded in 2015 by a group of passionate Jordanian tourism experts 
              who wanted to share the beauty and rich cultural heritage of their country with the world.
            </p>
            <p className="text-lg mb-4">
              What started as a small operation with just three tour guides has now grown into one of 
              Jordan's premier tourism companies, serving thousands of visitors each year and employing 
              over 50 local experts who are deeply knowledgeable about Jordan's history, culture, and 
              natural wonders.
            </p>
            <p className="text-lg">
              Our mission remains the same as when we started: to provide authentic, enriching experiences 
              that showcase the best of Jordan while supporting local communities and preserving our 
              precious cultural and natural heritage.
            </p>
          </div>
        </section>

        {/* Our Team Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Team Member 1 */}
            <div className="text-center">
              <div className="w-48 h-48 rounded-full bg-gray-300 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold">Ahmad Al-Farsi</h3>
              <p className="text-blue-600">Founder & CEO</p>
              <p className="mt-2 text-gray-600">
                A native of Amman with over 20 years of experience in tourism
              </p>
            </div>

            {/* Team Member 2 */}
            <div className="text-center">
              <div className="w-48 h-48 rounded-full bg-gray-300 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold">Layla Haddad</h3>
              <p className="text-blue-600">Head of Operations</p>
              <p className="mt-2 text-gray-600">
                Expert in sustainable tourism with a passion for preserving Jordan's heritage
              </p>
            </div>

            {/* Team Member 3 */}
            <div className="text-center">
              <div className="w-48 h-48 rounded-full bg-gray-300 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold">Omar Nabulsi</h3>
              <p className="text-blue-600">Lead Tour Guide</p>
              <p className="mt-2 text-gray-600">
                Historian and storyteller with extensive knowledge of Jordan's archaeological sites
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="mb-16 bg-gray-50 p-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-6 text-center">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Reason 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-blue-600 text-white rounded-full mb-4">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Local Expertise</h3>
              <p>
                Our guides are all locals with deep knowledge of Jordan's history, culture, and hidden gems
              </p>
            </div>

            {/* Reason 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-blue-600 text-white rounded-full mb-4">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Customized Experiences</h3>
              <p>
                We tailor each tour to your interests, whether you're a history buff, adventure seeker, or foodie
              </p>
            </div>

            {/* Reason 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 flex items-center justify-center bg-blue-600 text-white rounded-full mb-4">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Responsible Tourism</h3>
              <p>
                We are committed to sustainable practices and supporting local communities in all our operations
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
                <div>
                  <h4 className="font-semibold">Michael Anderson</h4>
                  <p className="text-gray-600">United States</p>
                </div>
              </div>
              <p className="italic">
                "Our family trip to Jordan was absolutely incredible, and it was all thanks to Wonderful Jordan. 
                From the moment we landed until our departure, everything was perfectly organized. Our guide was 
                knowledgeable, friendly, and attentive to our needs."
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
                <div>
                  <h4 className="font-semibold">Elena Kuznetsova</h4>
                  <p className="text-gray-600">Russia</p>
                </div>
              </div>
              <p className="italic">
                "The Petra by Night experience arranged by Wonderful Jordan was magical and unlike anything I've 
                ever experienced. Their attention to detail and insider knowledge made our Jordan journey truly 
                special. I highly recommend them!"
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default About