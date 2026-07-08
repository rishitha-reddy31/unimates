// test-profile-update.js
const axios = require('axios');

async function testProfileUpdate() {
  try {
    // First login to get token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: '23n31a05w9@mrcet.ac.in',
      password: 'your-password-here'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');

    // Test profile update
    const updateResponse = await axios.put(
      'http://localhost:5000/api/users/update',
      {
        fullName: 'Test User Updated',
        bio: 'This is my updated bio',
        branch: 'Computer Science',
        year: '3rd',
        skills: ['JavaScript', 'React', 'Node.js'],
        interests: ['Coding', 'Reading'],
        hobbies: ['Gaming', 'Traveling']
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Profile updated successfully');
    console.log('Updated user:', updateResponse.data.user);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testProfileUpdate();