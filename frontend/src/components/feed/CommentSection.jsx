import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { postService } from '../../services/post';
import { useAuth } from '../../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const CommentSection = ({ postId }) => {
    const [comment, setComment] = useState('');
    const [page, setPage] = useState(1);
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery(
        ['comments', postId, page],
        () => postService.getComments(postId, page),
        {
            keepPreviousData: true
        }
    );

    const addCommentMutation = useMutation(
        ({ postId, content }) => postService.addComment(postId, content),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['comments', postId]);
                queryClient.invalidateQueries('feed');
                setComment('');
                toast.success('Comment added');
            },
            onError: () => {
                toast.error('Failed to add comment');
            }
        }
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        addCommentMutation.mutate({ postId: postId, content: comment });
    };

    const comments = data?.data?.comments || [];
    const pagination = data?.data?.pagination || { page: 1, pages: 1 };

    return (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50">
            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="flex items-start space-x-3 mb-4">
                <img
                    src={user?.profilePicture || 'default-avatar.png'}
                    alt={user?.fullName || 'User'}
                    className="h-8 w-8 rounded-full"
                />
                <div className="flex-1">
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write a comment..."
                        rows="1"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
                    />
                </div>
                <button
                    type="submit"
                    disabled={!comment.trim() || addCommentMutation.isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                    Post
                </button>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                        <img
                            src={comment.author?.profilePicture || comment.createdBy?.profilePicture || 'default-avatar.png'}
                            alt={comment.author?.fullName || comment.createdBy?.fullName || 'User'}
                            className="h-6 w-6 rounded-full"
                        />
                        <div className="flex-1">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {comment.author?.fullName || comment.createdBy?.fullName || 'Anonymous'}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {comment.content}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Load More */}
            {pagination.page < pagination.pages && (
                <button
                    onClick={() => setPage(page + 1)}
                    className="mt-4 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                    Load more comments
                </button>
            )}
        </div>
    );
};

export default CommentSection;