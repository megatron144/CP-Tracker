const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function dumpNextJSTree(handle) {
  const url = `https://www.geeksforgeeks.org/user/${handle}/`;
  const res = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    },
    timeout: 10000
  });

  const html = res.data;
  const $ = cheerio.load(html);

  let scriptText = '';
  $('script').each((_, el) => {
    const content = $(el).html() || '';
    if (content.includes('self.__next_f.push')) {
      scriptText += '\n' + content;
    }
  });

  fs.writeFileSync('scratch/gfg_raw_scripts.txt', scriptText);
  console.log('Saved raw scripts to scratch/gfg_raw_scripts.txt (length: ' + scriptText.length + ')');

  // Find all key:value pairs with numbers
  const numPairs = scriptText.match(/\\"[a-zA-Z0-9_-]+\\":\s*\d+/g) || [];
  console.log('Unique numeric key-values found in RSC scripts:');
  const uniqueKeys = [...new Set(numPairs)];
  console.log(uniqueKeys.slice(0, 50));
}

dumpNextJSTree('adityaraj_18');
