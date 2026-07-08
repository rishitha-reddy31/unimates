const { sequelize, User, College, Post, Comment, Group, Forum, Event, Follow, FollowRequest, Notification, Report, AnonymousPost, MasterUser } = require('../src/models');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const resetDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL');

    // Delete in correct order (child tables first)
    console.log('🗑️ Deleting all data...');
    
    await Comment.destroy({ where: {} });
    console.log('✅ Comments deleted');
    
    await Post.destroy({ where: {} });
    console.log('✅ Posts deleted');
    
    await Follow.destroy({ where: {} });
    await FollowRequest.destroy({ where: {} });
    console.log('✅ Follows deleted');
    
    await Notification.destroy({ where: {} });
    console.log('✅ Notifications deleted');
    
    await Report.destroy({ where: {} });
    console.log('✅ Reports deleted');
    
    await AnonymousPost.destroy({ where: {} });
    console.log('✅ Anonymous posts deleted');
    
    await User.destroy({ where: {} });
    console.log('✅ Users deleted');
    
    await Group.destroy({ where: {} });
    await Forum.destroy({ where: {} });
    await Event.destroy({ where: {} });
    console.log('✅ Groups/Forums/Events deleted');
    
    await College.destroy({ where: {} });
    console.log('✅ Colleges deleted');
    
    await MasterUser.destroy({ where: {} });
    console.log('✅ Master users deleted');

    console.log('\n🎉 Database reset complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

resetDatabase();