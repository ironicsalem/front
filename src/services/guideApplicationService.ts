// API service for guide applications

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

class GuideApplicationService {
  private baseUrl = '/api';

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Fetch the current user's application
   */
  async getMyApplication(): Promise<Application | null> {
    try {
      const response = await fetch(`${this.baseUrl}/tourist/applications/myApplication`, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 404) {
        // No application found - this is expected for users who haven't applied
        return null;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching application:', error);
      throw error;
    }
  }

  /**
   * Submit a new guide application
   */
  async submitApplication(formData: ApplicationFormData): Promise<{ message: string }> {
    try {
      const submitFormData = new FormData();
      
      // Append form fields
      submitFormData.append('city', formData.city);
      submitFormData.append('languages', JSON.stringify(formData.languages));
      submitFormData.append('specialties', JSON.stringify(formData.specialties));
      submitFormData.append('nationalId', formData.nationalId);
      submitFormData.append('behavioralCertificate', formData.behavioralCertificate);
      submitFormData.append('nationalIdPicture', formData.nationalIdPicture);

      const response = await fetch(`${this.baseUrl}/tourist/apply`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: submitFormData
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }

      return responseData;
    } catch (error) {
      console.error('Error submitting application:', error);
      throw error;
    }
  }

  /**
   * Validate form data before submission
   */
  validateApplicationForm(formData: Partial<ApplicationFormData>): string[] {
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
  }

  /**
   * Get available options for form fields
   */
  getFormOptions() {
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
  }

  /**
   * Format application status for display
   */
  getStatusInfo(status: Application['status']) {
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
  }

  /**
   * Check if user can submit a new application
   */
  canSubmitNewApplication(existingApplication: Application | null): { canSubmit: boolean; reason?: string } {
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
  }
}

// Export singleton instance
export const guideApplicationService = new GuideApplicationService();

// Export for testing or custom instances
export default GuideApplicationService;