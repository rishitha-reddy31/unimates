const express = require('express');
const router = express.Router();
const {
  getStats,
  getUsers,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getFlaggedContent,
  getLogs
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin'); // Changed from 'admin' to 'isAdmin'

// All admin routes require authentication and admin privileges
router.get('/stats', protect, isAdmin, getStats);
router.get('/users', protect, isAdmin, getUsers);
router.put('/users/:id/status', protect, isAdmin, updateUserStatus);
router.put('/users/:id/role', protect, isAdmin, updateUserRole);
router.delete('/users/:id', protect, isAdmin, deleteUser);
router.get('/flagged-content', protect, isAdmin, getFlaggedContent);
router.get('/logs', protect, isAdmin, getLogs);

module.exports = router;