// frontend/src/services/chat.js
import api from './api';

export const chatService = {
  // Send a message
  sendMessage: (receiverId, content) => {
    console.log('📤 Sending message to:', receiverId);
    return api.post('/chat/send', { receiverId, content });
  },

  // Get all conversations
  getConversations: () => {
    console.log('📤 Fetching conversations');
    return api.get('/chat/conversations');
  },

  // Get messages with a specific user
  getMessages: (userId) => {
    console.log('📤 Fetching messages with user:', userId);
    return api.get(`/chat/messages/${userId}`);
  },

  // Mark messages as read
  markAsRead: (userId) => {
    console.log('📤 Marking messages as read from:', userId);
    return api.put(`/chat/read/${userId}`);
  },

  // Delete a message
  deleteMessage: (messageId) => {
    console.log('📤 Deleting message:', messageId);
    return api.delete(`/chat/message/${messageId}`);
  }
};