const axios = require('axios');

const testData = {
  email: "newuser@mrct.edu",
  password: "password123",
  name: "New User",
  branch: "CSE",
  year: "3rd",
  collegeDomain: "mrct.edu"
};

axios.post('http://localhost:5001/api/auth/register', testData)
  .then(response => {
    console.log('Success:', response.data);
  })
  .catch(error => {
    console.error('Error:', error.response?.data || error.message);
  });
