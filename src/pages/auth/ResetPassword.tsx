import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthService';

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
  
  useEffect(() => {
    // Check for reset token - should be in the standard 'token' key after verifyResetCode
    const token = localStorage.getItem('token');
    if (!token) {
      setState(prev => ({
        ...prev,
        error: 'Invalid password reset session. Please request a new password reset.',
      }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      [name]: value,
      error: '', // Clear error when user starts typing
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
    
    // Validate password strength (optional but recommended)
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(state.password)) {
      setState(prev => ({
        ...prev,
        error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      }));
      return;
    }
    
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: '',
    }));

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No reset token found. Please request a new password reset.');
      }

      // Use the updated AuthService method that expects just the password
      await AuthService.setNewPassword(state.password);

      setState(prev => ({
        ...prev,
        isLoading: false,
        success: true,
      }));
      
      // Clean up stored tokens and email
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          replace: true,
          state: { message: 'Password reset successful! Please log in with your new password.' }
        });
      }, 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      
      // If token is invalid, clean up and redirect
      if (errorMessage.toLowerCase().includes('unauthorized') || 
          errorMessage.toLowerCase().includes('invalid') ||
          errorMessage.toLowerCase().includes('expired')) {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Your reset session has expired. Please request a new password reset.',
        }));
        
        setTimeout(() => {
          navigate('/forgot-password', { replace: true });
        }, 3000);
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
      }
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
        {!state.success && !state.error.includes('expired') && !state.error.includes('Invalid password reset session') && (
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
                  disabled={state.isLoading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={state.isLoading}
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
                Must be at least 8 characters long with uppercase, lowercase, and numbers
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
                  disabled={state.isLoading}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={state.isLoading}
                >
                  {state.showConfirmPassword ? (
                    <span className="w-5 h-5 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
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
          {state.error.includes('expired') || state.error.includes('Invalid password reset session') ? (
            <a 
              href="#" 
              className="text-orange-500 hover:underline font-medium"
              onClick={(e) => {
                e.preventDefault();
                navigate('/forgot-password');
              }}
            >
              Request New Password Reset
            </a>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;