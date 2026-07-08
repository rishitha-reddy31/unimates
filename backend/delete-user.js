// backend/delete-user.js
const { sequelize, User } = require('./src/models');

async function deleteUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');
    
    const deleted = await User.destroy({
      where: { email: '23n31a05t8@mrcet.ac.in' }
    });
    
    if (deleted) {
      console.log('✅ User deleted successfully');
    } else {
      console.log('❌ User not found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deleteUser();