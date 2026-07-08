const { MongoClient } = require('mongodb');

const uri = 'mongodb://rishithareddy031_db_user:rishithareddy031%21secret@ac-s75t2to-shard-00-00.lnoi4tk.mongodb.net:27017,ac-s75t2to-shard-00-01.lnoi4tk.mongodb.net:27017,ac-s75t2to-shard-00-02.lnoi4tk.mongodb.net:27017/unimates_master?ssl=true&replicaSet=atlas-s75t2to-shard-0&authSource=admin&retryWrites=true&w=majority';

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 60000,
  socketTimeoutMS: 60000,
  connectTimeoutMS: 60000,
  minPoolSize: 0,
  maxPoolSize: 5,
  family: 4
});

async function run() {
  try {
    console.log('🔌 Connecting...');
    await client.connect();
    console.log('✅ Connected');
    
    const db = client.db('unimates_master');
    const users = db.collection('users');
    
    // Get indexes
    const indexes = await users.indexes();
    console.log('📋 Current indexes:', indexes);
    
    // Drop problematic index
    try {
      await users.dropIndex('id_1');
      console.log('✅ Dropped id_1 index');
    } catch (err) {
      console.log('⚠️ Index not found');
    }
    
    // Create unique email index
    await users.createIndex({ email: 1 }, { unique: true });
    console.log('✅ Created email index');
    
    // Final indexes
    const final = await users.indexes();
    console.log('📋 Final indexes:', final);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.close();
    console.log('👋 Done');
  }
}

run();