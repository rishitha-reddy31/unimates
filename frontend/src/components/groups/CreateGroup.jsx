// frontend/src/components/groups/CreateGroup.jsx
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { groupService } from '../../services/group';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CreateGroup = ({ onClose, onSuccess }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'STUDY',
        isPrivate: false
    });

    const categories = [
        { id: 'STUDY', name: '📚 Study Group' },
        { id: 'CODING', name: '💻 Coding Group' },
        { id: 'PROJECT', name: '🚀 Project Team' },
        { id: 'PLACEMENT', name: '💼 Placement Prep' },
        { id: 'INTERNSHIP', name: '🎯 Internship Hunt' },
        { id: 'CULTURAL', name: '🎨 Cultural Club' },
        { id: 'SPORTS', name: '⚽ Sports Team' },
        { id: 'OTHER', name: '✨ Other' }
    ];

    const createGroupMutation = useMutation(
        (data) => {
            console.log('🔄 Creating group with data:', data);
            return groupService.createGroup(data);
        },
        {
            onSuccess: (data) => {
                console.log('✅ Group creation success:', data);
                toast.success('Group created successfully!');
                
                // Call onSuccess if it's a function
                if (typeof onSuccess === 'function') {
                    onSuccess(data.data.group);
                }
                
                // Close the modal
                if (typeof onClose === 'function') {
                    onClose();
                }
                
                // Navigate to the new group
                if (data.data.group?.id) {
                    navigate(`/groups/${data.data.group.id}`);
                }
            },
            onError: (error) => {
                console.error('❌ Group creation error:', error);
                console.error('Error response:', error.response?.data);
                console.error('Error status:', error.response?.status);
                toast.error(error.response?.data?.message || 'Failed to create group');
            }
        }
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('📝 Form submitted with data:', formData);
        
        if (!formData.name.trim()) {
            toast.error('Please enter a group name');
            return;
        }
        if (!formData.description.trim()) {
            toast.error('Please enter a group description');
            return;
        }
        
        createGroupMutation.mutate(formData);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleClose = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof onClose === 'function') {
            onClose();
        } else {
            // Fallback navigation if onClose is not provided
            navigate('/groups');
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Create New Group
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Close"
                        type="button"
                    >
                        <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Group Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Group Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., Computer Science 2024"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="What is this group about? What are the goals?"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                            required
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        >
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Privacy Setting */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Privacy Setting
                        </label>
                        <div className="space-y-3">
                            <label className="flex items-start p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                                <input
                                    type="radio"
                                    name="isPrivate"
                                    checked={!formData.isPrivate}
                                    onChange={() => setFormData({ ...formData, isPrivate: false })}
                                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="ml-3">
                                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Public Group
                                    </span>
                                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                                        Anyone can see the group and join immediately
                                    </span>
                                </span>
                            </label>
                            <label className="flex items-start p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                                <input
                                    type="radio"
                                    name="isPrivate"
                                    checked={formData.isPrivate}
                                    onChange={() => setFormData({ ...formData, isPrivate: true })}
                                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="ml-3">
                                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Private Group
                                    </span>
                                    <span className="block text-xs text-gray-500 dark:text-gray-400">
                                        Only members can see the group, join requests require approval
                                    </span>
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Guidelines */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                            📋 Group Creation Guidelines
                        </h3>
                        <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                            <li>• Create groups for genuine academic and social purposes</li>
                            <li>• Respect campus policies and community guidelines</li>
                            <li>• Avoid creating duplicate groups for the same purpose</li>
                            <li>• Actively moderate your group if you're an admin</li>
                            <li>• You can add more admins later to help manage</li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createGroupMutation.isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                        >
                            {createGroupMutation.isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </>
                            ) : (
                                'Create Group'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroup;