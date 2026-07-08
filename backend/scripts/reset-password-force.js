const { sequelize, User } = require('../src/models');
const bcrypt = require('bcryptjs');
const { QueryTypes } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const resetPasswordForce = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // First, find the user
    const user = await User.findOne({ 
      where: { email: '23n31a05y3@mrcet.ac.in' }
    });

    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('✅ User found:', user.email);
    console.log('User ID:', user.id);
    
    const newPassword = 'sai123';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    console.log('Generated hash:', hashedPassword);
    
    // Method 1: Direct SQL update (bypasses Sequelize hooks)
    console.log('\n🔧 Updating password via direct SQL...');
    
    await sequelize.query(
      'UPDATE "Users" SET password = :password, "updatedAt" = NOW() WHERE id = :id',
      {
        replacements: { password: hashedPassword, id: user.id },
        type: QueryTypes.UPDATE
      }
    );
    
    console.log('✅ Password updated via SQL');
    
    // Verify the update
    const [results] = await sequelize.query(
      'SELECT id, email, password FROM "Users" WHERE id = :id',
      {
        replacements: { id: user.id },
        type: QueryTypes.SELECT
      }
    );
    
    console.log('Hash in DB after SQL update:', results.password);
    
    // Test the password
    const verify = await bcrypt.compare(newPassword, results.password);
    console.log('Password verification after SQL update:', verify);
    
    if (verify) {
      console.log('\n✅ SUCCESS! Password reset successful!');
      console.log('Email:', user.email);
      console.log('New password:', newPassword);
    } else {
      console.log('\n❌ Password verification failed');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

resetPasswordForce();