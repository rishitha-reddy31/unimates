// frontend/src/components/chat/Chat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../context/SocketContext';
import { chatService } from '../../services/chat';
import { followService } from '../../services/follow';
import { userService } from '../../services/user';
import LoadingSpinner from '../common/LoadingSpinner';
import { 
  PaperAirplaneIcon, 
  ArrowLeftIcon,
  UserCircleIcon,
  CheckBadgeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const messagesEndRef = useRef(null);
  
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [followers, setFollowers] = useState([]);

  const currentUser = authUser?.data?.user || authUser?.user || authUser;

  // Load followers (users you follow)
  const loadFollowers = async () => {
    try {
      const response = await followService.getFollowing(currentUser?.id);
      setFollowers(response.data.following || []);
    } catch (error) {
      console.error('Error loading followers:', error);
    }
  };

  // Load conversations
  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await chatService.getConversations();
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  // Load user and messages
  const loadUserAndMessages = async (userId) => {
    try {
      setLoading(true);
      
      // Get user details
      const userResponse = await userService.getProfile(userId);
      setSelectedUser(userResponse.data.user);
      
      // Get messages
      const messagesResponse = await chatService.getMessages(userId);
      setMessages(messagesResponse.data.messages || []);
      
      // Mark as read
      await chatService.markAsRead(userId);
      
    } catch (error) {
      console.error('Error loading chat:', error);
      toast.error('Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  // Update conversations with new message
  const updateConversationsWithMessage = (message) => {
    setConversations(prev => {
      const otherUserId = message.senderId === currentUser?.id ? message.receiverId : message.senderId;
      const otherUser = message.senderId === currentUser?.id ? message.receiver : message.sender;
      
      const existingIndex = prev.findIndex(c => c.user.id === otherUserId);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          lastMessage: message,
          unreadCount: message.senderId !== currentUser?.id 
            ? (updated[existingIndex].unreadCount || 0) + 1 
            : updated[existingIndex].unreadCount
        };
        // Move to top
        const [item] = updated.splice(existingIndex, 1);
        return [item, ...updated];
      } else {
        // Add new conversation
        return [{
          user: otherUser,
          lastMessage: message,
          unreadCount: message.senderId !== currentUser?.id ? 1 : 0
        }, ...prev];
      }
    });
  };

  // Mark messages as read
  const markAsRead = async (userId) => {
    try {
      await chatService.markAsRead(userId);
      socket?.emit('mark-read', { senderId: userId });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Get userId from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get('user');
    
    if (userId) {
      loadUserAndMessages(userId);
    } else {
      loadConversations();
      if (currentUser?.id) {
        loadFollowers();
      }
    }
  }, [location.search, currentUser?.id]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      console.log('📩 Received message:', message);
      
      if (selectedUser && message.senderId === selectedUser.id) {
        setMessages(prev => [...prev, message]);
        markAsRead(selectedUser.id);
      } else {
        // Update conversations list
        updateConversationsWithMessage(message);
        toast.success(`New message from ${message.sender?.fullName || 'User'}`);
      }
    };

    const handleMessageSent = (data) => {
      console.log('✅ Message sent:', data);
    };

    const handleUserTyping = (data) => {
      if (data.userId === selectedUser?.id) {
        setOtherUserTyping(data.isTyping);
      }
    };

    const handleMessagesRead = (data) => {
      // Update message read status
      setMessages(prev => 
        prev.map(msg => ({
          ...msg,
          isRead: msg.senderId === currentUser?.id ? true : msg.isRead
        }))
      );
    };

    socket.on('receive-message', handleReceiveMessage);
    socket.on('message-sent', handleMessageSent);
    socket.on('user-typing', handleUserTyping);
    socket.on('messages-read', handleMessagesRead);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('message-sent', handleMessageSent);
      socket.off('user-typing', handleUserTyping);
      socket.off('messages-read', handleMessagesRead);
    };
  }, [socket, selectedUser, currentUser?.id]);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || sending) return;

    const tempId = Date.now().toString();
    const tempMessage = {
      id: tempId,
      senderId: currentUser.id,
      receiverId: selectedUser.id,
      content: newMessage,
      sender: {
        id: currentUser.id,
        fullName: currentUser.fullName,
        profilePicture: currentUser.profilePicture
      },
      createdAt: new Date().toISOString(),
      isRead: false,
      isTemp: true
    };

    // Optimistic update
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    setSending(true);

    // Reset typing indicator
    if (isTyping) {
      setIsTyping(false);
      socket?.emit('typing', {
        receiverId: selectedUser.id,
        isTyping: false
      });
    }

    try {
      const response = await chatService.sendMessage(selectedUser.id, newMessage);
      
      if (response.data.success) {
        // Replace temp message with real one
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId ? response.data.data : msg
          )
        );
        
        // Emit via socket
        socket?.emit('send-message', {
          receiverId: selectedUser.id,
          content: newMessage,
          messageId: response.data.data.id
        });
      }
    } catch (error) {
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Handle typing
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping && e.target.value) {
      setIsTyping(true);
      socket?.emit('typing', {
        receiverId: selectedUser.id,
        isTyping: true
      });
    }
    
    if (!e.target.value && isTyping) {
      setIsTyping(false);
      socket?.emit('typing', {
        receiverId: selectedUser.id,
        isTyping: false
      });
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Messages</h2>
        </div>
        
        {/* Followers List (People you can chat with) */}
        <div className="flex-1 overflow-y-auto">
          {followers.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <p>You're not following anyone yet</p>
              <p className="text-sm mt-2">Go to Suggestions to follow people</p>
            </div>
          ) : (
            followers.map((user) => {
              const conversation = conversations.find(c => c.user?.id === user.id);
              const isOnline = onlineUsers?.includes(user.id);
              
              return (
                <button
                  key={user.id}
                  onClick={() => navigate(`/chat?user=${user.id}`)}
                  className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedUser?.id === user.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="relative">
                    <img
                      src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.username)}&background=2563eb&color=fff`}
                      alt={user.fullName}
                      className="h-12 w-12 rounded-full"
                    />
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-baseline">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {user.fullName || user.username}
                      </p>
                      {conversation?.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {conversation?.lastMessage ? (
                        <>
                          {conversation.lastMessage.senderId === currentUser?.id && 'You: '}
                          {conversation.lastMessage.content}
                        </>
                      ) : (
                        <span className="italic">No messages yet</span>
                      )}
                    </p>
                    
                    {conversation?.unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
              <button
                onClick={() => navigate('/chat')}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              
              <div className="relative">
                <img
                  src={selectedUser.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.fullName || selectedUser.username)}&background=2563eb&color=fff`}
                  alt={selectedUser.fullName}
                  className="h-10 w-10 rounded-full cursor-pointer"
                  onClick={() => navigate(`/profile/${selectedUser.id}`)}
                />
                {onlineUsers?.includes(selectedUser.id) && (
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white"></span>
                )}
              </div>
              
              <div className="flex-1">
                <h3 
                  className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600"
                  onClick={() => navigate(`/profile/${selectedUser.id}`)}
                >
                  {selectedUser.fullName || selectedUser.username}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {onlineUsers?.includes(selectedUser.id) ? (
                    <span className="flex items-center">
                      <span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>
                      Online
                    </span>
                  ) : otherUserTyping ? (
                    <span className="text-blue-500">Typing...</span>
                  ) : (
                    'Offline'
                  )}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      message.senderId === currentUser?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    } ${message.isTemp ? 'opacity-70' : ''}`}
                  >
                    <p className="break-words whitespace-pre-wrap">{message.content}</p>
                    
                    <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
                      message.senderId === currentUser?.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span>{formatTime(message.createdAt)}</span>
                      {message.senderId === currentUser?.id && (
                        <span>
                          {message.isRead ? (
                            <CheckBadgeIcon className="h-3 w-3 text-blue-300" />
                          ) : (
                            <ClockIcon className="h-3 w-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2">
                <textarea
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  rows="1"
                  className="flex-1 resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {sending ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <PaperAirplaneIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8">
              <UserCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Select a conversation to start chatting
              </p>
              <p className="text-gray-400 dark:text-gray-500 mt-2">
                You can only message users you follow
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;