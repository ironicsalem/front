import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../../services/AuthService";

interface VerifyEmailProps {
  setIsEmailVerified: (value: boolean) => void;
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({ setIsEmailVerified }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Get email from localStorage or try to get current user email
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // If no email in localStorage, try to get from current user
      const getCurrentUserEmail = async () => {
        try {
          const user = await AuthService.getCurrentUser();
          if (user?.email) {
            setEmail(user.email);
            localStorage.setItem("email", user.email);
          } else {
            setError("No email found. Please log in again.");
          }
        } catch {
          setError("Unable to retrieve user information. Please log in again.");
        }
      };
      getCurrentUserEmail();
    }
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError("No email found. Please log in again.");
      return;
    }

    if (!code.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await AuthService.verifyEmail({
        email,
        code: code.trim(),
      });

      setSuccess(response.message || "Email verified successfully!");

      // Set email verified to true after successful verification
      setIsEmailVerified(true);

      // Navigate to profile after a short delay
      setTimeout(() => {
        navigate("/profile", { replace: true });
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Verification failed. Please try again.";
      setError(errorMessage);
      
      // Handle specific error cases
      if (errorMessage.toLowerCase().includes('expired') || 
          errorMessage.toLowerCase().includes('invalid code')) {
        // Offer to resend code automatically for expired/invalid codes
        setTimeout(() => {
          setError(errorMessage + " Would you like to request a new code?");
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError("No email found. Please log in again.");
      return;
    }

    setIsResending(true);
    setError("");
    setSuccess("");
    
    try {
      await AuthService.resendVerificationEmail(email);
      setSuccess("Verification code has been resent to your email.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to resend verification code.";
      setError(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
    // Clear success when user starts typing a new code
    if (success) {
      setSuccess("");
    }
  };

  const handleBackToLogin = () => {
    // Clear stored email and navigate to login
    localStorage.removeItem("email");
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-opacity-75 bg-gray-200">
      <div className="bg-white rounded-lg p-8 w-full max-w-md relative">
        <div className="absolute top-4 right-4">
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={() => navigate("/")}
          >
            &times;
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Verify Your Email
        </h2>

        <p className="text-gray-600 text-center mb-6">
          We've sent a verification code to{" "}
          <span className="font-medium text-gray-800">
            {email || "your email address"}
          </span>
          . Please enter the code below to verify your account.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700">
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div className="mb-4">
            <label htmlFor="code" className="block text-gray-500 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={handleCodeChange}
              placeholder="Enter your verification code"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
              disabled={isLoading}
              maxLength={6} // Assuming 6-digit codes
              autoComplete="one-time-code"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className={`w-full ${
              isLoading || !email
                ? "bg-orange-400"
                : "bg-orange-500 hover:bg-orange-600"
            } text-white py-2 px-4 rounded-md transition duration-300 mb-4`}
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        {/* Resend Code Button */}
        <div className="text-center mb-4">
          <span className="text-gray-600">Didn't receive the code? </span>
          <button
            onClick={handleResendCode}
            disabled={isResending || !email}
            className={`${
              isResending || !email
                ? "text-orange-400"
                : "text-orange-500 hover:underline"
            } font-medium`}
          >
            {isResending ? "Sending..." : "Resend Code"}
          </button>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-6 space-y-2">
          <div>
            <a 
              href="#" 
              className="text-orange-500 hover:underline font-medium"
              onClick={(e) => {
                e.preventDefault();
                handleBackToLogin();
              }}
            >
              Back to Login
            </a>
          </div>
          
          {/* Additional help text */}
          <p className="text-xs text-gray-500">
            Check your spam folder if you don't see the email
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;