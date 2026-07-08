// frontend/src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

// Create context
const SocketContext = createContext();

// Custom hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

// Provider component
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user: authUser, isAuthenticated } = useAuth();

  const currentUser = authUser?.data?.user || authUser?.user || authUser;

  useEffect(() => {
    if (isAuthenticated && currentUser?.id) {
      // Connect to socket server
      const socketInstance = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        auth: {
          token: localStorage.getItem('token')
        }
      });

      socketInstance.on('connect', () => {
        console.log('✅ Socket connected:', socketInstance.id);
        // Register user as online
        socketInstance.emit('user-online', currentUser.id);
      });

      socketInstance.on('disconnect', () => {
        console.log('❌ Socket disconnected');
      });

      socketInstance.on('users-online', (users) => {
        setOnlineUsers(users);
      });

      socketInstance.on('user-online', (userId) => {
        setOnlineUsers(prev => [...prev, userId]);
      });

      socketInstance.on('user-offline', (userId) => {
        setOnlineUsers(prev => prev.filter(id => id !== userId));
      });

      setSocket(socketInstance);

      // Cleanup on unmount
      return () => {
        if (socketInstance) {
          socketInstance.emit('user-offline', currentUser.id);
          socketInstance.disconnect();
        }
      };
    }
  }, [isAuthenticated, currentUser?.id]);

  const value = {
    socket,
    onlineUsers,
    isOnline: (userId) => onlineUsers.includes(userId)
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Also export the context for backward compatibility
export { SocketContext };