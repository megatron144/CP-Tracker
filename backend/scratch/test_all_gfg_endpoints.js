const axios = require('axios');
const cheerio = require('cheerio');

async function testAllPossibleGFGUrls(handle) {
  const urls = [
    `https://practice.geeksforgeeks.org/user-profile.php?user=${handle}`,
    `https://auth.geeksforgeeks.org/user-profile.php?user=${handle}`,
    `https://practiceapi.geeksforgeeks.org/api/vr/user/${handle}/`,
    `https://practiceapi.geeksforgeeks.org/api/vr/problems-user/user_data/${handle}/`,
    `https://practiceapi.geeksforgeeks.org/api/v1/problems-user/user_data/${handle}/`,
    `https://practiceapi.geeksforgeeks.org/api/v1/user/problems/user_data/${handle}/`,
    `https://www.geeksforgeeks.org/user/${handle}/?tab=contest`,
    `https://www.geeksforgeeks.org/user/${handle}/?tab=practice`,
    `https://practiceapi.geeksforgeeks.org/api/v1/contest/rating/${handle}/`,
    `https://practiceapi.geeksforgeeks.org/api/v1/contest/user_rating/${handle}/`,
    `https://practiceapi.geeksforgeeks.org/api/v1/contest/user/${handle}/`,
    `https://practiceapi.geeksforgeeks.org/api/vr/contest/user_rating/${handle}/`,
    `https://practiceapi.geeksforgeeks.org/api/vr/contest/rating/${handle}/`,
    `https://practiceapi.geeksforgeeks.org/api/v1/contest/user-rating/${handle}/`,
    `https://practiceapi.geeksforgeeks.org/api/vr/contest/user-rating/${handle}/`,
    `https://www.geeksforgeeks.org/api/v1/user/${handle}/contest/rating/`,
    `https://www.geeksforgeeks.org/api/v1/user/${handle}/rating/`,
    `https://www.geeksforgeeks.org/api/v1/user/${handle}/`,
    `https://auth.geeksforgeeks.org/api/v1/user/${handle}/`,
    `https://practiceapi.geeksforgeeks.org/api/v1/user/ratings/${handle}/`,
    `https://practiceapi.geeksforgeeks.org/api/latest/user/ratings/${handle}/`
  ];

  for (const u of urls) {
    try {
      const res = await axios.get(u, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/json,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 6000
      });
      console.log(`[SUCCESS ${res.status}] ${u}`);
      const text = typeof res.data === 'object' ? JSON.stringify(res.data) : res.data;
      if (text.includes('1810') || text.includes('contest_rating') || text.includes('rating') || text.includes('2312')) {
        console.log(`  -> Content snippet:`, text.slice(0, 400));
      }
    } catch (e) {
      // 404
    }
  }
}

testAllPossibleGFGUrls('adityaraj_18');
