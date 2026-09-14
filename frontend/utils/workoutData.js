// Default Workout Library - Categories සහ Exercises
export const defaultWorkoutData = {
  Chest: {
    emoji: '🏋️',
    exercises: [
      { id: 'ch1', name: 'Bench Press', sets: 3, reps: 12 },
      { id: 'ch2', name: 'Push Ups', sets: 3, reps: 15 },
      { id: 'ch3', name: 'Dumbbell Press', sets: 3, reps: 12 },
      { id: 'ch4', name: 'Cable Flyes', sets: 3, reps: 15 },
      { id: 'ch5', name: 'Incline Press', sets: 3, reps: 10 },
      { id: 'ch6', name: 'Dips', sets: 3, reps: 12 },
    ],
  },
  Back: {
    emoji: '🔙',
    exercises: [
      { id: 'bk1', name: 'Pull Ups', sets: 3, reps: 10 },
      { id: 'bk2', name: 'Barbell Rows', sets: 3, reps: 12 },
      { id: 'bk3', name: 'Lat Pulldown', sets: 3, reps: 12 },
      { id: 'bk4', name: 'Deadlift', sets: 3, reps: 8 },
      { id: 'bk5', name: 'Seated Rows', sets: 3, reps: 12 },
    ],
  },
  Arms: {
    emoji: '💪',
    exercises: [
      { id: 'ar1', name: 'Bicep Curls', sets: 3, reps: 12 },
      { id: 'ar2', name: 'Tricep Dips', sets: 3, reps: 15 },
      { id: 'ar3', name: 'Hammer Curls', sets: 3, reps: 12 },
      { id: 'ar4', name: 'Skull Crushers', sets: 3, reps: 10 },
      { id: 'ar5', name: 'Preacher Curls', sets: 3, reps: 12 },
      { id: 'ar6', name: 'Cable Pushdowns', sets: 3, reps: 15 },
    ],
  },
  Legs: {
    emoji: '🦵',
    exercises: [
      { id: 'lg1', name: 'Squats', sets: 3, reps: 15 },
      { id: 'lg2', name: 'Lunges', sets: 3, reps: 12 },
      { id: 'lg3', name: 'Leg Press', sets: 3, reps: 15 },
      { id: 'lg4', name: 'Calf Raises', sets: 3, reps: 20 },
      { id: 'lg5', name: 'Leg Curls', sets: 3, reps: 12 },
      { id: 'lg6', name: 'Leg Extensions', sets: 3, reps: 12 },
    ],
  },
  Shoulders: {
    emoji: '🎯',
    exercises: [
      { id: 'sh1', name: 'Overhead Press', sets: 3, reps: 10 },
      { id: 'sh2', name: 'Lateral Raises', sets: 3, reps: 15 },
      { id: 'sh3', name: 'Front Raises', sets: 3, reps: 12 },
      { id: 'sh4', name: 'Shrugs', sets: 3, reps: 15 },
      { id: 'sh5', name: 'Face Pulls', sets: 3, reps: 15 },
    ],
  },
  Abs: {
    emoji: '🔥',
    exercises: [
      { id: 'ab1', name: 'Crunches', sets: 3, reps: 20 },
      { id: 'ab2', name: 'Plank', sets: 3, reps: 60 },
      { id: 'ab3', name: 'Leg Raises', sets: 3, reps: 15 },
      { id: 'ab4', name: 'Russian Twists', sets: 3, reps: 20 },
      { id: 'ab5', name: 'Mountain Climbers', sets: 3, reps: 30 },
      { id: 'ab6', name: 'Bicycle Crunches', sets: 3, reps: 20 },
    ],
  },
  Cardio: {
    emoji: '🏃',
    exercises: [
      { id: 'cd1', name: 'Running', sets: 1, reps: 30 },
      { id: 'cd2', name: 'Jump Rope', sets: 3, reps: 60 },
      { id: 'cd3', name: 'Cycling', sets: 1, reps: 30 },
      { id: 'cd4', name: 'Burpees', sets: 3, reps: 15 },
      { id: 'cd5', name: 'High Knees', sets: 3, reps: 45 },
    ],
  },
  Yoga: {
    emoji: '🧘',
    exercises: [
      { id: 'yg1', name: 'Sun Salutation', sets: 3, reps: 10 },
      { id: 'yg2', name: 'Warrior Pose', sets: 3, reps: 60 },
      { id: 'yg3', name: 'Tree Pose', sets: 3, reps: 60 },
      { id: 'yg4', name: 'Child Pose', sets: 3, reps: 60 },
      { id: 'yg5', name: 'Downward Dog', sets: 3, reps: 45 },
    ],
  },
  Glutes: {
    emoji: '🍑',
    exercises: [
      { id: 'gl1', name: 'Hip Thrusts', sets: 3, reps: 15 },
      { id: 'gl2', name: 'Glute Bridges', sets: 3, reps: 15 },
      { id: 'gl3', name: 'Bulgarian Split Squats', sets: 3, reps: 10 },
      { id: 'gl4', name: 'Kickbacks', sets: 3, reps: 12 },
    ],
  },
};

// Weekdays
export const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];