const axios = require('axios');
const cheerio = require('cheerio');

async function testContestUrls(handle) {
  const candidates = [
    `https://www.geeksforgeeks.org/user/${handle}/contest/`,
    `https://www.geeksforgeeks.org/user/${handle}/contests/`,
    `https://auth.geeksforgeeks.org/user/${handle}/contest/`,
    `https://auth.geeksforgeeks.org/user/${handle}/contests/`,
    `https://practiceapi.geeksforgeeks.org/api/latest/user/${handle}/`,
    `https://practiceapi.geeksforgeeks.org/api/latest/user/contest/${handle}/`,
    `https://practiceapi.geeksforgeeks.org/api/latest/user/rating/${handle}/`,
    `https://practiceapi.geeksforgeeks.org/api/v1/users/${handle}/`,
    `https://practiceapi.geeksforgeeks.org/api/v1/problems-user/${handle}/`,
    `https://practiceapi.geeksforgeeks.org/api/v1/contest/rating/${handle}/`,
    `https://practiceapi.geeksforgeeks.org/api/v1/contest/user/${handle}/`,
    `https://www.geeksforgeeks.org/api/user/${handle}/`,
    `https://www.geeksforgeeks.org/api/user/contest/rating/${handle}/`,
    `https://www.geeksforgeeks.org/api/users/${handle}/`
  ];

  for (const url of candidates) {
    try {
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/json,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 6000
      });
      console.log(`[FOUND ${res.status}] ${url}`);
      const dataStr = typeof res.data === 'object' ? JSON.stringify(res.data) : res.data;
      if (dataStr.includes('1810') || dataStr.includes('rating') || dataStr.includes('contest')) {
        console.log(`  -> Match in payload:`, dataStr.slice(0, 300));
      }
    } catch (e) {
      // ignore 404
    }
  }
}

testContestUrls('adityaraj_18');
