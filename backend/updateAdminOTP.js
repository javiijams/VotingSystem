const { User } = require('./src/models');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

(async () => {
  try {
    // Generate a new TOTP secret
    const secret = speakeasy.generateSecret({ name: 'CATSU iVote (Admin)' });

    // Find the admin by email
    const admin = await User.findOne({ where: { email: 'admin@catsu.edu.ph' } });

    if (!admin) {
      throw new Error('❌ Admin user not found!');
    }

    // Update the admin record with the OTP secret
    admin.totpSecretEnc = JSON.stringify({ secret: secret.base32 });
    await admin.save();

    // Generate a QR code for easy setup
    await qrcode.toFile('admin-otp.png', secret.otpauth_url);

    console.log('✅ OTP added to existing admin account!');
    console.log('Scan the QR code in "admin-otp.png" with Google Authenticator or Authy.');
    console.log('Backup Secret:', secret.base32);
  } catch (err) {
    console.error('❌ Error updating admin:', err);
  }
})();
