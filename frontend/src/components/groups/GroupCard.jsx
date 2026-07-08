// frontend/src/components/groups/GroupCard.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import { groupService } from '../../services/group';
import { UserGroupIcon, DocumentTextIcon, UserPlusIcon, CheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const GroupCard = ({ group, onUpdate }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isJoining, setIsJoining] = useState(false);

  // Always call useMutation at the top level, before any conditional returns
  const joinMutation = useMutation(
    () => groupService.joinGroup(group?.id),
    {
      onMutate: () => {
        setIsJoining(true);
      },
      onSuccess: (data) => {
        toast.success(`Joined ${group?.name}!`);
        queryClient.invalidateQueries('groups');
        if (onUpdate) onUpdate();
        setIsJoining(false);
        
        // Navigate to group detail after joining
        if (data.data?.group) {
          navigate(`/groups/${group?.id}`);
        }
      },
      onError: (error) => {
        console.error('Join error:', error);
        toast.error(error.response?.data?.message || 'Failed to join group');
        setIsJoining(false);
      }
    }
  );

  // Now we can do the validation after all hooks are called
  if (!group || !group.id) {
    console.error('Invalid group data:', group);
    return null;
  }

  const getCategoryColor = (category) => {
    const colors = {
      'STUDY': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'CODING': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'PROJECT': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'PLACEMENT': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'INTERNSHIP': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      'CULTURAL': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'SPORTS': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'OTHER': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    };
    return colors[category] || colors.OTHER;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'STUDY': '📚',
      'CODING': '💻',
      'PROJECT': '🚀',
      'PLACEMENT': '💼',
      'INTERNSHIP': '🎯',
      'CULTURAL': '🎨',
      'SPORTS': '⚽',
      'OTHER': '✨'
    };
    return icons[category] || '📌';
  };

  const handleJoinClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    joinMutation.mutate();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <Link to={`/groups/${group.id}`}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 mb-1">
                {group.name}
              </h3>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
              {group.description}
            </p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ml-2 ${getCategoryColor(group.groupType)}`}>
            {getCategoryIcon(group.groupType)} {group.groupType}
          </span>
        </div>

        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <UserGroupIcon className="h-4 w-4 mr-1" />
              <span>{group.membersCount || 0} members</span>
            </div>
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <DocumentTextIcon className="h-4 w-4 mr-1" />
              <span>{group.resourcesCount || 0} resources</span>
            </div>
          </div>
        </div>

        {group.creator && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={group.creator.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(group.creator.fullName || group.creator.username)}&background=2563eb&color=fff`}
                alt={group.creator.fullName}
                className="h-6 w-6 rounded-full mr-2"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Created by {group.creator.fullName || group.creator.username}
              </span>
            </div>
            
            {/* Join/Leave Button */}
            {!group.isMember ? (
              <button
                onClick={handleJoinClick}
                disabled={isJoining}
                className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isJoining ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Joining...
                  </>
                ) : (
                  <>
                    <UserPlusIcon className="h-4 w-4 mr-1" />
                    Join
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs font-medium rounded">
                  <CheckIcon className="h-3 w-3 mr-1" />
                  Member
                </span>
                {group.isAdmin && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs font-medium rounded">
                    Admin
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupCard;