import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthService';

interface ForgotPasswordState {
  email: string;
  resetSent: boolean;
  isLoading: boolean;
  error: string;
  success: string;
}

const ForgotPassword: React.FC = () => {
  const [state, setState] = useState<ForgotPasswordState>({
    email: '',
    resetSent: false,
    isLoading: false,
    error: '',
    success: '',
  });
  
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({
      ...prev,
      email: e.target.value,
      error: '', // Clear error when user starts typing
      success: '', // Clear success message when user starts typing
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email before sending request
    if (!state.email.trim()) {
      setState(prev => ({
        ...prev,
        error: 'Email address is required',
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: '',
      success: '',
    }));

    try {
      await AuthService.forgotPassword({ email: state.email });
      
      // Store email for the next step in the flow
      localStorage.setItem('email', state.email);

      setState(prev => ({
        ...prev,
        resetSent: true,
        isLoading: false,
        success: 'Password reset code has been sent to your email address.',
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  const handleSendCodeClick = () => {
    navigate('/verify-reset-password');
  };

  const handleResendCode = async () => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: '',
      success: '',
    }));

    try {
      await AuthService.forgotPassword({ email: state.email });
      setState(prev => ({
        ...prev,
        isLoading: false,
        success: 'New password reset code has been sent to your email address.',
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend reset code. Please try again.';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-opacity-75 bg-gray-200">
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
                name="email"
                value={state.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
                disabled={state.isLoading}
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
          <div className="mt-6 space-y-4">
            <button
              onClick={handleSendCodeClick}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md transition duration-300"
            >
              I Have a Code
            </button>
            
            <button
              onClick={handleResendCode}
              disabled={state.isLoading}
              className={`w-full ${state.isLoading ? 'bg-gray-400' : 'bg-gray-500 hover:bg-gray-600'} text-white py-2 px-4 rounded-md transition duration-300`}
            >
              {state.isLoading ? 'Sending...' : 'Resend Code'}
            </button>
            
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md transition duration-300"
            >
              Back to Login
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