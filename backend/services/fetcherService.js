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
        rating
        ranking
        contest {
          title
          startTime
        }
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

    // Compute Top 3 contest ranks achieved with Contest Name and Date
    let topRanks = [];
    const history = (data.userContestRankingHistory || []).filter(h => h.attended && h.ranking > 0);
    if (history.length > 0) {
      const sortedHistory = [...history].sort((a, b) => a.ranking - b.ranking);
      topRanks = sortedHistory.slice(0, 3).map(h => ({
        rank: h.ranking,
        contestName: h.contest?.title || 'LeetCode Weekly Contest',
        date: h.contest?.startTime ? new Date(h.contest.startTime * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null
      }));
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
        topRanks
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
        topRanks = sorted.slice(0, 3).map(c => ({
          rank: c.rank,
          contestName: c.contestName || `Codeforces Round #${c.contestId}`,
          date: c.ratingUpdateTimeSeconds ? new Date(c.ratingUpdateTimeSeconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null
        }));
      }
    } catch {
      // Ignore
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
        topRanks
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
          const sorted = [...ratingHistory]
            .filter(c => {
              const r = parseInt(c.rank || c.global_rank, 10);
              return !isNaN(r) && r > 0;
            })
            .sort((a, b) => parseInt(a.rank || a.global_rank, 10) - parseInt(b.rank || b.global_rank, 10));

          topRanks = sorted.slice(0, 3).map(c => ({
            rank: parseInt(c.rank || c.global_rank, 10),
            contestName: c.name || c.code || 'CodeChef Challenge',
            date: c.end_date ? new Date(c.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (c.getyear ? `${c.getmonth || ''} ${c.getyear}` : null)
          }));
        }
      }
    } catch {
      // Ignore
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
        topRanks
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
          const dateText = $hist(tr).find('td').eq(0).text().trim();
          const contestLink = $hist(tr).find('td').eq(1).find('a').text().trim() || $hist(tr).find('td').eq(1).text().trim();
          const rankText = $hist(tr).find('td').eq(2).text().trim();
          const r = parseInt(rankText, 10);
          if (!isNaN(r) && r > 0) {
            contestRanks.push({
              rank: r,
              contestName: contestLink || 'AtCoder Contest',
              date: dateText ? new Date(dateText).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null
            });
          }
        });
        if (contestRanks.length > 0) {
          contestRanks.sort((a, b) => a.rank - b.rank);
          topRanks = contestRanks.slice(0, 3);
        }
      }
    } catch {
      // Ignore
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
        topRanks
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
 * 6. GeeksforGeeks Fetcher (Accurate Next.js RSC Payload & Practice Scraper)
 */
const fetchGFGStats = async (handle) => {
  const cleanHandle = handle.trim();
  let totalSolved = 0;
  let codingScore = null;
  let rank = null;
  let longestStreak = 0;
  let contestsCount = 0;
  let contestRating = null;
  let maxContestRating = null;
  let topRanks = [];
  let stars = null;
  let difficultyBreakdown = { school: 0, basic: 0, easy: 0, medium: 0, hard: 0 };
  let allPayload = '';

  // 1. Fetch Official Contest Rating & Contest History API
  try {
    const ratingRes = await axios.get(`https://practiceapi.geeksforgeeks.org/api/v1/rating/${encodeURIComponent(cleanHandle)}/info/`, {
      headers: {
        'User-Agent': BROWSER_UA,
        'Accept': 'application/json, text/plain, */*'
      },
      timeout: DEFAULT_TIMEOUT
    });

    const ratingData = ratingRes.data;
    if (ratingData && typeof ratingData === 'object') {
      if (ratingData.user_stars && ratingData.user_stars !== '-') {
        stars = `${ratingData.user_stars} Star`;
      }
      if (ratingData.user_global_rank && ratingData.user_global_rank !== '-') {
        rank = ratingData.user_global_rank;
      }

      const contestInfo = ratingData.user_contest_data;
      if (contestInfo) {
        if (typeof contestInfo.current_rating === 'number' && !isNaN(contestInfo.current_rating) && contestInfo.current_rating > 0) {
          contestRating = contestInfo.current_rating;
        }
        if (typeof contestInfo.no_of_participated_contest === 'number') {
          contestsCount = contestInfo.no_of_participated_contest;
        }

        if (Array.isArray(contestInfo.contest_data) && contestInfo.contest_data.length > 0) {
          const ratings = contestInfo.contest_data
            .map(c => parseInt(c.rating || c.current_rating || c.user_rating, 10))
            .filter(r => !isNaN(r) && r > 0);
          if (ratings.length > 0) {
            maxContestRating = Math.max(...ratings);
            if (!contestRating) {
              contestRating = ratings[ratings.length - 1];
            }
          }

          const validRanks = contestInfo.contest_data
            .filter(c => {
              const rk = parseInt(c.rank || c.user_rank || c.global_rank, 10);
              return !isNaN(rk) && rk > 0;
            })
            .sort((a, b) => parseInt(a.rank || a.user_rank || a.global_rank, 10) - parseInt(b.rank || b.user_rank || b.global_rank, 10));

          topRanks = validRanks.slice(0, 3).map(c => ({
            rank: parseInt(c.rank || c.user_rank || c.global_rank, 10),
            contestName: c.contest_name || c.name || c.contest_slug || 'GFG Coding Contest',
            date: c.date || c.contest_date || null
          }));
        }
      }
    }
  } catch {
    // Non-fatal if rating API fails or returns non-200
  }

  // 2. Fetch Profile Pages & Practice RSC Streams
  const endpoints = [
    `https://www.geeksforgeeks.org/user/${encodeURIComponent(cleanHandle)}/`,
    `https://auth.geeksforgeeks.org/user/${encodeURIComponent(cleanHandle)}/practice/`
  ];

  for (const url of endpoints) {
    try {
      const res = await axios.get(url, {
        headers: {
          'User-Agent': BROWSER_UA,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: DEFAULT_TIMEOUT
      });

      if (res.status === 200 && res.data) {
        const html = res.data;
        const $ = cheerio.load(html);
        allPayload += '\n' + html;

        // Collect all script payloads (Next.js App Router RSC streams)
        $('script').each((_, el) => {
          const content = $(el).html() || '';
          allPayload += '\n' + content;
        });

        // 1. Authoritative Total Problems Solved extraction
        const totalSolvedPatterns = [
          /\\"total_problems_solved\\":\s*(\d+)/i,
          /"total_problems_solved":\s*(\d+)/i,
          /total_problems_solved\\":(\d+)/i,
          /\\"problems_solved\\":\s*(\d+)/i,
          /"problems_solved":\s*(\d+)/i,
          /problems_solved\\":(\d+)/i,
          /"totalSolved":\s*(\d+)/i,
          /totalSolved\\":(\d+)/i,
          /(\d+)\s+problems?\s+solved/i,
          /Problems?\s+Solved\s*[:\n\r\t]*(\d+)/i
        ];

        for (const pat of totalSolvedPatterns) {
          const m = allPayload.match(pat);
          if (m && parseInt(m[1], 10) > totalSolved) {
            totalSolved = parseInt(m[1], 10);
          }
        }

        // 2. Authoritative Coding Score extraction (Stored strictly as codingScore, NEVER rating)
        const scorePatterns = [
          /\\"score\\":\s*(\d+)/i,
          /"score":\s*(\d+)/i,
          /\\"coding_score\\":\s*(\d+)/i,
          /"coding_score":\s*(\d+)/i,
          /score\\":(\d+)/i,
          /Coding\s+Score\s*[:\n\r\t]*(\d+)/i
        ];

        for (const pat of scorePatterns) {
          const m = allPayload.match(pat);
          if (m && (codingScore === null || parseInt(m[1], 10) > codingScore)) {
            codingScore = parseInt(m[1], 10);
          }
        }

        // 3. Streak & Rank extraction
        const streakMatch = allPayload.match(/\\"pod_solved_longest_streak\\":\s*(\d+)/i) || 
                            allPayload.match(/\\"streak\\":\s*(\d+)/i);
        if (streakMatch) {
          longestStreak = parseInt(streakMatch[1], 10);
        }

        if (!rank) {
          const rankMatch = allPayload.match(/\\"global_rank\\":\s*\\"([^\\"]+)\\"/i) ||
                            allPayload.match(/\\"institute_rank\\":\s*(\d+)/i);
          if (rankMatch) {
            rank = rankMatch[1];
          }
        }

        // 4. Difficulty Breakdown extraction
        const schoolMatch = allPayload.match(/\\"school\\":\s*(\d+)/i) || allPayload.match(/School\s*\((\d+)\)/i);
        if (schoolMatch) difficultyBreakdown.school = parseInt(schoolMatch[1], 10);

        const basicMatch = allPayload.match(/\\"basic\\":\s*(\d+)/i) || allPayload.match(/Basic\s*\((\d+)\)/i);
        if (basicMatch) difficultyBreakdown.basic = parseInt(basicMatch[1], 10);

        const easyMatch = allPayload.match(/\\"easy\\":\s*(\d+)/i) || allPayload.match(/Easy\s*\((\d+)\)/i);
        if (easyMatch) difficultyBreakdown.easy = parseInt(easyMatch[1], 10);

        const medMatch = allPayload.match(/\\"medium\\":\s*(\d+)/i) || allPayload.match(/Medium\s*\((\d+)\)/i);
        if (medMatch) difficultyBreakdown.medium = parseInt(medMatch[1], 10);

        const hardMatch = allPayload.match(/\\"hard\\":\s*(\d+)/i) || allPayload.match(/Hard\s*\((\d+)\)/i);
        if (hardMatch) difficultyBreakdown.hard = parseInt(hardMatch[1], 10);

        const sumDifficulties = difficultyBreakdown.school + difficultyBreakdown.basic + difficultyBreakdown.easy + difficultyBreakdown.medium + difficultyBreakdown.hard;
        if (sumDifficulties > totalSolved) {
          totalSolved = sumDifficulties;
        }
      }
    } catch (err) {
      if (err.response?.status === 404 && url.includes('/user/')) {
        throw new Error(`GeeksforGeeks user "${cleanHandle}" does not exist.`);
      }
    }
  }

  console.log(`[GFGFetcher] Cleaned stats for @${cleanHandle}: totalSolved=${totalSolved}, contestRating=${contestRating}, codingScore=${codingScore}, longestStreak=${longestStreak}, rank=${rank}`);

  return createNormalizedStats({
    platform: 'gfg',
    totalSolved: totalSolved,
    rating: contestRating, // STRICTLY contest rating (or null if unrated), NEVER codingScore
    maxRating: maxContestRating || contestRating || null,
    rank: stars || (rank ? `#${rank}` : null),
    contestsGiven: contestsCount,
    extra: {
      codingScore: codingScore || 0, // Separately stored coding score
      longestStreak,
      difficultyBreakdown,
      topRanks
    }
  });
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
    case 'gfg':
      return await fetchGFGStats(handle);
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
  fetchGFGStats,
  fetchGitHubStats
};
