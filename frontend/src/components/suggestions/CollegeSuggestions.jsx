// frontend/src/components/suggestions/CollegeSuggestions.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/user';
import { followService } from '../../services/follow';
import LoadingSpinner from '../common/LoadingSpinner';
import { 
  UserPlusIcon, 
  UserMinusIcon, 
  UserCircleIcon, 
  AcademicCapIcon,
  ChatBubbleLeftIcon 
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CollegeSuggestions = () => {
  const { user: authUser, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    following: 0,
    pendingSent: 0,
    pendingReceived: 0,
    collegeName: '',
    domain: ''
  });
  const [followingStates, setFollowingStates] = useState({});
  const [followLoading, setFollowLoading] = useState({});

  // Extract current user
  const currentUser = authUser?.data?.user || authUser?.user || authUser;

useEffect(() => {
  console.log('🔍 Component mounted, fetching data...');
  fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Keep empty array as we only want to fetch once on mount

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch college students for stats
      const collegeResponse = await userService.getCollegeInfo();
      console.log('College response:', collegeResponse.data);
      
      if (collegeResponse.data.success) {
        setStats({
          totalStudents: collegeResponse.data.stats?.totalStudents || collegeResponse.data.users?.length || 0,
          following: collegeResponse.data.stats?.following || 0,
          pendingSent: collegeResponse.data.stats?.pendingSent || 0,
          pendingReceived: collegeResponse.data.stats?.pendingReceived || 0,
          collegeName: collegeResponse.data.college?.name || 'Your College',
          domain: collegeResponse.data.college?.domain || currentUser?.email?.split('@')[1] || 'mrcet.ac.in'
        });
      }

      // Fetch suggestions
      const suggestionsResponse = await userService.getCollegeSuggestions();
      console.log('Suggestions response:', suggestionsResponse.data);
      
      if (suggestionsResponse.data.success) {
        const suggestionsData = suggestionsResponse.data.suggestions || [];
        setSuggestions(suggestionsData);
        
        // Initialize following states
        const initialFollowingStates = {};
        suggestionsData.forEach(user => {
          initialFollowingStates[user.id] = user.isFollowing || false;
        });
        setFollowingStates(initialFollowingStates);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    console.log('🔘 Follow button clicked for user:', userId);
    
    // Prevent double clicks
    if (followLoading[userId]) {
      console.log('⏳ Already processing follow for user:', userId);
      return;
    }
    
    try {
      // Set loading state for this user
      setFollowLoading(prev => ({ ...prev, [userId]: true }));
      console.log('🔄 Sending follow request for user:', userId);
      
      // Optimistic update
      setFollowingStates(prev => ({ ...prev, [userId]: true }));
      
      const response = await followService.followUser(userId);
      console.log('📥 Follow response:', response.data);
      
      if (response.data.success) {
        const userName = getUserName(userId);
        toast.success(`You are now following ${userName}!`);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          following: prev.following + 1
        }));
        
        // Update the user in suggestions list
        setSuggestions(prev => 
          prev.map(user => 
            user.id === userId 
              ? { 
                  ...user, 
                  isFollowing: true, 
                  followersCount: (user.followersCount || 0) + 1 
                } 
              : user
          )
        );
        
        // Update current user's following count in auth context
        if (updateUser && currentUser) {
          updateUser({ 
            ...currentUser, 
            followingCount: (currentUser?.followingCount || 0) + 1 
          });
        }
      } else {
        // Revert on failure
        setFollowingStates(prev => ({ ...prev, [userId]: false }));
        toast.error(response.data.message || 'Failed to follow');
      }
    } catch (error) {
      console.error('❌ Follow error:', error);
      // Revert on error
      setFollowingStates(prev => ({ ...prev, [userId]: false }));
      toast.error(error.response?.data?.message || 'Failed to follow');
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleUnfollow = async (userId) => {
    console.log('🔘 Unfollow button clicked for user:', userId);
    
    // Prevent double clicks
    if (followLoading[userId]) {
      console.log('⏳ Already processing unfollow for user:', userId);
      return;
    }
    
    try {
      // Set loading state for this user
      setFollowLoading(prev => ({ ...prev, [userId]: true }));
      console.log('🔄 Sending unfollow request for user:', userId);
      
      // Optimistic update
      setFollowingStates(prev => ({ ...prev, [userId]: false }));
      
      const response = await followService.unfollowUser(userId);
      console.log('📥 Unfollow response:', response.data);
      
      if (response.data.success) {
        const userName = getUserName(userId);
        toast.success(`You unfollowed ${userName}`);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          following: Math.max(0, prev.following - 1)
        }));
        
        // Update the user in suggestions list
        setSuggestions(prev => 
          prev.map(user => 
            user.id === userId 
              ? { 
                  ...user, 
                  isFollowing: false, 
                  followersCount: Math.max(0, (user.followersCount || 0) - 1) 
                } 
              : user
          )
        );
        
        // Update current user's following count in auth context
        if (updateUser && currentUser) {
          updateUser({ 
            ...currentUser, 
            followingCount: Math.max(0, (currentUser?.followingCount || 0) - 1) 
          });
        }
      } else {
        // Revert on failure
        setFollowingStates(prev => ({ ...prev, [userId]: true }));
        toast.error(response.data.message || 'Failed to unfollow');
      }
    } catch (error) {
      console.error('❌ Unfollow error:', error);
      // Revert on error
      setFollowingStates(prev => ({ ...prev, [userId]: true }));
      toast.error(error.response?.data?.message || 'Failed to unfollow');
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleViewProfile = (userId) => {
    console.log('👤 View Profile clicked for user:', userId);
    navigate(`/profile/${userId}`);
  };

  const handleSendMessage = (userId, userName) => {
    console.log('💬 Send message clicked for user:', userId);
    navigate(`/chat?user=${userId}`);
    toast.success(`Starting chat with ${userName}`);
  };

  const getUserName = (userId) => {
    const user = suggestions.find(u => u.id === userId);
    return user?.fullName || user?.username || 'User';
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome to Your College!</h1>
        <p className="text-lg opacity-90">
          Connect with {stats.totalStudents} student{stats.totalStudents !== 1 ? 's' : ''} from your college
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <AcademicCapIcon className="h-5 w-5 mr-2" />
            <span>Domain: @{stats.domain}</span>
          </div>
          <div className="flex items-center">
            <UserCircleIcon className="h-5 w-5 mr-2" />
            <span>Total Students: {stats.totalStudents}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Students</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalStudents}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">You're Following</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.following}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Pending Sent</h3>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingSent}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Pending Received</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.pendingReceived}</p>
        </div>
      </div>

      {/* Suggestions Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          People you may know from your college
        </h2>

        {suggestions.length === 0 ? (
          <div className="text-center py-12">
            <UserCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No other students found in your college yet
            </p>
            <p className="text-gray-400 dark:text-gray-500 mt-2">
              Invite your friends to join Unimates!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suggestions.map((user) => (
              <div
                key={user.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  {/* Avatar - Click to view profile */}
                  <button
                    onClick={() => handleViewProfile(user.id)}
                    className="flex-shrink-0 focus:outline-none"
                    type="button"
                  >
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.fullName || user.username}
                        className="h-16 w-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.username || 'User')}&background=2563eb&color=fff&size=64`;
                        }}
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl border-2 border-white hover:bg-blue-700 transition-colors">
                        {getInitials(user.fullName || user.username)}
                      </div>
                    )}
                  </button>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    {/* Name - Click to view profile */}
                    <button
                      onClick={() => handleViewProfile(user.id)}
                      className="text-left focus:outline-none w-full"
                      type="button"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                        {user.fullName || user.username}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.branch || 'CSE'} • {user.year || '3rd'}
                      </p>
                    </button>
                    
                    {/* Bio */}
                    {user.bio && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                        {user.bio}
                      </p>
                    )}
                    
                    {/* Follower count */}
                    <div className="flex items-center mt-2 space-x-2">
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                        {user.followersCount || 0} followers
                      </span>
                      {user.followingCount > 0 && (
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                          {user.followingCount} following
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {/* Follow/Unfollow Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (followingStates[user.id]) {
                            handleUnfollow(user.id);
                          } else {
                            handleFollow(user.id);
                          }
                        }}
                        disabled={followLoading[user.id]}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-1 transition-colors ${
                          followingStates[user.id]
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                        type="button"
                      >
                        {followLoading[user.id] ? (
                          <div className="h-4 w-4 border-2 border-t-transparent border-current rounded-full animate-spin" />
                        ) : followingStates[user.id] ? (
                          <>
                            <UserMinusIcon className="h-4 w-4" />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="h-4 w-4" />
                            <span>Follow</span>
                          </>
                        )}
                      </button>
                      
                      {/* View Profile Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleViewProfile(user.id);
                        }}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        type="button"
                      >
                        View Profile →
                      </button>

                      {/* Message Button - Only show if following */}
                      {followingStates[user.id] && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSendMessage(user.id, user.fullName || user.username);
                          }}
                          className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          type="button"
                          title="Send message"
                        >
                          <ChatBubbleLeftIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollegeSuggestions;