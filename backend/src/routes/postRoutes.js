// backend/src/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const {
  createPost,
  getFeed,
  toggleLike,
  addComment,
  deletePost,
  getComments,
  getPostById,
  getUserPosts
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const { uploadPostFiles } = require('../middleware/upload');

console.log('📝 Post routes loaded');

// All routes are protected
router.use(protect);

// Post CRUD
router.post('/create', uploadPostFiles, createPost);
router.get('/feed', getFeed);
router.get('/:id', getPostById);
router.post('/:id/like', toggleLike);
router.post('/:id/comment', addComment);
router.delete('/:id', deletePost);
router.get('/:id/comments', getComments);

// User posts
router.get('/user/:userId', getUserPosts);

// Debug endpoint - remove after fixing
router.get('/debug/check-posts', protect, async (req, res) => {
  try {
    const { sequelize } = require('../config/database');
    
    // Check if Posts table exists
    const [tableExists] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'Posts'
      );
    `);
    
    // Get table structure
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Posts'
      ORDER BY ordinal_position;
    `);
    
    // Count posts
    const totalPosts = await Post.count();
    
    // Get sample post
    const samplePost = await Post.findOne({
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'fullName', 'username']
        }
      ]
    });

    res.json({
      success: true,
      tableExists: tableExists[0].exists,
      columns,
      totalPosts,
      samplePost: samplePost || 'No posts found'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;