const { Sequelize } = require('sequelize');
const path = require('path');

// Load environment variables from root .env file
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'unimates',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected Successfully');
    
    // Comment out sync to avoid the error
    // if (process.env.NODE_ENV === 'development') {
    //   await sequelize.sync({ alter: true });
    //   console.log('✅ Database synced');
    // }
    
    return sequelize;
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };