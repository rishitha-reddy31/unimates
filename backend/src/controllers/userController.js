// src/controllers/userController.js
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Follow = require('../models/Follow');
const College = require('../models/College');
const { getRecommendations } = require('../utils/recommendationEngine');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // If userId is 'undefined' or 'me', return current user's profile
    if (userId === 'undefined' || userId === 'me') {
      // Fetch fresh user data from database
      const freshUser = await User.findByPk(req.user.id, {
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

      if (!freshUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Add full URL to profile picture
      const userWithUrls = {
        ...freshUser.toJSON(),
        profilePicture: freshUser.profilePicture ? 
          (freshUser.profilePicture.startsWith('http') 
            ? freshUser.profilePicture 
            : `${req.protocol}://${req.get('host')}/uploads/${freshUser.profilePicture}`) 
          : null
      };
      
      return res.json({
        success: true,
        user: userWithUrls
      });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }

    const user = await User.findByPk(userId, {
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

    // Check if current user is following this profile - WITHOUT collegeId
    let isFollowing = false;
    if (req.user && req.user.id !== user.id) {
      const follow = await Follow.findOne({
        where: {
          followerId: req.user.id,
          followingId: user.id
        },
        attributes: ['id'] // Only select id, not collegeId
      });
      isFollowing = !!follow;
    }

    res.json({
      success: true,
      user: userWithUrls,
      isFollowing
    });
  } catch (error) {
    console.error('❌ Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/update
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      fullName,
      username,
      bio,
      branch,
      year,
      skills,
      interests,
      hobbies,
      projects,
      achievements,
      phoneNumber,
      isPrivate,
      coverPicture
    } = req.body;

    console.log('📝 Updating profile for user:', userId);
    console.log('Received data:', JSON.stringify(req.body, null, 2));

    // Find the user
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if username is already taken (if username is being updated)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ 
        where: { 
          username,
          id: { [Op.ne]: userId } // Exclude current user
        } 
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
    }

    // Update fields - only update if value is provided
    const updateFields = {
      fullName: fullName !== undefined ? fullName : user.fullName,
      username: username !== undefined ? username : user.username,
      bio: bio !== undefined ? bio : user.bio,
      branch: branch !== undefined ? branch : user.branch,
      year: year !== undefined ? year : user.year,
      phoneNumber: phoneNumber !== undefined ? phoneNumber : user.phoneNumber,
      isPrivate: isPrivate !== undefined ? isPrivate : user.isPrivate,
      coverPicture: coverPicture !== undefined ? coverPicture : user.coverPicture,
      
      // Handle JSON fields - ensure they're properly formatted
      skills: skills !== undefined ? (Array.isArray(skills) ? skills : []) : user.skills,
      interests: interests !== undefined ? (Array.isArray(interests) ? interests : []) : user.interests,
      hobbies: hobbies !== undefined ? (Array.isArray(hobbies) ? hobbies : []) : user.hobbies,
      projects: projects !== undefined ? (Array.isArray(projects) ? projects : []) : user.projects,
      achievements: achievements !== undefined ? (Array.isArray(achievements) ? achievements : []) : user.achievements
    };

    // Log what we're updating
    console.log('Updating with fields:', Object.keys(updateFields).filter(key => 
      updateFields[key] !== undefined && 
      JSON.stringify(updateFields[key]) !== JSON.stringify(user[key])
    ));

    // Apply updates
    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] !== undefined) {
        user[key] = updateFields[key];
      }
    });

    // Save to database
    await user.save();
    console.log('✅ User saved to database');

    // Fetch the updated user to verify
    const savedUser = await User.findByPk(userId, {
      attributes: { 
        exclude: ['password', 'refreshToken', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpire'] 
      }
    });

    console.log('📊 Saved user data:', {
      id: savedUser.id,
      fullName: savedUser.fullName,
      skills: savedUser.skills,
      interests: savedUser.interests,
      projects: savedUser.projects?.length,
      achievements: savedUser.achievements?.length
    });

    // Fetch updated user with college info
    const updatedUser = await User.findByPk(userId, {
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

    // Add full URL to profile picture
    const userWithUrls = {
      ...updatedUser.toJSON(),
      profilePicture: updatedUser.profilePicture ? 
        (updatedUser.profilePicture.startsWith('http') 
          ? updatedUser.profilePicture 
          : `${req.protocol}://${req.get('host')}/uploads/${updatedUser.profilePicture}`) 
        : null
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userWithUrls
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// @desc    Update profile picture
// @route   PUT /api/users/profile-picture
// @access  Private
const updateProfilePicture = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image to upload'
      });
    }

    const userId = req.user.id;
    
    // Find the user
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get old profile picture to delete
    const oldProfilePicture = user.profilePicture;

    // Generate the file path - store the relative path from uploads folder
    const filePath = req.file.path.replace(/\\/g, '/');
    
    // Extract the part after 'uploads/'
    const uploadsIndex = filePath.indexOf('uploads/');
    let relativePath;
    
    if (uploadsIndex !== -1) {
      relativePath = filePath.substring(uploadsIndex + 8); // +8 to remove 'uploads/'
    } else {
      // Fallback: just use the filename
      relativePath = req.file.filename;
    }
    
    console.log('📸 File saved at:', filePath);
    console.log('📸 Relative path to store:', relativePath);
    
    // Store the relative path in database
    user.profilePicture = relativePath;
    
    // Save to database
    await user.save();
    console.log('✅ Profile picture saved to database:', relativePath);

    // Optional: Delete old profile picture file if it exists and is not the default
    if (oldProfilePicture && oldProfilePicture !== 'default-avatar.png' && !oldProfilePicture.includes('ui-avatars.com')) {
      try {
        // Construct the full path to the old file
        const oldFilePath = path.join(__dirname, '../../uploads', oldProfilePicture);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          console.log('🗑️ Old profile picture deleted:', oldFilePath);
        }
      } catch (deleteError) {
        console.log('⚠️ Could not delete old profile picture:', deleteError.message);
        // Don't fail the request if old file deletion fails
      }
    }

    // Generate full URL for response
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const profilePictureUrl = `${baseUrl}/uploads/${relativePath}`;

    // Fetch updated user
    const updatedUser = await User.findByPk(userId, {
      attributes: { 
        exclude: ['password', 'refreshToken', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpire'] 
      }
    });

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      profilePicture: profilePictureUrl,
      user: updatedUser
    });

  } catch (error) {
    console.error('❌ Update profile picture error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile picture',
      error: error.message
    });
  }
};

