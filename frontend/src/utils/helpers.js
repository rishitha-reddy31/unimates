import { formatDistanceToNow, format } from 'date-fns';

// Format date
export const formatDate = (date, formatStr = 'PPP') => {
    if (!date) return '';
    return format(new Date(date), formatStr);
};

// Format relative time
export const formatRelativeTime = (date) => {
    if (!date) return '';
    return formatDistanceToNow(new Date(date), { addSuffix: true });
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

// Generate random color
export const getRandomColor = () => {
    const colors = [
        'bg-red-500',
        'bg-blue-500',
        'bg-green-500',
        'bg-yellow-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-indigo-500',
        'bg-teal-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

// Get initials from name
export const getInitials = (name) => {
    if (!name) return '?';
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

// Format file size
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Debounce function
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle function
export const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
};

// Download file
export const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// Group array by key
export const groupBy = (array, key) => {
    return array.reduce((result, item) => {
        const groupKey = item[key];
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {});
};

// Sort array by date
export const sortByDate = (array, dateField = 'createdAt', ascending = false) => {
    return [...array].sort((a, b) => {
        const dateA = new Date(a[dateField]);
        const dateB = new Date(b[dateField]);
        return ascending ? dateA - dateB : dateB - dateA;
    });
};

// Validate email
export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Validate college email
export const validateCollegeEmail = (email, domain = 'college.edu') => {
    if (!validateEmail(email)) return false;
    const emailDomain = email.split('@')[1];
    return emailDomain === domain;
};

// Extract mentions from text
export const extractMentions = (text) => {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
        mentions.push(match[1]);
    }
    return mentions;
};

// Extract hashtags from text
export const extractHashtags = (text) => {
    const hashtagRegex = /#(\w+)/g;
    const hashtags = [];
    let match;
    while ((match = hashtagRegex.exec(text)) !== null) {
        hashtags.push(match[1]);
    }
    return hashtags;
};

// Generate unique ID
export const generateId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Check if object is empty
export const isEmpty = (obj) => {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};

// Deep clone object
export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

// Scroll to element
export const scrollToElement = (elementId, offset = 0) => {
    const element = document.getElementById(elementId);
    if (element) {
        const y = element.getBoundingClientRect().top + window.pageYOffset + offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
};

// Detect mobile device
export const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Get error message from API response
export const getErrorMessage = (error) => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    if (error.message) {
        return error.message;
    }
    return 'An unexpected error occurred';
};