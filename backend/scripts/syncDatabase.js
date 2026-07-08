const { sequelize } = require('../src/config/database');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import all models
const College = require('../src/models/College');
const User = require('../src/models/User');
// Import other models as you create them

console.log('🔄 Starting database sync...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Database:', process.env.DB_NAME);

const syncDatabase = async () => {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Define associations
    User.belongsTo(College, { foreignKey: 'collegeId' });
    College.hasMany(User, { foreignKey: 'collegeId' });

    // Sync all models
    console.log('🔄 Syncing models...');
    await sequelize.sync({ alter: true });
    
    console.log('✅ Database synced successfully!');
    console.log('Tables created:', Object.keys(sequelize.models).join(', '));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing database:');
    console.error(error);
    process.exit(1);
  }
};

syncDatabase();