// @desc    Add achievement
// @route   POST /api/users/achievements
// @access  Private
const addAchievement = async (req, res) => {
  try {
    const userId = req.user.id;
    const newAchievement = req.body;

    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const achievements = user.achievements || [];
    const achievementWithId = {
      ...newAchievement,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    achievements.push(achievementWithId);
    user.achievements = achievements;
    await user.save();

    res.json({
      success: true,
      message: 'Achievement added successfully',
      achievements: user.achievements
    });
  } catch (error) {
    console.error('❌ Add achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add achievement',
      error: error.message
    });
  }
};

// @desc    Delete achievement
// @route   DELETE /api/users/achievements/:achievementId
// @access  Private
const deleteAchievement = async (req, res) => {
  try {
    const userId = req.user.id;
    const { achievementId } = req.params;

    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const achievements = user.achievements || [];
    user.achievements = achievements.filter(a => a.id !== achievementId);
    await user.save();

    res.json({
      success: true,
      message: 'Achievement deleted successfully',
      achievements: user.achievements
    });
  } catch (error) {
    console.error('❌ Delete achievement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete achievement',
      error: error.message
    });
  }
};

// @desc    Follow user
// @route   POST /api/users/:id/follow
// @access  Private
const followUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.id;

    console.log('📝 Follow request:', { followerId, followingId });

    if (followerId === followingId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    // Check if user exists
    const userToFollow = await User.findByPk(followingId);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already following - WITHOUT collegeId
    const existingFollow = await Follow.findOne({
      where: {
        followerId: followerId,
        followingId: followingId
      },
      attributes: ['id'] // Only select id, not collegeId
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'Already following this user'
      });
    }

    // Create follow relationship - WITHOUT collegeId
    await Follow.create({
      followerId: followerId,
      followingId: followingId
      // Remove collegeId from here
    });

    // Update counts
    await User.increment('followingCount', { by: 1, where: { id: followerId } });
    await User.increment('followersCount', { by: 1, where: { id: followingId } });

    res.json({
      success: true,
      message: 'User followed successfully',
      isFollowing: true
    });

  } catch (error) {
    console.error('❌ Follow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to follow user',
      error: error.message
    });
  }
};

