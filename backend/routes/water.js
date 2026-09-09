const express = require('express');
const router = express.Router();
const auth = require('../middlewar/auth');
const Water = require('../models/Water');

// Get today's water
router.get('/today', auth, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    let water = await Water.findOne({
      userId: req.userId,
      date: { $gte: startOfDay },
    });
    
    if (!water) {
      water = { glasses: 0 };
    }
    
    res.json(water);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add/Update water
router.post('/', auth, async (req, res) => {
  try {
    const { glasses } = req.body;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    let water = await Water.findOne({
      userId: req.userId,
      date: { $gte: startOfDay },
    });
    
    if (water) {
      water.glasses = glasses;
      await water.save();
    } else {
      water = new Water({
        userId: req.userId,
        glasses,
      });
      await water.save();
    }
    
    res.json(water);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;