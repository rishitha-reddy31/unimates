// Create a test.js file in backend folder
const mongoose = require('mongoose');
const uri = 'mongodb://rishithareddy031_db_user:rishithareddy031%21secret@159.41.178.126:27017,159.41.178.146:27017,159.41.178.137:27017/unimates_master?ssl=true&replicaSet=atlas-s75t2to-shard-0&authSource=admin';
mongoose.connect(uri)
  .then(() => console.log('✅ Connected'))
  .catch(err => console.log('❌', err.message));