// @desc    Unfollow user
// @route   POST /api/users/:id/unfollow
// @access  Private
const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.id;

    console.log('📝 Unfollow request:', { followerId, followingId });

    // Check if user exists
    const userToUnfollow = await User.findByPk(followingId);
    if (!userToUnfollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete follow relationship - WITHOUT collegeId
    const deleted = await Follow.destroy({
      where: {
        followerId: followerId,
        followingId: followingId
      }
    });

    if (deleted === 0) {
      return res.status(400).json({
        success: false,
        message: 'You are not following this user'
      });
    }

    // Update counts
    await User.increment('followingCount', { by: -1, where: { id: followerId } });
    await User.increment('followersCount', { by: -1, where: { id: followingId } });

    res.json({
      success: true,
      message: 'User unfollowed successfully',
      isFollowing: false
    });

  } catch (error) {
    console.error('❌ Unfollow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unfollow user',
      error: error.message
    });
  }
};

// @desc    Get followers list
// @route   GET /api/users/:id/followers
// @access  Private
const getFollowers = async (req, res) => {
  try {
    const userId = req.params.id;

    const followers = await Follow.findAll({
      where: { followingId: userId },
      include: [{
        model: User,
        as: 'follower',
        attributes: ['id', 'fullName', 'username', 'profilePicture', 'branch', 'year', 'bio', 'followersCount']
      }],
      attributes: ['createdAt'] // Only include createdAt, not collegeId
    });

    const followersList = followers.map(f => ({
      ...f.follower.toJSON(),
      followedAt: f.createdAt
    }));

    // Add full URLs to profile pictures
    const followersWithUrls = followersList.map(user => ({
      ...user,
      profilePicture: user.profilePicture ? 
        (user.profilePicture.startsWith('http') 
          ? user.profilePicture 
          : `${req.protocol}://${req.get('host')}/uploads/${user.profilePicture}`) 
        : null
    }));

    res.json({
      success: true,
      followers: followersWithUrls,
      count: followersWithUrls.length
    });
  } catch (error) {
    console.error('❌ Get followers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get followers',
      error: error.message
    });
  }
};

// @desc    Get following list
// @route   GET /api/users/:id/following
// @access  Private
const getFollowing = async (req, res) => {
  try {
    const userId = req.params.id;

    const following = await Follow.findAll({
      where: { followerId: userId },
      include: [{
        model: User,
        as: 'following',
        attributes: ['id', 'fullName', 'username', 'profilePicture', 'branch', 'year', 'bio', 'followersCount']
      }],
      attributes: ['createdAt'] // Only include createdAt, not collegeId
    });

    const followingList = following.map(f => ({
      ...f.following.toJSON(),
      followedAt: f.createdAt
    }));

    // Add full URLs to profile pictures
    const followingWithUrls = followingList.map(user => ({
      ...user,
      profilePicture: user.profilePicture ? 
        (user.profilePicture.startsWith('http') 
          ? user.profilePicture 
          : `${req.protocol}://${req.get('host')}/uploads/${user.profilePicture}`) 
        : null
    }));

    res.json({
      success: true,
      following: followingWithUrls,
      count: followingWithUrls.length
    });
  } catch (error) {
    console.error('❌ Get following error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get following',
      error: error.message
    });
  }
};

// @desc    Check if following
// @route   GET /api/users/:id/is-following
// @access  Private
const checkFollowing = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.id;

    const follow = await Follow.findOne({
      where: {
        followerId: currentUserId,
        followingId: targetUserId
      },
      attributes: ['id'] // Only select id
    });

    res.json({
      success: true,
      isFollowing: !!follow
    });
  } catch (error) {
    console.error('❌ Check following error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check follow status',
      error: error.message
    });
  }
};

