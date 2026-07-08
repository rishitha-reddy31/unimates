import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlusIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const UserCard = ({ user }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start space-x-4">
                <Link to={`/profile/${user._id}`}>
                    <img
                        src={user.profile?.profilePicture || 'default-avatar.png'}
                        alt={user.profile?.name}
                        className="h-16 w-16 rounded-full object-cover"
                    />
                </Link>
                
                <div className="flex-1 min-w-0">
                    <Link to={`/profile/${user._id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 truncate">
                            {user.profile?.name}
                        </h3>
                    </Link>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user.profile?.branch} • {user.profile?.year} Year
                    </p>
                    
                    {user.profile?.skills?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            {user.profile.skills.slice(0, 3).map((skill, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                                >
                                    {skill}
                                </span>
                            ))}
                            {user.profile.skills.length > 3 && (
                                <span className="px-2 py-0.5 text-xs text-gray-500">
                                    +{user.profile.skills.length - 3} more
                                </span>
                            )}
                        </div>
                    )}
                    
                    <div className="mt-3 flex items-center space-x-2">
                        <Link
                            to={`/chat?user=${user._id}`}
                            className="inline-flex items-center px-2.5 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
                        >
                            <EnvelopeIcon className="h-3 w-3 mr-1" />
                            Message
                        </Link>
                        <button className="inline-flex items-center px-2.5 py-1.5 bg-gray-200 text-gray-700 text-xs rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300">
                            <UserPlusIcon className="h-3 w-3 mr-1" />
                            Follow
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserCard;