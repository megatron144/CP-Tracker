const axios = require('axios');
const cheerio = require('cheerio');

async function inspectAllBundles(handle) {
  const url = `https://www.geeksforgeeks.org/user/${handle}/`;
  const res = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  const $ = cheerio.load(res.data);
  const jsFiles = [];
  $('script[src]').each((_, el) => {
    const src = $(el).attr('src');
    if (src) jsFiles.push(src);
  });

  for (const jsUrl of jsFiles) {
    try {
      const fullUrl = jsUrl.startsWith('http') ? jsUrl : `https://www.geeksforgeeks.org${jsUrl}`;
      const jsRes = await axios.get(fullUrl, { timeout: 5000 });
      const jsContent = typeof jsRes.data === 'string' ? jsRes.data : '';

      // Find any string containing "rating" or "contest" or "score"
      const matches = jsContent.match(/["'`][^"'`]*(?:rating|contest|coding_score)[^"'`]*["'`]/gi) || [];
      const interesting = matches.filter(m => m.includes('/api/') || m.includes('rating') || m.includes('contest'));
      if (interesting.length > 0) {
        console.log(`\nIn ${fullUrl}:`);
        console.log('Matches:', [...new Set(interesting)].slice(0, 10));
      }
    } catch (e) {
      // ignore
    }
  }
}

inspectAllBundles('adityaraj_18');
