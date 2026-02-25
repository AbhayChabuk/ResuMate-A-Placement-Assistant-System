const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const auth = require('../middleware/auth');

const signToken = (user) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return jwt.sign(
    { userId: user._id.toString(), email: user.email, role: user.role },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const hasProfile = (u) => {
  const p = u?.profile || {};
  return !!Object.keys(p).length;
};

const registerHandler = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ message: 'name, email, and password are required' });

    const existing = await User.findOne({ email: String(email).toLowerCase().trim() }).select('_id');
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({
      name: String(name).trim(),
      email: String(email).toLowerCase().trim(),
      password: String(password),
      role: role ? String(role).trim() : undefined,
    });

    const token = signToken(user);
    return res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, hasProfile: hasProfile(user) },
    });
  } catch (err) {
    console.error('Register error:', err);
    if (err?.code === 11000) {
      return res.status(400).json({ message: 'User already exists' });
    }
    return res.status(500).json({
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message,
    });
  }
};

// POST /api/auth/register (new)
router.post('/register', registerHandler);

// POST /api/auth/login (new, but same path as existing)
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'email and password are required' });

    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password name email role profile');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await user.comparePassword(String(password));
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    return res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, hasProfile: hasProfile(user) },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      message: 'Login failed',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message,
    });
  }
});

// POST /api/auth/signup (legacy alias -> register)
router.post('/signup', async (req, res, next) => {
  // Keep existing frontend request shape; ignore extra fields like dob/gender.
  return registerHandler(req, res, next);
});

// Legacy: /api/auth/profile (POST/GET) kept for compatibility
router.post('/profile', auth, async (req, res, next) => {
  try {
    // Save full profile object as sent from frontend
    const profile = req.body || {};
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profile },
      { new: true, runValidators: false }
    ).select('profile');
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({ message: 'Profile saved successfully', profile: user.profile });
  } catch (err) {
    console.error('Legacy profile save error:', err);
    return res.status(500).json({
      message: 'Profile save failed',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message,
    });
  }
});

router.get('/profile', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('profile');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ profile: user.profile });
  } catch (err) {
    console.error('Legacy profile fetch error:', err);
    return res.status(500).json({
      message: 'Profile fetch failed',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message,
    });
  }
});

module.exports = router;





