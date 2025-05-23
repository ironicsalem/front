import React, { useState } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { User } from '../../types/User';
import UserService from '../../services/UserService';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Edit3, 
  Save, 
  X, 
  Calendar,
  Settings,
  Shield,
  Users,
  BarChart3,
  FileText
} from 'lucide-react';

interface AdminViewProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingPhoto: boolean;
  onSignOut: () => void;
  navigate: NavigateFunction;
}

const AdminView: React.FC<AdminViewProps> = ({ 
  user, 
  setUser, 
  navigate 
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'admin' | 'settings'>('profile');
  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    bio: user.bio || ''
  });
  
  // Password change states
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSaveProfile = async () => {
    try {
      const updatedUser = await UserService.updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      });
      setUser(updatedUser);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

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
    <div className="bg-white rounded-lg shadow-md mb-6">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'admin'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Admin Panel
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Settings
          </button>
        </nav>
      </div>

      <div className="p-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center space-x-2 text-amber-600 hover:text-amber-700"
              >
                {editing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                <span>{editing ? 'Cancel' : 'Edit'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <span>{user.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                {editing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{user.phone || 'Not provided'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Since</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</span>
                </div>
              </div>
            </div>

            {editing && (
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Admin Panel Tab */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-red-500" />
                Administrator Panel
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* User Management */}
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <button 
                  onClick={() => navigate('/admin/users')}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Users className="w-8 h-8 text-amber-600" />
                    <span className="text-2xl font-bold text-gray-900">Users</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
                  <p className="text-sm text-gray-600">
                    Manage users, verify accounts, and handle user-related issues
                  </p>
                </button>
              </div>

              {/* Guide Management */}
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <button 
                  onClick={() => navigate('/admin/guides')}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between mb-3">
                    <UserIcon className="w-8 h-8 text-green-600" />
                    <span className="text-2xl font-bold text-gray-900">Guides</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Guide Management</h3>
                  <p className="text-sm text-gray-600">
                    Approve guides, manage certifications, and monitor guide activity
                  </p>
                </button>
              </div>

              {/* Analytics */}
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <button 
                  onClick={() => navigate('/admin/analytics')}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between mb-3">
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                    <span className="text-2xl font-bold text-gray-900">Analytics</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Platform Analytics</h3>
                  <p className="text-sm text-gray-600">
                    View platform statistics, user engagement, and performance metrics
                  </p>
                </button>
              </div>

              {/* Content Management */}
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <button 
                  onClick={() => navigate('/admin/content')}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between mb-3">
                    <FileText className="w-8 h-8 text-orange-600" />
                    <span className="text-2xl font-bold text-gray-900">Content</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Content Moderation</h3>
                  <p className="text-sm text-gray-600">
                    Review posts, comments, and reports. Moderate platform content
                  </p>
                </button>
              </div>

              {/* System Settings */}
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <button 
                  onClick={() => navigate('/admin/system')}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Settings className="w-8 h-8 text-gray-600" />
                    <span className="text-2xl font-bold text-gray-900">System</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">System Settings</h3>
                  <p className="text-sm text-gray-600">
                    Configure platform settings, manage integrations, and system health
                  </p>
                </button>
              </div>

              {/* Reports */}
              <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <button 
                  onClick={() => navigate('/admin/reports')}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between mb-3">
                    <FileText className="w-8 h-8 text-red-600" />
                    <span className="text-2xl font-bold text-gray-900">Reports</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Reports & Issues</h3>
                  <p className="text-sm text-gray-600">
                    Handle user reports, resolve disputes, and manage flagged content
                  </p>
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => navigate('/admin/pending-guides')}
                  className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md hover:bg-yellow-200 transition-colors"
                >
                  Pending Guide Approvals
                </button>
                <button 
                  onClick={() => navigate('/admin/recent-reports')}
                  className="bg-red-100 text-red-800 px-4 py-2 rounded-md hover:bg-red-200 transition-colors"
                >
                  Recent Reports
                </button>
                <button 
                  onClick={() => navigate('/admin/system-health')}
                  className="bg-green-100 text-green-800 px-4 py-2 rounded-md hover:bg-green-200 transition-colors"
                >
                  System Health
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Admin Settings</h2>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-md font-medium text-gray-900">Change Password</h3>
                  <p className="text-sm text-gray-600">Update your administrator password</p>
                </div>
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="text-amber-600 hover:text-amber-700"
                >
                  {showPasswordForm ? 'Cancel' : 'Change'}
                </button>
              </div>
              
              {showPasswordForm && (
                <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.oldPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowPasswordForm(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <h3 className="text-md font-medium text-red-900 mb-2 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Administrator Privileges
              </h3>
              <p className="text-sm text-red-700 mb-4">
                As an administrator, you have elevated privileges. Use them responsibly.
              </p>
              <div className="space-y-2 text-sm text-red-600">
                <p>• Access to all user data and system settings</p>
                <p>• Ability to modify or delete any content</p>
                <p>• Full control over user accounts and permissions</p>
                <p>• Access to sensitive system information</p>
              </div>
            </div>

            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <h3 className="text-md font-medium text-red-900 mb-2">Danger Zone</h3>
              <p className="text-sm text-red-700 mb-4">
                Critical administrative actions. These cannot be undone.
              </p>
              <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
                Delete Admin Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminView;