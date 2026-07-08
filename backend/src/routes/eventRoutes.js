const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  getEventById,
  attendEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin'); // Changed from 'admin' to 'isAdmin'

// Routes
router.post('/create', protect, isAdmin, createEvent); // Changed from 'admin' to 'isAdmin'
router.get('/', protect, getEvents);
router.get('/:id', protect, getEventById);
router.post('/:id/attend', protect, attendEvent);
router.put('/:id', protect, isAdmin, updateEvent); // Changed from 'admin' to 'isAdmin'
router.delete('/:id', protect, isAdmin, deleteEvent); // Changed from 'admin' to 'isAdmin'

module.exports = router;