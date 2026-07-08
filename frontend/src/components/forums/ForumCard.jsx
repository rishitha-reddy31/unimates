// frontend/src/components/forums/ForumCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ChatBubbleLeftIcon, HeartIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const ForumCard = ({ forum, onUpdate }) => {
  const getCategoryColor = (category) => {
    const colors = {
      'GENERAL': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      'ACADEMIC': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'CAREER': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'TECHNICAL': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'PROJECTS': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'INTERNSHIPS': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'PLACEMENTS': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'EVENTS': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'OTHER': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    };
    return colors[category] || colors.OTHER;
  };

  return (
    <Link to={`/forums/${forum.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 mb-2">
              {forum.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
              {forum.content}
            </p>
            
            {/* Tags */}
            {forum.tags && forum.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {forum.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ml-2 ${getCategoryColor(forum.category)}`}>
            {forum.category}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <img
                src={forum.author?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(forum.author?.fullName || forum.author?.username || 'User')}&background=2563eb&color=fff&size=32`}
                alt={forum.author?.fullName}
                className="h-5 w-5 rounded-full mr-2"
              />
              <span>{forum.author?.fullName || forum.author?.username}</span>
            </div>
            
            <span>•</span>
            
            <span>{formatDistanceToNow(new Date(forum.createdAt), { addSuffix: true })}</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <EyeIcon className="h-4 w-4 mr-1" />
              <span>{forum.views || 0}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              {forum.isLiked ? (
                <HeartIconSolid className="h-4 w-4 mr-1 text-red-500" />
              ) : (
                <HeartIcon className="h-4 w-4 mr-1" />
              )}
              <span>{forum.likesCount || 0}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
              <span>{forum.commentsCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ForumCard;