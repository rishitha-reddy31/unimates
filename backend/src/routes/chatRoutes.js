// backend/src/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
  deleteMessage
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// All chat routes are protected
router.use(protect);

// Send a message
router.post('/send', sendMessage);

// Get all conversations
router.get('/conversations', getConversations);

// Get messages with a specific user
router.get('/messages/:userId', getMessages);

// Mark messages as read
router.put('/read/:userId', markAsRead);

// Delete a message
router.delete('/message/:messageId', deleteMessage);

module.exports = router;