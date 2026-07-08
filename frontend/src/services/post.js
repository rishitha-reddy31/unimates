// frontend/src/services/post.js
import api from './api';

export const postService = {
  // Create a post with media
  createPost: (formData) => {
    console.log('📤 Creating post with media');
    return api.post('/posts/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Get feed posts
  getFeed: (page = 1, limit = 10) => {
    console.log('📤 Fetching feed, page:', page);
    return api.get('/posts/feed', { params: { page, limit } });
  },

  // Get post by ID
  getPost: (postId) => {
    console.log('📤 Fetching post:', postId);
    return api.get(`/posts/${postId}`);
  },

  // Get user posts
  getUserPosts: (userId, page = 1, limit = 10) => {
    console.log('📤 Fetching posts for user:', userId);
    return api.get(`/posts/user/${userId}`, { params: { page, limit } });
  },

  // Like/unlike post
  toggleLike: (postId) => {
    console.log('📤 Toggling like for post:', postId);
    return api.post(`/posts/${postId}/like`);
  },

  // Add comment
  addComment: (postId, content) => {
    console.log('📤 Adding comment to post:', postId);
    return api.post(`/posts/${postId}/comment`, { content });
  },

  // Get comments
  getComments: (postId) => {
    console.log('📤 Fetching comments for post:', postId);
    return api.get(`/posts/${postId}/comments`);
  },

  // Delete post
  deletePost: (postId) => {
    console.log('📤 Deleting post:', postId);
    return api.delete(`/posts/${postId}`);
  }
};