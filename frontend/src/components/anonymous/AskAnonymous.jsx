import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { anonymousService } from '../../services/anonymous';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AskAnonymous = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        questionTitle: '',
        questionBody: '',
        category: 'GENERAL'
    });

    const categories = [
        { id: 'CAMPUS', name: 'Campus' },
        { id: 'ACADEMIC', name: 'Academic' },
        { id: 'PLACEMENT', name: 'Placement' },
        { id: 'GENERAL', name: 'General' },
        { id: 'HOSTEL', name: 'Hostel' },
        { id: 'CANTEEN', name: 'Canteen' },
        { id: 'LIBRARY', name: 'Library' }
    ];

    const createPostMutation = useMutation(
        (data) => anonymousService.createPost(data),
        {
            onSuccess: () => {
                toast.success('Your question has been posted anonymously');
                onSuccess();
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to post question');
            }
        }
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.questionTitle.trim() || !formData.questionBody.trim()) {
            toast.error('Please fill in all fields');
            return;
        }
        createPostMutation.mutate(formData);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Ask Anonymously
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Privacy Notice */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            🔒 Your identity will remain completely anonymous. Your name and email will never be visible to others.
                        </p>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Category
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

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Question Title
                        </label>
                        <input
                            type="text"
                            name="questionTitle"
                            value={formData.questionTitle}
                            onChange={handleChange}
                            maxLength="200"
                            placeholder="e.g., How to prepare for placements?"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            {formData.questionTitle.length}/200 characters
                        </p>
                    </div>

                    {/* Body */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Question Details
                        </label>
                        <textarea
                            name="questionBody"
                            value={formData.questionBody}
                            onChange={handleChange}
                            rows="6"
                            maxLength="2000"
                            placeholder="Provide more details about your question..."
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            {formData.questionBody.length}/2000 characters
                        </p>
                    </div>

                    {/* Guidelines */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Anonymous Posting Guidelines
                        </h3>
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                            <li>• Be respectful and constructive</li>
                            <li>• No hate speech or harassment</li>
                            <li>• No personal information sharing</li>
                            <li>• No spam or promotional content</li>
                            <li>• Reports are taken seriously</li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createPostMutation.isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {createPostMutation.isLoading ? 'Posting...' : 'Post Anonymously'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AskAnonymous;