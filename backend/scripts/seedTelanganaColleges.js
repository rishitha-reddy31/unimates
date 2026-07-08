const mongoose = require('mongoose');
require('dotenv').config();

const College = require('../src/models/College');

const telanganaColleges = [
  // Universities
  { name: "Jawaharlal Nehru Technological University Hyderabad (JNTUH)", domain: "jntuh.ac.in", establishedYear: 1972, type: "State University" },
  { name: "Osmania University (OU)", domain: "osmania.ac.in", establishedYear: 1918, type: "State University" },
  { name: "University of Hyderabad (HCU)", domain: "uohyd.ac.in", establishedYear: 1974, type: "Central University" },
  { name: "Kakatiya University", domain: "kakatiya.ac.in", establishedYear: 1976, type: "State University" },
  { name: "Telangana University", domain: "telangana.ac.in", establishedYear: 2006, type: "State University" },
  { name: "Mahatma Gandhi University", domain: "mguniversity.ac.in", establishedYear: 2007, type: "State University" },
  { name: "Palamuru University", domain: "palamuru.ac.in", establishedYear: 2008, type: "State University" },
  { name: "Satavahana University", domain: "satavahana.ac.in", establishedYear: 2008, type: "State University" },
  
  // Premier Institutes
  { name: "IIT Hyderabad (IIT-H)", domain: "iith.ac.in", establishedYear: 2008, type: "Institute of National Importance" },
  { name: "NIT Warangal (NITW)", domain: "nitw.ac.in", establishedYear: 1959, type: "Institute of National Importance" },
  { name: "IIIT Hyderabad (IIIT-H)", domain: "iiit.ac.in", establishedYear: 1998, type: "Deemed University" },
  
  // Private Engineering Colleges
  { name: "Chaitanya Bharathi Institute of Technology (CBIT)", domain: "cbit.ac.in", establishedYear: 1979, type: "Private Autonomous" },
  { name: "Vasavi College of Engineering", domain: "vasavi.ac.in", establishedYear: 1981, type: "Private Autonomous" },
  { name: "VNR Vignana Jyothi Institute of Engineering (VNR VJIET)", domain: "vnrvjiet.ac.in", establishedYear: 1995, type: "Private Autonomous" },
  { name: "Gokaraju Rangaraju Institute of Engineering (GRIET)", domain: "griet.ac.in", establishedYear: 1997, type: "Private Autonomous" },
  { name: "MVSR Engineering College", domain: "mvsr.ac.in", establishedYear: 1981, type: "Private" },
  { name: "CMR College of Engineering & Technology", domain: "cmrcet.ac.in", establishedYear: 2002, type: "Private" },
  { name: "Anurag University", domain: "anurag.ac.in", establishedYear: 2002, type: "Private" },
  { name: "Sreenidhi Institute of Science & Technology", domain: "sreenidhi.ac.in", establishedYear: 1997, type: "Private" },
  { name: "Malla Reddy College of Engineering (MRCE)", domain: "mrce.ac.in", establishedYear: 2002, type: "Private" },
  { name: "Malla Reddy College of Engineering & Technology (MRCET)", domain: "mrcet.ac.in", establishedYear: 2004, type: "Private" },
  { name: "Keshav Memorial Institute of Technology (KMIT)", domain: "kmit.ac.in", establishedYear: 2007, type: "Private" },
  { name: "Methodist College of Engineering & Technology", domain: "methodist.ac.in", establishedYear: 2008, type: "Private" },
  { name: "Stanley College of Engineering & Technology for Women", domain: "stanley.ac.in", establishedYear: 2008, type: "Private" },
  { name: "Aurora's Technological & Research Institute", domain: "aurora.ac.in", establishedYear: 2000, type: "Private" },
  { name: "Institute of Aeronautical Engineering (IARE)", domain: "iare.ac.in", establishedYear: 2000, type: "Private" },
  { name: "Lords Institute of Engineering & Technology", domain: "lords.ac.in", establishedYear: 2002, type: "Private" },
  { name: "St. Martin's Engineering College", domain: "stmartins.ac.in", establishedYear: 2002, type: "Private" },
  { name: "TKR College of Engineering & Technology", domain: "tkr.ac.in", establishedYear: 2002, type: "Private" },
  { name: "Sri Indu College of Engineering & Technology", domain: "sriindu.ac.in", establishedYear: 2002, type: "Private" },
  
  // Medical Colleges
  { name: "Osmania Medical College", domain: "osmaniamedical.ac.in", establishedYear: 1846, type: "Government Medical" },
  { name: "Gandhi Medical College", domain: "gandhimedical.ac.in", establishedYear: 1954, type: "Government Medical" },
  { name: "Deccan College of Medical Sciences", domain: "deccanmedical.ac.in", establishedYear: 1984, type: "Private Medical" },
  { name: "Shadan Institute of Medical Sciences", domain: "shadanmedical.ac.in", establishedYear: 2003, type: "Private Medical" },
  { name: "Apollo Institute of Medical Sciences & Research", domain: "apollomedicals.ac.in", establishedYear: 2015, type: "Private Medical" },
  
  // Your specific colleges
  { name: "MRCT College", domain: "mrct.ac.in", establishedYear: 2000, type: "Private" },
  { name: "MRCET College", domain: "mrcet.ac.in", establishedYear: 2002, type: "Private" },
  { name: "MRRET College", domain: "mrret.ac.in", establishedYear: 2002, type: "Private" },
];

async function seedColleges() {
  try {
    // 🔴 USE THIS EXACT CONNECTION STRING WITH ALL THREE IPS
    const uri = 'mongodb://rishithareddy031_db_user:rishithareddy031%21secret@159.41.178.126:27017,159.41.178.146:27017,159.41.178.137:27017/unimates_master?ssl=true&replicaSet=atlas-s75t2to-shard-0&authSource=admin&retryWrites=true&w=majority';
    const options = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      retryReads: true,
      family: 4 // Force IPv4
    };
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(uri,options);
    console.log('✅ Connected to MongoDB');

    // Clear existing colleges
    await College.deleteMany({});
    console.log('🧹 Cleared existing colleges');

    // Insert new colleges
    const result = await College.insertMany(telanganaColleges);
    console.log(`✅ Seeded ${result.length} colleges successfully`);

    console.log('\n📋 College domains added:');
    result.forEach(college => {
      console.log(`   • ${college.name}: @${college.domain}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
}

seedColleges();