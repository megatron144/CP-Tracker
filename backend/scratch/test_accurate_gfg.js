const axios = require('axios');
const cheerio = require('cheerio');

const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function fetchGFGStatsAccurate(handle) {
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
      timeout: 8000
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
  } catch (e) {
    // Non-fatal if rating API fails
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
        timeout: 8000
      });

      if (res.status === 200 && res.data) {
        const html = res.data;
        const $ = cheerio.load(html);
        allPayload += '\n' + html;

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
          /"problems_solved":\s*(\d+)/i
        ];

        for (const pat of totalSolvedPatterns) {
          const m = allPayload.match(pat);
          if (m && parseInt(m[1], 10) > totalSolved) {
            totalSolved = parseInt(m[1], 10);
          }
        }

        // 2. Authoritative Coding Score extraction (Stored strictly as codingScore, NOT rating)
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

        // 3. Streak extraction
        const streakMatch = allPayload.match(/\\"pod_solved_longest_streak\\":\s*(\d+)/i) || 
                            allPayload.match(/\\"streak\\":\s*(\d+)/i);
        if (streakMatch) {
          longestStreak = parseInt(streakMatch[1], 10);
        }

        // 4. Institute / Global rank if not found yet
        if (!rank) {
          const rankMatch = allPayload.match(/\\"global_rank\\":\s*\\"([^\\"]+)\\"/i) ||
                            allPayload.match(/\\"institute_rank\\":\s*(\d+)/i);
          if (rankMatch) {
            rank = rankMatch[1];
          }
        }

        // 5. Difficulty Breakdown extraction
        const schoolMatch = allPayload.match(/\\"school\\":\s*(\d+)/i);
        if (schoolMatch) difficultyBreakdown.school = parseInt(schoolMatch[1], 10);

        const basicMatch = allPayload.match(/\\"basic\\":\s*(\d+)/i);
        if (basicMatch) difficultyBreakdown.basic = parseInt(basicMatch[1], 10);

        const easyMatch = allPayload.match(/\\"easy\\":\s*(\d+)/i);
        if (easyMatch) difficultyBreakdown.easy = parseInt(easyMatch[1], 10);

        const medMatch = allPayload.match(/\\"medium\\":\s*(\d+)/i);
        if (medMatch) difficultyBreakdown.medium = parseInt(medMatch[1], 10);

        const hardMatch = allPayload.match(/\\"hard\\":\s*(\d+)/i);
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

  return {
    platform: 'gfg',
    totalSolved: totalSolved,
    rating: contestRating, // STRICTLY contest rating (or null if unrated), NEVER codingScore
    maxRating: maxContestRating || contestRating,
    rank: stars || (rank ? `#${rank}` : null),
    contestsGiven: contestsCount,
    extra: {
      codingScore: codingScore || 0, // Separately stored coding score
      longestStreak,
      difficultyBreakdown,
      topRanks
    }
  };
}

async function run() {
  const result = await fetchGFGStatsAccurate('adityaraj_18');
  console.log('Result for adityaraj_18:', JSON.stringify(result, null, 2));
}

run();
