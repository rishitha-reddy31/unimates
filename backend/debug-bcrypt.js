// backend/debug-bcrypt.js
const bcrypt = require('bcryptjs');

async function debugBcrypt() {
  console.log('🔬 BCRYPT DEBUGGING\n');
  
  const password = 'tharuni123';
  
  // Test 1: Generate hash and compare immediately
  console.log('Test 1: Generate and compare in same process');
  const salt1 = await bcrypt.genSalt(10);
  const hash1 = await bcrypt.hash(password, salt1);
  console.log('Generated hash:', hash1);
  const compare1 = await bcrypt.compare(password, hash1);
  console.log('Compare result:', compare1 ? '✅ SUCCESS' : '❌ FAILED');
  console.log('');
  
  // Test 2: Use the hash from your database
  console.log('Test 2: Test with your database hash');
  const dbHash = '$2a$10$Y/Lyj6xWhEkXK...'; // Use the NEW hash from your output
  console.log('DB Hash:', dbHash);
  const compare2 = await bcrypt.compare(password, dbHash);
  console.log('Compare result:', compare2 ? '✅ SUCCESS' : '❌ FAILED');
  console.log('');
  
  // Test 3: Try different salt rounds
  console.log('Test 3: Test with different salt rounds');
  for (let rounds of [8, 10, 12]) {
    const salt = await bcrypt.genSalt(rounds);
    const hash = await bcrypt.hash(password, salt);
    const compare = await bcrypt.compare(password, hash);
    console.log(`Rounds ${rounds}: ${compare ? '✅' : '❌'} - ${hash.substring(0, 30)}...`);
  }
  console.log('');
  
  // Test 4: Check bcrypt version
  console.log('Test 4: Bcrypt version info');
  console.log('bcrypt version:', require('bcryptjs/package.json').version);
  console.log('Node version:', process.version);
}

debugBcrypt().catch(console.error);