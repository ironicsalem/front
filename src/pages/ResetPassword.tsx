import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

// API URL from your auth service
const API_URL = 'http://localhost:5000';

interface ResetPasswordState {
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  isLoading: boolean;
  error: string;
  success: boolean;
}

const ResetPassword: React.FC = () => {
  const [state, setState] = useState<ResetPasswordState>({
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false,
    isLoading: false,
    error: '',
    success: false,
  });
  
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email');
  
  useEffect(() => {
    // Validate token exists
    if (!token) {
      setState(prev => ({
        ...prev,
        error: 'Invalid password reset link. Please request a new one.',
      }));
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setState(prev => ({
      ...prev,
      showPassword: !prev.showPassword,
    }));
  };

  const toggleConfirmPasswordVisibility = () => {
    setState(prev => ({
      ...prev,
      showConfirmPassword: !prev.showConfirmPassword,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (state.password !== state.confirmPassword) {
      setState(prev => ({
        ...prev,
        error: 'Passwords do not match',
      }));
      return;
    }
    
    // Validate password length
    if (state.password.length < 8) {
      setState(prev => ({
        ...prev,
        error: 'Password must be at least 8 characters long',
      }));
      return;
    }
    
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: '',
    }));

    try {
      // Call API to reset password
      await axios.post(`${API_URL}/auth/set-new-password`, {
        token,
        password: state.password,
      });
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        success: true,
      }));
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      const err = error as {
        response?: { 
          data?: { 
            message?: string 
          } 
        },
        request?: unknown
      };
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (err.response) {
        errorMessage = err.response.data?.message || 'Failed to reset password. Please try again.';
      } else if (err.request) {
        errorMessage = 'Server not responding. Please try again later.';
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-opacity-75 bg-gray-800">
      <div className="bg-white rounded-lg p-8 w-full max-w-md relative">
        {/* Header */}
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">
          Reset Your Password
        </h2>
        <p className="text-gray-600 text-center mb-6">
          {!state.success 
            ? "Create a new password for your account." 
            : "Your password has been reset successfully. Redirecting to login..."}
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
            <p>Password reset successful! You can now log in with your new password.</p>
          </div>
        )}
        
        {/* Form */}
        {!state.success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-gray-500 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={state.showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={state.password}
                  onChange={handleChange}
                  placeholder="Create a new password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {state.showPassword ? (
                    <span className="w-5 h-5 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    </span>
                  ) : (
                    <span className="w-5 h-5 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters long
              </p>
            </div>
            
            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-gray-500 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={state.showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={state.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your new password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {state.showConfirmPassword ? (
                    <span className="w-5 h-5 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    </span>
                  ) : (
                    <span className="w-5 h-5 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={state.isLoading}
              className={`w-full ${state.isLoading ? 'bg-orange-400' : 'bg-orange-500 hover:bg-orange-600'} text-white py-2 px-4 rounded-md transition duration-300 mt-6`}
            >
              {state.isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}
        
        {/* Footer Links */}
        <div className="text-center mt-6">
          <a 
            href="#" 
            className="text-orange-500 hover:underline font-medium"
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;