// scripts/reset-password.js
const { sequelize } = require('../src/config/database');
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  try {
    const email = '23n31a05y3@mrcet.ac.in';
    const newPassword = 'sai123'; // Change this to whatever password you want
    
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password directly (bypassing hooks if needed)
    await sequelize.query(
      `UPDATE "Users" SET password = '${hashedPassword}' WHERE email = '${email}'`
    );
    
    console.log(`✅ Password reset for ${email} to: ${newPassword}`);
    console.log(`Hashed: ${hashedPassword}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

resetPassword();