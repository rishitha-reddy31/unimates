import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';

const ChatList = ({ conversations, selectedUserId, onSelectUser }) => {
    const { user } = useAuth();

    if (conversations.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-4">
                <p className="text-gray-500 dark:text-gray-400 text-center">
                    No conversations yet.<br />
                    Search for users to start chatting!
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => {
                const otherUser = conv._id;
                const isSelected = selectedUserId === otherUser._id;
                const isOnline = false; // This will come from socket
                const lastMessage = conv.lastMessage;
                const unreadCount = conv.unreadCount;

                return (
                    <div
                        key={otherUser._id}
                        onClick={() => onSelectUser(otherUser)}
                        className={`flex items-center p-4 cursor-pointer transition-colors ${
                            isSelected
                                ? 'bg-blue-50 dark:bg-blue-900/20'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                        {/* Avatar */}
                        <div className="relative">
                            <img
                                src={otherUser.profile?.profilePicture || 'default-avatar.png'}
                                alt={otherUser.profile?.name}
                                className="h-12 w-12 rounded-full object-cover"
                            />
                            {isOnline && (
                                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-900"></span>
                            )}
                        </div>

                        {/* Content */}
                        <div className="ml-3 flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {otherUser.profile?.name}
                                </h3>
                                {lastMessage && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                        {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex items-center justify-between mt-1">
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {lastMessage ? (
                                        <>
                                            {lastMessage.sender === user._id && 'You: '}
                                            {lastMessage.message}
                                        </>
                                    ) : (
                                        'No messages yet'
                                    )}
                                </p>
                                
                                {unreadCount > 0 && !isSelected && (
                                    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ChatList;