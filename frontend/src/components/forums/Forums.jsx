// frontend/src/components/forums/Forums.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { forumService } from '../../services/forum';
import ForumCard from './ForumCard';
import CreateForum from './CreateForum';
import { MagnifyingGlassIcon, PlusIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const Forums = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('latest');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isLoading, refetch } = useQuery(
    ['forums', selectedCategory, searchQuery, selectedSort],
    () => {
      const category = selectedCategory !== 'all' ? selectedCategory : undefined;
      const search = searchQuery || undefined;
      return forumService.getForums(category, search, selectedSort);
    },
    {
      keepPreviousData: true,
      onError: (err) => {
        console.error('❌ Error fetching forums:', err);
        toast.error('Failed to load forums');
      }
    }
  );

  const forums = data?.data?.forums || [];

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'GENERAL', name: '📢 General Discussion' },
    { id: 'ACADEMIC', name: '📚 Academic' },
    { id: 'CAREER', name: '💼 Career' },
    { id: 'TECHNICAL', name: '💻 Technical' },
    { id: 'PROJECTS', name: '🚀 Projects' },
    { id: 'INTERNSHIPS', name: '🎯 Internships' },
    { id: 'PLACEMENTS', name: '🏢 Placements' },
    { id: 'EVENTS', name: '🎉 Events' },
    { id: 'OTHER', name: '✨ Other' }
  ];

  const sortOptions = [
    { id: 'latest', name: 'Latest' },
    { id: 'popular', name: 'Most Liked' },
    { id: 'views', name: 'Most Viewed' }
  ];

  const handleCreateSuccess = (newForum) => {
    console.log('✅ Forum created successfully:', newForum);
    refetch();
    setShowCreateModal(false);
    toast.success('Forum post created successfully!');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Discussion Forums</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Ask questions, share knowledge, and discuss ideas</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Discussion
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {sortOptions.map(option => (
                <option key={option.id} value={option.id}>{option.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Forums Grid */}
      {forums.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
            <ChatBubbleLeftRightIcon className="h-full w-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No discussions yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Be the first to start a discussion in your college!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Start a Discussion
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {forums.map(forum => (
            <ForumCard key={forum.id} forum={forum} />
          ))}
        </div>
      )}

      {/* Create Forum Modal */}
      {showCreateModal && (
        <CreateForum
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
};

export default Forums;