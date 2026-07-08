// backend/src/models/FollowRequest.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FollowRequest = sequelize.define('FollowRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  requesterId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  recipientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending'
  },
  viewedAt: {
    type: DataTypes.DATE
  },
  respondedAt: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['requesterId', 'recipientId']
    }
  ]
});

module.exports = FollowRequest;