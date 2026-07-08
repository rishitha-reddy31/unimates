const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  resolveReport,
  dismissReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin'); // Changed from 'admin' to 'isAdmin'

router.post('/create', protect, createReport);
router.get('/', protect, isAdmin, getReports); // Changed from 'admin' to 'isAdmin'
router.put('/:id/resolve', protect, isAdmin, resolveReport); // Changed from 'admin' to 'isAdmin'
router.put('/:id/dismiss', protect, isAdmin, dismissReport); // Changed from 'admin' to 'isAdmin'

module.exports = router;