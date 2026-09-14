const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Progress = require('../models/Progress');

// Get all progress (last 90 entries)
router.get('/', auth, async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(90);
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new progress entry
router.post('/', auth, async (req, res) => {
  console.log('📊 Progress POST:', req.body);

  try {
    const { weight, bmi, chest, waist, hips, arms, thighs } = req.body;

    if (!weight) {
      return res.status(400).json({ error: 'Weight is required' });
    }

    const progress = new Progress({
      userId: req.userId,
      weight,
      bmi: bmi || 0,
      chest: chest || 0,
      waist: waist || 0,
      hips: hips || 0,
      arms: arms || 0,
      thighs: thighs || 0,
    });

    await progress.save();
    console.log('✅ Progress saved:', progress._id);
    res.status(201).json(progress);
  } catch (error) {
    console.error('❌ Progress error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Update progress
router.put('/:id', auth, async (req, res) => {
  try {
    const progress = await Progress.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!progress) {
      return res.status(404).json({ error: 'Progress not found' });
    }
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete progress
router.delete('/:id', auth, async (req, res) => {
  try {
    const progress = await Progress.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!progress) {
      return res.status(404).json({ error: 'Progress entry not found' });
    }
    res.json({ message: 'Progress deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;