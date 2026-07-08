import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { groupService } from '../../services/group';
import LoadingSpinner from '../common/LoadingSpinner';
import {
    DocumentTextIcon,
    DocumentArrowDownIcon,
    TrashIcon,
    CloudArrowUpIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const GroupResources = ({ groupId, isAdmin }) => {
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(null);
    const [resourceTitle, setResourceTitle] = useState('');
    const [resourceDescription, setResourceDescription] = useState('');
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery(
        ['group-resources', groupId],
        () => groupService.getGroupResources(groupId)
    );

    const uploadResourceMutation = useMutation(
        ({ file, title, description }) => groupService.addResource(groupId, file, title, description),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['group-resources', groupId]);
                toast.success('Resource uploaded successfully');
                setShowUploadModal(false);
                setUploadingFile(null);
                setResourceTitle('');
                setResourceDescription('');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to upload resource');
            }
        }
    );

    const deleteResourceMutation = useMutation(
        (resourceId) => groupService.deleteResource(groupId, resourceId),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['group-resources', groupId]);
                toast.success('Resource deleted');
            },
            onError: (error) => {
                toast.error('Failed to delete resource');
            }
        }
    );

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadingFile(file);
            setResourceTitle(file.name.split('.')[0]);
        }
    };

    const handleUpload = (e) => {
        e.preventDefault();
        if (!uploadingFile || !resourceTitle) {
            toast.error('Please select a file and provide a title');
            return;
        }
        uploadResourceMutation.mutate({
            file: uploadingFile,
            title: resourceTitle,
            description: resourceDescription
        });
    };

    const getFileIcon = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        switch(ext) {
            case 'pdf': return '📄';
            case 'doc':
            case 'docx': return '📝';
            case 'ppt':
            case 'pptx': return '📊';
            case 'xls':
            case 'xlsx': return '📈';
            default: return '📁';
        }
    };

    const resources = data?.data.resources || [];

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-500" />
                        Group Resources
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Shared files and documents
                    </p>
                </div>
                
                {(isAdmin || true) && (
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                        Upload Resource
                    </button>
                )}
            </div>

            {/* Resources List */}
            {resources.length > 0 ? (
                <div className="space-y-3">
                    {resources.map((resource) => (
                        <div
                            key={resource._id}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="flex items-start flex-1">
                                <div className="text-2xl mr-3">
                                    {getFileIcon(resource.title)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        {resource.title}
                                    </h4>
                                    {resource.description && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {resource.description}
                                        </p>
                                    )}
                                    <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-500">
                                        <span>Uploaded by {resource.uploadedBy?.profile?.name}</span>
                                        <span className="mx-2">•</span>
                                        <span>{formatDistanceToNow(new Date(resource.uploadedAt), { addSuffix: true })}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <a
                                    href={resource.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                                >
                                    <DocumentArrowDownIcon className="h-5 w-5" />
                                </a>
                                
                                {(isAdmin || resource.uploadedBy?._id === localStorage.getItem('userId')) && (
                                    <button
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to delete this resource?')) {
                                                deleteResourceMutation.mutate(resource._id);
                                            }
                                        }}
                                        className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📁</div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No resources yet
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Be the first to share a resource with the group!
                    </p>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                        Upload First Resource
                    </button>
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Upload Resource
                            </h3>
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleUpload}>
                            <div className="space-y-4">
                                {/* File Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        File
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                                        {uploadingFile ? (
                                            <div>
                                                <div className="text-4xl mb-2">
                                                    {getFileIcon(uploadingFile.name)}
                                                </div>
                                                <p className="text-sm text-gray-900 dark:text-white mb-2">
                                                    {uploadingFile.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                                                    {(uploadingFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => setUploadingFile(null)}
                                                    className="text-sm text-red-600 hover:text-red-700"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ) : (
                                            <div>
                                                <CloudArrowUpIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                    Drag and drop your file here, or{' '}
                                                    <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                                                        browse
                                                        <input
                                                            type="file"
                                                            onChange={handleFileChange}
                                                            className="hidden"
                                                            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                                                        />
                                                    </label>
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                                    Maximum file size: 10MB
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Resource Title
                                    </label>
                                    <input
                                        type="text"
                                        value={resourceTitle}
                                        onChange={(e) => setResourceTitle(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        value={resourceDescription}
                                        onChange={(e) => setResourceDescription(e.target.value)}
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploadResourceMutation.isLoading || !uploadingFile}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {uploadResourceMutation.isLoading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupResources;