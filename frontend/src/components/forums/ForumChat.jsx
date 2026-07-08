// frontend/src/components/forums/ForumChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../context/SocketContext';
import { forumService } from '../../services/forum';
import { PaperAirplaneIcon, UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

const ForumChat = ({ forumId, forum, onUpdate }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [joining, setJoining] = useState(false);
  const messagesEndRef = useRef(null);

  const isParticipant = forum?.hasJoined || forum?.isAuthor;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await forumService.getForumMessages(forumId);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      if (error.response?.status === 500) {
        toast.error('Chat system is being set up. Please refresh the page.');
      } else {
        toast.error('Failed to load messages');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (forumId && isParticipant) {
      loadMessages();
    }
  }, [forumId, isParticipant]);

  useEffect(() => {
    if (!socket || !forumId) return;

    socket.emit('join-forum', forumId);

    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    socket.on('new-forum-message', handleNewMessage);

    return () => {
      socket.off('new-forum-message', handleNewMessage);
      socket.emit('leave-forum', forumId);
    };
  }, [socket, forumId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleJoin = async () => {
    try {
      setJoining(true);
      const response = await forumService.joinForum(forumId);
      if (response.data.success) {
        toast.success('Joined discussion!');
        if (onUpdate) onUpdate();
        loadMessages();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join');
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    try {
      setJoining(true);
      const response = await forumService.leaveForum(forumId);
      if (response.data.success) {
        toast.success('Left discussion');
        if (onUpdate) onUpdate();
        setMessages([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to leave');
    } finally {
      setJoining(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const tempId = Date.now().toString();
    const tempMessage = {
      id: tempId,
      content: newMessage,
      sender: isAnonymous ? { username: 'Anonymous', fullName: 'Anonymous' } : user,
      senderId: user?.id,
      createdAt: new Date().toISOString(),
      isAnonymous,
      isTemp: true
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');
    setSending(true);

    try {
      const response = await forumService.sendForumMessage(forumId, newMessage, isAnonymous);
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? response.data.message : msg
      ));
    } catch (error) {
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isParticipant) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Join the Discussion
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Join this discussion to see messages and participate in the conversation.
        </p>
        <button
          onClick={handleJoin}
          disabled={joining}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {joining ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <UserPlusIcon className="h-5 w-5 mr-2" />
              Join Discussion
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Discussion Chat
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {forum?.participantsCount || 0} participants
          </p>
        </div>
        <button
          onClick={handleLeave}
          disabled={joining}
          className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <UserMinusIcon className="h-4 w-4 inline mr-1" />
          Leave
        </button>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p>No messages yet</p>
            <p className="text-sm mt-2">Be the first to start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${message.senderId === user?.id ? 'order-2' : ''}`}>
                <div className="flex items-center mb-1 space-x-2">
                  {message.senderId !== user?.id && (
                    <img
                      src={message.sender?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.sender?.fullName || message.sender?.username)}&background=2563eb&color=fff&size=24`}
                      alt={message.sender?.fullName}
                      className="h-5 w-5 rounded-full"
                    />
                  )}
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {message.senderId === user?.id ? 'You' : (message.sender?.fullName || message.sender?.username)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatTime(message.createdAt)}
                  </span>
                </div>
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.senderId === user?.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  } ${message.isTemp ? 'opacity-70' : ''}`}
                >
                  <p className="break-words whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSendMessage}>
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              />
              <div className="flex items-center mt-2">
                <label className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="mr-2"
                  />
                  Send anonymously
                </label>
              </div>
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed h-10"
            >
              {sending ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <PaperAirplaneIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForumChat;