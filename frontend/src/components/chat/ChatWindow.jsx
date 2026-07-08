import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import Message from './Message';
import EmojiPicker from 'emoji-picker-react';
import { PaperAirplaneIcon, FaceSmileIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../common/LoadingSpinner';

const ChatWindow = ({ user, messages, onSendMessage, isLoading }) => {
    const [newMessage, setNewMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const { user: currentUser } = useAuth();
    const { sendTyping } = useSocket();

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Handle typing indicator
    useEffect(() => {
        const handleTyping = (event) => {
            const { userId, isTyping } = event.detail;
            if (userId === user._id) {
                setTypingUser(isTyping ? user : null);
            }
        };

        window.addEventListener('user-typing', handleTyping);
        return () => window.removeEventListener('user-typing', handleTyping);
    }, [user]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage.trim());
            setNewMessage('');
            setShowEmojiPicker(false);
            
            // Stop typing indicator
            sendTyping(user._id, false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const handleTyping = () => {
        if (!isTyping) {
            setIsTyping(true);
            sendTyping(user._id, true);
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            sendTyping(user._id, false);
        }, 1000);
    };

    const onEmojiClick = (emojiData, event) => {
        setNewMessage(prev => prev + emojiData.emoji);
        setShowEmojiPicker(false);
        inputRef.current?.focus();
    };

    // Group messages by date
    const groupMessagesByDate = () => {
        const groups = [];
        let currentDate = null;

        messages.forEach((message) => {
            const messageDate = new Date(message.createdAt).toLocaleDateString();
            
            if (messageDate !== currentDate) {
                groups.push({
                    date: messageDate,
                    messages: []
                });
                currentDate = messageDate;
            }
            
            groups[groups.length - 1].messages.push(message);
        });

        return groups;
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const messageGroups = groupMessagesByDate();

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
                <img
                    src={user.profile?.profilePicture || 'default-avatar.png'}
                    alt={user.profile?.name}
                    className="h-10 w-10 rounded-full"
                />
                <div className="ml-3">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {user.profile?.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.profile?.branch} • {user.profile?.year}
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messageGroups.map((group, groupIndex) => (
                    <div key={groupIndex}>
                        {/* Date Separator */}
                        <div className="flex justify-center mb-4">
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-400 rounded-full">
                                {group.date === new Date().toLocaleDateString()
                                    ? 'Today'
                                    : group.date}
                            </span>
                        </div>

                        {/* Messages */}
                        {group.messages.map((message, messageIndex) => (
                            <Message
                                key={message._id || messageIndex}
                                message={message}
                                isOwn={message.sender._id === currentUser._id}
                            />
                        ))}
                    </div>
                ))}

                {/* Typing Indicator */}
                {typingUser && (
                    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm">{typingUser.profile?.name} is typing...</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
                    {/* Emoji Picker */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <FaceSmileIcon className="h-6 w-6" />
                        </button>

                        {showEmojiPicker && (
                            <div className="absolute bottom-full mb-2 left-0">
                                <div className="relative">
                                    <EmojiPicker
                                        onEmojiClick={onEmojiClick}
                                        theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker(false)}
                                        className="absolute top-2 right-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-full"
                                    >
                                        <span className="sr-only">Close</span>
                                        ×
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Text Input */}
                    <div className="flex-1">
                        <textarea
                            ref={inputRef}
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                handleTyping();
                            }}
                            onKeyDown={handleKeyPress}
                            placeholder="Type a message..."
                            rows="1"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none dark:bg-gray-700 dark:text-white"
                            style={{ minHeight: '40px', maxHeight: '120px' }}
                        />
                    </div>

                    {/* Send Button */}
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <PaperAirplaneIcon className="h-5 w-5 transform rotate-90" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;