// backend/src/models/Forum.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Forum = sequelize.define('Forum', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('GENERAL', 'ACADEMIC', 'CAREER', 'TECHNICAL', 'PROJECTS', 'INTERNSHIPS', 'PLACEMENTS', 'EVENTS', 'OTHER'),
    defaultValue: 'GENERAL'
  },
  collegeId: {
    type: DataTypes.UUID,
    field: 'collegeId',
    references: {
      model: 'Colleges',
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
  isAnonymous: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'isAnonymous'
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'isPinned'
  },
  isLocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'isLocked'
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'views'
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
  participants: {
    type: DataTypes.JSONB,
    defaultValue: [], // Array of user IDs who joined
    field: 'participants'
  },
  participantsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'participantsCount'
  },
  commentsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'commentsCount'
  },
  tags: {
    type: DataTypes.JSONB,
    defaultValue: [],
    field: 'tags'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'isActive'
  }
}, {
  timestamps: true,
  tableName: 'Forums',
  underscored: false,
  indexes: [
    {
      fields: ['collegeId']
    },
    {
      fields: ['authorId']
    },
    {
      fields: ['category']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = Forum;