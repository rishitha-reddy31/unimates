const { User, MasterUser, College, Follow, FollowRequest, sequelize } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

// Generate JWT Token
const generateToken = (id, role = 'user') => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Generate Refresh Token
const generateRefreshToken = (id) => {
  return jwt.sign(
    { id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      college, // This is college ID now
      year,
      branch,
      fullName,
      phoneNumber,
      interests,
      skills,
      bio
    } = req.body;

    console.log('Registration attempt:', { email, college });

    // Check if user already exists
    const userExists = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Validate college if provided
    let collegeData = null;
    if (college) {
      collegeData = await College.findByPk(college);
      if (!collegeData) {
        return res.status(400).json({
          success: false,
          message: 'Invalid college ID'
        });
      }
      
      // Verify email domain matches college domain
      const emailDomain = email.split('@')[1];
      if (emailDomain !== collegeData.domain) {
        return res.status(400).json({
          success: false,
          message: `Email must be from ${collegeData.domain} domain`
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Log the hash for debugging
    console.log('Password hash created:', hashedPassword.substring(0, 20) + '...');

    // Create verification token (optional now)
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user - SET ISVERIFIED TO TRUE FOR DEVELOPMENT
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      collegeId: college,
      year,
      branch,
      fullName,
      phoneNumber,
      verificationToken,
      isVerified: true, // 🔴 CHANGE THIS TO true FOR DEVELOPMENT
      bio: bio || '',
      interests: interests || [],
      skills: skills || [],
      followersCount: 0,
      followingCount: 0,
      pendingRequestsCount: 0
    });

    // Skip email verification for development
    console.log(`✅ User created (auto-verified): ${email}`);

    // Generate tokens
    const token = generateToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    // Format user data for response
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId,
      college: collegeData ? {
        id: collegeData.id,
        name: collegeData.name,
        domain: collegeData.domain
      } : null,
      isVerified: user.isVerified,
      fullName: user.fullName,
      branch: user.branch,
      year: user.year,
      bio: user.bio,
      profilePicture: user.profilePicture,
      followersCount: 0,
      followingCount: 0
    };

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      refreshToken,
      user: userData
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body; // Remove rememberMe if not needed

    console.log('🔍 Login attempt for:', email);

    // Check if user exists
    const user = await User.findOne({
      where: { email },
      attributes: { include: ['password'], exclude: ['refreshToken', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpire']  }
    });

    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log('✅ User found:', user.email);
    console.log('Stored hash:', user.password.substring(0, 20) + '...');

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    console.log('Password valid?', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Get college data if needed
    let collegeData = null;
    if (user.collegeId) {
      collegeData = await College.findByPk(user.collegeId, {
        attributes: ['id', 'name', 'shortName', 'domain', 'logo']
      });
    }

    // Generate tokens
    const token = generateToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    // Format user data
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId,
      college: collegeData,
      profilePicture: user.profilePicture,
      isVerified: user.isVerified,
      fullName: user.fullName,
      branch: user.branch,
      year: user.year,
      bio: user.bio,
      followersCount: user.followersCount || 0,
      followingCount: user.followingCount || 0,
      pendingRequestsCount: user.pendingRequestsCount || 0
    };

    console.log('✅ Login successful for:', email);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      refreshToken,
      user: userData
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// @desc    Login master user (admin)
// @route   POST /api/auth/master-login
// @access  Public
const loginMasterUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if master user exists
    const masterUser = await MasterUser.findOne({
      where: { email },
      attributes: { include: ['password'] }
    });

    if (!masterUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!masterUser.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact super admin.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, masterUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    masterUser.lastLogin = new Date();
    await masterUser.save();

    // Generate token
    const token = generateToken(masterUser.id, masterUser.role);

    res.status(200).json({
      success: true,
      message: 'Master login successful',
      data: {
        id: masterUser.id,
        username: masterUser.username,
        email: masterUser.email,
        role: masterUser.role,
        permissions: masterUser.permissions,
        token
      }
    });
  } catch (error) {
    console.error('Master login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Clear refresh token from database
    if (refreshToken) {
      await User.update(
        { refreshToken: null },
        { where: { refreshToken } }
      );
    }

    // Clear cookie
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging out',
      error: error.message
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Check if user exists with this refresh token
    const user = await User.findOne({
      where: {
        id: decoded.id,
        refreshToken
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const newAccessToken = generateToken(user.id, user.role);

    res.status(200).json({
      success: true,
      data: {
        token: newAccessToken
      }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired'
      });
    }

    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Error refreshing token',
      error: error.message
    });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      where: { verificationToken: token }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now login.'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying email',
      error: error.message
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send reset email
    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing request',
      error: error.message
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { resetToken } = req.params;
    const { password } = req.body;

    // Hash the token from params to compare with stored hash
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const user = await User.findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpire: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: { include: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
const resendVerificationEmail = async (req, res) => {
  try {
    const user = req.user;
    
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token if needed
    if (!user.verificationToken) {
      user.verificationToken = crypto.randomBytes(32).toString('hex');
      await user.save();
    }

    // Send verification email
    await sendVerificationEmail(user.email, user.verificationToken);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending verification email'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // Fetch fresh user data from database
    const user = await User.findByPk(req.user.id, {
      attributes: { 
        exclude: ['password', 'refreshToken', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpire'] 
      },
      include: [
        {
          model: College,
          attributes: ['id', 'name', 'shortName', 'domain']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add full URL to profile picture
    const userWithUrls = {
      ...user.toJSON(),
      profilePicture: user.profilePicture ? 
        (user.profilePicture.startsWith('http') 
          ? user.profilePicture 
          : `${req.protocol}://${req.get('host')}/uploads/${user.profilePicture}`) 
        : null
    };

    res.json({
      success: true,
      user: userWithUrls
    });
  } catch (error) {
    console.error('❌ Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data'
    });
  }
};

// ============================================
// 🆕 INSTAGRAM-STYLE SUGGESTIONS & FOLLOW SYSTEM
// ============================================

// @desc    Get all students from same college
// @route   GET /api/auth/college-students
// @access  Private
const getCollegeStudents = async (req, res) => {
  try {
    const userId = req.user.id;
    const collegeId = req.user.collegeId;

    console.log('🔍 Getting college students for college:', collegeId);

    if (!collegeId) {
      return res.status(400).json({
        success: false,
        message: 'User does not have a college assigned'
      });
    }

    // Get ALL users from the same college (including current user)
    const students = await User.findAll({
      where: {
        collegeId: collegeId,
        isDeleted: false,
        status: 'active'
      },
      attributes: ['id', 'fullName', 'username', 'profilePicture', 'branch', 'year', 'bio', 'followersCount', 'followingCount'],
      order: [['fullName', 'ASC']]
    });

    console.log(`📊 Found ${students.length} total students in college`);

    // Get college info
    const college = await College.findByPk(collegeId, {
      attributes: ['id', 'name', 'domain', 'shortName']
    });

    // Get following count for current user
    const following = await Follow.count({
      where: { followerId: userId }
    });

    // Get followers count for current user
    const followers = await Follow.count({
      where: { followingId: userId }
    });

    console.log(`📊 Current user following: ${following}, followers: ${followers}`);

    // Add full URLs to profile pictures
    const studentsWithUrls = students.map(user => ({
      ...user.toJSON(),
      profilePicture: user.profilePicture ? 
        (user.profilePicture.startsWith('http') 
          ? user.profilePicture 
          : `${req.protocol}://${req.get('host')}/uploads/${user.profilePicture}`) 
        : null
    }));

    res.json({
      success: true,
      users: studentsWithUrls,
      college: college || { 
        name: 'Your College', 
        domain: req.user.email?.split('@')[1] || 'mrcet.ac.in' 
      },
      stats: {
        totalStudents: students.length,
        following,
        followers,
        pendingSent: 0,
        pendingReceived: 0
      }
    });

  } catch (error) {
    console.error('❌ Get college students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get college students',
      error: error.message
    });
  }
};

// @desc    Send follow request
// @route   POST /api/auth/follow-request/:userId
// @access  Private
const sendFollowRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    // Check if user exists
    const userToFollow = await User.findByPk(userId);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      where: {
        followerId: currentUserId,
        followingId: userId,
        status: 'accepted'
      }
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'Already following this user'
      });
    }

    // Check if follow request already exists
    const existingRequest = await FollowRequest.findOne({
      where: {
        requesterId: currentUserId,
        recipientId: userId
      }
    });

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Follow request already sent'
        });
      } else if (existingRequest.status === 'rejected') {
        // Update rejected request to pending
        existingRequest.status = 'pending';
        existingRequest.updatedAt = new Date();
        await existingRequest.save();
        
        return res.json({
          success: true,
          message: 'Follow request sent',
          requestId: existingRequest.id,
          status: 'pending',
          followStatus: 'pending_sent'
        });
      }
    }

    // Create new follow request
    const followRequest = await FollowRequest.create({
      requesterId: currentUserId,
      recipientId: userId,
      status: 'pending'
    });

    // Increment pending requests count for recipient
    await User.update(
      { pendingRequestsCount: sequelize.literal('pendingRequestsCount + 1') },
      { where: { id: userId } }
    );

    res.status(201).json({
      success: true,
      message: 'Follow request sent',
      requestId: followRequest.id,
      status: 'pending',
      followStatus: 'pending_sent'
    });

  } catch (error) {
    console.error('❌ Send follow request error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send follow request'
    });
  }
};

// @desc    Accept follow request
// @route   POST /api/auth/accept-request/:requestId
// @access  Private
const acceptFollowRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const currentUserId = req.user.id;

    // Find the follow request
    const followRequest = await FollowRequest.findByPk(requestId);
    
    if (!followRequest) {
      return res.status(404).json({
        success: false,
        message: 'Follow request not found'
      });
    }

    // Verify that current user is the recipient
    if (followRequest.recipientId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this request'
      });
    }

    // Update request status
    followRequest.status = 'accepted';
    followRequest.respondedAt = new Date();
    await followRequest.save();

    // Create follow relationship
    await Follow.create({
      followerId: followRequest.requesterId,
      followingId: followRequest.recipientId,
      status: 'accepted'
    });

    // Update counts
    await User.update(
      { followingCount: sequelize.literal('followingCount + 1') },
      { where: { id: followRequest.requesterId } }
    );

    await User.update(
      { 
        followersCount: sequelize.literal('followersCount + 1'),
        pendingRequestsCount: sequelize.literal('pendingRequestsCount - 1')
      },
      { where: { id: followRequest.recipientId } }
    );

    res.json({
      success: true,
      message: 'Follow request accepted',
      followerId: followRequest.requesterId
    });

  } catch (error) {
    console.error('❌ Accept follow request error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to accept follow request'
    });
  }
};

