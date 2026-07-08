// frontend/src/services/user.js
import api from './api';

export const userService = {
  // Get user profile by ID (pass 'me' for current user)
    getProfile: (userId) => {
    console.log('📤 Fetching profile for user:', userId);
    return api.get(`/users/${userId}`);
  },

  // Update user profile
  updateProfile: (data) => api.put('/users/update', data),

  // Update profile picture
  updateProfilePicture: (formData) => {
    return api.put('/users/profile-picture', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // ============ SKILLS ============
  // Add skill
  addSkill: (skill) => api.post('/users/skills', { skill }),
  
  // Remove skill
  removeSkill: (skill) => api.delete('/users/skills', { data: { skill } }),

  // ============ INTERESTS ============
  // Add interest
  addInterest: (interest) => api.post('/users/interests', { interest }),
  
  // Remove interest
  removeInterest: (interest) => api.delete('/users/interests', { data: { interest } }),

  // ============ HOBBIES ============
  // Add hobby
  addHobby: (hobby) => api.post('/users/hobbies', { hobby }),
  
  // Remove hobby
  removeHobby: (hobby) => api.delete('/users/hobbies', { data: { hobby } }),

  // ============ PROJECTS ============
  // Add project
  addProject: (project) => api.post('/users/projects', project),

  // Delete project
  deleteProject: (projectId) => api.delete(`/users/projects/${projectId}`),

  // ============ ACHIEVEMENTS ============
  // Add achievement
  addAchievement: (achievement) => api.post('/users/achievements', achievement),

  // Delete achievement
  deleteAchievement: (achievementId) => api.delete(`/users/achievements/${achievementId}`),

  // ============ FOLLOW SYSTEM ============
  // Follow user
  followUser: (userId) => api.post(`/users/${userId}/follow`),

  // Unfollow user
  unfollowUser: (userId) => api.post(`/users/${userId}/unfollow`),

  // ============ BLOCK SYSTEM ============
  // Block user
  blockUser: (userId) => api.post(`/users/${userId}/block`),

  // Unblock user
  unblockUser: (userId) => api.post(`/users/${userId}/unblock`),

  // ============ SEARCH & RECOMMENDATIONS ============
  // Search users
  searchUsers: (query, branch, year) => 
    api.get('/users/search', { params: { query, branch, year } }),
   // Get college info and stats
  // Get college info and stats
  getCollegeInfo: async () => {
    try {
      const response = await api.get('/auth/college-students');
      return response;
    } catch (error) {
      console.error('Error getting college info:', error);
      return { 
        data: { 
          success: false,
          users: [], 
          stats: { totalStudents: 0, following: 0, pendingSent: 0, pendingReceived: 0 },
          college: { name: 'Your College', domain: '' }
        } 
      };
    }
  },
  
  // Add this to your userService.js
  getDebugCollegeUsers: () => api.get('/users/debug/college-users'),

  // Get recommended users
  getRecommendations: () => api.get('/users/recommendations'),

  // Get college-specific suggestions
  getCollegeSuggestions: () => api.get('/users/college-suggestions')
};