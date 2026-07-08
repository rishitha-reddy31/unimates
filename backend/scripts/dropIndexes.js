const mongoose = require('mongoose');
require('dotenv').config();

const dropIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Drop the problematic index from colleges collection
    const db = mongoose.connection.db;
    const colleges = db.collection('colleges');
    
    try {
      await colleges.dropIndex('domain_1');
      console.log('✅ Dropped index: domain_1');
    } catch (err) {
      console.log('⚠️ Index domain_1 not found, skipping...');
    }

    // List remaining indexes
    const indexes = await colleges.indexes();
    console.log('\n📊 Current indexes:');
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

dropIndexes();