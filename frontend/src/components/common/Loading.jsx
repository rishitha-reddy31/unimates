import React from 'react';

// Main Loading Spinner Component
const Loading = ({ 
    size = 'md', 
    color = 'primary', 
    fullScreen = false,
    text = 'Loading...',
    showText = true,
    className = '',
    overlay = false
}) => {
    // Size configurations
    const sizeClasses = {
        xs: 'h-3 w-3 border',
        sm: 'h-5 w-5 border-2',
        md: 'h-8 w-8 border-2',
        lg: 'h-12 w-12 border-3',
        xl: 'h-16 w-16 border-4',
        '2xl': 'h-24 w-24 border-4'
    };

    // Color configurations
    const colorClasses = {
        primary: 'border-blue-600 dark:border-blue-500',
        secondary: 'border-purple-600 dark:border-purple-500',
        success: 'border-green-600 dark:border-green-500',
        danger: 'border-red-600 dark:border-red-500',
        warning: 'border-yellow-600 dark:border-yellow-500',
        info: 'border-cyan-600 dark:border-cyan-500',
        light: 'border-gray-600 dark:border-gray-400',
        dark: 'border-gray-900 dark:border-gray-100',
        white: 'border-white',
        gray: 'border-gray-500 dark:border-gray-400'
    };

    const spinner = (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div
                className={`
                    ${sizeClasses[size] || sizeClasses.md} 
                    ${colorClasses[color] || colorClasses.primary}
                    rounded-full border-t-transparent animate-spin
                    transition-all duration-300
                `}
                role="status"
                aria-label="loading"
            />
            {showText && (
                <p className={`
                    mt-3 text-sm font-medium
                    ${color === 'white' ? 'text-white' : `text-${color}-600 dark:text-${color}-400`}
                    animate-pulse
                `}>
                    {text}
                </p>
            )}
        </div>
    );

    // Full screen loading with overlay
    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center z-50">
                {overlay && (
                    <div className="absolute inset-0 bg-white dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90 backdrop-blur-sm" />
                )}
                <div className="relative z-10">
                    {spinner}
                </div>
            </div>
        );
    }

    return spinner;
};

// Page Loader - For route transitions
export const PageLoader = () => {
    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Loading size="lg" text="Loading page..." />
        </div>
    );
};

// Content Loader - For inline content loading
export const ContentLoader = ({ height = '200px' }) => {
    return (
        <div 
            className="w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg"
            style={{ height }}
        >
            <Loading size="md" text="Loading content..." />
        </div>
    );
};

// Button Loader - For loading states within buttons
export const ButtonLoader = ({ size = 'sm', color = 'white' }) => {
    return (
        <Loading 
            size={size} 
            color={color} 
            showText={false} 
            className="inline-flex"
        />
    );
};

// Dots Loader - For chat typing indicator
export const DotsLoader = () => {
    return (
        <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
    );
};

// Pulse Loader - For card loaders
export const PulseLoader = () => {
    return (
        <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-600 dark:bg-blue-500 rounded-full animate-pulse" />
            <div className="w-3 h-3 bg-blue-600 dark:bg-blue-500 rounded-full animate-pulse animation-delay-200" />
            <div className="w-3 h-3 bg-blue-600 dark:bg-blue-500 rounded-full animate-pulse animation-delay-400" />
        </div>
    );
};

// Progress Loader - For file uploads
export const ProgressLoader = ({ progress = 0, showPercentage = true }) => {
    return (
        <div className="w-full">
            <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Uploading...
                </span>
                {showPercentage && (
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {progress}%
                    </span>
                )}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                    className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

// Skeleton Loader Components
export const Skeleton = ({ className = '', animation = true }) => {
    return (
        <div 
            className={`
                bg-gray-200 dark:bg-gray-700 rounded
                ${animation ? 'animate-pulse' : ''}
                ${className}
            `}
        />
    );
};

// Post Skeleton Loader
export const PostSkeleton = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center space-x-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/6" />
                </div>
            </div>
            
            {/* Content */}
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
            </div>
            
            {/* Image Placeholder */}
            <Skeleton className="h-64 w-full rounded-lg" />
            
            {/* Actions */}
            <div className="flex space-x-4 pt-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
            </div>
        </div>
    );
};

// Profile Skeleton Loader
export const ProfileSkeleton = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {/* Cover */}
            <Skeleton className="h-48 w-full" />
            
            {/* Avatar and Info */}
            <div className="px-6 py-4">
                <div className="flex items-end -mt-12 mb-4">
                    <Skeleton className="h-24 w-24 rounded-full border-4 border-white dark:border-gray-800" />
                    <div className="ml-4 flex-1 space-y-2">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                </div>
                
                {/* Bio */}
                <div className="space-y-2 mt-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                </div>
                
                {/* Stats */}
                <div className="flex space-x-6 mt-6">
                    <Skeleton className="h-10 w-16" />
                    <Skeleton className="h-10 w-16" />
                    <Skeleton className="h-10 w-16" />
                </div>
            </div>
        </div>
    );
};

// Chat Skeleton Loader
export const ChatSkeleton = () => {
    return (
        <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-80 border-r border-gray-200 dark:border-gray-700 p-4 space-y-4">
                <Skeleton className="h-10 w-full rounded-lg" />
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <Skeleton className="h-12 w-1/3 rounded-lg" />
                </div>
                
                {/* Messages */}
                <div className="flex-1 p-4 space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                            <Skeleton className={`h-16 w-64 ${i % 2 === 0 ? 'rounded-l-lg rounded-tr-lg' : 'rounded-r-lg rounded-tl-lg'}`} />
                        </div>
                    ))}
                </div>
                
                {/* Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <Skeleton className="h-12 w-full rounded-lg" />
                </div>
            </div>
        </div>
    );
};

// Group Card Skeleton
export const GroupSkeleton = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <Skeleton className="h-32 w-full" />
            <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex justify-between pt-2">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                </div>
            </div>
        </div>
    );
};

// Forum Thread Skeleton
export const ForumSkeleton = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-4 w-24" />
            </div>
        </div>
    );
};

// Event Card Skeleton
export const EventSkeleton = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
            <Skeleton className="h-6 w-2/3" />
            <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex justify-between pt-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
            </div>
        </div>
    );
};

// Comment Skeleton
export const CommentSkeleton = () => {
    return (
        <div className="flex space-x-3 py-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
        </div>
    );
};

// Dashboard Stats Skeleton
export const DashboardSkeleton = () => {
    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex items-center space-x-4">
                            <Skeleton className="h-12 w-12 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-6 w-1/3" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <Skeleton className="h-6 w-1/3 mb-4" />
                    <Skeleton className="h-64 w-full" />
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <Skeleton className="h-6 w-1/3 mb-4" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        </div>
    );
};

// Table Row Skeleton
export const TableRowSkeleton = ({ columns = 5 }) => {
    return (
        <div className="flex items-center space-x-4 py-4 px-6 border-b border-gray-200 dark:border-gray-700">
            {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
            ))}
        </div>
    );
};

// Card Grid Skeleton
export const CardGridSkeleton = ({ count = 6, CardComponent = GroupSkeleton }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <CardComponent key={i} />
            ))}
        </div>
    );
};

// Export default Loading component
export default Loading;