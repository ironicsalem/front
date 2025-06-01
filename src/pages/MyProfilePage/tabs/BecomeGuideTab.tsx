import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  FileText, 
  Upload, 
  MapPin, 
  Languages, 
  Star,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  X
} from 'lucide-react';

interface Application {
  _id: string;
  userId: string;
  city: string;
  languages: string[];
  specialties: string[];
  nationalId: string;
  behavioralCertificate: string;
  nationalIdPicture: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const BecomeGuideTab: React.FC = () => {
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    city: 'Amman',
    languages: [] as string[],
    specialties: [] as string[],
    nationalId: '',
    behavioralCertificate: null as File | null,
    nationalIdPicture: null as File | null
  });

  const availableLanguages = ['Arabic', 'English', 'French', 'German', 'Spanish', 'Italian', 'Russian', 'Chinese'];
  const availableSpecialties = ['Historical Tours', 'Cultural Tours', 'Adventure Tours', 'Food Tours', 'Religious Tours', 'Nature Tours', 'City Tours', 'Archaeological Tours'];
  const jordanianCities = ['Amman', 'Petra', 'Aqaba', 'Jerash', 'Madaba', 'Karak', 'Tafilah', 'Mafraq', 'Zarqa', 'Irbid'];

  useEffect(() => {
    fetchApplication();
  }, []);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        // Silently assume no application if no token
        setApplication(null);
        setLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:3000/tourist/applications/myApplication', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setApplication(data);
        } else {
          // Response is not JSON (likely HTML error page)
          console.warn('Expected JSON response but got:', contentType);
          setApplication(null);
        }
      } else if (response.status === 404) {
        // No application found - this is expected for users who haven't applied
        setApplication(null);
      } else if (response.status === 401) {
        // Authentication failed - silently assume no application for now
        console.warn('Authentication failed, assuming no application');
        setApplication(null);
      } else {
        console.warn(`API returned ${response.status}, assuming no application exists`);
        setApplication(null);
      }
    } catch (error) {
      console.error('Error fetching application:', error);
      // For any error (network, CORS, endpoint not found, etc.), 
      // assume it's a first-time user with no application
      setApplication(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageToggle = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleFileChange = (field: 'behavioralCertificate' | 'nationalIdPicture', file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic validation
    if (formData.languages.length === 0) {
      setError('Please select at least one language');
      return;
    }
    if (formData.specialties.length === 0) {
      setError('Please select at least one specialty');
      return;
    }
    if (!formData.behavioralCertificate || !formData.nationalIdPicture) {
      setError('Please upload both required files');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const submitFormData = new FormData();
      
      submitFormData.append('city', formData.city);
      submitFormData.append('languages', JSON.stringify(formData.languages));
      submitFormData.append('specialties', JSON.stringify(formData.specialties));
      submitFormData.append('nationalId', formData.nationalId);
      submitFormData.append('behavioralCertificate', formData.behavioralCertificate);
      submitFormData.append('nationalIdPicture', formData.nationalIdPicture);

      console.log('Submitting to:', '/tourist/apply');
      console.log('Form data keys:', Array.from(submitFormData.keys()));

      const response = await fetch('http://localhost:3000/tourist/apply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitFormData
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers.get('content-type'));

      if (response.status === 404) {
        throw new Error('API endpoint not found. The application feature may not be available yet.');
      }

      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }

      if (response.ok) {
        // Try to parse JSON, but handle empty responses
        let result;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const text = await response.text();
          console.log('Response text:', text);
          if (text) {
            result = JSON.parse(text);
          } else {
            result = { message: 'Application submitted successfully!' };
          }
        } else {
          result = { message: 'Application submitted successfully!' };
        }

        setSuccess(result.message || 'Application submitted successfully!');
        setShowForm(false);
        await fetchApplication();
        
        // Reset form
        setFormData({
          city: 'Amman',
          languages: [],
          specialties: [],
          nationalId: '',
          behavioralCertificate: null,
          nationalIdPicture: null
        });
      } else {
        // Handle error responses
        let errorMessage = `Server error (${response.status})`;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorText = await response.text();
            if (errorText) {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || errorMessage;
            }
          } else {
            // Server returned HTML or other non-JSON response
            errorMessage = `Server returned ${response.status}. The API endpoint may not be properly configured.`;
          }
        } catch {
          console.warn('Could not parse error response');
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to submit application. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application status...</p>
        </div>
      </div>
    );
  }

  // Success notification
  const SuccessMessage = success ? (
    <div className="max-w-2xl mx-auto mb-6">
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800 font-medium">{success}</p>
        </div>
        <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-700">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  ) : null;

  // Error notification
  const ErrorMessage = error ? (
    <div className="max-w-2xl mx-auto mb-6">
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <XCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800 font-medium">{error}</p>
        </div>
        <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  ) : null;

  // If user has an application, show status
  if (application) {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'pending': return 'yellow';
        case 'approved': return 'green';
        case 'rejected': return 'red';
        default: return 'gray';
      }
    };

    const statusColor = getStatusColor(application.status);
    
    return (
      <>
        {SuccessMessage}
        {ErrorMessage}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <UserCheck className="w-16 h-16 mx-auto mb-4 text-amber-600" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Guide Application Status</h2>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Your Application</h3>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                statusColor === 'green' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {statusColor === 'yellow' && <Clock className="w-4 h-4" />}
                {statusColor === 'green' && <CheckCircle className="w-4 h-4" />}
                {statusColor === 'red' && <XCircle className="w-4 h-4" />}
                <span className="capitalize">{application.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{application.city}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Languages</label>
                <div className="flex items-center space-x-2">
                  <Languages className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{application.languages.join(', ')}</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialties</label>
                <div className="flex items-start space-x-2">
                  <Star className="w-4 h-4 text-gray-500 mt-0.5" />
                  <span className="text-gray-900">{application.specialties.join(', ')}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">National ID</label>
                <span className="text-gray-900">{application.nationalId}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Submitted</label>
                <span className="text-gray-900">
                  {new Date(application.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className={`mt-6 p-4 border rounded-lg ${
              statusColor === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
              statusColor === 'green' ? 'bg-green-50 border-green-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {statusColor === 'yellow' && <AlertCircle className="w-5 h-5 text-yellow-600" />}
                {statusColor === 'green' && <CheckCircle className="w-5 h-5 text-green-600" />}
                {statusColor === 'red' && <XCircle className="w-5 h-5 text-red-600" />}
                <p className={`font-medium ${
                  statusColor === 'yellow' ? 'text-yellow-800' :
                  statusColor === 'green' ? 'text-green-800' :
                  'text-red-800'
                }`}>
                  {statusColor === 'yellow' && 'Application Under Review'}
                  {statusColor === 'green' && 'Congratulations! Application Approved'}
                  {statusColor === 'red' && 'Application Not Approved'}
                </p>
              </div>
              <p className={`mt-1 text-sm ${
                statusColor === 'yellow' ? 'text-yellow-700' :
                statusColor === 'green' ? 'text-green-700' :
                'text-red-700'
              }`}>
                {statusColor === 'yellow' && "We're currently reviewing your application. You'll receive an email notification once a decision is made."}
                {statusColor === 'green' && "Your application has been approved. You can now start creating and managing tours as a guide."}
                {statusColor === 'red' && "Unfortunately, your application was not approved at this time. Please contact support for more information."}
              </p>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={fetchApplication}
                className="inline-flex items-center space-x-2 text-amber-600 hover:text-amber-700 font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Status</span>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // If showing form
  if (showForm) {
    return (
      <>
        {ErrorMessage}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <FileText className="w-16 h-16 mx-auto mb-4 text-amber-600" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Apply to Become a Guide</h2>
            <p className="text-gray-600">Fill out the form below to submit your guide application</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* City Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                City *
              </label>
              <select
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              >
                {jordanianCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Languages className="w-4 h-4 inline mr-2" />
                Languages * (Select at least one)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableLanguages.map(language => (
                  <label key={language} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.languages.includes(language)}
                      onChange={() => handleLanguageToggle(language)}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm text-gray-700">{language}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Specialties */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Star className="w-4 h-4 inline mr-2" />
                Tour Specialties * (Select at least one)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableSpecialties.map(specialty => (
                  <label key={specialty} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.specialties.includes(specialty)}
                      onChange={() => handleSpecialtyToggle(specialty)}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm text-gray-700">{specialty}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* National ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                National ID Number *
              </label>
              <input
                type="text"
                value={formData.nationalId}
                onChange={(e) => setFormData(prev => ({ ...prev, nationalId: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="Enter your national ID number"
                required
              />
            </div>

            {/* File Uploads */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="w-4 h-4 inline mr-2" />
                  Behavioral Certificate *
                </label>
                <input
                  type="file"
                  onChange={(e) => handleFileChange('behavioralCertificate', e.target.files?.[0] || null)}
                  accept="image/*,.pdf"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Upload your behavioral certificate (PDF or image)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="w-4 h-4 inline mr-2" />
                  National ID Picture *
                </label>
                <input
                  type="file"
                  onChange={(e) => handleFileChange('nationalIdPicture', e.target.files?.[0] || null)}
                  accept="image/*"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Upload a clear photo of your national ID</p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || formData.languages.length === 0 || formData.specialties.length === 0}
                className="flex-1 bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <span>{submitting ? 'Submitting...' : 'Submit Application'}</span>
              </button>
            </div>
          </form>
        </div>
      </>
    );
  }

  // Initial state - no application
  return (
    <>
      {SuccessMessage}
      {ErrorMessage}
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <UserCheck className="w-24 h-24 mx-auto mb-6 text-amber-600" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Become a Tour Guide</h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Share your knowledge and passion for Jordan with travelers from around the world. 
            Join our community of certified tour guides and start creating unforgettable experiences.
          </p>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-cyan-50 border border-amber-200 rounded-xl p-8 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Why Become a Guide?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Star className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Earn Income</h4>
                <p className="text-sm text-gray-600">Turn your local knowledge into a rewarding income stream</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Meet People</h4>
                <p className="text-sm text-gray-600">Connect with travelers and share cultural experiences</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Flexible Schedule</h4>
                <p className="text-sm text-gray-600">Work when you want and create your own tours</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Support Provided</h4>
                <p className="text-sm text-gray-600">Get training and ongoing support from our team</p>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setShowForm(true);
            setError(null);
            setSuccess(null);
          }}
          className="bg-amber-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-amber-700 transition-colors shadow-lg hover:shadow-xl"
        >
          Start Your Application
        </button>

        <p className="text-sm text-gray-500 mt-4">
          Application review typically takes 2-3 business days
        </p>
      </div>
    </>
  );
};

export default BecomeGuideTab;