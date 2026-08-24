const axios = require('axios');
const cheerio = require('cheerio');

async function searchAllChunks() {
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

  // Also check _buildManifest.js
  for (const jsUrl of jsFiles) {
    if (jsUrl.includes('manifest') || jsUrl.includes('webpack') || jsUrl.includes('7223') || jsUrl.includes('page') || jsUrl.includes('layout')) {
      const fullUrl = jsUrl.startsWith('http') ? jsUrl : `https://www.geeksforgeeks.org${jsUrl}`;
      try {
        const resp = await axios.get(fullUrl);
        const code = resp.data;
        // Check for other chunk URLs listed in code
        const chunkMatches = code.match(/static\/chunks\/[a-zA-Z0-9_.-]+\.js/g) || [];
        for (const c of chunkMatches) {
          const cUrl = `https://assets.geeksforgeeks.org/connect-prod/_next/${c}`;
          if (!jsFiles.includes(cUrl)) jsFiles.push(cUrl);
        }
      } catch {}
    }
  }

  console.log(`Checking total of ${jsFiles.length} chunk URLs...`);

  for (const jsUrl of jsFiles) {
    try {
      const fullUrl = jsUrl.startsWith('http') ? jsUrl : `https://assets.geeksforgeeks.org/connect-prod/_next/${jsUrl}`;
      const jsRes = await axios.get(fullUrl, { timeout: 5000 });
      const jsContent = typeof jsRes.data === 'string' ? jsRes.data : '';

      if (jsContent.includes('current_rating') || jsContent.includes('user_contest_data') || jsContent.includes('user_stars') || jsContent.includes('star_colour_codes')) {
        console.log(`\nFound contest data handling in: ${fullUrl}`);
        const idx = jsContent.indexOf('current_rating') !== -1 ? jsContent.indexOf('current_rating') : jsContent.indexOf('user_contest_data');
        console.log('Context:', jsContent.slice(Math.max(0, idx - 150), idx + 350));
      }
    } catch {}
  }
}

searchAllChunks();
