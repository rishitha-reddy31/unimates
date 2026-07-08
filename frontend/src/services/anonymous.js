    import api from './api';

export const anonymousService = {
  createPost: (data) => api.post('/anonymous/create', data),
  
  getPosts: (category, page = 1) => 
    api.get('/anonymous/all', { params: { category, page } }),
  
  getPost: (postId) => api.get(`/anonymous/${postId}`),
  
  addReply: (postId, content) => 
    api.post(`/anonymous/${postId}/reply`, { content }),
  
  reportPost: (postId, reason, description) => 
    api.post(`/anonymous/${postId}/report`, { reason, description })
};