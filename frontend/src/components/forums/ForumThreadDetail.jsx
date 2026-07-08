import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../hooks/useAuth';
import { forumService } from '../../services/forum';
import LoadingSpinner from '../common/LoadingSpinner';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
    HandThumbUpIcon,
    HandThumbDownIcon,
    ChatBubbleLeftIcon,
    CheckCircleIcon,
    PencilIcon,
    TrashIcon,
    ArrowLeftIcon,
    FlagIcon
} from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpIconSolid } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const ForumThreadDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [comment, setComment] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');

    const { data, isLoading, error } = useQuery(
        ['forum-thread', id],
        () => forumService.getThread(id),
        {
            onError: (error) => {
                if (error.response?.status === 404) {
                    toast.error('Thread not found');
                    navigate('/forums');
                }
            }
        }
    );

    const thread = data?.data.thread;

    const upvoteMutation = useMutation(
        () => forumService.upvoteThread(id),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['forum-thread', id]);
            }
        }
    );

    const downvoteMutation = useMutation(
        () => forumService.downvoteThread(id),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['forum-thread', id]);
            }
        }
    );

    const commentMutation = useMutation(
        (content) => forumService.addComment(id, content),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['forum-thread', id]);
                setComment('');
                toast.success('Comment added');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to add comment');
            }
        }
    );

    const resolveMutation = useMutation(
        () => forumService.resolveThread(id),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['forum-thread', id]);
                toast.success(thread?.isResolved ? 'Thread reopened' : 'Thread marked as resolved');
            }
        }
    );

    const deleteMutation = useMutation(
        () => forumService.deleteThread(id),
        {
            onSuccess: () => {
                toast.success('Thread deleted');
                navigate('/forums');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to delete thread');
            }
        }
    );

    const reportMutation = useMutation(
        (reason) => forumService.reportThread(id, reason),
        {
            onSuccess: () => {
                toast.success('Thread reported to moderators');
                setShowReportModal(false);
                setReportReason('');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to report thread');
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

    if (error || !thread) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4 text-center">
                <div className="text-6xl mb-4">😕</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Thread Not Found
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    The discussion thread you're looking for doesn't exist or has been deleted.
                </p>
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

    const isAuthor = thread.createdBy?._id === user?._id;
    const isAdmin = user?.role === 'admin';
    const canModify = isAuthor || isAdmin;
    const voteCount = (thread.upvotes?.length || 0) - (thread.downvotes?.length || 0);
    const isUpvoted = thread.isUpvoted;
    const isDownvoted = thread.isDownvoted;

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* Back Button */}
            <button
                onClick={() => navigate('/forums')}
                className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6"
            >
                <ArrowLeftIcon className="h-5 w-5 mr-1" />
                Back to Forums
            </button>

            {/* Thread Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                {/* Category and Status */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full dark:bg-blue-900 dark:text-blue-200">
                            {thread.category}
                        </span>
                        {thread.isPinned && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full dark:bg-gray-700 dark:text-gray-400">
                                📌 Pinned
                            </span>
                        )}
                        {thread.isResolved && (
                            <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded-full dark:bg-green-900 dark:text-green-400 flex items-center">
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                Resolved
                            </span>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                        {canModify && (
                            <>
                                <button
                                    onClick={() => resolveMutation.mutate()}
                                    className="p-2 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
                                    title={thread.isResolved ? 'Reopen' : 'Mark as resolved'}
                                >
                                    <CheckCircleIcon className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                    title="Delete"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </>
                        )}
                        {!canModify && (
                            <button
                                onClick={() => setShowReportModal(true)}
                                className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                title="Report"
                            >
                                <FlagIcon className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {thread.title}
                </h1>

                {/* Author Info */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <img
                            src={thread.createdBy?.profile?.profilePicture || 'default-avatar.png'}
                            alt={thread.createdBy?.profile?.name}
                            className="h-10 w-10 rounded-full"
                        />
                        <div>
                            <div className="flex items-center">
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {thread.createdBy?.profile?.name}
                                </span>
                                {thread.createdBy?.role === 'admin' && (
                                    <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded-full dark:bg-purple-900 dark:text-purple-200">
                                        Admin
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <span>{thread.createdBy?.profile?.branch} • {thread.createdBy?.profile?.year} Year</span>
                                <span className="mx-2">•</span>
                                <span>{formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}</span>
                                {thread.isEdited && (
                                    <>
                                        <span className="mx-2">•</span>
                                        <span>Edited</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Vote Buttons */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => upvoteMutation.mutate()}
                            disabled={upvoteMutation.isLoading}
                            className={`p-2 rounded-full ${
                                isUpvoted
                                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                                    : 'text-gray-500 hover:text-blue-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                            }`}
                        >
                            {isUpvoted ? (
                                <HandThumbUpIconSolid className="h-5 w-5" />
                            ) : (
                                <HandThumbUpIcon className="h-5 w-5" />
                            )}
                        </button>
                        <span className={`font-semibold ${
                            voteCount > 0 ? 'text-green-600' : voteCount < 0 ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'
                        }`}>
                            {voteCount}
                        </span>
                        <button
                            onClick={() => downvoteMutation.mutate()}
                            disabled={downvoteMutation.isLoading}
                            className={`p-2 rounded-full ${
                                isDownvoted
                                    ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                                    : 'text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                            }`}
                        >
                            {isDownvoted ? (
                                <HandThumbDownIcon className="h-5 w-5" />
                            ) : (
                                <HandThumbDownIcon className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown
                        components={{
                            code({ node, inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                    <SyntaxHighlighter
                                        style={vscDarkPlus}
                                        language={match[1]}
                                        PreTag="div"
                                        {...props}
                                    >
                                        {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                ) : (
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                );
                            }
                        }}
                    >
                        {thread.content}
                    </ReactMarkdown>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        {thread.views} views
                    </span>
                    <span className="flex items-center">
                        <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                        {thread.comments?.length || 0} comments
                    </span>
                </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <ChatBubbleLeftIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Comments ({thread.comments?.length || 0})
                </h3>

                {/* Add Comment */}
                <div className="mb-8">
                    <div className="flex items-start space-x-3">
                        <img
                            src={user?.profile?.profilePicture || 'default-avatar.png'}
                            alt={user?.profile?.name}
                            className="h-8 w-8 rounded-full"
                        />
                        <div className="flex-1">
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Add to the discussion..."
                                rows="3"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={() => commentMutation.mutate(comment)}
                                    disabled={!comment.trim() || commentMutation.isLoading}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {commentMutation.isLoading ? 'Posting...' : 'Post Comment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comments List */}
                {thread.comments?.length > 0 ? (
                    <div className="space-y-6">
                        {thread.comments.map((comment, index) => (
                            <div key={comment._id || index} className="flex space-x-3">
                                <img
                                    src={comment.user?.profile?.profilePicture || 'default-avatar.png'}
                                    alt={comment.user?.profile?.name}
                                    className="h-8 w-8 rounded-full"
                                />
                                <div className="flex-1">
                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center">
                                                <span className="font-medium text-gray-900 dark:text-white">
                                                    {comment.user?.profile?.name}
                                                </span>
                                                {comment.user?.role === 'admin' && (
                                                    <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded-full dark:bg-purple-900 dark:text-purple-200">
                                                        Admin
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">
                            No comments yet. Be the first to share your thoughts!
                        </p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Delete Thread
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to delete this thread? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteMutation.mutate()}
                                disabled={deleteMutation.isLoading}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                {deleteMutation.isLoading ? 'Deleting...' : 'Delete Thread'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Report Thread
                        </h3>
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Why are you reporting this thread?
                            </p>
                            <select
                                value={reportReason}
                                onChange={(e) => setReportReason(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">Select a reason</option>
                                <option value="SPAM">Spam</option>
                                <option value="HARASSMENT">Harassment</option>
                                <option value="HATE_SPEECH">Hate Speech</option>
                                <option value="INAPPROPRIATE">Inappropriate Content</option>
                                <option value="MISINFORMATION">Misinformation</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => reportMutation.mutate(reportReason)}
                                disabled={!reportReason || reportMutation.isLoading}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                            >
                                {reportMutation.isLoading ? 'Reporting...' : 'Report Thread'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ForumThreadDetail;