import api from './api';

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  
  getUsers: (page = 1, search, role, isActive) => 
    api.get('/admin/users', { params: { page, search, role, isActive } }),
  
  updateUserStatus: (userId, isActive) => 
    api.put(`/admin/users/${userId}/status`, { isActive }),
  
  updateUserRole: (userId, role) => 
    api.put(`/admin/users/${userId}/role`, { role }),
  
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  
  getFlaggedContent: () => api.get('/admin/flagged-content'),
  
  getLogs: () => api.get('/admin/logs')
};