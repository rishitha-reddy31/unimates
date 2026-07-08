// backend/src/models/Message.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  receiverId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readAt: {
    type: DataTypes.DATE
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  deletedFor: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: []
  },
  groupId: {
    type: DataTypes.UUID
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['senderId', 'receiverId']
    },
    {
      fields: ['receiverId', 'isRead']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = Message;