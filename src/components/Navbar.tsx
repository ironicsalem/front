import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '/logo.svg';
import { logoutUser } from '../services/authService';

interface NavbarProps {
  isScrolled: boolean
  isAuthenticated: boolean
  setIsAuthenticated: (value: boolean) => void
}

const Navbar = ({ isScrolled, isAuthenticated, setIsAuthenticated }: NavbarProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem('authToken');
      setIsAuthenticated(false);
      setIsDropdownOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  }

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-amber-950 p-4' 
          : 'bg-amber-950 p-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo and Brand Name */}
          <Link to="/" className="flex items-center">
            <div className="flex items-center">
              <img 
                src={logo} 
                alt="Guidak Logo" 
                className="h-13 w-10 mr-2" 
                style={{ filter: 'invert(57%) sepia(52%) saturate(2700%) hue-rotate(360deg) brightness(102%) contrast(101%)' }}
              />
              <span className="text-xl font-bold text-white">Guidak</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-white hover:text-amber-600 transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-white hover:text-amber-600 transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-white hover:text-amber-600 transition-colors">
              Contact
            </Link>

            {!isAuthenticated ? (
              <>
                <Link 
                  to="/login"
                  className="text-white hover:text-amber-600 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/signup"
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="text-white hover:text-amber-600 transition-colors flex items-center"
                  onMouseEnter={() => setIsDropdownOpen(true)}
                >
                  My Account
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4 ml-1" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 9l-7 7-7-7" 
                    />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10"
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <Link 
                      to="/account/messages" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Messages
                    </Link>
                    <Link 
                      to="/account/trips" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      My Trips
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
