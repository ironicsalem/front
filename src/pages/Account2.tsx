import { useState, useEffect } from 'react';
import { getCurrentUser, updateUserAttribute, updatePassword, deleteUser, fetchUserAttributes } from 'aws-amplify/auth';
import type { AuthUser } from 'aws-amplify/auth';
import { useNavigate } from 'react-router-dom';

const Account = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userAttributes, setUserAttributes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone_number: '',
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const userData = await getCurrentUser();
        setUser(userData);
        
        // Fetch user attributes separately
        const attributes = await fetchUserAttributes();
        setUserAttributes(attributes as Record<string, string>);
        
        setFormData({
          email: attributes.email || '',
          name: attributes.name || '',
          phone_number: attributes.phone_number || '',
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        setNotification({
          message: 'Failed to load account information',
          type: 'error'
        });
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update user attributes
      if (formData.name !== userAttributes.name) {
        await updateUserAttribute({
          userAttribute: {
            attributeKey: 'name',
            value: formData.name,
          },
        });
      }

      if (formData.phone_number !== userAttributes.phone_number) {
        await updateUserAttribute({
          userAttribute: {
            attributeKey: 'phone_number',
            value: formData.phone_number,
          },
        });
      }

      // Note: email changes typically require verification in Cognito
      if (formData.email !== userAttributes.email) {
        await updateUserAttribute({
          userAttribute: {
            attributeKey: 'email',
            value: formData.email,
          },
        });
        setNotification({
          message: 'Email update initiated. Please check your inbox for verification.',
          type: 'success'
        });
      }

      setNotification({
        message: 'Profile updated successfully',
        type: 'success'
      });
      setIsEditing(false);
      
      // Refresh user data
      const updatedUser = await getCurrentUser();
      const updatedAttributes = await fetchUserAttributes();
      setUser(updatedUser);
      setUserAttributes(updatedAttributes as Record<string, string>);
    } catch (error) {
      console.error('Error updating profile:', error);
      setNotification({
        message: 'Failed to update profile. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
          if (passwordData.newPassword !== passwordData.confirmPassword) {
      setNotification({
        message: 'New passwords do not match',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      
      setNotification({
        message: 'Password updated successfully',
        type: 'success'
      });
      setIsChangingPassword(false);
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error updating password:', error);
      setNotification({
        message: 'Failed to update password. Please check your current password.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      await deleteUser();
      setNotification({
        message: 'Your account has been deleted',
        type: 'success'
      });
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
      setNotification({
        message: 'Failed to delete account. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Custom notification component
  const Notification = () => {
    if (!notification) return null;
    
    return (
      <div 
        className={`fixed top-4 right-4 px-4 py-2 rounded shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}
      >
        {notification.message}
        <button 
          className="ml-2 font-bold" 
          onClick={() => setNotification(null)}
        >
          ×
        </button>
      </div>
    );
  };

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Notification />
      <h1 className="text-3xl font-bold mb-8">Your Account</h1>

      {/* Profile Information */}
      <div className="bg-white shadow rounded-lg mb-6 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Profile Information</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Edit Profile
            </button>
          ) : null}
        </div>

        {!isEditing ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p>{formData.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p>{formData.name || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone Number</p>
              <p>{formData.phone_number || 'Not provided'}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Note: Changing your email will require verification
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Password Management */}
      <div className="bg-white shadow rounded-lg mb-6 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Password</h2>
          {!isChangingPassword ? (
            <button
              onClick={() => setIsChangingPassword(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Change Password
            </button>
          ) : null}
        </div>

        {isChangingPassword ? (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <input
                type="password"
                name="oldPassword"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                minLength={8}
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
              <button
                type="button"
                onClick={() => setIsChangingPassword(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <p className="text-gray-600">
            You can change your password to keep your account secure.
          </p>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-white shadow rounded-lg p-6 border-red-200 border">
        <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
        {!showDeleteConfirm ? (
          <div>
            <p className="text-gray-600 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Delete Account
            </button>
          </div>
        ) : (
          <div>
            <p className="text-red-600 font-medium mb-4">
              Are you absolutely sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleDeleteAccount}
                disabled={isLoading}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                {isLoading ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;