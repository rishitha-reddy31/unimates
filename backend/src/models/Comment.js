const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 1000]
    }
  },
  authorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  postId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Posts',
      key: 'id'
    }
  },
  parentCommentId: {
    type: DataTypes.UUID,
    references: {
      model: 'Comments',
      key: 'id'
    }
  },
  replies: {  // This JSONB field exists
    type: DataTypes.JSONB,
    defaultValue: []
  },
  likes: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  likesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  mentions: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  media: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
    // Add these fields if missing
  reportCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isEdited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  editHistory: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('active', 'hidden', 'deleted'),
    defaultValue: 'active'
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['authorId']
    },
    {
      fields: ['postId']
    },
    {
      fields: ['parentCommentId']
    }
  ]
});

module.exports = Comment;