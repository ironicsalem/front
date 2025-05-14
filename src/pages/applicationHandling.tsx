import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GuidesApplications = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const API_URL = 'http://localhost:5000';

  // Fetch applications from the backend
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await axios.get(  `${API_URL}/admin/applications/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      setApplications(response.data);
    } catch (err) {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  // Handle application acceptance or decline
  const handleDecision = async (applicationId: string, decision: 'accept' | 'decline') => {
    setError('');
    try {
      await axios.patch(
        `${API_URL}/admin/applications/${applicationId}/${decision}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );
      // After updating the application status, re-fetch applications
      fetchApplications();
    } catch (err) {
      setError(`Failed to ${decision} application`);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-3xl font-bold text-center mb-8 text-amber-600">Guide Applications</h2>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      {loading ? (
        <div className="text-center text-gray-600">Loading applications...</div>
      ) : (
        <div className="space-y-6">
          {applications.length === 0 ? (
            <div className="text-center text-gray-600">No pending applications.</div>
          ) : (
            applications.map((application: any) => (
              <div
                key={application._id}
                className="p-4 border border-gray-200 rounded-lg shadow-sm"
              >
                <div className="flex justify-between">
                  <h3 className="text-xl font-semibold">{application.name}</h3>
                  <span className="text-sm text-gray-500">{application.status}</span>
                </div>
                <p className="text-gray-600">Languages: {application.languages.join(', ')}</p>
                <p className="text-gray-600">Specialties: {application.specialties.join(', ')}</p>
                <p className="text-gray-600">National ID: {application.nationalId}</p>

                <div className="flex space-x-4 mt-4">
                  <button
                    onClick={() => handleDecision(application._id, 'accept')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecision(application._id, 'decline')}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default GuidesApplications;
