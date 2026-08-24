const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { protect } = require('../middleware/authMiddleware');
const { syncLimiter } = require('../middleware/rateLimiter');
const User = require('../models/User');
const { verifyPlatform } = require('../services/verifierService');
const { fetchPlatformStats } = require('../services/fetcherService');

const router = express.Router();

const VALID_PLATFORMS = ['leetcode', 'codeforces', 'codechef', 'atcoder', 'gfg'];

// Helper to generate unique verification code (e.g., CPT-A8F19B)
const generateVerificationCode = () => {
  return `CPT-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
};

// @route   GET /api/profile/public/:identifier
// @desc    Get public read-only developer portfolio by username, email prefix, or ID (No auth required)
// @access  Public
router.get('/public/:identifier', async (req, res) => {
  try {
    const rawId = req.params.identifier.trim();
    let query = {};

    if (mongoose.Types.ObjectId.isValid(rawId)) {
      query = { _id: rawId };
    } else {
      // Match by exact email, case-insensitive name, or email prefix (e.g. adityaraj)
      const regex = new RegExp(`^${rawId}$`, 'i');
      const emailPrefixRegex = new RegExp(`^${rawId}@`, 'i');
      query = {
        $or: [
          { email: regex },
          { name: regex },
          { email: emailPrefixRegex }
        ]
      };
    }

    const user = await User.findOne(query).select('name email platforms createdAt');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Developer profile not found.' });
    }

    // Only expose verified platforms and public stats (strip verification codes)
    const verifiedPlatforms = (user.platforms || [])
      .filter(p => p.status === 'verified' && VALID_PLATFORMS.includes(p.platform))
      .map(p => ({
        platform: p.platform,
        handle: p.handle,
        status: p.status,
        verifiedAt: p.verifiedAt,
        stats: p.stats || {}
      }));

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.email.split('@')[0],
        createdAt: user.createdAt,
        verifiedPlatforms
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error loading public profile', error: error.message });
  }
});

// @route   GET /api/profile
// @desc    Get current user profile with linked platforms
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Automatically prune any unsupported platforms (e.g. linkedin or gfg)
    const initialLen = user.platforms.length;
    user.platforms = (user.platforms || []).filter(p => VALID_PLATFORMS.includes(p.platform));
    if (user.platforms.length !== initialLen) {
      await user.save();
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

// @route   PUT /api/profile/name
// @desc    Update user display name (independent of platform handles)
// @access  Private
router.put('/name', protect, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ success: false, message: 'Display name is required' });
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 30) {
      return res.status(400).json({ 
        success: false, 
        message: 'Display name must be between 2 and 30 characters' 
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = trimmedName;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Display name updated to "${trimmedName}"`,
      name: user.name,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        platforms: user.platforms || []
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating display name', error: error.message });
  }
});

