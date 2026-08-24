const axios = require('axios');

async function findBaseUrls() {
  const url = 'https://assets.geeksforgeeks.org/connect-prod/_next/static/chunks/7223-ee45b4cb368f3c2e.js';
  const res = await axios.get(url);
  const js = res.data;

  const idx = js.indexOf('GFG_PRACTICE_API_URL');
  if (idx !== -1) {
    console.log('GFG_PRACTICE_API_URL context:');
    console.log(js.slice(Math.max(0, idx - 200), idx + 200));
  }

  // Let's test the endpoint on candidate base URLs
  const candidateBases = [
    'https://practiceapi.geeksforgeeks.org/',
    'https://practice.geeksforgeeks.org/',
    'https://www.geeksforgeeks.org/',
    'https://api.geeksforgeeks.org/',
    'https://auth.geeksforgeeks.org/',
    'https://media.geeksforgeeks.org/'
  ];

  for (const base of candidateBases) {
    const ep = `${base}api/v1/rating/adityaraj_18/info/`;
    try {
      const resp = await axios.get(ep, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*'
        },
        timeout: 5000
      });
      console.log(`[FOUND ${resp.status}] ${ep}`);
      console.log('Data:', JSON.stringify(resp.data, null, 2));
    } catch (e) {
      console.log(`[FAIL ${e.response?.status || e.message}] ${ep}`);
    }
  }
}

findBaseUrls();
