// backend/check-password.js
const { sequelize, User } = require('./src/models');
const bcrypt = require('bcryptjs');

async function checkPassword() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    const email = '23n31a05y3@mrcet.ac.in';
    
    // Get user with password
    const user = await User.findOne({
      where: { email },
      attributes: { include: ['password'] }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Full Name:', user.fullName);
    console.log('Password Hash:', user.password.substring(0, 20) + '...');
    console.log('Created At:', user.createdAt);
    console.log('Is Verified:', user.isVerified);
    console.log('');

    // Test the password
    const testPassword = 'tharuni123';
    const isValid = await bcrypt.compare(testPassword, user.password);
    
    console.log(`🔍 Testing password: "${testPassword}"`);
    console.log('Password valid?', isValid ? '✅ YES' : '❌ NO');

    if (!isValid) {
      console.log('\n⚠️ Password mismatch! Options:');
      console.log('1. You might have used a different password during registration');
      console.log('2. The password hash might be corrupted');
      console.log('3. Let\'s reset the password');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkPassword();