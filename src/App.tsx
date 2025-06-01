import { useState, useEffect, useCallback, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";

// Page imports
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgetPassword";
import CityPage from "./pages/City";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from './pages/auth/VerifyEmail';
import TripsPage from "./pages/Trips";
import Guide from "./pages/GuidePage/Guide";
import CreateTrip from "./pages/trip_creation/CreateTrip";
import TripPage from "./pages/TripPage";
import BookingForm from "./components/BookingForm";
import MyProfile from "./pages/MyProfilePage/MyProfile";

// Services
import AuthService from "./services/AuthService";

// Types
interface AuthState {
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  isLoading: boolean;
}

// ScrollToTop component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Enhanced Protected route component
const ProtectedRoute = ({
  children,
  isAuthenticated,
  requireEmailVerification = false,
  isEmailVerified = false,
}: {
  children: React.ReactNode;
  isAuthenticated: boolean;
  requireEmailVerification?: boolean;
  isEmailVerified?: boolean;
}) => {
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireEmailVerification && !isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children}</>;
};

// Signup route component to simplify routing logic
const SignupRoute = ({ 
  isAuthenticated, 
  isEmailVerified, 
  setIsAuthenticated, 
  setIsEmailVerified 
}: {
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  setIsAuthenticated: (value: boolean) => void;
  setIsEmailVerified: (value: boolean) => void;
}) => {
  if (isAuthenticated && isEmailVerified) {
    return <Navigate to="/" replace />;
  }
  
  if (isAuthenticated && !isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }
  
  return (
    <Signup
      setIsAuthenticated={setIsAuthenticated}
      setIsEmailVerified={setIsEmailVerified}
    />
  );
};

function App() {
  // Consolidated auth state
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isEmailVerified: false,
    isLoading: true,
  });
  
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Use ref to prevent race conditions
  const isVerifyingAuth = useRef(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Enhanced auth verification with race condition protection
  const verifyAuth = useCallback(async (skipLoadingState = false) => {
    // Prevent concurrent verification calls
    if (isVerifyingAuth.current) return;
    
    isVerifyingAuth.current = true;
    
    if (!skipLoadingState) {
      setAuthState(prev => ({ ...prev, isLoading: true }));
    }

    try {
      // Validate token format first
      const token = localStorage.getItem('token');
      if (!token || token.trim() === '') {
        throw new Error('No valid token found');
      }
      
      // Verify token
      await AuthService.verifyToken();
      
      // Get user info only after successful token verification
      const user = await AuthService.getCurrentUser();
      
      setAuthState({
        isAuthenticated: true,
        isEmailVerified: user?.verified || false,
        isLoading: false,
      });
    } catch (error) {
      console.error("Authentication verification error:", error);
      
      // Clear auth state on any error
      setAuthState({
        isAuthenticated: false,
        isEmailVerified: false,
        isLoading: false,
      });
      
      // Only clear token if it exists (prevent unnecessary operations)
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
      }
    } finally {
      isVerifyingAuth.current = false;
    }
  }, []);

  // Handle authentication verification
  useEffect(() => {
    verifyAuth();

    // Event handlers
    const handleAuthError = () => {
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        isEmailVerified: false,
      }));
    };

    const handleAuthLogout = () => {
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        isEmailVerified: false,
      }));
    };

    const handleEmailVerified = () => {
      setAuthState(prev => ({ ...prev, isEmailVerified: true }));
      // Re-verify without loading state to get updated user info
      verifyAuth(true);
    };

    // Listen for token changes in localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        if (e.newValue === null) {
          // Token was removed
          setAuthState(prev => ({
            ...prev,
            isAuthenticated: false,
            isEmailVerified: false,
          }));
        } else if (e.newValue !== e.oldValue && e.newValue) {
          // Token changed, re-verify
          verifyAuth();
        }
      }
    };

    // Add event listeners
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("auth-error", handleAuthError);
    window.addEventListener("auth-logout", handleAuthLogout);
    window.addEventListener("email-verified", handleEmailVerified);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-error", handleAuthError);
      window.removeEventListener("auth-logout", handleAuthLogout);
      window.removeEventListener("email-verified", handleEmailVerified);
    };
  }, [verifyAuth]);

  // Enhanced loading indicator
  if (authState.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const { isAuthenticated, isEmailVerified } = authState;

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* ScrollToTop component - automatically scrolls to top on route changes */}
        <ScrollToTop />
        
        {/* Navbar with sticky positioning */}
        <Navbar
          isScrolled={isScrolled}
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={(value: boolean) => 
            setAuthState(prev => ({ ...prev, isAuthenticated: value }))
          }
        />

        {/* Main content */}
        <main className="flex-grow pt-16">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/city/:cityName" element={<CityPage />} />
            <Route path="/trip/:id" element={<TripPage />} />
            <Route path="/guide/:guideId" element={<Guide />} />

            {/* Authentication routes */}
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <Login 
                    setIsAuthenticated={(value: boolean) => 
                      setAuthState(prev => ({ ...prev, isAuthenticated: value }))
                    }
                    setIsEmailVerified={(value: boolean) => 
                      setAuthState(prev => ({ ...prev, isEmailVerified: value }))
                    } 
                  />
                )
              }
            />

            <Route
              path="/signup"
              element={
                <SignupRoute
                  isAuthenticated={isAuthenticated}
                  isEmailVerified={isEmailVerified}
                  setIsAuthenticated={(value: boolean) => 
                    setAuthState(prev => ({ ...prev, isAuthenticated: value }))
                  }
                  setIsEmailVerified={(value: boolean) => 
                    setAuthState(prev => ({ ...prev, isEmailVerified: value }))
                  }
                />
              }
            />

            {/* Email verification */}
            <Route
              path="/verify-email"
              element={
                <VerifyEmail 
                  setIsEmailVerified={(value: boolean) => 
                    setAuthState(prev => ({ ...prev, isEmailVerified: value }))
                  } 
                />
              }
            />

            {/* Password recovery routes */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route 
              path="/verify-reset-password" 
              element={<VerifyEmail setIsEmailVerified={() => {}} />} 
            />

            {/* Trip exploration */}
            <Route path="/trips" element={<TripsPage />} />

            {/* Protected routes - require authentication */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <MyProfile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/addtrip"
              element={
                <ProtectedRoute 
                  isAuthenticated={isAuthenticated}
                  requireEmailVerification={true}
                  isEmailVerified={isEmailVerified}
                >
                  <CreateTrip />
                </ProtectedRoute>
              }
            />

            <Route
              path="/booking/:id"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <BookingForm />
                </ProtectedRoute>
              }
            />

            {/* Catch-all route for 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
      </div>
    </Router>
  );
}

export default App;