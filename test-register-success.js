const axios = require('axios');

// Test registration with your email domain
const registrationData = {
  email: "23N31A05W9@mrcet.ac.in",
  password: "password123",
  name: "Test Student",
  branch: "CSE",
  year: "3rd",
  collegeDomain: "mrcet.ac.in"
};

console.log('📝 Testing registration with:', registrationData);

axios.post('http://localhost:5001/api/auth/register', registrationData)
  .then(response => {
    console.log('✅ Registration Success!');
    console.log('User:', response.data.user);
    console.log('Token:', response.data.token);
    
    // Test login with same credentials
    const loginData = {
      email: registrationData.email,
      password: registrationData.password
    };
    
    return axios.post('http://localhost:5001/api/auth/login', loginData);
  })
  .then(loginResponse => {
    console.log('✅ Login Success!');
    console.log('Welcome to Unimates!');
    console.log('You can now access your feed.');
  })
  .catch(error => {
    console.error('❌ Error:', error.response?.data || error.message);
  });
