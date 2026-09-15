const mongoose = require('mongoose');

const EditedExerciseSchema = new mongoose.Schema({
  name: { type: String },
  sets: { type: Number },
  reps: { type: Number },
}, { _id: false });

const ExerciseEntrySchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  sets: { type: Number, default: 3 },
  reps: { type: Number, default: 12 },
  isCustom: { type: Boolean, default: true },
}, { _id: false });

const CustomCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  emoji: { type: String, default: '⭐' },
  isUserCreated: { type: Boolean, default: false }, // true = user created the whole category
  exercises: { type: [ExerciseEntrySchema], default: [] },          // user-added exercises
  editedExercises: { type: Map, of: EditedExerciseSchema, default: {} }, // edits to default/custom exercises
  deletedIds: { type: [String], default: [] },                      // IDs deleted from defaults
}, { _id: false });

const WorkoutLibrarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  categories: {
    type: [CustomCategorySchema],
    default: [],
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('WorkoutLibrary', WorkoutLibrarySchema);
