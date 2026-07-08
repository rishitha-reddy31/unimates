import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { adminService } from '../../services/admin';
import { Link } from 'react-router-dom';
import {
    UsersIcon,
    DocumentTextIcon,
    CalendarIcon,
    FlagIcon,
    UserGroupIcon,
    ChartBarIcon,
    ExclamationTriangleIcon,
    ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../common/LoadingSpinner';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const AdminDashboard = () => {
    const [timeRange, setTimeRange] = useState('week');

    const { data, isLoading, error } = useQuery(
        ['admin-stats', timeRange],
        () => adminService.getStats(timeRange),
        {
            refetchInterval: 30000
        }
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Failed to load dashboard
                </h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                    Please try again later
                </p>
            </div>
        );
    }

    const stats = data?.data.stats || {};
    const recentActivity = data?.data.recentActivity || { users: [], reports: [] };

    const statsCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers || 0,
            icon: UsersIcon,
            color: 'bg-blue-500',
            link: '/admin/users'
        },
        {
            title: 'Total Posts',
            value: stats.totalPosts || 0,
            icon: DocumentTextIcon,
            color: 'bg-green-500',
            link: '/admin/content'
        },
        {
            title: 'Total Events',
            value: stats.totalEvents || 0,
            icon: CalendarIcon,
            color: 'bg-purple-500',
            link: '/admin/events'
        },
        {
            title: 'Total Groups',
            value: stats.totalGroups || 0,
            icon: UserGroupIcon,
            color: 'bg-yellow-500',
            link: '/admin/groups'
        },
        {
            title: 'Pending Reports',
            value: stats.pendingReports || 0,
            icon: FlagIcon,
            color: 'bg-red-500',
            link: '/admin/reports'
        },
        {
            title: 'Anonymous Posts',
            value: stats.anonymousPosts || 0,
            icon: ChartBarIcon,
            color: 'bg-indigo-500',
            link: '/admin/anonymous'
        }
    ];

    const chartData = {
        labels: stats.chartLabels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'New Users',
                data: stats.newUsersData || [0, 0, 0, 0, 0, 0, 0],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4
            },
            {
                label: 'New Posts',
                data: stats.newPostsData || [0, 0, 0, 0, 0, 0, 0],
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: document.documentElement.classList.contains('dark') ? '#fff' : '#374151'
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: document.documentElement.classList.contains('dark') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                },
                ticks: {
                    color: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6B7280'
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6B7280'
                }
            }
        }
    };

    const userTypeData = {
        labels: ['Students', 'Admins'],
        datasets: [
            {
                data: [stats.studentCount || 0, stats.adminCount || 0],
                backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)'],
                borderColor: ['rgb(59, 130, 246)', 'rgb(16, 185, 129)'],
                borderWidth: 1
            }
        ]
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Admin Dashboard
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Monitor and manage your Unimates platform
                    </p>
                </div>
                
                {/* Time Range Selector */}
                <div className="mt-4 sm:mt-0">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                    >
                        <option value="week">Last 7 days</option>
                        <option value="month">Last 30 days</option>
                        <option value="year">Last 12 months</option>
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                {statsCards.map((card, index) => (
                    <Link
                        key={index}
                        to={card.link}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center">
                            <div className={`${card.color} p-3 rounded-lg`}>
                                <card.icon className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {card.title}
                                </p>
                                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                    {card.value.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Activity Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Platform Activity
                    </h2>
                    <div className="h-80">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                </div>

                {/* User Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        User Distribution
                    </h2>
                    <div className="h-64 flex items-center justify-center">
                        <Doughnut 
                            data={userTypeData} 
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        labels: {
                                            color: document.documentElement.classList.contains('dark') ? '#fff' : '#374151'
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Recent Users
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {recentActivity.users.length > 0 ? (
                            recentActivity.users.map((user) => (
                                <div key={user._id} className="px-6 py-4 flex items-center">
                                    <img
                                        src={user.profile?.profilePicture || 'default-avatar.png'}
                                        alt={user.profile?.name}
                                        className="h-10 w-10 rounded-full"
                                    />
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {user.profile?.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {user.email}
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-8 text-center">
                                <p className="text-gray-500 dark:text-gray-400">
                                    No recent users
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Reports */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Pending Reports
                        </h2>
                        <Link
                            to="/admin/reports"
                            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                            View All
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {recentActivity.reports.length > 0 ? (
                            recentActivity.reports.map((report) => (
                                <div key={report._id} className="px-6 py-4">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <FlagIcon className="h-5 w-5 text-red-500" />
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                Reported by {report.reportedBy?.profile?.name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Reason: {report.reason}
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                {new Date(report.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-8 text-center">
                                <p className="text-gray-500 dark:text-gray-400">
                                    No pending reports
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;