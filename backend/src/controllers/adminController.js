const { User, Post, Report, Event, AnonymousPost, Forum, Group, MasterUser, sequelize } = require('../models');
const { Op } = require('sequelize');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    // Get counts using Promise.all for parallel execution
    const [
      totalUsers,
      totalPosts,
      totalEvents,
      pendingReports,
      totalGroups,
      totalForums,
      anonymousPosts,
      flaggedAnonymous
    ] = await Promise.all([
      User.count({ where: { isDeleted: false } }),
      Post.count({ where: { status: 'active' } }),
      Event.count({ where: { isDeleted: false } }),
      Report.count({ where: { status: 'pending' } }),
      Group.count({ where: { isActive: true } }),
      Forum.count({ where: { isDeleted: false } }),
      AnonymousPost.count({ where: { isDeleted: false } }),
      AnonymousPost.count({ where: { 
        reportsCount: { [Op.gte]: 5 },
        isDeleted: false 
      }})
    ]);

    // Get recent users
    const recentUsers = await User.findAll({
      where: { isDeleted: false },
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'username', 'fullName', 'email', 'createdAt']
    });

    // Get recent pending reports
    const recentReports = await Report.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'username', 'fullName']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalPosts,
        totalEvents,
        pendingReports,
        totalGroups,
        totalForums,
        anonymousPosts,
        flaggedAnonymous
      },
      recentActivity: {
        users: recentUsers,
        reports: recentReports
      }
    });
  } catch (error) {
    console.error('❌ Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get stats'
    });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = { isDeleted: false };

    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { fullName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (role) {
      whereClause.role = role;
    }

    if (status) {
      whereClause.status = status;
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password', 'refreshToken', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpire'] },
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users'
    });
  }
};

// @desc    Update user status (admin only)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'active', 'suspended', 'banned'

    const user = await User.findByPk(req.params.id);

    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if trying to modify an admin
    if (user.role === 'admin' || user.role === 'superadmin') {
      // Allow superadmin to modify admins, but not other admins
      const currentUser = await User.findByPk(req.user.id);
      if (currentUser.role !== 'superadmin') {
        return res.status(403).json({
          success: false,
          message: 'Cannot modify admin users'
        });
      }
    }

    user.status = status;
    await user.save();

    res.json({
      success: true,
      message: `User status updated to ${status}`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    console.error('❌ Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
};

// @desc    Update user role (admin only)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body; // 'user', 'moderator', 'admin'

    const user = await User.findByPk(req.params.id);

    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if trying to modify own role
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify your own role'
      });
    }

    // Only superadmin can assign admin roles
    const currentUser = await User.findByPk(req.user.id);
    if (role === 'admin' && currentUser.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Only superadmin can assign admin role'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role'
    });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if trying to delete an admin
    if (user.role === 'admin' || user.role === 'superadmin') {
      const currentUser = await User.findByPk(req.user.id);
      if (currentUser.role !== 'superadmin') {
        return res.status(403).json({
          success: false,
          message: 'Cannot delete admin users'
        });
      }
    }

    // Soft delete user
    user.isDeleted = true;
    user.status = 'banned';
    await user.save();

    // Soft delete user's content
    await Post.update(
      { status: 'deleted' },
      { where: { authorId: user.id } }
    );

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

// @desc    Get flagged content (admin only)
// @route   GET /api/admin/flagged-content
// @access  Private/Admin
const getFlaggedContent = async (req, res) => {
  try {
    // Get posts with high report count
    const flaggedPosts = await Post.findAll({
      where: {
        reportCount: { [Op.gte]: 5 },
        status: 'active'
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'email']
        }
      ],
      order: [['reportCount', 'DESC']],
      limit: 50
    });

    // Get flagged anonymous posts
    const flaggedAnonymous = await AnonymousPost.findAll({
      where: {
        reportsCount: { [Op.gte]: 3 },
        isDeleted: false
      },
      order: [['reportsCount', 'DESC']],
      limit: 50
    });

    // Get flagged comments
    const { Comment } = require('../models');
    const flaggedComments = await Comment.findAll({
      where: {
        reportCount: { [Op.gte]: 3 },
        status: 'active'
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName']
        }
      ],
      order: [['reportCount', 'DESC']],
      limit: 50
    });

    res.json({
      success: true,
      content: {
        posts: flaggedPosts,
        anonymous: flaggedAnonymous,
        comments: flaggedComments
      }
    });
  } catch (error) {
    console.error('❌ Get flagged content error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get flagged content'
    });
  }
};

// @desc    Get system logs (admin only)
// @route   GET /api/admin/logs
// @access  Private/Admin
const getLogs = async (req, res) => {
  try {
    // Get recent reports
    const recentReports = await Report.findAll({
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'username', 'fullName']
        },
        {
          model: MasterUser,
          as: 'resolvedBy',
          attributes: ['id', 'username']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    // Get recent events
    const recentEvents = await Event.findAll({
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'username', 'fullName']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    // Get recent user registrations
    const recentUsers = await User.findAll({
      where: { isDeleted: false },
      attributes: ['id', 'username', 'fullName', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    res.json({
      success: true,
      logs: {
        reports: recentReports,
        events: recentEvents,
        users: recentUsers
      }
    });
  } catch (error) {
    console.error('❌ Get logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get logs'
    });
  }
};

module.exports = {
  getStats,
  getUsers,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getFlaggedContent,
  getLogs
};