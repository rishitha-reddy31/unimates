// backend/src/controllers/forumController.js
const { Forum, ForumComment, User, College, sequelize } = require('../models');
const { Op } = require('sequelize');

console.log('🔄 Loading forumController...');

// @desc    Create forum post
// @route   POST /api/forums/create
// @access  Private
const createForum = async (req, res) => {
  console.log('='.repeat(50));
  console.log('📝 CREATE FORUM REQUEST');
  console.log('='.repeat(50));
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('User:', { id: req.user.id, collegeId: req.user.collegeId });
  
  const transaction = await sequelize.transaction();
  
  try {
    const { title, content, category, tags, isAnonymous } = req.body;

    // Validation
    if (!title || !title.trim()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please provide a title'
      });
    }

    if (!content || !content.trim()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please provide content'
      });
    }

    if (!category) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please select a category'
      });
    }

    // Validate category
    const validCategories = ['GENERAL', 'ACADEMIC', 'CAREER', 'TECHNICAL', 'PROJECTS', 'INTERNSHIPS', 'PLACEMENTS', 'EVENTS', 'OTHER'];
    if (!validCategories.includes(category)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }

    // Process tags
    let tagsArray = [];
    if (tags) {
      if (Array.isArray(tags)) {
        tagsArray = tags;
      } else if (typeof tags === 'string') {
        tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
    }

    console.log('Creating forum with:', {
      title: title.trim(),
      content: content.trim(),
      category,
      tags: tagsArray,
      isAnonymous: isAnonymous || false,
      authorId: req.user.id,
      collegeId: req.user.collegeId
    });

    const forum = await Forum.create({
      title: title.trim(),
      content: content.trim(),
      category,
      tags: tagsArray,
      isAnonymous: isAnonymous || false,
      authorId: req.user.id,
      collegeId: req.user.collegeId,
      isActive: true,
      views: 0,
      likesCount: 0,
      commentsCount: 0,
      likes: []
    }, { transaction });

    console.log('✅ Forum created with ID:', forum.id);

    await transaction.commit();

    // Fetch the created forum with author info
    const createdForum = await Forum.findByPk(forum.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'fullName', 'username', 'profilePicture']
        }
      ]
    });

    // If anonymous, hide author info
    if (isAnonymous) {
      createdForum.dataValues.author = { 
        username: 'Anonymous', 
        fullName: 'Anonymous',
        profilePicture: null 
      };
    }

    console.log('✅ Forum created successfully:', createdForum.id);

    res.status(201).json({
      success: true,
      forum: createdForum
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Create forum error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: error.errors.map(e => e.message).join(', ')
      });
    }

    if (error.name === 'SequelizeDatabaseError') {
      return res.status(400).json({
        success: false,
        message: 'Database error: ' + (error.parent?.message || error.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create forum post'
    });
  }
};

