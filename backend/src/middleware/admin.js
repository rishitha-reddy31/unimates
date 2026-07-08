const { MasterUser } = require('../models');

// Check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if user is a master user (admin)
    const masterUser = await MasterUser.findByPk(req.user.id);
    
    if (!masterUser) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    req.masterUser = masterUser;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking admin status'
    });
  }
};

// Check specific admin permissions
const hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.masterUser) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const permissions = req.masterUser.permissions || [];
    
    if (!permissions.includes(permission) && req.masterUser.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: `Permission '${permission}' required`
      });
    }

    next();
  };
};

// Check if admin manages specific college
const managesCollege = (paramName = 'collegeId') => {
  return async (req, res, next) => {
    try {
      if (!req.masterUser) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized'
        });
      }

      // Superadmin can manage all colleges
      if (req.masterUser.role === 'superadmin') {
        return next();
      }

      const collegeId = req.params[paramName] || req.body[paramName];
      const managedColleges = req.masterUser.managedColleges || [];

      if (!managedColleges.includes(collegeId)) {
        return res.status(403).json({
          success: false,
          message: 'You do not manage this college'
        });
      }

      next();
    } catch (error) {
      console.error('College management check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking college management'
      });
    }
  };
};

module.exports = {
  isAdmin,
  hasPermission,
  managesCollege
};