// frontend/src/components/forums/ForumThread.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { forumService } from '../../services/forum';
import ForumChat from './ForumChat';
import LoadingSpinner from '../common/LoadingSpinner';
import { ArrowLeftIcon, UserGroupIcon, EyeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ForumThread = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useQuery(
    ['forum', id],
    () => forumService.getForum(id),
    {
      retry: 1,
      onError: (err) => {
        console.error('Error fetching forum:', err);
        toast.error(err.response?.data?.message || 'Failed to load forum post');
      }
    }
  );

  const forum = data?.data?.forum;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !forum) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Forum Post Not Found
        </h2>
        <button
          onClick={() => navigate('/forums')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Forums
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Back Button */}
      <button
        onClick={() => navigate('/forums')}
        className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-1" />
        Back to Forums
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forum Info Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {forum.title}
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {forum.content}
            </p>

            {forum.tags && forum.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {forum.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <UserGroupIcon className="h-4 w-4 mr-1" />
                <span>{forum.participantsCount || 0} participants</span>
              </div>
              <div className="flex items-center">
                <EyeIcon className="h-4 w-4 mr-1" />
                <span>{forum.views || 0} views</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <img
                src={forum.author?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(forum.author?.fullName || forum.author?.username)}&background=2563eb&color=fff&size=32`}
                alt={forum.author?.fullName}
                className="h-8 w-8 rounded-full"
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {forum.author?.fullName || forum.author?.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Created {new Date(forum.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <ForumChat 
            forumId={id} 
            forum={forum}
            onUpdate={refetch}
          />
        </div>
      </div>
    </div>
  );
};

export default ForumThread;