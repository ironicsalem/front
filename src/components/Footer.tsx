import React from 'react'
import { Link } from 'react-router-dom'

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Wonderful Jordan</h3>
            <p className="mb-4">
              Discover the beauty, history, and culture of Jordan with our curated travel experiences.
            </p>
            <div className="flex space-x-4">
              {/* Social media icons */}
              <a href="https://facebook.com" className="text-gray-300 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
                </svg>
              </a>
              <a href="https://twitter.com" className="text-gray-300 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.44,4.83c-0.8,0.37-1.66,0.61-2.58,0.73c0.93-0.56,1.64-1.43,1.98-2.49c-0.87,0.52-1.83,0.89-2.85,1.09 C19.13,3.07,17.95,2.5,16.67,2.5c-2.89,0-5.19,2.41-5.19,5.38c0,0.42,0.04,0.83,0.13,1.23C7.42,8.9,4.08,6.79,1.66,3.74 C1.24,4.54,1,5.45,1,6.41c0,1.87,0.93,3.52,2.33,4.45C2.55,10.85,1.8,10.63,1.15,10.28v0.07c0,2.61,1.81,4.78,4.19,5.27 c-0.44,0.12-0.9,0.19-1.37,0.19c-0.34,0-0.66-0.03-0.98-0.1c0.67,2.14,2.61,3.69,4.91,3.74c-1.8,1.44-4.07,2.3-6.53,2.3 c-0.42,0-0.84-0.02-1.26-0.07c2.33,1.52,5.09,2.41,8.06,2.41c9.67,0,14.97-8.15,14.97-15.23c0-0.23,0-0.46-0.01-0.69 C22.06,6.57,22.83,5.75,23.44,4.83z"/>
                </svg>
              </a>
              <a href="https://instagram.com" className="text-gray-300 hover:text-white transition-colors">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2.163c3.204,0,3.584,0.012,4.85,0.07c3.252,0.148,4.771,1.691,4.919,4.919c0.058,1.265,0.069,1.645,0.069,4.849c0,3.205-0.012,3.584-0.069,4.849c-0.149,3.225-1.664,4.771-4.919,4.919c-1.266,0.058-1.644,0.07-4.85,0.07c-3.204,0-3.584-0.012-4.849-0.07c-3.26-0.149-4.771-1.699-4.919-4.92c-0.058-1.265-0.07-1.644-0.07-4.849c0-3.204,0.013-3.583,0.07-4.849C2.381,3.924,3.896,2.38,7.151,2.232C8.417,2.175,8.796,2.163,12,2.163 M12,0C8.741,0,8.333,0.014,7.053,0.072c-4.358,0.2-6.78,2.618-6.98,6.98C0.014,8.333,0,8.741,0,12s0.014,3.668,0.072,4.948c0.2,4.358,2.618,6.78,6.98,6.98C8.333,23.986,8.741,24,12,24s3.668-0.014,4.948-0.072c4.354-0.2,6.782-2.618,6.979-6.98C23.986,15.668,24,15.259,24,12s-0.014-3.667-0.072-4.947c-0.196-4.354-2.617-6.78-6.979-6.98C15.668,0.014,15.259,0,12,0 M12,5.838c-3.403,0-6.162,2.759-6.162,6.162c0,3.403,2.759,6.162,6.162,6.162c3.403,0,6.162-2.759,6.162-6.162C18.162,8.597,15.403,5.838,12,5.838 M12,16c-2.209,0-4-1.791-4-4c0-2.209,1.791-4,4-4s4,1.791,4,4C16,14.209,14.209,16,12,16 M18.406,4.155c-0.796,0-1.441,0.645-1.441,1.44s0.645,1.44,1.441,1.44c0.795,0,1.439-0.645,1.439-1.44S19.201,4.155,18.406,4.155"/>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link to="/destinations" className="text-gray-300 hover:text-white transition-colors">Destinations</Link>
              </li>
              <li>
                <Link to="/tours" className="text-gray-300 hover:text-white transition-colors">Tours</Link>
              </li>
            </ul>
          </div>
          
          {/* Destinations */}
          <div>
            <h3 className="text-xl font-bold mb-4">Top Destinations</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/destinations/petra" className="text-gray-300 hover:text-white transition-colors">Petra</Link>
              </li>
              <li>
                <Link to="/destinations/wadi-rum" className="text-gray-300 hover:text-white transition-colors">Wadi Rum</Link>
              </li>
              <li>
                <Link to="/destinations/dead-sea" className="text-gray-300 hover:text-white transition-colors">Dead Sea</Link>
              </li>
              <li>
                <Link to="/destinations/jerash" className="text-gray-300 hover:text-white transition-colors">Jerash</Link>
              </li>
              <li>
                <Link to="/destinations/aqaba" className="text-gray-300 hover:text-white transition-colors">Aqaba</Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>123 Tourism Street, Amman, Jordan</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>info@wonderfuljordan.com</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+962 6 123 4567</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Wonderful Jordan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer