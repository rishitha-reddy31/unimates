import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { notificationService } from '../../services/notification';
import { useAuth } from '../../hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '../common/LoadingSpinner';
import {
    BellIcon,
    HeartIcon,
    ChatBubbleLeftIcon,
    UserPlusIcon,
    UserGroupIcon,
    CalendarIcon,
    MegaphoneIcon,
    ShieldCheckIcon,
    CheckCircleIcon,
    TrashIcon,
    CheckIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Notifications = () => {
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data, isLoading, refetch } = useQuery(
        ['notifications', page],
        () => notificationService.getNotifications(page),
        {
            keepPreviousData: true,
            refetchInterval: 30000
        }
    );

    const markAsReadMutation = useMutation(
        (notificationId) => notificationService.markAsRead(notificationId),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('notifications');
                queryClient.invalidateQueries('unread-count');
            }
        }
    );

    const markAllAsReadMutation = useMutation(
        () => notificationService.markAllAsRead(),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('notifications');
                queryClient.invalidateQueries('unread-count');
                toast.success('All notifications marked as read');
            }
        }
    );

    const deleteNotificationMutation = useMutation(
        (notificationId) => notificationService.deleteNotification(notificationId),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('notifications');
                queryClient.invalidateQueries('unread-count');
                toast.success('Notification deleted');
            },
            onError: () => {
                toast.error('Failed to delete notification');
            }
        }
    );

    const notifications = data?.data.notifications || [];
    const unreadCount = data?.data.unreadCount || 0;
    const pagination = data?.data.pagination || { page: 1, pages: 1, total: 0 };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'LIKE':
                return <HeartIcon className="h-5 w-5 text-red-500" />;
            case 'COMMENT':
                return <ChatBubbleLeftIcon className="h-5 w-5 text-blue-500" />;
            case 'MESSAGE':
                return <ChatBubbleLeftIcon className="h-5 w-5 text-green-500" />;
            case 'FRIEND_REQUEST':
                return <UserPlusIcon className="h-5 w-5 text-purple-500" />;
            case 'GROUP_INVITE':
                return <UserGroupIcon className="h-5 w-5 text-yellow-500" />;
            case 'EVENT':
                return <CalendarIcon className="h-5 w-5 text-indigo-500" />;
            case 'SYSTEM':
                return <MegaphoneIcon className="h-5 w-5 text-gray-500" />;
            case 'REPORT_UPDATE':
                return <ShieldCheckIcon className="h-5 w-5 text-orange-500" />;
            default:
                return <BellIcon className="h-5 w-5 text-gray-500" />;
        }
    };

    const getNotificationLink = (notification) => {
        switch (notification.type) {
            case 'LIKE':
            case 'COMMENT':
                return `/posts/${notification.data?.postId}`;
            case 'MESSAGE':
                return `/chat?user=${notification.data?.senderId}`;
            case 'FRIEND_REQUEST':
                return `/profile/${notification.data?.senderId}`;
            case 'GROUP_INVITE':
                return `/groups/${notification.data?.groupId}`;
            case 'EVENT':
                return `/events/${notification.data?.eventId}`;
            default:
                return '#';
        }
    };

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'unread') return !notification.read;
        if (filter === 'read') return notification.read;
        return true;
    });

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
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Notifications
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Stay updated with your activity
                    </p>
                </div>
                
                {unreadCount > 0 && (
                    <button
                        onClick={() => markAllAsReadMutation.mutate()}
                        disabled={markAllAsReadMutation.isLoading}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <CheckIcon className="h-5 w-5 mr-2" />
                        Mark all as read
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Filter:
                    </span>
                    {['all', 'unread', 'read'].map((filterType) => (
                        <button
                            key={filterType}
                            onClick={() => setFilter(filterType)}
                            className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                                filter === filterType
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                        >
                            {filterType}
                            {filterType === 'unread' && unreadCount > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
                {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors ${
                                !notification.read ? 'border-l-4 border-blue-500' : ''
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-4 flex-1">
                                    {/* Icon */}
                                    <div className="flex-shrink-0">
                                        <div className={`p-2 rounded-full ${
                                            !notification.read ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'
                                        }`}>
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {notification.title}
                                            </h3>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            {notification.message}
                                        </p>
                                        
                                        {notification.sender && (
                                            <div className="flex items-center mt-2">
                                                <img
                                                    src={notification.sender.profile?.profilePicture || 'default-avatar.png'}
                                                    alt={notification.sender.profile?.name}
                                                    className="h-5 w-5 rounded-full"
                                                />
                                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                                    {notification.sender.profile?.name}
                                                </span>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex items-center space-x-4 mt-3">
                                            <Link
                                                to={getNotificationLink(notification)}
                                                onClick={() => {
                                                    if (!notification.read) {
                                                        markAsReadMutation.mutate(notification._id);
                                                    }
                                                }}
                                                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                            >
                                                View Details →
                                            </Link>
                                            
                                            {!notification.read && (
                                                <button
                                                    onClick={() => markAsReadMutation.mutate(notification._id)}
                                                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400"
                                                >
                                                    Mark as read
                                                </button>
                                            )}
                                            
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Delete this notification?')) {
                                                        deleteNotificationMutation.mutate(notification._id);
                                                    }
                                                }}
                                                className="text-xs text-red-500 hover:text-red-700"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Read Status */}
                                {!notification.read && (
                                    <div className="ml-4">
                                        <span className="inline-flex h-2 w-2 rounded-full bg-blue-600"></span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <BellIconSolid className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No notifications
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            {filter === 'all' 
                                ? "You don't have any notifications yet"
                                : filter === 'unread'
                                ? "You don't have any unread notifications"
                                : "You don't have any read notifications"}
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === pagination.pages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Showing page <span className="font-medium">{page}</span> of{' '}
                                <span className="font-medium">{pagination.pages}</span>
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                                    let pageNum;
                                    if (pagination.pages <= 5) {
                                        pageNum = i + 1;
                                    } else if (page <= 3) {
                                        pageNum = i + 1;
                                    } else if (page >= pagination.pages - 2) {
                                        pageNum = pagination.pages - 4 + i;
                                    } else {
                                        pageNum = page - 2 + i;
                                    }
                                    
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                page === pageNum
                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900 dark:text-blue-200'
                                                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;