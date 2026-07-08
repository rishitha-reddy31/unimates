// backend/src/models/Post.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  authorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  collegeId: {
    type: DataTypes.UUID,
    references: {
      model: 'Colleges',
      key: 'id'
    }
  },
  media: {
    type: DataTypes.JSONB, // Store array of media objects { type: 'image/video', url: '...', thumbnail: '...' }
    defaultValue: []
  },
// In your Post model, make sure mediaType is defined
mediaType: {
  type: DataTypes.ENUM('text', 'image', 'video', 'mixed'),
  defaultValue: 'text',
  field: 'mediaType'
},
  likes: {
    type: DataTypes.JSONB,
    defaultValue: [] // Array of user IDs who liked
  },
  likesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  comments: {
    type: DataTypes.JSONB,
    defaultValue: [] // Store comments as JSON for simplicity
  },
  commentsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  shares: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  visibility: {
    type: DataTypes.ENUM('public', 'college', 'private'),
    defaultValue: 'college'
  },
  allowedGroups: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  mentions: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isReported: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reportCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
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
      fields: ['collegeId']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = Post;