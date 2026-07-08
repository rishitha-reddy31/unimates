// backend/src/config/socket.js
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
      credentials: true
    }
  });

  // Store online users
  const onlineUsers = new Map();

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);
    console.log('👤 User:', socket.user?.email);

    // Add user to online users
    if (socket.user) {
      onlineUsers.set(socket.user.id, socket.id);
      
      // Join user to their personal room
      socket.join(socket.user.id);
      
      // Broadcast online status to all connected clients
      io.emit('user-online', socket.user.id);
      
      // Send list of online users to the new client
      socket.emit('users-online', Array.from(onlineUsers.keys()));
    }

    // Handle sending message
    socket.on('send-message', async (data) => {
      try {
        const { receiverId, content, messageId } = data;
        
        console.log('📨 Sending message from', socket.user.id, 'to', receiverId);
        
        // Emit to receiver's room
        io.to(receiverId).emit('receive-message', {
          id: messageId,
          senderId: socket.user.id,
          receiverId,
          content,
          sender: {
            id: socket.user.id,
            fullName: socket.user.fullName,
            username: socket.user.username,
            profilePicture: socket.user.profilePicture
          },
          createdAt: new Date().toISOString()
        });

        // Also emit back to sender for confirmation
        socket.emit('message-sent', {
          id: messageId,
          receiverId,
          status: 'sent'
        });

      } catch (error) {
        console.error('❌ Socket send message error:', error);
        socket.emit('message-error', { error: error.message });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { receiverId, isTyping } = data;
      io.to(receiverId).emit('user-typing', {
        userId: socket.user.id,
        isTyping
      });
    });

    // Handle read receipts
    socket.on('mark-read', (data) => {
      const { senderId } = data;
      io.to(senderId).emit('messages-read', {
        readerId: socket.user.id
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
      
      if (socket.user) {
        onlineUsers.delete(socket.user.id);
        io.emit('user-offline', socket.user.id);
      }
    });
  });

  return io;
};

module.exports = { initializeSocket };