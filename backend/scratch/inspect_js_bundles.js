const axios = require('axios');
const cheerio = require('cheerio');

async function inspectAssets(handle) {
  const url = `https://www.geeksforgeeks.org/user/${handle}/`;
  const res = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  const html = res.data;
  const $ = cheerio.load(html);

  // Find all JS asset URLs
  const jsFiles = [];
  $('script[src]').each((_, el) => {
    const src = $(el).attr('src');
    if (src) jsFiles.push(src);
  });

  console.log(`Found ${jsFiles.length} JS script files.`);

  // Let's inspect each JS file for API endpoints or rating queries
  for (const jsUrl of jsFiles.slice(0, 15)) {
    try {
      const fullUrl = jsUrl.startsWith('http') ? jsUrl : `https://www.geeksforgeeks.org${jsUrl}`;
      const jsRes = await axios.get(fullUrl, { timeout: 5000 });
      const jsContent = jsRes.data;

      // Look for API endpoints in the JS
      const apiMatches = jsContent.match(/https?:\/\/[a-zA-Z0-9.-]+\/api\/[a-zA-Z0-9_/.-]+/g) || [];
      const ratingMatches = jsContent.match(/contest[_-]?rating|current[_-]?rating|user[_-]?rating/gi) || [];
      if (apiMatches.length > 0 || ratingMatches.length > 0) {
        console.log(`\nIn ${fullUrl}:`);
        if (apiMatches.length > 0) console.log('  APIs:', [...new Set(apiMatches)]);
        if (ratingMatches.length > 0) console.log('  Rating keywords:', [...new Set(ratingMatches)]);
      }
    } catch (e) {
      // ignore
    }
  }
}

inspectAssets('adityaraj_18');
