// scripts/create-follow-table.js
const { sequelize } = require('../src/config/database');
const { QueryTypes } = require('sequelize');

async function createFollowTable() {
  try {
    console.log('🔍 Checking if Follow table exists...');

    // Check if Follow table exists
    const tableCheck = await sequelize.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'Follows'
      );`,
      { type: QueryTypes.SELECT }
    );

    if (!tableCheck[0].exists) {
      console.log('📦 Creating Follow table...');
      
      await sequelize.query(`
        CREATE TABLE "Follows" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "followerId" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
          "followingId" UUID NOT NULL REFERENCES "Users"("id") ON DELETE CASCADE,
          "collegeId" UUID REFERENCES "Colleges"("id") ON DELETE SET NULL,
          "status" VARCHAR(20) DEFAULT 'accepted',
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          UNIQUE("followerId", "followingId")
        );
      `);

      console.log('✅ Follow table created');
      
      // Create indexes
      await sequelize.query(`
        CREATE INDEX "follows_followerId_idx" ON "Follows"("followerId");
        CREATE INDEX "follows_followingId_idx" ON "Follows"("followingId");
      `);
      
      console.log('✅ Follow table indexes created');
    } else {
      console.log('✅ Follow table already exists');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating Follow table:', error);
    process.exit(1);
  }
}

createFollowTable();