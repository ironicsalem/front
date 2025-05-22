import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService, { VerifyResetCodeData } from "../../services/AuthService";


const VerifyResetPassword: React.FC = () => {
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
      setError("No email found. Please request password reset again.");
      setIsLoading(false);
      return;
    }

    try {
      const verifyData: VerifyResetCodeData = {
        email,
        code
      };

      // Call the verifyResetCode method from AuthService
      const response = await AuthService.verifyResetCode(verifyData);

      setSuccess(response.message || "Reset code verified successfully!");

      // Navigate to reset password with the token
      if (response.valid) {
        setTimeout(() => {
          // In a real app, you would get a token from the response and pass it
          navigate(`/reset-password?email=${email}`);
        }, 1500);
      }
    } catch (error) {
      const err = error as Error;
      setError(err.message);
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
          Verify Reset Code
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
              Reset Code
            </label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter the reset code from your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full ${isLoading ? "bg-orange-400" : "bg-orange-500 hover:bg-orange-600"} text-white py-2 px-4 rounded-md transition duration-300`}
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </button>
          
          <div className="text-center mt-6">
            <a 
              href="#" 
              className="text-orange-500 hover:underline font-medium"
              onClick={(e) => {
                e.preventDefault();
                navigate('/forgot-password');
              }}
            >
              Resend reset code
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyResetPassword;