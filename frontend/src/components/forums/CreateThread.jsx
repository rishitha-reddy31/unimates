import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { forumService } from '../../services/forum';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CreateThread = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'GENERAL'
    });

    const categories = [
        { id: 'ACADEMICS', name: '📚 Academics', description: 'Coursework, exams, assignments' },
        { id: 'CODING', name: '💻 Coding', description: 'Programming, algorithms, debugging' },
        { id: 'PLACEMENTS', name: '💼 Placements', description: 'Company prep, interview experiences' },
        { id: 'PROJECTS', name: '🚀 Projects', description: 'Project ideas, collaboration' },
        { id: 'INTERNSHIPS', name: '🎯 Internships', description: 'Internship opportunities, experiences' },
        { id: 'GENERAL', name: '💬 General', description: 'Other academic discussions' }
    ];

    const createThreadMutation = useMutation(
        (data) => forumService.createThread(data),
        {
            onSuccess: () => {
                toast.success('Discussion created successfully!');
                onSuccess();
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Failed to create discussion');
            }
        }
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            toast.error('Please enter a title');
            return;
        }
        if (!formData.content.trim()) {
            toast.error('Please enter your question or discussion content');
            return;
        }
        createThreadMutation.mutate(formData);
    };

    return (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Start a Discussion
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Share your question, idea, or discussion topic with the community
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Category Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Select Category <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {categories.map(category => (
                                <label
                                    key={category.id}
                                    className={`relative flex flex-col p-4 border rounded-lg cursor-pointer transition-all ${
                                        formData.category === category.id
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="category"
                                        value={category.id}
                                        checked={formData.category === category.id}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="sr-only"
                                    />
                                    <span className="text-2xl mb-2">{category.name.split(' ')[0]}</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {category.name}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {category.description}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., How to approach dynamic programming problems?"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Be specific and descriptive with your title
                        </p>
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Content <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows="8"
                            placeholder="Describe your question or discussion topic in detail. Include any relevant code, examples, or context..."
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                            required
                        />
                        <div className="flex justify-between mt-1">
                            <p className="text-xs text-gray-500">
                                Minimum 30 characters. Markdown supported.
                            </p>
                            <p className={`text-xs ${
                                formData.content.length < 30 
                                    ? 'text-red-500' 
                                    : 'text-green-500'
                            }`}>
                                {formData.content.length}/5000
                            </p>
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                            💡 Tips for a Great Discussion
                        </h3>
                        <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                            <li>• Be clear and specific about your question or topic</li>
                            <li>• Include relevant context, code samples, or resources</li>
                            <li>• Show what you've already tried or researched</li>
                            <li>• Be respectful and constructive in your tone</li>
                            <li>• Tag your discussion with the appropriate category</li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createThreadMutation.isLoading || formData.content.length < 30}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {createThreadMutation.isLoading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Posting...
                                </span>
                            ) : (
                                'Post Discussion'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateThread;