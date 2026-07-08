const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  reporterId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  reportedUserId: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  reportedPostId: {
    type: DataTypes.UUID,
    references: {
      model: 'Posts',
      key: 'id'
    }
  },
  reportedCommentId: {
    type: DataTypes.UUID,
    references: {
      model: 'Comments',
      key: 'id'
    }
  },
  reportedForumId: {
    type: DataTypes.UUID,
    references: {
      model: 'Forums',
      key: 'id'
    }
  },
  reportedAnonymousPostId: {
    type: DataTypes.UUID,
    references: {
      model: 'AnonymousPosts',
      key: 'id'
    }
  },
  contentType: {
    type: DataTypes.ENUM('USER', 'POST', 'COMMENT', 'FORUM', 'ANONYMOUS'),
    allowNull: false
  },
  contentId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  reason: {
    type: DataTypes.ENUM(
      'spam', 'harassment', 'hate_speech', 'violence',
      'nudity', 'false_information', 'intellectual_property',
      'impersonation', 'other'
    ),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('pending', 'investigating', 'resolved', 'dismissed'),
    defaultValue: 'pending'
  },
  action: {
    type: DataTypes.ENUM('NONE', 'WARNING', 'DELETE', 'SUSPEND', 'BAN'),
    defaultValue: 'NONE'
  },
  resolvedById: {
    type: DataTypes.UUID,
    references: {
      model: 'MasterUsers',
      key: 'id'
    }
  },
  resolvedAt: {
    type: DataTypes.DATE
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['reporterId']
    },
    {
      fields: ['reportedUserId']
    },
    {
      fields: ['reportedPostId']
    },
    {
      fields: ['contentType', 'contentId']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Report;