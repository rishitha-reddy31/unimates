const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndexes() {
  try {
    const uri = 'mongodb://rishithareddy031_db_user:rishithareddy031%21secret@ac-s75t2to-shard-00-00.lnoi4tk.mongodb.net:27017,ac-s75t2to-shard-00-01.lnoi4tk.mongodb.net:27017,ac-s75t2to-shard-00-02.lnoi4tk.mongodb.net:27017/unimates_master?ssl=true&replicaSet=atlas-s75t2to-shard-0&authSource=admin&retryWrites=true&w=majority';
    
    const options = {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 60000,
      heartbeatFrequencyMS: 30000, // 🔴 Add this
      minPoolSize: 0,               // 🔴 Important for free tier
      maxPoolSize: 5,               // 🔴 Limit connections
      family: 4,
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true,
      retryWrites: true,
      retryReads: true
    };

    console.log('🔌 Connecting to MongoDB with pool settings...');
    await mongoose.connect(uri, options);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // List all indexes
    const indexes = await db.collection('users').getIndexes();
    console.log('📋 Current indexes:');
    console.log(indexes);
    
    // Drop the problematic id_1 index if it exists
    try {
      await db.collection('users').dropIndex('id_1');
      console.log('✅ Dropped index: id_1');
    } catch (err) {
      console.log('⚠️ Index id_1 not found, skipping...');
    }
    
    // Ensure email index exists (unique)
    try {
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      console.log('✅ Ensured email index exists');
    } catch (err) {
      console.log('⚠️ Email index may already exist:', err.message);
    }
    
    // Verify indexes after cleanup
    const newIndexes = await db.collection('users').getIndexes();
    console.log('\n📋 Indexes after cleanup:');
    console.log(newIndexes);

    await mongoose.connection.close();
    console.log('✅ Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

fixIndexes();