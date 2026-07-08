const createIndexes = async () => {
    try {
        // User indexes
        await User.collection.createIndex({ email: 1 }, { unique: true });
        await User.collection.createIndex({ 'profile.name': 'text' });
        await User.collection.createIndex({ 'profile.branch': 1 });
        await User.collection.createIndex({ 'profile.year': 1 });
        await User.collection.createIndex({ 'profile.skills': 1 });
        await User.collection.createIndex({ createdAt: -1 });

        // Post indexes
        await Post.collection.createIndex({ createdAt: -1 });
        await Post.collection.createIndex({ createdBy: 1, createdAt: -1 });
        await Post.collection.createIndex({ isDeleted: 1 });
        await Post.collection.createIndex({ content: 'text' });

        // Message indexes
        await Message.collection.createIndex({ sender: 1, receiver: 1, createdAt: -1 });
        await Message.collection.createIndex({ receiver: 1, read: 1 });

        // Group indexes
        await Group.collection.createIndex({ name: 'text', description: 'text' });
        await Group.collection.createIndex({ category: 1 });
        await Group.collection.createIndex({ 'members.user': 1 });

        // Forum indexes
        await Forum.collection.createIndex({ title: 'text', content: 'text' });
        await Forum.collection.createIndex({ category: 1, createdAt: -1 });
        await Forum.collection.createIndex({ createdBy: 1 });

        // Event indexes
        await Event.collection.createIndex({ date: 1 });
        await Event.collection.createIndex({ category: 1, date: 1 });

        // Anonymous post indexes
        await AnonymousPost.collection.createIndex({ createdAt: -1 });
        await AnonymousPost.collection.createIndex({ category: 1, createdAt: -1 });
        await AnonymousPost.collection.createIndex({ reportsCount: 1 });

        // Notification indexes
        await Notification.collection.createIndex({ recipient: 1, createdAt: -1 });
        await Notification.collection.createIndex({ recipient: 1, read: 1 });

        console.log('✅ Database indexes created successfully');
    } catch (error) {
        console.error('❌ Error creating indexes:', error);
    }
};

module.exports = createIndexes;