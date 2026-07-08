// backend/src/controllers/groupController.js
const { Group, User, GroupMember, College, sequelize } = require('../models');
const { Op } = require('sequelize');

console.log('🔄 Loading groupController...');

// @desc    Create group
// @route   POST /api/groups/create
// @access  Private
const createGroup = async (req, res) => {
  console.log('='.repeat(50));
  console.log('📝 CREATE GROUP REQUEST');
  console.log('='.repeat(50));
  
  const transaction = await sequelize.transaction();
  
  try {
    const { name, description, category, isPrivate } = req.body;
    const userId = req.user.id;
    const collegeId = req.user.collegeId;

    console.log('Request body:', { name, description, category, isPrivate });
    console.log('User:', { userId, collegeId });

    // Validation
    if (!name || !description || !category) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please provide name, description and category'
      });
    }

    // Check for duplicate group with same name in the same college
    const existingGroup = await Group.findOne({
      where: {
        name: name.trim(),
        collegeId: collegeId,
        isActive: true
      }
    });

    if (existingGroup) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'A group with this name already exists in your college'
      });
    }

    // Validate category
    const validCategories = ['STUDY', 'CODING', 'PROJECT', 'PLACEMENT', 'INTERNSHIP', 'CULTURAL', 'SPORTS', 'OTHER'];
    if (!validCategories.includes(category)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }

    // Create the group
    const group = await Group.create({
      name: name.trim(),
      description: description.trim(),
      groupType: category,
      privacy: isPrivate ? 'private' : 'public',
      creatorId: userId,
      collegeId: collegeId,
      isActive: true
    }, { transaction });

    console.log('✅ Group created with ID:', group.id);

    // Add creator as admin member
    await GroupMember.create({
      groupId: group.id,
      userId: userId,
      role: 'admin',
      joinedAt: new Date()
    }, { transaction });

    await transaction.commit();

    // Fetch the created group with associations
    const createdGroup = await Group.findByPk(group.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fullName', 'username', 'profilePicture']
        },
        {
          model: User,
          as: 'members',
          through: { attributes: ['role', 'joinedAt'] },
          attributes: ['id', 'fullName', 'username', 'profilePicture']
        }
      ]
    });

    res.status(201).json({
      success: true,
      group: createdGroup
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Create group error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create group'
    });
  }
};