// @desc    Get all forums
// @route   GET /api/forums
// @access  Private
const getForums = async (req, res) => {
  try {
    const { category, search, sort = 'latest' } = req.query;
    const whereClause = {
      isActive: true,
      collegeId: req.user.collegeId
    };

    if (category && category !== 'all' && category !== 'undefined') {
      whereClause.category = category;
    }

    if (search && search !== 'undefined' && search.trim() !== '') {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search.trim()}%` } },
        { content: { [Op.iLike]: `%${search.trim()}%` } }
      ];
    }

    let order = [['createdAt', 'DESC']];
    if (sort === 'popular') {
      order = [['likesCount', 'DESC'], ['createdAt', 'DESC']];
    } else if (sort === 'views') {
      order = [['views', 'DESC'], ['createdAt', 'DESC']];
    }

    const forums = await Forum.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'fullName', 'username', 'profilePicture']
        }
      ],
      order
    });

    const forumsWithStatus = forums.map(forum => {
      const forumData = forum.toJSON();
      forumData.isLiked = forumData.likes?.includes(req.user.id) || false;
      forumData.isAuthor = forumData.authorId === req.user.id;
      
      // Hide author info if anonymous
      if (forumData.isAnonymous && !forumData.isAuthor) {
        forumData.author = { 
          username: 'Anonymous', 
          fullName: 'Anonymous',
          profilePicture: null 
        };
      }
      
      return forumData;
    });

    res.json({
      success: true,
      forums: forumsWithStatus
    });
  } catch (error) {
    console.error('❌ Get forums error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get forums'
    });
  }
}; 

// @desc    Like/unlike forum post
// @route   POST /api/forums/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const forum = await Forum.findByPk(req.params.id, { transaction });

    if (!forum || !forum.isActive) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }

    const likes = forum.likes || [];
    const hasLiked = likes.includes(req.user.id);

    if (hasLiked) {
      forum.likes = likes.filter(id => id !== req.user.id);
      forum.likesCount = Math.max(0, forum.likesCount - 1);
    } else {
      likes.push(req.user.id);
      forum.likes = likes;
      forum.likesCount = (forum.likesCount || 0) + 1;
    }

    await forum.save({ transaction });
    await transaction.commit();

    res.json({
      success: true,
      isLiked: !hasLiked,
      likesCount: forum.likesCount
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Like forum error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like forum post'
    });
  }
};

// @desc    Add comment to forum
// @route   POST /api/forums/:id/comments
// @access  Private
const addComment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { content, isAnonymous } = req.body;
    const forumId = req.params.id;

    if (!content || !content.trim()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please provide comment content'
      });
    }

    const forum = await Forum.findByPk(forumId, { transaction });

    if (!forum || !forum.isActive) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }

    const comment = await ForumComment.create({
      content: content.trim(),
      forumId: forum.id,
      authorId: req.user.id,
      isAnonymous: isAnonymous || false,
      isActive: true
    }, { transaction });

    // Update comments count
    await forum.increment('commentsCount', { by: 1, transaction });

    await transaction.commit();

    const createdComment = await ForumComment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'fullName', 'username', 'profilePicture']
        }
      ]
    });

    // Hide author info if anonymous
    if (isAnonymous) {
      createdComment.dataValues.author = { 
        username: 'Anonymous', 
        fullName: 'Anonymous',
        profilePicture: null 
      };
    }

    res.status(201).json({
      success: true,
      comment: createdComment
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
};

// @desc    Reply to comment
// @route   POST /api/forums/comments/:commentId/reply
// @access  Private
const replyToComment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { content, isAnonymous } = req.body;
    const parentCommentId = req.params.commentId;

    if (!content) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please provide reply content'
      });
    }

    const parentComment = await ForumComment.findByPk(parentCommentId, { transaction });

    if (!parentComment || !parentComment.isActive) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Parent comment not found'
      });
    }

    const reply = await ForumComment.create({
      content: content.trim(),
      forumId: parentComment.forumId,
      authorId: req.user.id,
      parentCommentId: parentComment.id,
      isAnonymous: isAnonymous || false,
      isActive: true
    }, { transaction });

    await transaction.commit();

    const createdReply = await ForumComment.findByPk(reply.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'fullName', 'username', 'profilePicture']
        }
      ]
    });

    // Hide author info if anonymous
    if (isAnonymous) {
      createdReply.author = { username: 'Anonymous', fullName: 'Anonymous' };
    }

    res.status(201).json({
      success: true,
      reply: createdReply
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Reply to comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reply'
    });
  }
};

// @desc    Delete forum post
// @route   DELETE /api/forums/:id
// @access  Private
const deleteForum = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const forum = await Forum.findByPk(req.params.id, { transaction });

    if (!forum || !forum.isActive) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }

    // Check if user is author or admin
    if (forum.authorId !== req.user.id && req.user.role !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    // Soft delete
    forum.isActive = false;
    await forum.save({ transaction });

    // Soft delete all comments
    await ForumComment.update(
      { isActive: false },
      { where: { forumId: forum.id }, transaction }
    );

    await transaction.commit();

    res.json({
      success: true,
      message: 'Forum post deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Delete forum error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete forum post'
    });
  }
};

// Add these functions to your forumController.js

// @desc    Join a forum discussion
// @route   POST /api/forums/:id/join
// @access  Private
const joinForum = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const forumId = req.params.id;
    const userId = req.user.id;

    const forum = await Forum.findByPk(forumId, { transaction });

    if (!forum || !forum.isActive) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Forum not found'
      });
    }

    // Check if forum is locked
    if (forum.isLocked) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'This discussion is locked'
      });
    }

    const participants = forum.participants || [];
    
    // Check if already joined
    if (participants.includes(userId)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Already joined this discussion'
      });
    }

    // Add user to participants
    participants.push(userId);
    forum.participants = participants;
    forum.participantsCount = participants.length;
    
    await forum.save({ transaction });
    await transaction.commit();

    res.json({
      success: true,
      message: 'Joined discussion successfully',
      participantsCount: forum.participantsCount
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Join forum error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join discussion'
    });
  }
};

// @desc    Leave a forum discussion
// @route   POST /api/forums/:id/leave
// @access  Private
const leaveForum = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const forumId = req.params.id;
    const userId = req.user.id;

    const forum = await Forum.findByPk(forumId, { transaction });

    if (!forum || !forum.isActive) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Forum not found'
      });
    }

    const participants = forum.participants || [];
    
    // Check if user is a participant
    if (!participants.includes(userId)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'You are not a participant in this discussion'
      });
    }

    // Remove user from participants
    forum.participants = participants.filter(id => id !== userId);
    forum.participantsCount = forum.participants.length;
    
    await forum.save({ transaction });
    await transaction.commit();

    res.json({
      success: true,
      message: 'Left discussion successfully',
      participantsCount: forum.participantsCount
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Leave forum error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave discussion'
    });
  }
};

// @desc    Send message in forum
// @route   POST /api/forums/:id/messages
// @access  Private
const sendForumMessage = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const forumId = req.params.id;
    const userId = req.user.id;
    const { content, isAnonymous } = req.body;

    console.log('📝 Sending message to forum:', forumId);

    if (!content || !content.trim()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please provide message content'
      });
    }

    const forum = await Forum.findByPk(forumId, { transaction });

    if (!forum || !forum.isActive) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Forum not found'
      });
    }

    // Check if forum is locked
    if (forum.isLocked) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'This discussion is locked'
      });
    }

    // Check if user is a participant
    const participants = forum.participants || [];
    if (!participants.includes(userId) && forum.authorId !== userId) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'You must join the discussion to send messages'
      });
    }

    // Create message
    const message = await ForumMessage.create({
      forumId,
      senderId: userId,
      content: content.trim(),
      isAnonymous: isAnonymous || false,
      isActive: true
    }, { transaction });

    await transaction.commit();

    // Fetch created message with sender info
    const createdMessage = await ForumMessage.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'fullName', 'username', 'profilePicture']
        }
      ]
    });

    // Hide sender info if anonymous
    if (isAnonymous) {
      createdMessage.dataValues.sender = {
        username: 'Anonymous',
        fullName: 'Anonymous',
        profilePicture: null
      };
    }

    // Emit via socket for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`forum-${forumId}`).emit('new-forum-message', createdMessage);
    }

    res.status(201).json({
      success: true,
      message: createdMessage
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Send forum message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// @desc    Get forum messages
// @route   GET /api/forums/:id/messages
// @access  Private
const getForumMessages = async (req, res) => {
  try {
    const forumId = req.params.id;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    console.log('🔍 Fetching messages for forum:', forumId);

    // Check if forum exists
    const forum = await Forum.findByPk(forumId);
    if (!forum || !forum.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Forum not found'
      });
    }

    // Get messages
    const messages = await ForumMessage.findAll({
      where: { 
        forumId,
        isActive: true 
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'fullName', 'username', 'profilePicture']
        }
      ],
      order: [['createdAt', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    console.log(`✅ Found ${messages.length} messages`);

    // Hide sender info for anonymous messages
    const processedMessages = messages.map(msg => {
      const msgData = msg.toJSON();
      if (msg.isAnonymous && msg.senderId !== req.user.id) {
        msgData.sender = {
          username: 'Anonymous',
          fullName: 'Anonymous',
          profilePicture: null
        };
      }
      return msgData;
    });

    const total = await ForumMessage.count({ 
      where: { 
        forumId, 
        isActive: true 
      } 
    });

    res.json({
      success: true,
      messages: processedMessages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get forum messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages',
      error: error.message
    });
  }
};

// Update getForumById to include participant status
const getForumById = async (req, res) => {
  try {
    const forumId = req.params.id;
    console.log('🔍 Fetching forum by ID:', forumId);

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(forumId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid forum ID format'
      });
    }

    const forum = await Forum.findByPk(forumId, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'fullName', 'username', 'profilePicture', 'branch', 'year']
        }
      ]
    });

    if (!forum || !forum.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Forum post not found'
      });
    }

    // Increment views
    await forum.increment('views', { by: 1 });

    const forumData = forum.toJSON();
    forumData.isLiked = forumData.likes?.includes(req.user.id) || false;
    forumData.isAuthor = forumData.authorId === req.user.id;
    forumData.hasJoined = forumData.participants?.includes(req.user.id) || false;

    // Hide author info if anonymous
    if (forumData.isAnonymous && !forumData.isAuthor) {
      forumData.author = { 
        username: 'Anonymous', 
        fullName: 'Anonymous',
        profilePicture: null 
      };
    }

    console.log('✅ Forum fetched successfully:', forum.id);

    res.json({
      success: true,
      forum: forumData
    });
  } catch (error) {
    console.error('❌ Get forum error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get forum post',
      error: error.message
    });
  }
};

module.exports = {
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
};