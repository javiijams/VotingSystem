const crypto = require('crypto');

const MASTER_KEY = Buffer.from(process.env.MASTER_KEY_BASE64 || '', 'base64');
if (MASTER_KEY.length !== 32) {
  console.warn('MASTER_KEY_BASE64 should be 32 bytes base64 for AES-256. Current length:', MASTER_KEY.length);
}

// AES-GCM encrypt
function aesGcmEncrypt(key, plaintext, aad = '') {
  const iv = crypto.randomBytes(12); // 96-bit
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv, { authTagLength: 16 });
  if (aad) cipher.setAAD(Buffer.from(aad));
  const ct = Buffer.concat([cipher.update(JSON.stringify(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { iv: iv.toString('base64'), ciphertext: ct.toString('base64'), tag: tag.toString('base64') };
}

function aesGcmDecrypt(key, ivB64, ctB64, tagB64, aad = '') {
  const iv = Buffer.from(ivB64, 'base64');
  const ct = Buffer.from(ctB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv, { authTagLength: 16 });
  if (aad) decipher.setAAD(Buffer.from(aad));
  decipher.setAuthTag(tag);
  const pt = Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
  return JSON.parse(pt);
}

// "Wrap" data key with master key (simple envelope)
function wrapDataKey(dataKey) {
  // dataKey: Buffer(32)
  const { iv, ciphertext, tag } = aesGcmEncrypt(MASTER_KEY, dataKey.toString('base64'), 'wrap');
  return JSON.stringify({ iv, ciphertext, tag });
}

function unwrapDataKey(wrappedString) {
  if (!wrappedString) throw new Error('no wrapped key');
  const obj = JSON.parse(wrappedString);
  const base64 = aesGcmDecrypt(MASTER_KEY, obj.iv, obj.ciphertext, obj.tag, 'wrap');
  return Buffer.from(base64, 'base64'); // data key buffer
}

// create random data key (32 bytes)
function generateDataKey() {
  return crypto.randomBytes(32);
}

module.exports = { aesGcmEncrypt, aesGcmDecrypt, wrapDataKey, unwrapDataKey, generateDataKey };
