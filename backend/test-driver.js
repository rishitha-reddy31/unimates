const { MongoClient } = require('mongodb');

const uri = 'mongodb://rishithareddy031_db_user:rishithareddy031%21secret@159.41.178.126:27017,159.41.178.146:27017,159.41.178.137:27017/unimates_master?ssl=true&tls=true&tlsVersion=TLS1_2&tlsCipherSuites=TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384&tlsAllowInvalidCertificates=true&tlsAllowInvalidHostnames=true&replicaSet=atlas-s75t2to-shard-0&authSource=admin&retryWrites=true&w=majority';

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  family: 4
});

async function run() {
  try {
    console.log('🔌 Attempting connection with native driver...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const db = client.db('unimates_master');
    const collections = await db.listCollections().toArray();
    console.log('📚 Collections:', collections.map(c => c.name));
    
    await client.close();
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    console.error('Full error:', err);
  }
}

run();