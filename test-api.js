const axios = require('axios');

// Test the colleges endpoint
axios.get('http://localhost:5001/api/colleges')
  .then(response => {
    console.log('✅ API Test Success:', response.data);
    console.log(`📊 Found ${response.data.count} colleges`);
    response.data.colleges.forEach(college => {
      console.log(`  🏛️ ${college.name} (${college.domain})`);
    });
  })
  .catch(error => {
    console.error('❌ API Test Failed:', error.message);
  });
