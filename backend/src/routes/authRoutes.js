// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
console.log('✅ Auth controller loaded');

const {
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
  // NEW: Instagram-style suggestion and follow controllers
  getCollegeStudents,
  sendFollowRequest,
  acceptFollowRequest,
  rejectFollowRequest,
  getPendingRequests,
  unfollowUser
} = authController;

// Debug middleware imports
let protect, authLimiter, validate, validateUUID;
try {
  const authMiddleware = require('../middleware/auth');
  protect = authMiddleware.protect;
  console.log('✅ protect middleware:', typeof protect);
} catch (error) {
  console.error('❌ Error loading auth middleware:', error.message);
}

try {
  const rateLimiter = require('../middleware/rateLimiter');
  authLimiter = rateLimiter.authLimiter;
  console.log('✅ authLimiter middleware:', typeof authLimiter);
} catch (error) {
  console.error('❌ Error loading rateLimiter middleware:', error.message);
}

try {
  const validation = require('../middleware/validation');
  validate = validation.validate;
  validateUUID = validation.validateUUID;
  console.log('✅ validate middleware:', typeof validate);
  console.log('✅ validateUUID middleware:', typeof validateUUID);
} catch (error) {
  console.error('❌ Error loading validation middleware:', error.message);
}

const { body } = require('express-validator');
console.log('✅ express-validator loaded');

// Validation rules
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number'),
  body('college')
    .optional()
    .isUUID()
    .withMessage('Invalid college ID format'),
  body('year')
    .optional()
    .isIn(['1st', '2nd', '3rd', '4th', 'Graduate', 'Alumni', 'Faculty'])
    .withMessage('Invalid year selection'),
  body('branch')
    .optional()
    .isString()
    .trim(),
  body('fullName')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Full name cannot exceed 100 characters'),
  body('phoneNumber')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  body('rememberMe')
    .optional()
    .isBoolean()
    .withMessage('rememberMe must be a boolean')
];

const masterLoginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
    .isString()
    .withMessage('Refresh token must be a string')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
];

const resetPasswordValidation = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('Password must contain at least one letter and one number')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
    .withMessage('New password must contain at least one letter and one number')
];

// ============================================
// PUBLIC ROUTES (with rate limiting)
// ============================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  authLimiter,
  registerValidation,
  validate,
  registerUser
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  authLimiter,
  loginValidation,
  validate,
  loginUser
);

/**
 * @route   POST /api/auth/master-login
 * @desc    Login master user (admin)
 * @access  Public
 */
router.post(
  '/master-login',
  authLimiter,
  masterLoginValidation,
  validate,
  loginMasterUser
);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh-token',
  authLimiter,
  refreshTokenValidation,
  validate,
  refreshAccessToken
);

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verify email address
 * @access  Public
 */
router.get(
  '/verify-email/:token',
  validateUUID('token'),
  verifyEmail
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post(
  '/forgot-password',
  authLimiter,
  forgotPasswordValidation,
  validate,
  forgotPassword
);

/**
 * @route   PUT /api/auth/reset-password/:resetToken
 * @desc    Reset password with token
 * @access  Public
 */
router.put(
  '/reset-password/:resetToken',
  authLimiter,
  validateUUID('resetToken'),
  resetPasswordValidation,
  validate,
  resetPassword
);

// ============================================
// PROTECTED ROUTES (require authentication)
// ============================================

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', protect, logoutUser);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change password
 * @access  Private
 */
router.put(
  '/change-password',
  protect,
  changePasswordValidation,
  validate,
  changePassword
);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend verification email
 * @access  Private
 */
router.post('/resend-verification', protect, authLimiter, resendVerificationEmail);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', protect, getMe);

/**
 * @route   GET /api/auth/status
 * @desc    Check auth status (lightweight)
 * @access  Private
 */
router.get('/status', protect, (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      isVerified: req.user.isVerified,
      profilePicture: req.user.profilePicture,
      collegeId: req.user.collegeId,
      createdAt: req.user.createdAt
    }
  });
});

// ============================================
// 🆕 INSTAGRAM-STYLE SUGGESTIONS & FOLLOW SYSTEM
// ============================================

/**
 * @route   GET /api/auth/college-students
 * @desc    Get all students from same college for suggestions page
 * @access  Private
 */
router.get('/college-students', protect, getCollegeStudents);

/**
 * @route   GET /api/auth/pending-requests
 * @desc    Get all pending follow requests for current user
 * @access  Private
 */
router.get('/pending-requests', protect, getPendingRequests);

/**
 * @route   POST /api/auth/follow-request/:userId
 * @desc    Send a follow request to another student
 * @access  Private
 */
router.post('/follow-request/:userId', protect, sendFollowRequest);

/**
 * @route   POST /api/auth/unfollow/:userId
 * @desc    Unfollow a user (remove follow relationship)
 * @access  Private
 */
router.post('/unfollow/:userId', protect, unfollowUser);

/**
 * @route   POST /api/auth/accept-request/:requestId
 * @desc    Accept a follow request
 * @access  Private
 */
router.post('/accept-request/:requestId', protect, acceptFollowRequest);

/**
 * @route   POST /api/auth/reject-request/:requestId
 * @desc    Reject a follow request
 * @access  Private
 */
router.post('/reject-request/:requestId', protect, rejectFollowRequest);

// ============================================
// SOCIAL AUTH ROUTES (OAuth)
// ============================================

/**
 * @route   GET /api/auth/google
 * @desc    Google OAuth login
 * @access  Public
 */
router.get('/google', (req, res) => {
  res.json({ 
    success: true,
    message: 'Google OAuth endpoint',
    auth_url: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID || 'your-google-client-id'}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback'}&response_type=code&scope=email%20profile`
  });
});

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).json({
      success: false,
      message: 'Authorization code is required'
    });
  }
  
  res.json({ 
    success: true,
    message: 'Google OAuth callback received',
    code: code.substring(0, 10) + '...'
  });
});

/**
 * @route   GET /api/auth/github
 * @desc    GitHub OAuth login
 * @access  Public
 */
router.get('/github', (req, res) => {
  res.json({ 
    success: true,
    message: 'GitHub OAuth endpoint',
    auth_url: `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID || 'your-github-client-id'}&redirect_uri=${process.env.GITHUB_REDIRECT_URI || 'http://localhost:5000/api/auth/github/callback'}&scope=user:email`
  });
});

/**
 * @route   GET /api/auth/github/callback
 * @desc    GitHub OAuth callback
 * @access  Public
 */
router.get('/github/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).json({
      success: false,
      message: 'Authorization code is required'
    });
  }
  
  res.json({ 
    success: true,
    message: 'GitHub OAuth callback received',
    code: code.substring(0, 10) + '...'
  });
});

// ============================================
// TEST ENDPOINTS
// ============================================

/**
 * @route   GET /api/auth/test
 * @desc    Test endpoint to verify auth is working
 * @access  Public
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth routes are working',
    timestamp: new Date().toISOString(),
    endpoints: {
      public: [
        '/register',
        '/login',
        '/master-login',
        '/refresh-token',
        '/verify-email/:token',
        '/forgot-password',
        '/reset-password/:resetToken'
      ],
      protected: [
        '/logout',
        '/change-password',
        '/resend-verification',
        '/me',
        '/status'
      ],
      suggestions: [
        '/college-students',
        '/pending-requests',
        '/follow-request/:userId',
        '/unfollow/:userId',
        '/accept-request/:requestId',
        '/reject-request/:requestId'
      ],
      oauth: [
        '/google',
        '/google/callback',
        '/github',
        '/github/callback'
      ]
    }
  });
});

module.exports = router;