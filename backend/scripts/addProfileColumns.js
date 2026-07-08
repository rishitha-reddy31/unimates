// backend/scripts/addProfileColumns.js
const { sequelize } = require('../src/config/database');
const { QueryTypes } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const addProfileColumns = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    const columns = [
      { name: 'skills', type: 'JSONB DEFAULT \'[]\'' },
      { name: 'interests', type: 'JSONB DEFAULT \'[]\'' },
      { name: 'hobbies', type: 'JSONB DEFAULT \'[]\'' },
      { name: 'projects', type: 'JSONB DEFAULT \'[]\'' },
      { name: 'achievements', type: 'JSONB DEFAULT \'[]\'' },
      { name: 'postsCount', type: 'INTEGER DEFAULT 0' }
    ];

    for (const column of columns) {
      // Check if column exists
      const checkColumn = await sequelize.query(
        `SELECT column_name FROM information_schema.columns 
         WHERE table_name='Users' AND column_name='${column.name}'`,
        { type: QueryTypes.SELECT }
      );

      if (checkColumn.length === 0) {
        await sequelize.query(
          `ALTER TABLE "Users" ADD COLUMN "${column.name}" ${column.type}`,
          { type: QueryTypes.RAW }
        );
        console.log(`✅ Added column: ${column.name}`);
      } else {
        console.log(`⏭️ Column already exists: ${column.name}`);
      }
    }

    console.log('\n🎉 Profile columns added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding columns:', error);
    process.exit(1);
  }
};

addProfileColumns();