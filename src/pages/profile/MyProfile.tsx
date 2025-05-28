import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BaseUser as User, Post } from '../../types/Types';
import UserService from '../../services/UserService';
import GuideService from '../../services/GuideService';
import AuthService from '../../services/AuthService';
import GuideView from './GuideView';
import AdminView from './AdminView';
import TouristView from './TouristView';
import { 
  User as UserIcon, 
  Camera,
  LogOut,
  Shield,
  MapPin,
  Star,
  CheckCircle,
  Upload,
  AlertCircle
} from 'lucide-react';

const MyProfile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showUploadHint, setShowUploadHint] = useState(false);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      
      // First try to verify the token
      try {
        await AuthService.verifyToken();
      } catch (tokenError) {
        console.error('Token verification failed:', tokenError);
        navigate('/signin');
        return;
      }

      // Then try to get current user - this might be a different endpoint
      try {
        const userData = await AuthService.getCurrentUser();
        setUser(userData);

        // Fetch posts if user is a guide
        if (userData.role === 'guide') {
          try {
            const userPosts = await GuideService.getMyPosts();
            setPosts(userPosts);
          } catch (error) {
            console.error('Failed to fetch posts:', error);
          }
        }
      } catch (userError) {
        // If getCurrentUser fails, try getUserProfile as fallback
        console.warn('getCurrentUser failed, trying getUserProfile:', userError);
        try {
          const userData = await UserService.getUserProfile();
          setUser(userData);

          // Fetch posts if user is a guide
          if (userData.role === 'guide') {
            try {
              const userPosts = await GuideService.getMyPosts();
              setPosts(userPosts);
            } catch (error) {
              console.error('Failed to fetch posts:', error);
            }
          }
        } catch (profileError) {
          console.error('Both getCurrentUser and getUserProfile failed:', profileError);
          // Token might be invalid, amberirect to signin
          AuthService.signOut();
          navigate('/signin');
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      navigate('/signin');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    // Check if user is authenticated before fetching data
    if (!AuthService.isAuthenticated()) {
      navigate('/signin');
      return;
    }
    fetchUserData();
  }, [fetchUserData, navigate]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      try {
        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append('profilePicture', file);
        
        const response = await UserService.uploadProfilePicture(formData);
        setUser((prev: User | null) => prev ? { ...prev, profilePicture: response.profilePicture } : null);
        
        // Show success feedback
        setShowUploadHint(false);
      } catch (error) {
        console.error('Error uploading photo:', error);
        alert('Failed to upload photo. Please try again.');
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
      navigate('/signin');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-amber-500" />;
      case 'guide':
        return <MapPin className="w-4 h-4 text-green-500" />;
      default:
        return <Star className="w-4 h-4 text-amber-500" />;
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-200 border-t-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Profile</h2>
          <p className="text-gray-600 mb-6">
            {AuthService.isAuthenticated() 
              ? "There was an error loading your profile data. This might be due to a server issue or invalid authentication."
              : "You need to be signed in to view your profile."
            }
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
            >
              <span>Retry</span>
            </button>
            <button
              onClick={() => navigate('/signin')}
              className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 font-medium shadow-lg"
            >
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const commonProps = {
    user,
    setUser,
    onPhotoUpload: handlePhotoUpload,
    uploadingPhoto,
    onSignOut: handleSignOut,
    navigate
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header with Cover Design */}
        <div className="relative bg-amber-500 rounded-3xl shadow-2xl overflow-hidden mb-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-y-1"></div>
          </div>
          
          <div className="relative p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
              {/* Profile Picture Section */}
              <div className="relative group">
                <div 
                  className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center overflow-hidden shadow-2xl transition-all duration-300 group-hover:scale-105"
                  onMouseEnter={() => setShowUploadHint(true)}
                  onMouseLeave={() => setShowUploadHint(false)}
                >
                  {user.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-16 h-16 text-white/70" />
                  )}
                  
                  {/* Upload Overlay */}
                  <div className={`absolute inset-0 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 ${
                    showUploadHint || uploadingPhoto ? 'opacity-100' : 'opacity-0'
                  }`}>
                    {uploadingPhoto ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-3 border-white border-t-transparent"></div>
                    ) : (
                      <Upload className="w-8 h-8 text-white" />
                    )}
                  </div>
                </div>

                {/* Camera Button */}
                <label className="absolute -bottom-2 -right-2 bg-white text-amber-600 p-3 rounded-full cursor-pointer hover:bg-amber-50 transition-all duration-200 shadow-lg border-2 border-amber-100 group-hover:scale-110">
                  <Camera className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                </label>
              </div>

              {/* User Info Section */}
              <div className="flex-1 text-white">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-2 drop-shadow-lg">
                      {user.name}
                    </h1>
                    
                    {/* Role Badge */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-sm bg-white/20 border-white/30`}>
                        {getRoleIcon(user.role)}
                        <span className="font-semibold capitalize text-white">
                          {user.role}
                        </span>
                      </div>
                      
                      {user.verified && (
                        <div className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-300/30">
                          <CheckCircle className="w-4 h-4 text-green-200" />
                          <span className="text-green-200 text-sm font-medium">Verified</span>
                        </div>
                      )}
                    </div>
                    
                    {user.bio && (
                      <p className="text-white/90 text-lg leading-relaxed max-w-2xl backdrop-blur-sm bg-white/10 rounded-2xl p-4 border border-white/20">
                        {user.bio}
                      </p>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleSignOut}
                      className="group flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl hover:bg-amber-500/80 transition-all duration-300 border border-white/20 hover:border-amber-400/50 shadow-lg hover:shadow-amber-500/25 transform hover:scale-105"
                    >
                      <LogOut className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Role-specific content with enhanced styling */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100">
          {user.role === 'guide' && (
            <GuideView {...commonProps} posts={posts} setPosts={setPosts} />
          )}
          {user.role === 'admin' && (
            <AdminView {...commonProps} />
          )}
          {user.role === 'tourist' && (
            <TouristView {...commonProps} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
