// routes/groups.js
const express = require('express');
const router = express.Router();
const Group = require('../models/groups');

// Create a group
router.post('/', async (req, res) => {
  try {
    const group = new Group(req.body);
    await group.save();
    const populatedGroup = await Group.findById(group._id)
      .populate('members', 'name email')
      .populate('created_by', 'name email');

    res.status(201).json(populatedGroup);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all groups
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('members', 'name email')
      .populate('created_by', 'name email');

    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
