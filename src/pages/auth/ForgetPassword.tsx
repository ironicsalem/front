import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService, { ResetPasswordData } from '../../services/AuthService';

const ForgotPassword: React.FC = () => {
  const [state, setState] = useState({
    email: '',
    resetSent: false,
    isLoading: false,
    error: '',
    success: '',
  });
  
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      email: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({
      ...state,
      isLoading: true,
      error: '',
      success: '',
    });

    try {
      const resetData: ResetPasswordData = {
        email: state.email
      };
      
      // Call the forgotPassword method from AuthService
      const response = await AuthService.forgotPassword(resetData);
      
      // Store email for verification
      localStorage.setItem("email", state.email);
      
      setState({
        ...state,
        resetSent: true,
        isLoading: false,
        success: response.message || 'Password reset code has been sent to your email address.',
      });
    } catch (error) {
      const err = error as Error;
      
      setState({
        ...state,
        isLoading: false,
        error: err.message,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-opacity-75 bg-gray-800">
      <div className="bg-white rounded-lg p-8 w-full max-w-md relative">
        {/* Close button */}
        <div className="absolute top-4 right-4">
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={() => navigate('/login')}
          >
            &times;
          </button>
        </div>
        
        {/* Header */}
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">
          Forgot Password
        </h2>
        <p className="text-gray-600 text-center mb-6">
          {!state.resetSent 
            ? "Enter your email address and we'll send you a code to reset your password." 
            : "Check your email for instructions to reset your password."}
        </p>
        
        {/* Error message */}
        {state.error && (
          <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p>{state.error}</p>
          </div>
        )}
        
        {/* Success message */}
        {state.success && (
          <div className="mb-4 p-3 bg-green-100 border-l-4 border-green-500 text-green-700">
            <p>{state.success}</p>
          </div>
        )}
        
        {/* Form */}
        {!state.resetSent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-gray-500 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={state.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={state.isLoading}
              className={`w-full ${state.isLoading ? 'bg-orange-400' : 'bg-orange-500 hover:bg-orange-600'} text-white py-2 px-4 rounded-md transition duration-300`}
            >
              {state.isLoading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        ) : (
          <div className="mt-6">
            <button
              onClick={() => navigate('/verify-reset-password')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md transition duration-300"
            >
              Verify Reset Code
            </button>
          </div>
        )}
        
        {/* Footer Links */}
        <div className="text-center mt-6">
          <span className="text-gray-600">Remembered your password? </span>
          <a 
            href="#" 
            className="text-orange-500 hover:underline font-medium"
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;