export const BRANCHES = [
    'CSE',
    'ECE',
    'ME',
    'CE',
    'EE',
    'IT',
    'OTHER'
];

export const YEARS = [
    '1st',
    '2nd',
    '3rd',
    '4th',
    '5th'
];

export const GROUP_CATEGORIES = [
    { id: 'STUDY', name: 'Study Group', icon: '📚' },
    { id: 'CODING', name: 'Coding', icon: '💻' },
    { id: 'PROJECT', name: 'Project Collaboration', icon: '🤝' },
    { id: 'PLACEMENT', name: 'Placement Preparation', icon: '🎯' },
    { id: 'INTERNSHIP', name: 'Internship', icon: '💼' },
    { id: 'CULTURAL', name: 'Cultural', icon: '🎨' },
    { id: 'SPORTS', name: 'Sports', icon: '⚽' },
    { id: 'OTHER', name: 'Other', icon: '✨' }
];

export const FORUM_CATEGORIES = [
    { id: 'ACADEMICS', name: 'Academics', icon: '📖' },
    { id: 'CODING', name: 'Coding', icon: '💻' },
    { id: 'PLACEMENTS', name: 'Placements', icon: '🎯' },
    { id: 'PROJECTS', name: 'Projects', icon: '🚀' },
    { id: 'INTERNSHIPS', name: 'Internships', icon: '💼' },
    { id: 'GENERAL', name: 'General', icon: '💬' }
];

export const EVENT_CATEGORIES = [
    { id: 'ACADEMIC', name: 'Academic', icon: '📚' },
    { id: 'CULTURAL', name: 'Cultural', icon: '🎨' },
    { id: 'TECHNICAL', name: 'Technical', icon: '⚙️' },
    { id: 'SPORTS', name: 'Sports', icon: '⚽' },
    { id: 'WORKSHOP', name: 'Workshop', icon: '🔧' },
    { id: 'SEMINAR', name: 'Seminar', icon: '🎤' },
    { id: 'OTHER', name: 'Other', icon: '✨' }
];

export const ANONYMOUS_CATEGORIES = [
    { id: 'CAMPUS', name: 'Campus Life', icon: '🏛️' },
    { id: 'ACADEMIC', name: 'Academic', icon: '📚' },
    { id: 'PLACEMENT', name: 'Placement', icon: '🎯' },
    { id: 'GENERAL', name: 'General', icon: '💬' },
    { id: 'HOSTEL', name: 'Hostel', icon: '🏠' },
    { id: 'CANTEEN', name: 'Canteen', icon: '🍽️' },
    { id: 'LIBRARY', name: 'Library', icon: '📖' }
];

export const REPORT_REASONS = [
    { id: 'SPAM', name: 'Spam', description: 'Unsolicited promotional content' },
    { id: 'HARASSMENT', name: 'Harassment', description: 'Bullying or targeted harassment' },
    { id: 'HATE_SPEECH', name: 'Hate Speech', description: 'Discriminatory or offensive content' },
    { id: 'INAPPROPRIATE', name: 'Inappropriate', description: 'Explicit or offensive content' },
    { id: 'FAKE_NEWS', name: 'Fake News', description: 'Misleading or false information' },
    { id: 'OTHER', name: 'Other', description: 'Other violation' }
];

export const NOTIFICATION_TYPES = {
    LIKE: 'like',
    COMMENT: 'comment',
    MENTION: 'mention',
    MESSAGE: 'message',
    FRIEND_REQUEST: 'friend_request',
    GROUP_INVITE: 'group_invite',
    EVENT: 'event',
    SYSTEM: 'system',
    REPORT_UPDATE: 'report_update'
};

export const POST_PRIVACY = [
    { id: 'public', name: 'Public', description: 'Everyone can see' },
    { id: 'private', name: 'Private', description: 'Only followers can see' },
    { id: 'friends', name: 'Friends', description: 'Only people you follow can see' }
];

export const COLLEGE_DOMAIN = process.env.REACT_APP_COLLEGE_DOMAIN || 'college.edu';

export const APP_NAME = process.env.REACT_APP_NAME || 'Unimates';
export const APP_VERSION = process.env.REACT_APP_VERSION || '1.0.0';

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        ME: '/auth/me'
    },
    USERS: {
        PROFILE: (id) => `/users/${id}`,
        UPDATE: '/users/update',
        PROFILE_PICTURE: '/users/profile-picture',
        PROJECTS: '/users/projects',
        PROJECT: (id) => `/users/projects/${id}`,
        FOLLOW: (id) => `/users/${id}/follow`,
        UNFOLLOW: (id) => `/users/${id}/unfollow`,
        BLOCK: (id) => `/users/${id}/block`,
        UNBLOCK: (id) => `/users/${id}/unblock`,
        SEARCH: '/users/search',
        RECOMMENDATIONS: '/users/recommendations'
    },
    POSTS: {
        CREATE: '/posts/create',
        FEED: '/posts/feed',
        POST: (id) => `/posts/${id}`,
        LIKE: (id) => `/posts/${id}/like`,
        COMMENT: (id) => `/posts/${id}/comment`,
        COMMENTS: (id) => `/posts/${id}/comments`
    },
    CHAT: {
        CONVERSATIONS: '/chat/conversations',
        MESSAGES: (id) => `/chat/${id}`,
        SEND: '/chat/send',
        MESSAGE: (id) => `/chat/${id}`
    },
    GROUPS: {
        CREATE: '/groups/create',
        LIST: '/groups',
        GROUP: (id) => `/groups/${id}`,
        JOIN: (id) => `/groups/${id}/join`,
        LEAVE: (id) => `/groups/${id}/leave`,
        RESOURCES: (id) => `/groups/${id}/resources`
    },
    FORUMS: {
        CREATE: '/forums/create',
        LIST: '/forums',
        THREAD: (id) => `/forums/${id}`,
        UPVOTE: (id) => `/forums/${id}/upvote`,
        DOWNVOTE: (id) => `/forums/${id}/downvote`,
        COMMENTS: (id) => `/forums/${id}/comments`,
        RESOLVE: (id) => `/forums/${id}/resolve`
    },
    EVENTS: {
        CREATE: '/events/create',
        LIST: '/events',
        EVENT: (id) => `/events/${id}`,
        ATTEND: (id) => `/events/${id}/attend`
    },
    ANONYMOUS: {
        CREATE: '/anonymous/create',
        LIST: '/anonymous/all',
        POST: (id) => `/anonymous/${id}`,
        REPLY: (id) => `/anonymous/${id}/reply`,
        REPORT: (id) => `/anonymous/${id}/report`
    },
    REPORTS: {
        CREATE: '/reports/create',
        LIST: '/reports',
        RESOLVE: (id) => `/reports/${id}/resolve`,
        DISMISS: (id) => `/reports/${id}/dismiss`
    },
    NOTIFICATIONS: {
        LIST: '/notifications',
        UNREAD: '/notifications/unread-count',
        READ: (id) => `/notifications/${id}/read`,
        READ_ALL: '/notifications/mark-all-read',
        DELETE: (id) => `/notifications/${id}`
    },
    ADMIN: {
        STATS: '/admin/stats',
        USERS: '/admin/users',
        USER_STATUS: (id) => `/admin/users/${id}/status`,
        USER_ROLE: (id) => `/admin/users/${id}/role`,
        DELETE_USER: (id) => `/admin/users/${id}`,
        FLAGGED: '/admin/flagged-content',
        LOGS: '/admin/logs'
    }
};