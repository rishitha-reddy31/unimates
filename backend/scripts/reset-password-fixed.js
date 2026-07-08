const { sequelize, User } = require('../src/models');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const resetPasswordFixed = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    const user = await User.findOne({ 
      where: { email: '23n31a05w9@mrcet.ac.in' }
    });

    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('✅ User found:', user.email);
    console.log('Current hash:', user.password);

    // Set a very simple password
    const newPassword = 'password123'; // Simple password
    
    // Hash with explicit salt rounds
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    console.log('New hash:', hashedPassword);
    
    // Verify the hash works before saving
    const verifyBeforeSave = await bcrypt.compare(newPassword, hashedPassword);
    console.log('Verification before save:', verifyBeforeSave);
    
    if (!verifyBeforeSave) {
      console.log('❌ Hash verification failed before save!');
      process.exit(1);
    }
    
    // Update user
    user.password = hashedPassword;
    await user.save();
    
    // Fetch the user again to verify
    const updatedUser = await User.findOne({ 
      where: { email: '23n31a05w9@mrcet.ac.in' }
    });
    
    console.log('Hash after save:', updatedUser.password);
    
    // Final verification
    const finalVerify = await bcrypt.compare(newPassword, updatedUser.password);
    console.log('Final verification:', finalVerify);
    
    if (finalVerify) {
      console.log('\n✅ Password reset successful!');
      console.log('Email:', user.email);
      console.log('New password:', newPassword);
    } else {
      console.log('\n❌ Password reset failed - verification failed after save');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

resetPasswordFixed();