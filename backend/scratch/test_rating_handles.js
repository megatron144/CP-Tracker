const axios = require('axios');

async function testHandles() {
  const handles = ['adityaraj_18', 'adityaraj', 'shashwat', 'sandeepjain', 'tourist', 'aryan_mittal', 'striver_79'];
  for (const h of handles) {
    try {
      const url = `https://practiceapi.geeksforgeeks.org/api/v1/rating/${encodeURIComponent(h)}/info/`;
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 5000
      });
      console.log(`\n=== Handle: "${h}" ===`);
      console.log('Global rank:', res.data.user_global_rank);
      console.log('Stars:', res.data.user_stars);
      console.log('Contest data:', JSON.stringify(res.data.user_contest_data, null, 2));
    } catch (e) {
      console.log(`Error for ${h}:`, e.message);
    }
  }
}

testHandles();
