// scripts/verify-profile.js
const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');

async function verifyProfile(userId) {
  try {
    console.log('🔍 Verifying profile for user:', userId);
    
    const user = await User.findByPk(userId, {
      attributes: { 
        exclude: ['password', 'refreshToken', 'verificationToken', 'resetPasswordToken', 'resetPasswordExpire'] 
      }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('\n📊 User Data from Database:');
    console.log('========================');
    console.log('ID:', user.id);
    console.log('Full Name:', user.fullName);
    console.log('Username:', user.username);
    console.log('Bio:', user.bio);
    console.log('Branch:', user.branch);
    console.log('Year:', user.year);
    console.log('Phone:', user.phoneNumber);
    console.log('Profile Picture:', user.profilePicture);
    console.log('\n📦 Skills:', user.skills);
    console.log('🎯 Interests:', user.interests);
    console.log('🎨 Hobbies:', user.hobbies);
    console.log('📁 Projects:', user.projects?.length || 0);
    console.log('🏆 Achievements:', user.achievements?.length || 0);
    
    if (user.projects?.length > 0) {
      console.log('\n📁 Projects Details:');
      user.projects.forEach((p, i) => {
        console.log(`  ${i+1}. ${p.title} - ${p.description?.substring(0, 50)}...`);
      });
    }
    
    if (user.achievements?.length > 0) {
      console.log('\n🏆 Achievements Details:');
      user.achievements.forEach((a, i) => {
        console.log(`  ${i+1}. ${a.title} - ${a.date || 'No date'}`);
      });
    }
    
    console.log('\n✅ Verification complete');
    
  } catch (error) {
    console.error('❌ Verification error:', error);
  } finally {
    await sequelize.close();
  }
}

// Get user ID from command line
const userId = process.argv[2];
if (!userId) {
  console.log('Please provide a user ID');
  console.log('Usage: node scripts/verify-profile.js <userId>');
  process.exit(1);
}

verifyProfile(userId);