import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
    AcademicCapIcon,
    BriefcaseIcon,
    TrophyIcon,
    HeartIcon,
    DocumentTextIcon,
    LinkIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';

const Portfolio = ({ user }) => {
    const { user: currentUser } = useAuth();
    const isOwnProfile = currentUser?._id === user?._id;

    if (!user) return null;

    return (
        <div className="space-y-6">
            {/* Bio Section */}
            {user.profile?.bio && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        About
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {user.profile.bio}
                    </p>
                </div>
            )}

            {/* Skills */}
            {user.profile?.skills?.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                            <AcademicCapIcon className="h-5 w-5 mr-2 text-blue-500" />
                            Skills
                        </h3>
                        {isOwnProfile && (
                            <button className="text-sm text-blue-600 hover:text-blue-700">
                                Add Skill
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {user.profile.skills.map((skill, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm dark:bg-blue-900 dark:text-blue-200"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Projects */}
            {user.profile?.projects?.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                            <BriefcaseIcon className="h-5 w-5 mr-2 text-green-500" />
                            Projects
                        </h3>
                        {isOwnProfile && (
                            <button className="text-sm text-blue-600 hover:text-blue-700">
                                Add Project
                            </button>
                        )}
                    </div>
                    <div className="space-y-6">
                        {user.profile.projects.map((project, index) => (
                            <div key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-6 last:pb-0">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                            {project.title}
                                        </h4>
                                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                                            {project.description}
                                        </p>
                                        {project.link && (
                                            <a
                                                href={project.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-3 inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                                            >
                                                <LinkIcon className="h-4 w-4 mr-1" />
                                                View Project
                                            </a>
                                        )}
                                    </div>
                                    {isOwnProfile && (
                                        <button className="text-gray-400 hover:text-red-500">
                                            <span className="sr-only">Delete</span>
                                            ×
                                        </button>
                                    )}
                                </div>
                                {project.createdAt && (
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                                        Added {new Date(project.createdAt).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Achievements */}
            {user.profile?.achievements?.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                            <TrophyIcon className="h-5 w-5 mr-2 text-yellow-500" />
                            Achievements
                        </h3>
                        {isOwnProfile && (
                            <button className="text-sm text-blue-600 hover:text-blue-700">
                                Add Achievement
                            </button>
                        )}
                    </div>
                    <div className="space-y-4">
                        {user.profile.achievements.map((achievement, index) => (
                            <div key={index} className="flex items-start">
                                <div className="flex-shrink-0">
                                    <TrophyIcon className="h-5 w-5 text-yellow-500" />
                                </div>
                                <div className="ml-3 flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                            {achievement.title}
                                        </h4>
                                        {isOwnProfile && (
                                            <button className="text-gray-400 hover:text-red-500">
                                                ×
                                            </button>
                                        )}
                                    </div>
                                    {achievement.description && (
                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                            {achievement.description}
                                        </p>
                                    )}
                                    {achievement.date && (
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500 flex items-center">
                                            <CalendarIcon className="h-3 w-3 mr-1" />
                                            {new Date(achievement.date).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Hobbies */}
            {user.profile?.hobbies?.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                            <HeartIcon className="h-5 w-5 mr-2 text-red-500" />
                            Hobbies & Interests
                        </h3>
                        {isOwnProfile && (
                            <button className="text-sm text-blue-600 hover:text-blue-700">
                                Add Hobby
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {user.profile.hobbies.map((hobby, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm dark:bg-purple-900 dark:text-purple-200"
                            >
                                {hobby}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!user.profile?.bio && 
             !user.profile?.skills?.length && 
             !user.profile?.projects?.length && 
             !user.profile?.achievements?.length && 
             !user.profile?.hobbies?.length && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Portfolio is empty
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                        {isOwnProfile 
                            ? "Add your skills, projects, and achievements to showcase your work"
                            : "This user hasn't added any portfolio items yet"}
                    </p>
                    {isOwnProfile && (
                        <button
                            onClick={() => window.location.href = '/profile/edit'}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Complete Your Profile
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Portfolio;