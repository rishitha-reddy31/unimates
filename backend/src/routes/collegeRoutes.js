const express = require('express');
const router = express.Router();
const {
  getColleges,
  getCollegeByDomain,
  registerCollege,
  updateCollege,
  deleteCollege,
  getCollegeStats
} = require('../controllers/collegeController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin'); // Changed from 'admin' to 'isAdmin'

// ===================================
// PUBLIC ROUTES - No authentication required
// ===================================

// @route   GET /api/colleges
// @desc    Get all active colleges
// @access  Public
router.get('/', getColleges);

// @route   GET /api/colleges/domain/:domain
// @desc    Get college by domain name
// @access  Public
router.get('/domain/:domain', getCollegeByDomain);

// @route   GET /api/colleges/:id
// @desc    Get college by ID
// @access  Public
router.get('/:id', getCollegeByDomain);

// ===================================
// PROTECTED ROUTES - Admin only
// ===================================

// @route   POST /api/colleges/register
// @desc    Register a new college
// @access  Private/Admin
router.post('/register', protect, isAdmin, registerCollege); // Changed from 'admin' to 'isAdmin'

// @route   PUT /api/colleges/:id
// @desc    Update college details
// @access  Private/Admin
router.put('/:id', protect, isAdmin, updateCollege); // Changed from 'admin' to 'isAdmin'

// @route   DELETE /api/colleges/:id
// @desc    Soft delete a college
// @access  Private/Admin
router.delete('/:id', protect, isAdmin, deleteCollege); // Changed from 'admin' to 'isAdmin'

// @route   GET /api/colleges/:id/stats
// @desc    Get college statistics
// @access  Private/Admin
router.get('/:id/stats', protect, isAdmin, getCollegeStats); // Changed from 'admin' to 'isAdmin'

module.exports = router;