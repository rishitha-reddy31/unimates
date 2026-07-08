const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const College = sequelize.define('College', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  shortName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    // Remove any extra configuration that might cause issues
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      is: /^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    }
  },
  logo: {
    type: DataTypes.STRING,
    defaultValue: 'default-college-logo.png'
  },
  coverImage: {
    type: DataTypes.STRING
  },
  address: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  city: {
    type: DataTypes.STRING,
    defaultValue: 'Hyderabad'
  },
  state: {
    type: DataTypes.STRING,
    defaultValue: 'Telangana'
  },
  country: {
    type: DataTypes.STRING,
    defaultValue: 'India'
  },
  website: {
    type: DataTypes.STRING
  },
  emailDomain: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  description: {
    type: DataTypes.TEXT
  },
  establishedYear: {
    type: DataTypes.INTEGER
  },
  type: {
    type: DataTypes.ENUM('Public', 'Private', 'Deemed', 'Autonomous', 'Institute of National Importance')
  },
  accreditation: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  totalStudents: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  deletedAt: {
    type: DataTypes.DATE
  },
  socialLinks: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['name']
    },
    {
      unique: true,
      fields: ['shortName']
    },
    {
      unique: true,
      fields: ['domain']
    },
    {
      unique: true,
      fields: ['code']
    }
  ]
});

module.exports = College;