// @desc    Get mutual followers
// @route   GET /api/users/:id/mutual
// @access  Private
const getMutualFollowers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.id;

    // Get users that current user is following
    const currentUserFollowing = await Follow.findAll({
      where: { followerId: currentUserId },
      attributes: ['followingId']
    });

    // Get users that follow the target user
    const targetUserFollowers = await Follow.findAll({
      where: { followingId: targetUserId },
      attributes: ['followerId']
    });

    // Find mutual IDs
    const currentFollowingIds = currentUserFollowing.map(f => f.followingId);
    const targetFollowerIds = targetUserFollowers.map(f => f.followerId);
    
    const mutualIds = currentFollowingIds.filter(id => targetFollowerIds.includes(id));

    // Get mutual followers details
    const mutualFollowers = await User.findAll({
      where: { id: mutualIds },
      attributes: ['id', 'fullName', 'username', 'profilePicture', 'branch', 'year', 'bio']
    });

    // Add full URLs to profile pictures
    const mutualWithUrls = mutualFollowers.map(user => ({
      ...user.toJSON(),
      profilePicture: user.profilePicture ? 
        (user.profilePicture.startsWith('http') 
          ? user.profilePicture 
          : `${req.protocol}://${req.get('host')}/uploads/${user.profilePicture}`) 
        : null
    }));

    res.json({
      success: true,
      mutual: mutualWithUrls,
      count: mutualWithUrls.length
    });
  } catch (error) {
    console.error('❌ Get mutual followers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get mutual followers',
      error: error.message
    });
  }
};

// @desc    Block user
// @route   POST /api/users/:id/block
// @access  Private
const blockUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const userToBlockId = req.params.id;

    const userToBlock = await User.findByPk(userToBlockId);
    if (!userToBlock) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (userToBlock.role === 'admin' || userToBlock.role === 'superadmin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot block admin'
      });
    }

    // Add to blocked users
    const user = await User.findByPk(userId);
    const blockedUsers = user.blockedUsers || [];
    if (!blockedUsers.includes(userToBlockId)) {
      blockedUsers.push(userToBlockId);
      user.blockedUsers = blockedUsers;
      await user.save();
    }

    // Remove any follow relationships
    await Follow.destroy({
      where: {
        [Op.or]: [
          { followerId: userId, followingId: userToBlockId },
          { followerId: userToBlockId, followingId: userId }
        ]
      }
    });

    res.json({
      success: true,
      message: 'User blocked successfully'
    });

  } catch (error) {
    console.error('❌ Block user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to block user'
    });
  }
};

// @desc    Unblock user
// @route   POST /api/users/:id/unblock
// @access  Private
const unblockUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const userToUnblockId = req.params.id;

    const user = await User.findByPk(userId);
    const blockedUsers = user.blockedUsers || [];
    user.blockedUsers = blockedUsers.filter(id => id !== userToUnblockId);
    await user.save();

    res.json({
      success: true,
      message: 'User unblocked successfully'
    });

  } catch (error) {
    console.error('❌ Unblock user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unblock user'
    });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const { query, branch, year } = req.query;
    const whereClause = { 
      isDeleted: false,
      status: 'active'
    };

    if (query) {
      whereClause[Op.or] = [
        { fullName: { [Op.iLike]: `%${query}%` } },
        { username: { [Op.iLike]: `%${query}%` } },
        { email: { [Op.iLike]: `%${query}%` } },
        { branch: { [Op.iLike]: `%${query}%` } }
      ];
    }

    if (branch) {
      whereClause.branch = branch;
    }

    if (year) {
      whereClause.year = year;
    }

    // Don't show current user in search results
    whereClause.id = { [Op.ne]: req.user.id };

    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'fullName', 'username', 'profilePicture', 'branch', 'year', 'bio', 'followersCount'],
      limit: 20,
      order: [['followersCount', 'DESC'], ['createdAt', 'DESC']]
    });

    // Add full URLs to profile pictures
    const usersWithUrls = users.map(user => ({
      ...user.toJSON(),
      profilePicture: user.profilePicture ? 
        (user.profilePicture.startsWith('http') 
          ? user.profilePicture 
          : `${req.protocol}://${req.get('host')}/uploads/${user.profilePicture}`) 
        : null
    }));

    res.json({
      success: true,
      users: usersWithUrls
    });

  } catch (error) {
    console.error('❌ Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users'
    });
  }
};

