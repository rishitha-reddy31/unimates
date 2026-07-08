// backend/scripts/updateUserSchema.js
const { sequelize } = require('../src/config/database');
const { QueryTypes } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const updateUserSchema = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Check and add pendingRequestsCount
    const checkColumn = await sequelize.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name='Users' AND column_name='pendingRequestsCount'`,
      { type: QueryTypes.SELECT }
    );

    if (checkColumn.length === 0) {
      await sequelize.query(
        `ALTER TABLE "Users" ADD COLUMN "pendingRequestsCount" INTEGER DEFAULT 0`,
        { type: QueryTypes.RAW }
      );
      console.log('✅ Added pendingRequestsCount column');
    } else {
      console.log('⏭️ pendingRequestsCount already exists');
    }

    // Also check for any other missing columns you might need
    const columnsToCheck = [
      { name: 'followersCount', type: 'INTEGER DEFAULT 0' },
      { name: 'followingCount', type: 'INTEGER DEFAULT 0' }
    ];

    for (const column of columnsToCheck) {
      const exists = await sequelize.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name='Users' AND column_name='${column.name}'`,
        { type: QueryTypes.SELECT }
      );

      if (exists.length === 0) {
        await sequelize.query(
          `ALTER TABLE "Users" ADD COLUMN "${column.name}" ${column.type}`,
          { type: QueryTypes.RAW }
        );
        console.log(`✅ Added ${column.name} column`);
      }
    }

    console.log('🎉 Schema update complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating schema:', error);
    process.exit(1);
  }
};

updateUserSchema();