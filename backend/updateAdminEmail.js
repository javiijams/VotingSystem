// Load environment variables
require('dotenv').config();

const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./src/models');

(async () => {
  try {
    // Check DB connection
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const oldEmail = 'admin@catsu.edu.ph'; // current admin email in DB
    const newEmail = 'javiijams23@gmail.com'; // new email
    const newPassword = 'Dikoalam23!'; // new password

    const user = await User.findOne({ where: { email: oldEmail } });
    if (!user) {
      console.error(`❌ No user found with email: ${oldEmail}`);
      process.exit(1);
    }

    const hash = await bcrypt.hash(newPassword, 10);

    user.email = newEmail;
    user.passwordHash = hash;
    await user.save();

    console.log(`✅ Email updated to: ${newEmail}`);
    console.log(`✅ Password updated successfully!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating admin credentials:', err);
    process.exit(1);
  }
})();
