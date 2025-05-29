import React, { useState } from 'react';
import { 
  Camera, 
  Heart, 
  Calendar,
  Search,
  Filter,
  Grid,
  List,
  Clock
} from 'lucide-react';
import { CenteredSpinner } from '../shared/LoadingSpinner';
import type { Post } from '../../types/Types';

interface GuidePostsProps {
  posts: Post[];
  loading: boolean;
  guideName: string;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'mostLiked';

interface FilterState {
  search: string;
  sortBy: SortOption;
  hasImages: 'all' | 'withImages' | 'textOnly';
}

const GuidePosts: React.FC<GuidePostsProps> = ({
  posts,
  loading,
  guideName
}) => {
  // View and filter state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sortBy: 'newest',
    hasImages: 'all'
  });

  // Filter and sort posts
  const filteredAndSortedPosts = React.useMemo(() => {
    const filtered = posts.filter(post => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!post.title.toLowerCase().includes(searchLower) &&
            !post.content?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Image filter
      if (filters.hasImages === 'withImages' && (!post.images || post.images.length === 0)) {
        return false;
      }
      if (filters.hasImages === 'textOnly' && post.images && post.images.length > 0) {
        return false;
      }

      return true;
    });

    // Sort posts
    return filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'mostLiked':
          return (b.likeCount || 0) - (a.likeCount || 0);
        default:
          return 0;
      }
    });
  }, [posts, filters]);

  // Get relative time
  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffWeeks === 1) return '1 week ago';
    if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
    if (diffMonths === 1) return '1 month ago';
    if (diffMonths < 12) return `${diffMonths} months ago`;
    return new Date(date).toLocaleDateString();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      sortBy: 'newest',
      hasImages: 'all'
    });
  };

  // Check if any filters are active
  const hasActiveFilters = filters.search || filters.sortBy !== 'newest' || filters.hasImages !== 'all';

  // Render post in grid view
  const renderGridPost = (post: Post) => (
    <div
      key={post._id}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200"
    >
      {/* Image Preview */}
      {post.images && post.images.length > 0 && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={post.images[0]}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          {post.images.length > 1 && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
              <Camera className="w-3 h-3 inline mr-1" />
              {post.images.length}
            </div>
          )}
        </div>
      )}
      
      <div className="p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {post.title}
        </h4>
        {post.content && (
          <p className="text-gray-700 mb-4 leading-relaxed line-clamp-3">
            {post.content}
          </p>
        )}
        
        {/* Post Meta */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Heart className="w-4 h-4" />
              <span>{post.likeCount || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{getRelativeTime(post.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render post in list view
  const renderListPost = (post: Post) => (
    <div
      key={post._id}
      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start space-x-4">
        {/* Thumbnail */}
        {post.images && post.images.length > 0 && (
          <div className="flex-shrink-0">
            <img
              src={post.images[0]}
              alt={post.title}
              className="w-20 h-20 object-cover rounded-lg"
            />
          </div>
        )}
        
        <div className="flex-1">
          <h4 className="text-xl font-semibold text-gray-900 mb-2">
            {post.title}
          </h4>
          {post.content && (
            <p className="text-gray-700 mb-3 leading-relaxed line-clamp-2">
              {post.content}
            </p>
          )}
          
          {/* Post Meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>{post.likeCount || 0} likes</span>
              </div>
              {post.images && post.images.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Camera className="w-4 h-4" />
                  <span>{post.images.length} photos</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{getRelativeTime(post.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Recent Posts</h3>
          <p className="text-sm text-gray-600 mt-1">
            {filteredAndSortedPosts.length} of {posts.length} posts by {guideName}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 w-64"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${
                viewMode === 'list' 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
              hasActiveFilters 
                ? 'bg-amber-100 border-amber-300 text-amber-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                {[filters.sortBy !== 'newest', filters.hasImages !== 'all'].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as SortOption }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="mostLiked">Most Liked</option>
              </select>
            </div>

            {/* Image Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
              <select
                value={filters.hasImages}
                onChange={(e) => setFilters(prev => ({ ...prev, hasImages: e.target.value as FilterState['hasImages'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="all">All Posts</option>
                <option value="withImages">With Photos</option>
                <option value="textOnly">Text Only</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-300">
              <button
                onClick={resetFilters}
                className="text-amber-600 hover:text-amber-700 text-sm font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Posts Content */}
      {loading ? (
        <CenteredSpinner text="Loading posts..." />
      ) : filteredAndSortedPosts.length === 0 ? (
        <div className="text-center py-12">
          {posts.length === 0 ? (
            <>
              <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Posts Yet</h4>
              <p className="text-gray-600">This guide hasn't shared any posts yet.</p>
            </>
          ) : (
            <>
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Posts Found</h4>
              <p className="text-gray-600 mb-4">No posts match your current filters.</p>
              <button
                onClick={resetFilters}
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                Clear filters to see all posts
              </button>
            </>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-6'
        }>
          {filteredAndSortedPosts.map(post => 
            viewMode === 'grid' ? renderGridPost(post) : renderListPost(post)
          )}
        </div>
      )}
    </div>
  );
};

export default GuidePosts;