const express = require('express');
const router = express.Router();
const auth = require('../middlewar/auth');
const Workout = require('../models/Workout');

// Get all workouts for user
router.get('/', auth, async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.userId })
      .sort({ date: -1 });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add workout
router.post('/', auth, async (req, res) => {
  try {
    const { workoutName, category, exercises, duration } = req.body;
    const workout = new Workout({
      userId: req.userId,
      workoutName,
      category,
      exercises,
      duration,
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