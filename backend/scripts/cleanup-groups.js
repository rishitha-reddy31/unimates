// scripts/cleanup-groups.js
const { sequelize } = require('../src/config/database');
const Group = require('../src/models/Group');
const GroupMember = require('../src/models/GroupMember');

async function cleanupGroups() {
  try {
    console.log('🔍 Starting group cleanup...');
    
    // First, check how many groups exist
    const groupCount = await Group.count();
    console.log(`📊 Found ${groupCount} groups in database`);
    
    if (groupCount > 0) {
      // Delete all group members first (though CASCADE should handle it)
      const memberCount = await GroupMember.count();
      console.log(`📊 Found ${memberCount} group members`);
      
      // Delete all groups (this will cascade to members)
      await Group.destroy({
        where: {},
        force: true // Force delete even if paranoid is true
      });
      
      console.log('✅ All groups deleted successfully');
    } else {
      console.log('✅ No groups to delete');
    }
    
    // Verify deletion
    const remainingGroups = await Group.count();
    const remainingMembers = await GroupMember.count();
    
    console.log(`📊 Remaining groups: ${remainingGroups}`);
    console.log(`📊 Remaining members: ${remainingMembers}`);
    
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

cleanupGroups();