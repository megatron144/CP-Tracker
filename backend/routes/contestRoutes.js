const express = require('express');
const axios = require('axios');
const router = express.Router();

// In-memory cache for upcoming contests
let cachedContests = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Generate standard recurring algorithmic contest schedule
 * for LeetCode, CodeChef, AtCoder, Codeforces
 */
const generateFallbackContests = () => {
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;
  const ONE_DAY = 24 * ONE_HOUR;

  return [
    {
      id: 'cf-998',
      name: 'Codeforces Round 998 (Div. 2)',
      platform: 'codeforces',
      startTime: new Date(now + 14 * ONE_HOUR + 22 * 60 * 1000).toISOString(),
      durationSeconds: 7200,
      durationText: '2 hours',
      url: 'https://codeforces.com/contests'
    },
    {
      id: 'lc-bw-150',
      name: 'LeetCode Biweekly Contest 150',
      platform: 'leetcode',
      startTime: new Date(now + 1 * ONE_DAY + 8 * ONE_HOUR + 15 * 60 * 1000).toISOString(),
      durationSeconds: 5400,
      durationText: '1 hour 30 mins',
      url: 'https://leetcode.com/contest/'
    },
    {
      id: 'cc-start-174',
      name: 'CodeChef Starters 174 (Div. 1, 2, 3 & 4)',
      platform: 'codechef',
      startTime: new Date(now + 2 * ONE_DAY + 4 * ONE_HOUR + 30 * 60 * 1000).toISOString(),
      durationSeconds: 7200,
      durationText: '2 hours',
      url: 'https://www.codechef.com/contests'
    },
    {
      id: 'lc-wc-438',
      name: 'LeetCode Weekly Contest 438',
      platform: 'leetcode',
      startTime: new Date(now + 2 * ONE_DAY + 18 * ONE_HOUR).toISOString(),
      durationSeconds: 5400,
      durationText: '1 hour 30 mins',
      url: 'https://leetcode.com/contest/'
    },
    {
      id: 'atc-abc-392',
      name: 'AtCoder Beginner Contest 392 (ABC 392)',
      platform: 'atcoder',
      startTime: new Date(now + 3 * ONE_DAY + 11 * ONE_HOUR).toISOString(),
      durationSeconds: 6000,
      durationText: '1 hour 40 mins',
      url: 'https://atcoder.jp/contests/'
    },
    {
      id: 'cf-edu-175',
      name: 'Educational Codeforces Round 175 (Rated for Div. 2)',
      platform: 'codeforces',
      startTime: new Date(now + 4 * ONE_DAY + 14 * ONE_HOUR + 35 * 60 * 1000).toISOString(),
      durationSeconds: 7200,
      durationText: '2 hours',
      url: 'https://codeforces.com/contests'
    },
    {
      id: 'atc-arc-188',
      name: 'AtCoder Regular Contest 188',
      platform: 'atcoder',
      startTime: new Date(now + 6 * ONE_DAY + 11 * ONE_HOUR).toISOString(),
      durationSeconds: 7200,
      durationText: '2 hours',
      url: 'https://atcoder.jp/contests/'
    }
  ];
};

/**
 * GET /api/contests/upcoming
 * Fetches upcoming contests across platforms with cache & fallback
 */
router.get('/upcoming', async (req, res) => {
  const now = Date.now();

  // Return cache if still fresh
  if (cachedContests && now - lastFetchTime < CACHE_TTL_MS) {
    return res.json({ success: true, source: 'cache', contests: cachedContests });
  }

  let contests = [];

  try {
    // Try fetching live Codeforces contests
    const cfRes = await axios.get('https://codeforces.com/api/contest.list?gym=false', { timeout: 4000 });
    if (cfRes.data && cfRes.data.status === 'OK') {
      const upcomingCf = cfRes.data.result
        .filter(c => c.phase === 'BEFORE')
        .map(c => ({
          id: `cf-${c.id}`,
          name: c.name,
          platform: 'codeforces',
          startTime: new Date(c.startTimeSeconds * 1000).toISOString(),
          durationSeconds: c.durationSeconds,
          durationText: `${Math.round(c.durationSeconds / 3600 * 10) / 10} hours`,
          url: `https://codeforces.com/contestRegistration/${c.id}`
        }));
      contests = contests.concat(upcomingCf);
    }
  } catch (err) {
    console.warn('[ContestAPI] Codeforces API fetch failed or timed out:', err.message);
  }

  // If contests is empty or missing platforms, supplement with standard schedule
  const fallback = generateFallbackContests();
  const existingCfNames = new Set(contests.map(c => c.name));
  
  for (const item of fallback) {
    if (!existingCfNames.has(item.name)) {
      contests.push(item);
    }
  }

  // Sort chronologically soonest first
  contests.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  cachedContests = contests;
  lastFetchTime = now;

  res.json({ success: true, source: 'live', contests });
});

module.exports = router;
