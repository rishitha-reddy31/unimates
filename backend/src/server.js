const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const http = require('http');
const path = require('path');
const app = express();
require('dotenv').config();

const { connectDB } = require('./config/database');
const { initializeSocket } = require('./config/socket');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const chatRoutes = require('./routes/chatRoutes');
const groupRoutes = require('./routes/groupRoutes');
const forumRoutes = require('./routes/forumRoutes');
const eventRoutes = require('./routes/eventRoutes');
const anonymousRoutes = require('./routes/anonymousRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const collegeRoutes = require('./routes/collegeRoutes');

const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Connect to PostgreSQL with error handling
connectDB().catch(err => {
  console.error('❌ Failed to connect to database:', err);
  process.exit(1);
});

// Initialize Socket.io
const io = initializeSocket(server);

// Make io accessible to routes
app.set('io', io);

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            imgSrc: ["'self'", "data:", "blob:", "*"],
        },
    },
}));

// CORS configuration
const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Compression middleware
app.use(compression());

// Body parsing middleware with increased limits for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In server.js, make sure you have this line
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

console.log('📁 Serving static files from:', path.join(__dirname, '../uploads'));
console.log('📁 Current directory:', __dirname);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined')); // More detailed logs for production
}

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/anonymous', anonymousRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/colleges', collegeRoutes);

// Add this near your other routes, before the 404 handler
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Also add an API health endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'API healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test endpoint to check if uploads are accessible
app.get('/test-upload/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, 'uploads', filename);
  
  if (fs.existsSync(filepath)) {
    res.json({ 
      success: true, 
      message: 'File exists',
      url: `/uploads/${filename}`,
      path: filepath
    });
  } else {
    res.json({ 
      success: false, 
      message: 'File not found',
      path: filepath
    });
  }
});

// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Unimates API',
        version: '1.0.0',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            posts: '/api/posts',
            chat: '/api/chat',
            groups: '/api/groups',
            forums: '/api/forums',
            events: '/api/events',
            anonymous: '/api/anonymous',
            reports: '/api/reports',
            admin: '/api/admin',
            notifications: '/api/notifications',
            colleges: '/api/colleges',
        },
        documentation: process.env.API_DOCS_URL || 'Coming soon'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Unimates API',
        info: 'Visit /api for available endpoints',
        docs: process.env.API_DOCS_URL || 'Coming soon'
    });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Route not found',
        path: req.originalUrl,
        method: req.method
    });
});

// Global error handler
app.use(errorHandler);

// Start server with error handling
const startServer = () => {
    try {
        server.listen(PORT, () => {
            console.log(`=================================`);
            console.log(`🚀 Server is running!`);
            console.log(`=================================`);
            console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🎯 Port: ${PORT}`);
            console.log(`📡 API: http://localhost:${PORT}/api`);
            console.log(`🔌 Socket.io: ws://localhost:${PORT}`);
            console.log(`💾 Database: PostgreSQL`);
            console.log(`=================================`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

// Graceful shutdown
const gracefulShutdown = () => {
    console.log('🛑 Received shutdown signal, closing server...');
    
    server.close(() => {
        console.log('✅ HTTP server closed');
        
        // Close database connection
        const { sequelize } = require('./config/database');
        sequelize.close().then(() => {
            console.log('✅ Database connection closed');
            process.exit(0);
        }).catch(err => {
            console.error('❌ Error closing database connection:', err);
            process.exit(1);
        });
    });

    // Force close after 10 seconds
    setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

// Handle process termination
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('❌ UNHANDLED REJECTION! Shutting down...');
    console.log('Error:', err.message);
    console.log('Stack:', err.stack);
    gracefulShutdown();
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.log('❌ UNCAUGHT EXCEPTION! Shutting down...');
    console.log('Error:', err.message);
    console.log('Stack:', err.stack);
    gracefulShutdown();
});

module.exports = { app, server, io };