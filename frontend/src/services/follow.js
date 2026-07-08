// frontend/src/services/follow.js
import api from './api';

export const followService = {
  // Follow a user
  followUser: (userId) => {
    console.log('📤 API Call: followUser', userId);
    return api.post(`/users/${userId}/follow`);
  },

  // Unfollow a user
  unfollowUser: (userId) => {
    console.log('📤 API Call: unfollowUser', userId);
    return api.post(`/users/${userId}/unfollow`);
  },

  // Get following list
  getFollowing: (userId) => {
    console.log('📤 API Call: getFollowing', userId);
    return api.get(`/users/${userId}/following`);
  },

  // Get followers list
  getFollowers: (userId) => {
    console.log('📤 API Call: getFollowers', userId);
    return api.get(`/users/${userId}/followers`);
  },

  // Check if following
  checkFollowing: (userId) => {
    console.log('📤 API Call: checkFollowing', userId);
    return api.get(`/users/${userId}/is-following`);
  },

  // Get mutual followers
  getMutualFollowers: (userId) => {
    console.log('📤 API Call: getMutualFollowers', userId);
    return api.get(`/users/${userId}/mutual`);
  },

  // Get follow suggestions
  getSuggestions: () => api.get('/users/suggestions'),

  // Send follow request (for private accounts)
  sendFollowRequest: (userId) => api.post(`/users/${userId}/follow-request`),

  // Accept follow request
  acceptFollowRequest: (requestId) => api.post(`/follow-requests/${requestId}/accept`),

  // Reject follow request
  rejectFollowRequest: (requestId) => api.post(`/follow-requests/${requestId}/reject`),

  // Get pending follow requests
  getPendingRequests: () => api.get('/follow-requests/pending')
};