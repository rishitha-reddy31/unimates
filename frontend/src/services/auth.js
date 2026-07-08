// frontend/src/services/auth.js
import api from './api';

export const authService = {
  // Authentication
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  
  // College Students - NEW
  getCollegeStudents: () => api.get('/auth/college-students'),
  
  // Follow Requests
  sendFollowRequest: (userId) => api.post(`/auth/follow-request/${userId}`),
  acceptFollowRequest: (requestId) => api.post(`/auth/accept-request/${requestId}`),
  rejectFollowRequest: (requestId) => api.post(`/auth/reject-request/${requestId}`),
  getPendingRequests: () => api.get('/auth/pending-requests'),
  unfollowUser: (userId) => api.post(`/auth/unfollow/${userId}`), // NEW
  
  // Suggestions
  getSuggestions: () => api.get('/auth/suggestions'),
};