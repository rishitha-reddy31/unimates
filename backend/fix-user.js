// backend/fix-user.js
const { sequelize, User } = require('./src/models');
const bcrypt = require('bcryptjs');

async function fixUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    const email = '23n31a05t8@mrcet.ac.in';
    const newPassword = 'tharuni123';

    // Find the user
    const user = await User.findOne({ 
      where: { email },
      attributes: { include: ['password'] }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ Found user:', user.email);
    console.log('Current hash:', user.password.substring(0, 20) + '...');

    // Generate new hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    console.log('New hash:', hashedPassword.substring(0, 20) + '...');

    // Update user
    user.password = hashedPassword;
    user.isVerified = true; // Auto-verify
    await user.save();

    console.log('\n✅ User updated successfully!');
    console.log('Email:', email);
    console.log('New password:', newPassword);
    console.log('Auto-verified: true');

    // Verify the new password works
    const verifyUser = await User.findOne({ 
      where: { email },
      attributes: { include: ['password'] }
    });
    
    const testValid = await bcrypt.compare(newPassword, verifyUser.password);
    console.log('\n🔍 Verification test:', testValid ? '✅ PASSED' : '❌ FAILED');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixUser();