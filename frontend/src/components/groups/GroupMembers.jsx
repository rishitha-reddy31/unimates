// frontend/src/components/groups/GroupMembers.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import { groupService } from '../../services/group';
import { 
  UserCircleIcon,
  ShieldCheckIcon,
  UserIcon,
  TrashIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const GroupMembers = ({ members, isAdmin, groupId, onUpdate }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedMember, setSelectedMember] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const updateRoleMutation = useMutation(
    ({ userId, role }) => groupService.updateMemberRole(groupId, userId, role),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['group', groupId]);
        toast.success('Member role updated');
        setShowRoleModal(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update role');
      }
    }
  );

  const removeMemberMutation = useMutation(
    (userId) => groupService.removeMember(groupId, userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['group', groupId]);
        toast.success('Member removed from group');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to remove member');
      }
    }
  );

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <ShieldCheckIcon className="h-5 w-5 text-red-500" />;
      case 'moderator':
        return <ShieldCheckIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <UserIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'moderator':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (!members || members.length === 0) {
    return (
      <div className="text-center py-8">
        <UserCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">No members yet</p>
      </div>
    );
  }

  // Separate admins and regular members
  const admins = members.filter(m => m.role === 'admin');
  const moderators = members.filter(m => m.role === 'moderator');
  const regularMembers = members.filter(m => m.role === 'member');

  return (
    <div className="space-y-6">
      {/* Admins Section */}
      {admins.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <ShieldCheckIcon className="h-5 w-5 mr-2 text-red-500" />
            Admins ({admins.length})
          </h3>
          <div className="space-y-3">
            {admins.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                isAdmin={isAdmin}
                onViewProfile={handleViewProfile}
                onUpdateRole={(role) => updateRoleMutation.mutate({ userId: member.id, role })}
                onRemove={() => removeMemberMutation.mutate(member.id)}
                showActions={isAdmin && member.id !== members.find(m => m.role === 'admin')?.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Moderators Section */}
      {moderators.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <ShieldCheckIcon className="h-5 w-5 mr-2 text-yellow-500" />
            Moderators ({moderators.length})
          </h3>
          <div className="space-y-3">
            {moderators.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                isAdmin={isAdmin}
                onViewProfile={handleViewProfile}
                onUpdateRole={(role) => updateRoleMutation.mutate({ userId: member.id, role })}
                onRemove={() => removeMemberMutation.mutate(member.id)}
                showActions={isAdmin}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Members Section */}
      {regularMembers.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <UserIcon className="h-5 w-5 mr-2 text-gray-500" />
            Members ({regularMembers.length})
          </h3>
          <div className="space-y-3">
            {regularMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                isAdmin={isAdmin}
                onViewProfile={handleViewProfile}
                onUpdateRole={(role) => updateRoleMutation.mutate({ userId: member.id, role })}
                onRemove={() => removeMemberMutation.mutate(member.id)}
                showActions={isAdmin}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MemberCard = ({ member, isAdmin, onViewProfile, onUpdateRole, onRemove, showActions }) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'moderator':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
      <div 
        className="flex items-center space-x-3 cursor-pointer flex-1"
        onClick={() => onViewProfile(member.id)}
      >
        <img
          src={member.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.fullName || member.username)}&background=2563eb&color=fff`}
          alt={member.fullName}
          className="h-10 w-10 rounded-full"
        />
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {member.fullName || member.username}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {member.branch || 'CSE'} • {member.year || 'Student'}
          </p>
          <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeColor(member.role)}`}>
            {member.role}
          </span>
        </div>
      </div>

      {showActions && (
        <div className="flex items-center space-x-2 relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Change role"
          >
            <ArrowUpIcon className="h-4 w-4" />
          </button>
          
          <button
            onClick={onRemove}
            className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Remove from group"
          >
            <TrashIcon className="h-4 w-4" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    onUpdateRole('member');
                    setShowRoleMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Make Member
                </button>
                <button
                  onClick={() => {
                    onUpdateRole('moderator');
                    setShowRoleMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Make Moderator
                </button>
                <button
                  onClick={() => {
                    onUpdateRole('admin');
                    setShowRoleMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Make Admin
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupMembers;