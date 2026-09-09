const express = require('express');
const router = express.Router();
const auth = require('../middlewar/auth');
const Progress = require('../models/Progress');

// Get all progress
router.get('/', auth, async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(30);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add progress
router.post('/', auth, async (req, res) => {
  try {
    const { weight, bmi } = req.body;
    const progress = new Progress({
      userId: req.userId,
      weight,
      bmi,
    });
    await progress.save();
    res.status(201).json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;