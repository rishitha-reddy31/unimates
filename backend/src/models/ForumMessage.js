// backend/src/models/ForumMessage.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ForumMessage = sequelize.define('ForumMessage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  forumId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'forumId',
    references: {
      model: 'Forums',
      key: 'id'
    }
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'senderId',
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'isAnonymous'
  },
  isEdited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'isEdited'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'isActive'
  }
}, {
  timestamps: true,
  tableName: 'ForumMessages',
  indexes: [
    {
      fields: ['forumId']
    },
    {
      fields: ['senderId']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = ForumMessage;