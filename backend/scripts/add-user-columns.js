// scripts/add-user-columns.js
const { sequelize } = require('../src/config/database');
const { QueryTypes } = require('sequelize');

async function addUserColumns() {
  try {
    console.log('🔍 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    console.log('📦 Checking and adding missing columns to Users table...');

    // Check and add blockedUsers column
    const blockedUsersCheck = await sequelize.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name='Users' AND column_name='blockedUsers'`,
      { type: QueryTypes.SELECT }
    );

    if (blockedUsersCheck.length === 0) {
      console.log('  Adding blockedUsers column...');
      await sequelize.query(
        `ALTER TABLE "Users" ADD COLUMN "blockedUsers" JSON DEFAULT '[]'::json;`
      );
      console.log('  ✅ blockedUsers column added');
    } else {
      console.log('  ✅ blockedUsers column already exists');
    }

    // Check and add skills column
    const skillsCheck = await sequelize.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name='Users' AND column_name='skills'`,
      { type: QueryTypes.SELECT }
    );

    if (skillsCheck.length === 0) {
      console.log('  Adding skills column...');
      await sequelize.query(
        `ALTER TABLE "Users" ADD COLUMN "skills" JSON DEFAULT '[]'::json;`
      );
      console.log('  ✅ skills column added');
    } else {
      console.log('  ✅ skills column already exists');
    }

    // Check and add interests column
    const interestsCheck = await sequelize.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name='Users' AND column_name='interests'`,
      { type: QueryTypes.SELECT }
    );

    if (interestsCheck.length === 0) {
      console.log('  Adding interests column...');
      await sequelize.query(
        `ALTER TABLE "Users" ADD COLUMN "interests" JSON DEFAULT '[]'::json;`
      );
      console.log('  ✅ interests column added');
    } else {
      console.log('  ✅ interests column already exists');
    }

    // Check and add hobbies column
    const hobbiesCheck = await sequelize.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name='Users' AND column_name='hobbies'`,
      { type: QueryTypes.SELECT }
    );

    if (hobbiesCheck.length === 0) {
      console.log('  Adding hobbies column...');
      await sequelize.query(
        `ALTER TABLE "Users" ADD COLUMN "hobbies" JSON DEFAULT '[]'::json;`
      );
      console.log('  ✅ hobbies column added');
    } else {
      console.log('  ✅ hobbies column already exists');
    }

    // Check and add projects column
    const projectsCheck = await sequelize.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name='Users' AND column_name='projects'`,
      { type: QueryTypes.SELECT }
    );

    if (projectsCheck.length === 0) {
      console.log('  Adding projects column...');
      await sequelize.query(
        `ALTER TABLE "Users" ADD COLUMN "projects" JSON DEFAULT '[]'::json;`
      );
      console.log('  ✅ projects column added');
    } else {
      console.log('  ✅ projects column already exists');
    }

    // Check and add achievements column
    const achievementsCheck = await sequelize.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name='Users' AND column_name='achievements'`,
      { type: QueryTypes.SELECT }
    );

    if (achievementsCheck.length === 0) {
      console.log('  Adding achievements column...');
      await sequelize.query(
        `ALTER TABLE "Users" ADD COLUMN "achievements" JSON DEFAULT '[]'::json;`
      );
      console.log('  ✅ achievements column added');
    } else {
      console.log('  ✅ achievements column already exists');
    }

    // Check and add coverPicture column
    const coverPictureCheck = await sequelize.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name='Users' AND column_name='coverPicture'`,
      { type: QueryTypes.SELECT }
    );

    if (coverPictureCheck.length === 0) {
      console.log('  Adding coverPicture column...');
      await sequelize.query(
        `ALTER TABLE "Users" ADD COLUMN "coverPicture" VARCHAR(255) DEFAULT '';`
      );
      console.log('  ✅ coverPicture column added');
    } else {
      console.log('  ✅ coverPicture column already exists');
    }

    console.log('✅ All columns have been checked and added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding columns:', error);
    process.exit(1);
  }
}

addUserColumns();