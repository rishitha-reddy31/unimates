// backend/src/models/Group.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Group = sequelize.define('Group', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    validate: {
      len: [0, 1000]
    }
  },
  collegeId: {
    type: DataTypes.UUID,
    references: {
      model: 'Colleges',
      key: 'id'
    }
  },
  groupType: {
    type: DataTypes.ENUM('STUDY', 'CODING', 'PROJECT', 'PLACEMENT', 'INTERNSHIP', 'CULTURAL', 'SPORTS', 'OTHER'),
    allowNull: false,
    defaultValue: 'OTHER'
  },
  creatorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  privacy: {
    type: DataTypes.ENUM('public', 'private'),
    defaultValue: 'public'
  },
  joinRequests: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  posts: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  postsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  resources: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  resourcesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  maxMembers: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  icon: {
    type: DataTypes.STRING
  },
  coverImage: {
    type: DataTypes.STRING
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['collegeId']
    },
    {
      fields: ['creatorId']
    },
    {
      fields: ['groupType']
    }
  ]
});

module.exports = Group;