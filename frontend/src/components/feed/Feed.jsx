// frontend/src/components/feed/Feed.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useInfiniteQuery } from 'react-query';
import { useAuth } from '../../hooks/useAuth';
import { postService } from '../../services/post';
import CreatePost from './CreatePost';
import Post from './Post';
import LoadingSpinner from '../common/LoadingSpinner';
import { CameraIcon, VideoCameraIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Feed = () => {
  const { user } = useAuth();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const loadMoreRef = useRef(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch
  } = useInfiniteQuery(
    'feed',
    ({ pageParam = 1 }) => postService.getFeed(pageParam, 10),
    {
      getNextPageParam: (lastPage) => {
        const { page, pages } = lastPage.data.pagination;
        return page < pages ? page + 1 : undefined;
      },
      onError: (error) => {
        console.error('Error fetching feed:', error);
        toast.error('Failed to load feed');
      }
    }
  );

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap(page => page.data.posts) || [];

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Create Post Button */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center space-x-3">
          <img
            src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.username)}&background=2563eb&color=fff&size=40`}
            alt={user?.fullName}
            className="h-10 w-10 rounded-full"
          />
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex-1 text-left px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            What's on your mind?
          </button>
          <button
            onClick={() => setShowCreatePost(true)}
            className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400"
            title="Add photo"
          >
            <CameraIcon className="h-6 w-6" />
          </button>
          <button
            onClick={() => setShowCreatePost(true)}
            className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400"
            title="Add video"
          >
            <VideoCameraIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Posts Feed */}
      {posts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No posts yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Be the first to share something with your college!
          </p>
        </div>
      ) : (
        <>
          {posts.map(post => (
            <Post key={post.id} post={post} onUpdate={refetch} />
          ))}
          
          {/* Load more trigger */}
          <div ref={loadMoreRef} className="py-4 text-center">
            {isFetchingNextPage && <LoadingSpinner size="md" />}
          </div>
        </>
      )}

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePost
          onClose={() => setShowCreatePost(false)}
          onSuccess={() => {
            refetch();
            setShowCreatePost(false);
          }}
        />
      )}
    </div>
  );
};

export default Feed;