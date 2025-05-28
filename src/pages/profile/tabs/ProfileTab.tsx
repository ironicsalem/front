import React, { useState } from 'react';
import { BaseUser as User } from '../../../types/Types';
import UserService from '../../../services/UserService';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Edit3, 
  Save, 
  X, 
  Calendar
} from 'lucide-react';

interface ProfileTabProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ user, setUser }) => {
  const [editing, setEditing] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    bio: user.bio || ''
  });

  const handleSaveProfile = async () => {
    try {
      const updatedUser = await UserService.updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio
      });
      setUser(updatedUser);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      bio: user.bio || ''
    });
    setEditing(false);
  };

  // Get the appropriate member since label based on user role
  const getMemberSinceLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin Since';
      case 'guide':
        return 'Guide Since';
      default:
        return 'Member Since';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
        <button
          onClick={() => editing ? handleCancel() : setEditing(true)}
          className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            editing 
              ? 'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100'
              : 'text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100'
          }`}
        >
          {editing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          <span>{editing ? 'Cancel' : 'Edit Profile'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          {editing ? (
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your full name"
            />
          ) : (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <UserIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">{user.name}</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          {editing ? (
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your email"
            />
          ) : (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900 break-all">{user.email}</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          {editing ? (
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your phone number"
            />
          ) : (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900">{user.phone || 'Not provided'}</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">{getMemberSinceLabel(user.role)}</label>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-gray-900">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</span>
          </div>
        </div>

        {/* Bio field - spans full width */}
        <div className="lg:col-span-2 space-y-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          {editing ? (
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none transition-all duration-200"
              placeholder="Tell us about yourself..."
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg min-h-[80px]">
              <span className="text-gray-900">{user.bio || 'No bio provided'}</span>
            </div>
          )}
        </div>
      </div>

      {editing && (
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-6 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveProfile}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all duration-200 font-medium"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileTab;