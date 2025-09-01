const express = require('express');
const router = express.Router();
const { Election } = require('../models');
const { generateDataKey } = require('../crypto');
const requireAuth = require('../middleware/auth'); // ✅ only this

// Create election
router.post('/elections', requireAuth('admin'), async (req, res) => {
  try {
    const { name } = req.body;
    const { wrapped, plaintext } = generateDataKey();
    const election = await Election.create({
      name,
      status: 'draft',
      dataKeyWrapped: wrapped
    });
    res.json(election);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create election' });
  }
});

// Open election
router.post('/elections/:id/open', requireAuth('admin'), async (req, res) => {
  const election = await Election.findByPk(req.params.id);
  if (!election) return res.status(404).json({ error: 'Not found' });
  election.status = 'open';
  await election.save();
  res.json(election);
});

// Close election
router.post('/elections/:id/close', requireAuth('admin'), async (req, res) => {
  const election = await Election.findByPk(req.params.id);
  if (!election) return res.status(404).json({ error: 'Not found' });
  election.status = 'closed';
  await election.save();
  res.json(election);
});

// Tally votes
router.post('/elections/:id/tally', requireAuth('admin'), async (req, res) => {
  const election = await Election.findByPk(req.params.id);
  if (!election) return res.status(404).json({ error: 'Not found' });

  const ballots = await election.getBallots();
  res.json({ count: ballots.length });
});

module.exports = router;

