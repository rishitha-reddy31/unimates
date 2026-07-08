// backend/src/controllers/postController.js
const { Post, User, College, sequelize } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

console.log('📝 Post controller loaded');

// @desc    Create a post
// @route   POST /api/posts/create
// @access  Private
const createPost = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { content, visibility, tags, mentions, isAnonymous } = req.body;
    const files = req.files || [];

    console.log('📝 Creating post for user:', req.user.id);
    console.log('Files received:', files.length);

    // Validate content
    if (!content && files.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please provide content or media'
      });
    }

    // Process media files
    const media = files.map(file => {
      const filePath = file.path.replace(/\\/g, '/');
      
      // Extract just the filename
      const filename = file.filename;
      
      // Determine the subfolder based on file type
      const subfolder = file.mimetype.startsWith('image/') ? 'images' : 'videos';
      
      // Create URL path - THIS IS THE KEY FIX
      // Store as /uploads/posts/images/filename.jpg
      const urlPath = `/uploads/posts/${subfolder}/${filename}`;

      console.log('📸 Media file saved:', {
        original: file.path,
        filename,
        urlPath
      });

      return {
        type: file.mimetype.startsWith('image/') ? 'image' : 'video',
        url: urlPath, // Store relative path with leading slash
        mimeType: file.mimetype,
        size: file.size,
        filename: filename
      };
    });

    // Determine media type
    let mediaType = 'text';
    if (media.length > 0) {
      const hasImage = media.some(m => m.type === 'image');
      const hasVideo = media.some(m => m.type === 'video');
      
      if (hasImage && hasVideo) mediaType = 'mixed';
      else if (hasImage) mediaType = 'image';
      else if (hasVideo) mediaType = 'video';
    }

    // Create post
    const post = await Post.create({
      content: content || '',
      authorId: req.user.id,
      collegeId: req.user.collegeId,
      media,
      mediaType,
      visibility: visibility || 'college',
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
      mentions: mentions || [],
      isAnonymous: isAnonymous || false,
      likes: [],
      likesCount: 0,
      comments: [],
      commentsCount: 0,
      shares: 0,
      status: 'active'
    }, { transaction });

    await transaction.commit();

    // Fetch created post with author info
    const createdPost = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'fullName', 'username', 'profilePicture']
        }
      ]
    });

    // Process post data for response
    const postData = createdPost.toJSON();
    
    // Add full URLs for media in response
    if (postData.media && postData.media.length > 0) {
      postData.media = postData.media.map(m => ({
        ...m,
        url: `http://localhost:5000${m.url}` // Add base URL for response
      }));
    }

    // If anonymous, hide author info
    if (isAnonymous) {
      postData.author = {
        username: 'Anonymous',
        fullName: 'Anonymous',
        profilePicture: null
      };
    }

    res.status(201).json({
      success: true,
      post: postData
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message
    });
  }
};

// @desc    Get feed posts
// @route   GET /api/posts/feed
// @access  Private
const getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    console.log('🔍 Fetching feed for user:', req.user.id);

    const posts = await Post.findAll({
      where: {
        status: 'active',
        collegeId: req.user.collegeId
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'fullName', 'username', 'profilePicture']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    console.log(`Found ${posts.length} posts`);

    // Process posts
    const processedPosts = posts.map(post => {
      const postData = post.toJSON();
      
      // Check if current user liked the post
      postData.isLiked = postData.likes?.includes(req.user.id) || false;
      postData.isAuthor = postData.authorId === req.user.id;
      
      // Handle anonymous posts
      if (postData.isAnonymous && !postData.isAuthor) {
        postData.author = {
          username: 'Anonymous',
          fullName: 'Anonymous',
          profilePicture: null
        };
      }

      // Add full URLs for media - FIXED
      if (postData.media && postData.media.length > 0) {
        postData.media = postData.media.map(m => {
          // If URL already has base, return as is
          if (m.url.startsWith('http')) {
            return m;
          }
          
          // Ensure URL starts with slash
          const urlPath = m.url.startsWith('/') ? m.url : `/${m.url}`;
          
          return {
            ...m,
            url: `http://localhost:5000${urlPath}`
          };
        });
      }

      return postData;
    });

    const total = await Post.count({
      where: {
        status: 'active',
        collegeId: req.user.collegeId
      }
    });

    res.json({
      success: true,
      posts: processedPosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get feed',
      error: error.message
    });
  }
};

