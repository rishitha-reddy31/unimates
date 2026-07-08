// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

// All routes are protected - require authentication
router.use(protect);

// ============ SPECIFIC ROUTES (must come before /:id) ============
// Search users
router.get('/search', userController.searchUsers);

// Get recommended users
router.get('/recommendations', userController.getRecommendedUsers);

// Get college-specific suggestions - THIS MUST COME BEFORE /:id
router.get('/college-suggestions', userController.getCollegeSuggestions);

// ============ PARAMETERIZED ROUTES (these come last) ============
// Get user profile by ID (or 'me' for current user) - THIS COMES LAST
router.get('/:id', userController.getUserProfile);

// Update user profile
router.put('/update', userController.updateProfile);

// Update profile picture
router.put('/profile-picture', uploadSingle('profilePicture'), userController.updateProfilePicture);

// ============ PROJECT ROUTES ============
router.post('/projects', userController.addProject);
router.delete('/projects/:projectId', userController.deleteProject);

// ============ ACHIEVEMENT ROUTES ============
router.post('/achievements', userController.addAchievement);
router.delete('/achievements/:achievementId', userController.deleteAchievement);

// ============ SKILLS ROUTES ============
router.post('/skills', userController.addSkill);
router.delete('/skills', userController.removeSkill);

// ============ INTERESTS ROUTES ============
router.post('/interests', userController.addInterest);
router.delete('/interests', userController.removeInterest);

// ============ HOBBIES ROUTES ============
router.post('/hobbies', userController.addHobby);
router.delete('/hobbies', userController.removeHobby);

// ============ FOLLOW/UNFOLLOW ROUTES ============
router.post('/:id/follow', userController.followUser);
router.post('/:id/unfollow', userController.unfollowUser);
router.get('/:id/followers', userController.getFollowers);
router.get('/:id/following', userController.getFollowing);
router.get('/:id/is-following', userController.checkFollowing);
router.get('/:id/mutual', userController.getMutualFollowers);

// ============ BLOCK/UNBLOCK ROUTES ============
router.post('/:id/block', userController.blockUser);
router.post('/:id/unblock', userController.unblockUser);

// Temporary debug endpoint - remove after fixing
router.post('/debug/follow/:id', protect, async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.id;
    
    console.log('🔍 Debug follow:', { followerId, followingId });
    
    // Simple insert without collegeId
    const [follow, created] = await Follow.findOrCreate({
      where: { followerId, followingId },
      defaults: { followerId, followingId }
    });
    
    if (created) {
      await User.increment('followingCount', { by: 1, where: { id: followerId } });
      await User.increment('followersCount', { by: 1, where: { id: followingId } });
      res.json({ success: true, message: 'Debug follow successful', created: true });
    } else {
      res.json({ success: true, message: 'Already following', created: false });
    }
  } catch (error) {
    console.error('Debug follow error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;