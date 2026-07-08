import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useMutation, useQueryClient } from 'react-query';
import { anonymousService } from '../../services/anonymous';
import {
    ChatBubbleLeftIcon,
    FlagIcon,
    EyeIcon
} from '@heroicons/react/24/outline';
import { ChatBubbleLeftIcon as ChatBubbleLeftIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const AnonymousPost = ({ post, onReport }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [showAllAnswers, setShowAllAnswers] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const queryClient = useQueryClient();

    const addReplyMutation = useMutation(
        ({ postId, content }) => anonymousService.addReply(postId, content),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['anonymous-post', post._id]);
                setReplyContent('');
                setShowReplyForm(false);
                toast.success('Reply posted anonymously');
            },
            onError: () => {
                toast.error('Failed to post reply');
            }
        }
    );

    const handleSubmitReply = (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;
        addReplyMutation.mutate({
            postId: post._id,
            content: replyContent
        });
    };

    const handleReport = () => {
        if (!reportReason) {
            toast.error('Please select a reason');
            return;
        }
        onReport(reportReason, reportDescription);
        setShowReportModal(false);
        setReportReason('');
        setReportDescription('');
    };

    const visibleAnswers = showAllAnswers ? post.answers : post.answers?.slice(0, 3);
    const hasMoreAnswers = post.answers?.length > 3;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {/* Post Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {post.anonymousId?.slice(-4)}
                            </span>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {post.anonymousId}
                            </span>
                            <span className="ml-2 text-xs text-gray-500">
                                • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full dark:bg-blue-900 dark:text-blue-200">
                        {post.category}
                    </span>
                </div>
            </div>

            {/* Post Content */}
            <div className="px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {post.questionTitle}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {post.questionBody}
                </p>
            </div>

            {/* Post Stats */}
            <div className="px-6 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        {post.views} views
                    </span>
                    <span className="flex items-center">
                        <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                        {post.answers?.filter(a => !a.isDeleted).length || 0} answers
                    </span>
                </div>
            </div>

            {/* Answers Section */}
            {post.answers?.length > 0 && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                        Answers
                    </h4>
                    <div className="space-y-4">
                        {visibleAnswers?.map((answer) => (
                            <div key={answer._id} className="pl-4 border-l-2 border-gray-300 dark:border-gray-600">
                                <div className="flex items-center space-x-2 mb-1">
                                    <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                            {answer.anonymousId?.slice(-4)}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {answer.anonymousId} • {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {answer.content}
                                </p>
                            </div>
                        ))}
                    </div>
                    
                    {hasMoreAnswers && !showAllAnswers && (
                        <button
                            onClick={() => setShowAllAnswers(true)}
                            className="mt-3 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                            View all {post.answers.length} answers
                        </button>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                <button
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="flex items-center space-x-2 px-3 py-1 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20"
                >
                    <ChatBubbleLeftIcon className="h-4 w-4" />
                    <span className="text-sm">Answer</span>
                </button>
                
                <button
                    onClick={() => setShowReportModal(true)}
                    className="flex items-center space-x-2 px-3 py-1 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20"
                >
                    <FlagIcon className="h-4 w-4" />
                    <span className="text-sm">Report</span>
                </button>
            </div>

            {/* Reply Form */}
            {showReplyForm && (
                <form onSubmit={handleSubmitReply} className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
                    <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your answer anonymously..."
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                    />
                    <div className="flex justify-end space-x-3 mt-3">
                        <button
                            type="button"
                            onClick={() => setShowReplyForm(false)}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!replyContent.trim() || addReplyMutation.isLoading}
                            className="px-4 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {addReplyMutation.isLoading ? 'Posting...' : 'Post Answer'}
                        </button>
                    </div>
                </form>
            )}

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Report Anonymous Post
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Reason for reporting
                                    </label>
                                    <select
                                        value={reportReason}
                                        onChange={(e) => setReportReason(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Select a reason</option>
                                        <option value="SPAM">Spam</option>
                                        <option value="HARASSMENT">Harassment</option>
                                        <option value="HATE_SPEECH">Hate Speech</option>
                                        <option value="INAPPROPRIATE">Inappropriate Content</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Additional details (optional)
                                    </label>
                                    <textarea
                                        value={reportDescription}
                                        onChange={(e) => setReportDescription(e.target.value)}
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                                        placeholder="Provide more context..."
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReport}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                    Submit Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnonymousPost;