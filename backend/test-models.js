const { sequelize } = require('./src/config/database');
require('dotenv').config();

console.log('Testing models...');

async function testModels() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Try to import models
    const College = require('./src/models/College');
    const User = require('./src/models/User');
    
    console.log('✅ Models loaded successfully');
    
    // Define associations
    User.belongsTo(College, { foreignKey: 'collegeId' });
    College.hasMany(User, { foreignKey: 'collegeId' });
    
    // Force sync - THIS WILL DROP EXISTING TABLES AND DATA
    console.log('⚠️  Dropping and recreating tables...');
    await sequelize.sync({ force: true });
    
    console.log('✅ Tables recreated successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testModels();