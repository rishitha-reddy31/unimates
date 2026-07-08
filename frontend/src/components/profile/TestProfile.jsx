// frontend/src/components/profile/TestProfile.jsx
import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const TestProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600"></div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end -mt-12">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <img
                src={user.profilePicture || user.profile?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.username || 'User')}&background=2563eb&color=fff&size=128`}
                alt={user.fullName || user.username}
                className="h-24 w-24 rounded-full border-4 border-white dark:border-gray-800 object-cover"
              />
            </div>

            {/* User Info */}
            <div className="mt-4 sm:mt-0 sm:ml-4 flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.fullName || user.username}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                {user.branch || 'Branch not specified'} • {user.year || 'Year not specified'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {user.email}
              </p>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="mt-4">
              <p className="text-gray-700 dark:text-gray-300">{user.bio}</p>
            </div>
          )}

          {/* Stats */}
          <div className="mt-6 flex items-center space-x-6">
            <div className="text-center">
              <span className="block text-xl font-bold text-gray-900 dark:text-white">
                {user.followersCount || 0}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Followers</span>
            </div>
            <div className="text-center">
              <span className="block text-xl font-bold text-gray-900 dark:text-white">
                {user.followingCount || 0}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Following</span>
            </div>
          </div>

          {/* Debug Info - Remove in production */}
          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Debug Info:</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestProfile;