import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";

// Page imports
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import SearchResults from "./pages/SearchResults";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgetPassword";
import CityOverview from "./pages/CityOverview";
import ResetPassword from "./pages/auth/ResetPassword";
import Account from "./pages/account/Account";
import VerifyEmail from './pages/auth/VerifyEmail';
import ApplyForm from './pages/ApplyForm';
import GuidesApplications from "./pages/applicationHandling";
import TripsPage from "./pages/Trips";
import Guide from "./pages/Guide";
import CreateTrip from "./pages/trip_creation/CreateTrip";
import TripDetail from "./pages/TripDetail";
import Booking from "./components/Booking";
import Bookings from "./pages/account/Bookings";
import MyProfile from "./pages/profile/MyProfile";

// Services
import AuthService from "./services/AuthService";

// Protected route wrapper component
const ProtectedRoute = ({
  children,
  isAuthenticated,
  redirectPath = "/login",
}: {
  children: React.ReactNode;
  isAuthenticated: boolean;
  redirectPath?: string;
}) => {
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

// Define a custom error type for auth errors
interface AuthError extends Error {
  message: string;
  status?: number;
}

function App() {
  // State management
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle authentication verification
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // First check if token exists in localStorage before attempting verification
        const token = localStorage.getItem('token');
        if (!token) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
        
        // Use the AuthService verifyToken method to check auth status
        await AuthService.verifyToken();
        setIsAuthenticated(true);
        
        // Fetch the current user to check email verification
        const user = await AuthService.getCurrentUser();
        setIsEmailVerified(user?.verified || false);
      } catch (error) {
        console.error("Authentication verification error:", error);
        
        // Handle the error - cast to our custom error type
        const authError = error as AuthError;
        
        // If error is specifically about invalid/expired token, clear it
        if (authError.message?.includes('Invalid or expired token')) {
          localStorage.removeItem('token');
        }
        
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();

    // Listen for token changes in localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        verifyAuth(); // Re-verify when token changes rather than just setting state
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* Navbar with sticky positioning */}
        <Navbar
          isScrolled={isScrolled}
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
        />

        {/* Main content */}
        <main className="flex-grow pt-16">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/city/:cityName" element={<CityOverview />} />
            <Route path="/trip/:id" element={<TripDetail />} />
            <Route path="/guide/:guideId" element={<Guide />} />

            {/* Authentication routes */}
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/account" replace />
                ) : (
                  <Login 
                    setIsAuthenticated={setIsAuthenticated}
                    setIsEmailVerified={setIsEmailVerified} 
                  />
                )
              }
            />

            <Route
              path="/signup"
              element={
                isAuthenticated && !isEmailVerified ? (
                  <Navigate to="/verify-email" replace />
                ) : isAuthenticated && isEmailVerified ? (
                  <Navigate to="/account" replace />
                ) : (
                  <Signup
                    setIsAuthenticated={setIsAuthenticated}
                    setIsEmailVerified={setIsEmailVerified}
                  />
                )
              }
            />

            {/* Email verification */}
            <Route
              path="/verify-email"
              element={<VerifyEmail setIsEmailVerified={setIsEmailVerified} />}
            />

            {/* Password recovery routes */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route 
              path="/verify-reset-password" 
              element={<VerifyEmail setIsEmailVerified={() => {}} />} 
            />

            {/* Application routes */}
            <Route path="/apply" element={<ApplyForm />} />
            
            {/* Trip exploration */}
            <Route path="/trips" element={<TripsPage />} />

            {/* Protected routes - require authentication */}
            <Route
              path="/account/*"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Account />
                </ProtectedRoute>
              }
            >
            </Route>
            
            <Route
                path="/profile"
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <MyProfile />
                  </ProtectedRoute>
                }
            />

            <Route
              path="/bookings"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Bookings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/addtrip"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <CreateTrip />
                </ProtectedRoute>
              }
            />

            <Route
              path="/booking/:tripId"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Booking />
                </ProtectedRoute>
              }
            />

            <Route
              path="/applications"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <GuidesApplications />
                </ProtectedRoute>
              }
            />

            {/* Catch-all route for 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        {/* Footer can be added here */}
      </div>
    </Router>
  );
}

export default App;