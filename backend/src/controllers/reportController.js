const { Report, User, Post, Comment, Forum, AnonymousPost, MasterUser } = require('../models');
const { Op } = require('sequelize');

// @desc    Create report
// @route   POST /api/reports/create
// @access  Private
const createReport = async (req, res) => {
  try {
    const { contentType, contentId, reason, description } = req.body;

    // Check if content exists
    let contentExists = false;
    let reportedUserId = null;
    let reportedPostId = null;
    let reportedCommentId = null;
    let reportedForumId = null;
    let reportedAnonymousPostId = null;

    switch (contentType) {
      case 'USER':
        const user = await User.findByPk(contentId);
        contentExists = !!user;
        if (user) reportedUserId = contentId;
        break;
      case 'POST':
        const post = await Post.findByPk(contentId);
        contentExists = !!post;
        if (post) reportedPostId = contentId;
        break;
      case 'COMMENT':
        const comment = await Comment.findByPk(contentId);
        contentExists = !!comment;
        if (comment) reportedCommentId = contentId;
        break;
      case 'FORUM':
        const forum = await Forum.findByPk(contentId);
        contentExists = !!forum;
        if (forum) reportedForumId = contentId;
        break;
      case 'ANONYMOUS':
        const anonymousPost = await AnonymousPost.findByPk(contentId);
        contentExists = !!anonymousPost;
        if (anonymousPost) reportedAnonymousPostId = contentId;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid content type'
        });
    }

    if (!contentExists) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Check if already reported by this user for this content
    const existingReport = await Report.findOne({
      where: {
        reporterId: req.user.id,
        contentType,
        contentId
      }
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this content'
      });
    }

    // Create report
    const report = await Report.create({
      reporterId: req.user.id,
      reportedUserId,
      reportedPostId,
      reportedCommentId,
      reportedForumId,
      reportedAnonymousPostId,
      contentType,
      contentId,
      reason,
      description,
      status: 'pending'
    });

    // Update content report count (if needed - you may need to add reportCount fields to models)
    if (contentType === 'POST' && reportedPostId) {
      await Post.update(
        { reportCount: sequelize.literal('"reportCount" + 1') },
        { where: { id: contentId } }
      );
    } else if (contentType === 'ANONYMOUS' && reportedAnonymousPostId) {
      await AnonymousPost.update(
        { reportsCount: sequelize.literal('"reportsCount" + 1') },
        { where: { id: contentId } }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      report
    });
  } catch (error) {
    console.error('❌ Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create report'
    });
  }
};

// @desc    Get all reports (admin only)
// @route   GET /api/reports
// @access  Private/Admin
const getReports = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: reports } = await Report.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'username', 'fullName', 'email']
        },
        {
          model: MasterUser,
          as: 'resolvedBy',
          attributes: ['id', 'username', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reports'
    });
  }
};

// @desc    Resolve report (admin only)
// @route   PUT /api/reports/:id/resolve
// @access  Private/Admin
const resolveReport = async (req, res) => {
  try {
    const { action, notes } = req.body;

    const report = await Report.findByPk(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.status = 'resolved';
    report.resolvedById = req.user.id;
    report.resolvedAt = new Date();
    report.action = action || 'NONE';
    if (notes) report.notes = notes;

    await report.save();

    // Take action based on resolution
    if (action === 'DELETE') {
      const { contentType, contentId } = report;
      
      switch (contentType) {
        case 'POST':
          await Post.update({ isDeleted: true }, { where: { id: contentId } });
          break;
        case 'COMMENT':
          await Comment.update({ isDeleted: true }, { where: { id: contentId } });
          break;
        case 'USER':
          await User.update({ isActive: false }, { where: { id: contentId } });
          break;
        case 'FORUM':
          await Forum.update({ isDeleted: true }, { where: { id: contentId } });
          break;
        case 'ANONYMOUS':
          await AnonymousPost.update({ isDeleted: true }, { where: { id: contentId } });
          break;
      }
    } else if (action === 'SUSPEND' && report.contentType === 'USER') {
      await User.update({ status: 'suspended' }, { where: { id: report.contentId } });
    } else if (action === 'BAN' && report.contentType === 'USER') {
      await User.update({ status: 'banned' }, { where: { id: report.contentId } });
    }

    res.json({
      success: true,
      message: 'Report resolved successfully'
    });
  } catch (error) {
    console.error('❌ Resolve report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve report'
    });
  }
};

// @desc    Dismiss report (admin only)
// @route   PUT /api/reports/:id/dismiss
// @access  Private/Admin
const dismissReport = async (req, res) => {
  try {
    const report = await Report.findByPk(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.status = 'dismissed';
    report.resolvedById = req.user.id;
    report.resolvedAt = new Date();
    report.action = 'NONE';

    await report.save();

    res.json({
      success: true,
      message: 'Report dismissed successfully'
    });
  } catch (error) {
    console.error('❌ Dismiss report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to dismiss report'
    });
  }
};

module.exports = {
  createReport,
  getReports,
  resolveReport,
  dismissReport
};