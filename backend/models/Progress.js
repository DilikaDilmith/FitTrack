const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  weight: {
    type: Number,
  },
  bmi: {
    type: Number,
  },
  // Body Measurements
  chest: {
    type: Number,
    default: 0,
  },
  waist: {
    type: Number,
    default: 0,
  },
  hips: {
    type: Number,
    default: 0,
  },
  arms: {
    type: Number,
    default: 0,
  },
  thighs: {
    type: Number,
    default: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Progress', ProgressSchema);