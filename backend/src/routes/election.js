// src/routes/election.js
const express = require('express');
const router = express.Router();
const { Election, Candidate, Ballot } = require('../models');
const requireAuth = require('../middleware/auth');
const speakeasy = require('speakeasy');
const { unwrapDataKey, aesGcmEncrypt } = require('../crypto');
const crypto = require('crypto');

const MASTER_KEY = Buffer.from(process.env.MASTER_KEY_BASE64 || '', 'base64');

// 🔐 Decrypt TOTP secret
function decryptTotpEnc(enc) {
  const o = JSON.parse(enc);
  const iv = Buffer.from(o.iv, 'base64');
  const ct = Buffer.from(o.ct, 'base64');
  const tag = Buffer.from(o.tag, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', MASTER_KEY, iv, { authTagLength: 16 });
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
}

/* ===========================
   ROUTES
=========================== */

// 📋 List ALL elections
router.get('/', async (req, res) => {
  try {
    const elections = await Election.findAll();
    res.json(elections);
  } catch (err) {
    console.error('Error fetching elections:', err);
    res.status(500).json({ error: 'Failed to fetch elections' });
  }
});

// 📋 Get a single election by ID
router.get('/:eid', async (req, res) => {
  try {
    const { eid } = req.params;
    const election = await Election.findByPk(eid);
    if (!election) return res.status(404).json({ error: 'Election not found' });
    res.json(election);
  } catch (err) {
    console.error('Error fetching election:', err);
    res.status(500).json({ error: 'Failed to fetch election' });
  }
});

// 📋 List candidates for a given election
router.get('/:eid/candidates', async (req, res) => {
  try {
    const { eid } = req.params;
    const candidates = await Candidate.findAll({ where: { electionId: eid } });
    res.json(candidates);
  } catch (err) {
    console.error('Error fetching candidates:', err);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// 🗳️ Cast a ballot (student only)
router.post('/:eid/ballots', requireAuth('student'), async (req, res) => {
  try {
    const { eid } = req.params;
    const { candidateId, totp } = req.body;

    if (!req.user) return res.status(401).json({ error: 'auth' });
    if (req.user.role !== 'student') return res.status(403).json({ error: 'only students' });

    const election = await Election.findByPk(eid);
    if (!election) return res.status(404).json({ error: 'no election' });
    if (election.status !== 'open') return res.status(403).json({ error: 'voting closed' });

    // 🔑 Verify TOTP
    const secret = decryptTotpEnc(req.user.totpSecretEnc);
    const ok = speakeasy.totp.verify({ secret, encoding: 'base32', token: totp, window: 1 });
    if (!ok) return res.status(401).json({ error: 'invalid totp' });

    // 🔒 Prevent duplicate votes
    const salt = 'election_salt_v1'; // TODO: generate per-election in production
    const voterHash = crypto.createHash('sha256').update(req.user.id + eid + salt).digest('hex');

    const exists = await Ballot.findOne({ where: { electionId: eid, voterHash } });
    if (exists) return res.status(409).json({ error: 'already voted' });

    // Encrypt ballot
    const dataKey = unwrapDataKey(election.dataKeyWrapped);
    const aad = JSON.stringify({ electionId: eid, ts: Date.now() });
    const { iv, ciphertext, tag } = aesGcmEncrypt(dataKey, { candidateId, ts: Date.now() }, aad);

    await Ballot.create({ electionId: eid, voterHash, ciphertext, iv, tag, aad });

    res.json({ ok: true });
  } catch (err) {
    console.error('Error casting ballot:', err);
    res.status(500).json({ error: 'Failed to cast ballot' });
  }
});

module.exports = router;

