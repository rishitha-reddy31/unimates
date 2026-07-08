// backend/sql-fix.js
const { sequelize } = require('./src/models');
const bcrypt = require('bcryptjs');
const { QueryTypes } = require('sequelize');

async function sqlFix() {
  try {
    console.log('='.repeat(50));
    console.log('🔧 PASSWORD FIX UTILITY');
    console.log('='.repeat(50));
    
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    const email = '23n31a05w9@mrcet.ac.in';
    const password = 'rishitha 123';
    
    // First, check if user exists
    console.log(`🔍 Checking if user exists: ${email}`);
    const [userCheck] = await sequelize.query(
      `SELECT id, email, "fullName" FROM "Users" WHERE email = :email`,
      {
        replacements: { email },
        type: QueryTypes.SELECT
      }
    );

    if (!userCheck) {
      console.log('❌ User not found with this email');
      
      // Show available users
      console.log('\n📋 Available users in database:');
      const users = await sequelize.query(
        `SELECT email, "fullName" FROM "Users" ORDER BY "createdAt" DESC LIMIT 5`,
        {
          type: QueryTypes.SELECT
        }
      );
      
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.fullName} - ${user.email}`);
      });
      
      process.exit(1);
    }

    console.log(`✅ Found user: ${userCheck.fullName} (${userCheck.id})\n`);
    
    // Generate hash
    console.log(`🔄 Generating hash for password: "${password}"`);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('📝 New hash:', hashedPassword);
    console.log('');

    // Direct SQL update
    console.log('🔄 Updating password in database...');
    await sequelize.query(
      `UPDATE "Users" 
       SET password = :password, 
           "isVerified" = true,
           "updatedAt" = NOW() 
       WHERE email = :email`,
      {
        replacements: { password: hashedPassword, email },
        type: QueryTypes.UPDATE
      }
    );

    console.log('✅ SQL Update completed\n');

    // Verify with direct SQL query
    console.log('🔍 Verifying update...');
    const [results] = await sequelize.query(
      `SELECT id, email, password FROM "Users" WHERE email = :email`,
      {
        replacements: { email },
        type: QueryTypes.SELECT
      }
    );

    if (!results) {
      console.log('❌ Failed to retrieve user after update');
      process.exit(1);
    }

    console.log('📊 Stored hash in DB:', results.password.substring(0, 30) + '...');
    
    // Test the comparison
    console.log('\n🔐 Testing password verification:');
    const isValid = await bcrypt.compare(password, results.password);
    console.log(`   Comparing "${password}" with stored hash: ${isValid ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    // Test with wrong password
    const wrongPassword = 'wrongpassword';
    const isWrongValid = await bcrypt.compare(wrongPassword, results.password);
    console.log(`   Comparing "${wrongPassword}" with stored hash: ${isWrongValid ? '❌ SHOULD FAIL' : '✅ CORRECT (fails as expected)'}`);
    
    if (isValid) {
      console.log('\n' + '='.repeat(50));
      console.log('🎉 SUCCESS! Password fixed!');
      console.log('='.repeat(50));
      console.log('\n📝 You can now login with:');
      console.log('   Email:', email);
      console.log('   Password:', password);
      console.log('\n   Or try these passwords for other users:');
      console.log('   • Rishitha: password123');
      console.log('   • Pranathi: password123');
      console.log('   • Tharuni: tharuni123');
    } else {
      console.log('\n❌ Password verification failed!');
      console.log('\n🔄 Trying alternative method with simpler password...');
      
      // Alternative: Try with a simpler password
      const simplePassword = 'password123';
      console.log(`   Using password: "${simplePassword}"`);
      
      const simpleSalt = await bcrypt.genSalt(10);
      const simpleHash = await bcrypt.hash(simplePassword, simpleSalt);
      
      await sequelize.query(
        `UPDATE "Users" 
         SET password = :password, 
             "isVerified" = true,
             "updatedAt" = NOW() 
         WHERE email = :email`,
        {
          replacements: { password: simpleHash, email },
          type: QueryTypes.UPDATE
        }
      );
      
      console.log('✅ Password updated to:', simplePassword);
      
      // Verify the alternative
      const [altResults] = await sequelize.query(
        `SELECT password FROM "Users" WHERE email = :email`,
        {
          replacements: { email },
          type: QueryTypes.SELECT
        }
      );
      
      const altIsValid = await bcrypt.compare(simplePassword, altResults.password);
      
      if (altIsValid) {
        console.log('\n' + '='.repeat(50));
        console.log('🎉 SUCCESS! Password fixed with alternative!');
        console.log('='.repeat(50));
        console.log('\n📝 You can now login with:');
        console.log('   Email:', email);
        console.log('   Password:', simplePassword);
      } else {
        console.log('\n❌ Alternative also failed. There might be an issue with the database schema.');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    console.log('\n👋 Closing database connection...');
    await sequelize.close();
    process.exit(0);
  }
}

sqlFix();