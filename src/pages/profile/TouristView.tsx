import React, { useState } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { BaseUser as User } from '../../types/Types';
import ProfileTab from './tabs/ProfileTab';
import SettingsTab from './tabs/SettingsTab';
import BookingsTab from './tabs/BookingsTab';
import BecomeGuideTab from './tabs/BecomeGuideTab';
import { 
  User as UserIcon, 
  Settings,
  Calendar,
  UserCheck
} from 'lucide-react';

interface TouristViewProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingPhoto: boolean;
  onSignOut: () => void;
  navigate: NavigateFunction;
}

const TouristView: React.FC<TouristViewProps> = ({ 
  user, 
  setUser, 
  navigate 
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'activity' | 'bookings' | 'become-guide' | 'settings'>('profile');

  const tabs = [
    {
      id: 'profile' as const,
      label: 'Profile',
      icon: UserIcon
    },
    {
      id: 'bookings' as const,
      label: 'My Bookings',
      icon: Calendar
    },
    {
      id: 'become-guide' as const,
      label: 'Become a Guide',
      icon: UserCheck
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
      case 'bookings':
        return <BookingsTab navigate={navigate} />;
      case 'become-guide':
        return <BecomeGuideTab />;
      case 'settings':
        return <SettingsTab user={user} navigate={navigate} />;
      default:
        return <ProfileTab user={user} setUser={setUser} />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
      {/* Enhanced Tab Navigation */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
        <nav className="flex overflow-x-auto px-4 sm:px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-3 sm:px-4 border-b-2 font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50/50'
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

export default TouristView;