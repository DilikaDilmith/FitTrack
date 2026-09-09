const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  name: String,
  sets: Number,
  reps: Number,
  weight: Number,
});

const WorkoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  workoutName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Chest', 'Arms', 'Legs', 'Abs', 'Cardio', 'Yoga'],
  },
  exercises: [ExerciseSchema],
  duration: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Workout', WorkoutSchema);