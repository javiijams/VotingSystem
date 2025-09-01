// src/routes/candidates.js
const express = require('express');
const router = express.Router();
const { Candidate } = require('../models');
const requireAuth = require('../middleware/auth');

// ➕ Add candidate (admin only)
router.post('/', requireAuth('admin'), async (req, res) => {
  try {
    const { electionId, name, position } = req.body;
    if (!electionId || !name || !position) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const candidate = await Candidate.create({ electionId, name, position });
    res.json(candidate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add candidate' });
  }
});

// 📋 List candidates (supports both path and query parameters)
router.get('/:electionId?', async (req, res) => {
  try {
    const electionId = req.params.electionId || req.query.electionId;

    if (!electionId) {
      return res.status(400).json({ error: 'Election ID is required' });
    }

    const candidates = await Candidate.findAll({ where: { electionId } });
    res.json(candidates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

module.exports = router;


