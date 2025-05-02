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
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";
import Account from "./pages/Account";
import VerifyEmail from './pages/VerifyEmail';

import { checkAuthStatus } from "./services/authService";

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

function App() {
  // State to track if user is scrolled down and authentication
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });
    const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Effect to handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Clean up event listener
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Check authentication status when component mounts
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Use the checkAuthStatus function from our custom auth service
        const isAuth = await checkAuthStatus();
        setIsAuthenticated(isAuth);
      } catch (error) {
        console.error("Authentication verification error:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();

    // Set up event listener for storage changes (for logout in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "authToken") {
        if (!e.newValue) {
          // Token was removed, user logged out in another tab
          setIsAuthenticated(false);
        } else if (!localStorage.getItem("authToken") && e.newValue) {
          // Token was added, user logged in in another tab
          setIsAuthenticated(true);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Show loading indicator while checking auth status
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
          {" "}
          {/* Added padding-top for fixed navbar */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/search" element={<SearchResults />} />

            {/* Login route */}
            <Route
              path="/login"
              element={
                isAuthenticated ? (
                  <Navigate to="/account" replace />
                ) : (
                  <Login setIsAuthenticated={setIsAuthenticated} />
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

            {/* Password recovery routes */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-reset-password" element={<VerifyEmail setIsEmailVerified={() => {}} />} />

            {/*sign up verfication*/}
            <Route
              path="/verify-email"
              element={<VerifyEmail setIsEmailVerified={setIsEmailVerified} />}
            />

            {/* Protected routes */}
            <Route
              path="/account/*"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Account />
                </ProtectedRoute>
              }
            />

            {/* Catch-all route for 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* You can add a Footer component here if needed */}
      </div>
    </Router>
  );
}

export default App;
