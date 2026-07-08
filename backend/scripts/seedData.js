const { sequelize, User, College, Post } = require('../src/models');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const seedData = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL');

    // First, create a college if none exists
    let college = await College.findOne();
    
    if (!college) {
      console.log('No colleges found, creating a default college...');
      college = await College.create({
        name: 'Default University',
        shortName: 'DU',
        domain: 'university.edu',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        type: 'Public',
        establishedYear: 2000,
        isActive: true
      });
      console.log('✅ Created default college');
    }

    console.log(`Using college: ${college.name} (${college.domain})`);

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create test users
    const users = [
      {
        username: 'john_doe',
        email: `john@${college.domain}`,
        password: hashedPassword,
        fullName: 'John Doe',
        collegeId: college.id,
        year: '3rd',
        branch: 'CSE',
        isVerified: true,
        role: 'user',
        bio: 'Passionate about web development and AI. Love to code and collaborate on projects.',
        profilePicture: 'https://ui-avatars.com/api/?name=John+Doe&background=2563eb&color=fff'
      },
      {
        username: 'jane_smith',
        email: `jane@${college.domain}`,
        password: hashedPassword,
        fullName: 'Jane Smith',
        collegeId: college.id,
        year: '2nd',
        branch: 'ECE',
        isVerified: true,
        role: 'user',
        bio: 'Electronics enthusiast interested in IoT and embedded systems.',
        profilePicture: 'https://ui-avatars.com/api/?name=Jane+Smith&background=8b5cf6&color=fff'
      },
      {
        username: 'admin',
        email: `admin@${college.domain}`,
        password: hashedPassword,
        fullName: 'Admin User',
        collegeId: college.id,
        isVerified: true,
        role: 'admin',
        bio: 'Platform administrator',
        profilePicture: 'https://ui-avatars.com/api/?name=Admin+User&background=10b981&color=fff'
      }
    ];

    for (const userData of users) {
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (!existingUser) {
        await User.create(userData);
        console.log(`✅ Created user: ${userData.fullName}`);
      } else {
        console.log(`⏭️ User already exists: ${userData.fullName}`);
      }
    }

    // Create some sample posts
    const users_created = await User.findAll();
    if (users_created.length > 0) {
      const posts = [
        {
          content: 'Hello everyone! Excited to join this platform. Looking forward to connecting with fellow students!',
          authorId: users_created[0].id,
          collegeId: college.id,
          status: 'active'
        },
        {
          content: 'Has anyone started preparing for placements? Would love to form a study group!',
          authorId: users_created[1]?.id || users_created[0].id,
          collegeId: college.id,
          status: 'active'
        }
      ];

      for (const postData of posts) {
        await Post.create(postData);
        console.log('✅ Created sample post');
      }
    }

    console.log('🎉 Data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();