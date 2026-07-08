// backend/src/routes/forumRoutes.js
const express = require('express');
const router = express.Router();
const {
  createForum,
  getForums,
  getForumById,
  toggleLike,
  addComment,
  replyToComment,
  deleteForum,
  joinForum,
  leaveForum,
  sendForumMessage,
  getForumMessages
} = require('../controllers/forumController');
const { protect } = require('../middleware/auth');

console.log('📦 Forum routes loaded');

// All routes are protected
router.use(protect);

// Forum CRUD
router.post('/create', createForum);
router.get('/', getForums);
router.get('/:id', getForumById);
router.post('/:id/like', toggleLike);
router.delete('/:id', deleteForum);

// Join/Leave forum
router.post('/:id/join', joinForum);
router.post('/:id/leave', leaveForum);

// Forum messages (chat)
router.get('/:id/messages', getForumMessages);
router.post('/:id/messages', sendForumMessage);

// Comments
router.post('/:id/comments', addComment);
router.post('/comments/:commentId/reply', replyToComment);

// Debug endpoint to check table structure
router.get('/debug/check-messages-table', protect, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'ForumMessages'
    `);
    
    res.json({
      success: true,
      tables: tables.map(t => t.table_name),
      columns
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;