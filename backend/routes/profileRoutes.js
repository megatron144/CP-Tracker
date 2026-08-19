const express = require('express');
const crypto = require('crypto');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

const VALID_PLATFORMS = ['leetcode', 'codeforces', 'codechef', 'geeksforgeeks', 'github', 'atcoder', 'linkedin'];

// Helper to generate unique verification code (e.g., CPT-A8F19B)
const generateVerificationCode = () => {
  return `CPT-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
};

// @route   GET /api/profile
// @desc    Get current user profile with linked platforms
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      platforms: user.platforms || [],
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching profile', error: error.message });
  }
});

// @route   POST /api/profile/platforms
// @desc    Link a platform handle and generate verification code
// @access  Private
router.post('/platforms', protect, async (req, res) => {
  try {
    const { platform, handle } = req.body;

    if (!platform || !handle) {
      return res.status(400).json({ message: 'Platform and handle are required' });
    }

    const normalizedPlatform = platform.toLowerCase().trim();
    const normalizedHandle = handle.trim();

    if (!VALID_PLATFORMS.includes(normalizedPlatform)) {
      return res.status(400).json({ 
        message: `Invalid platform. Supported platforms: ${VALID_PLATFORMS.join(', ')}` 
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if platform is already linked
    const existingIndex = user.platforms.findIndex(p => p.platform === normalizedPlatform);
    const verificationCode = generateVerificationCode();

    if (existingIndex > -1) {
      // If updating handle or regenerating code
      user.platforms[existingIndex].handle = normalizedHandle;
      user.platforms[existingIndex].verificationCode = verificationCode;
      user.platforms[existingIndex].status = 'pending';
      user.platforms[existingIndex].verifiedAt = null;
    } else {
      // Add new platform
      user.platforms.push({
        platform: normalizedPlatform,
        handle: normalizedHandle,
        status: 'pending',
        verificationCode,
        verifiedAt: null
      });
    }

    await user.save();

    res.status(200).json({
      message: `Platform ${normalizedPlatform} linked successfully`,
      platforms: user.platforms
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error linking platform', error: error.message });
  }
});

// @route   DELETE /api/profile/platforms/:platform
// @desc    Unlink a platform
// @access  Private
router.delete('/platforms/:platform', protect, async (req, res) => {
  try {
    const platformToDelete = req.params.platform.toLowerCase().trim();

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const initialLength = user.platforms.length;
    user.platforms = user.platforms.filter(p => p.platform !== platformToDelete);

    if (user.platforms.length === initialLength) {
      return res.status(404).json({ message: 'Platform not found on this profile' });
    }

    await user.save();

    res.json({
      message: `Platform ${platformToDelete} removed`,
      platforms: user.platforms
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error removing platform', error: error.message });
  }
});

module.exports = router;
