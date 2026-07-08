const { sequelize, College, User } = require('../src/models');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const hyderabadColleges = [
  // JNTU Colleges
  {
    name: 'JNTU Hyderabad',
    shortName: 'JNTUH',
    code: 'jntuh',
    domain: 'jntuh.ac.in',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    type: 'Public',
    establishedYear: 1972,
    isActive: true
  },
  {
    name: 'JNTU College of Engineering',
    shortName: 'JNTUCEH',
    code: 'jntuceh',
    domain: 'jntuceh.ac.in',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    type: 'Public',
    establishedYear: 1972,
    isActive: true
  },

  // Osmania University Colleges
  {
    name: 'Osmania University',
    shortName: 'OU',
    code: 'osmania',
    domain: 'osmania.ac.in',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    type: 'Public',
    establishedYear: 1918,
    isActive: true
  },
  {
    name: 'University College of Engineering',
    shortName: 'UCEOU',
    code: 'uceou',
    domain: 'uceou.ac.in',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    type: 'Public',
    establishedYear: 1929,
    isActive: true
  },

  // CBIT
  {
    name: 'Chaitanya Bharathi Institute of Technology',
    shortName: 'CBIT',
    code: 'cbit',
    domain: 'cbit.ac.in',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    type: 'Autonomous',
    establishedYear: 1979,
    isActive: true
  },

  // Vasavi College of Engineering
  {
    name: 'Vasavi College of Engineering',
    shortName: 'VCE',
    code: 'vasavi',
    domain: 'vasavi.ac.in',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    type: 'Private',
    establishedYear: 1981,
    isActive: true
  },

  // Muffakham Jah College
  {
    name: 'Muffakham Jah College of Engineering and Technology',
    shortName: 'MJCET',
    code: 'mjcollege',
    domain: 'mjcollege.ac.in',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    type: 'Private',
    establishedYear: 1980,
    isActive: true
  },

  // Deccan College
  {
    name: 'Deccan College of Engineering and Technology',
    shortName: 'DCET',
    code: 'deccancollege',
    domain: 'deccancollege.ac.in',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    type: 'Private',
    establishedYear: 1984,
    isActive: true
  },

  // Methodist College
  {
    name: 'Methodist College of Engineering and Technology',
    shortName: 'MCET',
    code: 'methodist',
    domain: 'methodist.ac.in',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    type: 'Private',
    establishedYear: 2008,
    isActive: true
  },

  // Stanley College
  {
    name: 'Stanley College of Engineering and Technology for Women',
    shortName: 'SCETW',
    code: 'stanley',
    domain: 'stanley.ac.in',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    type: 'Private',
    establishedYear: 2008,
    isActive: true
  },

  // Lords College
  {
    name: 'Lords Institute of Engineering and Technology',
    shortName: 'LIET',
    code: 'lords',
    domain: 'lords.ac.in',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    type: 'Private',
    establishedYear: 2002,
    isActive: true
  },

  // MRCET (your college)
  {
    name: 'Malla Reddy College of Engineering and Technology',
    shortName: 'MRCET',
    code: 'mrcet',
    domain: 'mrcet.ac.in',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    type: 'Private',
    establishedYear: 2002,
    isActive: true
  },

  // MREC
  {
    name: 'Malla Reddy Engineering College',
    shortName: 'MREC',
    code: 'mrec',
    domain: 'mrec.ac.in',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    type: 'Private',
    establishedYear: 2002,
    isActive: true
  },

  // MRITS
  {
    name: 'Malla Reddy Institute of Technology and Science',
    shortName: 'MRITS',
    code: 'mrits',
    domain: 'mrits.ac.in',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    type: 'Private',
    establishedYear: 2004,
    isActive: true
  },

  // CMR Colleges
  {
    name: 'CMR College of Engineering and Technology',
    shortName: 'CMRCET',
    code: 'cmrcet',
    domain: 'cmrcet.ac.in',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    type: 'Private',
    establishedYear: 2002,
    isActive: true
  },
  {
    name: 'CMR Institute of Technology',
    shortName: 'CMRIT',
    code: 'cmrit',
    domain: 'cmrit.ac.in',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    type: 'Private',
    establishedYear: 2005,
    isActive: true
  },

  // Gokaraju Rangaraju
  {
    name: 'Gokaraju Rangaraju Institute of Engineering and Technology',
    shortName: 'GRIET',
    code: 'griet',
    domain: 'griet.ac.in',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    type: 'Private',
    establishedYear: 1997,
    isActive: true
  },

  // VNR VJIET
  {
    name: 'VNR Vignana Jyothi Institute of Engineering and Technology',
    shortName: 'VNRVJIET',
    code: 'vnrvjiet',
    domain: 'vnrvjiet.ac.in',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    type: 'Private',
    establishedYear: 1995,
    isActive: true
  },

  // BVRIT
  {
    name: 'BVRIT Hyderabad College of Engineering for Women',
    shortName: 'BVRITH',
    code: 'bvrith',
    domain: 'bvrith.ac.in',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    type: 'Private',
    establishedYear: 2012,
    isActive: true
  },

  // MGIT
  {
    name: 'Mahatma Gandhi Institute of Technology',
    shortName: 'MGIT',
    code: 'mgit',
    domain: 'mgit.ac.in',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    type: 'Private',
    establishedYear: 1997,
    isActive: true
  },

  // VBIT
  {
    name: 'Vignana Bharathi Institute of Technology',
    shortName: 'VBIT',
    code: 'vbit',
    domain: 'vbit.ac.in',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    type: 'Private',
    establishedYear: 2004,
    isActive: true
  },

  // Anurag
  {
    name: 'Anurag University',
    shortName: 'ANU',
    code: 'anurag',
    domain: 'anurag.ac.in',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    type: 'Private',
    establishedYear: 2002,
    isActive: true
  },

  // Aurora
  {
    name: 'Aurora\'s Engineering College',
    shortName: 'AEC',
    code: 'aurora',
    domain: 'aurora.ac.in',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    type: 'Private',
    establishedYear: 2001,
    isActive: true
  },

  // Sreenidhi
  {
    name: 'Sreenidhi Institute of Science and Technology',
    shortName: 'SNIST',
    code: 'sreenidhi',
    domain: 'sreenidhi.ac.in',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    type: 'Private',
    establishedYear: 1997,
    isActive: true
  },

  // IIT Hyderabad
  {
    name: 'Indian Institute of Technology Hyderabad',
    shortName: 'IITH',
    code: 'iith',
    domain: 'iith.ac.in',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    type: 'Institute of National Importance',
    establishedYear: 2008,
    isActive: true
  },

  // IIIT Hyderabad
  {
    name: 'International Institute of Information Technology Hyderabad',
    shortName: 'IIITH',
    code: 'iiith',
    domain: 'iiit.ac.in',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    type: 'Deemed',
    establishedYear: 1998,
    isActive: true
  },

  // NIT Warangal (though in Warangal, included for completeness)
  {
    name: 'National Institute of Technology Warangal',
    shortName: 'NITW',
    code: 'nitw',
    domain: 'nitw.ac.in',
    city: 'Warangal',
    state: 'Telangana',
    country: 'India',
    type: 'Institute of National Importance',
    establishedYear: 1959,
    isActive: true
  }
];

const seedColleges = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL');

    // Option 1: Delete all users first (if you want to start fresh)
    console.log('🗑️ Deleting all users...');
    await User.destroy({ where: {} });
    console.log('✅ Users deleted');

    // Then delete all colleges
    console.log('🗑️ Deleting existing colleges...');
    await College.destroy({ where: {} });
    console.log('✅ Existing colleges deleted');

    // Insert new colleges
    console.log(`\n📚 Adding ${hyderabadColleges.length} Hyderabad colleges...\n`);
    
    for (const college of hyderabadColleges) {
      try {
        await College.create(college);
        console.log(`✅ Created: ${college.name}`);
        console.log(`   Domain: @${college.domain}`);
        console.log(`   Code: ${college.code}`);
        console.log('---');
      } catch (err) {
        console.log(`❌ Failed to create ${college.name}:`, err.message);
      }
    }

    console.log(`\n🎉 Successfully seeded Hyderabad colleges!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedColleges();