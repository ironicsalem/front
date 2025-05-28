import axios from 'axios';

// Types
export interface Application {
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
  updatedAt?: string;
}

export interface ApplicationFormData {
  city: string;
  languages: string[];
  specialties: string[];
  nationalId: string;
  behavioralCertificate: File;
  nationalIdPicture: File;
}

export interface ApplicationStatusInfo {
  color: 'yellow' | 'green' | 'red' | 'gray';
  icon: string;
  title: string;
  description: string;
}

export interface SubmissionEligibility {
  canSubmit: boolean;
  reason?: string;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
}

export interface FormOptions {
  languages: string[];
  specialties: string[];
  cities: string[];
}

const API_URL = 'http://localhost:3000/tourist';

// Set up axios instance with default headers
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Utility function to create FormData for file uploads
const createApplicationFormData = (data: ApplicationFormData): FormData => {
  const formData = new FormData();
  
  formData.append('city', data.city);
  formData.append('languages', JSON.stringify(data.languages));
  formData.append('specialties', JSON.stringify(data.specialties));
  formData.append('nationalId', data.nationalId);
  formData.append('behavioralCertificate', data.behavioralCertificate);
  formData.append('nationalIdPicture', data.nationalIdPicture);
  
  return formData;
};

const GuideApplicationService = {
  // Get the current user's application - matches GET /applications/myApplication
  getMyApplication: async (): Promise<Application | null> => {
    try {
      const response = await api.get('/applications/myApplication');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) {
          // No application found - this is expected for users who haven't applied
          return null;
        }
        throw new Error(error.response.data.message || 'Failed to fetch application');
      }
      throw new Error('Network error occurred');
    }
  },

  // Submit a new guide application - matches POST /apply
  submitApplication: async (formData: ApplicationFormData): Promise<ApiResponse<null>> => {
    try {
      const submitFormData = createApplicationFormData(formData);
      const response = await api.post('/apply', submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to submit application');
      }
      throw new Error('Network error occurred');
    }
  },

  // Validate form data before submission
  validateApplicationForm: (formData: Partial<ApplicationFormData>): string[] => {
    const errors: string[] = [];

    if (!formData.city?.trim()) {
      errors.push('City is required');
    }

    if (!formData.languages || formData.languages.length === 0) {
      errors.push('At least one language must be selected');
    }

    if (!formData.specialties || formData.specialties.length === 0) {
      errors.push('At least one specialty must be selected');
    }

    if (!formData.nationalId?.trim()) {
      errors.push('National ID is required');
    } else if (formData.nationalId.trim().length < 10) {
      errors.push('National ID must be at least 10 characters');
    }

    if (!formData.behavioralCertificate) {
      errors.push('Behavioral certificate file is required');
    } else {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(formData.behavioralCertificate.type)) {
        errors.push('Behavioral certificate must be an image (JPG, PNG) or PDF file');
      }
      if (formData.behavioralCertificate.size > 5 * 1024 * 1024) { // 5MB limit
        errors.push('Behavioral certificate file size must be less than 5MB');
      }
    }

    if (!formData.nationalIdPicture) {
      errors.push('National ID picture is required');
    } else {
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedImageTypes.includes(formData.nationalIdPicture.type)) {
        errors.push('National ID picture must be an image (JPG, PNG)');
      }
      if (formData.nationalIdPicture.size > 5 * 1024 * 1024) { // 5MB limit
        errors.push('National ID picture file size must be less than 5MB');
      }
    }

    return errors;
  },

  // Get available options for form fields
  getFormOptions: (): FormOptions => {
    return {
      languages: [
        'Arabic', 'English', 'French', 'German', 'Spanish', 
        'Italian', 'Russian', 'Chinese', 'Japanese', 'Korean'
      ],
      specialties: [
        'Historical Tours', 'Cultural Tours', 'Adventure Tours', 
        'Food Tours', 'Religious Tours', 'Nature Tours', 
        'City Tours', 'Archaeological Tours', 'Desert Tours', 
        'Photography Tours'
      ],
      cities: [
        'Amman', 'Petra', 'Aqaba', 'Jerash', 'Madaba', 
        'Karak', 'Tafilah', 'Mafraq', 'Zarqa', 'Irbid',
        'Wadi Rum', 'Dead Sea'
      ]
    };
  },

  // Format application status for display
  getStatusInfo: (status: Application['status']): ApplicationStatusInfo => {
    switch (status) {
      case 'pending':
        return {
          color: 'yellow',
          icon: 'clock',
          title: 'Under Review',
          description: 'Your application is being reviewed by our team. You\'ll receive an email notification once a decision is made.'
        };
      case 'approved':
        return {
          color: 'green',
          icon: 'check-circle',
          title: 'Application Approved',
          description: 'Congratulations! Your application has been approved. You can now start creating and managing tours as a guide.'
        };
      case 'rejected':
        return {
          color: 'red',
          icon: 'x-circle',
          title: 'Application Not Approved',
          description: 'Unfortunately, your application was not approved at this time. Please contact support for more information or to reapply.'
        };
      default:
        return {
          color: 'gray',
          icon: 'help-circle',
          title: 'Unknown Status',
          description: 'Please contact support for assistance.'
        };
    }
  },

  // Check if user can submit a new application
  canSubmitNewApplication: (existingApplication: Application | null): SubmissionEligibility => {
    if (!existingApplication) {
      return { canSubmit: true };
    }

    if (existingApplication.status === 'pending') {
      return { 
        canSubmit: false, 
        reason: 'You already have a pending application. Please wait for the review to complete.' 
      };
    }

    if (existingApplication.status === 'approved') {
      return { 
        canSubmit: false, 
        reason: 'Your application has already been approved. You are now a verified guide.' 
      };
    }

    // For rejected applications, allow reapplication after 30 days
    if (existingApplication.status === 'rejected') {
      const rejectionDate = new Date(existingApplication.updatedAt || existingApplication.createdAt);
      const daysSinceRejection = Math.floor((Date.now() - rejectionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceRejection < 30) {
        return { 
          canSubmit: false, 
          reason: `You can reapply ${30 - daysSinceRejection} days after your previous application was reviewed.` 
        };
      }
    }

    return { canSubmit: true };
  },

  // Format application for display
  formatApplicationForDisplay: (application: Application): Application & {
    formattedSubmissionDate: string;
    formattedLanguages: string;
    formattedSpecialties: string;
    statusInfo: ApplicationStatusInfo;
  } => {
    return {
      ...application,
      formattedSubmissionDate: new Date(application.createdAt).toLocaleDateString(),
      formattedLanguages: application.languages.join(', '),
      formattedSpecialties: application.specialties.join(', '),
      statusInfo: GuideApplicationService.getStatusInfo(application.status),
    };
  },

  // Check file type validity
  isValidFileType: (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type);
  },

  // Check file size validity
  isValidFileSize: (file: File, maxSizeMB: number = 5): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  },

  // Get file size in human readable format
  getFileSizeString: (file: File): string => {
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB < 1) {
      return `${(file.size / 1024).toFixed(1)} KB`;
    }
    return `${sizeMB.toFixed(1)} MB`;
  },

  // Get days remaining for reapplication (for rejected applications)
  getDaysUntilReapplication: (application: Application): number => {
    if (application.status !== 'rejected') return 0;
    
    const rejectionDate = new Date(application.updatedAt || application.createdAt);
    const daysSinceRejection = Math.floor((Date.now() - rejectionDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = 30 - daysSinceRejection;
    
    return Math.max(0, daysRemaining);
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Get the auth token
  getToken: (): string | null => {
    return localStorage.getItem('token');
  }
};

export default GuideApplicationService;