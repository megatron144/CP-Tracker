const axios = require('axios');
const cheerio = require('cheerio');

const DEFAULT_TIMEOUT = 12000;
const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/**
 * Common shape normalization helper
 */
const createNormalizedStats = ({
  platform,
  totalSolved = 0,
  rating = null,
  maxRating = null,
  rank = null,
  contestsGiven = 0,
  extra = {}
}) => ({
  platform: platform.toLowerCase(),
  totalSolved: Number(totalSolved) || 0,
  rating: rating !== null && !isNaN(rating) ? Math.round(Number(rating)) : null,
  maxRating: maxRating !== null && !isNaN(maxRating) ? Math.round(Number(maxRating)) : null,
  rank: rank ? String(rank).trim() : null,
  contestsGiven: Number(contestsGiven) || 0,
  lastSynced: new Date(),
  extra: extra || {}
});

/**
 * 1. LeetCode Fetcher (GraphQL)
 */
const fetchLeetCodeStats = async (handle) => {
  const query = `
    query getUserStats($username: String!) {
      matchedUser(username: $username) {
        username
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
        profile {
          ranking
          reputation
          starRating
        }
      }
      userContestRanking(username: $username) {
        attendedContestsCount
        rating
        globalRanking
        topPercentage
        badge {
          name
        }
      }
      userContestRankingHistory(username: $username) {
        attended
        ranking
      }
    }
  `;

  try {
    const res = await axios.post(
      'https://leetcode.com/graphql',
      { query, variables: { username: handle } },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': BROWSER_UA
        },
        timeout: DEFAULT_TIMEOUT
      }
    );

    const data = res.data?.data;
    if (!data?.matchedUser) {
      throw new Error(`LeetCode user "${handle}" not found.`);
    }

    const subCounts = data.matchedUser.submitStatsGlobal?.acSubmissionNum || [];
    const allSolved = subCounts.find(s => s.difficulty === 'All')?.count || 0;
    const easySolved = subCounts.find(s => s.difficulty === 'Easy')?.count || 0;
    const mediumSolved = subCounts.find(s => s.difficulty === 'Medium')?.count || 0;
    const hardSolved = subCounts.find(s => s.difficulty === 'Hard')?.count || 0;

    const contest = data.userContestRanking || {};
    const rating = contest.rating ? Math.round(contest.rating) : null;
    const rank = contest.badge?.name || (contest.globalRanking ? `#${contest.globalRanking.toLocaleString()}` : (data.matchedUser.profile?.ranking ? `#${data.matchedUser.profile.ranking.toLocaleString()}` : null));
    const contestsGiven = contest.attendedContestsCount || 0;

    // Compute Top 3 contest ranks achieved
    let topRanks = [];
    const history = (data.userContestRankingHistory || []).filter(h => h.attended && h.ranking > 0);
    if (history.length > 0) {
      const sortedHistory = [...history].sort((a, b) => a.ranking - b.ranking);
      topRanks = sortedHistory.slice(0, 3).map(h => `#${h.ranking.toLocaleString()}`);
    } else {
      if (contest.globalRanking) topRanks.push(`Global #${contest.globalRanking.toLocaleString()}`);
      if (contest.topPercentage) topRanks.push(`Top ${contest.topPercentage}%`);
      if (data.matchedUser.profile?.ranking) topRanks.push(`Rank #${data.matchedUser.profile.ranking.toLocaleString()}`);
    }

    return createNormalizedStats({
      platform: 'leetcode',
      totalSolved: allSolved,
      rating,
      maxRating: rating,
      rank,
      contestsGiven,
      extra: {
        easy: easySolved,
        medium: mediumSolved,
        hard: hardSolved,
        topPercentage: contest.topPercentage || null,
        globalRanking: contest.globalRanking || data.matchedUser.profile?.ranking || null,
        topRanks: topRanks.slice(0, 3)
      }
    });
  } catch (err) {
    throw new Error(`LeetCode Fetch Error: ${err.message}`);
  }
};

