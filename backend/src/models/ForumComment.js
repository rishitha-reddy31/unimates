// backend/src/models/ForumComment.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ForumComment = sequelize.define('ForumComment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
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
  authorId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'authorId',
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  parentCommentId: {
    type: DataTypes.UUID,
    field: 'parentCommentId',
    references: {
      model: 'ForumComments',
      key: 'id'
    }
  },
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'isAnonymous'
  },
  likes: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'likes'
  },
  likesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'likesCount'
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
  tableName: 'ForumComments',
  underscored: false,
  indexes: [
    {
      fields: ['forumId']
    },
    {
      fields: ['authorId']
    },
    {
      fields: ['parentCommentId']
    }
  ]
});

module.exports = ForumComment;