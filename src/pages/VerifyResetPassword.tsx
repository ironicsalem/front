import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
      setError("No email found. Please register again.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/auth/verify-email", {
        email,
        code,
      });

      setSuccess(response.data.message || "Email verified successfully!");

      // Set email verified to true after successful verification
      setIsEmailVerified(true);

      setTimeout(() => {
        navigate("/reset-password");
      }, 1500);
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Verification failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-opacity-75 bg-gray-800">
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
            onClick={() => navigate('/reset-password')}

            disabled={isLoading}
            className={`w-full ${isLoading ? "bg-orange-400" : "bg-orange-500 hover:bg-orange-600"} text-white py-2 px-4 rounded-md transition duration-300`}
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;
