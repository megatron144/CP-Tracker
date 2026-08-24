const axios = require('axios');
const cheerio = require('cheerio');

async function testUser(handle) {
  const url = `https://www.geeksforgeeks.org/user/${encodeURIComponent(handle)}/`;
  console.log(`\n=== Testing handle: ${handle} (${url}) ===`);

  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      timeout: 10000
    });

    const html = res.data;
    const $ = cheerio.load(html);

    let allScriptData = '';
    $('script').each((i, el) => {
      const text = $(el).html() || '';
      allScriptData += '\n' + text;
    });

    // Patterns
    const totalSolvedPatterns = [
      /\\"total_problems_solved\\":\s*(\d+)/i,
      /"total_problems_solved":\s*(\d+)/i,
      /total_problems_solved\\":(\d+)/i,
      /"totalSolved":\s*(\d+)/i,
      /(\d+)\s+problems?\s+solved/i
    ];

    let totalSolved = 0;
    for (const pat of totalSolvedPatterns) {
      const match = allScriptData.match(pat) || html.match(pat);
      if (match) {
        totalSolved = parseInt(match[1], 10);
        console.log(`Found totalSolved (${totalSolved}) with pattern: ${pat}`);
        break;
      }
    }

    // Score / coding score patterns
    const scorePatterns = [
      /\\"score\\":\s*(\d+)/i,
      /"score":\s*(\d+)/i,
      /\\"coding_score\\":\s*(\d+)/i,
      /"coding_score":\s*(\d+)/i,
      /score\\":(\d+)/i
    ];

    let score = null;
    for (const pat of scorePatterns) {
      const match = allScriptData.match(pat) || html.match(pat);
      if (match) {
        score = parseInt(match[1], 10);
        console.log(`Found score (${score}) with pattern: ${pat}`);
        break;
      }
    }

    // Streak / rank / bio
    const streakMatch = allScriptData.match(/\\"pod_solved_longest_streak\\":\s*(\d+)/i) || allScriptData.match(/\\"streak\\":\s*(\d+)/i);
    const bioMatch = allScriptData.match(/\\"bio\\":\s*\\"([^\\"]+)\\"/i) || allScriptData.match(/"bio":\s*"([^"]+)"/i);

    console.log('Result summary:', {
      handle,
      totalSolved,
      score,
      streak: streakMatch ? streakMatch[1] : null,
      bioSnippet: bioMatch ? bioMatch[1].slice(0, 50) : 'none'
    });

  } catch (e) {
    console.log(`Error fetching ${handle}:`, e.message);
  }
}

async function run() {
  await testUser('sandeepjain');
  await testUser('adityaraj');
  await testUser('megatron144');
  await testUser('shashwat');
  await testUser('anmolraj');
}

run();
