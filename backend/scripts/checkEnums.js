const { sequelize } = require('../src/config/database');
const { QueryTypes } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const checkEnums = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database\n');

    // Check Forum enum
    console.log('📊 Checking Forum category enum...');
    const forumEnum = await sequelize.query(
      `SELECT enum_range(NULL::"enum_Forums_category")`,
      { type: QueryTypes.SELECT }
    );
    console.log('Current Forum enum values:', forumEnum[0].enum_range);

    // Check AnonymousPost enum
    console.log('\n📊 Checking AnonymousPost category enum...');
    const anonymousEnum = await sequelize.query(
      `SELECT enum_range(NULL::"enum_AnonymousPosts_category")`,
      { type: QueryTypes.SELECT }
    );
    console.log('Current AnonymousPost enum values:', anonymousEnum[0].enum_range);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking enums:', error);
    process.exit(1);
  }
};

checkEnums();