// backend/src/models/GroupMember.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GroupMember = sequelize.define('GroupMember', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  groupId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'groupId',
    references: {
      model: 'Groups',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'UserId', // Match the database column name exactly
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'moderator', 'member'),
    defaultValue: 'member',
    field: 'role'
  },
  joinedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'joinedAt'
  },
  lastActive: {
    type: DataTypes.DATE,
    field: 'lastActive'
  },
  notificationsEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'notificationsEnabled'
  },
  isMuted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'isMuted'
  }
}, {
  timestamps: true,
  tableName: 'GroupMembers',
  underscored: false, // Don't use underscored names
  indexes: [
    {
      unique: true,
      fields: ['groupId', 'userId']
    },
    {
      fields: ['groupId']
    },
    {
      fields: ['userId']
    }
  ]
});

module.exports = GroupMember;