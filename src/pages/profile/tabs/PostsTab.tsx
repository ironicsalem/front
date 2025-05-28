import React, { useState } from 'react';
import { BaseUser as User, Post } from '../../../types/Types';
import GuideService from '../../../services/GuideService';
import { 
  Camera,
  Send,
  Trash2,
  Image as ImageIcon,
  Heart,
  MessageCircle,
  Eye,
  TrendingUp
} from 'lucide-react';

interface PostsTabProps {
  user: User;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}

const PostsTab: React.FC<PostsTabProps> = ({ user, posts, setPosts }) => {
  // Post creation states
  const [postData, setPostData] = useState({
    title: '',
    content: ''
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [creatingPost, setCreatingPost] = useState(false);

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await GuideService.deletePost(postId);
        setPosts(prev => prev.filter(post => post._id !== postId));
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post');
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages(prev => [...prev, ...files].slice(0, 5)); // Max 5 images
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postData.title.trim() || !postData.content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setCreatingPost(true);
    try {
      const newPostResponse = await GuideService.createPost({
        title: postData.title,
        content: postData.content,
        images: selectedImages
      });
      
      // Convert PostResponse to Post format
      const newPost: Post = {
        _id: newPostResponse._id,
        title: newPostResponse.title,
        content: newPostResponse.content,
        images: newPostResponse.images || [],
        createdAt: newPostResponse.createdAt,
        updatedAt: newPostResponse.createdAt,
        author: user._id,
        likeCount: 0
      };
      
      setPosts(prev => [newPost, ...prev]);
      setPostData({ title: '', content: '' });
      setSelectedImages([]);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    } finally {
      setCreatingPost(false);
    }
  };

  const getTotalEngagement = () => {
    return posts.reduce((total, post) => total + (post.likeCount || 0), 0);
  };

  const formatDate = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return diffInHours === 0 ? 'Just now' : `${diffInHours}h ago`;
    } else if (diffInHours < 168) { // Less than a week
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Share Your Experience</h2>
          <p className="text-gray-600 mt-1">Connect with travelers by sharing your local insights and experiences</p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-4">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 rounded-xl border border-amber-200">
            <div className="text-center">
              <div className="text-xl font-bold text-amber-600">{posts.length}</div>
              <div className="text-xs text-amber-700">Posts</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-pink-50 px-4 py-3 rounded-xl border border-red-200">
            <div className="text-center">
              <div className="text-xl font-bold text-red-600">{getTotalEngagement()}</div>
              <div className="text-xs text-red-700">Total Likes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Creation Form */}
      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl p-6 border border-amber-200 shadow-sm">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Create a New Post</h3>
            <p className="text-sm text-gray-600">Share your travel experiences and local insights</p>
          </div>
        </div>

        <form onSubmit={handleCreatePost} className="space-y-5">
          <div>
            <input
              type="text"
              value={postData.title}
              onChange={(e) => setPostData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white shadow-sm text-lg font-medium placeholder-gray-400"
              placeholder="What's your story about? (e.g., 'Hidden Gems in Amman')"
              required
            />
          </div>
          
          <div>
            <textarea
              value={postData.content}
              onChange={(e) => setPostData(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
              className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none bg-white shadow-sm placeholder-gray-400"
              placeholder="Share your travel tips, favorite spots, or memorable experiences... What makes this place special?"
              required
            />
          </div>

          {/* Image Upload Section */}
          <div className="space-y-3">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="flex items-center justify-center w-full p-6 border-2 border-dashed border-amber-300 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-all duration-200 bg-white/70 group"
            >
              <div className="text-center">
                <Camera className="w-8 h-8 text-amber-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700">Add photos to your story</span>
                <p className="text-xs text-gray-500 mt-1">Upload up to 5 images (JPG, PNG)</p>
              </div>
            </label>
            
            {selectedImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {selectedImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={creatingPost}
              className="flex items-center space-x-3 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {creatingPost ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              <span>{creatingPost ? 'Publishing...' : 'Share Post'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
          <div className="text-gray-400 mb-6">
            <ImageIcon className="w-20 h-20 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No posts yet</h3>
          <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
            Start sharing your local knowledge and travel experiences with the community!
          </p>
          <div className="flex items-center justify-center space-x-2 text-amber-600">
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">Use the form above to create your first post</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Your Posts ({posts.length})</h3>
            <div className="text-sm text-gray-500">
              Sorted by most recent
            </div>
          </div>
          
          <div className="grid gap-6">
            {posts.map((post) => (
              <div key={post._id} className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:border-amber-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-amber-600 transition-colors">
                      {post.title}
                    </h4>
                    <p className="text-gray-700 mb-5 leading-relaxed text-base">
                      {post.content}
                    </p>
                    
                    {/* Display post images */}
                    {post.images && post.images.length > 0 && (
                      <div className="mb-5">
                        <div className={`grid gap-3 ${
                          post.images.length === 1 ? 'grid-cols-1 max-w-md' :
                          post.images.length === 2 ? 'grid-cols-2' :
                          'grid-cols-2 sm:grid-cols-3'
                        }`}>
                          {post.images.slice(0, 6).map((image, index) => (
                            <div key={index} className="relative overflow-hidden rounded-xl group/image">
                              <img
                                src={image}
                                alt={`Post image ${index + 1}`}
                                className="w-full h-40 sm:h-48 object-cover transition-transform duration-300 group-hover/image:scale-105"
                              />
                              {index === 5 && post.images.length > 6 && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl">
                                  <span className="text-white font-bold text-xl">
                                    +{post.images.length - 6}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Post Stats */}
                    <div className="flex flex-wrap items-center gap-6 text-sm">
                      <div className="flex items-center space-x-2 text-red-500">
                        <Heart className="w-4 h-4 fill-current" />
                        <span className="font-semibold">{post.likeCount || 0}</span>
                        <span className="text-gray-500">likes</span>
                      </div>
                      <div className="flex items-center space-x-2 text-blue-500">
                        <MessageCircle className="w-4 h-4" />
                        <span className="font-semibold">0</span>
                        <span className="text-gray-500">comments</span>
                      </div>
                      <div className="flex items-center space-x-2 text-green-500">
                        <Eye className="w-4 h-4" />
                        <span className="font-semibold">--</span>
                        <span className="text-gray-500">views</span>
                      </div>
                      <div className="text-gray-400 ml-auto">
                        {formatDate(post.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className="text-red-400 hover:text-red-600 p-3 rounded-xl hover:bg-red-50 transition-all duration-200 ml-4 opacity-0 group-hover:opacity-100"
                    title="Delete post"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostsTab;