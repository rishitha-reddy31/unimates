const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../src/models/User');
const Post = require('../src/models/Post');
const Group = require('../src/models/Group');

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Post.deleteMany({});
        await Group.deleteMany({});
        console.log('🧹 Cleared existing data');

        // Create test users
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        const users = [
            {
                email: 'admin@college.edu',
                password: hashedPassword,
                role: 'admin',
                profile: {
                    name: 'Admin User',
                    branch: 'CSE',
                    year: '4th',
                    bio: 'Platform Administrator',
                    skills: ['Management', 'Leadership', 'Node.js'],
                    hobbies: ['Reading', 'Travel'],
                    profilePicture: 'https://ui-avatars.com/api/?name=Admin+User&background=2563eb&color=fff'
                },
                isEmailVerified: true,
                isActive: true
            },
            {
                email: 'john.doe@college.edu',
                password: hashedPassword,
                role: 'student',
                profile: {
                    name: 'John Doe',
                    branch: 'CSE',
                    year: '3rd',
                    bio: 'Computer Science student passionate about web development',
                    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
                    hobbies: ['Coding', 'Gaming', 'Chess'],
                    profilePicture: 'https://ui-avatars.com/api/?name=John+Doe&background=10b981&color=fff'
                },
                isEmailVerified: true,
                isActive: true
            },
            {
                email: 'jane.smith@college.edu',
                password: hashedPassword,
                role: 'student',
                profile: {
                    name: 'Jane Smith',
                    branch: 'ECE',
                    year: '2nd',
                    bio: 'Electronics enthusiast | Robotics club lead',
                    skills: ['Python', 'Arduino', 'Circuit Design', 'C++'],
                    hobbies: ['Robotics', 'Music', 'Photography'],
                    profilePicture: 'https://ui-avatars.com/api/?name=Jane+Smith&background=8b5cf6&color=fff'
                },
                isEmailVerified: true,
                isActive: true
            }
        ];

        const createdUsers = await User.insertMany(users);
        console.log(`✅ Created ${createdUsers.length} users`);

        // Create test posts
        const posts = [
            {
                content: '🎉 Just launched my first React project! Check out my portfolio website. Would love feedback!',
                createdBy: createdUsers[1]._id,
                likes: [createdUsers[0]._id, createdUsers[2]._id],
                likesCount: 2,
                comments: []
            },
            {
                content: '📚 Study group for Data Structures exam this Friday. Anyone interested? We\'re meeting in the library at 3 PM.',
                createdBy: createdUsers[2]._id,
                likes: [createdUsers[1]._id],
                likesCount: 1,
                comments: []
            },
            {
                content: '🏆 Congratulations to the team for winning the Hackathon! Proud of everyone!',
                createdBy: createdUsers[0]._id,
                likes: [createdUsers[1]._id, createdUsers[2]._id],
                likesCount: 2,
                comments: []
            }
        ];

        await Post.insertMany(posts);
        console.log(`✅ Created ${posts.length} posts`);

        // Create test group
        const group = {
            name: 'Web Development Club',
            description: 'Learn and collaborate on web development projects',
            category: 'CODING',
            createdBy: createdUsers[0]._id,
            admins: [createdUsers[0]._id],
            members: [
                { user: createdUsers[0]._id, role: 'admin' },
                { user: createdUsers[1]._id, role: 'member' },
                { user: createdUsers[2]._id, role: 'member' }
            ],
            isPrivate: false
        };

        await Group.create(group);
        console.log('✅ Created test group');

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📝 Test Credentials:');
        console.log('Admin - admin@college.edu / password123');
        console.log('John - john.doe@college.edu / password123');
        console.log('Jane - jane.smith@college.edu / password123');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedDatabase();