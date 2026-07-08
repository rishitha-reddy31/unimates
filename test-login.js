const axios = require('axios');

const loginData = {
  email: "newuser@mrct.edu",
  password: "password123"
};

axios.post('http://localhost:5001/api/auth/login', loginData)
  .then(response => {
    console.log('Login Success:', response.data);
  })
  .catch(error => {
    console.error('Login Error:', error.response?.data || error.message);
  });
