const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fullName: {
    type: DataTypes.STRING(100)
  },
  profilePicture: {
    type: DataTypes.STRING,
    defaultValue: 'default-avatar.png'
  },
  // Add these fields to your User model definition in models/User.js

// Add these fields to the existing model definition:

skills: {
  type: DataTypes.JSON,
  defaultValue: []
},

interests: {
  type: DataTypes.JSON,
  defaultValue: []
},

hobbies: {
  type: DataTypes.JSON,
  defaultValue: []
},

projects: {
  type: DataTypes.JSON,
  defaultValue: []
},

achievements: {
  type: DataTypes.JSON,
  defaultValue: []
},

blockedUsers: {
  type: DataTypes.JSON,
  defaultValue: []
},
  coverPicture: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  bio: {
    type: DataTypes.TEXT
  },
  collegeId: {
    type: DataTypes.UUID,
    references: {
      model: 'Colleges',
      key: 'id'
    }
  },
  year: {
    type: DataTypes.ENUM('1st', '2nd', '3rd', '4th', 'Graduate', 'Alumni', 'Faculty')
  },
  branch: {
    type: DataTypes.STRING
  },
  phoneNumber: {
    type: DataTypes.STRING(15)
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isPrivate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  role: {
    type: DataTypes.ENUM('user', 'moderator', 'admin', 'superadmin'),
    defaultValue: 'user'
  },
  status: {
    type: DataTypes.ENUM('active', 'suspended', 'banned'),
    defaultValue: 'active'
  },
  verificationToken: {
    type: DataTypes.STRING
  },
  resetPasswordToken: {
    type: DataTypes.STRING
  },
  resetPasswordExpire: {
    type: DataTypes.DATE
  },
  refreshToken: {
    type: DataTypes.TEXT
  },
  lastLogin: {
    type: DataTypes.DATE
  },
  followersCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  followingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  pendingRequestsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reportCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      // Only hash if password was actually changed
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance method to compare password
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;