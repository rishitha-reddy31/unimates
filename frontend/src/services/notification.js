import api from './api';

export const notificationService = {
    // Get notifications with pagination
    getNotifications: (page = 1, limit = 20) => 
        api.get('/notifications', { params: { page, limit } }),

    // Get unread count
    getUnreadCount: () => 
        api.get('/notifications/unread-count'),

    // Mark notification as read
    markAsRead: (notificationId) => 
        api.put(`/notifications/${notificationId}/read`),

    // Mark all notifications as read
    markAllAsRead: () => 
        api.put('/notifications/mark-all-read'),

    // Delete notification
    deleteNotification: (notificationId) => 
        api.delete(`/notifications/${notificationId}`)
};