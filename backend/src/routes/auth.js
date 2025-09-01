const express = require('express'); 
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const { User } = require('../models');
const { aesGcmEncrypt, aesGcmDecrypt } = require('../crypto');

const { MASTER_KEY_BASE64, JWT_SECRET } = process.env;
const MASTER_KEY = Buffer.from(MASTER_KEY_BASE64, 'base64');

// REGISTER (students only — admins must be created manually in DB)
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Force role = student
    const role = 'student';

    // Generate TOTP secret
    const secret = speakeasy.generateSecret({ length: 20 });

    // Encrypt the secret with AES-GCM
    const { iv, ciphertext, tag } = aesGcmEncrypt(
      MASTER_KEY,
      secret.base32,
      email
    );

    const passwordHash = await bcrypt.hash(password, 10);

    await User.create({
      email,
      passwordHash,
      role,
      totpSecretEnc: JSON.stringify({ iv, ciphertext, tag })
    });

    res.json({
      message: 'User registered successfully',
      role,
      qrDataUrl: secret.otpauth_url // scan with Google Authenticator
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({
      error: 'Registration failed',
      details: err.message
    });
  }
});

// LOGIN (OTP temporarily bypassed for testing)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // 2. Check password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    // 3. TEMPORARY: Skip OTP validation for testing
    console.warn('⚠️ OTP check temporarily bypassed for testing purposes.');

    // 4. Issue JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

module.exports = router;