// @desc    Reject follow request
// @route   POST /api/auth/reject-request/:requestId
// @access  Private
const rejectFollowRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const currentUserId = req.user.id;

    // Find the follow request
    const followRequest = await FollowRequest.findByPk(requestId);
    
    if (!followRequest) {
      return res.status(404).json({
        success: false,
        message: 'Follow request not found'
      });
    }

    // Verify that current user is the recipient
    if (followRequest.recipientId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reject this request'
      });
    }

    // Update request status
    followRequest.status = 'rejected';
    followRequest.respondedAt = new Date();
    await followRequest.save();

    // Decrement pending requests count
    await User.update(
      { pendingRequestsCount: sequelize.literal('pendingRequestsCount - 1') },
      { where: { id: currentUserId } }
    );

    res.json({
      success: true,
      message: 'Follow request rejected'
    });

  } catch (error) {
    console.error('❌ Reject follow request error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reject follow request'
    });
  }
};

// @desc    Get pending follow requests
// @route   GET /api/auth/pending-requests
// @access  Private
const getPendingRequests = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Find pending requests where current user is the recipient
    const pendingRequests = await FollowRequest.findAll({
      where: {
        recipientId: currentUserId,
        status: 'pending'
      },
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'username', 'fullName', 'profilePicture', 'branch', 'year', 'skills', 'interests']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: pendingRequests.length,
      requests: pendingRequests
    });

  } catch (error) {
    console.error('❌ Get pending requests error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get pending requests'
    });
  }
};

