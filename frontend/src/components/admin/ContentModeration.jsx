import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminService } from '../../services/admin';
import { postService } from '../../services/post';
import { anonymousService } from '../../services/anonymous';
import LoadingSpinner from '../common/LoadingSpinner';
import {
    DocumentTextIcon,
    ChatBubbleLeftIcon,
    EyeIcon,
    TrashIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ContentModeration = () => {
    const [activeTab, setActiveTab] = useState('posts');
    const queryClient = useQueryClient();

    const { data: flaggedData, isLoading: flaggedLoading } = useQuery(
        'flagged-content',
        () => adminService.getFlaggedContent(),
        {
            refetchInterval: 30000
        }
    );

    const deletePostMutation = useMutation(
        (postId) => postService.deletePost(postId),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('flagged-content');
                toast.success('Post deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete post');
            }
        }
    );

    const deleteAnonymousMutation = useMutation(
        (postId) => anonymousService.deletePost(postId),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('flagged-content');
                toast.success('Anonymous post deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete anonymous post');
            }
        }
    );

    if (flaggedLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const flaggedPosts = flaggedData?.data.content?.posts || [];
    const flaggedAnonymous = flaggedData?.data.content?.anonymous || [];

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Content Moderation
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Review and manage flagged content
                </p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'posts'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                        }`}
                    >
                        Flagged Posts ({flaggedPosts.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('anonymous')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'anonymous'
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                        }`}
                    >
                        Flagged Anonymous Posts ({flaggedAnonymous.length})
                    </button>
                </nav>
            </div>

            {/* Content */}
            {activeTab === 'posts' && (
                <div className="space-y-6">
                    {flaggedPosts.length > 0 ? (
                        flaggedPosts.map((post) => (
                            <div
                                key={post._id}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={post.createdBy?.profile?.profilePicture || 'default-avatar.png'}
                                            alt={post.createdBy?.profile?.name}
                                            className="h-10 w-10 rounded-full"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {post.createdBy?.profile?.name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {post.createdBy?.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full dark:bg-red-900 dark:text-red-200">
                                            {post.reportCount} reports
                                        </span>
                                    </div>
                                </div>

                                <p className="mt-4 text-gray-700 dark:text-gray-300">
                                    {post.content}
                                </p>

                                {post.image && (
                                    <img
                                        src={post.image}
                                        alt="Post content"
                                        className="mt-4 max-h-96 rounded-lg"
                                    />
                                )}

                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center">
                                            <EyeIcon className="h-4 w-4 mr-1" />
                                            {post.views || 0} views
                                        </span>
                                        <span className="flex items-center">
                                            <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                                            {post.commentsCount || 0} comments
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to delete this post?')) {
                                                deletePostMutation.mutate(post._id);
                                            }
                                        }}
                                        disabled={deletePostMutation.isLoading}
                                        className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
                                    >
                                        <TrashIcon className="h-4 w-4 mr-1" />
                                        Delete Post
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                            <ShieldCheckIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                No flagged posts
                            </h3>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">
                                All posts are currently within community guidelines
                            </p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'anonymous' && (
                <div className="space-y-6">
                    {flaggedAnonymous.length > 0 ? (
                        flaggedAnonymous.map((post) => (
                            <div
                                key={post._id}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    {post.anonymousId?.slice(-4)}
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {post.anonymousId}
                                            </span>
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full dark:bg-blue-900 dark:text-blue-200">
                                                {post.category}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full dark:bg-red-900 dark:text-red-200">
                                        {post.reportsCount} reports
                                    </span>
                                </div>

                                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                                    {post.questionTitle}
                                </h3>
                                <p className="mt-2 text-gray-700 dark:text-gray-300">
                                    {post.questionBody}
                                </p>

                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center">
                                            <EyeIcon className="h-4 w-4 mr-1" />
                                            {post.views} views
                                        </span>
                                        <span className="flex items-center">
                                            <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                                            {post.answers?.filter(a => !a.isDeleted).length || 0} answers
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to delete this anonymous post?')) {
                                                deleteAnonymousMutation.mutate(post._id);
                                            }
                                        }}
                                        disabled={deleteAnonymousMutation.isLoading}
                                        className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
                                    >
                                        <TrashIcon className="h-4 w-4 mr-1" />
                                        Delete Post
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                            <ShieldCheckIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                No flagged anonymous posts
                            </h3>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">
                                All anonymous posts are currently within community guidelines
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ContentModeration;