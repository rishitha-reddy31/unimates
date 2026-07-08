// frontend/src/components/feed/CreatePost.jsx
import React, { useState, useRef } from 'react';
import { useMutation } from 'react-query';
import { postService } from '../../services/post';
import { XMarkIcon, PhotoIcon, VideoCameraIcon, XCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CreatePost = ({ onClose, onSuccess }) => {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const fileInputRef = useRef(null);

  const createPostMutation = useMutation(
    (formData) => postService.createPost(formData),
    {
      onSuccess: (data) => {
        toast.success('Post created successfully!');
        if (onSuccess) onSuccess(data.data.post);
        if (onClose) onClose();
      },
      onError: (error) => {
        console.error('Create post error:', error);
        toast.error(error.response?.data?.message || 'Failed to create post');
      }
    }
  );

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/');
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB
      
      if (!isValidType) {
        toast.error(`${file.name} is not a supported file type`);
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large (max 50MB)`);
      }
      
      return isValidType && isValidSize;
    });

    // Create previews
    const newPreviews = validFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video'
    }));

    setMediaFiles([...mediaFiles, ...validFiles]);
    setMediaPreviews([...mediaPreviews, ...newPreviews]);
  };

  const removeMedia = (index) => {
    URL.revokeObjectURL(mediaPreviews[index].url);
    const newFiles = mediaFiles.filter((_, i) => i !== index);
    const newPreviews = mediaPreviews.filter((_, i) => i !== index);
    setMediaFiles(newFiles);
    setMediaPreviews(newPreviews);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!content.trim() && mediaFiles.length === 0) {
      toast.error('Please add some content or media');
      return;
    }

    const formData = new FormData();
    formData.append('content', content);
    formData.append('isAnonymous', isAnonymous);
    
    mediaFiles.forEach(file => {
      formData.append('media', file);
    });

    createPostMutation.mutate(formData);
  };

  const handleClose = () => {
    // Clean up preview URLs
    mediaPreviews.forEach(preview => URL.revokeObjectURL(preview.url));
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create Post
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* User Info */}
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={isAnonymous ? 'https://ui-avatars.com/api/?name=Anonymous&background=6b7280&color=fff&size=40' : `https://ui-avatars.com/api/?name=${encodeURIComponent('User')}&background=2563eb&color=fff&size=40`}
              alt="User"
              className="h-10 w-10 rounded-full"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {isAnonymous ? 'Anonymous' : 'You'}
              </p>
              <label className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="mr-2"
                />
                Post anonymously
              </label>
            </div>
          </div>

          {/* Content Input */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
          />

          {/* Media Previews */}
          {mediaPreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              {mediaPreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  {preview.type === 'image' ? (
                    <img
                      src={preview.url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <video
                      src={preview.url}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Media Upload Buttons */}
          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <PhotoIcon className="h-5 w-5 text-blue-500" />
              <span>Photo</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <VideoCameraIcon className="h-5 w-5 text-green-500" />
              <span>Video</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createPostMutation.isLoading || (!content.trim() && mediaFiles.length === 0)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {createPostMutation.isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Posting...
                </>
              ) : (
                'Post'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;