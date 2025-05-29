import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, User as UserIcon, Edit2, Trash2 } from 'lucide-react';
import StarRating from '../shared/StarRating';
import { CenteredSpinner } from '../shared/LoadingSpinner';
import ReviewForm from '../shared/ReviewForm';
import ReviewService, { CreateReviewData } from '../../../services/ReviewService';
import type { PopulatedReview, BaseUser } from '../../../types/Types';

interface GuideReviewsProps {
  guideId: string;
  guide: {
    averageRating: number;
  };
  reviews: PopulatedReview[];
  currentUser: BaseUser | null;
  userReview: PopulatedReview | null;
  loading: boolean;
  onReviewsUpdate: (reviews: PopulatedReview[]) => void;
  onUserReviewUpdate: (review: PopulatedReview | null) => void;
}

interface LoadingStates {
  submitReview: boolean;
  updateReview: boolean;
  deleteReview: boolean;
}

const GuideReviews: React.FC<GuideReviewsProps> = ({
  guideId,
  guide,
  reviews,
  currentUser,
  userReview,
  loading,
  onReviewsUpdate,
  onUserReviewUpdate
}) => {
  const navigate = useNavigate();
  
  // Local state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [localLoading, setLocalLoading] = useState<LoadingStates>({
    submitReview: false,
    updateReview: false,
    deleteReview: false
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Handle creating a new review
  const handleCreateReview = async (formData: { rating: number; content: string; images: File[] }) => {
    if (!currentUser) {
      setSubmitError('Please log in to submit a review');
      return;
    }

    setLocalLoading(prev => ({ ...prev, submitReview: true }));
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const reviewData: CreateReviewData = {
        content: formData.content,
        rating: formData.rating,
        guideId: guideId,
        images: formData.images
      };

      const newReview = await ReviewService.createReview(reviewData);
      
      // Update reviews list and user review
      onReviewsUpdate([newReview, ...reviews]);
      onUserReviewUpdate(newReview);
      
      // Hide form and show success
      setShowReviewForm(false);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);
      
    } catch (err) {
      console.error('Error submitting review:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit review. Please try again.');
    } finally {
      setLocalLoading(prev => ({ ...prev, submitReview: false }));
    }
  };

  // Handle updating existing review
  const handleUpdateReview = async (formData: { rating: number; content: string; images: File[] }) => {
    if (!userReview) return;

    setLocalLoading(prev => ({ ...prev, updateReview: true }));
    setSubmitError('');

    try {
      const updateData = {
        content: formData.content,
        rating: formData.rating
      };

      const updatedReview = await ReviewService.updateReview(userReview._id, updateData);

      // Update reviews list and user review
      const updatedReviews = reviews.map(review => 
        review._id === userReview._id ? updatedReview : review
      );
      onReviewsUpdate(updatedReviews);
      onUserReviewUpdate(updatedReview);
      
      setEditingReview(false);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);

    } catch (err) {
      console.error('Error updating review:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to update review. Please try again.');
    } finally {
      setLocalLoading(prev => ({ ...prev, updateReview: false }));
    }
  };

  // Handle deleting user's review
  const handleDeleteReview = async () => {
    if (!userReview) return;

    setLocalLoading(prev => ({ ...prev, deleteReview: true }));
    setSubmitError('');

    try {
      await ReviewService.deleteReview(userReview._id);

      // Remove review from lists
      const updatedReviews = reviews.filter(review => review._id !== userReview._id);
      onReviewsUpdate(updatedReviews);
      onUserReviewUpdate(null);
      
      setShowDeleteConfirm(false);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);

    } catch (err) {
      console.error('Error deleting review:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to delete review. Please try again.');
    } finally {
      setLocalLoading(prev => ({ ...prev, deleteReview: false }));
    }
  };

  // Handle canceling form operations
  const handleCancelForm = () => {
    setShowReviewForm(false);
    setEditingReview(false);
    setShowDeleteConfirm(false);
    setSubmitError('');
  };

  // Filter out user's review from the general reviews list
  const otherReviews = reviews.filter(review => 
    !userReview || review._id !== userReview._id
  );

  return (
    <div className="space-y-6">
      {/* Header with Rating Summary */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Client Reviews</h3>
        <div className="flex items-center space-x-2">
          <StarRating rating={guide.averageRating} showValue />
          <span className="text-sm text-gray-600 ml-2">
            ({reviews.length} reviews)
          </span>
        </div>
      </div>

      {/* Success/Error Messages */}
      {submitSuccess && (
        <div className="p-4 bg-green-100 border border-green-200 rounded-lg text-green-700">
          {userReview && !showDeleteConfirm ? 'Review updated successfully!' : 
           !userReview ? 'Review deleted successfully!' :
           'Thank you for your review! It has been submitted successfully.'}
        </div>
      )}
      
      {submitError && (
        <div className="p-4 bg-red-100 border border-red-200 rounded-lg text-red-700">
          {submitError}
        </div>
      )}

      {/* User's Review Section */}
      {currentUser && userReview && !editingReview && !showDeleteConfirm && (
        <div className="bg-blue-50 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Your Review</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setEditingReview(true)}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors px-3 py-1 rounded-lg hover:bg-blue-100"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors px-3 py-1 rounded-lg hover:bg-red-100"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2 mb-3">
            <StarRating rating={userReview.rating} />
            <span className="text-sm text-gray-600">
              {new Date(userReview.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-700">{userReview.content}</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {currentUser && userReview && showDeleteConfirm && (
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <div className="flex items-start space-x-4">
            <div className="bg-red-100 rounded-full p-3">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Delete Your Review</h3>
              <p className="text-red-700 mb-4">
                Are you sure you want to delete your review? This action cannot be undone.
              </p>
              
              {/* Current review preview */}
              <div className="bg-white rounded-lg p-4 mb-4 border border-red-200">
                <div className="flex items-center space-x-2 mb-2">
                  <StarRating rating={userReview.rating} />
                  <span className="text-sm text-gray-600">
                    {new Date(userReview.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 italic">"{userReview.content}"</p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleDeleteReview}
                  disabled={localLoading.deleteReview}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-all duration-200 font-medium disabled:bg-red-400 disabled:cursor-not-allowed"
                >
                  {localLoading.deleteReview ? (
                    <span className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Deleting...
                    </span>
                  ) : (
                    'Yes, Delete Review'
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={localLoading.deleteReview}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-all duration-200 font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Form (for new review or editing) */}
      {currentUser && (showReviewForm || editingReview) && !showDeleteConfirm && (
        <ReviewForm
          guideId={guideId}
          existingReview={userReview}
          isEditing={editingReview}
          onSubmit={editingReview ? handleUpdateReview : handleCreateReview}
          onCancel={handleCancelForm}
          loading={localLoading.submitReview || localLoading.updateReview}
          error={submitError}
        />
      )}

      {/* Write Review Button (only show if user is logged in and hasn't reviewed yet) */}
      {currentUser && !userReview && !showReviewForm && (
        <div>
          <button
            onClick={() => setShowReviewForm(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium"
          >
            Write a Review
          </button>
        </div>
      )}

      {/* Login Prompt for Non-authenticated Users */}
      {!currentUser && (
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <p className="text-gray-600 mb-4">Please log in to write a review</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium"
          >
            Log In
          </button>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <CenteredSpinner text="Loading reviews..." />
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h4>
          <p className="text-gray-600">Be the first to leave a review!</p>
        </div>
      ) : otherReviews.length === 0 && userReview ? (
        <div className="text-center py-8">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No other reviews yet. You were the first!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          <h4 className="text-lg font-semibold text-gray-900">
            Other Reviews ({otherReviews.length})
          </h4>
          {otherReviews.map((review) => (
            <div
              key={review._id}
              className="border border-gray-200 rounded-xl p-6 bg-gradient-to-r from-white to-amber-50"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-amber-100 rounded-full p-3 flex-shrink-0">
                  {review.author.profilePicture ? (
                    <img
                      src={review.author.profilePicture}
                      alt={review.author.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-6 h-6 text-amber-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-medium text-gray-900">{review.author.name}</span>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-3">{review.content}</p>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuideReviews;