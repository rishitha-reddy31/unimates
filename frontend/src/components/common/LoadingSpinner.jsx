import React from 'react';

const LoadingSpinner = ({ 
    size = 'md', 
    color = 'blue', 
    fullScreen = false,
    text = 'Loading...',
    showText = true
}) => {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-3',
        lg: 'h-12 w-12 border-4',
        xl: 'h-16 w-16 border-4'
    };

    const colorClasses = {
        blue: 'border-blue-500',
        gray: 'border-gray-500',
        green: 'border-green-500',
        red: 'border-red-500',
        yellow: 'border-yellow-500',
        purple: 'border-purple-500',
        white: 'border-white'
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center">
            <div
                className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full border-t-transparent animate-spin`}
                role="status"
                aria-label="loading"
            />
            {showText && (
                <p className={`mt-3 text-${color}-600 dark:text-${color}-400 text-sm font-medium`}>
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;

// Skeleton Loader Components
export const SkeletonLoader = ({ className }) => {
    return (
        <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
    );
};

export const PostSkeleton = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
                <SkeletonLoader className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                    <SkeletonLoader className="h-4 w-1/4 mb-2" />
                    <SkeletonLoader className="h-3 w-1/6" />
                </div>
            </div>
            <SkeletonLoader className="h-4 w-full mb-2" />
            <SkeletonLoader className="h-4 w-5/6 mb-2" />
            <SkeletonLoader className="h-4 w-4/6 mb-4" />
            <SkeletonLoader className="h-48 w-full rounded-lg mb-4" />
            <div className="flex space-x-4">
                <SkeletonLoader className="h-8 w-20" />
                <SkeletonLoader className="h-8 w-20" />
                <SkeletonLoader className="h-8 w-20" />
            </div>
        </div>
    );
};

export const ProfileSkeleton = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <SkeletonLoader className="h-48 w-full" />
            <div className="px-6 py-4">
                <div className="flex items-center -mt-12 mb-4">
                    <SkeletonLoader className="h-24 w-24 rounded-full border-4 border-white dark:border-gray-800" />
                    <div className="ml-4 flex-1">
                        <SkeletonLoader className="h-6 w-1/3 mb-2" />
                        <SkeletonLoader className="h-4 w-1/4" />
                    </div>
                </div>
                <SkeletonLoader className="h-4 w-full mb-2" />
                <SkeletonLoader className="h-4 w-5/6 mb-2" />
                <SkeletonLoader className="h-4 w-4/6" />
            </div>
        </div>
    );
};

export const ChatSkeleton = () => {
    return (
        <div className="flex h-full">
            <div className="w-80 border-r border-gray-200 dark:border-gray-700 p-4">
                <SkeletonLoader className="h-10 w-full mb-4" />
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-3 mb-4">
                        <SkeletonLoader className="h-10 w-10 rounded-full" />
                        <div className="flex-1">
                            <SkeletonLoader className="h-4 w-3/4 mb-2" />
                            <SkeletonLoader className="h-3 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <SkeletonLoader className="h-10 w-1/3" />
                </div>
                <div className="flex-1 p-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'} mb-4`}>
                            <SkeletonLoader className={`h-16 w-64 ${i % 2 === 0 ? 'rounded-l-lg rounded-tr-lg' : 'rounded-r-lg rounded-tl-lg'}`} />
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <SkeletonLoader className="h-12 w-full" />
                </div>
            </div>
        </div>
    );
};

export const GroupSkeleton = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <SkeletonLoader className="h-32 w-full" />
            <div className="p-6">
                <SkeletonLoader className="h-6 w-3/4 mb-2" />
                <SkeletonLoader className="h-4 w-1/2 mb-4" />
                <SkeletonLoader className="h-4 w-full mb-2" />
                <SkeletonLoader className="h-4 w-5/6 mb-4" />
                <div className="flex items-center justify-between">
                    <SkeletonLoader className="h-8 w-24" />
                    <SkeletonLoader className="h-8 w-24" />
                </div>
            </div>
        </div>
    );
};