const axios = require('axios');
const cheerio = require('cheerio');

async function testGFGTabs(handle) {
  const tabs = [
    '',
    'practice/',
    'articles/',
    'courses/',
    'events/',
    'contests/',
    'badge/',
    'feed/'
  ];

  for (const t of tabs) {
    const url = `https://www.geeksforgeeks.org/user/${handle}/${t}`;
    try {
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 8000
      });
      console.log(`[${res.status}] ${url}`);
      const $ = cheerio.load(res.data);
      console.log('  Title:', $('title').text());
      const bodyText = $('body').text();
      // Look for 1810 or rating
      const matches = bodyText.match(/.{0,30}(?:1810|rating|contest).{0,30}/gi) || [];
      if (matches.length > 0) {
        console.log('  Matches:', matches.slice(0, 5));
      }
      // Check scripts
      $('script').each((i, el) => {
        const s = $(el).html() || '';
        if (s.includes('1810') || s.includes('contest_rating') || s.includes('contestRating') || s.includes('current_rating')) {
          console.log(`  Script match in tab ${t}:`, s.match(/.{0,50}(?:1810|contest_rating|contestRating|current_rating).{0,50}/g));
        }
      });
    } catch (e) {
      console.log(`Error on ${url}: ${e.message}`);
    }
  }
}

testGFGTabs('adityaraj_18');
