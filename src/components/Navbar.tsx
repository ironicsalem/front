import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '/logo.svg';
import { logoutUser } from '../services/authService';
import { 
  Home, 
  Info, 
  Mail, 
  LogIn, 
  UserPlus, 
  User, 
  LogOut,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface NavbarProps {
  isScrolled: boolean;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
}

const Navbar = ({ isScrolled, isAuthenticated, setIsAuthenticated }: NavbarProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

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
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown when navigating
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [location]);

  const navLinkClass = "flex items-center gap-2 text-white hover:text-amber-400 transition-colors";
  const activeNavLinkClass = "text-amber-400 font-medium";

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-amber-950/95 backdrop-blur-sm py-3 shadow-lg' 
          : 'bg-amber-950 py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo and Brand Name */}
          <Link 
            to="/" 
            className="flex items-center group"
            aria-label="Guidak Home"
          >
            <div className="flex items-center">
              <img 
                src={logo} 
                alt="Guidak Logo" 
                className="h-10 w-10 mr-2 transition-transform group-hover:scale-110" 
                style={{ filter: 'invert(57%) sepia(52%) saturate(2700%) hue-rotate(360deg) brightness(102%) contrast(101%)' }}
              />
              <span className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                Guidak
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className={`${navLinkClass} ${location.pathname === '/' ? activeNavLinkClass : ''}`}
              aria-current={location.pathname === '/' ? 'page' : undefined}
            >
              <Home size={18} />
              <span>Home</span>
            </Link>
            <Link 
              to="/about" 
              className={`${navLinkClass} ${location.pathname === '/about' ? activeNavLinkClass : ''}`}
              aria-current={location.pathname === '/about' ? 'page' : undefined}
            >
              <Info size={18} />
              <span>About</span>
            </Link>
            <Link 
              to="/contact" 
              className={`${navLinkClass} ${location.pathname === '/contact' ? activeNavLinkClass : ''}`}
              aria-current={location.pathname === '/contact' ? 'page' : undefined}
            >
              <Mail size={18} />
              <span>Contact</span>
            </Link>

            {!isAuthenticated ? (
              <>
                <Link 
                  to="/login"
                  className={`${navLinkClass} ${location.pathname === '/login' ? activeNavLinkClass : ''}`}
                >
                  <LogIn size={18} />
                  <span>Login</span>
                </Link>
                <Link 
                  to="/signup"
                  className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
                >
                  <UserPlus size={18} />
                  <span>Sign Up</span>
                </Link>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className={`${navLinkClass} ${isDropdownOpen ? 'text-amber-400' : ''}`}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                  aria-label="Account menu"
                >
                  <User size={18} />
                  <span>Account</span>
                  {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {isDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100"
                    role="menu"
                  >
                    <Link 
                      to="/account" 
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                      role="menuitem"
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                      role="menuitem"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button (would need implementation) */}
          <button 
            className="md:hidden text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;