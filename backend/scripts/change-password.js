// change-password.js
const { sequelize } = require('./src/config/database');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function changePassword() {
  try {
    console.log('='.repeat(50));
    console.log('🔐 PASSWORD CHANGE UTILITY');
    console.log('='.repeat(50));
    
    // Connect to database
    console.log('\n🔍 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected to database successfully\n');

    // Get user email
    const email = await question('📧 Enter user email: ');
    
    if (!email || !email.includes('@')) {
      console.log('❌ Invalid email format');
      process.exit(1);
    }

    // Check if user exists
    console.log(`\n🔍 Checking for user: ${email}`);
    const [users] = await sequelize.query(
      `SELECT id, email, "fullName", username FROM "Users" WHERE email = $1`,
      { bind: [email] }
    );

    if (users.length === 0) {
      console.log('❌ User not found with this email');
      
      // Show recent users
      console.log('\n📋 Recent users in database:');
      const [recentUsers] = await sequelize.query(
        `SELECT email, "fullName" FROM "Users" ORDER BY "createdAt" DESC LIMIT 5`
      );
      
      recentUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.fullName} - ${user.email}`);
      });
      
      process.exit(1);
    }

    const user = users[0];
    console.log(`\n✅ User found:`);
    console.log(`   Name: ${user.fullName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username}`);

    // Get new password
    console.log('\n🔑 Password requirements:');
    console.log('   • Minimum 6 characters');
    console.log('   • Can include letters, numbers, and symbols');
    
    const password = await question('\n🔐 Enter new password: ');
    
    if (!password || password.length < 6) {
      console.log('❌ Password must be at least 6 characters long');
      process.exit(1);
    }

    const confirmPassword = await question('🔐 Confirm new password: ');
    
    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match');
      process.exit(1);
    }

    // Generate hash
    console.log('\n🔄 Generating password hash...');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    console.log('✅ Password hash generated');

    // Update password in database
    console.log('\n🔄 Updating password in database...');
    await sequelize.query(
      `UPDATE "Users" 
       SET password = $1,
           "updatedAt" = NOW()
       WHERE id = $2`,
      { bind: [hash, user.id] }
    );
    console.log('✅ Password updated successfully');

    // Verify the update
    const [updatedUser] = await sequelize.query(
      `SELECT id, email, "fullName", password FROM "Users" WHERE id = $1`,
      { bind: [user.id] }
    );

    if (updatedUser.length > 0 && updatedUser[0].password) {
      console.log('\n✅ Verification: Password hash is present');
      console.log('\n📝 You can now login with:');
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${password}`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('\n📚 Stack trace:', error.stack);
    }
  } finally {
    await sequelize.close();
    console.log('\n='.repeat(50));
    console.log('👋 Database connection closed');
    console.log('='.repeat(50));
    rl.close();
    process.exit(0);
  }
}

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n👋 Script interrupted by user');
  rl.close();
  process.exit(0);
});

changePassword();