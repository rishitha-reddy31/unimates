// backend/test-bcrypt.js
const bcrypt = require('bcryptjs');

async function testBcrypt() {
  const password = 'tharuni123';
  
  // Generate hash
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  
  console.log('Password:', password);
  console.log('Generated hash:', hash);
  console.log('');
  
  // Test comparison
  const match = await bcrypt.compare(password, hash);
  console.log('Compare with same password:', match ? '✅ OK' : '❌ FAILED');
  
  // Test with wrong password
  const wrongMatch = await bcrypt.compare('wrongpassword', hash);
  console.log('Compare with wrong password:', wrongMatch ? '❌ Should be false' : '✅ OK (false)');
  
  // Test with your hash (replace with your actual hash from database)
  const yourHash = '$2a$10$Y/Lyj6xWhEkXK...'; // Use your actual hash
  if (yourHash.length > 10) {
    const yourMatch = await bcrypt.compare(password, yourHash);
    console.log('Compare with your hash:', yourMatch ? '✅ OK' : '❌ FAILED');
  }
}

testBcrypt();