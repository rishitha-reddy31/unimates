const Notification = require('../models/Notification');
const { getIO } = require('../config/socket');

const createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    
    // Populate sender info
    const populatedNotification = await Notification.findById(notification._id)
      .populate('sender', 'profile.name profile.profilePicture');

    // Emit real-time notification
    const io = getIO();
    io.to(`user:${data.recipient}`).emit('new-notification', populatedNotification);

    return populatedNotification;
  } catch (error) {
    console.error('Notification creation error:', error);
    throw error;
  }
};

const markAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        recipient: userId
      },
      {
        read: true,
        readAt: Date.now()
      },
      { new: true }
    );

    return notification;
  } catch (error) {
    console.error('Mark as read error:', error);
    throw error;
  }
};

const markAllAsRead = async (userId) => {
  try {
    await Notification.updateMany(
      {
        recipient: userId,
        read: false
      },
      {
        read: true,
        readAt: Date.now()
      }
    );

    return true;
  } catch (error) {
    console.error('Mark all as read error:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  markAsRead,
  markAllAsRead
};