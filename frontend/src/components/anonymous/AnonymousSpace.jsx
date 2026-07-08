import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { anonymousService } from '../../services/anonymous';
import { reportService } from '../../services/report';
import AskAnonymous from './AskAnonymous';
import AnonymousPost from './AnonymousPost';
import LoadingSpinner from '../common/LoadingSpinner';
import { MagnifyingGlassIcon, FlagIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AnonymousSpace = () => {
  const [showAskModal, setShowAskModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'CAMPUS', name: 'Campus' },
    { id: 'ACADEMIC', name: 'Academic' },
    { id: 'PLACEMENT', name: 'Placement' },
    { id: 'GENERAL', name: 'General' },
    { id: 'HOSTEL', name: 'Hostel' },
    { id: 'CANTEEN', name: 'Canteen' },
    { id: 'LIBRARY', name: 'Library' }
  ];

  const { data, isLoading, refetch } = useQuery(
    ['anonymous-posts', selectedCategory],
    () => anonymousService.getPosts(selectedCategory !== 'all' ? selectedCategory : undefined),
    {
      staleTime: 30000
    }
  );

  const reportMutation = useMutation(
    ({ postId, reason, description }) => reportService.createReport({
      contentType: 'ANONYMOUS',
      contentId: postId,
      reason,
      description
    }),
    {
      onSuccess: () => {
        toast.success('Post reported successfully');
      },
      onError: () => {
        toast.error('Failed to report post');
      }
    }
  );

  const posts = data?.data?.posts || [];
  
  const filteredPosts = posts.filter(post =>
    searchQuery
      ? post.questionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.questionBody.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Anonymous Help Space
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ask questions anonymously. Your identity will never be revealed.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <button
          onClick={() => setShowAskModal(true)}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Ask a Question Anonymously
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search anonymous questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Posts List - Empty State */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
            <ChatBubbleLeftIcon className="h-full w-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No questions yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Be the first to ask an anonymous question! Your identity will remain completely hidden.
          </p>
          <button
            onClick={() => setShowAskModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Ask Your First Question
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <AnonymousPost
              key={post.id}
              post={post}
              onReport={(reason, description) => reportMutation.mutate({ 
                postId: post.id, 
                reason, 
                description 
              })}
            />
          ))}
        </div>
      )}

      {/* Ask Anonymous Modal */}
      {showAskModal && (
        <AskAnonymous
          onClose={() => setShowAskModal(false)}
          onSuccess={() => {
            refetch();
            setShowAskModal(false);
          }}
        />
      )}
    </div>
  );
};

export default AnonymousSpace;