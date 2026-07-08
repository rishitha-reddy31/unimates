// backend/test-register.js
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Generate a unique email by adding a timestamp
const timestamp = Date.now();
const uniqueEmail = `23n31a05t8_${timestamp}@mrcet.ac.in`;

const testUser = {
  username: "tharuni_test_" + timestamp,
  email: uniqueEmail,  // Use unique email
  password: "tharuni123",
  fullName: "Tharuni",
  branch: "CSE",
  year: "3rd",
  college: "8cdb0274-7232-41cc-8eca-7e2af0d0fbb4",
  bio: "dance",
  interests: ["Web Development"],
  skills: ["JavaScript"]
};

console.log('🔍 Testing registration with:');
console.log('📧 Email:', uniqueEmail);
console.log('👤 Username:', testUser.username);
console.log('📡 Connecting to:', API_URL);

async function testRegistration() {
  try {
    // Test if server is reachable
    console.log('\n📡 Testing server connection...');
    const testRes = await axios.get(`${API_URL}/auth/test`);
    console.log('✅ Server is responding');

    // Then try registration
    console.log('\n📡 Sending registration request...');
    const res = await axios.post(`${API_URL}/auth/register`, testUser);
    
    console.log('✅ Registration successful!');
    console.log('Response:', JSON.stringify(res.data, null, 2));
    
    // Try login with the new credentials
    console.log('\n📡 Testing login with new credentials...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: uniqueEmail,
      password: "tharuni123"
    });
    
    console.log('✅ Login successful!');
    console.log('User:', loginRes.data.user?.fullName || loginRes.data.data?.user?.fullName);
    
  } catch (error) {
    console.error('\n❌ Error:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data?.message);
      console.error('Full error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testRegistration();