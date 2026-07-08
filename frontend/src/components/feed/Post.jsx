// frontend/src/components/feed/Post.jsx
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { postService } from '../../services/post';
import { formatDistanceToNow } from 'date-fns';
import { 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  ShareIcon,
  EllipsisHorizontalIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const Post = ({ post, onUpdate }) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isAuthor = post.authorId === user?.id;

  const handleLike = async () => {
    try {
      const response = await postService.toggleLike(post.id);
      if (response.data.success) {
        setLiked(response.data.isLiked);
        setLikesCount(response.data.likesCount);
      }
    } catch (error) {
      console.error('Like error:', error);
      toast.error('Failed to like post');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const response = await postService.addComment(post.id, commentText);
      if (response.data.success) {
        setComments([...comments, response.data.comment]);
        setCommentText('');
        toast.success('Comment added');
      }
    } catch (error) {
      console.error('Comment error:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await postService.deletePost(post.id);
      if (response.data.success) {
        toast.success('Post deleted');
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete post');
    }
  };

  const renderMedia = (media) => {
    if (!media || media.length === 0) return null;

    const handleImageError = (e) => {
      console.error('Image failed to load:', e.target.src);
      e.target.onerror = null;
      e.target.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\' viewBox=\'0 0 400 300\'%3E%3Crect width=\'400\' height=\'300\' fill=\'%23f0f0f0\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'system-ui\' font-size=\'16\' fill=\'%23999\'%3EImage not found%3C/text%3E%3C/svg%3E';
    };

    const openInNewTab = (url) => {
      if (!url) return;
      
      if (url.startsWith('http')) {
        window.open(url, '_blank');
      } else {
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const fullUrl = `${baseUrl}${url.startsWith('/') ? url : '/' + url}`;
        window.open(fullUrl, '_blank');
      }
    };

    return (
      <div className={`mt-3 grid gap-2 ${media.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {media.map((item, index) => {
          let imageUrl = item.url;
          if (imageUrl && !imageUrl.startsWith('http')) {
            const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;
          }

          return (
            <div key={index} className="relative rounded-lg overflow-hidden">
              {item.type === 'image' ? (
                <img
                  src={imageUrl}
                  alt={`Post media ${index + 1}`}
                  className="w-full h-auto max-h-96 object-contain bg-black/5 cursor-pointer"
                  onClick={() => openInNewTab(item.url)}
                  onError={handleImageError}
                  loading="lazy"
                />
              ) : (
                <video
                  src={imageUrl}
                  controls
                  className="w-full h-auto max-h-96"
                  poster={item.thumbnail}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.author?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.fullName || post.author?.username)}&background=2563eb&color=fff&size=40`}
            alt={post.author?.fullName}
            className="h-10 w-10 rounded-full"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {post.author?.fullName || post.author?.username}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        
        {isAuthor && (
          <div className="relative">
            <button
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500" />
            </button>
            
            {showDeleteConfirm && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      {post.content && (
        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-3">
          {post.content}
        </p>
      )}

      {/* Media */}
      {renderMedia(post.media)}

      {/* Post Stats */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLike}
            className="flex items-center space-x-2 text-gray-500 hover:text-red-500 dark:text-gray-400"
          >
            {liked ? (
              <HeartIconSolid className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5" />
            )}
            <span>{likesCount}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 dark:text-gray-400"
          >
            <ChatBubbleLeftIcon className="h-5 w-5" />
            <span>{comments.length}</span>
          </button>
          
          <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 dark:text-gray-400">
            <ShareIcon className="h-5 w-5" />
            <span>{post.shares || 0}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          {/* Comments List */}
          {comments.length > 0 && (
            <div className="space-y-3 mb-4">
              {comments.map(comment => (
                <div key={comment.id} className="flex items-start space-x-2">
                  <img
                    src={comment.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.authorName)}&background=2563eb&color=fff&size=24`}
                    alt={comment.authorName}
                    className="h-6 w-6 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {comment.authorName}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {comment.content}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment */}
          <form onSubmit={handleAddComment} className="flex space-x-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Post;