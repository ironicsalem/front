import React from 'react';
import Footer from '../components/Footer';
import { useLocation } from 'react-router-dom';
import { 
  MapPin,
  Mail,
  Phone,
  Clock,
  Globe,
  Users,
  CalendarDays,
  Shield
} from 'lucide-react';

const Contact = () => {
  const { pathname } = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative h-96 bg-amber-800">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ 
            backgroundImage: 'url(/images/petra-treasury.jpg)',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-xl text-white max-w-2xl">
            Get in touch with our team for authentic Jordanian experiences
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Contact Information Section */}
          <section className="mb-16 bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
         

              {/* Contact Details */}
              <div className="p-8">
                <h2 className="text-2xl font-bold mb-6 text-amber-800">How to Reach Us</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-amber-100 p-3 rounded-full mr-4">
                      <MapPin className="h-5 w-5 text-amber-800" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Office Address</h3>
                      <p className="text-gray-600">123 Tourism Street, Amman 11181, Jordan</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-amber-100 p-3 rounded-full mr-4">
                      <Mail className="h-5 w-5 text-amber-800" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Email Us</h3>
                      <p className="text-gray-600">info@guidak.com</p>
                      <p className="text-gray-600">bookings@guidak.com</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-amber-100 p-3 rounded-full mr-4">
                      <Phone className="h-5 w-5 text-amber-800" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Call Us</h3>
                      <p className="text-gray-600">+962 6 123 4567</p>
                      <p className="text-gray-600">+962 7 8901 2345 (WhatsApp)</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-amber-100 p-3 rounded-full mr-4">
                      <Clock className="h-5 w-5 text-amber-800" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Working Hours</h3>
                      <p className="text-gray-600">Sunday-Thursday: 9AM - 5PM</p>
                      <p className="text-gray-600">Friday-Saturday: 10AM - 3PM</p>
                    </div>
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-4">Follow Our Journey</h3>
                  <div className="flex space-x-4">
                    <a href="#" className="text-amber-600 hover:text-amber-800">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"/>
                      </svg>
                    </a>
                    <a href="#" className="text-amber-600 hover:text-amber-800">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                      </svg>
                    </a>
                    <a href="#" className="text-amber-600 hover:text-amber-800">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center text-amber-800">Our Contact Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-32 h-32 rounded-full bg-amber-100 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-16 w-16 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Customer Support</h3>
                <p className="text-gray-600 mb-3">For general inquiries and booking assistance</p>
                <p className="text-amber-600">support@guidak.com</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-32 h-32 rounded-full bg-amber-100 mx-auto mb-4 flex items-center justify-center">
                  <CalendarDays className="h-16 w-16 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Bookings Team</h3>
                <p className="text-gray-600 mb-3">For tour reservations and itinerary questions</p>
                <p className="text-amber-600">bookings@guidak.com</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-32 h-32 rounded-full bg-amber-100 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-16 w-16 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Safety & Emergencies</h3>
                <p className="text-gray-600 mb-3">24/7 support for urgent matters</p>
                <p className="text-amber-600">+962 7 8901 2345</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-32 h-32 rounded-full bg-amber-100 mx-auto mb-4 flex items-center justify-center">
                  <Globe className="h-16 w-16 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Press & Media</h3>
                <p className="text-gray-600 mb-3">For journalists and partnership inquiries</p>
                <p className="text-amber-600">media@guidak.com</p>
              </div>
            </div>
          </section>

  
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Contact;