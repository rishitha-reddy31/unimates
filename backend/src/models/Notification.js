const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  senderId: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM(
      'like', 'comment', 'reply', 'follow', 'follow_request',
      'follow_accept', 'mention', 'share', 'event_invite',
      'group_invite', 'post_approval', 'report_update',
      'system', 'message', 'announcement'
    ),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  data: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readAt: {
    type: DataTypes.DATE
  },
  isClicked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  },
  expiresAt: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['userId', 'isRead', 'createdAt']
    },
    {
      fields: ['userId', 'createdAt']
    },
    {
      fields: ['type']
    }
  ]
});

module.exports = Notification;