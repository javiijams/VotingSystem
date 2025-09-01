// Load env
require('dotenv').config();

const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./src/models');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const email = 'javiijams23@gmail.com'; // 
    const newPassword = 'Dikoalam23!';
    const hash = await bcrypt.hash(newPassword, 10);

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.error('❌ Admin not found!');
      process.exit(1);
    }

    user.passwordHash = hash;
    await user.save();

    console.log(`✅ Password reset for ${email}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error resetting admin password:', err);
    process.exit(1);
  }
})();
