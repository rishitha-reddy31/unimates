const { College, MasterUser, User } = require('../models');
const { Op } = require('sequelize');

// ===================================
// PUBLIC CONTROLLERS
// ===================================

// @desc    Get all active colleges
// @route   GET /api/colleges
// @access  Public
const getColleges = async (req, res) => {
  try {
    const colleges = await College.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'shortName', 'code', 'domain', 'city', 'state', 'establishedYear', 'totalStudents', 'logo'],
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: colleges.length,
      colleges
    });
  } catch (error) {
    console.error('❌ Get colleges error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch colleges'
    });
  }
};

// @desc    Get college by ID or domain
// @route   GET /api/colleges/:id
// @route   GET /api/colleges/domain/:domain
// @access  Public
const getCollegeByDomain = async (req, res) => {
  try {
    let whereClause = { isActive: true };
    
    // Check if searching by ID or domain
    if (req.params.id) {
      whereClause.id = req.params.id;
    } else if (req.params.domain) {
      whereClause.domain = req.params.domain;
    }

    const college = await College.findOne({
      where: whereClause,
      attributes: ['id', 'name', 'shortName', 'code', 'domain', 'city', 'state', 'establishedYear', 'totalStudents', 'logo']
    });

    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found'
      });
    }

    res.status(200).json({
      success: true,
      college
    });
  } catch (error) {
    console.error('❌ Get college error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch college'
    });
  }
};

// ===================================
// ADMIN CONTROLLERS
// ===================================

// @desc    Register a new college
// @route   POST /api/colleges/register
// @access  Private/Admin
const registerCollege = async (req, res) => {
  try {
    const { 
      name,
      shortName,
      domain,
      address,
      city,
      state,
      country,
      website,
      emailDomain,
      description,
      establishedYear,
      type
    } = req.body;

    // Validate required fields
    if (!name || !shortName || !domain) {
      return res.status(400).json({
        success: false,
        message: 'College name, short name, and domain are required'
      });
    }

    // Check if college already exists
    const collegeExists = await College.findOne({
      where: {
        [Op.or]: [
          { domain },
          { name },
          { shortName }
        ]
      }
    });
    
    if (collegeExists) {
      return res.status(400).json({
        success: false,
        message: 'College already registered with this name, short name, or domain'
      });
    }

    // Create college
    const college = await College.create({
      name,
      shortName,
      domain: domain.toLowerCase(),
      address: address || {},
      city,
      state,
      country: country || 'India',
      website,
      emailDomain: emailDomain ? [emailDomain] : [domain],
      description,
      establishedYear,
      type,
      isActive: true,
      totalStudents: 0
    });

    // Create college admin account in MasterUser
    const adminEmail = `admin@${domain}`;
    
    // In a real app, you would send a setup email with a link to set password
    // For now, we'll create a placeholder
    const admin = await MasterUser.create({
      username: `admin_${shortName.toLowerCase()}`,
      email: adminEmail,
      password: 'temporary_password_hash', // This should be handled differently
      role: 'admin',
      managedColleges: [college.id],
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'College registered successfully',
      college: {
        id: college.id,
        name: college.name,
        shortName: college.shortName,
        domain: college.domain,
        adminEmail,
        adminId: admin.id
      }
    });
  } catch (error) {
    console.error('❌ College registration error:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'College registration failed'
    });
  }
};

// @desc    Update college details
// @route   PUT /api/colleges/:id
// @access  Private/Admin
const updateCollege = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.domain; // Domain cannot be changed
    delete updates.totalStudents;
    delete updates.createdAt;
    delete updates.updatedAt;

    const college = await College.findByPk(id);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found'
      });
    }

    // Update college
    await college.update(updates);

    res.status(200).json({
      success: true,
      message: 'College updated successfully',
      college
    });
  } catch (error) {
    console.error('❌ Update college error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update college'
    });
  }
};

// @desc    Soft delete a college
// @route   DELETE /api/colleges/:id
// @access  Private/Admin
const deleteCollege = async (req, res) => {
  try {
    const { id } = req.params;

    const college = await College.findByPk(id);

    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found'
      });
    }

    // Soft delete
    await college.update({
      isActive: false,
      deletedAt: new Date()
    });

    // Deactivate all master users from this college
    await MasterUser.update(
      { isActive: false },
      { 
        where: {
          managedColleges: { [Op.contains]: [id] }
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'College deactivated successfully'
    });
  } catch (error) {
    console.error('❌ Delete college error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete college'
    });
  }
};

// @desc    Get college statistics
// @route   GET /api/colleges/:id/stats
// @access  Private/Admin
const getCollegeStats = async (req, res) => {
  try {
    const { id } = req.params;

    const college = await College.findByPk(id);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found'
      });
    }

    // Get stats from master database
    const totalAdmins = await MasterUser.count({
      where: {
        managedColleges: { [Op.contains]: [id] },
        role: 'admin',
        isActive: true
      }
    });

    // Get users associated with this college
    const totalUsers = await User.count({
      where: {
        collegeId: id,
        isDeleted: false
      }
    });

    // Get active users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = await User.count({
      where: {
        collegeId: id,
        lastLogin: { [Op.gte]: thirtyDaysAgo },
        isDeleted: false
      }
    });

    // Get counts from related models
    const { Post, Group, Event } = require('../models');
    
    const totalPosts = await Post.count({
      where: {
        collegeId: id,
        status: 'active'
      }
    });

    const totalGroups = await Group.count({
      where: {
        collegeId: id,
        isActive: true
      }
    });

    const totalEvents = await Event.count({
      where: {
        collegeId: id,
        isDeleted: false
      }
    });

    res.status(200).json({
      success: true,
      stats: {
        college: {
          id: college.id,
          name: college.name,
          shortName: college.shortName,
          domain: college.domain,
          establishedYear: college.establishedYear,
          totalStudents: college.totalStudents || 0,
          isActive: college.isActive,
          registeredAt: college.createdAt
        },
        users: {
          total: totalUsers,
          active: activeUsers,
          admins: totalAdmins
        },
        content: {
          posts: totalPosts,
          groups: totalGroups,
          events: totalEvents
        }
      }
    });
  } catch (error) {
    console.error('❌ Get college stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get college statistics'
    });
  }
};

module.exports = {
  getColleges,
  getCollegeByDomain,
  registerCollege,
  updateCollege,
  deleteCollege,
  getCollegeStats
};