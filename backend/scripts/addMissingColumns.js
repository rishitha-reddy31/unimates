// scripts/add-missing-columns.js
const { sequelize } = require('../src/config/database');
const { QueryTypes } = require('sequelize');

async function addMissingColumns() {
  try {
    console.log('🔍 Checking for missing columns...');

    // Check if blockedUsers column exists
    const blockedUsersCheck = await sequelize.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name='Users' AND column_name='blockedUsers'`,
      { type: QueryTypes.SELECT }
    );

    if (blockedUsersCheck.length === 0) {
      console.log('📦 Adding blockedUsers column...');
      await sequelize.query(
        `ALTER TABLE "Users" ADD COLUMN "blockedUsers" JSON DEFAULT '[]'::json;`
      );
      console.log('✅ blockedUsers column added');
    } else {
      console.log('✅ blockedUsers column already exists');
    }

    // Check if skills column exists
    const skillsCheck = await sequelize.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name='Users' AND column_name='skills'`,
      { type: QueryTypes.SELECT }
    );

    if (skillsCheck.length === 0) {
      console.log('📦 Adding skills column...');
      await sequelize.query(
        `ALTER TABLE "Users" ADD COLUMN "skills" JSON DEFAULT '[]'::json;`
      );
      console.log('✅ skills column added');
    }

    // Check if interests column exists
    const interestsCheck = await sequelize.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name='Users' AND column_name='interests'`,
      { type: QueryTypes.SELECT }
    );

    if (interestsCheck.length === 0) {
      console.log('📦 Adding interests column...');
      await sequelize.query(
        `ALTER TABLE "Users" ADD COLUMN "interests" JSON DEFAULT '[]'::json;`
      );
      console.log('✅ interests column added');
    }

    // Check if hobbies column exists
    const hobbiesCheck = await sequelize.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name='Users' AND column_name='hobbies'`,
      { type: QueryTypes.SELECT }
    );

    if (hobbiesCheck.length === 0) {
      console.log('📦 Adding hobbies column...');
      await sequelize.query(
        `ALTER TABLE "Users" ADD COLUMN "hobbies" JSON DEFAULT '[]'::json;`
      );
      console.log('✅ hobbies column added');
    }

    // Check if projects column exists
    const projectsCheck = await sequelize.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name='Users' AND column_name='projects'`,
      { type: QueryTypes.SELECT }
    );

    if (projectsCheck.length === 0) {
      console.log('📦 Adding projects column...');
      await sequelize.query(
        `ALTER TABLE "Users" ADD COLUMN "projects" JSON DEFAULT '[]'::json;`
      );
      console.log('✅ projects column added');
    }

    // Check if achievements column exists
    const achievementsCheck = await sequelize.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name='Users' AND column_name='achievements'`,
      { type: QueryTypes.SELECT }
    );

    if (achievementsCheck.length === 0) {
      console.log('📦 Adding achievements column...');
      await sequelize.query(
        `ALTER TABLE "Users" ADD COLUMN "achievements" JSON DEFAULT '[]'::json;`
      );
      console.log('✅ achievements column added');
    }

    // Check if coverPicture column exists
    const coverPictureCheck = await sequelize.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name='Users' AND column_name='coverPicture'`,
      { type: QueryTypes.SELECT }
    );

    if (coverPictureCheck.length === 0) {
      console.log('📦 Adding coverPicture column...');
      await sequelize.query(
        `ALTER TABLE "Users" ADD COLUMN "coverPicture" VARCHAR(255) DEFAULT '';`
      );
      console.log('✅ coverPicture column added');
    }

    console.log('✅ All missing columns have been added!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding columns:', error);
    process.exit(1);
  }
}

addMissingColumns();