const express = require('express');
const router = express.Router();
const auth = require('../middlewar/auth');
const Food = require('../models/Food');

// Get all foods for user (today)
router.get('/today', auth, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const foods = await Food.find({
      userId: req.userId,
      date: { $gte: startOfDay },
    }).sort({ date: -1 });
    
    res.json(foods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add food
router.post('/', auth, async (req, res) => {
  try {
    const { foodName, calories, mealType } = req.body;
    const food = new Food({
      userId: req.userId,
      foodName,
      calories,
      mealType,
    });
    await food.save();
    res.status(201).json(food);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete food
router.delete('/:id', auth, async (req, res) => {
  try {
    const food = await Food.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!food) {
      return res.status(404).json({ error: 'Food not found' });
    }
    res.json({ message: 'Food deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;