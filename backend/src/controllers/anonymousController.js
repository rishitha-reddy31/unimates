const { AnonymousPost, Report, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Create anonymous post
// @route   POST /api/anonymous/create
// @access  Private
const createAnonymousPost = async (req, res) => {
  try {
    const { questionTitle, questionBody, category } = req.body;

    // Validation
    if (!questionTitle || !questionBody) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and content'
      });
    }

    // Validate category
    const validCategories = ['CAMPUS', 'ACADEMIC', 'PLACEMENT', 'GENERAL', 'HOSTEL', 'CANTEEN', 'LIBRARY'];
    const finalCategory = category || 'GENERAL';
    
    if (!validCategories.includes(finalCategory)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }

    // Generate anonymous ID
    const anonymousId = `anon_${Math.random().toString(36).substring(2, 10)}`;

    const post = await AnonymousPost.create({
      questionTitle,
      questionBody,
      category: finalCategory,
      createdBy: req.user.id,
      anonymousId,
      answers: [],
      views: 0,
      reportsCount: 0,
      isAnswered: false
    });

    // Return post without creator info
    res.status(201).json({
      success: true,
      post: {
        id: post.id,
        questionTitle: post.questionTitle,
        questionBody: post.questionBody,
        category: post.category,
        anonymousId: post.anonymousId,
        answers: [],
        answersCount: 0,
        views: 0,
        createdAt: post.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Create anonymous post error:', error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: error.errors.map(e => e.message).join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create anonymous post'
    });
  }
};
// @desc    Get all anonymous posts
// @route   GET /api/anonymous/all
// @access  Private
const getAllPosts = async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = { 
      isDeleted: false,
      reportsCount: { [Op.lt]: 10 } // Hide posts with too many reports
    };

    if (category) {
      whereClause.category = category;
    }

    const { count, rows: posts } = await AnonymousPost.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
      attributes: { exclude: ['createdBy'] } // Exclude creator info
    });

    // Add answers count and remove answers from list view
    const postsWithStats = posts.map(post => {
      const postData = post.toJSON();
      postData.answersCount = post.answers?.filter(a => !a.isDeleted)?.length || 0;
      delete postData.answers; // Don't send answers in list view
      return postData;
    });

    res.json({
      success: true,
      posts: postsWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Get anonymous posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get anonymous posts'
    });
  }
};

// @desc    Get anonymous post by ID
// @route   GET /api/anonymous/:id
// @access  Private
const getPostById = async (req, res) => {
  try {
    const post = await AnonymousPost.findByPk(req.params.id, {
      attributes: { exclude: ['createdBy'] } // Exclude creator info
    });

    if (!post || post.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment views
    post.views += 1;
    await post.save();

    // Filter out deleted answers
    const activeAnswers = (post.answers || []).filter(a => !a.isDeleted);

    res.json({
      success: true,
      post: {
        ...post.toJSON(),
        answers: activeAnswers,
        answersCount: activeAnswers.length
      }
    });
  } catch (error) {
    console.error('❌ Get anonymous post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get anonymous post'
    });
  }
};

// @desc    Reply to anonymous post
// @route   POST /api/anonymous/:id/reply
// @access  Private
const addReply = async (req, res) => {
  try {
    const { content } = req.body;
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }

    const post = await AnonymousPost.findByPk(id);

    if (!post || post.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const answers = post.answers || [];
    
    const newReply = {
      id: Date.now().toString(),
      userId: req.user.id,
      content,
      anonymousId: `reply_${Math.random().toString(36).substring(2, 8)}`,
      createdAt: new Date().toISOString(),
      isDeleted: false,
      likes: []
    };

    post.answers = [...answers, newReply];
    post.answersCount = post.answers.length;
    post.isAnswered = true;
    
    await post.save();

    // Return reply without user info
    res.status(201).json({
      success: true,
      reply: {
        id: newReply.id,
        content: newReply.content,
        anonymousId: newReply.anonymousId,
        createdAt: newReply.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Add reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reply'
    });
  }
};

// @desc    Report anonymous post
// @route   POST /api/anonymous/:id/report
// @access  Private
const reportPost = async (req, res) => {
  try {
    const { reason, description } = req.body;

    const post = await AnonymousPost.findByPk(req.params.id);

    if (!post || post.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if already reported by this user
    const existingReport = await Report.findOne({
      where: {
        reporterId: req.user.id,
        reportedPostId: post.id,
        reason: reason
      }
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this post'
      });
    }

    // Create report
    await Report.create({
      reporterId: req.user.id,
      reportedPostId: post.id,
      reason,
      description,
      status: 'pending'
    });

    // Increment report count
    post.reportsCount += 1;
    await post.save();

    res.json({
      success: true,
      message: 'Post reported successfully'
    });
  } catch (error) {
    console.error('❌ Report post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report post'
    });
  }
};

// @desc    Delete anonymous post (admin only)
// @route   DELETE /api/anonymous/:id
// @access  Private/Admin
const deletePost = async (req, res) => {
  try {
    const post = await AnonymousPost.findByPk(req.params.id);

    if (!post || post.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.isDeleted = true;
    await post.save();

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete anonymous post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete anonymous post'
    });
  }
};

module.exports = {
  createAnonymousPost,
  getAllPosts,
  getPostById,
  addReply,
  reportPost,
  deletePost
};