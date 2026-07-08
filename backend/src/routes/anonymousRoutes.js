const express = require('express');
const router = express.Router();
const {
  createAnonymousPost,
  getAllPosts,
  getPostById,
  addReply,
  reportPost,
  deletePost
} = require('../controllers/anonymousController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin'); // Changed from 'admin' to 'isAdmin'
const { checkProfanity } = require('../middleware/profanityFilter'); // Changed from 'profanityFilter' to 'checkProfanity'

router.post('/create', protect, checkProfanity, createAnonymousPost);
router.get('/all', protect, getAllPosts);
router.get('/:id', protect, getPostById);
router.post('/:id/reply', protect, checkProfanity, addReply);
router.post('/:id/report', protect, reportPost);
router.delete('/:id', protect, isAdmin, deletePost); // Changed from 'admin' to 'isAdmin'

module.exports = router;