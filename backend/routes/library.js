const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const WorkoutLibrary = require('../models/WorkoutLibrary');

// ==================== GET USER LIBRARY ====================
// Returns the stored per-user workout library customizations.
// Frontend uses this to restore edits / deleted exercises / custom categories.
router.get('/', auth, async (req, res) => {
  console.log('\n📚 ========== GET LIBRARY ==========');
  console.log('📚 UserId:', req.userId);

  try {
    const library = await WorkoutLibrary.findOne({ userId: req.userId });

    if (!library) {
      // First time: return empty state — frontend will show only defaults
      console.log('📚 No library found, returning empty state');
      return res.json({ categories: [] });
    }

    console.log(`✅ Library found: ${library.categories.length} categories`);
    console.log('====================================\n');

    res.json({ categories: library.categories });
  } catch (error) {
    console.log('\n❌ ========== GET LIBRARY ERROR ==========');
    console.error('❌ Error:', error.message);
    console.log('=========================================\n');
    res.status(500).json({ error: error.message });
  }
});

// ==================== SYNC USER LIBRARY ====================
// Receives the full customization state from the frontend and persists it.
// Uses upsert so first-time saves and updates both work.
router.post('/sync', auth, async (req, res) => {
  console.log('\n💾 ========== SYNC LIBRARY ==========');
  console.log('💾 UserId:', req.userId);

  try {
    const { categories } = req.body;

    if (!Array.isArray(categories)) {
      return res.status(400).json({ error: 'categories must be an array' });
    }

    console.log(`💾 Syncing ${categories.length} categories`);

    const library = await WorkoutLibrary.findOneAndUpdate(
      { userId: req.userId },
      {
        userId: req.userId,
        categories,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    console.log('✅ Library synced successfully');
    console.log('====================================\n');

    res.json({ success: true, categories: library.categories });
  } catch (error) {
    console.log('\n❌ ========== SYNC LIBRARY ERROR ==========');
    console.error('❌ Error:', error.message);
    console.log('=========================================\n');
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
