const express = require('express');
const router = express.Router();
const Expense = require('../models/expenses');

// Create an expense
router.post('/', async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    const populated = await expense
      .populate('paid_by', 'name email')
      .populate('group_id', 'name')
      .populate('splitAmount', 'name email')
      .populate('customSplit.user', 'name email')
    res.status(201).json(populated);
  } catch (err) {
    console.error('Error saving expense:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Get all expenses
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate('paid_by', 'name email')
      .populate('group_id', 'name')
      .populate('splitAmount', 'name email')
      .populate('customSplit.user', 'name email');
    res.json(expenses);
  } catch (err) {
    console.error('Error fetching expenses:', err.message);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

module.exports = router;
