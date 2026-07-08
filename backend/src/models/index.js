// backend/src/models/index.js
const { sequelize } = require('../config/database');
const User = require('./User');
const College = require('./College');
const Post = require('./Post');
const Comment = require('./Comment');
const Message = require('./Message');
const Group = require('./Group');
const GroupMember = require('./GroupMember'); // Add this
const Forum = require('./Forum');
const ForumComment = require('./ForumComment');
const ForumMessage = require('./ForumMessage');
const Event = require('./Event');
const Follow = require('./Follow');
const FollowRequest = require('./FollowRequest');
const Notification = require('./Notification');
const Report = require('./Report');
const AnonymousPost = require('./AnonymousPost');
const MasterUser = require('./MasterUser');

// Define associations

// User associations
User.belongsTo(College, { foreignKey: 'collegeId' });
User.hasMany(Post, { foreignKey: 'authorId', as: 'posts' });
User.hasMany(Comment, { foreignKey: 'authorId', as: 'comments' });
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
User.hasMany(Forum, { 
  foreignKey: 'authorId', 
  as: 'forums',
  sourceKey: 'id'
});

User.hasMany(ForumComment, { 
  foreignKey: 'authorId', 
  as: 'forumComments',
  sourceKey: 'id'
});

User.hasMany(ForumMessage, { foreignKey: 'senderId', as: 'forumMessages' });

// Follow associations
User.belongsToMany(User, {
  through: Follow,
  as: 'following',
  foreignKey: 'followerId',
  otherKey: 'followingId'
});

User.belongsToMany(User, {
  through: Follow,
  as: 'followers',
  foreignKey: 'followingId',
  otherKey: 'followerId'
});

// Group associations
Group.belongsToMany(User, {
  through: GroupMember,
  foreignKey: 'groupId',
  otherKey: 'userId', // This should match the model field name
  as: 'members'
});

User.belongsToMany(Group, {
  through: GroupMember,
  foreignKey: 'userId', // This should match the model field name
  otherKey: 'groupId',
  as: 'joinedGroups'
});

Group.belongsTo(User, { as: 'creator', foreignKey: 'creatorId' });
Group.belongsTo(College, { foreignKey: 'collegeId' });
Group.hasMany(GroupMember, { foreignKey: 'groupId', as: 'memberRecords' });
User.hasMany(GroupMember, { foreignKey: 'userId', as: 'groupMemberships' });

// GroupMember associations
GroupMember.belongsTo(Group, { foreignKey: 'groupId', targetKey: 'id' });
GroupMember.belongsTo(User, { foreignKey: 'userId', targetKey: 'id' });

// College associations
College.hasMany(User, { foreignKey: 'collegeId' });
College.hasMany(Post, { foreignKey: 'collegeId' });
College.hasMany(Event, { foreignKey: 'collegeId' });
College.hasMany(Group, { foreignKey: 'collegeId' });

// Post associations
Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
Post.belongsTo(College, { foreignKey: 'collegeId' });
Post.hasMany(Comment, { foreignKey: 'postId', as: 'postComments' });
Post.belongsToMany(User, { through: 'PostLikes', foreignKey: 'postId', as: 'likedBy' });

// Comment associations
Comment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
Comment.belongsTo(Post, { foreignKey: 'postId' });
Comment.belongsTo(Comment, { as: 'parent', foreignKey: 'parentCommentId' });
Comment.hasMany(Comment, { as: 'childComments', foreignKey: 'parentCommentId' });

// Message associations
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });
Message.belongsTo(Group, { foreignKey: 'groupId' });

// Event associations
Event.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
Event.belongsTo(College, { foreignKey: 'collegeId' });
User.hasMany(Event, { foreignKey: 'createdBy', as: 'createdEvents' });

// Forum associations
Forum.belongsTo(User, { 
  as: 'author', 
  foreignKey: 'authorId',
  targetKey: 'id'
});

Forum.belongsTo(College, { 
  foreignKey: 'collegeId',
  targetKey: 'id'
});

Forum.hasMany(ForumComment, { 
  foreignKey: 'forumId', 
  as: 'forumComments',
  sourceKey: 'id'
});
Forum.hasMany(ForumMessage, { foreignKey: 'forumId', as: 'messages' });

// ForumComment associations
ForumComment.belongsTo(Forum, { 
  foreignKey: 'forumId',
  targetKey: 'id'
});

ForumComment.belongsTo(User, { 
  as: 'author', 
  foreignKey: 'authorId',
  targetKey: 'id'
});

ForumComment.belongsTo(ForumComment, { 
  as: 'parent', 
  foreignKey: 'parentCommentId',
  targetKey: 'id'
});

ForumComment.hasMany(ForumComment, { 
  as: 'replies', 
  foreignKey: 'parentCommentId',
  sourceKey: 'id'
});

// Add these associations
ForumMessage.belongsTo(Forum, { foreignKey: 'forumId' });
ForumMessage.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });

// Follow model associations
Follow.belongsTo(User, { as: 'follower', foreignKey: 'followerId' });
Follow.belongsTo(User, { as: 'following', foreignKey: 'followingId' });

// FollowRequest associations
FollowRequest.belongsTo(User, { as: 'requester', foreignKey: 'requesterId' });
FollowRequest.belongsTo(User, { as: 'recipient', foreignKey: 'recipientId' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'userId', as: 'recipient' });
Notification.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });

// Report associations  
Report.belongsTo(User, { as: 'reporter', foreignKey: 'reporterId' });
Report.belongsTo(User, { as: 'reportedUser', foreignKey: 'reportedUserId' });
Report.belongsTo(Post, { foreignKey: 'reportedPostId' });
Report.belongsTo(Comment, { foreignKey: 'reportedCommentId' });
Report.belongsTo(Forum, { foreignKey: 'reportedForumId' });
Report.belongsTo(AnonymousPost, { foreignKey: 'reportedAnonymousPostId' });
Report.belongsTo(MasterUser, { as: 'resolvedBy', foreignKey: 'resolvedById' });

// AnonymousPost associations
AnonymousPost.belongsTo(User, { foreignKey: 'createdBy' });
AnonymousPost.belongsTo(Post, { foreignKey: 'originalPostId' });
User.hasMany(AnonymousPost, { foreignKey: 'createdBy' });

// MasterUser associations
MasterUser.hasMany(Report, { as: 'assignedReports', foreignKey: 'assignedToId' });
MasterUser.hasMany(Report, { as: 'resolvedReports', foreignKey: 'resolvedById' });

// Export all models and sequelize
module.exports = {
  sequelize,
  User,
  College,
  Post,
  Comment,
  Message,
  Group,
  GroupMember, // Add this
  Forum,
  ForumComment,
  ForumMessage,
  Event,  
  Follow,
  FollowRequest,
  Notification,
  Report,
  AnonymousPost,
  MasterUser
};