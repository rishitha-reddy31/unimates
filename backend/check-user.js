const { sequelize, User } = require('./src/models');

async function checkUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    const email = '23n31a05t8@mrcet.ac.in'; // Change this to the email you want to check

    console.log(`🔍 Checking if user exists with email: ${email}\n`);

    // Method 1: Find by email
    const userByEmail = await User.findOne({
      where: { email: email }
    });

    if (userByEmail) {
      console.log('✅ User FOUND by email!');
      console.log('----------------------------------------');
      console.log('ID:', userByEmail.id);
      console.log('Username:', userByEmail.username);
      console.log('Email:', userByEmail.email);
      console.log('Full Name:', userByEmail.fullName);
      console.log('College ID:', userByEmail.collegeId);
      console.log('Created At:', userByEmail.createdAt);
      console.log('----------------------------------------\n');
    } else {
      console.log('❌ No user found with this email\n');
    }

    // Method 2: Find by username (if you know it)
    const username = 'tharuni954'; // Change this to check by username
    const userByUsername = await User.findOne({
      where: { username: username }
    });

    if (userByUsername) {
      console.log(`✅ User FOUND by username: ${username}`);
      console.log('----------------------------------------');
      console.log('ID:', userByUsername.id);
      console.log('Email:', userByUsername.email);
      console.log('Full Name:', userByUsername.fullName);
      console.log('----------------------------------------\n');
    } else {
      console.log(`❌ No user found with username: ${username}\n`);
    }

    // Method 3: Get all users (limit to 5)
    console.log('📋 Latest 5 users in database:');
    console.log('----------------------------------------');
    
    const allUsers = await User.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'username', 'email', 'fullName', 'createdAt']
    });

    if (allUsers.length === 0) {
      console.log('No users found in database');
    } else {
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.fullName || user.username}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log('---');
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUser();