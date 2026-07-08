const { Notification, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Get notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'fullName', 'profilePicture']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      success: true,
      notifications,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications'
    });
  }
};

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.count({
      where: {
        userId: req.user.id,
        isRead: false
      }
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('❌ Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('❌ Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      {
        isRead: true,
        readAt: new Date()
      },
      {
        where: {
          userId: req.user.id,
          isRead: false
        }
      }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('❌ Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all as read'
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.destroy();

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('❌ Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};