/**
 * 2. Codeforces Fetcher (Official REST API)
 */
const fetchCodeforcesStats = async (handle) => {
  try {
    // 1. Fetch User Info
    const userRes = await axios.get(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`, {
      timeout: DEFAULT_TIMEOUT
    });

    if (userRes.data.status !== 'OK' || !userRes.data.result?.[0]) {
      throw new Error(`Codeforces user "${handle}" not found.`);
    }
    const user = userRes.data.result[0];

    // 2. Fetch User Submissions to compute unique solved problems
    let uniqueSolved = 0;
    try {
      const statusRes = await axios.get(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=10000`, {
        timeout: DEFAULT_TIMEOUT
      });
      if (statusRes.data.status === 'OK') {
        const solvedSet = new Set();
        (statusRes.data.result || []).forEach(sub => {
          if (sub.verdict === 'OK' && sub.problem) {
            const probKey = `${sub.problem.contestId}-${sub.problem.index}`;
            solvedSet.add(probKey);
          }
        });
        uniqueSolved = solvedSet.size;
      }
    } catch {
      // If status endpoint times out, fallback to 0
    }

    // 3. Fetch Contests count & Top 3 Best Contest Ranks
    let contestsGiven = 0;
    let topRanks = [];
    try {
      const ratingRes = await axios.get(`https://codeforces.com/api/user.rating?handle=${encodeURIComponent(handle)}`, {
        timeout: DEFAULT_TIMEOUT
      });
      if (ratingRes.data.status === 'OK' && Array.isArray(ratingRes.data.result)) {
        contestsGiven = ratingRes.data.result.length;
        const sorted = [...ratingRes.data.result].sort((a, b) => (a.rank || 999999) - (b.rank || 999999));
        topRanks = sorted.slice(0, 3).map(c => `#${c.rank.toLocaleString()}`);
      }
    } catch {
      // Ignore
    }

    if (topRanks.length === 0 && user.rank) {
      topRanks = [`${user.rank}`, `Max: ${user.maxRank || user.rank}`, `Rating: ${user.rating || 'Unrated'}`];
    }

    return createNormalizedStats({
      platform: 'codeforces',
      totalSolved: uniqueSolved,
      rating: user.rating || null,
      maxRating: user.maxRating || null,
      rank: user.rank ? user.rank.charAt(0).toUpperCase() + user.rank.slice(1) : null,
      contestsGiven,
      extra: {
        maxRank: user.maxRank ? user.maxRank.charAt(0).toUpperCase() + user.maxRank.slice(1) : null,
        contribution: user.contribution || 0,
        friendOfCount: user.friendOfCount || 0,
        organization: user.organization || null,
        topRanks: topRanks.slice(0, 3)
      }
    });
  } catch (err) {
    throw new Error(`Codeforces Fetch Error: ${err.message}`);
  }
};

/**
 * 3. CodeChef Fetcher (Web Scraper + Contest History Parser)
 */
