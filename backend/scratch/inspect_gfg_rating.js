const axios = require('axios');
const cheerio = require('cheerio');

async function inspectGFGProfile(handle) {
  console.log(`\n=================== Inspecting GFG profile for "${handle}" ===================`);
  
  const endpoints = [
    `https://www.geeksforgeeks.org/user/${encodeURIComponent(handle)}/`,
    `https://auth.geeksforgeeks.org/user/${encodeURIComponent(handle)}/practice/`,
    `https://practiceapi.geeksforgeeks.org/api/v1/user/profile/${encodeURIComponent(handle)}/`,
    `https://practiceapi.geeksforgeeks.org/api/v1/user/contest/rating/${encodeURIComponent(handle)}/`,
    `https://practiceapi.geeksforgeeks.org/api/vr/user/profile/${encodeURIComponent(handle)}/`
  ];

  for (const url of endpoints) {
    try {
      console.log(`\n--- Fetching: ${url} ---`);
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/json,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 10000
      });

      console.log(`Status: ${res.status}`);
      if (typeof res.data === 'object') {
        console.log('JSON keys:', Object.keys(res.data));
        console.log('JSON data snippet:', JSON.stringify(res.data, null, 2).slice(0, 1000));
      } else {
        const html = res.data;
        const $ = cheerio.load(html);
        
        let allScriptData = '';
        $('script').each((_, el) => {
          allScriptData += '\n' + ($(el).html() || '');
        });

        // Search for 1810, rating, contest_rating, current_rating, etc.
        console.log('Matches for 1810 in scripts/html:');
        const match1810 = allScriptData.match(/.{0,50}1810.{0,50}/g) || html.match(/.{0,50}1810.{0,50}/g);
        console.log(match1810 ? match1810.slice(0, 10) : 'None found');

        console.log('Matches for "contest" or "rating" in scripts:');
        const ratingMatches = allScriptData.match(/.{0,30}(?:contest_rating|current_rating|user_rating|rating|contestRating|coding_score|score).{0,40}/gi);
        console.log(ratingMatches ? ratingMatches.slice(0, 20) : 'None');
      }
    } catch (e) {
      console.log(`Error on ${url}: ${e.message}`);
    }
  }
}

async function run() {
  await inspectGFGProfile('adityaraj_18');
}

run();
