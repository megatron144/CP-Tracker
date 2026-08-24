const axios = require('axios');
const cheerio = require('cheerio');

async function analyzeGFGNextJS(handle) {
  const url = `https://www.geeksforgeeks.org/user/${encodeURIComponent(handle)}/`;
  console.log(`Fetching ${url}...`);

  const res = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    },
    timeout: 10000
  });

  const html = res.data;
  const $ = cheerio.load(html);

  // Search through all scripts for Next.js RSC data
  let allScriptData = '';
  $('script').each((i, el) => {
    const text = $(el).html() || '';
    if (text.includes('self.__next_f.push') || text.includes('total_problems_solved') || text.includes('problems_solved') || text.includes('coding_score') || text.includes('score')) {
      allScriptData += '\n' + text;
    }
  });

  console.log('Script data length:', allScriptData.length);

  // Regex patterns on Next.js serialized payload
  const solvedMatches = [
    allScriptData.match(/"total_problems_solved"[:\s]*(\d+)/i),
    allScriptData.match(/"problems_solved"[:\s]*(\d+)/i),
    allScriptData.match(/"totalSolved"[:\s]*(\d+)/i),
    allScriptData.match(/total_problems_solved\\":(\d+)/i),
    allScriptData.match(/problems_solved\\":(\d+)/i),
    allScriptData.match(/total_problems_solved\\":\\"(\d+)\\"/i),
    allScriptData.match(/total_problems_solved&quot;:(\d+)/i),
    allScriptData.match(/(\d+)\s+problems\s+solved/i)
  ];

  console.log('Solved matches:', solvedMatches.map(m => m ? m[0] : null));

  // Let's dump all occurrences of "score", "solved", "rank", "bio" in script data
  const regexes = [
    /total_problems_solved[^,}]{1,40}/gi,
    /coding_score[^,}]{1,40}/gi,
    /score[^,}]{1,30}/gi,
    /global_rank[^,}]{1,30}/gi,
    /monthly_score[^,}]{1,30}/gi,
    /streak[^,}]{1,30}/gi,
    /bio[^,}]{1,60}/gi,
    /easy[^,}]{1,30}/gi,
    /medium[^,}]{1,30}/gi,
    /hard[^,}]{1,30}/gi
  ];

  for (const reg of regexes) {
    const found = allScriptData.match(reg);
    console.log(`Regex ${reg}:`, found ? found.slice(0, 5) : 'None');
  }
}

analyzeGFGNextJS('sandeepjain');
