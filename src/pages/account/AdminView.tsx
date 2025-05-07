import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
}

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

const API_URL = 'http://localhost:5000';

const AdminView = () => {
  const [applications, setApplications] = useState<GuideApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null); 

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${API_URL}/auth/verify`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log(response.data.user);
        setUser(response.data.user); 
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('authToken');
        const res = await axios.get(`${API_URL}/admin/applications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(res.data.applications);
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.patch(
        `${API_URL}/admin/applications/${id}/${status}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications(prev => prev.map(app =>
        app._id === id ? { ...app, status } : app
      ));
    } catch (error) {
      console.error('Status change failed:', error);
    }
  };

  const formatDate = (dateString?: string) => {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Guide Applications</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : applications.length > 0 ? (
        <div className="space-y-6">
          {applications.map(application => (
            <div key={application._id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{user?.name}</h3>
                    <p className="text-gray-600">{user?.email}</p>
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
                            className="h-32 w-auto rounded-md border border-gray-200 object-cover"
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
                            className="h-32 w-auto rounded-md border border-gray-200 object-cover"
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
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Approve Application
                      </button>
                      <button
                        onClick={() => handleStatusChange(application._id, 'rejected')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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