// @desc    Get recommended users
// @route   GET /api/users/recommendations
// @access  Private
const getRecommendedUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get users that the current user is following
    const following = await Follow.findAll({
      where: { followerId: userId },
      attributes: ['followingId']
    });
    
    const followingIds = following.map(f => f.followingId);
    followingIds.push(userId); // Exclude self

    // Get users with similar interests/skills/branch
    const currentUser = await User.findByPk(userId);
    
    let recommendations = [];
    
    if (currentUser) {
      // Find users in same college with similar branch or interests
      const whereClause = {
        collegeId: currentUser.collegeId,
        id: { [Op.notIn]: followingIds },
        isDeleted: false,
        status: 'active'
      };
      
      // If user has branch, prioritize same branch
      if (currentUser.branch) {
        recommendations = await User.findAll({
          where: {
            ...whereClause,
            branch: currentUser.branch
          },
          attributes: ['id', 'fullName', 'username', 'profilePicture', 'branch', 'year', 'bio', 'interests', 'skills', 'followersCount'],
          limit: 10,
          order: [
            ['followersCount', 'DESC'],
            ['createdAt', 'DESC']
          ]
        });
      }
      
      // If not enough recommendations, get other users from same college
      if (recommendations.length < 5) {
        const additionalUsers = await User.findAll({
          where: whereClause,
          attributes: ['id', 'fullName', 'username', 'profilePicture', 'branch', 'year', 'bio', 'interests', 'skills', 'followersCount'],
          limit: 10,
          order: [
            ['followersCount', 'DESC'],
            ['createdAt', 'DESC']
          ]
        });
        
        // Merge and remove duplicates
        const existingIds = recommendations.map(r => r.id);
        const newUsers = additionalUsers.filter(u => !existingIds.includes(u.id));
        recommendations = [...recommendations, ...newUsers].slice(0, 10);
      }
    }

    // Add full URLs to profile pictures
    const recommendationsWithUrls = recommendations.map(user => ({
      ...user.toJSON(),
      profilePicture: user.profilePicture ? 
        (user.profilePicture.startsWith('http') 
          ? user.profilePicture 
          : `${req.protocol}://${req.get('host')}/uploads/${user.profilePicture}`) 
        : null
    }));

    res.json({
      success: true,
      users: recommendationsWithUrls
    });
  } catch (error) {
    console.error('❌ Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
};

// @desc    Get college-specific student suggestions
// @route   GET /api/users/college-suggestions
// @access  Private
const getCollegeSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const collegeId = req.user.collegeId;

    console.log('🔍 Getting college suggestions for user:', userId);
    console.log('🏫 College ID:', collegeId);

    if (!collegeId) {
      console.log('❌ No college ID found for user');
      return res.status(400).json({
        success: false,
        message: 'User does not have a college assigned'
      });
    }

    // Get users that the current user is following
    const following = await Follow.findAll({
      where: { followerId: userId },
      attributes: ['followingId']
    });
    
    const followingIds = following.map(f => f.followingId);
    console.log(`👥 Following ${followingIds.length} users`);

    // Get all users from same college EXCLUDING the current user
    const suggestions = await User.findAll({
      where: {
        collegeId: collegeId,
        id: { [Op.ne]: userId },
        isDeleted: false,
        status: 'active'
      },
      attributes: ['id', 'fullName', 'username', 'profilePicture', 'branch', 'year', 'bio', 'interests', 'skills', 'followersCount', 'followingCount', 'email'],
      limit: 50,
      order: [
        ['followersCount', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });

    console.log(`📋 Found ${suggestions.length} suggestions`);

    // For each suggestion, check if they follow the current user back (mutual)
    // But WITHOUT including collegeId in the query
    const suggestionsWithMutual = await Promise.all(
      suggestions.map(async (user) => {
        const userJson = user.toJSON();
        
        // Check if current user is following this user
        userJson.isFollowing = followingIds.includes(user.id);
        
        // Check if this user follows the current user (mutual)
        // Remove 'collegeId' from the query attributes
        const mutualCheck = await Follow.findOne({
          where: {
            followerId: user.id,
            followingId: userId
          },
          attributes: ['id'] // Only select id, not collegeId
        });
        
        userJson.isFollowedBy = !!mutualCheck;
        userJson.mutualFollowers = userJson.isFollowing && userJson.isFollowedBy ? 1 : 0;
        
        return userJson;
      })
    );

    // Add full URLs to profile pictures
    const suggestionsWithUrls = suggestionsWithMutual.map(user => ({
      ...user,
      profilePicture: user.profilePicture ? 
        (user.profilePicture.startsWith('http') 
          ? user.profilePicture 
          : `${req.protocol}://${req.get('host')}/uploads/${user.profilePicture}`) 
        : null
    }));

    console.log(`✅ Returning ${suggestionsWithUrls.length} suggestions`);

    res.json({
      success: true,
      suggestions: suggestionsWithUrls
    });
  } catch (error) {
    console.error('❌ Get college suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions',
      error: error.message
    });
  }
};

