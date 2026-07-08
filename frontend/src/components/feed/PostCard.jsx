import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  HeartIcon, 
  ChatBubbleOvalLeftIcon,
  ShareIcon,
  EllipsisHorizontalIcon 
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '../../hooks/useAuth';
import { postService } from '../../services/post';
import CommentSection from './CommentSection';
import toast from 'react-hot-toast';

const PostCard = ({ post, onUpdate }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showComments, setShowComments] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const { user } = useAuth();

  // ✅ Use post.id instead of post._id
  const isOwnPost = user?.id === post.authorId || user?.id === post.createdBy?.id;

  const handleLike = async () => {
    try {
      const res = await postService.likePost(post.id); // ✅ Use post.id
      setIsLiked(res.data.isLiked);
      setLikesCount(res.data.likesCount);
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await postService.deletePost(post.id); // ✅ Use post.id
      toast.success('Post deleted successfully');
      onUpdate();
    } catch (error) {
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  // Safely access author data
  const author = post.author || post.createdBy || {};
  const authorId = author.id || author._id;
  const authorName = author.fullName || author.username || 'Anonymous';
  const authorProfilePic = author.profilePicture || 'default-avatar.png';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Post Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to={`/profile/${authorId}`}>
            <img
              src={authorProfilePic}
              alt={authorName}
              className="h-10 w-10 rounded-full object-cover"
            />
          </Link>
          <div>
            <Link
              to={`/profile/${authorId}`}
              className="font-semibold text-gray-900 dark:text-white hover:underline"
            >
              {authorName}
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Post Options */}
        {(isOwnPost || user?.role === 'admin') && (
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
            
            {showOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Post'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="px-4 py-2">
        <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Post Image */}
      {post.image && (
        <div className="mt-2">
          <img
            src={post.image}
            alt="Post content"
            className="w-full max-h-96 object-contain bg-gray-100 dark:bg-gray-900"
          />
        </div>
      )}

      {/* Post Stats */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          <span className="flex items-center">
            <HeartIconSolid className="h-4 w-4 text-red-500 mr-1" />
            {likesCount}
          </span>
        </div>
        <div>
          <span>{post.commentsCount || 0} comments</span>
        </div>
      </div>

      {/* Post Actions */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex">
        <button
          onClick={handleLike}
          className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {isLiked ? (
            <HeartIconSolid className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
          <span className={isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}>
            Like
          </span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ChatBubbleOvalLeftIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-500 dark:text-gray-400">Comment</span>
        </button>

        <button className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <ShareIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <span className="text-gray-500 dark:text-gray-400">Share</span>
        </button>
      </div>

      {/* Comment Section */}
      {showComments && (
        <CommentSection postId={post.id} /> // ✅ Use post.id
      )}
    </div>
  );
};

export default PostCard;