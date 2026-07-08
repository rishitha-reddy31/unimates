// frontend/src/components/profile/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/user';
import { postService } from '../../services/post';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  UserCircleIcon,
  AcademicCapIcon,
  HeartIcon,
  CalendarIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  TrophyIcon,
  LinkIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { id } = useParams();
  const { user: authUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');

  console.log('🔍 Profile Debug:');
  console.log('  - URL ID:', id);
  console.log('  - Auth User:', authUser);

  // Extract the actual user data from the auth response
  const currentUser = authUser?.data?.user || authUser?.user || authUser;
  
  console.log('  - Extracted Current User:', currentUser);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Determine which user ID to fetch
  let userId = null;
  
  if (id) {
    // If URL has an ID, use that
    userId = id;
    console.log('  - Using URL ID:', userId);
  } else if (currentUser) {
    // If no URL ID, use current user's ID
    userId = currentUser.id || currentUser._id;
    console.log('  - Using Current User ID:', userId);
  }

  const isOwnProfile = userId === (currentUser?.id || currentUser?._id);
  console.log('  - Is Own Profile:', isOwnProfile);

  // Fetch user profile
  const { 
    data: profileData, 
    isLoading: profileLoading,
    error: profileError 
  } = useQuery(
    ['profile', userId],
    () => userService.getProfile(userId),
    {
      enabled: !!userId, // Only run if userId exists
      retry: 1,
      onError: (error) => {
        console.error('Profile fetch error:', error);
      }
    }
  );

  // Fetch user posts
  const { 
    data: postsData, 
    isLoading: postsLoading 
  } = useQuery(
    ['user-posts', userId],
    () => postService.getUserPosts(userId),
    {
      enabled: !!userId && activeTab === 'posts'
    }
  );

  // Handle loading state
  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <UserCircleIcon className="h-24 w-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Profile Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Unable to load profile. Please try again.
          </p>
          <button
            onClick={() => navigate('/feed')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Feed
          </button>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Handle error or no data
  if (profileError || !profileData?.data?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <UserCircleIcon className="h-24 w-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The user you're looking for doesn't exist or has been removed.
          </p>
          <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-left text-sm">
            <p className="font-semibold mb-2">Debug Info:</p>
            <p>User ID: {userId}</p>
            <p>Error: {profileError?.message || 'User not found'}</p>
            <p>Auth Status: {isAuthenticated ? 'Logged in' : 'Not logged in'}</p>
          </div>
          <button
            onClick={() => navigate('/feed')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Feed
          </button>
        </div>
      </div>
    );
  }

  const profile = profileData.data.user;
  const posts = postsData?.data?.posts || [];

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
        {/* Cover Photo */}
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end -mt-12">
            {/* Avatar */}
            
<img
  src={
    profile.profilePicture
      ? profile.profilePicture.startsWith('http')
        ? profile.profilePicture
        : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${profile.profilePicture}`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || profile.username || 'User')}&background=2563eb&color=fff&size=128`
  }
  alt={profile.fullName || profile.username}
  className="h-24 w-24 rounded-full border-4 border-white dark:border-gray-800 object-cover"
  onError={(e) => {
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || profile.username || 'User')}&background=2563eb&color=fff&size=128`;
  }}
/>

            {/* User Info */}
            <div className="mt-4 sm:mt-0 sm:ml-4 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile.fullName || profile.username}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400">
                    {profile.branch || 'CSE'} • {profile.year || '3rd Year'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                    <EnvelopeIcon className="h-4 w-4 mr-1" />
                    {profile.email}
                  </p>
                </div>
                
                {isOwnProfile && (
                  <Link
                    to="/profile/edit"
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  >
                    Edit Profile
                  </Link>
                )}
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap italic">
                    "{profile.bio}"
                  </p>
                </div>
              )}

              {/* Stats */}
              <div className="mt-4 flex items-center space-x-6">
                <div className="text-center">
                  <span className="block text-xl font-bold text-gray-900 dark:text-white">
                    {profile.followersCount || 0}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Followers</span>
                </div>
                <div className="text-center">
                  <span className="block text-xl font-bold text-gray-900 dark:text-white">
                    {profile.followingCount || 0}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Following</span>
                </div>
                <div className="text-center">
                  <span className="block text-xl font-bold text-gray-900 dark:text-white">
                    {profile.postsCount || posts.length || 0}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Posts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'posts'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
            }`}
          >
            Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'skills'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
            }`}
          >
            Skills
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'projects'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
            }`}
          >
            Projects ({profile.projects?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'achievements'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
            }`}
          >
            Achievements ({profile.achievements?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'about'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
            }`}
          >
            About
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {postsLoading ? (
              <div className="flex justify-center">
                <LoadingSpinner size="md" />
              </div>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <img
                      src={profile.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || 'User')}&background=2563eb&color=fff`}
                      alt={profile.fullName}
                      className="h-10 w-10 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {profile.fullName || profile.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(post.createdAt)}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{post.content}</p>
                  {post.image && (
                    <img src={post.image} alt="Post" className="mt-4 rounded-lg max-h-96 w-full object-cover" />
                  )}
                  <div className="mt-4 flex items-center space-x-4 text-gray-500 dark:text-gray-400">
                    <button className="flex items-center space-x-1 hover:text-blue-600">
                      <span>❤️</span>
                      <span>{post.likesCount || 0}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-blue-600">
                      <span>💬</span>
                      <span>{post.commentsCount || 0}</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <p className="text-gray-500 dark:text-gray-400">
                  No posts yet
                </p>
              </div>
            )}
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            {/* Skills */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <AcademicCapIcon className="h-5 w-5 mr-2 text-blue-500" />
                Technical Skills
              </h3>
              {profile.skills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm dark:bg-blue-900 dark:text-blue-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No skills added yet</p>
              )}
            </div>

            {/* Hobbies/Interests */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <HeartIcon className="h-5 w-5 mr-2 text-red-500" />
                Hobbies & Interests
              </h3>
              {profile.interests?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((item, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm dark:bg-purple-900 dark:text-purple-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No hobbies added yet</p>
              )}
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <BriefcaseIcon className="h-5 w-5 mr-2 text-green-500" />
              Projects
            </h3>
            
            {profile.projects?.length > 0 ? (
              <div className="space-y-6">
                {profile.projects.map((project, index) => (
                  <div 
                    key={project.id || index} 
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {project.title}
                      </h4>
                      {project.createdAt && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(project.createdAt)}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-wrap">
                      {project.description}
                    </p>
                    
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {project.technologies.map((tech, i) => (
                          <span 
                            key={i}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs dark:bg-gray-700 dark:text-gray-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {project.link && (
                      <a 
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center text-blue-600 hover:text-blue-700 text-sm"
                      >
                        <LinkIcon className="h-4 w-4 mr-1" />
                        View Project
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  No projects added yet
                </p>
              </div>
            )}
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <TrophyIcon className="h-5 w-5 mr-2 text-yellow-500" />
              Achievements
            </h3>
            
            {profile.achievements?.length > 0 ? (
              <div className="space-y-4">
                {profile.achievements.map((achievement, index) => (
                  <div 
                    key={achievement.id || index} 
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {achievement.title}
                      </h4>
                      {achievement.date && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded dark:bg-yellow-900 dark:text-yellow-200">
                          {formatDate(achievement.date)}
                        </span>
                      )}
                    </div>
                    
                    {achievement.description && (
                      <p className="text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-wrap">
                        {achievement.description}
                      </p>
                    )}
                    
                    {achievement.issuer && (
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Issued by: {achievement.issuer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrophyIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  No achievements added yet
                </p>
              </div>
            )}
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              About
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Full Name</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {profile.fullName || 'Not specified'}
                </span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Username</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  @{profile.username || 'Not specified'}
                </span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Email</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {profile.email}
                </span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Branch</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {profile.branch || 'CSE'}
                </span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Year</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {profile.year || '3rd Year'}
                </span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Phone</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {profile.phoneNumber || 'Not provided'}
                </span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Bio</span>
                <span className="font-medium text-gray-900 dark:text-white max-w-md text-right">
                  {profile.bio || 'No bio provided'}
                </span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Interests</span>
                <span className="font-medium text-gray-900 dark:text-white max-w-md text-right">
                  {profile.interests?.join(', ') || 'Not specified'}
                </span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Skills</span>
                <span className="font-medium text-gray-900 dark:text-white max-w-md text-right">
                  {profile.skills?.join(', ') || 'Not specified'}
                </span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Projects</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {profile.projects?.length || 0} projects
                </span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Achievements</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {profile.achievements?.length || 0} achievements
                </span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Member since</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {profile.createdAt ? formatDate(profile.createdAt) : 'Recently'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;