import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const API_URL = 'http://localhost:5000';

interface Application {
  _id: string;
  status: 'pending' | 'approved' | 'rejected';
  languages: string[];
  specialties: string[];
  createdAt: string;
  feedback?: string;
}

const TouristView = () => {
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${API_URL}/tourist/applications/myApplication`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("hello");

        setApplication(response.data);
      } catch (err: any) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 404) {

            setApplication(null);
          } else if (err.response?.status === 401) {
            setError('Session expired. Please log in again.');
          } else {
            setError('Failed to load application.');
          }
        } else {
          setError('Connection error.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [navigate]);


  const renderStatusCard = () => {
    if (!application) return null;

    const statusConfig = {
      approved: {
        color: 'from-emerald-100 to-emerald-50',
        icon: '✨',
        title: 'Congratulations!',
        message: 'Your guide application has been approved.'
      },
      rejected: {
        color: 'from-rose-100 to-rose-50',
        icon: '⚠️',
        title: 'Application Not Approved',
        message: application.feedback || 'We appreciate your interest.'
      },
      pending: {
        color: 'from-amber-100 to-amber-50',
        icon: '⏳',
        title: 'Application Pending',
        message: 'We\'re reviewing your submission.'
      }
    };

    const config = statusConfig[application.status];

    return (
      <div className={`bg-gradient-to-br ${config.color} rounded-2xl p-6 shadow-sm mb-8`}>
        <div className="flex items-start gap-4">
          <span className="text-3xl">{config.icon}</span>
          <div>
            <h3 className="text-xl font-bold mb-1">{config.title}</h3>
            <p className="text-gray-700">{config.message}</p>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking your application status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">❌</span>
          </div>
          <h3 className="text-2xl font-bold mb-3">Oops!</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-medium hover:shadow-md transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (application) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Your Guide Journey</h1>
          <p className="text-gray-500 mb-8">Track your application progress</p>
          
          {renderStatusCard()}

          {application.feedback && (
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-amber-500">📝</span> Feedback
              </h2>
              <p className="text-gray-700">{application.feedback}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // No application - show combined CTA section
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome to Our Guide Community</h1>
          <p className="text-gray-600">Share your local expertise or discover amazing trips</p>
        </div>

        <div className="space-y-4">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex flex-col items-center text-center">
              <span className="text-4xl mb-4">🏔️</span>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Become a Guide</h3>
              <p className="text-gray-600 mb-4">Share your unique perspective and earn money showing travelers around</p>
              <button
                onClick={() => navigate('/apply')}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-md transition-all"
              >
                Apply to Guide
              </button>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex flex-col items-center text-center">
              <span className="text-4xl mb-4">✈️</span>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Explore Trips</h3>
              <p className="text-gray-600 mb-4">Discover authentic experiences with our local guides</p>
              <button
                onClick={() => navigate('/trips')}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-md transition-all"
              >
                Browse Trips
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TouristView;