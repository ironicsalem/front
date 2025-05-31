import React from 'react';
import { MapPin, Star, MessageCircle, Award, Clock } from 'lucide-react';
import { PopulatedGuide } from '../types/Types';

interface GuideCardProps {
  guide: PopulatedGuide;
  onClick: (guideId: string) => void;
  className?: string;
}

const GuideCard: React.FC<GuideCardProps> = ({ guide, onClick, className = '' }) => {
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>): void => {
    const target = event.target as HTMLImageElement;
    target.src = '/NoPic.jpg';
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= fullStars 
                ? 'text-amber-400 fill-amber-400' 
                : star === fullStars + 1 && hasHalfStar
                ? 'text-amber-400 fill-amber-400/50'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm font-medium text-gray-600 ml-2">
          {rating > 0 ? rating.toFixed(1) : 'New'}
        </span>
      </div>
    );
  };

  const getPrimaryLanguages = (languages: string[], maxCount: number = 2) => {
    return languages.slice(0, maxCount);
  };

  const getExperienceLevel = (rating: number, reviewCount?: number) => {
    if (!reviewCount || reviewCount === 0) return 'New Guide';
    if (rating >= 4.5 && reviewCount >= 50) return 'Expert Guide';
    if (rating >= 4.0 && reviewCount >= 20) return 'Experienced';
    return 'Guide';
  };

  const formatResponseTime = () => {
    // This would come from your API in real implementation
    const responseOptions = ['Usually responds within 1 hour', 'Usually responds within 2 hours', 'Usually responds within 4 hours'];
    return responseOptions[Math.floor(Math.random() * responseOptions.length)];
  };

  return (
    <div 
      className={`group relative bg-gradient-to-br from-white to-gray-50/30 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100/50 hover:border-amber-200/60 cursor-pointer transform hover:-translate-y-2 ${className}`}
      onClick={() => onClick(guide._id)}
    >
      {/* Premium Badge */}
      {(guide.averageRating || 0) >= 4.5 && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 shadow-lg">
            <Award className="w-3 h-3" />
            <span>Premium</span>
          </div>
        </div>
      )}

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/20 via-transparent to-orange-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative p-6">
        {/* Header Section */}
        <div className="flex items-start space-x-4 mb-6">
          <div className="relative">
            <img
              src={guide.userId?.profilePicture || '/NoPic.jpg'}
              alt={guide.userId?.name || 'Guide'}
              className="w-20 h-20 rounded-2xl object-cover border-3 border-white shadow-xl group-hover:shadow-amber-200/50 transition-all duration-300 group-hover:scale-105"
              onError={handleImageError}
            />
            {/* Online Status Indicator */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-3 border-white rounded-full shadow-lg"></div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors duration-300 truncate">
                  {guide.userId?.name || 'Guide Name'}
                </h3>
                <p className="text-sm text-amber-600 font-medium">
                  {getExperienceLevel(guide.averageRating || 0)}
                </p>
              </div>
            </div>
            
            {/* Rating */}
            <div className="mb-3">
              {renderStars(guide.averageRating || 0)}
            </div>

            {/* Location */}
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-sm font-medium">{guide.city}</span>
            </div>
          </div>
        </div>

        {/* Languages Section */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {getPrimaryLanguages(guide.languages || []).map((lang: string, i: number) => (
              <span 
                key={i} 
                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-sm font-medium rounded-xl border border-blue-100/50 shadow-sm"
              >
                {lang}
              </span>
            ))}
            {(guide.languages?.length || 0) > 2 && (
              <span className="inline-flex items-center px-3 py-1.5 bg-gray-50 text-gray-600 text-sm font-medium rounded-xl border border-gray-200/50">
                +{(guide.languages?.length || 0) - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Quick Info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <MessageCircle className="w-4 h-4 mr-3 text-gray-400" />
            <span>{formatResponseTime()}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-3 text-gray-400" />
            <span>Available today</span>
          </div>
        </div>

        {/* Action Button */}
        <button 
          type="button"
          className="w-full relative overflow-hidden bg-gradient-to-r from-amber-500 via-amber-500 to-orange-500 hover:from-amber-600 hover:via-amber-600 hover:to-orange-600 text-white py-3.5 px-6 rounded-2xl transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform group-hover:scale-105 group-hover:shadow-amber-500/25"
        >
          <span className="relative z-10">View Profile & Book</span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 transform translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
        </button>

      </div>

      {/* Hover Effects */}
      <div className="absolute inset-0 ring-2 ring-transparent group-hover:ring-amber-500/30 rounded-3xl transition-all duration-300"></div>
    </div>
  );
};

export default GuideCard;