import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../hooks/useAuth';
import { groupService } from '../../services/group';
import { chatService } from '../../services/chat';
import LoadingSpinner from '../common/LoadingSpinner';
import GroupChat from './GroupChat';
import GroupResources from './GroupResources';
import GroupMembers from './GroupMembers';
import {
    UserGroupIcon,
    DocumentTextIcon,
    ChatBubbleLeftRightIcon,
    PencilIcon,
    TrashIcon,
    ArrowLeftIcon,
    UserPlusIcon,
    ShareIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const GroupDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('discussion');
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [joinMessage, setJoinMessage] = useState('');

    // Fetch group details
    const { data, isLoading, error, refetch } = useQuery(
        ['group', id],
        () => groupService.getGroup(id),
        {
            retry: 1,
            onError: (error) => {
                if (error.response?.status === 403) {
                    toast.error('This is a private group');
                    navigate('/groups');
                }
            }
        }
    );

    const group = data?.data.group;

    // Join group mutation
    const joinMutation = useMutation(
        () => groupService.joinGroup(id),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['group', id]);
                toast.success('Joined group successfully!');
                setShowJoinModal(false);
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to join group');
            }
        }
    );

    // Leave group mutation
    const leaveMutation = useMutation(
        () => groupService.leaveGroup(id),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['group', id]);
                toast.success('Left group successfully');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to leave group');
            }
        }
    );

    // Delete group mutation
    const deleteMutation = useMutation(
        () => groupService.deleteGroup(id),
        {
            onSuccess: () => {
                toast.success('Group deleted successfully');
                navigate('/groups');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to delete group');
            }
        }
    );

    // Update group mutation
    const updateMutation = useMutation(
        (data) => groupService.updateGroup(id, data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['group', id]);
                toast.success('Group updated successfully');
                setShowEditModal(false);
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to update group');
            }
        }
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error || !group) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 text-center">
                <div className="text-6xl mb-4">😕</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Group Not Found
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    The group you're looking for doesn't exist or you don't have access to it.
                </p>
                <button
                    onClick={() => navigate('/groups')}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Back to Groups
                </button>
            </div>
        );
    }

    const isMember = group.isMember;
    const isAdmin = group.isAdmin;
    const isCreator = group.createdBy?._id === user?._id;

    const tabs = [
        { id: 'discussion', name: 'Discussion', icon: ChatBubbleLeftRightIcon },
        { id: 'resources', name: 'Resources', icon: DocumentTextIcon },
        { id: 'members', name: 'Members', icon: UserGroupIcon }
    ];

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <button
                onClick={() => navigate('/groups')}
                className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6"
            >
                <ArrowLeftIcon className="h-5 w-5 mr-1" />
                Back to Groups
            </button>

            {/* Group Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
                {/* Cover Image */}
                <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                    {group.isPrivate && (
                        <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-70 text-white px-3 py-1 rounded-full text-sm flex items-center">
                            Private Group
                        </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="absolute bottom-4 right-4 flex space-x-2">
                        {isMember ? (
                            <>
                                {isAdmin && (
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 flex items-center text-sm font-medium"
                                    >
                                        <PencilIcon className="h-4 w-4 mr-2" />
                                        Edit Group
                                    </button>
                                )}
                                {!isCreator && (
                                    <button
                                        onClick={() => leaveMutation.mutate()}
                                        disabled={leaveMutation.isLoading}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center text-sm font-medium"
                                    >
                                        Leave Group
                                    </button>
                                )}
                                {isCreator && (
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center text-sm font-medium"
                                    >
                                        <TrashIcon className="h-4 w-4 mr-2" />
                                        Delete Group
                                    </button>
                                )}
                            </>
                        ) : (
                            <button
                                onClick={() => setShowJoinModal(true)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm font-medium"
                            >
                                <UserPlusIcon className="h-4 w-4 mr-2" />
                                Join Group
                            </button>
                        )}
                        
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                toast.success('Link copied to clipboard!');
                            }}
                            className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 flex items-center text-sm font-medium"
                        >
                            <ShareIcon className="h-4 w-4 mr-2" />
                            Share
                        </button>
                    </div>
                </div>

                {/* Group Info */}
                <div className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {group.name}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                {group.description}
                            </p>
                            
                            <div className="flex items-center space-x-6 text-sm">
                                <div className="flex items-center text-gray-500 dark:text-gray-400">
                                    <UserGroupIcon className="h-5 w-5 mr-2" />
                                    <span>{group.members?.length || 0} members</span>
                                </div>
                                <div className="text-gray-500 dark:text-gray-400">
                                    Created {new Date(group.createdAt).toLocaleDateString()}
                                </div>
                                <div className="text-gray-500 dark:text-gray-400">
                                    by {group.createdBy?.profile?.name}
                                </div>
                            </div>
                        </div>
                        
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                            group.category === 'STUDY' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            group.category === 'CODING' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            group.category === 'PROJECT' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                            group.category === 'PLACEMENT' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                            {group.category}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            {isMember && (
                <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                                }`}
                            >
                                <tab.icon className="h-5 w-5 mr-2" />
                                {tab.name}
                            </button>
                        ))}
                        {activeTab === 'members' && (
                           <GroupMembers 
                               members={group.members || []} 
                               isAdmin={group.isAdmin}
                               groupId={id}
                               onUpdate={refetch}
                            />
                        )}
                    </nav>
                </div>
            )}

            {/* Tab Content */}
            {isMember ? (
                <div>
                    {activeTab === 'discussion' && <GroupChat groupId={id} groupName={group.name} />}
                    {activeTab === 'resources' && <GroupResources groupId={id} isAdmin={isAdmin} />}
                    {activeTab === 'members' && (
                        <GroupMembers 
                            members={group.members} 
                            isAdmin={isAdmin}
                            groupId={id}
                            onUpdate={refetch}
                        />
                    )}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        This is a private group
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Join this group to see discussions, resources, and connect with members.
                    </p>
                    <button
                        onClick={() => setShowJoinModal(true)}
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <UserPlusIcon className="h-5 w-5 mr-2" />
                        Join Group
                    </button>
                </div>
            )}

            {/* Join Group Modal */}
            {showJoinModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Join {group.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {group.isPrivate 
                                ? 'This is a private group. Your request will be sent to the group admins for approval.'
                                : 'Are you sure you want to join this group?'}
                        </p>
                        {group.isPrivate && (
                            <textarea
                                value={joinMessage}
                                onChange={(e) => setJoinMessage(e.target.value)}
                                placeholder="Add a message to the group admins (optional)"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-6 dark:bg-gray-700 dark:text-white"
                                rows="3"
                            />
                        )}
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowJoinModal(false)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => joinMutation.mutate()}
                                disabled={joinMutation.isLoading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                {joinMutation.isLoading ? 'Joining...' : group.isPrivate ? 'Send Request' : 'Join Group'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Group Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Edit Group
                        </h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            updateMutation.mutate({
                                name: formData.get('name'),
                                description: formData.get('description'),
                                category: formData.get('category'),
                                isPrivate: formData.get('isPrivate') === 'true'
                            });
                        }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Group Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        defaultValue={group.name}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        defaultValue={group.description}
                                        required
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Category
                                    </label>
                                    <select
                                        name="category"
                                        defaultValue={group.category}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="STUDY">📚 Study</option>
                                        <option value="CODING">💻 Coding</option>
                                        <option value="PROJECT">🚀 Project</option>
                                        <option value="PLACEMENT">💼 Placement</option>
                                        <option value="INTERNSHIP">🎯 Internship</option>
                                        <option value="CULTURAL">🎨 Cultural</option>
                                        <option value="SPORTS">⚽ Sports</option>
                                        <option value="OTHER">✨ Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Privacy
                                    </label>
                                    <select
                                        name="isPrivate"
                                        defaultValue={group.isPrivate ? 'true' : 'false'}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="false">Public - Anyone can join</option>
                                        <option value="true">Private - Approval required</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateMutation.isLoading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    {updateMutation.isLoading ? 'Updating...' : 'Update Group'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Delete Group
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to delete "{group.name}"? This action cannot be undone and all group data will be permanently removed.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteMutation.mutate()}
                                disabled={deleteMutation.isLoading}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                {deleteMutation.isLoading ? 'Deleting...' : 'Delete Group'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupDetail;