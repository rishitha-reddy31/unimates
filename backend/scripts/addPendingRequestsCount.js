const { sequelize } = require('../src/config/database');
const { QueryTypes } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const addPendingRequestsCount = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Check if column exists
    const checkColumn = await sequelize.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name='Users' AND column_name='pendingRequestsCount'`,
      { type: QueryTypes.SELECT }
    );

    if (checkColumn.length > 0) {
      console.log('Column pendingRequestsCount already exists, skipping...');
    } else {
      // Add the column
      await sequelize.query(
        `ALTER TABLE "Users" ADD COLUMN "pendingRequestsCount" INTEGER DEFAULT 0`,
        { type: QueryTypes.RAW }
      );
      console.log('✅ Added pendingRequestsCount column to Users table');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding column:', error);
    process.exit(1);
  }
};

addPendingRequestsCount();