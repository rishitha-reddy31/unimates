const { sequelize } = require('../src/config/database');
const { QueryTypes } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const addInterestsSkills = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Check if interests column exists
    const checkInterests = await sequelize.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name='Users' AND column_name='interests'`,
      { type: QueryTypes.SELECT }
    );

    if (checkInterests.length === 0) {
      await sequelize.query(
        `ALTER TABLE "Users" ADD COLUMN "interests" JSONB DEFAULT '[]'::jsonb`,
        { type: QueryTypes.RAW }
      );
      console.log('✅ Added interests column');
    } else {
      console.log('⏭️ interests column already exists');
    }

    // Check if skills column exists
    const checkSkills = await sequelize.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name='Users' AND column_name='skills'`,
      { type: QueryTypes.SELECT }
    );

    if (checkSkills.length === 0) {
      await sequelize.query(
        `ALTER TABLE "Users" ADD COLUMN "skills" JSONB DEFAULT '[]'::jsonb`,
        { type: QueryTypes.RAW }
      );
      console.log('✅ Added skills column');
    } else {
      console.log('⏭️ skills column already exists');
    }

    console.log('🎉 Schema update complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating schema:', error);
    process.exit(1);
  }
};

addInterestsSkills();