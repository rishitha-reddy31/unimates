const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const MasterUser = sequelize.define('MasterUser', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('superadmin', 'admin', 'moderator'),
    allowNull: false
  },
  permissions: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  managedColleges: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  lastLogin: {
    type: DataTypes.DATE
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  twoFactorEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  twoFactorSecret: {
    type: DataTypes.STRING
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (masterUser) => {
      if (masterUser.password) {
        const salt = await bcrypt.genSalt(10);
        masterUser.password = await bcrypt.hash(masterUser.password, salt);
      }
    },
    beforeUpdate: async (masterUser) => {
      if (masterUser.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        masterUser.password = await bcrypt.hash(masterUser.password, salt);
      }
    }
  },
  indexes: [
    {
      fields: ['email']
    },
    {
      fields: ['role']
    },
    {
      fields: ['isActive']
    }
  ]
});

// Instance method to compare password
MasterUser.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = MasterUser;