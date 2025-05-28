import React, { useState } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { BaseUser as User, Post } from '../../types/Types';
import ProfileTab from './tabs/ProfileTab';
import SettingsTab from './tabs/SettingsTab';
import PostsTab from './tabs/PostsTab';
import TripsTab from './tabs/TripsTab';
import BookingsTab from './tabs/BookingsTab';
import { 
  User as UserIcon, 
  ImageIcon,
  MapPin,
  Settings,
  Calendar
} from 'lucide-react';

interface GuideViewProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingPhoto: boolean;
  onSignOut: () => void;
  navigate: NavigateFunction;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}

const GuideView: React.FC<GuideViewProps> = ({ 
  user, 
  setUser, 
  navigate, 
  posts, 
  setPosts 
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'posts' | 'trips' | 'bookings' | 'settings'>('profile');

  const tabs = [
    {
      id: 'profile' as const,
      label: 'Profile',
      icon: UserIcon
    },
    {
      id: 'posts' as const,
      label: 'My Posts',
      icon: ImageIcon
    },
    {
      id: 'trips' as const,
      label: 'My Trips',
      icon: MapPin
    },
    {
      id: 'bookings' as const,
      label: 'Bookings',
      icon: Calendar
    },
    {
      id: 'settings' as const,
      label: 'Settings',
      icon: Settings
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab user={user} setUser={setUser} />;
      case 'posts':
        return <PostsTab user={user} posts={posts} setPosts={setPosts} />;
      case 'trips':
        return <TripsTab user={user} navigate={navigate} />;
      case 'bookings':
        return <BookingsTab navigate={navigate} />;
      case 'settings':
        return <SettingsTab user={user} navigate={navigate} />;
      default:
        return <ProfileTab user={user} setUser={setUser} />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
      {/* Enhanced Tab Navigation */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <nav className="flex overflow-x-auto px-4 sm:px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-3 sm:px-4 border-b-2 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-600 bg-amber-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-white/50'
                } ${tab.id !== 'profile' ? 'ml-4 sm:ml-8' : ''}`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default GuideView;