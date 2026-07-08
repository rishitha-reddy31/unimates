import io from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    connect(token) {
        if (this.socket) {
            this.disconnect();
        }

        this.socket = io(process.env.REACT_APP_SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        this.setupListeners();
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.listeners.clear();
        }
    }

    setupListeners() {
        this.socket.on('connect', () => {
            console.log('Socket connected');
            this.emit('listener:connect', { connected: true });
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
            this.emit('listener:disconnect', { connected: false });
        });

        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            this.emit('listener:error', error);
        });

        // Message events
        this.socket.on('new-message', (message) => {
            this.emit('message:new', message);
        });

        this.socket.on('message-sent', (message) => {
            this.emit('message:sent', message);
        });

        this.socket.on('messages-read', (data) => {
            this.emit('message:read', data);
        });

        // Typing events
        this.socket.on('user-typing', (data) => {
            this.emit('typing:start', data);
        });

        this.socket.on('user-stopped-typing', (data) => {
            this.emit('typing:stop', data);
        });

        // User status events
        this.socket.on('user-online', (user) => {
            this.emit('user:online', user);
        });

        this.socket.on('user-offline', (user) => {
            this.emit('user:offline', user);
        });

        this.socket.on('online-users', (users) => {
            this.emit('user:list', users);
        });

        // Notification events
        this.socket.on('new-notification', (notification) => {
            this.emit('notification:new', notification);
        });

        // Group events
        this.socket.on('group-update', (group) => {
            this.emit('group:update', group);
        });

        this.socket.on('group-delete', (groupId) => {
            this.emit('group:delete', groupId);
        });
    }

    // Emit events
    emit(event, data) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }

    // Listen to events
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
        
        // Also listen on socket if it's a server event
        if (!event.startsWith('listener:')) {
            this.socket?.on(event, callback);
        }
    }

    // Remove listener
    off(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
        this.socket?.off(event, callback);
    }

    // Join chat room
    joinChat(userId) {
        this.emit('join-chat', { userId });
    }

    // Leave chat room
    leaveChat(userId) {
        this.emit('leave-chat', { userId });
    }

    // Send message
    sendMessage(receiverId, message, messageType = 'text') {
        this.emit('send-message', { receiverId, message, messageType });
    }

    // Send typing indicator
    sendTyping(receiverId, isTyping) {
        this.emit(isTyping ? 'typing' : 'stopped-typing', { receiverId });
    }

    // Mark messages as read
    markAsRead(senderId) {
        this.emit('mark-read', { senderId });
    }

    // Check if connected
    isConnected() {
        return this.socket?.connected || false;
    }

    // Get socket id
    getSocketId() {
        return this.socket?.id;
    }
}

export default new SocketService();