const User = require('../models/User');
const { fetchPlatformStats } = require('./fetcherService');

// Delay helper between requests to avoid rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Synchronize stats for a single user's verified platforms
 */
const syncUserPlatforms = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.platforms || user.platforms.length === 0) return null;

    let hasUpdates = false;

    for (let i = 0; i < user.platforms.length; i++) {
      const p = user.platforms[i];
      if (p.status === 'verified') {
        try {
          const stats = await fetchPlatformStats(p.platform, p.handle);
          const prevSolved = Number(p.stats?.totalSolved) || 0;
          const newSolved = Number(stats.totalSolved) || 0;

          // Sanity Safeguard: Alert and protect if solved count drops unexpectedly (>30% drop when prev > 10)
          if (prevSolved > 10 && newSolved < prevSolved * 0.7) {
            console.warn(`⚠️ [AutoSync Safeguard] Anomaly for @${p.handle} on ${p.platform}: incoming totalSolved (${newSolved}) dropped from verified total (${prevSolved}). Retaining higher verified count.`);
            user.platforms[i].stats = {
              ...stats,
              totalSolved: prevSolved,
              extra: {
                ...stats.extra,
                safeguardTriggered: true,
                previousSolved: prevSolved,
                attemptedSolved: newSolved
              }
            };
          } else {
            user.platforms[i].stats = stats;
          }

          hasUpdates = true;
          await delay(500); // 500ms delay between fetches
        } catch (err) {
          console.warn(`[AutoSync] Failed to sync ${p.platform} for ${p.handle}: ${err.message}`);
        }
      }
    }

    if (hasUpdates) {
      await user.save();
    }

    return user.platforms;
  } catch (error) {
    console.error(`[AutoSync] Error syncing user ${userId}:`, error.message);
    throw error;
  }
};

/**
 * Synchronize all verified platforms for all users across the system
 */
const syncAllVerifiedUsers = async () => {
  console.log('[AutoSync] Running scheduled platform statistics refresh...');
  try {
    const users = await User.find({ 'platforms.status': 'verified' });
    console.log(`[AutoSync] Found ${users.length} users with verified platforms.`);

    for (const user of users) {
      await syncUserPlatforms(user._id);
      await delay(1000); // 1s pause between users
    }

    console.log('[AutoSync] Platform stats refresh completed successfully.');
  } catch (error) {
    console.error('[AutoSync] Periodic refresh encountered an error:', error.message);
  }
};

/**
 * Start the background periodic refresh timer
 * @param {number} intervalMs - Interval in milliseconds (default: 6 hours)
 */
const startBackgroundSync = (intervalMs = 6 * 60 * 60 * 1000) => {
  console.log(`[AutoSync] Background platform sync service active (interval: ${Math.round(intervalMs / 3600000)}h).`);

  // Run initial sync after 30 seconds of server startup
  setTimeout(() => {
    syncAllVerifiedUsers();
  }, 30000);

  // Set recurring interval
  setInterval(() => {
    syncAllVerifiedUsers();
  }, intervalMs);
};

module.exports = {
  startBackgroundSync,
  syncUserPlatforms,
  syncAllVerifiedUsers
};