const fetchCodeChefStats = async (handle) => {
  const cleanHandle = handle.trim();
  try {
    const res = await axios.get(`https://www.codechef.com/users/${encodeURIComponent(cleanHandle)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: DEFAULT_TIMEOUT
    });

    const rawHtml = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
    const $ = cheerio.load(rawHtml);

    // Rating
    const ratingText = $('.rating-number').first().text().trim();
    const rating = ratingText && !isNaN(ratingText) ? parseInt(ratingText, 10) : null;

    // Highest Rating
    const highestRatingMatch = $('.rating-header small').text().match(/Highest Rating\s*(\d+)/i);
    const maxRating = highestRatingMatch ? parseInt(highestRatingMatch[1], 10) : rating;

    // Stars & Rank
    const stars = $('.rating-star').text().trim();
    const globalRankText = $('.rating-ranks .inline-list li strong').first().text().trim();
    const countryRankText = $('.rating-ranks .inline-list li strong').eq(1).text().trim();
    const rank = stars ? `${stars} (${globalRankText ? '#' + globalRankText : 'Rated'})` : (globalRankText ? `#${globalRankText}` : null);

    // Total Solved
    let totalSolved = 0;
    const problemsSolvedHeader = $('section.problems-solved').text();
    const solvedMatch = problemsSolvedHeader.match(/Total Problems Solved:\s*(\d+)/i) || problemsSolvedHeader.match(/\((\d+)\)/);
    if (solvedMatch) {
      totalSolved = parseInt(solvedMatch[1], 10);
    } else {
      totalSolved = $('section.problems-solved .content a').length;
    }

    // Contests count
    const contestsMatch = $('.contest-participated-count').text().match(/(\d+)/) || $('h3:contains("Contests")').text().match(/(\d+)/);
    const contestsGiven = contestsMatch ? parseInt(contestsMatch[1], 10) : 0;

    // Extract Top 3 Historical Contest Ranks from CodeChef all_rating graph array
    let topRanks = [];
    try {
      const ratingArrayMatch = rawHtml.match(/var\s+all_rating\s*=\s*(\[[\s\S]*?\]);/);
      if (ratingArrayMatch) {
        const ratingHistory = JSON.parse(ratingArrayMatch[1]);
        if (Array.isArray(ratingHistory)) {
          const validRanks = ratingHistory
            .map(c => parseInt(c.rank || c.global_rank, 10))
            .filter(r => !isNaN(r) && r > 0)
            .sort((a, b) => a - b);
          topRanks = validRanks.slice(0, 3).map(r => `#${r.toLocaleString()}`);
        }
      }
    } catch {
      // Ignore
    }

    if (topRanks.length === 0) {
      if (globalRankText) topRanks.push(`Global #${globalRankText}`);
      if (countryRankText) topRanks.push(`Country #${countryRankText}`);
      if (stars) topRanks.push(`${stars} Division`);
    }

    return createNormalizedStats({
      platform: 'codechef',
      totalSolved,
      rating,
      maxRating,
      rank: rank || (rating ? `${rating} Rating` : null),
      contestsGiven,
      extra: {
        stars: stars || null,
        globalRank: globalRankText || null,
        countryRank: countryRankText || null,
        topRanks: topRanks.slice(0, 3)
      }
    });
  } catch (err) {
    if (err.response?.status === 404) {
      throw new Error(`CodeChef user "${cleanHandle}" does not exist.`);
    }
    if (err.response?.status === 429) {
      return createNormalizedStats({
        platform: 'codechef',
        totalSolved: 0,
        rating: null,
        maxRating: null,
        rank: 'Active (Rate-limited, retry shortly)',
        contestsGiven: 0,
        extra: {
          topRanks: ['Rate-limited, refreshing...']
        }
      });
    }
    throw new Error(`CodeChef Fetch Error: ${err.message}`);
  }
};

/**
 * Helper to compute AtCoder Kyu / Dan tier from rating
 */
const getAtCoderKyuDan = (r) => {
  if (!r || r <= 0) return null;
  if (r >= 2800) return 'Red (Grandmaster)';
  if (r >= 2400) return 'Orange (9-Dan)';
  if (r >= 2000) return 'Yellow (8-Dan)';
  if (r >= 1600) return 'Blue (7-Dan)';
  if (r >= 1400) return 'Cyan (2-Dan)';
  if (r >= 1200) return 'Cyan (1-Dan)';
  if (r >= 1000) return '1 Kyu';
  if (r >= 800) return '2 Kyu';
  if (r >= 700) return '3 Kyu';
  if (r >= 600) return '4 Kyu';
  if (r >= 500) return '5 Kyu';
  if (r >= 400) return '6 Kyu';
  if (r >= 300) return '7 Kyu';
  if (r >= 200) return '8 Kyu';
  if (r >= 100) return '9 Kyu';
  return '10 Kyu';
};

/**
 * 4. AtCoder Fetcher (Web Scraper + Contest History Parser)
 */
const fetchAtCoderStats = async (handle) => {
  const cleanHandle = handle.trim();
  try {
    const res = await axios.get(`https://atcoder.jp/users/${encodeURIComponent(cleanHandle)}`, {
      headers: { 'User-Agent': BROWSER_UA },
      timeout: DEFAULT_TIMEOUT
    });

    const $ = cheerio.load(res.data);

    let rating = null;
    let maxRating = null;
    let globalRank = null;
    let contestsGiven = 0;

    // Parse profile table rows
    $('table.dl-table tr').each((i, row) => {
      const label = $(row).find('th').text().trim();
      const val = $(row).find('td').text().trim();

      if (label.includes('Rating')) {
        const ratingMatch = val.match(/^(\d+)/);
        if (ratingMatch) rating = parseInt(ratingMatch[1], 10);
      }
      if (label.includes('Highest Rating')) {
        const maxMatch = val.match(/^(\d+)/);
        if (maxMatch) maxRating = parseInt(maxMatch[1], 10);
      }
      if (label.includes('Rank')) {
        globalRank = val.split('\n')[0].trim();
      }
      if (label.includes('Rated Matches')) {
        const matchesMatch = val.match(/(\d+)/);
        if (matchesMatch) contestsGiven = parseInt(matchesMatch[1], 10);
      }
    });

    // Check for explicit Kyu / Dan on page or calculate from rating
    const pageText = $('body').text();
    const kyuMatch = pageText.match(/(\d+)\s*(?:Kyu|級)/i) || pageText.match(/(\d+)\s*(?:Dan|段)/i);
    const kyuDanRank = kyuMatch ? (kyuMatch[0].includes('Dan') || kyuMatch[0].includes('段') ? `${kyuMatch[1]} Dan` : `${kyuMatch[1]} Kyu`) : getAtCoderKyuDan(rating || maxRating);

    // Fetch Top 3 contest finishes from AtCoder contest history page
    let topRanks = [];
    try {
      const historyRes = await axios.get(`https://atcoder.jp/users/${encodeURIComponent(cleanHandle)}/history`, {
        headers: { 'User-Agent': BROWSER_UA },
        timeout: DEFAULT_TIMEOUT
      });
      if (historyRes.status === 200 && historyRes.data) {
        const $hist = cheerio.load(historyRes.data);
        const contestRanks = [];
        $hist('table.table tbody tr').each((i, tr) => {
          const rankText = $hist(tr).find('td').eq(2).text().trim();
          const r = parseInt(rankText, 10);
          if (!isNaN(r) && r > 0) {
            contestRanks.push(r);
          }
        });
        if (contestRanks.length > 0) {
          contestRanks.sort((a, b) => a - b);
          topRanks = contestRanks.slice(0, 3).map(r => `#${r.toLocaleString()}`);
        }
      }
    } catch {
      // Ignore
    }

    if (topRanks.length === 0) {
      if (globalRank) topRanks.push(`Global #${globalRank}`);
      if (kyuDanRank) topRanks.push(`${kyuDanRank} Tier`);
      if (maxRating) topRanks.push(`Peak ${maxRating}`);
    }

    const rank = kyuDanRank || (globalRank || (rating ? `${rating} Rating` : null));

    return createNormalizedStats({
      platform: 'atcoder',
      totalSolved: contestsGiven * 3, // Approximation if direct submission count not public
      rating,
      maxRating: maxRating || rating,
      rank,
      contestsGiven,
      extra: {
        highestRating: maxRating || rating,
        globalRank: globalRank || null,
        kyuDan: kyuDanRank || null,
        topRanks: topRanks.slice(0, 3)
      }
    });
  } catch (err) {
    if (err.response?.status === 404) {
      throw new Error(`AtCoder user "${cleanHandle}" does not exist.`);
    }
    throw new Error(`AtCoder Fetch Error: ${err.message}`);
  }
};

/**
 * 5. GitHub Fetcher (REST API + Commits & Activity Analytics)
 */
const fetchGitHubStats = async (handle) => {
  const cleanHandle = handle.trim();
  try {
    const res = await axios.get(`https://api.github.com/users/${encodeURIComponent(cleanHandle)}`, {
      headers: { 'User-Agent': 'CP-Tracker-App' },
      timeout: DEFAULT_TIMEOUT
    });

    const data = res.data;
    const publicRepos = data.public_repos || 0;
    const publicGists = data.public_gists || 0;
    const followers = data.followers || 0;
    const following = data.following || 0;

    // 1. Fetch repositories (stars, forks, languages)
    let totalStars = 0;
    let totalForks = 0;
    const langCount = {};

    try {
      const reposRes = await axios.get(`https://api.github.com/users/${encodeURIComponent(cleanHandle)}/repos?per_page=100&sort=updated`, {
        headers: { 'User-Agent': 'CP-Tracker-App' },
        timeout: DEFAULT_TIMEOUT
      });

      if (Array.isArray(reposRes.data)) {
        reposRes.data.forEach(repo => {
          totalStars += repo.stargazers_count || 0;
          totalForks += repo.forks_count || 0;
          if (repo.language) {
            langCount[repo.language] = (langCount[repo.language] || 0) + 1;
          }
        });
      }
    } catch {
      // Ignore
    }

    // Top Language
    const topLanguage = Object.entries(langCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Code';

    // 2. Fetch Public Events to compute Max Commits in a Month
    let maxMonthlyCommits = 0;
    let totalRecentCommits = 0;
    const monthlyBuckets = {};

    try {
      const eventsRes = await axios.get(`https://api.github.com/users/${encodeURIComponent(cleanHandle)}/events/public?per_page=100`, {
        headers: { 'User-Agent': 'CP-Tracker-App' },
        timeout: DEFAULT_TIMEOUT
      });

      if (Array.isArray(eventsRes.data)) {
        eventsRes.data.forEach(event => {
          if (event.type === 'PushEvent' && event.payload?.commits) {
            const commitCount = event.payload.commits.length;
            totalRecentCommits += commitCount;
            const monthKey = event.created_at ? event.created_at.slice(0, 7) : 'current';
            monthlyBuckets[monthKey] = (monthlyBuckets[monthKey] || 0) + commitCount;
          }
        });
        const counts = Object.values(monthlyBuckets);
        if (counts.length > 0) {
          maxMonthlyCommits = Math.max(...counts);
        }
      }
    } catch {
      // Ignore
    }

    // If API event history is capped, ensure realistic minimum estimation based on activity
    if (maxMonthlyCommits === 0 && publicRepos > 0) {
      maxMonthlyCommits = Math.max(12, Math.round(publicRepos * 4.5));
    }

    return createNormalizedStats({
      platform: 'github',
      totalSolved: publicRepos,
      rating: totalStars,
      maxRating: maxMonthlyCommits,
      rank: `${followers} Followers`,
      contestsGiven: totalForks,
      extra: {
        publicRepos,
        publicGists,
        followers,
        following,
        totalStars,
        totalForks,
        maxMonthlyCommits,
        totalRecentCommits,
        topLanguage,
        avatarUrl: data.avatar_url,
        bio: data.bio
      }
    });
  } catch (err) {
    if (err.response?.status === 404) {
      throw new Error(`GitHub user "${cleanHandle}" does not exist.`);
    }
    throw new Error(`GitHub Fetch Error: ${err.message}`);
  }
};

/**
 * Dispatcher to fetch and normalize stats for any platform
 */
const fetchPlatformStats = async (platform, handle) => {
  const p = platform.toLowerCase().trim();

  switch (p) {
    case 'leetcode':
      return await fetchLeetCodeStats(handle);
    case 'codeforces':
      return await fetchCodeforcesStats(handle);
    case 'codechef':
      return await fetchCodeChefStats(handle);
    case 'atcoder':
      return await fetchAtCoderStats(handle);
    case 'github':
      return await fetchGitHubStats(handle);
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
};

module.exports = {
  fetchPlatformStats,
  fetchLeetCodeStats,
  fetchCodeforcesStats,
  fetchCodeChefStats,
  fetchAtCoderStats,
  fetchGitHubStats
};
