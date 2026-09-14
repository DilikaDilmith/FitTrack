const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Food = require('../models/Food');

// ========== GET TODAY'S FOODS ==========
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

// ========== GET FOODS BY DATE ==========
router.get('/date/:date', auth, async (req, res) => {
  try {
    const targetDate = new Date(req.params.date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const foods = await Food.find({
      userId: req.userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ date: -1 });

    res.json(foods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== GET WEEKLY SUMMARY ==========
router.get('/weekly', auth, async (req, res) => {
  try {
    const days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);

      const endOfDay = new Date(day);
      endOfDay.setHours(23, 59, 59, 999);

      const foods = await Food.find({
        userId: req.userId,
        date: { $gte: day, $lte: endOfDay },
      });

      const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0);
      const totalProtein = foods.reduce((sum, f) => sum + (f.protein || 0), 0);
      const totalCarbs = foods.reduce((sum, f) => sum + (f.carbs || 0), 0);
      const totalFat = foods.reduce((sum, f) => sum + (f.fat || 0), 0);
      const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = day.toISOString().split('T')[0];

      days.push({
        date: day.toISOString(),
        dateStr,
        dayName,
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
      });
    }

    res.json(days);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ADD FOOD ==========
router.post('/', auth, async (req, res) => {
  console.log('🍔 Add food:', req.body);

  try {
    const {
      foodName,
      calories,
      mealType,
      protein,
      carbs,
      fat,
      quantity,
      date,
    } = req.body;

    if (!foodName || !calories || !mealType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const food = new Food({
      userId: req.userId,
      foodName,
      calories,
      mealType,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
      quantity: quantity || 1,
      date: date ? new Date(date) : new Date(),
    });

    await food.save();
    console.log('✅ Food saved:', food._id);
    res.status(201).json(food);
  } catch (error) {
    console.error('❌ Food error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ========== UPDATE FOOD ==========
router.put('/:id', auth, async (req, res) => {
  try {
    const { foodName, calories, mealType, protein, carbs, fat, quantity } = req.body;

    const food = await Food.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        foodName,
        calories,
        mealType,
        protein: protein || 0,
        carbs: carbs || 0,
        fat: fat || 0,
        quantity: quantity || 1,
      },
      { new: true }
    );

    if (!food) {
      return res.status(404).json({ error: 'Food not found' });
    }

    res.json(food);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== DELETE FOOD ==========
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