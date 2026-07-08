const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  venue: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM('academic', 'cultural', 'sports', 'technical', 'workshop', 'seminar', 'other'),
    defaultValue: 'other'
  },
  maxAttendees: {
    type: DataTypes.INTEGER
  },
  createdBy: {
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
  attendees: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  attendeesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
      fields: ['collegeId']
    },
    {
      fields: ['date']
    },
    {
      fields: ['category']
    }
  ]
});

module.exports = Event;