// @desc    Get all groups
// @route   GET /api/groups
// @access  Private
const getGroups = async (req, res) => {
  try {
    const { category, search } = req.query;
    const whereClause = { 
      isActive: true,
      collegeId: req.user.collegeId
    };

    if (category && category !== 'all' && category !== 'undefined') {
      whereClause.groupType = category;
    }

    if (search && search !== 'undefined' && search.trim() !== '') {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search.trim()}%` } },
        { description: { [Op.iLike]: `%${search.trim()}%` } }
      ];
    }

    console.log('🔍 Fetching groups with where clause:', whereClause);

    const groups = await Group.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fullName', 'username', 'profilePicture']
        },
        {
          model: User,
          as: 'members',
          through: { attributes: ['role', 'joinedAt'] },
          attributes: ['id', 'fullName', 'username', 'profilePicture'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`📊 Found ${groups.length} groups`);

    // Add membership status and remove duplicates
    const uniqueGroups = [];
    const groupNames = new Set();

    groups.forEach(group => {
      const groupData = group.toJSON();
      
      // Check for duplicates by name
      if (!groupNames.has(groupData.name)) {
        groupNames.add(groupData.name);
        
        const isMember = groupData.members?.some(m => m.id === req.user.id) || false;
        const memberRecord = groupData.members?.find(m => m.id === req.user.id);
        
        groupData.isMember = isMember;
        groupData.isAdmin = memberRecord?.GroupMember?.role === 'admin';
        groupData.membersCount = groupData.members?.length || 0;
        groupData.resourcesCount = groupData.resources?.length || 0;
        groupData.joinStatus = isMember ? 'member' : 'not_member';
        
        // Remove members list for non-members
        if (!isMember) {
          delete groupData.members;
        }
        
        uniqueGroups.push(groupData);
      }
    });

    res.json({
      success: true,
      groups: uniqueGroups
    });
  } catch (error) {
    console.error('❌ Get groups error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get groups'
    });
  }
};

// @desc    Get group by ID
// @route   GET /api/groups/:id
// @access  Private
const getGroupById = async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fullName', 'username', 'profilePicture', 'branch', 'year']
        },
        {
          model: User,
          as: 'members',
          through: { attributes: ['role', 'joinedAt'] },
          attributes: ['id', 'fullName', 'username', 'profilePicture', 'branch', 'year']
        }
      ]
    });

    if (!group || !group.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    const groupData = group.toJSON();
    const isMember = groupData.members?.some(m => m.id === req.user.id) || false;
    const memberRecord = groupData.members?.find(m => m.id === req.user.id);
    
    groupData.isMember = isMember;
    groupData.isAdmin = memberRecord?.GroupMember?.role === 'admin';
    groupData.membersCount = groupData.members?.length || 0;

    // Check privacy
    if (group.privacy === 'private' && !isMember && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'This is a private group'
      });
    }

    res.json({
      success: true,
      group: groupData
    });
  } catch (error) {
    console.error('❌ Get group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get group'
    });
  }
};

// @desc    Join group
// @route   POST /api/groups/:id/join
// @access  Private
const joinGroup = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const groupId = req.params.id;
    const userId = req.user.id;

    console.log('📝 Join group request:', { groupId, userId });

    const group = await Group.findByPk(groupId, { transaction });

    if (!group || !group.isActive) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if already a member
    const existingMember = await GroupMember.findOne({
      where: {
        groupId: group.id,
        userId: userId
      },
      transaction
    });

    if (existingMember) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Already a member of this group'
      });
    }

    // For public groups, join immediately
    if (group.privacy === 'public') {
      await GroupMember.create({
        groupId: group.id,
        userId: userId,
        role: 'member',
        joinedAt: new Date()
      }, { transaction });

      await transaction.commit();

      // Get updated group data
      const updatedGroup = await Group.findByPk(groupId, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'fullName', 'username', 'profilePicture']
          },
          {
            model: User,
            as: 'members',
            through: { attributes: ['role', 'joinedAt'] },
            attributes: ['id', 'fullName', 'username', 'profilePicture']
          }
        ]
      });

      res.json({
        success: true,
        message: 'Joined group successfully',
        group: updatedGroup
      });
    } else {
      // For private groups, send join request
      const joinRequests = group.joinRequests || [];
      
      if (joinRequests.some(req => req.userId === userId)) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Join request already pending'
        });
      }

      joinRequests.push({
        userId: userId,
        message: req.body.message || '',
        requestedAt: new Date()
      });

      await group.update({ joinRequests }, { transaction });
      await transaction.commit();

      res.json({
        success: true,
        message: 'Join request sent successfully'
      });
    }
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Join group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join group'
    });
  }
};

// @desc    Leave group
// @route   POST /api/groups/:id/leave
// @access  Private
const leaveGroup = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const groupId = req.params.id;
    const userId = req.user.id;

    const group = await Group.findByPk(groupId, { transaction });

    if (!group || !group.isActive) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    const memberRecord = await GroupMember.findOne({
      where: {
        groupId: group.id,
        userId: userId
      },
      transaction
    });

    if (!memberRecord) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this group'
      });
    }

    // Check if user is the only admin
    if (memberRecord.role === 'admin') {
      const adminCount = await GroupMember.count({
        where: {
          groupId: group.id,
          role: 'admin'
        },
        transaction
      });

      if (adminCount === 1) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Cannot leave group as you are the only admin. Delete the group instead.'
        });
      }
    }

    await memberRecord.destroy({ transaction });
    await transaction.commit();

    res.json({
      success: true,
      message: 'Left group successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Leave group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave group'
    });
  }
};

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private
const updateGroup = async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);

    if (!group || !group.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is admin
    const memberRecord = await GroupMember.findOne({
      where: {
        groupId: group.id,
        userId: req.user.id,
        role: 'admin'
      }
    });

    if (!memberRecord && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update group'
      });
    }

    const { name, description, category, privacy } = req.body;
    
    if (name) group.name = name;
    if (description) group.description = description;
    if (category) group.groupType = category;
    if (privacy) group.privacy = privacy;

    await group.save();

    res.json({
      success: true,
      message: 'Group updated successfully',
      group
    });
  } catch (error) {
    console.error('❌ Update group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update group'
    });
  }
};

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private
const deleteGroup = async (req, res) => {
  console.log('🗑️ Delete group request for ID:', req.params.id);
  
  const transaction = await sequelize.transaction();
  
  try {
    const groupId = req.params.id;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(groupId)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID format'
      });
    }

    const group = await Group.findByPk(groupId, { transaction });

    if (!group) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is creator or admin
    if (group.creatorId !== req.user.id && req.user.role !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Only creator or admin can delete group'
      });
    }

    // Hard delete (remove from database) instead of soft delete
    await GroupMember.destroy({
      where: { groupId: group.id },
      transaction
    });

    await group.destroy({ transaction }); // This actually deletes the group

    await transaction.commit();

    console.log('✅ Group deleted successfully:', groupId);

    res.json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Delete group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete group',
      error: error.message
    });
  }
};

// @desc    Get group members
// @route   GET /api/groups/:id/members
// @access  Private
const getGroupMembers = async (req, res) => {
  try {
    const members = await GroupMember.findAll({
      where: { groupId: req.params.id },
      include: [
        {
          model: User,
          attributes: ['id', 'fullName', 'username', 'profilePicture', 'branch', 'year']
        }
      ],
      order: [
        ['role', 'ASC'],
        ['joinedAt', 'ASC']
      ]
    });

    res.json({
      success: true,
      members: members.map(m => ({
        ...m.User.toJSON(),
        role: m.role,
        joinedAt: m.joinedAt,
        lastActive: m.lastActive
      }))
    });
  } catch (error) {
    console.error('❌ Get group members error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get group members'
    });
  }
};

// @desc    Update member role
// @route   PUT /api/groups/:groupId/members/:userId
// @access  Private
const updateMemberRole = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { groupId, userId } = req.params;
    const { role } = req.body;

    // Check if requester is admin
    const requesterRecord = await GroupMember.findOne({
      where: {
        groupId,
        userId: req.user.id,
        role: 'admin'
      },
      transaction
    });

    if (!requesterRecord && req.user.role !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Only admins can update member roles'
      });
    }

    const memberRecord = await GroupMember.findOne({
      where: { groupId, userId },
      transaction
    });

    if (!memberRecord) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    memberRecord.role = role;
    await memberRecord.save({ transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Member role updated successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Update member role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update member role'
    });
  }
};

// @desc    Remove member from group
// @route   DELETE /api/groups/:groupId/members/:userId
// @access  Private
const removeMember = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { groupId, userId } = req.params;

    // Check if requester is admin
    const requesterRecord = await GroupMember.findOne({
      where: {
        groupId,
        userId: req.user.id,
        role: 'admin'
      },
      transaction
    });

    if (!requesterRecord && req.user.role !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Only admins can remove members'
      });
    }

    const memberRecord = await GroupMember.findOne({
      where: { groupId, userId },
      transaction
    });

    if (!memberRecord) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Check if trying to remove the last admin
    if (memberRecord.role === 'admin') {
      const adminCount = await GroupMember.count({
        where: {
          groupId,
          role: 'admin'
        },
        transaction
      });

      if (adminCount === 1) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Cannot remove the last admin'
        });
      }
    }

    await memberRecord.destroy({ transaction });
    await transaction.commit();

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Remove member error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove member'
    });
  }
};

module.exports = {
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
};