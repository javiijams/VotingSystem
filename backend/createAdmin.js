// Load environment variables
require('dotenv').config();

const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./src/models'); // Import sequelize and User

(async () => {
  try {
    // Ensure DB connection
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const password = 'SecurePass2025!'; // Change to your desired password
    const hash = await bcrypt.hash(password, 10);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: 'admin@catsu.edu.ph' } });
    if (existingAdmin) {
      console.log('⚠️ Admin already exists!');
      process.exit(0);
    }

    // Create admin user
    await User.create({
      email: 'admin@catsu.edu.ph',
      passwordHash: hash,
      role: 'admin',
      totpSecretEnc: '{}', // Add encrypted TOTP later if needed
      status: 'active',
    });

    console.log('✅ Admin user created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating admin:', err);
    process.exit(1);
  }
})();
