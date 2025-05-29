import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import StarRating from './StarRating';
import { InlineSpinner } from './LoadingSpinner';
import type { PopulatedReview } from '../../types/Types';

interface ReviewFormData {
  rating: number;
  content: string;
  images: File[];
}

interface ReviewFormProps {
  guideId: string;
  existingReview?: PopulatedReview | null;
  isEditing?: boolean;
  onSubmit: (data: ReviewFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  existingReview,
  isEditing = false,
  onSubmit,
  onCancel,
  loading = false,
  error,
  className = ''
}) => {
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 0,
    content: '',
    images: []
  });

  const [formErrors, setFormErrors] = useState<{
    rating?: string;
    content?: string;
  }>({});

  // Initialize form with existing review data if editing
  useEffect(() => {
    if (isEditing && existingReview) {
      setFormData({
        rating: existingReview.rating || 0,
        content: existingReview.content || '',
        images: [] // Don't pre-populate images for editing
      });
    } else {
      setFormData({
        rating: 0,
        content: '',
        images: []
      });
    }
  }, [isEditing, existingReview]);

  const validateForm = (): boolean => {
    const errors: { rating?: string; content?: string } = {};
    let isValid = true;

    // Validate rating
    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      errors.rating = 'Please select a rating between 1 and 5';
      isValid = false;
    }

    // Validate content
    if (!formData.content || !formData.content.trim()) {
      errors.content = 'Please provide review content';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, content: value }));

    // Clear error when user starts typing
    if (formErrors.content) {
      setFormErrors(prev => ({ ...prev, content: undefined }));
    }
  };

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));

    // Clear error when user selects rating
    if (formErrors.rating) {
      setFormErrors(prev => ({ ...prev, rating: undefined }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files).slice(0, 4); // Max 4 images
      setFormData(prev => ({ ...prev, images: fileArray }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit({
        ...formData,
        content: formData.content.trim()
      });
    } catch (err) {
      // Error handling is managed by parent component
      console.error('Form submission error:', err);
    }
  };

  const handleCancel = () => {
    // Reset form
    if (isEditing && existingReview) {
      setFormData({
        rating: existingReview.rating || 0,
        content: existingReview.content || '',
        images: []
      });
    } else {
      setFormData({
        rating: 0,
        content: '',
        images: []
      });
    }
    setFormErrors({});
    onCancel();
  };

  return (
    <div className={`bg-amber-50 rounded-xl p-6 ${className}`}>
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        {isEditing ? 'Edit Your Review' : 'Share your experience'}
      </h3>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Rating
          </label>
          <StarRating
            rating={formData.rating}
            interactive
            onChange={handleRatingChange}
            className="mb-1"
          />
          {formErrors.rating && (
            <p className="mt-1 text-sm text-red-600">{formErrors.rating}</p>
          )}
        </div>

        {/* Content Section */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review
          </label>
          <textarea
            id="content"
            name="content"
            rows={4}
            value={formData.content}
            onChange={handleContentChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-amber-500 focus:border-amber-500 resize-none ${
              formErrors.content ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Share your experience with this guide..."
            disabled={loading}
          />
          {formErrors.content && (
            <p className="mt-1 text-sm text-red-600">{formErrors.content}</p>
          )}
        </div>

        {/* Image Upload Section - Only for new reviews */}
        {!isEditing && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images (max 4)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              disabled={loading}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 disabled:opacity-50"
            />
            {formData.images.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {formData.images.length} file(s) selected
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 disabled:bg-amber-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <InlineSpinner color="white" />
                <span className="ml-2">
                  {isEditing ? 'Updating...' : 'Submitting...'}
                </span>
              </span>
            ) : (
              <span className="flex items-center justify-center">
                {isEditing && <Save className="w-4 h-4 mr-2" />}
                {isEditing ? 'Update Review' : 'Submit Review'}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50"
          >
            <span className="flex items-center justify-center">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;