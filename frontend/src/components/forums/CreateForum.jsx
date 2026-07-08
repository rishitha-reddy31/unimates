// frontend/src/components/forums/CreateForum.jsx
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { forumService } from '../../services/forum';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CreateForum = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'GENERAL',
    tags: '',
    isAnonymous: false
  });

  const categories = [
    { id: 'GENERAL', name: '📢 General Discussion' },
    { id: 'ACADEMIC', name: '📚 Academic' },
    { id: 'CAREER', name: '💼 Career' },
    { id: 'TECHNICAL', name: '💻 Technical' },
    { id: 'PROJECTS', name: '🚀 Projects' },
    { id: 'INTERNSHIPS', name: '🎯 Internships' },
    { id: 'PLACEMENTS', name: '🏢 Placements' },
    { id: 'EVENTS', name: '🎉 Events' },
    { id: 'OTHER', name: '✨ Other' }
  ];

  const createForumMutation = useMutation(
    (data) => {
      console.log('📦 Sending forum data to API:', data);
      return forumService.createForum(data);
    },
    {
      onSuccess: (data) => {
        console.log('✅ Forum creation success:', data);
        toast.success('Forum post created successfully!');
        if (typeof onSuccess === 'function') {
          onSuccess(data.data.forum);
        }
        if (typeof onClose === 'function') {
          onClose();
        }
      },
      onError: (error) => {
        console.error('❌ Create forum error:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        toast.error(error.response?.data?.message || 'Failed to create forum post');
      }
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('📝 Form submitted with data:', formData);
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('Please enter content');
      return;
    }
    
    // Process tags - convert comma-separated string to array
    const tagsArray = formData.tags 
      ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      : [];
    
    const submitData = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      category: formData.category,
      tags: tagsArray,
      isAnonymous: formData.isAnonymous
    };
    
    console.log('📦 Submitting processed data:', submitData);
    createForumMutation.mutate(submitData);
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
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Start a Discussion
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            type="button"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="What would you like to discuss?"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="6"
              placeholder="Write your thoughts, questions, or ideas..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
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
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., doubt, help, question"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500">
              Separate tags with commas (e.g., python, help, doubt)
            </p>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isAnonymous"
              checked={formData.isAnonymous}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Post anonymously
            </label>
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
              📋 Discussion Guidelines
            </h3>
            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
              <li>• Be respectful and constructive in your discussions</li>
              <li>• Stay on topic and keep discussions relevant</li>
              <li>• No spam, harassment, or inappropriate content</li>
              <li>• Cite sources when sharing information</li>
              <li>• Report any violations to moderators</li>
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
              disabled={createForumMutation.isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {createForumMutation.isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Posting...
                </>
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

export default CreateForum;