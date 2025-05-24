import React from 'react';
import Footer from '../components/Footer';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Users,
  Heart,
  Shield,
  MapPin,
  Award,
  BookOpen,
  Compass
} from 'lucide-react';

const About = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative h-96 bg-amber-800">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url(/images/jordan-landscape.jpg)',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0  opacity-50"></div>
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About Guidak</h1>
          <p className="text-xl text-white max-w-2xl">
            Connecting travelers with authentic local experiences while supporting Jordanian communities
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-12">
   
        {/* Our Story Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg mb-4">
              Founded in 2025 by Jordanian tourism professionals, Guidak began as a response to the growing 
              disconnect between mass tourism and authentic local experiences. We noticed that while visitor 
              numbers were increasing, local communities weren't seeing the benefits.
            </p>
            <p className="text-lg mb-4">
              Today, we're proud to be Jordan's first certified B-Corp tourism company, with a network of 
              120+ local guides across the country. Our model proves that tourism can be both profitable and 
              beneficial to local communities.
            </p>
           
          </div>
        </section>

        {/* Our Team Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-center">Meet Our Founders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Team Member 1 */}
            <div className="text-center bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden">
                <img src="/NoPic.jpg" alt="Ahmad Al-Farsi" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-semibold">Nagham Nawashi</h3>
              <p className="text-amber-600">Founder & CEO</p>
              <p className="mt-3 text-gray-600 text-sm">
                Bedouin heritage specialist with a vision for community-based tourism that preserves traditions
              </p>
            </div>

            {/* Team Member 2 */}
            <div className="text-center bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden">
                <img src="/NoPic.jpg" alt="Layla Haddad" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-semibold">Aya Al-hadidi</h3>
              <p className="text-amber-600">Director of Community Impact</p>
              <p className="mt-3 text-gray-600 text-sm">
                Social entrepreneur focused on women's empowerment through tourism opportunities
              </p>
            </div>

            {/* Team Member 3 */}
            <div className="text-center bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden">
                <img src="/NoPic.jpg" alt="Omar Nabulsi" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-semibold">Ahmad Alosta</h3>
              <p className="text-amber-600">Head of Guide Training</p>
              <p className="mt-3 text-gray-600 text-sm">
                Archaeologist turned educator, developing our cultural preservation programs
              </p>
            </div>

            {/* Team Member 4 */}
            <div className="text-center bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden">
                <img src="/NoPic.jpg" alt="Yara Tukan" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-semibold">Salem Al-hadidi</h3>
              <p className="text-amber-600">Sustainability Officer</p>
              <p className="mt-3 text-gray-600 text-sm">
                Environmental scientist ensuring our operations meet the highest sustainability standards
              </p>
            </div>
          </div>
        </section>
     {/* Our Mission Section */}
        <section className="mb-16 bg-amber-50 p-8 rounded-lg">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="text-white" size={28} />
            </div>
            <h2 className="text-3xl font-bold mb-6">Our Social Mission</h2>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Users className="mr-2 text-amber-600" size={20} />
                  Empowering Local Guides
                </h3>
                <p className="text-gray-700">
                  We provide fair-wage employment opportunities for Jordanian guides, helping preserve traditional 
                  knowledge while offering sustainable livelihoods. Over 85% of our revenue goes directly to local 
                  guides and their communities.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Shield className="mr-2 text-amber-600" size={20} />
                  Responsible Tourism
                </h3>
                <p className="text-gray-700">
                  Our tours are designed to minimize environmental impact while maximizing community benefits. 
                  We train all guides in sustainable practices and contribute 5% of profits to conservation 
                  efforts in Jordan's protected areas.
                </p>
              </div>
            </div>
          </div>
        </section>

   
  
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default About;