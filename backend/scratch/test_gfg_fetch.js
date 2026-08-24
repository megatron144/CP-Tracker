const axios = require('axios');
const cheerio = require('cheerio');

async function testGFG(handle) {
  console.log(`\n--- Testing GFG handle: ${handle} ---`);
  
  // Try 1: GFG API endpoint if available (e.g. https://geeks-for-geeks-api.vercel.app or gfg practice endpoints)
  const apis = [
    `https://www.geeksforgeeks.org/user/${encodeURIComponent(handle)}/`,
    `https://auth.geeksforgeeks.org/user/${encodeURIComponent(handle)}/practice/`,
    `https://geeks-for-geeks-api.vercel.app/${encodeURIComponent(handle)}`,
    `https://gfg-api.vercel.app/${encodeURIComponent(handle)}`
  ];

  for (const url of apis) {
    try {
      console.log(`Fetching: ${url}`);
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/json,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 10000
      });
      console.log(`Status: ${res.status}`);
      if (typeof res.data === 'object') {
        console.log('JSON Data:', JSON.stringify(res.data, null, 2).slice(0, 500));
      } else {
        const $ = cheerio.load(res.data);
        console.log('Title:', $('title').text());
        // Look for numbers and problem count markers
        const text = $('body').text();
        const matches = text.match(/(\d+)\s*(problems?|solved|score|ranking)/gi) || [];
        console.log('Matches found in text:', matches.slice(0, 10));

        // Check for script tags with JSON / NEXT_DATA / __INITIAL_STATE__
        $('script').each((i, el) => {
          const scriptContent = $(el).html();
          if (scriptContent && (scriptContent.includes('total_problems_solved') || scriptContent.includes('user_profile') || scriptContent.includes('coding_score') || scriptContent.includes('problemsSolved') || scriptContent.includes('__NEXT_DATA__'))) {
            console.log(`Script ${i} snippet:`, scriptContent.slice(0, 300));
          }
        });
      }
    } catch (e) {
      console.log(`Error on ${url}: ${e.message}`);
    }
  }
}

async function run() {
  await testGFG('sandeepjain');
}

run();
