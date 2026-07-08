const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

// User validation rules
const userValidation = {
  register: [
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
    validate
  ],
  
  login: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    validate
  ],
  
  updateProfile: [
    body('username')
      .optional()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters'),
    body('fullName')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Full name cannot exceed 100 characters'),
    body('bio')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Bio cannot exceed 500 characters'),
    validate
  ]
};

// Post validation rules
const postValidation = {
  create: [
    body('content')
      .notEmpty()
      .withMessage('Content is required')
      .isLength({ max: 5000 })
      .withMessage('Content cannot exceed 5000 characters'),
    body('visibility')
      .optional()
      .isIn(['public', 'college', 'private', 'custom'])
      .withMessage('Invalid visibility option'),
    validate
  ],
  
  update: [
    body('content')
      .optional()
      .isLength({ max: 5000 })
      .withMessage('Content cannot exceed 5000 characters'),
    validate
  ]
};

// Comment validation rules
const commentValidation = {
  create: [
    body('content')
      .notEmpty()
      .withMessage('Content is required')
      .isLength({ max: 1000 })
      .withMessage('Comment cannot exceed 1000 characters'),
    validate
  ]
};

// Group validation rules
const groupValidation = {
  create: [
    body('name')
      .notEmpty()
      .withMessage('Group name is required')
      .isLength({ max: 100 })
      .withMessage('Group name cannot exceed 100 characters'),
    body('groupType')
      .isIn(['study', 'project', 'club', 'society', 'batch', 'hostel', 'other'])
      .withMessage('Invalid group type'),
    body('privacy')
      .optional()
      .isIn(['public', 'private', 'secret'])
      .withMessage('Invalid privacy option'),
    validate
  ]
};

// Event validation rules
const eventValidation = {
  create: [
    body('title')
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('description')
      .notEmpty()
      .withMessage('Description is required'),
    body('eventType')
      .isIn(['academic', 'cultural', 'sports', 'technical', 'workshop', 'seminar', 'other'])
      .withMessage('Invalid event type'),
    body('startDate')
      .isISO8601()
      .withMessage('Valid start date is required'),
    body('endDate')
      .isISO8601()
      .withMessage('Valid end date is required'),
    validate
  ]
};

// ID parameter validation
const validateUUID = (paramName = 'id') => {
  return [
    param(paramName)
      .isUUID()
      .withMessage(`Invalid ${paramName} format`),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ID format',
          errors: errors.array()
        });
      }
      next();
    }
  ];
};

// Pagination validation
const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  
  if (req.query.page && (isNaN(page) || page < 1)) {
    return res.status(400).json({
      success: false,
      message: 'Page must be a positive number'
    });
  }
  
  if (req.query.limit && (isNaN(limit) || limit < 1 || limit > 100)) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 100'
    });
  }
  
  req.pagination = {
    page: page || 1,
    limit: limit || 20,
    offset: ((page || 1) - 1) * (limit || 20)
  };
  
  next();
};

module.exports = {
  validate,
  userValidation,
  postValidation,
  commentValidation,
  groupValidation,
  eventValidation,
  validateUUID,
  validatePagination
};