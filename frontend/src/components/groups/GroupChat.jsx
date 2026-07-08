import toast from 'react-hot-toast'; 
import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../hooks/useAuth';
import { chatService } from '../../services/chat';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../common/LoadingSpinner';

const GroupChat = ({ groupId, groupName }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const { socket } = useSocket();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Fetch group messages
    useEffect(() => {
        fetchMessages();
        
        // Join group chat room
        if (socket) {
            socket.emit('join-group-chat', groupId);
            
            socket.on('group-message', handleNewMessage);
            
            return () => {
                socket.emit('leave-group-chat', groupId);
                socket.off('group-message');
            };
        }
    }, [groupId, socket]);

    const fetchMessages = async (pageNum = 1) => {
        try {
            setIsLoading(true);
            const res = await chatService.getGroupMessages(groupId, pageNum);
            const newMessages = res.data.messages;
            
            if (pageNum === 1) {
                setMessages(newMessages);
            } else {
                setMessages(prev => [...newMessages, ...prev]);
            }
            
            setHasMore(newMessages.length === 50);
            setPage(pageNum);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewMessage = (message) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
    };

    const sendMessageMutation = useMutation(
        (content) => chatService.sendGroupMessage(groupId, content),
        {
            onSuccess: (data) => {
                setNewMessage('');
                // Emit via socket for real-time
                if (socket) {
                    socket.emit('group-message', {
                        groupId,
                        message: data.data.message
                    });
                }
            },
            onError: (error) => {
                toast.error('Failed to send message');
            }
        }
    );

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        sendMessageMutation.mutate(newMessage.trim());
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMore = () => {
        if (hasMore && !isLoading) {
            fetchMessages(page + 1);
        }
    };

    const handleScroll = () => {
        if (chatContainerRef.current) {
            const { scrollTop } = chatContainerRef.current;
            if (scrollTop === 0 && hasMore && !isLoading) {
                loadMore();
            }
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col h-[600px]">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Group Discussion
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Chat with members of {groupName}
                </p>
            </div>

            {/* Messages Area */}
            <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-6 space-y-4"
            >
                {isLoading && page === 1 ? (
                    <div className="flex justify-center">
                        <LoadingSpinner size="md" />
                    </div>
                ) : (
                    <>
                        {hasMore && (
                            <div className="text-center">
                                <button
                                    onClick={loadMore}
                                    disabled={isLoading}
                                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                >
                                    Load older messages
                                </button>
                            </div>
                        )}
                        
                        {messages.map((message, index) => {
                            const isOwn = message.sender?._id === user?._id;
                            const showAvatar = index === 0 || 
                                messages[index - 1]?.sender?._id !== message.sender?._id;

                            return (
                                <div key={message._id || index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {!isOwn && showAvatar && (
                                            <img
                                                src={message.sender?.profile?.profilePicture || 'default-avatar.png'}
                                                alt={message.sender?.profile?.name}
                                                className="h-8 w-8 rounded-full flex-shrink-0"
                                            />
                                        )}
                                        {!isOwn && !showAvatar && <div className="w-8" />}
                                        
                                        <div className={`flex flex-col ${isOwn ? 'mr-2' : 'ml-2'}`}>
                                            {!isOwn && showAvatar && (
                                                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1">
                                                    {message.sender?.profile?.name}
                                                </span>
                                            )}
                                            <div
                                                className={`px-4 py-2 rounded-lg ${
                                                    isOwn
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                                }`}
                                            >
                                                <p className="text-sm whitespace-pre-wrap break-words">
                                                    {message.message}
                                                </p>
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1">
                                                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-end space-x-3">
                    <div className="flex-1">
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            rows="1"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none dark:bg-gray-700 dark:text-white"
                            style={{ minHeight: '40px', maxHeight: '120px' }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sendMessageMutation.isLoading}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <PaperAirplaneIcon className="h-5 w-5 transform rotate-90" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GroupChat;