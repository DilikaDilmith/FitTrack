const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// ==================== REGISTER ====================
router.post('/register', async (req, res) => {
  console.log('\n📝 ========== REGISTER REQUEST ==========');
  console.log('📝 Request Body:', { ...req.body, password: '***' });

  try {
    const { name, email, password, age, height, weight, fitnessGoal } = req.body;

    if (!name || !email || !password) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ Email already registered:', email);
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      age: age || 0,
      height: height || 0,
      weight: weight || 0,
      fitnessGoal: fitnessGoal || 'Maintain Weight',
    });

    await user.save();
    console.log('✅ User saved:', user._id);

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        height: user.height,
        weight: user.weight,
        fitnessGoal: user.fitnessGoal,
        profilePicture: user.profilePicture || '',
      },
    });
    console.log('✅ ========== REGISTER SUCCESS ==========\n');
  } catch (error) {
    console.log('\n❌ ========== REGISTER ERROR ==========');
    console.error('❌ Error:', error.message);
    console.log('====================================\n');
    res.status(500).json({ error: error.message });
  }
});

// ==================== LOGIN ====================
router.post('/login', async (req, res) => {
  console.log('\n🔐 ========== LOGIN REQUEST ==========');
  console.log('🔐 Email:', req.body.email);

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('❌ Wrong password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    console.log('✅ ========== LOGIN SUCCESS ==========\n');

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        height: user.height,
        weight: user.weight,
        fitnessGoal: user.fitnessGoal,
        profilePicture: user.profilePicture || '',
      },
    });
  } catch (error) {
    console.log('\n❌ ========== LOGIN ERROR ==========');
    console.error('❌ Error:', error.message);
    console.log('================================\n');
    res.status(500).json({ error: error.message });
  }
});

// ==================== GET CURRENT USER (Protected) ====================
router.get('/me', auth, async (req, res) => {
  console.log('\n👤 ========== GET ME ==========');

  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ User found:', user.email);
    console.log('==============================\n');

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      age: user.age,
      height: user.height,
      weight: user.weight,
      fitnessGoal: user.fitnessGoal,
      profilePicture: user.profilePicture || '',
    });
  } catch (error) {
    console.log('\n❌ ========== GET ME ERROR ==========');
    console.error('❌ Error:', error.message);
    console.log('=================================\n');
    res.status(500).json({ error: error.message });
  }
});

// ==================== UPDATE PROFILE ====================
router.put('/profile', auth, async (req, res) => {
  console.log('\n✏️ ========== UPDATE PROFILE ==========');
  console.log('✏️ Request Body:', req.body);

  try {
    const { age, height, weight, fitnessGoal } = req.body;

    const updateData = {};
    if (age !== undefined && age !== null && age !== '') {
      updateData.age = parseInt(age);
    }
    if (height !== undefined && height !== null && height !== '') {
      updateData.height = parseFloat(height);
    }
    if (weight !== undefined && weight !== null && weight !== '') {
      updateData.weight = parseFloat(weight);
    }
    if (fitnessGoal !== undefined) {
      updateData.fitnessGoal = fitnessGoal;
    }

    console.log('✏️ Update data:', updateData);

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ Profile updated:', user.email);
    console.log('====================================\n');

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        height: user.height,
        weight: user.weight,
        fitnessGoal: user.fitnessGoal,
        profilePicture: user.profilePicture || '',
      },
    });
  } catch (error) {
    console.log('\n❌ ========== UPDATE PROFILE ERROR ==========');
    console.error('❌ Error:', error.message);
    console.log('========================================\n');
    res.status(500).json({ error: error.message });
  }
});

// ==================== UPLOAD AVATAR ====================
router.post('/upload-avatar', auth, upload.single('avatar'), async (req, res) => {
  console.log('\n📸 ========== UPLOAD AVATAR ==========');

  try {
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('✅ File uploaded to Cloudinary');
    console.log('📸 URL:', req.file.path);

    const user = await User.findByIdAndUpdate(
      req.userId,
      { profilePicture: req.file.path },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ Avatar saved for:', user.email);
    console.log('====================================\n');

    res.json({
      message: 'Avatar uploaded successfully',
      profilePicture: req.file.path,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        height: user.height,
        weight: user.weight,
        fitnessGoal: user.fitnessGoal,
        profilePicture: user.profilePicture || '',
      },
    });
  } catch (error) {
    console.log('\n❌ ========== UPLOAD ERROR ==========');
    console.error('❌ Error:', error.message);
    console.log('===================================\n');
    res.status(500).json({ error: error.message });
  }
});

// ==================== DELETE AVATAR ====================
router.delete('/avatar', auth, async (req, res) => {
  console.log('\n🗑️ ========== DELETE AVATAR ==========');

  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { profilePicture: '' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('✅ Avatar removed for:', user.email);
    console.log('====================================\n');

    res.json({
      message: 'Avatar removed',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        height: user.height,
        weight: user.weight,
        fitnessGoal: user.fitnessGoal,
        profilePicture: '',
      },
    });
  } catch (error) {
    console.log('\n❌ ========== DELETE AVATAR ERROR ==========');
    console.error('❌ Error:', error.message);
    console.log('=========================================\n');
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;