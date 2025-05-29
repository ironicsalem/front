import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../../services/AuthService";

interface VerifyResetPasswordProps {
  setIsEmailVerified: (value: boolean) => void;
}

const VerifyResetPassword: React.FC<VerifyResetPasswordProps> = ({ setIsEmailVerified }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    
    if (!storedEmail) {
      setError("No email found. Please request password reset again.");
    } else {
      setEmail(storedEmail);
    }
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError("No email found. Please request password reset again.");
      return;
    }

    if (!code.trim()) {
      setError("Please enter the reset code.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await AuthService.verifyResetCode({
        email,
        code: code.trim(),
      });

      setSuccess(response.message || "Reset code verified successfully!");

      // The AuthService already stores the token for the next step
      // Set email verified to true after successful verification
      setIsEmailVerified(true);

      setTimeout(() => {
        navigate("/reset-password", { replace: true });
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Verification failed. Please try again.";
      setError(errorMessage);
      
      // Handle specific error cases
      if (errorMessage.toLowerCase().includes('expired') || 
          errorMessage.toLowerCase().includes('invalid')) {
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
      setError("No email found. Please request password reset again.");
      return;
    }

    setIsResending(true);
    setError("");
    setSuccess("");
    
    try {
      await AuthService.forgotPassword({ email });
      setSuccess("New reset code has been sent to your email.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to resend reset code.";
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

  const handleBackToForgotPassword = () => {
    navigate('/forgot-password', { replace: true });
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
          Verify Reset Code
        </h2>

        <p className="text-gray-600 text-center mb-6">
          We've sent a password reset code to{" "}
          <span className="font-medium text-gray-800">
            {email || "your email address"}
          </span>
          . Please enter the code below to proceed with resetting your password.
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
              Reset Code
            </label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={handleCodeChange}
              placeholder="Enter your reset code"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
              disabled={isLoading || !email}
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
            {isLoading ? "Verifying..." : "Verify Code"}
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
                handleBackToForgotPassword();
              }}
            >
              Back to Forgot Password
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

export default VerifyResetPassword;