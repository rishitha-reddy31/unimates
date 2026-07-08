// frontend/src/services/forum.js
import api from './api';

export const forumService = {
  // Create forum post
  createForum: (data) => {
    console.log('📤 Creating forum post:', data);
    return api.post('/forums/create', data);
  },

  // Get all forums
  getForums: (category, search, sort) => {
    console.log('📤 Fetching forums with:', { category, search, sort });
    const params = {};
    if (category && category !== 'all' && category !== 'undefined') params.category = category;
    if (search && search !== 'undefined') params.search = search;
    if (sort && sort !== 'undefined') params.sort = sort;
    return api.get('/forums', { params });
  },

  // Get forum by ID
  getForum: (forumId) => {
    console.log('📤 Fetching forum:', forumId);
    return api.get(`/forums/${forumId}`);
  },

  // Like/unlike forum
  toggleLike: (forumId) => {
    console.log('📤 Toggling like for forum:', forumId);
    return api.post(`/forums/${forumId}/like`);
  },

  // Join forum discussion
  joinForum: (forumId) => {
    console.log('📤 Joining forum:', forumId);
    return api.post(`/forums/${forumId}/join`);
  },

  // Leave forum discussion
  leaveForum: (forumId) => {
    console.log('📤 Leaving forum:', forumId);
    return api.post(`/forums/${forumId}/leave`);
  },

  // Get forum messages
  getForumMessages: (forumId, page = 1, limit = 50) => {
    console.log('📤 Fetching messages for forum:', forumId);
    return api.get(`/forums/${forumId}/messages`, { params: { page, limit } });
  },

  // Send message in forum
  sendForumMessage: (forumId, content, isAnonymous = false) => {
    console.log('📤 Sending message to forum:', forumId);
    return api.post(`/forums/${forumId}/messages`, { content, isAnonymous });
  },

  // Add comment (legacy)
  addComment: (forumId, content, isAnonymous) => {
    console.log('📤 Adding comment to forum:', forumId);
    return api.post(`/forums/${forumId}/comments`, { content, isAnonymous });
  },

  // Reply to comment
  replyToComment: (commentId, content, isAnonymous) => {
    console.log('📤 Replying to comment:', commentId);
    return api.post(`/forums/comments/${commentId}/reply`, { content, isAnonymous });
  },

  // Delete forum
  deleteForum: (forumId) => {
    console.log('📤 Deleting forum:', forumId);
    return api.delete(`/forums/${forumId}`);
  }
};