import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { userService } from '../../services/user';
import { postService } from '../../services/post';
import { groupService } from '../../services/group';
import { forumService } from '../../services/forum';
import LoadingSpinner from '../common/LoadingSpinner';
import UserCard from '../search/UserCard';
import PostCard from '../feed/PostCard';
import GroupCard from '../groups/GroupCard';
import ForumThread from '../forums/ForumThread';
import {
    MagnifyingGlassIcon,
    UserGroupIcon,
    DocumentTextIcon,
    AcademicCapIcon,
    UserIcon,
    FunnelIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { useDebounce } from '../../hooks/useDebounce';

const Search = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [activeTab, setActiveTab] = useState('all');
    const [filters, setFilters] = useState({
        branch: '',
        year: '',
        category: '',
        sortBy: 'relevance'
    });
    const [showFilters, setShowFilters] = useState(false);

    const debouncedQuery = useDebounce(query, 500);

    // Update URL when query changes
    useEffect(() => {
        if (debouncedQuery) {
            setSearchParams({ q: debouncedQuery, tab: activeTab, ...filters });
        }
    }, [debouncedQuery, activeTab, filters, setSearchParams]);

    // Search users
    const { data: usersData, isLoading: usersLoading } = useQuery(
        ['search-users', debouncedQuery, filters.branch, filters.year],
        () => userService.searchUsers(debouncedQuery, filters.branch, filters.year),
        {
            enabled: debouncedQuery.length > 0 && (activeTab === 'all' || activeTab === 'users'),
            staleTime: 30000
        }
    );

    // Search posts
    const { data: postsData, isLoading: postsLoading } = useQuery(
        ['search-posts', debouncedQuery, filters.sortBy],
        () => postService.searchPosts(debouncedQuery, filters.sortBy),
        {
            enabled: debouncedQuery.length > 0 && (activeTab === 'all' || activeTab === 'posts'),
            staleTime: 30000
        }
    );

    // Search groups
    const { data: groupsData, isLoading: groupsLoading } = useQuery(
        ['search-groups', debouncedQuery, filters.category],
        () => groupService.getGroups(filters.category, debouncedQuery),
        {
            enabled: debouncedQuery.length > 0 && (activeTab === 'all' || activeTab === 'groups'),
            staleTime: 30000
        }
    );

    // Search forums
    const { data: forumsData, isLoading: forumsLoading } = useQuery(
        ['search-forums', debouncedQuery, filters.category],
        () => forumService.searchThreads(debouncedQuery, filters.category),
        {
            enabled: debouncedQuery.length > 0 && (activeTab === 'all' || activeTab === 'forums'),
            staleTime: 30000
        }
    );

    const users = usersData?.data?.users || [];
    const posts = postsData?.data?.posts || [];
    const groups = groupsData?.data?.groups || [];
    const forums = forumsData?.data?.threads || [];

    const tabs = [
        { id: 'all', name: 'All', icon: MagnifyingGlassIcon },
        { id: 'users', name: 'Users', icon: UserIcon },
        { id: 'posts', name: 'Posts', icon: DocumentTextIcon },
        { id: 'groups', name: 'Groups', icon: UserGroupIcon },
        { id: 'forums', name: 'Forums', icon: AcademicCapIcon }
    ];

    const branches = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'OTHER'];
    const years = ['1st', '2nd', '3rd', '4th', '5th'];
    const groupCategories = ['STUDY', 'CODING', 'PROJECT', 'PLACEMENT', 'INTERNSHIP', 'CULTURAL', 'SPORTS', 'OTHER'];
    const forumCategories = ['ACADEMICS', 'CODING', 'PLACEMENTS', 'PROJECTS', 'INTERNSHIPS', 'GENERAL'];

    const clearFilters = () => {
        setFilters({
            branch: '',
            year: '',
            category: '',
            sortBy: 'relevance'
        });
    };

    const getResultCount = () => {
        if (activeTab === 'all') {
            return users.length + posts.length + groups.length + forums.length;
        }
        switch (activeTab) {
            case 'users': return users.length;
            case 'posts': return posts.length;
            case 'groups': return groups.length;
            case 'forums': return forums.length;
            default: return 0;
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Search Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Search
                </h1>
                
                {/* Search Input */}
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search users, posts, groups, forums..."
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-lg"
                        autoFocus
                    />
                </div>
            </div>

            {query ? (
                <>
                    {/* Tabs */}
                    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                        <nav className="-mb-px flex space-x-8 overflow-x-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                                    }`}
                                >
                                    <tab.icon className="h-5 w-5 mr-2" />
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Filters Bar */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Found <span className="font-semibold">{getResultCount()}</span> results
                                {debouncedQuery && ` for "${debouncedQuery}"`}
                            </p>
                            
                            {(filters.branch || filters.year || filters.category) && (
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-red-600 hover:text-red-700 flex items-center"
                                >
                                    <XMarkIcon className="h-4 w-4 mr-1" />
                                    Clear filters
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            <FunnelIcon className="h-4 w-4 mr-2" />
                            Filters
                        </button>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Branch Filter (Users) */}
                                {(activeTab === 'all' || activeTab === 'users') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Branch
                                        </label>
                                        <select
                                            value={filters.branch}
                                            onChange={(e) => setFilters({ ...filters, branch: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">All Branches</option>
                                            {branches.map(branch => (
                                                <option key={branch} value={branch}>{branch}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Year Filter (Users) */}
                                {(activeTab === 'all' || activeTab === 'users') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Year
                                        </label>
                                        <select
                                            value={filters.year}
                                            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">All Years</option>
                                            {years.map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Category Filter (Groups/Forums) */}
                                {(activeTab === 'all' || activeTab === 'groups' || activeTab === 'forums') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Category
                                        </label>
                                        <select
                                            value={filters.category}
                                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">All Categories</option>
                                            {activeTab === 'groups' || activeTab === 'all' 
                                                ? groupCategories.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))
                                                : forumCategories.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                )}

                                {/* Sort By (Posts) */}
                                {(activeTab === 'all' || activeTab === 'posts') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Sort By
                                        </label>
                                        <select
                                            value={filters.sortBy}
                                            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="relevance">Relevance</option>
                                            <option value="recent">Most Recent</option>
                                            <option value="popular">Most Popular</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    <div className="space-y-8">
                        {/* Users Results */}
                        {(activeTab === 'all' || activeTab === 'users') && (
                            <div>
                                {activeTab === 'all' && users.length > 0 && (
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                        Users
                                    </h2>
                                )}
                                {usersLoading ? (
                                    <div className="flex justify-center py-8">
                                        <LoadingSpinner size="md" />
                                    </div>
                                ) : users.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {users.map(user => (
                                            <UserCard key={user._id} user={user} />
                                        ))}
                                    </div>
                                ) : (
                                    activeTab === 'users' && (
                                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                            No users found
                                        </p>
                                    )
                                )}
                                {activeTab === 'all' && users.length > 0 && (
                                    <div className="mt-4 text-center">
                                        <button
                                            onClick={() => setActiveTab('users')}
                                            className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            View all {users.length} users →
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Posts Results */}
                        {(activeTab === 'all' || activeTab === 'posts') && (
                            <div>
                                {activeTab === 'all' && posts.length > 0 && (
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                        Posts
                                    </h2>
                                )}
                                {postsLoading ? (
                                    <div className="flex justify-center py-8">
                                        <LoadingSpinner size="md" />
                                    </div>
                                ) : posts.length > 0 ? (
                                    <div className="space-y-4">
                                        {posts.map(post => (
                                            <PostCard key={post._id} post={post} />
                                        ))}
                                    </div>
                                ) : (
                                    activeTab === 'posts' && (
                                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                            No posts found
                                        </p>
                                    )
                                )}
                                {activeTab === 'all' && posts.length > 0 && (
                                    <div className="mt-4 text-center">
                                        <button
                                            onClick={() => setActiveTab('posts')}
                                            className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            View all {posts.length} posts →
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Groups Results */}
                        {(activeTab === 'all' || activeTab === 'groups') && (
                            <div>
                                {activeTab === 'all' && groups.length > 0 && (
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                        Groups
                                    </h2>
                                )}
                                {groupsLoading ? (
                                    <div className="flex justify-center py-8">
                                        <LoadingSpinner size="md" />
                                    </div>
                                ) : groups.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {groups.map(group => (
                                            <GroupCard key={group._id} group={group} />
                                        ))}
                                    </div>
                                ) : (
                                    activeTab === 'groups' && (
                                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                            No groups found
                                        </p>
                                    )
                                )}
                                {activeTab === 'all' && groups.length > 0 && (
                                    <div className="mt-4 text-center">
                                        <button
                                            onClick={() => setActiveTab('groups')}
                                            className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            View all {groups.length} groups →
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Forums Results */}
                        {(activeTab === 'all' || activeTab === 'forums') && (
                            <div>
                                {activeTab === 'all' && forums.length > 0 && (
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                                        Forums
                                    </h2>
                                )}
                                {forumsLoading ? (
                                    <div className="flex justify-center py-8">
                                        <LoadingSpinner size="md" />
                                    </div>
                                ) : forums.length > 0 ? (
                                    <div className="space-y-4">
                                        {forums.map(thread => (
                                            <ForumThread key={thread._id} thread={thread} isPreview />
                                        ))}
                                    </div>
                                ) : (
                                    activeTab === 'forums' && (
                                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                            No forum threads found
                                        </p>
                                    )
                                )}
                                {activeTab === 'all' && forums.length > 0 && (
                                    <div className="mt-4 text-center">
                                        <button
                                            onClick={() => setActiveTab('forums')}
                                            className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            View all {forums.length} threads →
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* Empty State - No Query */
                <div className="text-center py-12">
                    <MagnifyingGlassIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Search for anything
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Find users, posts, groups, and forum discussions
                    </p>
                </div>
            )}
        </div>
    );
};

export default Search;
