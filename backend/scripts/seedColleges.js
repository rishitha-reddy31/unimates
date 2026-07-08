const { sequelize, College } = require('../src/models');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const seedColleges = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL');

    // Sync database (create tables if they don't exist)
    await sequelize.sync({ force: true });
    console.log('✅ Database synced');

    const colleges = [
      {
        name: 'JNTUH University',
        shortName: 'JNTUH',
        domain: 'jntuh.ac.in',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        type: 'Public', // Changed from 'State University' to 'Public'
        establishedYear: 1972,
        isActive: true
      },
      {
        name: 'Osmania University',
        shortName: 'OU',
        domain: 'osmania.ac.in',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        type: 'Public', // Changed from 'State University' to 'Public'
        establishedYear: 1918,
        isActive: true
      },
      {
        name: 'CBIT College',
        shortName: 'CBIT',
        domain: 'cbit.ac.in',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        type: 'Autonomous', // Changed from 'Private Autonomous' to 'Autonomous'
        establishedYear: 1979,
        isActive: true
      },
      {
        name: 'MRCET College',
        shortName: 'MRCET',
        domain: 'mrcet.ac.in',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        type: 'Private',
        establishedYear: 2004,
        isActive: true
      },
      {
        name: 'MRCT College',
        shortName: 'MRCT',
        domain: 'mrct.ac.in',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        type: 'Private',
        establishedYear: 2000,
        isActive: true
      }
    ];

    // Insert colleges
    for (const college of colleges) {
      await College.create(college);
      console.log(`✅ Created college: ${college.name} (${college.domain})`);
    }

    console.log('🎉 College seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedColleges();