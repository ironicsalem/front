import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthService from '../../services/AuthService';
import { User } from '../../types/User';

const API_URL = 'http://localhost:3000';

// Create axios instance for admin-specific endpoints
const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to all requests
adminApi.interceptors.request.use(
  (config) => {
    const token = AuthService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

interface GuideApplication {
  _id: string;
  userId: User;
  status: 'pending' | 'approved' | 'rejected';
  languages: string[];
  specialties: string[];
  behavioralCertificate: string;
  nationalId: string;
  nationalIdPicture: string;
  createdAt?: string;
}

const AdminView: React.FC = () => {
  const [applications, setApplications] = useState<GuideApplication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async (): Promise<void> => {
      try {
        if (!AuthService.isAuthenticated()) {
          navigate('/login');
          return;
        }

        // Use AuthService to get current user
        const userData = await AuthService.getCurrentUser();
        setUser(userData);
        
        // Check if user is admin
        if (userData.role !== 'admin') {
          setError('Access denied. Admin privileges required.');
          return;
        }
        
      } catch (error) {
        console.error('Error fetching user:', error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          AuthService.signOut();
          navigate('/login');
        } else {
          setError('Failed to verify user permissions.');
        }
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    const fetchApplications = async (): Promise<void> => {
      if (!user || user.role !== 'admin') return;

      try {
        setIsLoading(true);
        setError(null);
        
        const response = await adminApi.get('/admin/applications');
        setApplications(response.data || []);
      } catch (error) {
        console.error('Failed to fetch applications:', error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            AuthService.signOut();
            navigate('/login');
          } else if (error.response?.status === 403) {
            setError('Access denied. Admin privileges required.');
          } else {
            setError(error.response?.data?.message || 'Failed to fetch applications.');
          }
        } else {
          setError('Network error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [user, navigate]);

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected'): Promise<void> => {
    try {
      await adminApi.patch(`/admin/applications/${id}/${status}`);
      
      setApplications(prev => prev.map(app =>
        app._id === id ? { ...app, status } : app
      ));
    } catch (error) {
      console.error('Status change failed:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          AuthService.signOut();
          navigate('/login');
        } else {
          alert(error.response?.data?.message || `Failed to ${status} application.`);
        }
      } else {
        alert('Network error occurred.');
      }
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading state while checking user permissions
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // Show error if user doesn't have admin privileges or other errors
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <h3 className="text-xl font-medium text-red-800 mb-2">Access Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Guide Applications</h2>
        <div className="text-sm text-gray-500">
          Welcome, {user.name}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : applications?.length > 0 ? (
        <div className="space-y-6">
          {applications.map(application => (
            <div key={application._id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{application.userId?.name}</h3>
                    <p className="text-gray-600">{application.userId?.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    application.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-700 mb-3">Personal Information</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">National ID</label>
                        <p className="mt-1 text-sm text-gray-900">{application.nationalId}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Languages</label>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {application.languages.map((lang, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Specialties</label>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {application.specialties.map((spec, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-700 mb-3">Documents</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">National ID Picture</label>
                        <a 
                          href={application.nationalIdPicture} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-1 inline-block"
                        >
                          <img 
                            src={application.nationalIdPicture} 
                            alt="National ID" 
                            className="h-32 w-auto rounded-md border border-gray-200 object-cover hover:opacity-80 transition-opacity"
                          />
                        </a>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Behavioral Certificate</label>
                        <a 
                          href={application.behavioralCertificate} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-1 inline-block"
                        >
                          <img 
                            src={application.behavioralCertificate} 
                            alt="Behavioral Certificate" 
                            className="h-32 w-auto rounded-md border border-gray-200 object-cover hover:opacity-80 transition-opacity"
                          />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Applied on: {formatDate(application.createdAt)}
                  </p>
                  
                  {application.status === 'pending' && (
                    <div className="space-x-3">
                      <button
                        onClick={() => handleStatusChange(application._id, 'approved')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                      >
                        Approve Application
                      </button>
                      <button
                        onClick={() => handleStatusChange(application._id, 'rejected')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        Reject Application
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <h3 className="text-xl font-medium text-gray-700 mb-2">No applications found</h3>
          <p className="text-gray-500">There are currently no guide applications to review.</p>
        </div>
      )}
    </div>
  );
};

export default AdminView;