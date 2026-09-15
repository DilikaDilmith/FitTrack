const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Workout = require('../models/Workout');

// Get all workouts for user
router.get('/', auth, async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.userId }).sort({ date: -1 });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get weekly workout summary (last 7 days)
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

      const workouts = await Workout.find({
        userId: req.userId,
        date: { $gte: day, $lte: endOfDay },
      });

      const totalDuration = workouts.reduce(
        (sum, workout) => sum + (workout.duration || 0),
        0
      );
      const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });

      days.push({
        date: day.toISOString(),
        dayName,
        duration: totalDuration,
      });
    }

    res.json(days);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add workout
router.post('/', auth, async (req, res) => {
  try {
    const { workoutName, category, exercises, duration } = req.body;
    if (!workoutName) {
      return res.status(400).json({ error: 'Workout name is required' });
    }
    const workout = new Workout({
      userId: req.userId,
      workoutName,
      category: category || 'General',
      exercises: Array.isArray(exercises) ? exercises : [],
      duration: Number(duration) || 0,
    });
    await workout.save();
    res.status(201).json(workout);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete workout
router.delete('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    res.json({ message: 'Workout deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;