// Helper to sanitize handles when users paste full URLs
const sanitizeHandle = (platform, rawHandle) => {
  if (!rawHandle) return '';
  let h = rawHandle.trim();
  h = h.replace(/^https?:\/\/(www\.)?leetcode\.com\/(u\/)?/i, '')
       .replace(/^https?:\/\/(www\.)?codeforces\.com\/profile\//i, '')
       .replace(/^https?:\/\/(www\.)?codechef\.com\/users\//i, '')
       .replace(/^https?:\/\/(www\.)?atcoder\.jp\/users\//i, '')
       .replace(/^https?:\/\/(auth\.)?geeksforgeeks\.org\/(user\/)?/i, '')
       .replace(/^https?:\/\/(www\.)?geeksforgeeks\.org\/(user\/)?/i, '')
       .replace(/^https?:\/\/(www\.)?github\.com\//i, '');
  return h.replace(/^@+/, '').replace(/\/+$/, '');
};

// @route   POST /api/profile/platforms
// @desc    Link a platform handle with adaptive method (submission, bio, oauth, self_report)
// @access  Private
router.post('/platforms', protect, async (req, res) => {
  try {
    const { platform, handle, isUnverified, verificationMethod = 'bio' } = req.body;

    if (!platform || !handle) {
      return res.status(400).json({ message: 'Platform and handle are required' });
    }

    const normalizedPlatform = platform.toLowerCase().trim();
    const normalizedHandle = sanitizeHandle(normalizedPlatform, handle);

    if (!VALID_PLATFORMS.includes(normalizedPlatform)) {
      return res.status(400).json({ 
        message: `Invalid platform. Supported platforms: ${VALID_PLATFORMS.join(', ')}` 
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Determine initial status based on method / unverified flag
    let targetStatus = 'pending';
    let targetMethod = verificationMethod;

    if (isUnverified || verificationMethod === 'self_report') {
      targetStatus = 'unverified';
      targetMethod = 'self_report';
    } else if (verificationMethod === 'oauth') {
      targetStatus = 'verified';
    }

    const existingIndex = user.platforms.findIndex(p => p.platform === normalizedPlatform);
    const verificationCode = generateVerificationCode();

    let stats = {};
    // If self-report or OAuth, immediately fetch stats
    if (targetStatus === 'unverified' || targetStatus === 'verified') {
      try {
        stats = await fetchPlatformStats(normalizedPlatform, normalizedHandle);
      } catch (e) {
        console.warn(`[Link] Initial stats fetch warning for ${normalizedPlatform}:`, e.message);
      }
    }

    if (existingIndex > -1) {
      user.platforms[existingIndex].handle = normalizedHandle;
      user.platforms[existingIndex].verificationCode = verificationCode;
      user.platforms[existingIndex].status = targetStatus;
      user.platforms[existingIndex].verificationMethod = targetMethod;
      user.platforms[existingIndex].verifiedAt = targetStatus === 'verified' ? new Date() : null;
      user.platforms[existingIndex].stats = stats;
    } else {
      user.platforms.push({
        platform: normalizedPlatform,
        handle: normalizedHandle,
        status: targetStatus,
        verificationMethod: targetMethod,
        verificationCode,
        verifiedAt: targetStatus === 'verified' ? new Date() : null,
        stats
      });
    }

    await user.save();

    res.status(200).json({
      message: `Platform ${normalizedPlatform} (${targetStatus}) linked successfully`,
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

// @route   POST /api/profile/verify/:platform
// @desc    Verify platform ownership by checking bio for verificationCode
// @access  Private
router.post('/verify/:platform', protect, async (req, res) => {
  try {
    const platformToVerify = req.params.platform.toLowerCase().trim();

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const platformRecord = user.platforms.find(p => p.platform === platformToVerify);
    if (!platformRecord) {
      return res.status(404).json({ message: `Platform ${platformToVerify} is not linked yet` });
    }

    if (platformRecord.status === 'verified') {
      // If already verified, refresh stats if empty
      if (!platformRecord.stats || Object.keys(platformRecord.stats).length === 0) {
        try {
          const freshStats = await fetchPlatformStats(platformToVerify, platformRecord.handle);
          platformRecord.stats = freshStats;
          await user.save();
        } catch {}
      }

      return res.status(200).json({
        success: true,
        verified: true,
        message: `${platformToVerify} is already verified!`,
        platforms: user.platforms
      });
    }

    const { handle, verificationCode } = platformRecord;
    const requestedMethod = req.body?.method || platformRecord.verificationMethod || 'auto';
    const result = await verifyPlatform(platformToVerify, handle, verificationCode, requestedMethod);

    if (result.verified) {
      platformRecord.status = 'verified';
      platformRecord.verificationMethod = result.method || requestedMethod;
      platformRecord.verifiedAt = new Date();

      // Automatically fetch initial stats upon successful verification
      try {
        const stats = await fetchPlatformStats(platformToVerify, handle);
        platformRecord.stats = stats;
      } catch (fetchErr) {
        console.warn(`[Verify] Initial stats fetch failed for ${platformToVerify}:`, fetchErr.message);
      }

      await user.save();

      return res.status(200).json({
        success: true,
        method: result.method,
        message: `Successfully verified ownership of ${platformToVerify} (@${handle})!`,
        platforms: user.platforms
      });
    } else {
      return res.status(400).json({
        success: false,
        method: result.method,
        message: result.message || `Verification code "${verificationCode}" not found for @${handle}.`
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during verification'
    });
  }
});

// @route   POST /api/profile/sync/:platform
// @desc    Manually synchronize stats for a specific verified platform
// @access  Private
router.post('/sync/:platform', protect, syncLimiter, async (req, res) => {
  try {
    const platformToSync = req.params.platform.toLowerCase().trim();

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const platformRecord = user.platforms.find(p => p.platform === platformToSync);
    if (!platformRecord) {
      return res.status(404).json({ message: `Platform ${platformToSync} is not linked yet` });
    }

    if (platformRecord.status !== 'verified') {
      return res.status(400).json({ message: `Please verify ${platformToSync} ownership before syncing stats.` });
    }

    // Fetch fresh stats with sanity safeguard
    const freshStats = await fetchPlatformStats(platformToSync, platformRecord.handle);
    const prevSolved = Number(platformRecord.stats?.totalSolved) || 0;
    const newSolved = Number(freshStats.totalSolved) || 0;

    if (prevSolved > 10 && newSolved < prevSolved * 0.7) {
      console.warn(`⚠️ [ManualSync Safeguard] Anomaly for @${platformRecord.handle} on ${platformToSync}: incoming totalSolved (${newSolved}) dropped from verified total (${prevSolved}). Preserving higher verified count.`);
      platformRecord.stats = {
        ...freshStats,
        totalSolved: prevSolved,
        extra: {
          ...freshStats.extra,
          safeguardTriggered: true,
          previousSolved: prevSolved,
          attemptedSolved: newSolved
        }
      };
    } else {
      platformRecord.stats = freshStats;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `${platformToSync} stats refreshed successfully!`,
      platforms: user.platforms,
      stats: platformRecord.stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || `Failed to sync ${req.params.platform} stats`
    });
  }
});

// @route   POST /api/profile/sync-all
// @desc    Synchronize stats for all verified platforms
// @access  Private
router.post('/sync-all', protect, syncLimiter, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const verifiedPlatforms = user.platforms.filter(p => p.status === 'verified');
    if (verifiedPlatforms.length === 0) {
      return res.status(400).json({ message: 'No verified platforms found to synchronize.' });
    }

    const syncErrors = [];

    for (let i = 0; i < user.platforms.length; i++) {
      const p = user.platforms[i];
      if (p.status === 'verified') {
        try {
          const freshStats = await fetchPlatformStats(p.platform, p.handle);
          const prevSolved = Number(p.stats?.totalSolved) || 0;
          const newSolved = Number(freshStats.totalSolved) || 0;

          if (prevSolved > 10 && newSolved < prevSolved * 0.7) {
            console.warn(`⚠️ [SyncAll Safeguard] Anomaly for @${p.handle} on ${p.platform}: incoming totalSolved (${newSolved}) dropped from verified total (${prevSolved}). Preserving higher count.`);
            user.platforms[i].stats = {
              ...freshStats,
              totalSolved: prevSolved,
              extra: {
                ...freshStats.extra,
                safeguardTriggered: true,
                previousSolved: prevSolved,
                attemptedSolved: newSolved
              }
            };
          } else {
            user.platforms[i].stats = freshStats;
          }
        } catch (err) {
          syncErrors.push(`${p.platform}: ${err.message}`);
        }
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: syncErrors.length === 0 ? 'All platform statistics synchronized!' : `Synchronized with warnings: ${syncErrors.join(', ')}`,
      platforms: user.platforms
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during sync-all', error: error.message });
  }
});

// @route   PUT /api/profile/platforms/:platform/custom-stats
// @desc    Update customizable stats (e.g. LinkedIn posts count, max impressions)
// @access  Private
router.put('/platforms/:platform/custom-stats', protect, async (req, res) => {
  try {
    const platformKey = req.params.platform.toLowerCase().trim();
    const { postsCount, maxImpressions, connections } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const platformRecord = user.platforms.find(p => p.platform === platformKey);
    if (!platformRecord) {
      return res.status(404).json({ message: `Platform ${platformKey} is not linked` });
    }

    if (!platformRecord.stats) {
      platformRecord.stats = {};
    }
    if (!platformRecord.stats.extra) {
      platformRecord.stats.extra = {};
    }

    if (postsCount !== undefined) platformRecord.stats.extra.postsCount = String(postsCount);
    if (maxImpressions !== undefined) platformRecord.stats.extra.maxImpressions = String(maxImpressions);
    if (connections !== undefined) platformRecord.stats.extra.connections = String(connections);
    if (postsCount !== undefined && !isNaN(postsCount)) platformRecord.stats.totalSolved = parseInt(postsCount, 10);

    await user.save();

    res.status(200).json({
      success: true,
      message: `${platformKey} metrics updated successfully!`,
      platforms: user.platforms
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating custom stats', error: error.message });
  }
});

module.exports = router;
