// backend/src/routes/groupRoutes.js
const express = require('express');
const router = express.Router();
const {
  createGroup,
  getGroups,
  getGroupById,
  joinGroup,
  leaveGroup,
  updateGroup,
  deleteGroup,
  getGroupMembers,
  updateMemberRole,
  removeMember
} = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

console.log('📦 Group routes loaded with functions:', {
  createGroup: !!createGroup,
  getGroups: !!getGroups,
  getGroupById: !!getGroupById,
  joinGroup: !!joinGroup,
  leaveGroup: !!leaveGroup,
  updateGroup: !!updateGroup,
  deleteGroup: !!deleteGroup,
  getGroupMembers: !!getGroupMembers,
  updateMemberRole: !!updateMemberRole,
  removeMember: !!removeMember
});

// All routes are protected
router.use(protect);

// Group CRUD
router.post('/create', createGroup);
router.get('/', getGroups);
router.get('/:id', getGroupById);
router.post('/:id/join', joinGroup);
router.post('/:id/leave', leaveGroup);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

// Member management routes
router.get('/:groupId/members', getGroupMembers);
router.put('/:groupId/members/:userId', updateMemberRole);
router.delete('/:groupId/members/:userId', removeMember);

module.exports = router;