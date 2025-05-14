import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ApplyForm = () => {
  const navigate = useNavigate();
  const jordanCities = [
    'Amman',
    'Zarqa',
    'Irbid',
    'Aqaba',
    'Madaba',
    'Jerash',
    'Salt',
    'Mafraq',
    'Karak',
    'Tafila',
    'Ma\'an',
    'Ajloun',
  ];
  const [languages, setLanguages] = useState<string[]>([]);
  const [newLanguage, setNewLanguage] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [behavioralFile, setBehavioralFile] = useState<File | null>(null);
  const [nationalIdFile, setNationalIdFile] = useState<File | null>(null);
  const [city, setCity] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://localhost:5000';

  const addItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string, clear: () => void) => {
    if (item && !list.includes(item)) {
      setList([...list, item]);
      clear();
    }
  };

  const removeItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setList(list.filter(i => i !== item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!behavioralFile || !nationalIdFile) {
      setError('Both files are required.');
      return;
    }

    const formData = new FormData();
    formData.append('nationalId', nationalId);
    formData.append('behavioralCertificate', behavioralFile);
    formData.append('nationalIdPicture', nationalIdFile);
    formData.append('languages', JSON.stringify(languages));
    formData.append('specialties', JSON.stringify(specialties));
    formData.append('city', city);

    try {
      setLoading(true);
      await axios.post(`${API_URL}/tourist/apply`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Application submitted! Redirecting...');
      setTimeout(() => navigate('/account'), 2500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="w-full lg:w-2000">
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-8 space-y-8 my-8">
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-amber-600">Become a Guide</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Fill out the form below to apply as a tour guide
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                 {/* City Select */}
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <select
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      required
                    >
                      <option value="" disabled>Select a city</option>
                      {jordanCities.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                <div className="rounded-md shadow-sm space-y-4">
                  {/* Languages */}
                  <div>
                    <label htmlFor="languages" className="block text-sm font-medium text-gray-700 mb-1">
                      Languages
                    </label>
                    <div className="flex rounded-md shadow-sm">
                      <input
                        type="text"
                        id="languages"
                        value={newLanguage}
                        onChange={e => setNewLanguage(e.target.value)}
                        placeholder="Add a language"
                        className="focus:ring-amber-500 focus:border-amber-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 p-2 border"
                      />
                      <button
                        type="button"
                        onClick={() => addItem(languages, setLanguages, newLanguage, () => setNewLanguage(''))}
                        className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {languages.map((lang) => (
                        <span key={lang} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          {lang}
                          <button
                            type="button"
                            onClick={() => removeItem(languages, setLanguages, lang)}
                            className="ml-1.5 inline-flex text-amber-400 hover:text-amber-600 focus:outline-none"
                          >
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Specialties */}
                  <div>
                    <label htmlFor="specialties" className="block text-sm font-medium text-gray-700 mb-1">
                      Specialties
                    </label>
                    <div className="flex rounded-md shadow-sm">
                      <input
                        type="text"
                        id="specialties"
                        value={newSpecialty}
                        onChange={e => setNewSpecialty(e.target.value)}
                        placeholder="Add a specialty"
                        className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 p-2 border"
                      />
                      <button
                        type="button"
                        onClick={() => addItem(specialties, setSpecialties, newSpecialty, () => setNewSpecialty(''))}
                        className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {specialties.map((spec) => (
                        <span key={spec} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {spec}
                          <button
                            type="button"
                            onClick={() => removeItem(specialties, setSpecialties, spec)}
                            className="ml-1.5 inline-flex text-blue-400 hover:text-blue-600 focus:outline-none"
                          >
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

        
                  {/* National ID */}
                  <div>
                    <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700 mb-1">
                      National ID Number
                    </label>
                    <input
                      type="text"
                      id="nationalId"
                      value={nationalId}
                      onChange={e => setNationalId(e.target.value)}
                      className="focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      required
                    />
                  </div>

                  {/* National ID File */}
                  <div>
                    <label htmlFor="nationalIdFile" className="block text-sm font-medium text-gray-700 mb-1">
                      Upload National ID (PDF, JPG, PNG)
                    </label>
                    <input
                      type="file"
                      id="nationalIdFile"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setNationalIdFile(file);
                      }}
                      className="focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      required
                    />
                  </div>

                  {/* Behavioral Certificate */}
                  <div>
                    <label htmlFor="behavioralFile" className="block text-sm font-medium text-gray-700 mb-1">
                      Behavioral Certificate (PDF, JPG, PNG)
                    </label>
                    <input
                      type="file"
                      id="behavioralFile"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setBehavioralFile(file);
                      }}
                      className="focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                      required
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${
                      loading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyForm;