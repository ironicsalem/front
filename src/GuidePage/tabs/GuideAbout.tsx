import React from 'react';
import { Bookmark, Globe, Award, MapPin, Calendar } from 'lucide-react';

interface GuideAboutProps {
  guide: {
    userId: {
      name: string;
      bio?: string;
      createdAt: Date;
    };
    city: string;
    languages: string[];
    behavioralCertificate?: string;
    averageRating: number;
    createdAt: Date;
  };
  reviewCount: number;
}

const GuideAbout: React.FC<GuideAboutProps> = ({ guide, reviewCount }) => {
  const memberSince = new Date(guide.userId.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  const guideingSince = new Date(guide.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="space-y-8">
      {/* About Section */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          About {guide.userId.name}
        </h3>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 mb-6">
          <p className="text-gray-700 leading-relaxed text-lg">
            {guide.userId.bio || 
              `Welcome! I'm ${guide.userId.name}, your local guide in ${guide.city}. I'm passionate about sharing the beauty and culture of my city with visitors from around the world. Let me show you the hidden gems and must-see attractions that make ${guide.city} special!`
            }
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-amber-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">
            {guide.averageRating.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Average Rating</div>
        </div>
        <div className="bg-white border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {reviewCount}
          </div>
          <div className="text-sm text-gray-600">Reviews</div>
        </div>
        <div className="bg-white border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {guide.languages.length}
          </div>
          <div className="text-sm text-gray-600">Languages</div>
        </div>
        <div className="bg-white border border-purple-200 rounded-lg p-4 text-center">
          <MapPin className="w-6 h-6 text-purple-600 mx-auto mb-1" />
          <div className="text-sm text-gray-600 font-medium">{guide.city}</div>
        </div>
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Languages Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Globe className="w-5 h-5 text-blue-500 mr-2" />
            <h4 className="text-lg font-semibold text-gray-900">Languages Spoken</h4>
          </div>
          {guide.languages.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {guide.languages.map((language, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium border border-blue-200 hover:bg-blue-200 transition-colors"
                >
                  {language}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No languages specified</p>
          )}
        </div>

        {/* Certification Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Award className="w-5 h-5 text-green-500 mr-2" />
            <h4 className="text-lg font-semibold text-gray-900">Certification</h4>
          </div>
          {guide.behavioralCertificate ? (
            <a
              href={guide.behavioralCertificate}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors bg-green-50 p-3 rounded-lg border border-green-200 hover:bg-green-100"
            >
              <Bookmark className="w-5 h-5" />
              <span className="font-medium">View Behavioral Certificate</span>
            </a>
          ) : (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-gray-500 italic">No certificate provided</p>
            </div>
          )}
        </div>
      </div>

      {/* Experience & Membership */}
      <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg p-6 border border-amber-200">
        <div className="flex items-center mb-4">
          <Calendar className="w-5 h-5 text-amber-600 mr-2" />
          <h4 className="text-lg font-semibold text-gray-900">Experience</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <span className="font-medium text-gray-800">Member Since</span>
            </div>
            <p className="text-gray-700 ml-5">{memberSince}</p>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="font-medium text-gray-800">Guiding Since</span>
            </div>
            <p className="text-gray-700 ml-5">{guideingSince}</p>
          </div>
        </div>
      </div>

      {/* Location & Specialization */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <MapPin className="w-5 h-5 text-purple-500 mr-2" />
          <h4 className="text-lg font-semibold text-gray-900">Location & Specialization</h4>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
            <span className="font-medium text-gray-800">Primary Location</span>
            <span className="text-purple-700 font-semibold">{guide.city}</span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            This guide specializes in showing visitors around {guide.city}, providing local insights 
            and personalized experiences that showcase the best of what the city has to offer.
          </p>
        </div>
      </div>

      {/* Trust & Safety */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Trust & Safety</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-800">Verified Guide</div>
              <div className="text-sm text-gray-600">Identity verified</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-800">
                {guide.behavioralCertificate ? 'Certified' : 'Standard'}
              </div>
              <div className="text-sm text-gray-600">
                {guide.behavioralCertificate ? 'Background checked' : 'Basic verification'}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-800">Local Expert</div>
              <div className="text-sm text-gray-600">Area specialist</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideAbout;