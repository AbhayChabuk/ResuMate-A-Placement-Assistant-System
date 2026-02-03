const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/profile - fetch logged-in user profile
router.get('/', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('name email role profile');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ profile: user.profile, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Profile GET error:', err);
    return res.status(500).json({
      message: 'Profile fetch failed',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message,
    });
  }
});

// PUT /api/profile - update logged-in user profile
router.put('/', auth, async (req, res, next) => {
  try {
    const { college, branch, skills, experience } = req.body || {};

    const update = {
      profile: {
        college: college ?? undefined,
        branch: branch ?? undefined,
        skills: Array.isArray(skills) ? skills : skills == null ? undefined : [String(skills)],
        experience: experience ?? undefined,
      },
    };

    // Avoid overwriting nested object with undefined values
    Object.keys(update.profile).forEach((k) => update.profile[k] === undefined && delete update.profile[k]);

    const user = await User.findByIdAndUpdate(req.user.id, { $set: update }, { new: true, runValidators: true }).select(
      'name email role profile'
    );

    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ message: 'Profile updated successfully', profile: user.profile });
  } catch (err) {
    console.error('Profile PUT error:', err);
    return res.status(500).json({
      message: 'Profile update failed',
      error: process.env.NODE_ENV === 'production' ? undefined : err.message,
    });
  }
});

module.exports = router;

