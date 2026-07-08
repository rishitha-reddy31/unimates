import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { reportService } from '../../services/report';
import LoadingSpinner from '../common/LoadingSpinner';
import {
    FlagIcon,
    CheckCircleIcon,
    XCircleIcon,
    EyeIcon,
    ChatBubbleLeftIcon,
    UserCircleIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const Reports = () => {
    const [statusFilter, setStatusFilter] = useState('PENDING');
    const [page, setPage] = useState(1);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery(
        ['reports', statusFilter, page],
        () => reportService.getReports(statusFilter, page),
        {
            keepPreviousData: true,
            refetchInterval: 10000
        }
    );

    const resolveReportMutation = useMutation(
        ({ reportId, action }) => reportService.resolveReport(reportId, action),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('reports');
                toast.success('Report resolved');
            },
            onError: () => {
                toast.error('Failed to resolve report');
            }
        }
    );

    const dismissReportMutation = useMutation(
        (reportId) => reportService.dismissReport(reportId),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('reports');
                toast.success('Report dismissed');
            },
            onError: () => {
                toast.error('Failed to dismiss report');
            }
        }
    );

    const reports = data?.data.reports || [];
    const pagination = data?.data.pagination || { page: 1, pages: 1, total: 0 };

    const getContentTypeIcon = (type) => {
        switch (type) {
            case 'POST':
                return <DocumentTextIcon className="h-5 w-5" />;
            case 'COMMENT':
                return <ChatBubbleLeftIcon className="h-5 w-5" />;
            case 'USER':
                return <UserCircleIcon className="h-5 w-5" />;
            default:
                return <FlagIcon className="h-5 w-5" />;
        }
    };

    const getContentTypeColor = (type) => {
        switch (type) {
            case 'POST':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'COMMENT':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'USER':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    const getReasonColor = (reason) => {
        switch (reason) {
            case 'SPAM':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'HARASSMENT':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'HATE_SPEECH':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'INAPPROPRIATE':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
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
                    Reports Management
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Review and resolve user reports
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status:
                    </span>
                    {['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                statusFilter === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                        >
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reports List */}
            <div className="space-y-6">
                {reports.length > 0 ? (
                    reports.map((report) => (
                        <div
                            key={report._id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                        >
                            <div className="flex items-start justify-between">
                                {/* Report Info */}
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getContentTypeColor(report.reportedContent?.contentType)}`}>
                                            {getContentTypeIcon(report.reportedContent?.contentType)}
                                            <span className="ml-1">
                                                {report.reportedContent?.contentType}
                                            </span>
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReasonColor(report.reason)}`}>
                                            {report.reason}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            Reported {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>

                                    {/* Reported By */}
                                    <div className="flex items-center mb-3">
                                        <img
                                            src={report.reportedBy?.profile?.profilePicture || 'default-avatar.png'}
                                            alt={report.reportedBy?.profile?.name}
                                            className="h-6 w-6 rounded-full"
                                        />
                                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                            Reported by {report.reportedBy?.profile?.name}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    {report.description && (
                                        <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                                            "{report.description}"
                                        </p>
                                    )}

                                    {/* Content Preview */}
                                    {report.reportedContent?.contentType === 'POST' && (
                                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Content ID: {report.reportedContent.contentId}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                {statusFilter === 'PENDING' && (
                                    <div className="ml-4 flex flex-col space-y-2">
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Resolve this report? This will mark it as reviewed.')) {
                                                    resolveReportMutation.mutate({
                                                        reportId: report._id,
                                                        action: 'NONE'
                                                    });
                                                }
                                            }}
                                            disabled={resolveReportMutation.isLoading}
                                            className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                                        >
                                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                                            Resolve
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (window.confirm('Dismiss this report?')) {
                                                    dismissReportMutation.mutate(report._id);
                                                }
                                            }}
                                            disabled={dismissReportMutation.isLoading}
                                            className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50"
                                        >
                                            <XCircleIcon className="h-4 w-4 mr-1" />
                                            Dismiss
                                        </button>
                                    </div>
                                )}

                                {statusFilter !== 'PENDING' && (
                                    <div className="ml-4">
                                        <span className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                                            report.status === 'RESOLVED'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : report.status === 'DISMISSED'
                                                ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                        }`}>
                                            {report.status}
                                        </span>
                                        {report.resolvedBy && (
                                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                Resolved by {report.resolvedBy?.profile?.name}
                                                <br />
                                                {new Date(report.resolvedAt).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                        <FlagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            No reports found
                        </h3>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                            {statusFilter === 'PENDING' 
                                ? 'No pending reports to review'
                                : `No ${statusFilter.toLowerCase()} reports`}
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

export default Reports;