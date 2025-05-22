import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService, { VerifyEmailData } from "../../services/AuthService";

interface VerifyEmailProps {
  setIsEmailVerified: (value: boolean) => void;
}

const VerifyEmail: React.FC<VerifyEmailProps> = ({ setIsEmailVerified }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const email = localStorage.getItem("email");
    
    if (!email) {
      setError("No email found. Please register or request password reset again.");
      setIsLoading(false);
      return;
    }

    try {
      const verifyData: VerifyEmailData = {
        email,
        code
      };

      // Call the verifyEmail method from AuthService
      const response = await AuthService.verifyEmail(verifyData);

      setSuccess(response.message || "Email verified successfully!");

      // Set email verified to true after successful verification
      setIsEmailVerified(true);

      setTimeout(() => {
        navigate("/account");
      }, 1500);
    } catch (error) {
      const err = error as Error;
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    const email = localStorage.getItem("email");
    
    if (!email) {
      setError("No email found. Please register or request password reset again.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Call the resendVerificationEmail method from AuthService
      const response = await AuthService.resendVerificationEmail(email);
      setSuccess(response.message || "Verification code has been resent to your email.");
    } catch (error) {
      const err = error as Error;
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
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
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your verification code"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full ${isLoading ? "bg-orange-400" : "bg-orange-500 hover:bg-orange-600"} text-white py-2 px-4 rounded-md transition duration-300`}
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </button>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isLoading}
              className="text-orange-500 hover:underline font-medium"
            >
              Resend verification code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;