const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AnonymousPost = sequelize.define('AnonymousPost', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  questionTitle: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  questionBody: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('CAMPUS', 'ACADEMIC', 'PLACEMENT', 'GENERAL', 'HOSTEL', 'CANTEEN', 'LIBRARY'),
    defaultValue: 'GENERAL'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  anonymousId: {
    type: DataTypes.STRING,
    defaultValue: () => `anon_${Math.random().toString(36).substring(2, 10)}`
  },
  answers: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  answersCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  reportsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isAnswered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['createdBy']
    },
    {
      fields: ['category']
    },
    {
      fields: ['createdAt']
    }
  ]
});

module.exports = AnonymousPost;