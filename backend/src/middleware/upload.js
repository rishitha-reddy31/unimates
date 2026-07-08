// backend/src/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    './uploads',
    './uploads/profiles',
    './uploads/posts',
    './uploads/posts/images',
    './uploads/posts/videos',
    './uploads/documents'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
};

createUploadDirs();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = './uploads/posts/';
    
    // Determine folder based on file type
    if (file.mimetype.startsWith('image/')) {
      uploadPath += 'images/';
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath += 'videos/';
    } else {
      uploadPath += 'documents/';
    }
    
    // Ensure the specific directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + ext;
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm', 'video/ogg'];
  const allowedDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  if (allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else if (allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else if (allowedDocTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: Images (JPEG, PNG, GIF, WebP), Videos (MP4, WebM), Documents (PDF, DOC, DOCX)'), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max for videos
  },
  fileFilter: fileFilter
});

// Upload multiple files (for posts)
const uploadPostMedia = upload.array('media', 10); // Max 10 files

// Single file upload
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const singleUpload = upload.single(fieldName);
    
    singleUpload(req, res, (err) => {
      if (err) {
        console.error('❌ Upload error:', err);
        
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: 'File too large. Max size: 50MB'
            });
          }
          return res.status(400).json({
            success: false,
            message: 'Upload error',
            error: err.message
          });
        } else {
          return res.status(400).json({
            success: false,
            message: err.message || 'File upload failed'
          });
        }
      }
      next();
    });
  };
};

// Multiple files upload for posts
const uploadPostFiles = (req, res, next) => {
  uploadPostMedia(req, res, (err) => {
    if (err) {
      console.error('❌ Upload error:', err);
      
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'One or more files are too large. Max size: 50MB per file'
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Too many files. Maximum 10 files allowed'
          });
        }
        return res.status(400).json({
          success: false,
          message: 'Upload error',
          error: err.message
        });
      } else {
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed'
        });
      }
    }
    next();
  });
};

// Helper to get file URL
const getFileUrl = (filename, type = 'post') => {
  if (!filename) return null;
  if (filename.startsWith('http')) return filename;
  
  const folderMap = {
    profile: 'profiles',
    post: 'posts',
    document: 'documents',
    video: 'videos'
  };
  
  const folder = folderMap[type] || 'uploads';
  return `/uploads/${folder}/${filename}`;
};

module.exports = {
  upload,
  uploadSingle,
  uploadPostFiles,
  getFileUrl
};