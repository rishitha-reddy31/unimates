const { sequelize } = require('../src/config/database');
const { QueryTypes } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const updateEnums = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Update Forum enum
    console.log('🔄 Updating Forum category enum...');
    try {
      // Add new values to existing enum
      await sequelize.query(
        `ALTER TYPE "enum_Forums_category" ADD VALUE IF NOT EXISTS 'ACADEMICS'`,
        { type: QueryTypes.RAW }
      );
      await sequelize.query(
        `ALTER TYPE "enum_Forums_category" ADD VALUE IF NOT EXISTS 'CODING'`,
        { type: QueryTypes.RAW }
      );
      await sequelize.query(
        `ALTER TYPE "enum_Forums_category" ADD VALUE IF NOT EXISTS 'PLACEMENTS'`,
        { type: QueryTypes.RAW }
      );
      await sequelize.query(
        `ALTER TYPE "enum_Forums_category" ADD VALUE IF NOT EXISTS 'PROJECTS'`,
        { type: QueryTypes.RAW }
      );
      await sequelize.query(
        `ALTER TYPE "enum_Forums_category" ADD VALUE IF NOT EXISTS 'INTERNSHIPS'`,
        { type: QueryTypes.RAW }
      );
      await sequelize.query(
        `ALTER TYPE "enum_Forums_category" ADD VALUE IF NOT EXISTS 'GENERAL'`,
        { type: QueryTypes.RAW }
      );
      console.log('✅ Forum enum updated successfully');
    } catch (err) {
      console.log('Note:', err.message);
    }

    // Update AnonymousPost enum
    console.log('\n🔄 Updating AnonymousPost category enum...');
    try {
      await sequelize.query(
        `ALTER TYPE "enum_AnonymousPosts_category" ADD VALUE IF NOT EXISTS 'CAMPUS'`,
        { type: QueryTypes.RAW }
      );
      await sequelize.query(
        `ALTER TYPE "enum_AnonymousPosts_category" ADD VALUE IF NOT EXISTS 'ACADEMIC'`,
        { type: QueryTypes.RAW }
      );
      await sequelize.query(
        `ALTER TYPE "enum_AnonymousPosts_category" ADD VALUE IF NOT EXISTS 'PLACEMENT'`,
        { type: QueryTypes.RAW }
      );
      await sequelize.query(
        `ALTER TYPE "enum_AnonymousPosts_category" ADD VALUE IF NOT EXISTS 'GENERAL'`,
        { type: QueryTypes.RAW }
      );
      await sequelize.query(
        `ALTER TYPE "enum_AnonymousPosts_category" ADD VALUE IF NOT EXISTS 'HOSTEL'`,
        { type: QueryTypes.RAW }
      );
      await sequelize.query(
        `ALTER TYPE "enum_AnonymousPosts_category" ADD VALUE IF NOT EXISTS 'CANTEEN'`,
        { type: QueryTypes.RAW }
      );
      await sequelize.query(
        `ALTER TYPE "enum_AnonymousPosts_category" ADD VALUE IF NOT EXISTS 'LIBRARY'`,
        { type: QueryTypes.RAW }
      );
      console.log('✅ AnonymousPost enum updated successfully');
    } catch (err) {
      console.log('Note:', err.message);
    }

    console.log('\n✅ Enum updates completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating enums:', error);
    process.exit(1);
  }
};

updateEnums();