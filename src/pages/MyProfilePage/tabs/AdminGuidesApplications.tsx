import React, { useState, useEffect } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { 
  Shield,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Clock,
  User,
  MapPin,
  FileText,
  Download,
  RefreshCw,
  AlertCircle,
  UserCheck
} from 'lucide-react';

interface Application {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  city: string;
  languages: string[];
  specialties: string[];
  nationalId: string;
  behavioralCertificate: string;
  nationalIdPicture: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
}

interface AdminPanelProps {
  navigate: NavigateFunction;
}

const AdminPanel: React.FC<AdminPanelProps> = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:3000/admin/applications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setApplications(data);
        } else {
          console.warn('Expected JSON response but got:', contentType);
          setApplications([]);
        }
      } else if (response.status === 401) {
        setError('Authentication failed. Please log in as an administrator.');
      } else {
        throw new Error(`Failed to fetch applications (${response.status})`);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, status: 'approved' | 'rejected') => {
    try {
      setProcessing(applicationId);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3000/admin/applications/${applicationId}/${status}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchApplications(); // Refresh the list
        setSelectedApplication(null); // Close detail view
        setSuccess(`Application ${status} successfully!`);
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update application');
      }
    } catch (error) {
      console.error('Error updating application:', error);
      setError(error instanceof Error ? error.message : 'Failed to update application');
    } finally {
      setProcessing(null);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.nationalId.includes(searchTerm);
    
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <Check className="w-4 h-4" />;
      case 'rejected': return <X className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Shield className="w-6 h-6 mr-3 text-red-500" />
          Guide Applications
        </h2>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Check className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">{success}</p>
          </div>
          <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={fetchApplications}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Retry
            </button>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, city, or national ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <button
              onClick={fetchApplications}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading applications...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No guide applications have been submitted yet.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    City
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Languages
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((application) => {
                  const statusColor = getStatusColor(application.status);
                  return (
                    <tr key={application._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-amber-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {application.userId.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.userId.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          {application.city}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {application.languages.slice(0, 2).join(', ')}
                          {application.languages.length > 2 && (
                            <span className="text-gray-500"> +{application.languages.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                          statusColor === 'green' ? 'bg-green-100 text-green-800' :
                          statusColor === 'red' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {getStatusIcon(application.status)}
                          <span className="ml-1 capitalize">{application.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedApplication(application)}
                            className="text-amber-600 hover:text-amber-900 flex items-center space-x-1"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                          
                          {application.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(application._id, 'approved')}
                                disabled={processing === application._id}
                                className="text-green-600 hover:text-green-900 flex items-center space-x-1 disabled:opacity-50"
                              >
                                <Check className="w-4 h-4" />
                                <span>{processing === application._id ? 'Processing...' : 'Approve'}</span>
                              </button>
                              
                              <button
                                onClick={() => handleStatusUpdate(application._id, 'rejected')}
                                disabled={processing === application._id}
                                className="text-red-600 hover:text-red-900 flex items-center space-x-1 disabled:opacity-50"
                              >
                                <X className="w-4 h-4" />
                                <span>{processing === application._id ? 'Processing...' : 'Reject'}</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <UserCheck className="w-6 h-6 text-amber-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Application Details</h2>
                </div>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Applicant Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Applicant Information
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <p className="text-gray-900">{selectedApplication.userId.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{selectedApplication.userId.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">National ID</label>
                      <p className="text-gray-900">{selectedApplication.nationalId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <p className="text-gray-900 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        {selectedApplication.city}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Application Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Application Details
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Languages</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedApplication.languages.map((lang, index) => (
                          <span key={index} className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Specialties</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedApplication.specialties.map((specialty, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        getStatusColor(selectedApplication.status) === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        getStatusColor(selectedApplication.status) === 'green' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {getStatusIcon(selectedApplication.status)}
                        <span className="ml-2 capitalize">{selectedApplication.status}</span>
                      </span>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Submitted</label>
                      <p className="text-gray-900">{new Date(selectedApplication.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  Documents
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Behavioral Certificate</h4>
                    <a 
                      href={selectedApplication.behavioralCertificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:text-amber-700 flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>View Document</span>
                    </a>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">National ID Picture</h4>
                    <a 
                      href={selectedApplication.nationalIdPicture}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:text-amber-700 flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>View Document</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedApplication.status === 'pending' && (
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleStatusUpdate(selectedApplication._id, 'approved')}
                      disabled={processing === selectedApplication._id}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>{processing === selectedApplication._id ? 'Processing...' : 'Approve Application'}</span>
                    </button>
                    
                    <button
                      onClick={() => handleStatusUpdate(selectedApplication._id, 'rejected')}
                      disabled={processing === selectedApplication._id}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>{processing === selectedApplication._id ? 'Processing...' : 'Reject Application'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;