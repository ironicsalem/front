import React, { useState } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { BaseUser as User } from '../../../types/Types';
import UserService from '../../../services/UserService';

interface SettingsTabProps {
  user: User;
  navigate: NavigateFunction;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ user }) => {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  // Password change states
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    try {
      await UserService.updatePassword(user._id, {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      alert('Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Failed to update password');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
      
      {/* Password Change Section */}
      <div className="border border-gray-200 rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
            <p className="text-sm text-gray-600">Update your account password for security</p>
          </div>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              showPasswordForm
                ? 'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100'
                : 'text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100'
            }`}
          >
            {showPasswordForm ? 'Cancel' : 'Change Password'}
          </button>
        </div>
        
        {showPasswordForm && (
          <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowPasswordForm(false)}
                className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all duration-200"
              >
                Update Password
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Preferences Section */}
      <div className="border border-gray-200 rounded-xl p-4 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Email Notifications</label>
              <p className="text-xs text-gray-600">Receive updates about bookings and new tours</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">SMS Notifications</label>
              <p className="text-xs text-gray-600">Get SMS alerts for booking confirmations</p>
            </div>
            <input type="checkbox" className="rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">Marketing Emails</label>
              <p className="text-xs text-gray-600">Receive promotional offers and travel tips</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border border-red-200 rounded-xl p-4 sm:p-6 bg-gradient-to-r from-red-50 to-pink-50">
        <h3 className="text-lg font-medium text-red-900 mb-2">Danger Zone</h3>
        <p className="text-sm text-red-700 mb-6">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all duration-200 font-medium">
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;