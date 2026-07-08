// backend/test-api.js
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🔍 Testing API endpoints...\n');
  
  try {
    // Test 1: Auth test endpoint
    console.log('📡 Testing /api/auth/test...');
    const authTest = await axios.get(`${API_URL}/auth/test`);
    console.log('✅ Auth test passed:', authTest.data.message);
  } catch (error) {
    console.error('❌ Auth test failed:', error.response?.data || error.message);
  }

  try {
    // Test 2: Get colleges
    console.log('\n📡 Testing /api/colleges...');
    const colleges = await axios.get(`${API_URL}/colleges`);
    console.log(`✅ Found ${colleges.data.count} colleges`);
    console.log('First 3 colleges:');
    colleges.data.colleges.slice(0, 3).forEach(c => {
      console.log(`   - ${c.name} (${c.domain})`);
    });
  } catch (error) {
    console.error('❌ Colleges test failed:', error.response?.data || error.message);
  }
}

testAPI();