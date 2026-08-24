const axios = require('axios');
const cheerio = require('cheerio');

async function findEncodedHandleUsage() {
  const url = 'https://www.geeksforgeeks.org/user/adityaraj_18/';
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

      if (jsContent.includes('useLazyContestRatingsQuery') || jsContent.includes('contestRatings') || jsContent.includes('encodedHandle')) {
        console.log(`\nFound in ${fullUrl}:`);
        let pos = 0;
        while ((pos = jsContent.indexOf('contestRatings', pos)) !== -1) {
          console.log('Snippet:', jsContent.slice(Math.max(0, pos - 150), pos + 250));
          pos += 14;
        }
      }
    } catch (e) {
      // ignore
    }
  }
}

findEncodedHandleUsage();
