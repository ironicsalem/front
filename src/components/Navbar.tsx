import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '/logo.svg';
import AuthService from '../services/AuthService';

interface NavbarProps {
  isScrolled: boolean
  isAuthenticated: boolean
  setIsAuthenticated: (value: boolean) => void
}

const Navbar = ({ isScrolled, isAuthenticated, setIsAuthenticated }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      setIsAuthenticated(false);
      setIsMobileMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  }

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-amber-950/95 backdrop-blur-md shadow-lg py-3' 
          : 'bg-amber-950/90 backdrop-blur-sm py-4'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo and Brand Name */}
          <Link to="/" className="flex items-center group" onClick={closeMobileMenu}>
            <div className="flex items-center">
              <div className="relative">
                <img 
                  src={logo} 
                  alt="Guidak Logo" 
                  className="h-10 w-10 mr-3 transition-transform duration-300 group-hover:scale-110" 
                  style={{ filter: 'invert(57%) sepia(52%) saturate(2700%) hue-rotate(360deg) brightness(102%) contrast(101%)' }}
                />
                <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                Guidak
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link 
              to="/" 
              className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-300 font-medium"
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-300 font-medium"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-300 font-medium"
            >
              Contact
            </Link>

            <div className="h-6 w-px bg-white/20 mx-2"></div>

            {!isAuthenticated ? (
              <>
                <Link 
                  to="/login"
                  className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-300 font-medium"
                >
                  Login
                </Link>
                <Link 
                  to="/signup"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/profile"
                  className="text-white/90 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-300 font-medium flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors duration-300"
          >
            <svg 
              className={`w-6 h-6 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-2">
            <Link 
              to="/" 
              onClick={closeMobileMenu}
              className="block text-white/90 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all duration-300 font-medium"
            >
              Home
            </Link>
            <Link 
              to="/about" 
              onClick={closeMobileMenu}
              className="block text-white/90 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all duration-300 font-medium"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              onClick={closeMobileMenu}
              className="block text-white/90 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all duration-300 font-medium"
            >
              Contact
            </Link>

            <div className="h-px bg-white/20 my-3"></div>

            {!isAuthenticated ? (
              <>
                <Link 
                  to="/login"
                  onClick={closeMobileMenu}
                  className="block text-white/90 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all duration-300 font-medium"
                >
                  Login
                </Link>
                <Link 
                  to="/signup"
                  onClick={closeMobileMenu}
                  className="block bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300 text-center"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="flex items-center text-white/90 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-all duration-300 font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar