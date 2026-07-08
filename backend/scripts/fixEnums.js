const { sequelize } = require('../src/config/database');
const { QueryTypes } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const fixEnums = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Fix Forum enum
    console.log('Fixing Forum category enum...');
    await sequelize.query(
      `ALTER TYPE "enum_Forums_category" RENAME TO "enum_Forums_category_old";`,
      { type: QueryTypes.RAW }
    ).catch(() => console.log('Old enum may not exist'));
    
    await sequelize.query(
      `CREATE TYPE "enum_Forums_category" AS ENUM('ACADEMICS', 'CODING', 'PLACEMENTS', 'PROJECTS', 'INTERNSHIPS', 'GENERAL');`,
      { type: QueryTypes.RAW }
    );
    
    await sequelize.query(
      `ALTER TABLE "Forums" ALTER COLUMN "category" TYPE "enum_Forums_category" USING "category"::text::"enum_Forums_category";`,
      { type: QueryTypes.RAW }
    );
    
    await sequelize.query(
      `DROP TYPE "enum_Forums_category_old";`,
      { type: QueryTypes.RAW }
    ).catch(() => console.log('No old enum to drop'));

    // Fix AnonymousPost enum
    console.log('Fixing AnonymousPost category enum...');
    await sequelize.query(
      `ALTER TYPE "enum_AnonymousPosts_category" RENAME TO "enum_AnonymousPosts_category_old";`,
      { type: QueryTypes.RAW }
    ).catch(() => console.log('Old enum may not exist'));
    
    await sequelize.query(
      `CREATE TYPE "enum_AnonymousPosts_category" AS ENUM('CAMPUS', 'ACADEMIC', 'PLACEMENT', 'GENERAL', 'HOSTEL', 'CANTEEN', 'LIBRARY');`,
      { type: QueryTypes.RAW }
    );
    
    await sequelize.query(
      `ALTER TABLE "AnonymousPosts" ALTER COLUMN "category" TYPE "enum_AnonymousPosts_category" USING "category"::text::"enum_AnonymousPosts_category";`,
      { type: QueryTypes.RAW }
    );
    
    await sequelize.query(
      `DROP TYPE "enum_AnonymousPosts_category_old";`,
      { type: QueryTypes.RAW }
    ).catch(() => console.log('No old enum to drop'));

    console.log('✅ Enums fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing enums:', error);
    process.exit(1);
  }
};

fixEnums();