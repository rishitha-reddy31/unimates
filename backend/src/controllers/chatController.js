// backend/src/controllers/chatController.js
const { Op } = require('sequelize');
const Message = require('../models/Message');
const User = require('../models/User');
const Follow = require('../models/Follow');

// @desc    Send a message
// @route   POST /api/chat/send
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, content } = req.body;

    console.log('📝 Send message request:', { senderId, receiverId });

    // Check if users follow each other (optional - you can allow messaging only between followers)
    const isFollowing = await Follow.findOne({
      where: {
        followerId: senderId,
        followingId: receiverId
      }
    });

    if (!isFollowing) {
      return res.status(403).json({
        success: false,
        message: 'You can only message users you follow'
      });
    }

    // Create message
    const message = await Message.create({
      senderId,
      receiverId,
      content
    });

    // Get sender details
    const sender = await User.findByPk(senderId, {
      attributes: ['id', 'fullName', 'username', 'profilePicture']
    });

    // Emit via socket (will be handled in socket.js)
    const io = req.app.get('io');
    io.to(receiverId).emit('new-message', {
      ...message.toJSON(),
      sender
    });

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: {
        ...message.toJSON(),
        sender
      }
    });

  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// @desc    Get conversations for current user
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all messages where user is either sender or receiver
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ],
        isDeleted: false,
        [Op.not]: {
          deletedFor: { [Op.contains]: [userId] }
        }
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'fullName', 'username', 'profilePicture']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'fullName', 'username', 'profilePicture']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Group messages by conversation
    const conversations = {};
    
    messages.forEach(message => {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      const otherUser = message.senderId === userId ? message.receiver : message.sender;
      
      if (!conversations[otherUserId]) {
        conversations[otherUserId] = {
          user: otherUser,
          lastMessage: message,
          unreadCount: message.receiverId === userId && !message.isRead ? 1 : 0
        };
      } else {
        // Update unread count
        if (message.receiverId === userId && !message.isRead) {
          conversations[otherUserId].unreadCount++;
        }
      }
    });

    // Convert to array and sort by last message date
    const conversationList = Object.values(conversations)
      .sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

    res.json({
      success: true,
      conversations: conversationList
    });

  } catch (error) {
    console.error('❌ Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversations',
      error: error.message
    });
  }
};

// @desc    Get messages with a specific user
// @route   GET /api/chat/messages/:userId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId }
        ],
        isDeleted: false,
        [Op.not]: {
          deletedFor: { [Op.contains]: [currentUserId] }
        }
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'fullName', 'username', 'profilePicture']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    // Mark messages as read
    await Message.update(
      { isRead: true, readAt: new Date() },
      {
        where: {
          senderId: otherUserId,
          receiverId: currentUserId,
          isRead: false
        }
      }
    );

    res.json({
      success: true,
      messages
    });

  } catch (error) {
    console.error('❌ Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages',
      error: error.message
    });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/read/:userId
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    await Message.update(
      { isRead: true, readAt: new Date() },
      {
        where: {
          senderId: otherUserId,
          receiverId: currentUserId,
          isRead: false
        }
      }
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });

  } catch (error) {
    console.error('❌ Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
};

// @desc    Delete a message
// @route   DELETE /api/chat/message/:messageId
// @access  Private
const deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const messageId = req.params.messageId;

    const message = await Message.findByPk(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is sender or receiver
    if (message.senderId !== userId && message.receiverId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    // Soft delete - add to deletedFor array
    const deletedFor = message.deletedFor || [];
    if (!deletedFor.includes(userId)) {
      deletedFor.push(userId);
      await message.update({ deletedFor });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: error.message
    });
  }
};

module.exports = {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
  deleteMessage
};