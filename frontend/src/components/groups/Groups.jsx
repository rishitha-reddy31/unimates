// frontend/src/components/groups/Groups.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { groupService } from '../../services/group';
import GroupCard from './GroupCard';
import CreateGroup from './CreateGroup';
import { MagnifyingGlassIcon, PlusIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const Groups = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isLoading, error, refetch } = useQuery(
    ['groups', selectedCategory, searchQuery],
    () => {
      const category = selectedCategory !== 'all' && selectedCategory !== 'undefined' ? selectedCategory : undefined;
      const search = searchQuery || undefined;
      return groupService.getGroups(category, search);
    },
    {
      keepPreviousData: true,
      onError: (err) => {
        console.error('❌ Error fetching groups:', err);
        toast.error('Failed to load groups');
      }
    }
  );

  const groups = data?.data?.groups || [];

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'STUDY', name: '📚 Study Groups' },
    { id: 'CODING', name: '💻 Coding' },
    { id: 'PROJECT', name: '🚀 Projects' },
    { id: 'PLACEMENT', name: '💼 Placement Prep' },
    { id: 'INTERNSHIP', name: '🎯 Internships' },
    { id: 'CULTURAL', name: '🎨 Cultural' },
    { id: 'SPORTS', name: '⚽ Sports' },
    { id: 'OTHER', name: '✨ Other' }
  ];

  const handleCreateSuccess = (newGroup) => {
    console.log('✅ Group created successfully:', newGroup);
    refetch(); // Refresh the groups list
    setShowCreateModal(false);
    toast.success('Group created successfully!');
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Groups & Communities</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Join groups, collaborate, and learn together</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Group
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
            <UserGroupIcon className="h-full w-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No groups yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Be the first to create a study group or community for your college!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Your First Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <GroupCard key={group.id} group={group} onUpdate={refetch} />
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateGroup
          onClose={handleCloseModal}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
};

export default Groups;