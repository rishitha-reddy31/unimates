const { sequelize } = require('../src/config/database');
const { QueryTypes } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const fixCollegeTable = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Check if code column exists
    const checkColumn = await sequelize.query(
      `SELECT column_name FROM information_schema.columns 
       WHERE table_name='Colleges' AND column_name='code'`,
      { type: QueryTypes.SELECT }
    );

    if (checkColumn.length > 0) {
      console.log('Found code column, recreating it...');
      
      // Drop the column
      await sequelize.query(
        `ALTER TABLE "Colleges" DROP COLUMN IF EXISTS "code" CASCADE`,
        { type: QueryTypes.RAW }
      );
      console.log('✅ Dropped code column');
    }

    // Add the column back correctly
    console.log('Adding code column...');
    await sequelize.query(
      `ALTER TABLE "Colleges" ADD COLUMN "code" VARCHAR(255)`,
      { type: QueryTypes.RAW }
    );

    // Update existing rows with code from domain
    await sequelize.query(
      `UPDATE "Colleges" SET "code" = split_part(domain, '.', 1) WHERE "code" IS NULL`,
      { type: QueryTypes.RAW }
    );

    // Make it NOT NULL
    await sequelize.query(
      `ALTER TABLE "Colleges" ALTER COLUMN "code" SET NOT NULL`,
      { type: QueryTypes.RAW }
    );

    // Add UNIQUE constraint
    await sequelize.query(
      `ALTER TABLE "Colleges" ADD CONSTRAINT "Colleges_code_unique" UNIQUE ("code")`,
      { type: QueryTypes.RAW }
    );

    // Add comment
    await sequelize.query(
      `COMMENT ON COLUMN "Colleges"."code" IS 'College code used in email addresses'`,
      { type: QueryTypes.RAW }
    );

    console.log('✅ Code column fixed successfully!');
    
    // Verify the fix
    const verify = await sequelize.query(
      `SELECT code, domain FROM "Colleges" LIMIT 5`,
      { type: QueryTypes.SELECT }
    );
    console.log('Sample data after fix:', verify);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing college table:', error);
    process.exit(1);
  }
};

fixCollegeTable();