// @desc    Add project
// @route   POST /api/users/projects
// @access  Private
const addProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, link, technologies } = req.body;

    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const projects = user.projects || [];
    const newProject = {
      id: Date.now().toString(),
      title,
      description,
      link,
      technologies: technologies || [],
      createdAt: new Date().toISOString()
    };
    
    projects.push(newProject);
    user.projects = projects;
    await user.save();

    res.json({
      success: true,
      message: 'Project added successfully',
      projects: user.projects
    });
  } catch (error) {
    console.error('❌ Add project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add project',
      error: error.message
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/users/projects/:projectId
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId } = req.params;

    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const projects = user.projects || [];
    user.projects = projects.filter(p => p.id !== projectId);
    await user.save();

    res.json({
      success: true,
      message: 'Project deleted successfully',
      projects: user.projects
    });
  } catch (error) {
    console.error('❌ Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: error.message
    });
  }
};

// @desc    Add skill
// @route   POST /api/users/skills
// @access  Private
const addSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skill } = req.body;

    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const skills = user.skills || [];
    if (!skills.includes(skill)) {
      skills.push(skill);
      user.skills = skills;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Skill added successfully',
      skills: user.skills
    });
  } catch (error) {
    console.error('❌ Add skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add skill',
      error: error.message
    });
  }
};

// @desc    Remove skill
// @route   DELETE /api/users/skills
// @access  Private
const removeSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skill } = req.body;

    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const skills = user.skills || [];
    user.skills = skills.filter(s => s !== skill);
    await user.save();

    res.json({
      success: true,
      message: 'Skill removed successfully',
      skills: user.skills
    });
  } catch (error) {
    console.error('❌ Remove skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove skill',
      error: error.message
    });
  }
};

// @desc    Add interest
// @route   POST /api/users/interests
// @access  Private
const addInterest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { interest } = req.body;

    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const interests = user.interests || [];
    if (!interests.includes(interest)) {
      interests.push(interest);
      user.interests = interests;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Interest added successfully',
      interests: user.interests
    });
  } catch (error) {
    console.error('❌ Add interest error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add interest',
      error: error.message
    });
  }
};

// @desc    Remove interest
// @route   DELETE /api/users/interests
// @access  Private
const removeInterest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { interest } = req.body;

    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const interests = user.interests || [];
    user.interests = interests.filter(i => i !== interest);
    await user.save();

    res.json({
      success: true,
      message: 'Interest removed successfully',
      interests: user.interests
    });
  } catch (error) {
    console.error('❌ Remove interest error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove interest',
      error: error.message
    });
  }
};

// @desc    Add hobby
// @route   POST /api/users/hobbies
// @access  Private
const addHobby = async (req, res) => {
  try {
    const userId = req.user.id;
    const { hobby } = req.body;

    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const hobbies = user.hobbies || [];
    if (!hobbies.includes(hobby)) {
      hobbies.push(hobby);
      user.hobbies = hobbies;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Hobby added successfully',
      hobbies: user.hobbies
    });
  } catch (error) {
    console.error('❌ Add hobby error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add hobby',
      error: error.message
    });
  }
};

// @desc    Remove hobby
// @route   DELETE /api/users/hobbies
// @access  Private
const removeHobby = async (req, res) => {
  try {
    const userId = req.user.id;
    const { hobby } = req.body;

    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const hobbies = user.hobbies || [];
    user.hobbies = hobbies.filter(h => h !== hobby);
    await user.save();

    res.json({
      success: true,
      message: 'Hobby removed successfully',
      hobbies: user.hobbies
    });
  } catch (error) {
    console.error('❌ Remove hobby error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove hobby',
      error: error.message
    });
  }
};

// Add this to your Follow model associations if not already there
// In your models/index.js or wherever you define associations:
// Follow.belongsTo(User, { as: 'follower', foreignKey: 'followerId' });
// Follow.belongsTo(User, { as: 'following', foreignKey: 'followingId' });

module.exports = {
  getUserProfile,
  updateProfile,
  updateProfilePicture,
  addProject,
  deleteProject,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowing,
  getMutualFollowers,
  blockUser,
  unblockUser,
  searchUsers,
  getRecommendedUsers,
  addAchievement,
  deleteAchievement,
  getCollegeSuggestions,
  addSkill,
  removeSkill,
  addInterest,
  removeInterest,
  addHobby,
  removeHobby
};