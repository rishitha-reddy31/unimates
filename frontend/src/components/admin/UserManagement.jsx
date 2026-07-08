import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminService } from '../../services/admin';
import LoadingSpinner from '../common/LoadingSpinner';
import {
    MagnifyingGlassIcon,
    ShieldCheckIcon,
    ShieldExclamationIcon,
    UserCircleIcon,
    CheckCircleIcon,
    XCircleIcon,
    TrashIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const UserManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery(
        ['admin-users', page, searchQuery, roleFilter, statusFilter],
        () => adminService.getUsers(page, searchQuery, 
            roleFilter !== 'all' ? roleFilter : undefined,
            statusFilter !== 'all' ? statusFilter === 'active' : undefined
        ),
        {
            keepPreviousData: true
        }
    );

    const updateStatusMutation = useMutation(
        ({ userId, isActive }) => adminService.updateUserStatus(userId, isActive),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('admin-users');
                toast.success('User status updated');
            },
            onError: () => {
                toast.error('Failed to update user status');
            }
        }
    );

    const updateRoleMutation = useMutation(
        ({ userId, role }) => adminService.updateUserRole(userId, role),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('admin-users');
                toast.success('User role updated');
            },
            onError: () => {
                toast.error('Failed to update user role');
            }
        }
    );

    const deleteUserMutation = useMutation(
        (userId) => adminService.deleteUser(userId),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('admin-users');
                toast.success('User deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete user');
            }
        }
    );

    const users = data?.data.users || [];
    const pagination = data?.data.pagination || { page: 1, pages: 1, total: 0 };

    const handleRoleChange = (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'student' : 'admin';
        if (window.confirm(`Change user role to ${newRole}?`)) {
            updateRoleMutation.mutate({ userId, role: newRole });
        }
    };

    const handleStatusToggle = (userId, currentStatus) => {
        const action = currentStatus ? 'deactivate' : 'activate';
        if (window.confirm(`Are you sure you want to ${action} this user?`)) {
            updateStatusMutation.mutate({ userId, isActive: !currentStatus });
        }
    };

    const handleDeleteUser = (userId, userName) => {
        if (window.confirm(`Are you sure you want to permanently delete ${userName}? This action cannot be undone.`)) {
            deleteUserMutation.mutate(userId);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    User Management
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Manage user accounts, roles, and permissions
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* Role Filter */}
                    <div className="sm:w-48">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                            <option value="all">All Roles</option>
                            <option value="student">Students</option>
                            <option value="admin">Admins</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="sm:w-48">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Joined
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Activity
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img
                                                src={user.profile?.profilePicture || 'default-avatar.png'}
                                                alt={user.profile?.name}
                                                className="h-10 w-10 rounded-full"
                                            />
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {user.profile?.name}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {user.email}
                                                </div>
                                                <div className="text-xs text-gray-400 dark:text-gray-500">
                                                    {user.profile?.branch} • {user.profile?.year}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            user.role === 'admin'
                                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        }`}>
                                            {user.role === 'admin' ? 'Admin' : 'Student'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            user.isActive
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(user.lastActive).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleRoleChange(user._id, user.role)}
                                                disabled={updateRoleMutation.isLoading}
                                                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                                title={user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                                            >
                                                {user.role === 'admin' ? (
                                                    <ShieldExclamationIcon className="h-5 w-5" />
                                                ) : (
                                                    <ShieldCheckIcon className="h-5 w-5" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleStatusToggle(user._id, user.isActive)}
                                                disabled={updateStatusMutation.isLoading}
                                                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                                title={user.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                {user.isActive ? (
                                                    <XCircleIcon className="h-5 w-5" />
                                                ) : (
                                                    <CheckCircleIcon className="h-5 w-5" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user._id, user.profile?.name)}
                                                disabled={deleteUserMutation.isLoading}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                title="Delete User"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
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
        </div>
    );
};

export default UserManagement;