// @desc    Unfollow user
// @route   POST /api/auth/unfollow/:userId
// @access  Private
const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Check if following
    const existingFollow = await Follow.findOne({
      where: {
        followerId: currentUserId,
        followingId: userId,
        status: 'accepted'
      }
    });

    if (!existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'Not following this user'
      });
    }

    // Delete follow relationship
    await existingFollow.destroy();

    // Update counts
    await User.update(
      { followingCount: sequelize.literal('followingCount - 1') },
      { where: { id: currentUserId } }
    );

    await User.update(
      { followersCount: sequelize.literal('followersCount - 1') },
      { where: { id: userId } }
    );

    res.json({
      success: true,
      message: 'Unfollowed successfully',
      followStatus: 'none'
    });

  } catch (error) {
    console.error('❌ Unfollow user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to unfollow user'
    });
  }
};

// Helper function to send verification email
const sendVerificationEmail = async (email, token) => {
  // Configure your email transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

  await transporter.sendMail({
    from: `"Unimates" <${process.env.EMAIL_FROM || 'noreply@unimates.com'}>`,
    to: email,
    subject: 'Verify Your Email',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Unimates!</h1>
          </div>
          <div class="content">
            <h2>Verify Your Email Address</h2>
            <p>Thank you for registering with Unimates! Please click the button below to verify your email address:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 3px;">${verificationUrl}</p>
            <p><strong>Note:</strong> This link will expire in 24 hours.</p>
            <p>If you didn't create an account with Unimates, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Unimates. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  });
};

// Helper function to send password reset email
const sendPasswordResetEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

  await transporter.sendMail({
    from: `"Unimates" <${process.env.EMAIL_FROM || 'noreply@unimates.com'}>`,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Reset Your Password</h2>
            <p>You requested to reset your password. Click the button below to proceed:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 3px;">${resetUrl}</p>
            <div class="warning">
              <strong>⚠️ Important:</strong> This link will expire in 10 minutes. If you didn't request this, please ignore this email.
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Unimates. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  });
};

module.exports = {
  registerUser,
  loginUser,
  loginMasterUser,
  logoutUser,
  refreshAccessToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  resendVerificationEmail,
  getMe,
  sendVerificationEmail,
  sendPasswordResetEmail,
  // New Instagram-style functions
  getCollegeStudents,
  sendFollowRequest,
  acceptFollowRequest,
  rejectFollowRequest,
  getPendingRequests,
  unfollowUser
};

console.log('✅ authController loaded with exports:', Object.keys(module.exports));