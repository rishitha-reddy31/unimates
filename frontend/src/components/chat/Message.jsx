import React from 'react';
import { format } from 'date-fns';
import { CheckIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';

const Message = ({ message, isOwn }) => {
    const messageDate = new Date(message.createdAt);

    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar (only for received messages) */}
                {!isOwn && (
                    <img
                        src={message.sender.profile?.profilePicture || 'default-avatar.png'}
                        alt={message.sender.profile?.name}
                        className="h-8 w-8 rounded-full flex-shrink-0"
                    />
                )}

                {/* Message Content */}
                <div className={`flex flex-col ${isOwn ? 'mr-2' : 'ml-2'}`}>
                    {/* Sender Name (only for received messages) */}
                    {!isOwn && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1">
                            {message.sender.profile?.name}
                        </span>
                    )}

                    {/* Message Bubble */}
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

                    {/* Timestamp & Status */}
                    <div className={`flex items-center space-x-1 mt-1 text-xs ${
                        isOwn ? 'justify-end' : 'justify-start'
                    }`}>
                        <span className="text-gray-500 dark:text-gray-400">
                            {format(messageDate, 'hh:mm a')}
                        </span>
                        
                        {isOwn && (
                            <span className="text-gray-500 dark:text-gray-400">
                                {message.read ? (
                                    <div className="flex items-center space-x-0.5">
                                        <CheckIcon className="h-3 w-3 text-blue-500" />
                                        <CheckIcon className="h-3 w-3 -ml-2 text-blue-500" />
                                    </div>
                                ) : (
                                    <CheckIcon className="h-3 w-3" />
                                )}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Message;