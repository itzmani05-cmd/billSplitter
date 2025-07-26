const express = require('express');
const router = express.Router();
const Settlement = require('../models/settlement');

router.post('/', async (req, res) => {
  try {
    const settlement = new Settlement(req.body);
    await settlement.save();
    res.json(settlement);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const settlements = await Settlement.find().populate('from_user to_user group_id');
  res.json(settlements);
});

module.exports = router;