// @desc    Like/unlike a post
// @route   POST /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const post = await Post.findByPk(req.params.id, { transaction });

    if (!post || post.status !== 'active') {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const likes = post.likes || [];
    const hasLiked = likes.includes(req.user.id);

    if (hasLiked) {
      post.likes = likes.filter(id => id !== req.user.id);
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      likes.push(req.user.id);
      post.likes = likes;
      post.likesCount = (post.likesCount || 0) + 1;
    }

    await post.save({ transaction });
    await transaction.commit();

    res.json({
      success: true,
      isLiked: !hasLiked,
      likesCount: post.likesCount
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like post'
    });
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comment
// @access  Private
const addComment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please provide comment content'
      });
    }

    const post = await Post.findByPk(req.params.id, { transaction });

    if (!post || post.status !== 'active') {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comments = post.comments || [];
    const newComment = {
      id: Date.now().toString(),
      content: content.trim(),
      authorId: req.user.id,
      authorName: req.user.fullName || req.user.username,
      authorAvatar: req.user.profilePicture,
      createdAt: new Date().toISOString(),
      likes: [],
      likesCount: 0
    };

    comments.push(newComment);
    post.comments = comments;
    post.commentsCount = (post.commentsCount || 0) + 1;

    await post.save({ transaction });
    await transaction.commit();

    res.status(201).json({
      success: true,
      comment: newComment
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const post = await Post.findByPk(req.params.id, { transaction });

    if (!post || post.status !== 'active') {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user is author
    if (post.authorId !== req.user.id && req.user.role !== 'admin') {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    // Soft delete
    post.status = 'deleted';
    await post.save({ transaction });
    await transaction.commit();

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post'
    });
  }
};

// @desc    Get comments for a post
// @route   GET /api/posts/:id/comments
// @access  Private
const getComments = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post || post.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.json({
      success: true,
      comments: post.comments || []
    });
  } catch (error) {
    console.error('❌ Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get comments'
    });
  }
};

// @desc    Get post by ID
// @route   GET /api/posts/:id
// @access  Private
const getPostById = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'fullName', 'username', 'profilePicture']
        }
      ]
    });

    if (!post || post.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const postData = post.toJSON();
    postData.isLiked = postData.likes?.includes(req.user.id) || false;
    postData.isAuthor = postData.authorId === req.user.id;

    if (postData.isAnonymous && !postData.isAuthor) {
      postData.author = {
        username: 'Anonymous',
        fullName: 'Anonymous',
        profilePicture: null
      };
    }

    // Add full URLs for media - FIXED
    if (postData.media && postData.media.length > 0) {
      postData.media = postData.media.map(m => {
        let url = m.url;
        if (!url.startsWith('http')) {
          if (!url.startsWith('/')) {
            url = '/' + url;
          }
          url = `http://localhost:5000${url}`;
        }
        return {
          ...m,
          url
        };
      });
    }

    res.json({
      success: true,
      post: postData
    });
  } catch (error) {
    console.error('❌ Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get post'
    });
  }
};


// @desc    Get user posts
// @route   GET /api/posts/user/:userId
// @access  Private
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const posts = await Post.findAll({
      where: {
        authorId: userId,
        status: 'active'
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'fullName', 'username', 'profilePicture']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const processedPosts = posts.map(post => {
      const postData = post.toJSON();
      postData.isLiked = postData.likes?.includes(req.user.id) || false;
      postData.isAuthor = postData.authorId === req.user.id;

      // Add full URLs for media - FIXED
      if (postData.media && postData.media.length > 0) {
        postData.media = postData.media.map(m => {
          let url = m.url;
          if (!url.startsWith('http')) {
            if (!url.startsWith('/')) {
              url = '/' + url;
            }
            url = `http://localhost:5000${url}`;
          }
          return {
            ...m,
            url
          };
        });
      }

      return postData;
    });

    res.json({
      success: true,
      posts: processedPosts
    });
  } catch (error) {
    console.error('❌ Get user posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user posts'
    });
  }
};

module.exports = {
  createPost,
  getFeed,
  toggleLike,
  addComment,
  deletePost,
  getComments,
  getPostById,
  getUserPosts
};